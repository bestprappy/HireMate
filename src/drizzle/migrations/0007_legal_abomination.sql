ALTER TABLE "resume_versions" RENAME COLUMN "resumeText" TO "resumeFileBase64";--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "scorecard" jsonb;--> statement-breakpoint
ALTER TABLE "interviews" ADD COLUMN "questions" jsonb;--> statement-breakpoint
ALTER TABLE "resume_versions" ADD COLUMN "resumePlainText" text;