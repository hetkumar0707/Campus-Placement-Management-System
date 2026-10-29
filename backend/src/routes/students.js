const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../config/db");
const { auth, requireRole } = require("../middleware/auth");
const { resumeUpload, uploadDir } = require("../middleware/upload");
const { extractResumeText } = require("../utils/resumeParser");
const { analyzeResume } = require("../utils/resumeAnalysis");
const { normalizeSkillList, parseSkillColumn } = require("../utils/skills");

const router = express.Router();

const PROFILE_SQL = `
  SELECT s.id, s.user_id, u.name, u.email, s.phone, s.enrollment_no, s.branch, s.cgpa,
         s.backlogs, s.graduation_year, s.resume_original, s.skills, s.career_interests,
         (s.resume_path IS NOT NULL) AS has_resume
  FROM students s JOIN users u ON u.id = s.user_id
  WHERE s.user_id = ?`;

const shape = (r) => ({ ...r, has_resume: !!r.has_resume, skills: parseSkillColumn(r.skills), career_interests: r.career_interests || "" });

/* Module 1 - Student Profile: view */
router.get("/profile", auth, requireRole("STUDENT"), async (req, res) => {
  try {
    const [rows] = await db.query(PROFILE_SQL, [req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: "Student profile not found" });
    res.json(shape(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load profile" });
  }
});

/* Module 1 - Student Profile: update */
router.put("/profile", auth, requireRole("STUDENT"), async (req, res) => {
  const b = req.body || {};
  const name = String(b.name || "").trim();
  const branch = String(b.branch || "").trim();
  const cgpa = Number(b.cgpa);
  const backlogs = Number(b.backlogs === "" || b.backlogs == null ? 0 : b.backlogs);

  if (!name) return res.status(400).json({ message: "Name is required" });
  if (!branch) return res.status(400).json({ message: "Branch is required" });
  if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
    return res.status(400).json({ message: "CGPA must be a number between 0 and 10" });
  }
  if (!Number.isInteger(backlogs) || backlogs < 0) {
    return res.status(400).json({ message: "Backlogs must be 0 or more" });
  }

  try {
    await db.query("UPDATE users SET name = ? WHERE id = ?", [name, req.user.id]);
    await db.query(
      "UPDATE students SET phone = ?, enrollment_no = ?, branch = ?, cgpa = ?, backlogs = ?, skills = ?, career_interests = ? WHERE user_id = ?",
      [String(b.phone || "").trim(), String(b.enrollment_no || "").trim(), branch, cgpa, backlogs,
       JSON.stringify(normalizeSkillList(b.skills)), String(b.career_interests || "").trim().slice(0, 255), req.user.id]
    );
    const [rows] = await db.query(PROFILE_SQL, [req.user.id]);
    res.json({ message: "Profile saved successfully", profile: shape(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not save profile" });
  }
});

/* Module 1 - Resume upload (PDF/DOC/DOCX, max 5 MB) */
function handleResumeUpload(req, res, next) {
  resumeUpload.single("resume")(req, res, (err) => {
    if (err) {
      const message = err.code === "LIMIT_FILE_SIZE" ? "Resume must be 5 MB or smaller" : err.message;
      return res.status(400).json({ message });
    }
    next();
  });
}

router.post("/resume", auth, requireRole("STUDENT"), handleResumeUpload, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Please choose a resume file" });
  try {
    const [rows] = await db.query("SELECT resume_path FROM students WHERE user_id = ?", [req.user.id]);
    const old = rows[0] && rows[0].resume_path;
    // Read the resume text so the AI matcher can use it (PDF and DOCX; legacy .doc cannot be read)
    const text = await extractResumeText(req.file.path);
    await db.query(
      "UPDATE students SET resume_path = ?, resume_original = ?, resume_text = ?, resume_analyzed_at = NOW() WHERE user_id = ?",
      [req.file.filename, req.file.originalname, text || null, req.user.id]
    );
    if (old) fs.unlink(path.join(uploadDir, old), () => {});
    res.json({
      message: text ? "Resume uploaded and analysed" : "Resume uploaded, but its text could not be read for AI matching (use a text-based PDF or DOCX)",
      resume_original: req.file.originalname,
      analysis: text ? analyzeResume(text) : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not save resume" });
  }
});

/* Download a resume: the student themself, the TPO, or a recruiter who received the student's application */
router.get("/:id/resume", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT user_id, resume_path, resume_original FROM students WHERE id = ?", [req.params.id]);
    const s = rows[0];
    if (!s || !s.resume_path) return res.status(404).json({ message: "No resume uploaded" });

    let allowed = req.user.role === "TPO" || (req.user.role === "STUDENT" && s.user_id === req.user.id);
    if (!allowed && req.user.role === "RECRUITER") {
      const [r] = await db.query(
        `SELECT 1 FROM applications a
         JOIN jobs j ON j.id = a.job_id
         JOIN recruiters rc ON rc.id = j.recruiter_id
         WHERE a.student_id = ? AND rc.user_id = ? LIMIT 1`,
        [req.params.id, req.user.id]
      );
      allowed = r.length > 0;
    }
    if (!allowed) return res.status(403).json({ message: "You do not have access to this resume" });

    const file = path.join(uploadDir, path.basename(s.resume_path));
    if (!fs.existsSync(file)) return res.status(404).json({ message: "Resume file is missing" });
    res.download(file, s.resume_original || path.basename(file));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not download resume" });
  }
});

module.exports = router;
