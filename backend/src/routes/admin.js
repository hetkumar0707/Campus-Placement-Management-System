const express = require("express");
const db = require("../config/db");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(auth, requireRole("TPO"));

/* TPO Dashboard - placement statistics */
router.get("/stats", async (req, res) => {
  try {
    const [[counts]] = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM students)     AS students,
         (SELECT COUNT(*) FROM recruiters)   AS recruiters,
         (SELECT COUNT(*) FROM jobs)         AS jobs,
         (SELECT COUNT(*) FROM applications) AS applications,
         (SELECT COUNT(DISTINCT student_id) FROM applications WHERE status = 'SELECTED') AS placed`
    );
    const [byStatus] = await db.query("SELECT status, COUNT(*) AS count FROM applications GROUP BY status");
    const [byBranch] = await db.query(
      `SELECT s.branch, COUNT(*) AS students,
              SUM(EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.status = 'SELECTED')) AS placed
       FROM students s GROUP BY s.branch ORDER BY students DESC`
    );
    const placementRate = counts.students ? Math.round((counts.placed / counts.students) * 1000) / 10 : 0;
    res.json({ ...counts, placement_rate: placementRate, by_status: byStatus, by_branch: byBranch.map((b) => ({ branch: b.branch, students: Number(b.students), placed: Number(b.placed) })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load statistics" });
  }
});

router.get("/applications", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.status, a.applied_at, u.name AS student_name, s.enrollment_no, s.branch,
              j.title, r.company_name
       FROM applications a
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       JOIN jobs j ON j.id = a.job_id
       JOIN recruiters r ON r.id = j.recruiter_id
       ORDER BY a.applied_at DESC LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load applications" });
  }
});

router.get("/students", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.id, u.name, u.email, s.enrollment_no, s.branch, s.cgpa, s.backlogs,
              EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.status = 'SELECTED') AS placed
       FROM students s JOIN users u ON u.id = s.user_id ORDER BY u.name`
    );
    res.json(rows.map((r) => ({ ...r, placed: !!r.placed })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load students" });
  }
});

module.exports = router;
