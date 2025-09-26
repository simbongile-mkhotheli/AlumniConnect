import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  // Resolve seed data path with priority:
  // 1) SEED_FILE env var (absolute or relative to repo root)
  // 2) server/seeds/db.json (co-located with server)
  const candidates = [
    process.env.SEED_FILE,
    path.resolve(process.cwd(), '..', 'server', 'seeds', 'db.json'),
  ].filter(Boolean) as string[];

  let raw: string | null = null;
  let resolvedPath: string | null = null;
  for (const p of candidates) {
    try {
      const content = await fs.readFile(p, 'utf-8');
      raw = content;
      resolvedPath = p;
      console.log(`📦 Using seed data: ${p}`);
      break;
    } catch (_) {
      // Try next candidate
    }
  }

  if (!raw) {
    throw new Error(
      'Seed data file not found. Provide SEED_FILE or add server/seeds/db.json.'
    );
  }

  const data = JSON.parse(raw);

  const toDate = (v: any): Date | undefined => {
    if (!v) return undefined;
    const d = new Date(v);
    return isNaN(d.getTime()) ? undefined : d;
  };

  const pick = <T extends object>(obj: any, keys: (keyof T)[]): T => {
    const out: any = {};
    for (const k of keys as string[]) {
      if (obj[k] !== undefined) out[k] = obj[k];
    }
    return out as T;
  };

  // Chapters first
  if (Array.isArray(data.chapters)) {
    for (const ch of data.chapters) {
      const rec = {
        id: ch.id,
        name: ch.name,
        location: ch.location,
        province: ch.province,
        status: ch.status,
        performance: ch.performance,
        leadName: ch.leadName,
        leadEmail: ch.leadEmail,
        leadPhone: ch.leadPhone,
        memberCount: ch.memberCount,
        engagementRate: ch.engagementRate,
        eventsThisMonth: ch.eventsThisMonth,
        meetingVenue: ch.meetingVenue,
        meetingFrequency: ch.meetingFrequency,
        description: ch.description,
        focusAreas: ch.focusAreas,
        sponsor: ch.sponsor,
        isSponsored: ch.isSponsored,
      };
      await prisma.chapter.upsert({ where: { id: ch.id }, update: rec, create: rec });
    }
  }

  if (Array.isArray(data.users)) {
    for (const u of data.users) {
      const rec = {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: u.fullName,
        role: u.role,
        status: u.status,
        avatar: u.avatar,
        bio: u.bio,
        location: u.location,
        company: u.company,
        jobTitle: u.jobTitle,
        graduationYear: u.graduationYear,
        skills: u.skills,
        interests: u.interests,
        isVerified: u.isVerified,
        lastLoginAt: toDate(u.lastLoginAt),
        createdAt: toDate(u.createdAt),
        updatedAt: toDate(u.updatedAt),
        chapterId: u.chapterId,
      };
      await prisma.user.upsert({ where: { id: u.id }, update: rec, create: rec });
    }
  }

  if (Array.isArray(data.events)) {
    for (const e of data.events) {
      const rec = {
        id: e.id,
        title: e.title,
        slug: e.slug,
        excerpt: e.excerpt,
        description: e.description,
        organizer: e.organizer,
        location: e.location,
        venue: e.venue,
        address: e.address,
        startDate: toDate(e.startDate),
        endDate: toDate(e.endDate),
        sponsor: e.sponsor,
        status: e.status,
        isFeatured: e.isFeatured,
        tags: e.tags,
        rsvpCount: e.rsvpCount,
        attendanceCount: e.attendanceCount,
        createdAt: toDate(e.createdAt),
        updatedAt: toDate(e.updatedAt),
      };
      await prisma.event.upsert({ where: { id: e.id }, update: rec, create: rec });
    }
  }

  if (Array.isArray(data.sponsors)) {
    for (const s of data.sponsors) {
      const rec = {
        id: s.id,
        name: s.name,
        logo: s.logo,
        description: s.description,
        website: s.website,
        tier: s.tier,
        createdAt: toDate(s.createdAt),
      };
      await prisma.sponsor.upsert({ where: { id: s.id }, update: rec, create: rec });
    }
  }

  if (Array.isArray(data.partners)) {
    for (const p of data.partners) {
      const rec = {
        id: p.id,
        name: p.name,
        description: p.description,
        industry: p.industry,
        location: p.location,
        contactEmail: p.contactEmail,
        partnershipSince: toDate(p.partnershipSince),
        lastInteraction: toDate(p.lastInteraction),
        tags: p.tags,
        isHiring: p.isHiring,
        tier: p.tier,
        createdAt: toDate(p.createdAt),
      };
      await prisma.partner.upsert({ where: { id: p.id }, update: rec, create: rec });
    }
  }

  if (Array.isArray(data.opportunities)) {
    for (const o of data.opportunities) {
      const rec = {
        id: o.id,
        title: o.title,
        company: o.company,
        type: o.type,
        level: o.level,
        location: o.location,
        isRemote: o.isRemote,
        salary: o.salary,
        description: o.description,
        requirements: o.requirements,
        tags: o.tags,
        status: o.status,
        applicationCount: o.applicationCount,
        viewCount: o.viewCount,
        postedDate: toDate(o.postedDate),
        expiryDate: toDate(o.expiryDate),
        contactEmail: o.contactEmail,
        partnerId: o.partnerId,
        featured: o.featured,
        urgent: o.urgent,
        createdAt: toDate(o.createdAt),
        updatedAt: toDate(o.updatedAt),
      };
      await prisma.opportunity.upsert({ where: { id: o.id }, update: rec, create: rec });
    }
  }

  if (Array.isArray(data.mentorships)) {
    for (const m of data.mentorships) {
      const rec = {
        id: m.id,
        mentorName: m.mentorName,
        menteeName: m.menteeName,
        topic: m.topic,
        status: m.status,
        startDate: toDate(m.startDate),
        endDate: toDate(m.endDate),
        tags: m.tags,
        createdAt: toDate(m.createdAt),
        updatedAt: toDate(m.updatedAt),
      };
      await prisma.mentorship.upsert({ where: { id: m.id }, update: rec, create: rec });
    }
  }

  if (Array.isArray(data.qa)) {
    for (const q of data.qa) {
      const rec = {
        id: q.id,
        question: q.question || q.title || '',
        answer: q.answer,
        tags: q.tags,
        status: q.status,
        views: q.views,
        votes: q.votes,
        createdAt: toDate(q.createdAt),
        updatedAt: toDate(q.updatedAt),
      };
      if (!rec.question) continue;
      await prisma.qAItem.upsert({ where: { id: q.id }, update: rec, create: rec });
    }
  }

  if (Array.isArray(data.spotlights)) {
    for (const s of data.spotlights) {
      const rec = {
        id: s.id,
        title: s.title,
        content: s.content,
        type: s.type,
        status: s.status,
        featuredAlumniId: s.featuredAlumniId,
        featuredAlumniName: s.featuredAlumniName,
        tags: s.tags,
        viewCount: s.viewCount,
        likeCount: s.likeCount,
        shareCount: s.shareCount,
        createdAt: toDate(s.createdAt),
        updatedAt: toDate(s.updatedAt),
      };
      await prisma.spotlight.upsert({ where: { id: s.id }, update: rec, create: rec });
    }
  }

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
