import { Router } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';

export const partnersRouter = Router();

const PartnerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  partnershipSince: z.union([z.string().datetime().optional(), z.date().optional()]).optional(),
  lastInteraction: z.union([z.string().datetime().optional(), z.date().optional()]).optional(),
  tags: z.array(z.string()).optional(),
  isHiring: z.boolean().optional(),
  tier: z.string().optional().nullable(),
});

const toData = (input: any) => {
  const parsed = PartnerSchema.parse(input);
  const toDate = (v: any) => (typeof v === 'string' ? new Date(v) : v);
  return {
    ...parsed,
    partnershipSince: parsed.partnershipSince ? toDate(parsed.partnershipSince) : undefined,
    lastInteraction: parsed.lastInteraction ? toDate(parsed.lastInteraction) : undefined,
  } as any;
};

partnersRouter.get('/', async (req, res) => {
  const { page = '1', limit = '100', q } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const take = Math.max(1, Math.min(200, parseInt(limit)));
  const skip = (pageNum - 1) * take;
  const where = q ? { name: { contains: q, mode: 'insensitive' } } : {};
  const [items, total] = await Promise.all([
    prisma.partner.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
    prisma.partner.count({ where }),
  ]);
  res.json({ data: items, success: true, message: 'OK', pagination: { page: pageNum, limit: take, total, totalPages: Math.ceil(total / take) } });
});

partnersRouter.get('/:id', async (req, res) => {
  const item = await prisma.partner.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ success: false, message: 'Not Found' });
  res.json({ data: item, success: true, message: 'OK' });
});

partnersRouter.post('/', async (req, res) => {
  try {
    const data = toData(req.body);
    if (!data.id) data.id = `partner-${Date.now()}`;
    const created = await prisma.partner.create({ data });
    res.status(201).json({ data: created, success: true, message: 'Created' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

partnersRouter.put('/:id', async (req, res) => {
  try {
    const data = toData({ ...req.body, id: req.params.id });
    const updated = await prisma.partner.update({ where: { id: req.params.id }, data });
    res.json({ data: updated, success: true, message: 'Updated' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

partnersRouter.patch('/:id', async (req, res) => {
  try {
    const updated = await prisma.partner.update({ where: { id: req.params.id }, data: req.body || {} });
    res.json({ data: updated, success: true, message: 'Patched' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

partnersRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.partner.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});
