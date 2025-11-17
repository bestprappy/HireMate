import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool);

async function cleanup() {
  console.log("Dropping existing problem tables...");

  try {
    await db.execute(sql`DROP TABLE IF EXISTS "submissions" CASCADE`);
    console.log("✓ Dropped submissions table");

    await db.execute(sql`DROP TABLE IF EXISTS "test_cases" CASCADE`);
    console.log("✓ Dropped test_cases table");

    await db.execute(sql`DROP TABLE IF EXISTS "problems" CASCADE`);
    console.log("✓ Dropped problems table");

    await db.execute(sql`DROP TYPE IF EXISTS "problem_difficulty" CASCADE`);
    console.log("✓ Dropped problem_difficulty enum");

    await db.execute(sql`DROP TYPE IF EXISTS "submission_status" CASCADE`);
    console.log("✓ Dropped submission_status enum");

    console.log("\n✓ Cleanup complete! Now run: npm run db:push");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }

  process.exit(0);
}

cleanup();
