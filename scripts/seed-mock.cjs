// scripts/seed-mock.cjs
// Enhanced seed script for comprehensive AlumniConnect data
// Run: node scripts/seed-mock.cjs

const fs = require('fs');
const path = require('path');

// Write generated seed data to the canonical server seeds path
// Legacy: previously wrote to mock-server/db.json (deprecated)
const outFile = path.join(__dirname, '..', 'server', 'seeds', 'db.json');

// Helper function to generate random dates
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Helper function to generate random IDs
function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateEvents() {
  const eventTypes = [
    'workshop',
    'networking',
    'webinar',
    'conference',
    'meetup',
  ];
  const statuses = ['draft', 'published', 'cancelled', 'completed'];
  const locations = [
    'Cape Town',
    'Johannesburg',
    'Durban',
    'Online',
    'Pretoria',
  ];

  return Array.from({ length: 15 }, (_, i) => ({
    id: `event-${i + 1}`,
    title: `Alumni Event ${i + 1}`,
    description: `Description for alumni event ${i + 1}. Join us for an exciting gathering.`,
    type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    isVirtual: Math.random() > 0.6,
    startDate: randomDate(
      new Date(),
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    ).toISOString(),
    endDate: randomDate(
      new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 91 * 24 * 60 * 60 * 1000)
    ).toISOString(),
    registrationDeadline: randomDate(
      new Date(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).toISOString(),
    maxAttendees: Math.floor(Math.random() * 200) + 50,
    currentAttendees: Math.floor(Math.random() * 150) + 10,
    price: Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 500) + 50,
    organizer: `Organizer ${i + 1}`,
    organizerEmail: `organizer${i + 1}@example.com`,
    tags: ['networking', 'career', 'tech'].slice(
      0,
      Math.floor(Math.random() * 3) + 1
    ),
    featured: Math.random() > 0.7,
    createdAt: randomDate(
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    updatedAt: randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
  }));
}

