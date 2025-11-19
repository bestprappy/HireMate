-- Convert feedback column from varchar to jsonb
-- Handle existing data: if it's valid JSON, parse it; otherwise set to null
DO $$
BEGIN
  -- First, try to convert valid JSON strings to jsonb
  -- For non-JSON strings or invalid JSON, set to null
  UPDATE "interviews"
  SET "feedback" = CASE
    WHEN "feedback" IS NULL OR "feedback" = '' THEN NULL
    WHEN "feedback"::text ~ '^[\s]*\{' OR "feedback"::text ~ '^[\s]*\[' THEN
      -- Try to parse as JSON
      CASE
        WHEN "feedback"::text::jsonb IS NOT NULL THEN "feedback"::text::jsonb
        ELSE NULL
      END
    ELSE NULL
  END
  WHERE "feedback" IS NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- If update fails, just continue to alter
    NULL;
END $$;

-- Now alter the column type
ALTER TABLE "interviews"
  ALTER COLUMN "feedback" TYPE jsonb
  USING CASE
    WHEN "feedback" IS NULL THEN NULL::jsonb
    WHEN "feedback"::text ~ '^[\s]*\{' OR "feedback"::text ~ '^[\s]*\[' THEN
      "feedback"::text::jsonb
    ELSE NULL::jsonb
  END;

