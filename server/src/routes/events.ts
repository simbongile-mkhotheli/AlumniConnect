import { Router } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';

export const eventsRouter = Router();

const EventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  organizer: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  startDate: z.union([z.string().datetime().optional(), z.date().optional()]).optional(),
  endDate: z.union([z.string().datetime().optional(), z.date().optional()]).optional(),
  sponsor: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  rsvpCount: z.number().int().nonnegative().optional(),
  attendanceCount: z.number().int().nonnegative().optional(),
});

const toEventData = (input: any) => {
  const parsed = EventSchema.parse(input);
  const toDate = (v: any) => (typeof v === 'string' ? new Date(v) : v);
  return {
    ...parsed,
    startDate: parsed.startDate ? toDate(parsed.startDate) : undefined,
    endDate: parsed.endDate ? toDate(parsed.endDate) : undefined,
  } as any;
};

// List with basic filtering & pagination
eventsRouter.get('/', async (req, res) => {
  // Accept both page/limit and legacy _page/_limit from older clients
  const query = req.query as Record<string, string>;
  const rawPage = query.page ?? (query as any)._page ?? '1';
  const rawLimit = query.limit ?? (query as any)._limit ?? '20';
  const q = query.q;

  const pageNum = Math.max(1, parseInt(String(rawPage)) || 1);
  const take = Math.max(1, Math.min(100, parseInt(String(rawLimit)) || 20));
  const skip = (pageNum - 1) * take;

  const where = q
    ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] }
    : {};

  const [items, total] = await Promise.all([
    prisma.event.findMany({ where, skip, take, orderBy: { updatedAt: 'desc' } }),
    prisma.event.count({ where }),
  ]);

  res.json({ data: items, success: true, message: 'OK', pagination: { page: pageNum, limit: take, total, totalPages: Math.ceil(total / take) } });
});

// Read one
eventsRouter.get('/:id', async (req, res) => {
  const item = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ success: false, message: 'Not Found' });
  res.json({ data: item, success: true, message: 'OK' });
});

// Create
eventsRouter.post('/', async (req, res) => {
  try {
    const data = toEventData(req.body);
    if (!data.id) data.id = `event-${Date.now()}`;
    const created = await prisma.event.create({ data });
    res.status(201).json({ data: created, success: true, message: 'Created' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Update (PUT)
eventsRouter.put('/:id', async (req, res) => {
  try {
    const data = toEventData({ ...req.body, id: req.params.id });
    const updated = await prisma.event.update({ where: { id: req.params.id }, data });
    res.json({ data: updated, success: true, message: 'Updated' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Patch (partial)
eventsRouter.patch('/:id', async (req, res) => {
  try {
    // partial validation: pick known fields and coerce dates if present
    const data = req.body || {};
    if (data.startDate && typeof data.startDate === 'string') data.startDate = new Date(data.startDate);
    if (data.endDate && typeof data.endDate === 'string') data.endDate = new Date(data.endDate);
    const updated = await prisma.event.update({ where: { id: req.params.id }, data });
    res.json({ data: updated, success: true, message: 'Patched' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Delete
eventsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
});
