// Upgrades an existing CPMS database to the current schema (safe to run many times).
// Works on MySQL and MariaDB (does not rely on "ADD COLUMN IF NOT EXISTS").
// Called automatically when the API starts and by `npm run db:migrate`.

const COLUMNS = [
  ["students", "skills", "TEXT NULL"],
  ["students", "career_interests", "VARCHAR(255) NULL"],
  ["students", "resume_text", "MEDIUMTEXT NULL"],
  ["students", "resume_analyzed_at", "TIMESTAMP NULL"],
  ["jobs", "required_skills", "TEXT NULL"],
];

const SAVED_JOBS = `
  CREATE TABLE IF NOT EXISTS saved_jobs (
    student_id INT NOT NULL,
    job_id     INT NOT NULL,
    saved_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, job_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`;

// `conn` can be a mysql2/promise pool or connection that is already using the cpms database
async function migrate(conn) {
  const [[{ db }]] = await conn.query("SELECT DATABASE() AS db");
  const added = [];
  for (const [table, column, definition] of COLUMNS) {
    const [rows] = await conn.query(
      "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?",
      [db, table, column]
    );
    if (!rows.length) {
      await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      added.push(`${table}.${column}`);
    }
  }
  await conn.query(SAVED_JOBS);
  return added;
}

module.exports = { migrate };
