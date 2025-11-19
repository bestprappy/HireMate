-- Create table to track resume versions and AI analysis results
CREATE TABLE IF NOT EXISTS "resume_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" varchar NOT NULL,
  "jobInfoId" uuid NOT NULL,
  "fileName" varchar,
  "fileType" varchar,
  "fileSize" integer,
  "resumeText" text NOT NULL,
  "analysis" jsonb NOT NULL,
  "overallScore" double precision,
  "atsScore" double precision,
  "jobMatchScore" double precision,
  "writingAndFormattingScore" double precision,
  "keywordCoverageScore" double precision,
  "otherScore" double precision,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "updatedAt" timestamptz DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'resume_versions_userId_users_id_fk'
  ) THEN
    ALTER TABLE "resume_versions"
      ADD CONSTRAINT "resume_versions_userId_users_id_fk"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'resume_versions_jobInfoId_job_info_id_fk'
  ) THEN
    ALTER TABLE "resume_versions"
      ADD CONSTRAINT "resume_versions_jobInfoId_job_info_id_fk"
      FOREIGN KEY ("jobInfoId") REFERENCES "job_info"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "resume_versions_job_created_idx"
  ON "resume_versions" ("jobInfoId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "resume_versions_user_created_idx"
  ON "resume_versions" ("userId", "createdAt" DESC);

