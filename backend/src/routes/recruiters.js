const express = require("express");
const db = require("../config/db");
const { auth, requireRole } = require("../middleware/auth");
const { checkEligibility, parseBranches } = require("../utils/eligibility");
const { notify } = require("../utils/notify");
const { normalizeSkillList, inferSkillsFromRole, parseSkillColumn } = require("../utils/skills");
const { scoreApplicants, jobSkills } = require("../services/recommender");

const router = express.Router();
router.use(auth, requireRole("RECRUITER"));

const STATUSES = ["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function getRecruiter(userId) {
  const [rows] = await db.query("SELECT id, company_name FROM recruiters WHERE user_id = ?", [userId]);
  return rows[0];
}

/* Module 2 - Job Posting: create a placement drive */
router.post("/jobs", async (req, res) => {
  const b = req.body || {};
  const title = String(b.title || "").trim();
  const description = String(b.description || "").trim();
  const packageLpa = Number(b.package_lpa);
  const minCgpa = Number(b.min_cgpa === "" || b.min_cgpa == null ? 0 : b.min_cgpa);
  const maxBacklogs = Number(b.max_backlogs === "" || b.max_backlogs == null ? 0 : b.max_backlogs);
  const branches = parseBranches(b.eligible_branches).map((x) => String(x).trim()).filter(Boolean);
  const driveDate = b.drive_date ? String(b.drive_date) : null;
  const deadline = b.application_deadline ? String(b.application_deadline) : null;
  const requiredSkills = normalizeSkillList(b.required_skills);

  if (!title) return res.status(400).json({ message: "Job title is required" });
  if (!Number.isFinite(packageLpa) || packageLpa < 0) return res.status(400).json({ message: "Enter a valid package (LPA)" });
  if (!Number.isFinite(minCgpa) || minCgpa < 0 || minCgpa > 10) return res.status(400).json({ message: "Minimum CGPA must be between 0 and 10" });
  if (!Number.isInteger(maxBacklogs) || maxBacklogs < 0) return res.status(400).json({ message: "Maximum backlogs must be 0 or more" });
  if (!branches.length) return res.status(400).json({ message: "Enter at least one eligible branch" });
  if ((driveDate && !DATE_RE.test(driveDate)) || (deadline && !DATE_RE.test(deadline))) {
    return res.status(400).json({ message: "Dates must be in YYYY-MM-DD format" });
  }
  if (driveDate && deadline && deadline > driveDate) {
    return res.status(400).json({ message: "Application deadline must be on or before the drive date" });
  }

  try {
    const recruiter = await getRecruiter(req.user.id);
    if (!recruiter) return res.status(404).json({ message: "Recruiter profile not found" });

    const [result] = await db.query(
      `INSERT INTO jobs (recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches,
                         max_backlogs, location, drive_date, application_deadline, required_skills)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [recruiter.id, title, description, packageLpa, minCgpa, JSON.stringify(branches), maxBacklogs,
       String(b.location || "").trim(), driveDate, deadline, JSON.stringify(requiredSkills)]
    );

    // Let eligible students know about the new drive
    const job = { eligible_branches: branches, min_cgpa: minCgpa, max_backlogs: maxBacklogs };
    const [students] = await db.query("SELECT user_id, branch, cgpa, backlogs FROM students");
    const matches = students.filter((s) => checkEligibility(s, job).eligible);
    if (matches.length) {
      const msg = `New placement drive: ${title} at ${recruiter.company_name}`.slice(0, 255);
      await db.query("INSERT INTO notifications (user_id, message) VALUES ?", [matches.map((s) => [s.user_id, msg])]);
    }

    res.status(201).json({ message: "Placement drive created successfully", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create placement drive" });
  }
});

/* Module 2 - view posted drives */
router.get("/jobs", async (req, res) => {
  try {
    const recruiter = await getRecruiter(req.user.id);
    if (!recruiter) return res.status(404).json({ message: "Recruiter profile not found" });
    const [rows] = await db.query(
      `SELECT j.*, (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicants
       FROM jobs j WHERE j.recruiter_id = ? ORDER BY j.created_at DESC`,
      [recruiter.id]
    );
    res.json(rows.map((j) => ({ ...j, eligible_branches: parseBranches(j.eligible_branches), required_skills: parseSkillColumn(j.required_skills), company_name: recruiter.company_name })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load placement drives" });
  }
});

/* Suggest required skills from a title + description (used by the Job Posting form) */
router.post("/suggest-skills", (req, res) => {
  const { title, description } = req.body || {};
  res.json({ skills: inferSkillsFromRole(String(title || ""), String(description || "")) });
});

/* Open / close a drive */
router.patch("/jobs/:id/status", async (req, res) => {
  const status = String((req.body || {}).status || "").toUpperCase();
  if (!["OPEN", "CLOSED"].includes(status)) return res.status(400).json({ message: "Status must be OPEN or CLOSED" });
  try {
    const recruiter = await getRecruiter(req.user.id);
    const [result] = await db.query("UPDATE jobs SET status = ? WHERE id = ? AND recruiter_id = ?", [status, req.params.id, recruiter.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Placement drive not found" });
    res.json({ message: `Placement drive ${status === "OPEN" ? "reopened" : "closed"}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update placement drive" });
  }
});

/* Interview & Placement - applicants of one drive */
router.get("/jobs/:id/applications", async (req, res) => {
  try {
    const recruiter = await getRecruiter(req.user.id);
    const [jobs] = await db.query("SELECT id, title, description, min_cgpa, required_skills FROM jobs WHERE id = ? AND recruiter_id = ?", [req.params.id, recruiter.id]);
    if (!jobs[0]) return res.status(404).json({ message: "Placement drive not found" });

    const [rows] = await db.query(
      `SELECT a.id, a.status, a.applied_at, s.id AS student_id, u.name, u.email, s.phone, s.enrollment_no,
              s.branch, s.cgpa, s.backlogs, (s.resume_path IS NOT NULL) AS has_resume,
              s.skills, s.career_interests, s.resume_text
       FROM applications a
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       WHERE a.job_id = ? ORDER BY a.applied_at DESC`,
      [req.params.id]
    );
    // AI match score for every applicant against this drive (same engine students see)
    const scores = new Map(scoreApplicants(rows.map((r) => ({ ...r, id: r.student_id })), jobs[0]).map((x) => [x.student_id, x]));
    const applications = rows.map(({ resume_text, skills, career_interests, ...r }) => ({
      ...r, has_resume: !!r.has_resume, match: scores.get(r.student_id),
    }));
    res.json({ job: { id: jobs[0].id, title: jobs[0].title, required_skills: jobSkills(jobs[0]).skills }, applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load applicants" });
  }
});

/* Interview & Placement - shortlist / schedule interview / select / reject */
router.patch("/applications/:id/status", async (req, res) => {
  const status = String((req.body || {}).status || "").toUpperCase();
  if (!STATUSES.includes(status)) return res.status(400).json({ message: "Invalid application status" });
  try {
    const [rows] = await db.query(
      `SELECT a.id, j.title, su.id AS student_user_id
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN recruiters r ON r.id = j.recruiter_id
       JOIN students s ON s.id = a.student_id
       JOIN users su ON su.id = s.user_id
       WHERE a.id = ? AND r.user_id = ?`,
      [req.params.id, req.user.id]
    );
    const app = rows[0];
    if (!app) return res.status(404).json({ message: "Application not found" });

    await db.query("UPDATE applications SET status = ? WHERE id = ?", [status, app.id]);
    notify(app.student_user_id, `Your application for ${app.title} is now ${status.toLowerCase()}`);
    res.json({ message: "Application status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update status" });
  }
});

module.exports = router;
