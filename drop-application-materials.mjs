import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool);

async function main() {
  console.log("Dropping application_materials table...");

  try {
    await db.execute(sql`DROP TABLE IF EXISTS "application_materials" CASCADE`);
    console.log("✓ Dropped application_materials table");
    console.log("\n✓ Cleanup complete! Now run: npm run db:push");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }

  process.exit(0);
}

main();
