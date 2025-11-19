import pg from "pg";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, "..", ".env.local") });
config({ path: join(__dirname, "..", ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in environment variables");
  process.exit(1);
}

const client = new pg.Client({ connectionString: DATABASE_URL });

async function convertFeedbackToJsonb() {
  try {
    await client.connect();
    console.log("Connected to database");
    
    console.log("Converting feedback column from varchar to jsonb...");
    
    // First, update existing data - convert valid JSON strings to jsonb, set invalid ones to null
    await client.query(`
      UPDATE "interviews"
      SET "feedback" = CASE
        WHEN "feedback" IS NULL OR "feedback" = '' THEN NULL
        WHEN "feedback"::text ~ '^[\\s]*\\{' OR "feedback"::text ~ '^[\\s]*\\[' THEN
          CASE
            WHEN "feedback"::text::jsonb IS NOT NULL THEN "feedback"::text::jsonb
            ELSE NULL
          END
        ELSE NULL
      END
      WHERE "feedback" IS NOT NULL;
    `);
    
    console.log("Updated existing feedback data");
    
    // Now alter the column type
    await client.query(`
      ALTER TABLE "interviews"
      ALTER COLUMN "feedback" TYPE jsonb
      USING CASE
        WHEN "feedback" IS NULL THEN NULL::jsonb
        WHEN "feedback"::text ~ '^[\\s]*\\{' OR "feedback"::text ~ '^[\\s]*\\[' THEN
          "feedback"::text::jsonb
        ELSE NULL::jsonb
      END;
    `);
    
    console.log("✓ Successfully converted feedback column to jsonb");
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("Error converting feedback column:", error);
    await client.end();
    process.exit(1);
  }
}

convertFeedbackToJsonb();

