# College Placement Management System (CPMS)

Practical 10 – Software Engineering (BTCO13702)

Web application for managing the placement process in a single portal.

| Layer | Technology |
| --- | --- |
| Frontend / UI | React.js (Vite), HTML, CSS, JavaScript |
| Backend | Node.js + Express.js (REST API) |
| Database | MySQL / MariaDB, managed with phpMyAdmin (XAMPP / WAMP) |
| Authentication | JWT (+ bcrypt password hashing) |

## Implemented modules

1. **Student Profile** – registration, profile view/update, branch, CGPA, backlogs, contact details, resume upload (PDF/DOC/DOCX, max 5 MB)
2. **Job Posting** – recruiter creates placement drives (title, description, package, min CGPA, eligible branches, max backlogs, location, drive date, deadline), views/closes posted drives
3. **Eligibility & Applications** – checks Branch + CGPA + Backlogs, shows only eligible drives, apply (re-checked on the server), track applications
4. **Authentication** – Sign Up, Login, Logout (JWT, role based: Student / Recruiter / TPO)

5. **Job Recommendations (new)** – ranks every open drive for each student by how well their skills, resume and interests fit, with an explanation (see below)

Also included so that every card on the home page opens a working page:
Interview & Placement (recruiter reviews applicants and sets status), Notifications, TPO Dashboard (statistics).

## What's new in this version

**Redesigned UI** – modern design system (cards, gradients, icons, responsive layout), light/dark mode toggle, notification bell with unread count, search/sort/filter, loading skeletons and empty states. Works on mobile.

**New features**

| Feature | Who | Where |
| --- | --- | --- |
| Job recommendations with match %, matched/missing skills and reasons | Student | AI Matches page + dashboard |
| Skills and career interests on the profile | Student | Profile |
| Resume reading (PDF/DOCX), skill detection, resume score and improvement tips | Student | Profile |
| Skills worth learning (most common missing skills across eligible drives) | Student | AI Matches |
| Save/bookmark drives, withdraw an application, search + sort + filters | Student | Jobs |
| Required skills on a drive, "Suggest from title" | Recruiter | Placement drives |
| Applicants ranked by AI match, with skill breakdown and status filter | Recruiter | Applicants |
| Branch-wise placement chart, student search, CSV export | TPO | Dashboard |

## How the AI matching works

The matcher runs **locally on your server, with no API key needed**. For each drive it combines four signals into a 0-100 score:

| Signal | Weight | How it is computed |
| --- | --- | --- |
| Skill match | 45% | Share of the drive's required skills found in the student's profile + resume (recruiter-listed skills, or inferred from the title/description) |
| Resume relevance | 25% | TF-IDF cosine similarity between the resume/skills text and the job description |
| Career interest | 10% | Overlap between the roles the student wants and the drive title |
| Academic fit | 20% | CGPA headroom above the drive's cut-off |

If a signal is unavailable (e.g. no resume yet) it is dropped and the others are re-weighted. Drives the student is not eligible for are scored at half and ranked lower. Every result lists matched skills, missing skills and plain-English reasons, so the ranking is explainable.

Career guidance is provided through local profile-strength checks, resume analysis, missing-skill summaries, and explainable job-match scores. No external LLM API key is required.

## Upgrading an existing database

Nothing to do: the API adds the new columns/tables automatically on start (you can also run `npm run db:migrate`). For a fresh install, `database/schema.sql` already includes them. After upgrading, run `npm install` in `backend` (new packages: `pdf-parse`, `mammoth`).

## Project structure

```
cpms/
├── database/schema.sql          MySQL tables
├── backend/                     Express REST API
│   ├── server.js
│   ├── scripts/initDb.js        creates DB + demo data
│   └── src/{config,middleware,routes,services,utils}   services/ = local recommendation matcher
└── frontend/                    React (Vite) UI
    └── src/{pages,components}
```

## Setup with XAMPP + phpMyAdmin (needs Node.js 18+)

### 1. Start MySQL
Open the **XAMPP Control Panel** and start **Apache** and **MySQL** (WAMP/Laragon work the same way).

### 2. Create the database in phpMyAdmin
1. Open http://localhost/phpmyadmin
2. Click the **Import** tab -> **Choose file** -> select `database/schema.sql` -> **Import**.
3. A database named `cpms` with 6 tables appears in the left panel.

### 3. Backend
```bash
cd backend
npm install
```
Open `backend/.env`. XAMPP defaults are already set (`DB_USER=root`, empty `DB_PASSWORD`). Only change `DB_PASSWORD` if you set a MySQL password, and set `JWT_SECRET` to any long random text.

Add the demo accounts (optional, recommended):
```bash
npm run db:init
```
Then start the API:
```bash
npm start            # http://localhost:5000
```

### 4. Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Open **http://localhost:5173**. You can watch the data appear in phpMyAdmin (tables `users`, `students`, `jobs`, `applications`...).

### Demo accounts (created by `npm run db:init`)

| Role | Email | Password |
| --- | --- | --- |
| Student | student@demo.com | Student@123 |
| Recruiter | recruiter@demo.com | Recruiter@123 |
| TPO | tpo@cpms.com | Admin@123 |

If you skip `db:init`, create Student/Recruiter accounts from the Signup page. The TPO account only exists through `db:init`.

## API summary

| Method | Endpoint | Role | Purpose |
| --- | --- | --- | --- |
| POST | /api/auth/register | public | Sign up |
| POST | /api/auth/login | public | Login, returns JWT |
| GET | /api/auth/me | any | Current user |
| GET / PUT | /api/students/profile | student | View / update profile |
| POST | /api/students/resume | student | Upload resume |
| GET | /api/students/:id/resume | student / recruiter / TPO | Download resume |
| POST | /api/recruiters/jobs | recruiter | Create placement drive |
| GET | /api/recruiters/jobs | recruiter | Posted drives |
| PATCH | /api/recruiters/jobs/:id/status | recruiter | Close / reopen drive |
| GET | /api/recruiters/jobs/:id/applications | recruiter | Applicants of a drive |
| PATCH | /api/recruiters/applications/:id/status | recruiter | Shortlist / interview / select / reject |
| GET | /api/jobs | any | Open drives |
| GET | /api/jobs/eligible | student | Drives the student is eligible for |
| POST | /api/jobs/:id/save | student | Save / unsave a drive |
| GET | /api/recommendations?all=1&limit=20 | student | AI-ranked drives, skills, resume analysis, profile strength |
| DELETE | /api/applications/:id | student | Withdraw an application (only while APPLIED) |
| POST | /api/recruiters/suggest-skills | recruiter | Suggest required skills from a title/description |
| POST | /api/applications/:jobId/apply | student | Apply to a drive |
| GET | /api/applications/my | student | My applications |
| GET | /api/notifications | any | Notifications |
| GET | /api/admin/stats, /applications, /students | TPO | Dashboard data |

## Eligibility example

Student: Computer Engineering, CGPA 8.00, 0 backlogs
Job: Computer Engineering / IT, min CGPA 7.00, max backlogs 2 → ✓ Eligible
