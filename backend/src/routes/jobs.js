const express = require("express");
const db = require("../config/db");
const { auth, requireRole } = require("../middleware/auth");
const { checkEligibility, parseBranches } = require("../utils/eligibility");
const { parseSkillColumn } = require("../utils/skills");
const { jobSkills } = require("../services/recommender");

const router = express.Router();

const OPEN_JOBS_SQL = `
  SELECT j.*, r.company_name
  FROM jobs j JOIN recruiters r ON r.id = j.recruiter_id
  WHERE j.status = 'OPEN' AND (j.application_deadline IS NULL OR j.application_deadline >= CURDATE())
  ORDER BY j.created_at DESC`;

function shapeJob(j) {
  return { ...j, eligible_branches: parseBranches(j.eligible_branches), required_skills: jobSkills(j).skills };
}

// Loads open jobs for a student and attaches eligibility + applied flags
async function jobsForStudent(userId) {
  const [students] = await db.query("SELECT id, branch, cgpa, backlogs FROM students WHERE user_id = ?", [userId]);
  const student = students[0];
  if (!student) return { student: null, jobs: [] };

  const [jobs] = await db.query(OPEN_JOBS_SQL);
  const [apps] = await db.query("SELECT job_id, status FROM applications WHERE student_id = ?", [student.id]);
  const applied = new Map(apps.map((a) => [a.job_id, a.status]));
  const [savedRows] = await db.query("SELECT job_id FROM saved_jobs WHERE student_id = ?", [student.id]);
  const saved = new Set(savedRows.map((r) => r.job_id));

  const shaped = jobs.map((j) => {
    const job = shapeJob(j);
    const result = checkEligibility(student, job);
    return { ...job, eligible: result.eligible, reasons: result.reasons, applied: applied.has(job.id), application_status: applied.get(job.id) || null, saved: saved.has(job.id) };
  });
  return { student, jobs: shaped };
}

/* Module 3 - all open drives (students also get eligibility details) */
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role === "STUDENT") {
      const { jobs } = await jobsForStudent(req.user.id);
      return res.json(jobs);
    }
    const [jobs] = await db.query(OPEN_JOBS_SQL);
    res.json(jobs.map(shapeJob));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load jobs" });
  }
});

/* Module 3 - only the drives the logged-in student is eligible for */
router.get("/eligible", auth, requireRole("STUDENT"), async (req, res) => {
  try {
    const { jobs } = await jobsForStudent(req.user.id);
    res.json(jobs.filter((j) => j.eligible));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load eligible jobs" });
  }
});

/* Save / unsave (bookmark) a drive */
router.post("/:id/save", auth, requireRole("STUDENT"), async (req, res) => {
  try {
    const [students] = await db.query("SELECT id FROM students WHERE user_id = ?", [req.user.id]);
    if (!students[0]) return res.status(404).json({ message: "Student profile not found" });
    const [jobs] = await db.query("SELECT id FROM jobs WHERE id = ?", [req.params.id]);
    if (!jobs[0]) return res.status(404).json({ message: "Placement drive not found" });
    const [del] = await db.query("DELETE FROM saved_jobs WHERE student_id = ? AND job_id = ?", [students[0].id, req.params.id]);
    if (del.affectedRows) return res.json({ saved: false });
    await db.query("INSERT INTO saved_jobs (student_id, job_id) VALUES (?, ?)", [students[0].id, req.params.id]);
    res.json({ saved: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update saved drives" });
  }
});

module.exports = router;
