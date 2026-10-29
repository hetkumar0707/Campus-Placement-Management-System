// Creates the database, tables and demo data.  Run with:  npm run db:init
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const { migrate } = require("../src/utils/migrate");

const DB = process.env.DB_NAME || "cpms";

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  let schema = fs.readFileSync(path.join(__dirname, "..", "..", "database", "schema.sql"), "utf8");
  schema = schema
    .replace("CREATE DATABASE IF NOT EXISTS cpms", `CREATE DATABASE IF NOT EXISTS \`${DB}\``)
    .replace("USE cpms;", `USE \`${DB}\`;`);
  await conn.query(schema);
  await migrate(conn); // upgrades older databases (adds the AI-matching columns)
  console.log("Tables created.");

  async function ensureUser(name, email, password, role) {
    const [rows] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
    if (rows[0]) {
      await conn.query("UPDATE users SET password_hash = ?, role = ? WHERE id = ?", [bcrypt.hashSync(password, 10), role, rows[0].id]);
      return { id: rows[0].id, created: false };
    }
    const [r] = await conn.query("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [
      name, email, bcrypt.hashSync(password, 10), role,
    ]);
    return { id: r.insertId, created: true };
  }

  // TPO / admin
  await ensureUser("Placement Officer", "tpo@cpms.com", "Admin@123", "TPO");

  // Demo recruiter + a placement drive (same as the screenshots)
  const rec = await ensureUser("Demo Recruiter", "recruiter@demo.com", "Recruiter@123", "RECRUITER");
  let recruiterId;
  if (rec.created) {
    const [r] = await conn.query("INSERT INTO recruiters (user_id, company_name, phone) VALUES (?, ?, ?)", [
      rec.id, "Demo Technologies", "9000000000",
    ]);
    recruiterId = r.insertId;
    await conn.query(
      `INSERT INTO jobs (recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, required_skills)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 45 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), ?)`,
      [recruiterId, "Software Engineering Intern", "Full-stack development internship with software engineering responsibilities.",
       6, 7, JSON.stringify(["Computer Engineering", "Information Technology"]), 2, "Surat",
       JSON.stringify(["JavaScript", "React", "Node.js", "SQL", "REST API", "Git"])]
    );
  }

  // Demo student
  const stu = await ensureUser("Demo Student", "student@demo.com", "Student@123", "STUDENT");
  if (stu.created) {
    await conn.query(
      `INSERT INTO students (user_id, phone, enrollment_no, branch, cgpa, backlogs, graduation_year, skills, career_interests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [stu.id, "1023456789", "CO813", "Computer Engineering", 8, 0, 2027,
       JSON.stringify(["JavaScript", "React", "Node.js", "SQL", "Git", "HTML", "CSS"]), "Full Stack Developer, Software Engineer"]
    );
  }

  console.log("\nDemo logins:");
  console.log("  Student   student@demo.com   / Student@123");
  console.log("  Recruiter recruiter@demo.com / Recruiter@123");
  console.log("  TPO       tpo@cpms.com       / Admin@123");
  await conn.end();
}

main().catch((err) => {
  console.error("Database setup failed:", err.message);
  process.exit(1);
});
