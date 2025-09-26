// Test file to verify type exports
import type { Sponsor, Partner, Chapter } from './types';

// Test data for type validation - these are used for development and testing
const testSponsor: Sponsor = {
  id: '1',
  name: 'Test Sponsor',
  tier: 'gold',
  status: 'active',
  description: 'Test sponsor description',
  contactEmail: 'test@sponsor.com',
  eventsSponsored: 5,
  chaptersSponsored: 2,
  totalValue: 50000,
  partnershipSince: '2023',
  tags: ['Technology', 'Innovation'],
  createdAt: '2023-01-01T00:00:00.000Z',
};

const testPartner: Partner = {
  id: '1',
  name: 'Test Partner',
  type: 'hiring',
  status: 'active',
  description: 'Test partner description',
  contactEmail: 'test@partner.com',
  jobOpportunities: 10,
  alumniHired: 5,
  hireRate: 85,
  partnershipSince: '2023',
  tags: ['Jobs', 'Hiring'],
  createdAt: '2023-01-01T00:00:00.000Z',
};

const testChapter: Chapter = {
  id: '1',
  name: 'Test Chapter',
  location: 'Cape Town',
  province: 'Western Cape',
  status: 'active',
  performance: 'high',
  leadName: 'John Doe',
  leadEmail: 'john@example.com',
  memberCount: 50,
  membersCount: 50,
  engagementRate: 85,
  eventsThisMonth: 3,
  eventsCount: 3,
  meetingVenue: 'Community Center',
  meetingFrequency: 'Monthly',
  description: 'Test chapter description',
  focusAreas: ['Technology', 'Networking'],
  isSponsored: false,
  createdAt: '2023-01-01',
};

// Export for testing purposes
export { testSponsor, testPartner, testChapter };