function generateSponsors() {
  const tiers = ['platinum', 'gold', 'silver', 'bronze'];
  const statuses = ['active', 'inactive', 'pending'];

  return Array.from({ length: 12 }, (_, i) => ({
    id: `sponsor-${i + 1}`,
    name: `Sponsor Company ${i + 1}`,
    tier: tiers[Math.floor(Math.random() * tiers.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    logo: `https://picsum.photos/200/100?random=${300 + i}`,
    website: `https://sponsor${i + 1}.com`,
    contactEmail: `contact@sponsor${i + 1}.com`,
    contactPerson: `Contact Person ${i + 1}`,
    sponsorshipValue: Math.floor(Math.random() * 100000) + 10000,
    sponsorshipStart: randomDate(
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    sponsorshipEnd: randomDate(
      new Date(),
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    ).toISOString(),
    benefits: ['Logo placement', 'Event sponsorship', 'Newsletter mention'],
    eventsSponsored: Math.floor(Math.random() * 10) + 1,
    chaptersSponsored: Math.floor(Math.random() * 5) + 1,
    description: `Description for sponsor company ${i + 1}`,
    tags: ['technology', 'finance', 'healthcare'].slice(
      0,
      Math.floor(Math.random() * 3) + 1
    ),
    createdAt: randomDate(
      new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
  }));
}

function generateMentorships() {
  const types = ['career', 'technical', 'leadership', 'entrepreneurship'];
  const statuses = ['pending', 'active', 'completed', 'cancelled', 'paused'];

  return Array.from({ length: 20 }, (_, i) => ({
    id: `mentorship-${i + 1}`,
    mentorId: `mentor-${Math.floor(Math.random() * 10) + 1}`,
    menteeId: `mentee-${Math.floor(Math.random() * 20) + 1}`,
    mentorName: `Mentor ${i + 1}`,
    menteeName: `Mentee ${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    title: `${types[Math.floor(Math.random() * types.length)]} Mentorship`,
    description: `Mentorship program focused on ${types[Math.floor(Math.random() * types.length)]} development`,
    goals: [`Goal 1 for mentorship ${i + 1}`, `Goal 2 for mentorship ${i + 1}`],
    duration: Math.floor(Math.random() * 12) + 3, // 3-15 months
    sessionsCompleted: Math.floor(Math.random() * 10),
    totalSessions: Math.floor(Math.random() * 15) + 5,
    nextSessionDate: randomDate(
      new Date(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).toISOString(),
    startDate: randomDate(
      new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    endDate: randomDate(
      new Date(),
      new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
    ).toISOString(),
    rating: Math.floor(Math.random() * 5) + 1,
    feedback: `Great mentorship experience ${i + 1}`,
    tags: ['career-growth', 'skill-development', 'networking'].slice(
      0,
      Math.floor(Math.random() * 3) + 1
    ),
    createdAt: randomDate(
      new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    updatedAt: randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
  }));
}

function generateQAItems() {
  const types = ['question', 'discussion', 'poll'];
  const categories = ['technical', 'career', 'academic', 'general'];
  const statuses = ['draft', 'published', 'archived', 'flagged'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  return Array.from({ length: 25 }, (_, i) => ({
    id: `qa-${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    title: `Q&A Item ${i + 1}: How to solve this problem?`,
    content: `This is the content for Q&A item ${i + 1}. It contains detailed information about the question or discussion topic.`,
    authorId: `user-${Math.floor(Math.random() * 50) + 1}`,
    authorName: `User ${Math.floor(Math.random() * 50) + 1}`,
    chapterId: `chapter-${Math.floor(Math.random() * 5) + 1}`,
    tags: ['javascript', 'react', 'career', 'networking'].slice(
      0,
      Math.floor(Math.random() * 4) + 1
    ),
    answerCount: Math.floor(Math.random() * 15),
    viewCount: Math.floor(Math.random() * 1000) + 10,
    voteCount: Math.floor(Math.random() * 50) - 10, // Can be negative
    commentCount: Math.floor(Math.random() * 20),
    participantCount: Math.floor(Math.random() * 30) + 1,
    isAnswered: Math.random() > 0.4,
    isFeatured: Math.random() > 0.8,
    isSticky: Math.random() > 0.9,
    isLocked: Math.random() > 0.95,
    flagCount: Math.floor(Math.random() * 3),
    lastActivityAt: randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    createdAt: randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    updatedAt: randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
  }));
}

function generateOpportunities() {
  const types = ['job', 'internship', 'freelance', 'volunteer'];
  const levels = ['entry', 'mid', 'senior', 'executive'];
  const statuses = ['draft', 'active', 'expired', 'filled', 'cancelled'];
  const companies = [
    'Microsoft',
    'Google',
    'Amazon',
    'Meta',
    'Apple',
    'Netflix',
    'Spotify',
    'Uber',
  ];
  const locations = [
    'Cape Town',
    'Johannesburg',
    'Durban',
    'Remote',
    'Pretoria',
    'Port Elizabeth',
  ];

  return Array.from({ length: 30 }, (_, i) => ({
    id: `opportunity-${i + 1}`,
    title: `${types[Math.floor(Math.random() * types.length)]} Position ${i + 1}`,
    company: companies[Math.floor(Math.random() * companies.length)],
    type: types[Math.floor(Math.random() * types.length)],
    level: levels[Math.floor(Math.random() * levels.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    isRemote: Math.random() > 0.6,
    salary: `R${Math.floor(Math.random() * 800000) + 200000}`,
    description: `Join ${companies[Math.floor(Math.random() * companies.length)]} as a ${types[Math.floor(Math.random() * types.length)]}.`,
    requirements: [
      '3+ years experience',
      'Team player',
      'Strong communication skills',
    ].slice(0, Math.floor(Math.random() * 3) + 1),
    tags: ['JavaScript', 'React', 'Node.js', 'Python', 'Docker', 'AWS'].slice(
      0,
      Math.floor(Math.random() * 4) + 1
    ),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    applicationCount: Math.floor(Math.random() * 100),
    viewCount: Math.floor(Math.random() * 500) + 50,
    postedDate: randomDate(
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    expiryDate: randomDate(
      new Date(),
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    ).toISOString(),
    contactEmail: `careers@${companies[Math.floor(Math.random() * companies.length)].toLowerCase()}.com`,
    partnerId: `partner-${Math.floor(Math.random() * 5) + 1}`,
    featured: Math.random() > 0.8,
    urgent: Math.random() > 0.9,
    createdAt: randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    updatedAt: randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
  }));
}

function generatePartners() {
  const types = ['hiring', 'technology', 'education', 'consulting', 'startup'];
  const statuses = ['active', 'inactive', 'pending', 'suspended'];

  return Array.from({ length: 15 }, (_, i) => ({
    id: `partner-${i + 1}`,
    name: `Partner Company ${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    logo: `https://picsum.photos/200/100?random=${200 + i}`,
    description: `Partner company ${i + 1} - providing excellent opportunities.`,
    website: `https://partner${i + 1}.com`,
    contactEmail: `partnerships@partner${i + 1}.com`,
    contactPerson: `Contact ${i + 1}`,
    jobOpportunities: Math.floor(Math.random() * 20) + 1,
    alumniHired: Math.floor(Math.random() * 50) + 5,
    hireRate: Math.floor(Math.random() * 40) + 60, // 60-100%
    partnershipSince: randomDate(
      new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    lastInteraction: randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    tags: ['hiring', 'partnership', 'careers', 'technology'].slice(
      0,
      Math.floor(Math.random() * 4) + 1
    ),
    isHiring: Math.random() > 0.4,
    tier: ['bronze', 'silver', 'gold', 'platinum'][
      Math.floor(Math.random() * 4)
    ],
    createdAt: randomDate(
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
  }));
}

function generateSpotlights() {
  const types = [
    'success_story',
    'interview',
    'achievement',
    'project_showcase',
  ];
  const statuses = ['draft', 'scheduled', 'published', 'archived'];

  return Array.from({ length: 18 }, (_, i) => ({
    id: `spotlight-${i + 1}`,
    title: `Alumni Spotlight ${i + 1}: Success Story`,
    content: `Full spotlight content for alumni ${i + 1}. This includes their journey, achievements, and lessons learned.`,
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    featuredAlumniId: `alumni-${i + 1}`,
    featuredAlumniName: `Alumni ${i + 1}`,
    featuredAlumniTitle: `Senior Developer at Company ${i + 1}`,
    featuredAlumniImage: `https://picsum.photos/300/300?random=${400 + i}`,
    tags: [
      'success',
      'career',
      'leadership',
      'innovation',
      'entrepreneurship',
    ].slice(0, Math.floor(Math.random() * 5) + 1),
    viewCount: Math.floor(Math.random() * 5000) + 100,
    likeCount: Math.floor(Math.random() * 500) + 20,
    shareCount: Math.floor(Math.random() * 100) + 5,
    commentCount: Math.floor(Math.random() * 50) + 2,
    featured: Math.random() > 0.7,
    publishedAt:
      Math.random() > 0.5
        ? randomDate(
            new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            new Date()
          ).toISOString()
        : null,
    scheduledFor:
      Math.random() > 0.7
        ? randomDate(
            new Date(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          ).toISOString()
        : null,
    createdAt: randomDate(
      new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    updatedAt: randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
  }));
}

function generateChapters() {
  const provinces = [
    'western-cape',
    'eastern-cape',
    'northern-cape',
    'free-state',
    'kwazulu-natal',
    'north-west',
    'gauteng',
    'mpumalanga',
    'limpopo',
  ];
  const statuses = ['active', 'inactive', 'pending'];
  const performances = ['low', 'medium', 'high', 'excellent'];
  const frequencies = ['weekly', 'bi-weekly', 'monthly', 'quarterly'];

  return Array.from({ length: 12 }, (_, i) => ({
    id: `chapter-${i + 1}`,
    name: `Chapter ${i + 1}`,
    location: `City ${i + 1}`,
    province: provinces[Math.floor(Math.random() * provinces.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    performance: performances[Math.floor(Math.random() * performances.length)],
    leadName: `Lead ${i + 1}`,
    leadEmail: `lead${i + 1}@example.com`,
    leadPhone: `+27${Math.floor(Math.random() * 900000000) + 100000000}`,
    memberCount: Math.floor(Math.random() * 100) + 20,
    activeMembers: Math.floor(Math.random() * 80) + 15,
    engagementRate: Math.floor(Math.random() * 40) + 60, // 60-100%
    eventsThisMonth: Math.floor(Math.random() * 5),
    eventsThisYear: Math.floor(Math.random() * 24) + 6,
    meetingVenue: `Venue ${i + 1}`,
    meetingFrequency:
      frequencies[Math.floor(Math.random() * frequencies.length)],
    nextMeeting: randomDate(
      new Date(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).toISOString(),
    description: `Local chapter for alumni based in City ${i + 1}. We focus on community building and professional development.`,
    focusAreas: [
      'mentorship',
      'networking',
      'career',
      'community',
      'education',
    ].slice(0, Math.floor(Math.random() * 5) + 1),
    sponsor:
      Math.random() > 0.5
        ? `Sponsor ${Math.floor(Math.random() * 10) + 1}`
        : null,
    isSponsored: Math.random() > 0.5,
    sponsorshipValue:
      Math.random() > 0.5 ? Math.floor(Math.random() * 50000) + 10000 : 0,
    socialMedia: {
      facebook: `https://facebook.com/chapter${i + 1}`,
      twitter: `https://twitter.com/chapter${i + 1}`,
      linkedin: `https://linkedin.com/company/chapter${i + 1}`,
    },
    createdAt: randomDate(
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    updatedAt: randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
  }));
}

function generateUsers() {
  const roles = ['admin', 'alumni', 'mentor', 'student'];
  const statuses = ['active', 'inactive', 'suspended', 'pending'];

  return Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    email: `user${i + 1}@example.com`,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    fullName: `First${i + 1} Last${i + 1}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    avatar: `https://picsum.photos/150/150?random=${500 + i}`,
    bio: `Bio for user ${i + 1}. Passionate about technology and community building.`,
    location: `City ${Math.floor(Math.random() * 10) + 1}`,
    company: `Company ${Math.floor(Math.random() * 20) + 1}`,
    jobTitle: `Position ${Math.floor(Math.random() * 10) + 1}`,
    graduationYear: 2015 + Math.floor(Math.random() * 10),
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Leadership'].slice(
      0,
      Math.floor(Math.random() * 5) + 1
    ),
    interests: ['Technology', 'Mentoring', 'Networking', 'Innovation'].slice(
      0,
      Math.floor(Math.random() * 4) + 1
    ),
    chapterId: `chapter-${Math.floor(Math.random() * 12) + 1}`,
    isVerified: Math.random() > 0.3,
    lastLoginAt: randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    createdAt: randomDate(
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    updatedAt: randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
  }));
}

function generateApplications() {
  const statuses = ['pending', 'reviewed', 'accepted', 'rejected', 'withdrawn'];

  return Array.from({ length: 100 }, (_, i) => ({
    id: `application-${i + 1}`,
    opportunityId: `opportunity-${Math.floor(Math.random() * 30) + 1}`,
    applicantId: `user-${Math.floor(Math.random() * 50) + 1}`,
    applicantName: `Applicant ${i + 1}`,
    applicantEmail: `applicant${i + 1}@example.com`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    coverLetter: `Cover letter for application ${i + 1}. I am very interested in this position.`,
    resume: `https://example.com/resumes/resume${i + 1}.pdf`,
    experience: Math.floor(Math.random() * 10) + 1,
    expectedSalary: Math.floor(Math.random() * 500000) + 300000,
    availableFrom: randomDate(
      new Date(),
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    ).toISOString(),
    notes: `Notes for application ${i + 1}`,
    reviewedBy:
      Math.random() > 0.5
        ? `reviewer-${Math.floor(Math.random() * 5) + 1}`
        : null,
    reviewedAt:
      Math.random() > 0.5
        ? randomDate(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            new Date()
          ).toISOString()
        : null,
    createdAt: randomDate(
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
    updatedAt: randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    ).toISOString(),
  }));
}

function buildDb() {
  return {
    // Core entities
    users: generateUsers(),
    events: generateEvents(),
    sponsors: generateSponsors(),
    partners: generatePartners(),
    chapters: generateChapters(),
    opportunities: generateOpportunities(),
    applications: generateApplications(),
    mentorships: generateMentorships(),
    qa: generateQAItems(),
    spotlights: generateSpotlights(),

    // Additional collections that might be needed
    notifications: [],
    analytics: {},
    settings: {},
    files: [],
  };
}

function writeDb() {
  const db = buildDb();
  try {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(db, null, 2), 'utf8');
    console.log(`Enhanced seed data written to ${outFile}`);
    console.log(`Generated data summary:`);
    console.log(`- Users: ${db.users.length}`);
    console.log(`- Events: ${db.events.length}`);
    console.log(`- Sponsors: ${db.sponsors.length}`);
    console.log(`- Partners: ${db.partners.length}`);
    console.log(`- Chapters: ${db.chapters.length}`);
    console.log(`- Opportunities: ${db.opportunities.length}`);
    console.log(`- Applications: ${db.applications.length}`);
    console.log(`- Mentorships: ${db.mentorships.length}`);
    console.log(`- Q&A Items: ${db.qa.length}`);
    console.log(`- Spotlights: ${db.spotlights.length}`);
  } catch (err) {
    console.error('Failed to write db.json', err);
    process.exit(1);
  }
}

writeDb();
