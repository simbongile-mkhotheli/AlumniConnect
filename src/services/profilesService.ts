import { MockDataLoader } from '../utils/mockDataLoader';
import type { DbUser, ProfileAnalytics, ProfileSettings } from '../types';
import { mapDbUserToProfile } from './profileMapping';
import { ApiService } from '@shared/services/apiService';
import { API_ENDPOINTS } from './endpoints';
import { resolveMockEnabled } from './useMockApi';

export class ProfilesService {
  // Normalize various backend/mock shapes into DbUser
  private static normalizeDbUser(raw: any): DbUser {
    if (!raw) return raw as DbUser;
    const id = raw.id || raw._id || raw.uuid || `user-${Math.random().toString(36).slice(2)}`;
    const firstName = raw.firstName || (raw.fullName ? String(raw.fullName).split(' ')[0] : raw.name?.split(' ')?.[0]) || '';
    const lastName = raw.lastName || (raw.fullName ? String(raw.fullName).split(' ').slice(1).join(' ') : raw.name?.split(' ')?.slice(1).join(' ')) || '';
    const fullName = raw.fullName || raw.name || `${firstName} ${lastName}`.trim();
    const email = raw.email || raw.contact?.email || `${id}@example.com`;
    const roleRaw = raw.role || (raw.isMentor ? 'mentor' : 'alumni');
    const role = String(roleRaw).toLowerCase() as any;
    let status: any = raw.status || (raw.isActive === false ? 'inactive' : 'active');
    status = String(status).toLowerCase();
    const createdAt = raw.createdAt || raw.joinDate || new Date().toISOString();
    const updatedAt = raw.updatedAt || createdAt;
    const lastLoginDate = raw.lastLoginDate || raw.lastLoginAt || raw.lastLogin || updatedAt;
    const isVerified = raw.isVerified ?? raw.verified ?? false;
    return {
      id,
      email,
      firstName,
      lastName,
      fullName,
      role,
      status,
      avatar: raw.avatar || raw.profileImage || raw.photoUrl || '',
      bio: raw.bio || '',
      location: raw.location || raw.city || raw.region || '',
      company: raw.company || raw.employer || '',
      jobTitle: raw.jobTitle || raw.title || '',
      graduationYear: Number(raw.graduationYear) || new Date(createdAt).getUTCFullYear(),
      skills: Array.isArray(raw.skills) ? raw.skills : [],
      interests: Array.isArray(raw.interests) ? raw.interests : [],
      achievements: Array.isArray(raw.achievements) ? raw.achievements : [],
      badges: Array.isArray(raw.badges) ? raw.badges : [],
      socialLinks: raw.socialLinks || {},
      joinDate: raw.joinDate || createdAt,
      lastLoginDate,
      isVerified,
      verificationDate: raw.verificationDate,
      privacy: raw.privacy || {
        showEmail: false,
        showPhone: false,
        showLocation: true,
        showSocialLinks: true,
      },
      mentorship: raw.mentorship || {
        isMentor: role === 'mentor',
        isMentee: false,
        expertiseAreas: [],
        mentorshipInterests: [],
        availabilityStatus: 'available',
      },
      chapterIds: Array.isArray(raw.chapterIds) ? raw.chapterIds : [],
      eventIds: Array.isArray(raw.eventIds) ? raw.eventIds : [],
      analytics: raw.analytics || {
        profileViews: 0,
        connectionsMade: 0,
        eventsAttended: 0,
        mentorshipSessions: 0,
      },
      moderation: raw.moderation,
      onboarding: raw.onboarding,
      notifications: raw.notifications,
      createdAt,
      updatedAt,
    } as DbUser;
  }
  private static isMockEnabled(): boolean {
    return resolveMockEnabled();
  }

  // Unified loader for raw DbUser[] depending on mode
  private static async fetchDbUsers(): Promise<DbUser[]> {
    if (this.isMockEnabled()) {
      const users = await MockDataLoader.getUsers();
      if (users && users.length > 0) return users.map(u => this.normalizeDbUser(u));
    } else {
      // Real backend path
      const res = await ApiService.getPaginated<DbUser>(API_ENDPOINTS.USERS.BASE, 1, 1000);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        return (res.data as any[]).map(u => this.normalizeDbUser(u));
      }
    }

