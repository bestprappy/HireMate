-- Add AI-powered job info fields
ALTER TABLE "job_info" ADD COLUMN IF NOT EXISTS "aiSummary" text;
ALTER TABLE "job_info" ADD COLUMN IF NOT EXISTS "tags" text[];
ALTER TABLE "job_info" ADD COLUMN IF NOT EXISTS "location" varchar;
ALTER TABLE "job_info" ADD COLUMN IF NOT EXISTS "salary" varchar;
ALTER TABLE "job_info" ADD COLUMN IF NOT EXISTS "isAiProcessed" boolean DEFAULT false;
