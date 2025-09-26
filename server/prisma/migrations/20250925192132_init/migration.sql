-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "fullName" TEXT,
    "role" TEXT,
    "status" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "graduationYear" INTEGER,
    "skills" TEXT[],
    "interests" TEXT[],
    "isVerified" BOOLEAN DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "chapterId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "province" TEXT,
    "status" TEXT,
    "performance" TEXT,
    "leadName" TEXT,
    "leadEmail" TEXT,
    "leadPhone" TEXT,
    "memberCount" INTEGER DEFAULT 0,
    "engagementRate" INTEGER DEFAULT 0,
    "eventsThisMonth" INTEGER DEFAULT 0,
    "meetingVenue" TEXT,
    "meetingFrequency" TEXT,
    "description" TEXT,
    "focusAreas" TEXT[],
    "sponsor" TEXT,
    "isSponsored" BOOLEAN DEFAULT false,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "description" TEXT,
    "organizer" TEXT,
    "location" TEXT,
    "venue" TEXT,
    "address" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "sponsor" TEXT,
    "status" TEXT,
    "isFeatured" BOOLEAN DEFAULT false,
    "tags" TEXT[],
    "rsvpCount" INTEGER DEFAULT 0,
    "attendanceCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "website" TEXT,
    "tier" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "contactEmail" TEXT,
    "partnershipSince" TIMESTAMP(3),
    "lastInteraction" TIMESTAMP(3),
    "tags" TEXT[],
    "isHiring" BOOLEAN DEFAULT false,
    "tier" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "type" TEXT,
    "level" TEXT,
    "location" TEXT,
    "isRemote" BOOLEAN DEFAULT false,
    "salary" TEXT,
    "description" TEXT,
    "requirements" TEXT[],
    "tags" TEXT[],
    "status" TEXT,
    "applicationCount" INTEGER DEFAULT 0,
    "viewCount" INTEGER DEFAULT 0,
    "postedDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "contactEmail" TEXT,
    "partnerId" TEXT,
    "featured" BOOLEAN DEFAULT false,
    "urgent" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mentorship" (
    "id" TEXT NOT NULL,
    "mentorName" TEXT,
    "menteeName" TEXT,
    "topic" TEXT,
    "status" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Mentorship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QAItem" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "tags" TEXT[],
    "status" TEXT,
    "views" INTEGER DEFAULT 0,
    "votes" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "QAItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
