import { Router } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';

export const opportunitiesRouter = Router();

const OpportunitySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  company: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  level: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  isRemote: z.boolean().optional(),
  salary: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  requirements: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.string().optional().nullable(),
  applicationCount: z.number().int().nonnegative().optional(),
  viewCount: z.number().int().nonnegative().optional(),
  postedDate: z.union([z.string().datetime().optional(), z.date().optional()]).optional(),
  expiryDate: z.union([z.string().datetime().optional(), z.date().optional()]).optional(),
  contactEmail: z.string().email().optional().nullable(),
  partnerId: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  urgent: z.boolean().optional(),
});

const toData = (input: any) => {
  const parsed = OpportunitySchema.parse(input);
  const toDate = (v: any) => (typeof v === 'string' ? new Date(v) : v);
  return {
    ...parsed,
    postedDate: parsed.postedDate ? toDate(parsed.postedDate) : undefined,
    expiryDate: parsed.expiryDate ? toDate(parsed.expiryDate) : undefined,
  } as any;
};

opportunitiesRouter.get('/', async (req, res) => {
  const { page = '1', limit = '20', q } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const take = Math.max(1, Math.min(100, parseInt(limit)));
  const skip = (pageNum - 1) * take;
  const where = q
    ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] }
    : {};
  const [items, total] = await Promise.all([
    prisma.opportunity.findMany({ where, skip, take, orderBy: { updatedAt: 'desc' } }),
    prisma.opportunity.count({ where }),
  ]);
  res.json({ data: items, success: true, message: 'OK', pagination: { page: pageNum, limit: take, total, totalPages: Math.ceil(total / take) } });
});

opportunitiesRouter.get('/:id', async (req, res) => {
  const item = await prisma.opportunity.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ success: false, message: 'Not Found' });
  res.json({ data: item, success: true, message: 'OK' });
});

opportunitiesRouter.post('/', async (req, res) => {
  try {
    const data = toData(req.body);
    if (!data.id) data.id = `opportunity-${Date.now()}`;
    const created = await prisma.opportunity.create({ data });
    res.status(201).json({ data: created, success: true, message: 'Created' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

opportunitiesRouter.put('/:id', async (req, res) => {
  try {
    const data = toData({ ...req.body, id: req.params.id });
    const updated = await prisma.opportunity.update({ where: { id: req.params.id }, data });
    res.json({ data: updated, success: true, message: 'Updated' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

opportunitiesRouter.patch('/:id', async (req, res) => {
  try {
    const updated = await prisma.opportunity.update({ where: { id: req.params.id }, data: req.body || {} });
    res.json({ data: updated, success: true, message: 'Patched' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

opportunitiesRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.opportunity.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});
