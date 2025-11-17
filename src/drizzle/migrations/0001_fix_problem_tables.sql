-- Manual migration to fix problem tables
-- Drop and recreate with proper UUID defaults

DROP TABLE IF EXISTS "submissions" CASCADE;
DROP TABLE IF EXISTS "test_cases" CASCADE;
DROP TABLE IF EXISTS "problems" CASCADE;

CREATE TABLE "problems" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "job_info_id" uuid REFERENCES "job_info"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "difficulty" "problem_difficulty" NOT NULL,
  "input_description" text,
  "output_description" text,
  "examples" json,
  "constraints" text,
  "supported_languages" json,
  "reference_solution" text,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "test_cases" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "problem_id" uuid NOT NULL REFERENCES "problems"("id") ON DELETE CASCADE,
  "input" text NOT NULL,
  "expected_output" text NOT NULL,
  "is_hidden" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "problem_id" uuid NOT NULL REFERENCES "problems"("id") ON DELETE CASCADE,
  "language" varchar(50) NOT NULL,
  "source_code" text NOT NULL,
  "status" "submission_status" DEFAULT 'PENDING' NOT NULL,
  "results" json,
  "runtime_ms" integer,
  "memory_mb" integer,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
