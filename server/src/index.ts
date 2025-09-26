import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './prisma';

// Node.js globals declarations
declare const process: any;
declare const console: any;
import { eventsRouter } from './routes/events';
import { chaptersRouter } from './routes/chapters';
import { sponsorsRouter } from './routes/sponsors';
import { partnersRouter } from './routes/partners';
import { opportunitiesRouter } from './routes/opportunities';
import { mentorshipsRouter } from './routes/mentorships';
import { qaRouter } from './routes/qa';
import { spotlightsRouter } from './routes/spotlights';

const app = express();
// shared prisma client

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'ok', timestamp: new Date().toISOString() }, success: true, message: 'OK' });
});

// CRUD routes
app.use('/api/events', eventsRouter);
app.use('/api/chapters', chaptersRouter);
app.use('/api/sponsors', sponsorsRouter);
app.use('/api/partners', partnersRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/mentorships', mentorshipsRouter);
app.use('/api/qa', qaRouter);
app.use('/api/spotlights', spotlightsRouter);

// Generic list endpoints (minimal to get started)
app.get('/api/users', async (_req, res) => {
  const items = await prisma.user.findMany();
  res.json({ data: items, success: true, message: 'OK' });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
