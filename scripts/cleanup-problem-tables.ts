import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function cleanup() {
  console.log("Dropping existing problem tables...");

  await db.execute(sql`DROP TABLE IF EXISTS "submissions" CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS "test_cases" CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS "problems" CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS "problem_difficulty" CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS "submission_status" CASCADE`);

  console.log("✓ Cleanup complete");
  process.exit(0);
}

cleanup().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
