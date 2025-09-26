import { Router } from 'express';
import { prisma } from '../prisma';

export const spotlightsRouter = Router();

spotlightsRouter.get('/', async (req, res) => {
  const { page = '1', limit = '20', q } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const take = Math.max(1, Math.min(100, parseInt(limit)));
  const skip = (pageNum - 1) * take;
  const where = q ? { title: { contains: q, mode: 'insensitive' } } : {};
  const [items, total] = await Promise.all([
    prisma.spotlight.findMany({ where, skip, take, orderBy: { updatedAt: 'desc' } }),
    prisma.spotlight.count({ where }),
  ]);
  res.json({ data: items, success: true, message: 'OK', pagination: { page: pageNum, limit: take, total, totalPages: Math.ceil(total / take) } });
});

spotlightsRouter.get('/:id', async (req, res) => {
  const item = await prisma.spotlight.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ success: false, message: 'Not Found' });
  res.json({ data: item, success: true, message: 'OK' });
});
