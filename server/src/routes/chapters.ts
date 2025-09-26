import { Router } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';

export const chaptersRouter = Router();

const ChapterSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  location: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  performance: z.string().optional().nullable(),
  leadName: z.string().optional().nullable(),
  leadEmail: z.string().optional().nullable(),
  leadPhone: z.string().optional().nullable(),
  memberCount: z.number().int().optional(),
  engagementRate: z.number().int().optional(),
  eventsThisMonth: z.number().int().optional(),
  meetingVenue: z.string().optional().nullable(),
  meetingFrequency: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  focusAreas: z.array(z.string()).optional(),
  sponsor: z.string().optional().nullable(),
  isSponsored: z.boolean().optional(),
});

const toData = (input: any) => ChapterSchema.parse(input);

// List with basic filtering & pagination
chaptersRouter.get('/', async (req, res) => {
  const query = req.query as Record<string, string>;
  const rawPage = query.page ?? (query as any)._page ?? '1';
  const rawLimit = query.limit ?? (query as any)._limit ?? '100';
  const q = query.q;
  const pageNum = Math.max(1, parseInt(String(rawPage)) || 1);
  const take = Math.max(1, Math.min(200, parseInt(String(rawLimit)) || 100));
  const skip = (pageNum - 1) * take;

  const where = q
    ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { location: { contains: q, mode: 'insensitive' } }] }
    : {};

  const [items, total] = await Promise.all([
    prisma.chapter.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
    prisma.chapter.count({ where }),
  ]);

  res.json({ data: items, success: true, message: 'OK', pagination: { page: pageNum, limit: take, total, totalPages: Math.ceil(total / take) } });
});

// Read one
chaptersRouter.get('/:id', async (req, res) => {
  const item = await prisma.chapter.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ success: false, message: 'Not Found' });
  res.json({ data: item, success: true, message: 'OK' });
});

// Create
chaptersRouter.post('/', async (req, res) => {
  try {
    const data = toData(req.body);
    if (!data.id) data.id = `chapter-${Date.now()}`;
    const created = await prisma.chapter.create({ data });
    res.status(201).json({ data: created, success: true, message: 'Created' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Update (PUT)
chaptersRouter.put('/:id', async (req, res) => {
  try {
    const data = toData({ ...req.body, id: req.params.id });
    const updated = await prisma.chapter.update({ where: { id: req.params.id }, data });
    res.json({ data: updated, success: true, message: 'Updated' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Patch (partial)
chaptersRouter.patch('/:id', async (req, res) => {
  try {
    const updated = await prisma.chapter.update({ where: { id: req.params.id }, data: req.body || {} });
    res.json({ data: updated, success: true, message: 'Patched' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Delete
chaptersRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.chapter.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});