    // Deterministic seed fallback (kept for resilience and tests)
    const now = Date.now();
    const seedUsers: DbUser[] = Array.from({ length: 5 }).map((_, i) => this.normalizeDbUser({
      id: `seed-user-${i + 1}`,
      fullName: `Seed User ${i + 1}`,
      email: `seed${i + 1}@example.com`,
      role: 'alumni',
      status: 'active',
      createdAt: new Date(now - i * 86400000).toISOString(),
      updatedAt: new Date(now - i * 43200000).toISOString(),
      location: 'Remote',
      company: 'Seed Co',
      jobTitle: 'Seed Profile',
      skills: ['TypeScript', 'React'],
      interests: ['Networking'],
      isVerified: i % 2 === 0,
    }));
    return seedUsers;
  }

  static async getAllProfiles() {
    const users = await this.fetchDbUsers();
    return users.map(mapDbUserToProfile);
  }

  static async getProfileById(id: string) {
    // Try direct real-backend lookup when not in mock mode
    if (!this.isMockEnabled()) {
      const res = await ApiService.get<DbUser>(`${API_ENDPOINTS.USERS.BASE}/${id}`);
      if (res.success && res.data) return mapDbUserToProfile(this.normalizeDbUser(res.data));
    }
    // Universal fallback: search in available list (mock or seeds or real list)
    const users = await this.fetchDbUsers();
    const user = users.find(u => u.id === id) || null;
    return user ? mapDbUserToProfile(user) : null;
  }

  /**
   * Phase 3: Deterministic mock analytics derivations.
   * NOTE: These are placeholders (no persistence) but stable for tests.
   */
  static async getAnalytics(userId: string): Promise<ProfileAnalytics | null> {
    const users = await this.fetchDbUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    // Deterministic seed derived from user id for repeatability in tests
    const seed = Array.from(userId).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const pseudo = (n: number) => {
      // simple linear congruential style deterministic value 0..1
      const x = Math.sin(seed + n) * 10000;
      return x - Math.floor(x);
    };

    // Mentorship stats (bounded numbers)
    const activeMentorships = Math.floor(pseudo(1) * 3); // 0-2
    const completedMentorships = Math.floor(pseudo(2) * 5); // 0-4
    const totalSessions = completedMentorships * 4 + Math.floor(pseudo(3) * 3);
    const upcomingSessions = Math.min(3, Math.floor(pseudo(4) * 4));
    const averageSessionCompletionRate = totalSessions === 0 ? 0 : (completedMentorships * 4) / totalSessions;

    // Achievements placeholder
    const achievementCategories = ['mentorship', 'community', 'learning'];
    const achievementsCount = achievementCategories.map((_, i) => Math.floor(pseudo(10 + i) * 3));
    const achievementsTotal = achievementsCount.reduce((a, b) => a + b, 0);
    const recent = achievementCategories.flatMap((cat, idx) => {
      if (achievementsCount[idx] <= 0) return [];
      const d = new Date(Date.now() - (idx + 1) * 86400000);
      // Normalize to noon UTC for deterministic millisecond values
      d.setUTCHours(12, 0, 0, 0);
      return [{
        id: `${userId}-ach-${idx}`,
        title: `${cat} milestone ${achievementsCount[idx]}`,
        dateEarned: d.toISOString(),
        category: cat,
      }];
    });
    const categoriesMap: Record<string, number> = {};
    achievementCategories.forEach((c, i) => (categoriesMap[c] = achievementsCount[i]));

    // Engagement stats
    const profileViews = 50 + Math.floor(pseudo(30) * 450); // 50-499
    const loginsLast30Days = Math.floor(pseudo(31) * 30);
    const lastActiveDaysAgo = Math.floor(pseudo(32) * 15);
    const contributionScore = Math.round(
      (activeMentorships * 40 + completedMentorships * 25 + achievementsTotal * 15 + loginsLast30Days * 2) * (0.7 + pseudo(40) * 0.3)
    );

    // Timeline (past 7 days) with sparse deterministic events
    const days = 7;
    const timeline = Array.from({ length: days }).map((_, i) => {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - (days - 1 - i));
      const iso = dayDate.toISOString().slice(0, 10);
      const events: any[] = [];
      if (pseudo(100 + i) > 0.7) events.push({ type: 'login', label: 'User login' });
      if (pseudo(200 + i) > 0.85 && activeMentorships > 0)
        events.push({ type: 'mentorship_session', label: 'Mentorship session', value: 1 });
      if (pseudo(300 + i) > 0.9 && achievementsTotal > 0)
        events.push({ type: 'achievement', label: 'Achievement earned' });
      return { date: iso, events } as any;
    });

    const analytics: any = {
      userId,
      generatedAt: new Date().toISOString(),
      mentorship: {
        activeMentorships,
        completedMentorships,
        totalSessions,
        upcomingSessions,
        averageSessionCompletionRate,
      },
      achievements: {
        total: achievementsTotal,
        recent,
        categories: categoriesMap,
      },
      engagement: {
        profileViews,
        loginsLast30Days,
        lastActiveDaysAgo,
        contributionScore,
      },
      timeline,
      meta: { deterministic: true, version: 1 },
    };

    return analytics as ProfileAnalytics;
  }

  // Phase 4: Settings persistence (localStorage bridge)
  private static settingsKey(userId: string) { return `profile-settings-v2:${userId}`; }

  private static defaultSettings(userId: string): ProfileSettings {
    return {
      userId,
      updatedAt: new Date().toISOString(),
      visibility: 'public' as any,
      showEmail: false as any,
      showEmployment: true as any,
      showMentorship: true as any,
      notifications: {
        emailMentorship: true as any,
        emailOpportunities: true as any,
        emailEvents: true as any,
        digestFrequency: 'weekly' as any,
      } as any,
      theme: 'system' as any,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      language: 'en' as any,
    } as any;
  }

  static async getSettings(userId: string): Promise<ProfileSettings> {
    const key = this.settingsKey(userId);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        const defaults = this.defaultSettings(userId);
        try { localStorage.setItem(key, JSON.stringify(defaults)); } catch {}
        return defaults;
      }
      const parsed = JSON.parse(raw);
      // Shallow merge with defaults to ensure new fields appear (legacy shape)
      return { ...this.defaultSettings(userId), ...parsed, userId } as any;
    } catch {
      return this.defaultSettings(userId);
    }
  }

  static async updateSettings(userId: string, partial: Partial<ProfileSettings>): Promise<ProfileSettings> {
    const existing = await this.getSettings(userId);
    const merged: ProfileSettings = {
      ...existing as any,
      ...partial as any,
      notifications: {
        ...(existing as any).notifications,
        ...(partial as any).notifications,
      } as any,
      updatedAt: new Date().toISOString() as any,
      userId,
    } as any;
    try { localStorage.setItem(this.settingsKey(userId), JSON.stringify(merged)); } catch {}
    return merged;
  }
}

export default ProfilesService;
