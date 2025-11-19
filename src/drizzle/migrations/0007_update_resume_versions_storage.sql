DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'resume_versions'
      AND column_name = 'resumeText'
  ) THEN
    ALTER TABLE "resume_versions"
      RENAME COLUMN "resumeText" TO "resumeFileBase64";
  END IF;
END $$;

ALTER TABLE "resume_versions"
  ALTER COLUMN "resumeFileBase64" SET NOT NULL;

ALTER TABLE "resume_versions"
  ADD COLUMN IF NOT EXISTS "resumePlainText" text;

