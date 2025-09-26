import type { DbUser, Badge } from '../types';

export interface MappedUserProfile {
  id: string;
  name: string;
  email: string;
  role: DbUser['role'];
  status: DbUser['status'];
  isVerified: boolean;
  avatar: string | undefined;
  company?: string;
  jobTitle?: string;
  location?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  badges: Badge[];
  impactScore: number;
}

export const computeBadges = (user: DbUser): Badge[] => {
  const badges: Badge[] = [];
  if (user.isVerified) badges.push('Verified');
  if (user.role === 'mentor') badges.push('Mentor');
  if (user.role === 'admin') badges.push('Administrator');
  if ((user.skills?.length || 0) > 3) badges.push('Skilled Professional');
  if ((user.interests?.length || 0) > 2) badges.push('Engaged Member');
  return badges;
};

const calculateImpactScore = (user: DbUser) => {
  let score = 0;
  score += user.role === 'admin' ? 200 : 0;
  score += user.role === 'mentor' ? 150 : 0;
  score += user.role === 'alumni' ? 100 : 0;
  score += user.isVerified ? 100 : 0;
  score += user.status === 'active' ? 100 : 50;
  score += (user.skills?.length || 0) * 10;
  score += (user.interests?.length || 0) * 5;
  if (process.env.NODE_ENV !== 'test') {
    score += Math.floor(Math.random() * 300);
  }
  return score;
};

export const mapDbUserToProfile = (dbUser: DbUser): MappedUserProfile => ({
  id: dbUser.id,
  name: dbUser.fullName,
  email: dbUser.email,
  role: dbUser.role,
  status: dbUser.status,
  isVerified: dbUser.isVerified,
  avatar: dbUser.avatar,
  company: dbUser.company,
  jobTitle: dbUser.jobTitle,
  location: dbUser.location,
  bio: dbUser.bio,
  skills: [...(dbUser.skills || [])],
  interests: [...(dbUser.interests || [])],
  createdAt: dbUser.createdAt,
  updatedAt: dbUser.updatedAt,
  lastLoginAt: dbUser.lastLoginAt,
  badges: computeBadges(dbUser),
  impactScore: calculateImpactScore(dbUser),
});
