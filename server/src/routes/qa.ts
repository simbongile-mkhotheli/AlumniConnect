import { Router } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';

export const qaRouter = Router();

const QASchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1),
  answer: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: z.string().optional().nullable(),
  views: z.number().int().nonnegative().optional(),
  votes: z.number().int().optional(),
});

const toData = (input: any) => QASchema.parse(input);

qaRouter.get('/', async (req, res) => {
  const { page = '1', limit = '20', q } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const take = Math.max(1, Math.min(100, parseInt(limit)));
  const skip = (pageNum - 1) * take;
  const where = q ? { question: { contains: q, mode: 'insensitive' } } : {};
  const [items, total] = await Promise.all([
    prisma.qAItem.findMany({ where, skip, take, orderBy: { updatedAt: 'desc' } }),
    prisma.qAItem.count({ where }),
  ]);
  res.json({ data: items, success: true, message: 'OK', pagination: { page: pageNum, limit: take, total, totalPages: Math.ceil(total / take) } });
});

qaRouter.get('/:id', async (req, res) => {
  const item = await prisma.qAItem.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ success: false, message: 'Not Found' });
  res.json({ data: item, success: true, message: 'OK' });
});

qaRouter.post('/', async (req, res) => {
  try {
    const data = toData(req.body);
    if (!data.id) data.id = `qa-${Date.now()}`;
    const created = await prisma.qAItem.create({ data });
    res.status(201).json({ data: created, success: true, message: 'Created' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

qaRouter.put('/:id', async (req, res) => {
  try {
    const data = toData({ ...req.body, id: req.params.id });
    const updated = await prisma.qAItem.update({ where: { id: req.params.id }, data });
    res.json({ data: updated, success: true, message: 'Updated' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

qaRouter.patch('/:id', async (req, res) => {
  try {
    const updated = await prisma.qAItem.update({ where: { id: req.params.id }, data: req.body || {} });
    res.json({ data: updated, success: true, message: 'Patched' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

qaRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.qAItem.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});
