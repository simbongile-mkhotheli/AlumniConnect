import { Router } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';

export const mentorshipsRouter = Router();

const MentorshipSchema = z.object({
  id: z.string().optional(),
  mentorName: z.string().optional().nullable(),
  menteeName: z.string().optional().nullable(),
  topic: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  startDate: z.union([z.string().datetime().optional(), z.date().optional()]).optional(),
  endDate: z.union([z.string().datetime().optional(), z.date().optional()]).optional(),
  tags: z.array(z.string()).optional(),
});

const toData = (input: any) => {
  const parsed = MentorshipSchema.parse(input);
  const toDate = (v: any) => (typeof v === 'string' ? new Date(v) : v);
  return {
    ...parsed,
    startDate: parsed.startDate ? toDate(parsed.startDate) : undefined,
    endDate: parsed.endDate ? toDate(parsed.endDate) : undefined,
  } as any;
};

mentorshipsRouter.get('/', async (req, res) => {
  const { page = '1', limit = '20', q } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const take = Math.max(1, Math.min(100, parseInt(limit)));
  const skip = (pageNum - 1) * take;
  const where = q ? { topic: { contains: q, mode: 'insensitive' } } : {};
  const [items, total] = await Promise.all([
    prisma.mentorship.findMany({ where, skip, take, orderBy: { updatedAt: 'desc' } }),
    prisma.mentorship.count({ where }),
  ]);
  res.json({ data: items, success: true, message: 'OK', pagination: { page: pageNum, limit: take, total, totalPages: Math.ceil(total / take) } });
});

mentorshipsRouter.get('/:id', async (req, res) => {
  const item = await prisma.mentorship.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ success: false, message: 'Not Found' });
  res.json({ data: item, success: true, message: 'OK' });
});

mentorshipsRouter.post('/', async (req, res) => {
  try {
    const data = toData(req.body);
    if (!data.id) data.id = `mentorship-${Date.now()}`;
    const created = await prisma.mentorship.create({ data });
    res.status(201).json({ data: created, success: true, message: 'Created' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

mentorshipsRouter.put('/:id', async (req, res) => {
  try {
    const data = toData({ ...req.body, id: req.params.id });
    const updated = await prisma.mentorship.update({ where: { id: req.params.id }, data });
    res.json({ data: updated, success: true, message: 'Updated' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

mentorshipsRouter.patch('/:id', async (req, res) => {
  try {
    const updated = await prisma.mentorship.update({ where: { id: req.params.id }, data: req.body || {} });
    res.json({ data: updated, success: true, message: 'Patched' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

mentorshipsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.mentorship.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});
