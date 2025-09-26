-- CreateTable
CREATE TABLE "Spotlight" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "type" TEXT,
    "status" TEXT,
    "featuredAlumniId" TEXT,
    "featuredAlumniName" TEXT,
    "tags" TEXT[],
    "viewCount" INTEGER DEFAULT 0,
    "likeCount" INTEGER DEFAULT 0,
    "shareCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Spotlight_pkey" PRIMARY KEY ("id")
);
