const express = require("express");
const db = require("../config/db");
const { auth, requireRole } = require("../middleware/auth");
const { checkEligibility } = require("../utils/eligibility");
const { notify } = require("../utils/notify");

const router = express.Router();

/* Module 3 - my applications */
router.get("/my", auth, requireRole("STUDENT"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.job_id, a.status, a.applied_at,
              j.title, j.package_lpa, j.location, j.drive_date, r.company_name
       FROM applications a
       JOIN students s ON s.id = a.student_id
       JOIN jobs j ON j.id = a.job_id
       JOIN recruiters r ON r.id = j.recruiter_id
       WHERE s.user_id = ?
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load applications" });
  }
});

/* Module 3 - apply to a drive (eligibility is re-checked on the server) */
router.post("/:jobId/apply", auth, requireRole("STUDENT"), async (req, res) => {
  try {
    const [students] = await db.query("SELECT id, branch, cgpa, backlogs FROM students WHERE user_id = ?", [req.user.id]);
    const student = students[0];
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const [jobs] = await db.query(
      `SELECT j.*, r.user_id AS recruiter_user_id
       FROM jobs j JOIN recruiters r ON r.id = j.recruiter_id WHERE j.id = ?`,
      [req.params.jobId]
    );
    const job = jobs[0];
    if (!job) return res.status(404).json({ message: "Placement drive not found" });
    if (job.status !== "OPEN") return res.status(400).json({ message: "This placement drive is closed" });

    if (job.application_deadline) {
      const today = new Date().toISOString().slice(0, 10);
      if (job.application_deadline < today) return res.status(400).json({ message: "The application deadline has passed" });
    }

    const result = checkEligibility(student, job);
    if (!result.eligible) {
      return res.status(403).json({ message: "You are not eligible for this drive", reasons: result.reasons });
    }

    await db.query("INSERT INTO applications (student_id, job_id, status) VALUES (?, ?, ?)", [student.id, job.id, "APPLIED"]);

    notify(job.recruiter_user_id, `${req.user.name} applied for ${job.title}`);
    notify(req.user.id, `Your application for ${job.title} was submitted`);
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "You have already applied for this drive" });
    console.error(err);
    res.status(500).json({ message: "Could not submit application" });
  }
});

/* Withdraw an application (only while it is still in the APPLIED stage) */
router.delete("/:id", auth, requireRole("STUDENT"), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.status, j.title, r.user_id AS recruiter_user_id
       FROM applications a JOIN students s ON s.id = a.student_id
       JOIN jobs j ON j.id = a.job_id JOIN recruiters r ON r.id = j.recruiter_id
       WHERE a.id = ? AND s.user_id = ?`,
      [req.params.id, req.user.id]
    );
    const app = rows[0];
    if (!app) return res.status(404).json({ message: "Application not found" });
    if (app.status !== "APPLIED") return res.status(400).json({ message: "Only applications that have not been reviewed yet can be withdrawn" });
    await db.query("DELETE FROM applications WHERE id = ?", [app.id]);
    notify(app.recruiter_user_id, `${req.user.name} withdrew their application for ${app.title}`);
    res.json({ message: "Application withdrawn" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not withdraw application" });
  }
});

module.exports = router;
