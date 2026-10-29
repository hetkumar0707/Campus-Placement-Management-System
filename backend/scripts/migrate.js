// Upgrades an existing database for the AI job-matching features.  Run with:  npm run db:migrate
// (The API also does this automatically on start, so this is only needed if you want to run it by hand.)
require("dotenv").config();
const mysql = require("mysql2/promise");
const { migrate } = require("../src/utils/migrate");

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "cpms",
  });
  const added = await migrate(conn);
  console.log(added.length ? "Added: " + added.join(", ") : "Database is already up to date.");
  await conn.end();
})().catch((e) => { console.error("Migration failed:", e.message); process.exit(1); });
