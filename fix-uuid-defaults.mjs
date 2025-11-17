import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool);

async function fixDefaults() {
  console.log("Adding UUID defaults to problem tables...");

  try {
    await db.execute(
      sql`ALTER TABLE "problems" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`
    );
    console.log("✓ Fixed problems.id default");

    await db.execute(
      sql`ALTER TABLE "test_cases" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`
    );
    console.log("✓ Fixed test_cases.id default");

    await db.execute(
      sql`ALTER TABLE "submissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`
    );
    console.log("✓ Fixed submissions.id default");

    console.log("\n✓ All defaults fixed!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }

  process.exit(0);
}

fixDefaults();
