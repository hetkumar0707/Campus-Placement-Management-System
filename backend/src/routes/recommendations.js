const express = require("express");
const db = require("../config/db");
const path = require("path");
const { auth, requireRole } = require("../middleware/auth");
const { uploadDir } = require("../middleware/upload");
const { checkEligibility, parseBranches } = require("../utils/eligibility");
const { extractResumeText } = require("../utils/resumeParser");
const { analyzeResume } = require("../utils/resumeAnalysis");
const { recommend, profileStrength } = require("../services/recommender");

const router = express.Router();
router.use(auth, requireRole("STUDENT"));

const STUDENT_SQL = `
  SELECT s.id, s.user_id, u.name, s.branch, s.cgpa, s.backlogs, s.phone, s.graduation_year, s.skills,
         s.career_interests, s.resume_path, s.resume_text, (s.resume_path IS NOT NULL) AS has_resume
  FROM students s JOIN users u ON u.id = s.user_id WHERE s.user_id = ?`;

// Older resumes (uploaded before this feature) have no stored text yet: read them once, on demand.
async function ensureResumeText(student) {
  if (student.resume_text || !student.resume_path) return student;
  const text = await extractResumeText(path.join(uploadDir, path.basename(student.resume_path)));
  if (text) {
    await db.query("UPDATE students SET resume_text = ?, resume_analyzed_at = NOW() WHERE id = ?", [text, student.id]);
    student.resume_text = text;
  }
  return student;
}

async function build(userId, { includeIneligible }) {
  const [rows] = await db.query(STUDENT_SQL, [userId]);
  let student = rows[0];
  if (!student) return null;
  student = await ensureResumeText(student);

  const [jobs] = await db.query(
    `SELECT j.*, r.company_name FROM jobs j JOIN recruiters r ON r.id = j.recruiter_id
     WHERE j.status = 'OPEN' AND (j.application_deadline IS NULL OR j.application_deadline >= CURDATE())`
  );
  const [apps] = await db.query("SELECT job_id, status FROM applications WHERE student_id = ?", [student.id]);
  const applied = new Map(apps.map((a) => [a.job_id, a.status]));

  const shaped = jobs.map((j) => {
    const elig = checkEligibility(student, j);
    return { ...j, eligible_branches: parseBranches(j.eligible_branches), eligible: elig.eligible, reasons: elig.reasons, applied: applied.has(j.id), application_status: applied.get(j.id) || null };
  });

  const { results, skills } = recommend(student, shaped);
  const byId = new Map(results.map((r) => [r.job_id, r]));
  let ranked = shaped.map((j) => ({ ...j, match: byId.get(j.id) }));
  if (!includeIneligible) ranked = ranked.filter((j) => j.eligible);
  ranked.sort((a, b) => b.match.score - a.match.score || Number(b.package_lpa) - Number(a.package_lpa));

  const resume = student.resume_text ? analyzeResume(student.resume_text, student) : null;
  const strength = profileStrength(student, skills, resume);

  // How often each missing skill shows up across the drives the student is eligible for: a ready-made learning list
  const demand = new Map();
  for (const j of shaped.filter((x) => x.eligible)) for (const s of byId.get(j.id).missing_skills) demand.set(s, (demand.get(s) || 0) + 1);
  const skill_gaps = [...demand.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([skill, drives]) => ({ skill, drives }));

  return { student, skills, resume, strength, ranked, skill_gaps };
}

/* GET /api/recommendations?all=1&limit=20 */
router.get("/", async (req, res) => {
  try {
    const data = await build(req.user.id, { includeIneligible: req.query.all === "1" });
    if (!data) return res.status(404).json({ message: "Student profile not found" });
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    res.json({
      profile_strength: data.strength,
      skills: data.skills,
      resume: data.resume ? { has_text: true, ...data.resume } : { has_text: false, has_file: !!data.student.has_resume },
      skill_gaps: data.skill_gaps,
      recommendations: data.ranked.slice(0, limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not generate recommendations" });
  }
});


module.exports = router;
