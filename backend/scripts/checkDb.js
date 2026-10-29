// Diagnoses setup problems.  Run with:  npm run check
require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const TABLES = ["users", "students", "recruiters", "jobs", "applications", "notifications"];
const DEMO = [
  ["student@demo.com", "Student@123"],
  ["recruiter@demo.com", "Recruiter@123"],
  ["tpo@cpms.com", "Admin@123"],
];

(async () => {
  console.log("1) .env  : JWT_SECRET " + (process.env.JWT_SECRET ? "OK" : "MISSING  <-- fix backend/.env"));
  console.log(`   DB    : ${process.env.DB_USER || "root"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || "cpms"}`);

  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "cpms",
    });
    console.log("2) MySQL connection: OK");
  } catch (err) {
    console.log("2) MySQL connection: FAILED -> " + err.message);
    if (err.code === "ER_BAD_DB_ERROR") console.log("   Database 'cpms' does not exist. Import database/schema.sql in phpMyAdmin.");
    if (err.code === "ER_ACCESS_DENIED_ERROR") console.log("   Wrong DB_USER / DB_PASSWORD in backend/.env");
    if (err.code === "ECONNREFUSED") console.log("   MySQL is not running. Start it in the XAMPP Control Panel.");
    process.exit(1);
  }

  const [t] = await conn.query("SHOW TABLES");
  const have = t.map((r) => Object.values(r)[0]);
  const missing = TABLES.filter((x) => !have.includes(x));
  console.log("3) Tables: " + (missing.length ? "MISSING " + missing.join(", ") + "  <-- import database/schema.sql" : "OK"));
  if (missing.length) process.exit(1);

  const [[c]] = await conn.query("SELECT COUNT(*) AS n FROM users");
  console.log(`4) Users in database: ${c.n}`);
  for (const [email, pw] of DEMO) {
    const [r] = await conn.query("SELECT password_hash FROM users WHERE email = ?", [email]);
    console.log(`   ${email}: ` + (!r[0] ? "not found  <-- run npm run db:init" : bcrypt.compareSync(pw, r[0].password_hash) ? "login OK" : "wrong password stored  <-- run npm run db:init"));
  }
  console.log("\nAll checks done. If everything is OK, run: npm start");
  await conn.end();
})();
