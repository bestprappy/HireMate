-- Drop and recreate application_materials table with correct types
DROP TABLE IF EXISTS application_materials CASCADE;

CREATE TABLE IF NOT EXISTS application_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "jobInfoId" uuid NOT NULL REFERENCES job_info(id) ON DELETE CASCADE,
  "userId" varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggestions json NOT NULL,
  "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
  "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

