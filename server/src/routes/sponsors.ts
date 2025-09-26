import { Router } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';

export const sponsorsRouter = Router();

const SponsorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  logo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  tier: z.string().optional().nullable(),
});

const toData = (input: any) => SponsorSchema.parse(input);

sponsorsRouter.get('/', async (req, res) => {
  const { page = '1', limit = '100', q } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const take = Math.max(1, Math.min(200, parseInt(limit)));
  const skip = (pageNum - 1) * take;
  const where = q ? { name: { contains: q, mode: 'insensitive' } } : {};
  const [items, total] = await Promise.all([
    prisma.sponsor.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
    prisma.sponsor.count({ where }),
  ]);
  res.json({ data: items, success: true, message: 'OK', pagination: { page: pageNum, limit: take, total, totalPages: Math.ceil(total / take) } });
});

sponsorsRouter.get('/:id', async (req, res) => {
  const item = await prisma.sponsor.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ success: false, message: 'Not Found' });
  res.json({ data: item, success: true, message: 'OK' });
});

sponsorsRouter.post('/', async (req, res) => {
  try {
    const data = toData(req.body);
    if (!data.id) data.id = `sponsor-${Date.now()}`;
    const created = await prisma.sponsor.create({ data });
    res.status(201).json({ data: created, success: true, message: 'Created' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

sponsorsRouter.put('/:id', async (req, res) => {
  try {
    const data = toData({ ...req.body, id: req.params.id });
    const updated = await prisma.sponsor.update({ where: { id: req.params.id }, data });
    res.json({ data: updated, success: true, message: 'Updated' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

sponsorsRouter.patch('/:id', async (req, res) => {
  try {
    const updated = await prisma.sponsor.update({ where: { id: req.params.id }, data: req.body || {} });
    res.json({ data: updated, success: true, message: 'Patched' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

sponsorsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.sponsor.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});
