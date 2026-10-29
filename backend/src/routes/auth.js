const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { auth } = require("../middleware/auth");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

/* ---------------- Sign Up ---------------- */
router.post("/register", async (req, res) => {
  const body = req.body || {};
  const role = String(body.role || "STUDENT").toUpperCase();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!["STUDENT", "RECRUITER"].includes(role)) {
    return res.status(400).json({ message: "Account type must be Student or Recruiter" });
  }
  if (!name) return res.status(400).json({ message: "Name is required" });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

  let student = null;
  let recruiter = null;

  if (role === "STUDENT") {
    const branch = String(body.branch || "").trim();
    const cgpa = Number(body.cgpa);
    const backlogs = Number(body.backlogs === "" || body.backlogs == null ? 0 : body.backlogs);
    const gradYear = body.graduation_year ? Number(body.graduation_year) : null;

    if (!branch) return res.status(400).json({ message: "Branch is required" });
    if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
      return res.status(400).json({ message: "CGPA must be a number between 0 and 10" });
    }
    if (!Number.isInteger(backlogs) || backlogs < 0) {
      return res.status(400).json({ message: "Backlogs must be 0 or more" });
    }
    if (gradYear !== null && (!Number.isInteger(gradYear) || gradYear < 2000 || gradYear > 2100)) {
      return res.status(400).json({ message: "Enter a valid graduation year" });
    }
    student = {
      phone: String(body.phone || "").trim(),
      enrollment_no: String(body.enrollment_no || "").trim(),
      branch,
      cgpa,
      backlogs,
      graduation_year: gradYear,
    };
  } else {
    const company = String(body.company_name || "").trim();
    if (!company) return res.status(400).json({ message: "Company name is required" });
    recruiter = { company_name: company, phone: String(body.phone || "").trim() };
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(password, 10);
    const [result] = await conn.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, hash, role]
    );
    const userId = result.insertId;

    if (student) {
      await conn.query(
        `INSERT INTO students (user_id, phone, enrollment_no, branch, cgpa, backlogs, graduation_year)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, student.phone, student.enrollment_no, student.branch, student.cgpa, student.backlogs, student.graduation_year]
      );
    } else {
      await conn.query("INSERT INTO recruiters (user_id, company_name, phone) VALUES (?, ?, ?)", [
        userId,
        recruiter.company_name,
        recruiter.phone,
      ]);
    }
    await conn.commit();

    const user = { id: userId, name, email, role };
    res.status(201).json({ message: "Account created successfully", token: signToken(user), user: publicUser(user) });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "An account with this email already exists" });
    console.error(err);
    res.status(500).json({ message: "Could not create account" });
  } finally {
    conn.release();
  }
});

/* ---------------- Login ---------------- */
router.post("/login", async (req, res) => {
  const email = String((req.body || {}).email || "").trim().toLowerCase();
  const password = String((req.body || {}).password || "");
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

/* ---------------- Current user ---------------- */
router.get("/me", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load user" });
  }
});

// Logout is handled on the client by deleting the JWT. This endpoint exists for completeness.
router.post("/logout", auth, (req, res) => res.json({ message: "Logged out" }));

module.exports = router;
