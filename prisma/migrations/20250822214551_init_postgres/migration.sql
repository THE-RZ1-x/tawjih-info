-- CreateTable
CREATE TABLE "public"."job_competitions" (
    "id" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "slug_ar" TEXT NOT NULL,
    "body_ar" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "closing_date" TIMESTAMP(3),
    "pdf_url" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school_guidance" (
    "id" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "slug_ar" TEXT NOT NULL,
    "body_ar" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "pdf_url" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_guidance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exam_calendars" (
    "id" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "slug_ar" TEXT NOT NULL,
    "body_ar" TEXT NOT NULL,
    "exam_date" TIMESTAMP(3) NOT NULL,
    "subject" TEXT NOT NULL,
    "school_level" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "pdf_url" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seo_meta" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "jobCompetitionId" TEXT,
    "schoolGuidanceId" TEXT,
    "examCalendarId" TEXT,

    CONSTRAINT "seo_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hero_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt_text" TEXT NOT NULL,
    "jobCompetitionId" TEXT,
    "schoolGuidanceId" TEXT,
    "examCalendarId" TEXT,

    CONSTRAINT "hero_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "preferences" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."saved_jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_competitions_slug_ar_key" ON "public"."job_competitions"("slug_ar");

-- CreateIndex
CREATE UNIQUE INDEX "school_guidance_slug_ar_key" ON "public"."school_guidance"("slug_ar");

-- CreateIndex
CREATE UNIQUE INDEX "exam_calendars_slug_ar_key" ON "public"."exam_calendars"("slug_ar");

-- CreateIndex
CREATE UNIQUE INDEX "seo_meta_jobCompetitionId_key" ON "public"."seo_meta"("jobCompetitionId");

-- CreateIndex
CREATE UNIQUE INDEX "seo_meta_schoolGuidanceId_key" ON "public"."seo_meta"("schoolGuidanceId");

-- CreateIndex
CREATE UNIQUE INDEX "seo_meta_examCalendarId_key" ON "public"."seo_meta"("examCalendarId");

-- CreateIndex
CREATE UNIQUE INDEX "hero_images_jobCompetitionId_key" ON "public"."hero_images"("jobCompetitionId");

-- CreateIndex
CREATE UNIQUE INDEX "hero_images_schoolGuidanceId_key" ON "public"."hero_images"("schoolGuidanceId");

-- CreateIndex
CREATE UNIQUE INDEX "hero_images_examCalendarId_key" ON "public"."hero_images"("examCalendarId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "saved_jobs_userId_jobId_key" ON "public"."saved_jobs"("userId", "jobId");

-- CreateIndex
CREATE INDEX "bookmarks_userId_targetType_targetId_idx" ON "public"."bookmarks"("userId", "targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "public"."admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "public"."admins"("email");

-- AddForeignKey
ALTER TABLE "public"."seo_meta" ADD CONSTRAINT "seo_meta_jobCompetitionId_fkey" FOREIGN KEY ("jobCompetitionId") REFERENCES "public"."job_competitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seo_meta" ADD CONSTRAINT "seo_meta_schoolGuidanceId_fkey" FOREIGN KEY ("schoolGuidanceId") REFERENCES "public"."school_guidance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seo_meta" ADD CONSTRAINT "seo_meta_examCalendarId_fkey" FOREIGN KEY ("examCalendarId") REFERENCES "public"."exam_calendars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hero_images" ADD CONSTRAINT "hero_images_jobCompetitionId_fkey" FOREIGN KEY ("jobCompetitionId") REFERENCES "public"."job_competitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hero_images" ADD CONSTRAINT "hero_images_schoolGuidanceId_fkey" FOREIGN KEY ("schoolGuidanceId") REFERENCES "public"."school_guidance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hero_images" ADD CONSTRAINT "hero_images_examCalendarId_fkey" FOREIGN KEY ("examCalendarId") REFERENCES "public"."exam_calendars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saved_jobs" ADD CONSTRAINT "saved_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saved_jobs" ADD CONSTRAINT "saved_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."job_competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
