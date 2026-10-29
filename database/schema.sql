-- College Placement Management System (CPMS) - MySQL schema
CREATE DATABASE IF NOT EXISTS cpms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cpms;

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('STUDENT','RECRUITER','TPO') NOT NULL DEFAULT 'STUDENT',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS students (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL UNIQUE,
  phone           VARCHAR(20),
  enrollment_no   VARCHAR(50),
  branch          VARCHAR(100) NOT NULL,
  cgpa            DECIMAL(4,2) NOT NULL DEFAULT 0,
  backlogs        INT NOT NULL DEFAULT 0,
  graduation_year INT,
  resume_path     VARCHAR(255),
  resume_original VARCHAR(255),
  skills          TEXT,                 -- JSON array typed by the student, e.g. ["Python","SQL"]
  career_interests VARCHAR(255),        -- comma separated, e.g. "Data Analyst, Machine Learning"
  resume_text     MEDIUMTEXT,           -- text extracted from the uploaded resume (used by AI matching)
  resume_analyzed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recruiters (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL UNIQUE,
  company_name VARCHAR(150) NOT NULL,
  phone        VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jobs (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  recruiter_id         INT NOT NULL,
  title                VARCHAR(150) NOT NULL,
  description          TEXT,
  package_lpa          DECIMAL(6,2) NOT NULL DEFAULT 0,
  min_cgpa             DECIMAL(4,2) NOT NULL DEFAULT 0,
  eligible_branches    TEXT NOT NULL,
  max_backlogs         INT NOT NULL DEFAULT 0,
  location             VARCHAR(150),
  drive_date           DATE,
  application_deadline DATE,
  required_skills      TEXT,            -- JSON array, e.g. ["Java","Spring","SQL"] (used by AI matching)
  status               ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS applications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  job_id     INT NOT NULL,
  status     ENUM('APPLIED','SHORTLISTED','INTERVIEW','SELECTED','REJECTED') NOT NULL DEFAULT 'APPLIED',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_job (student_id, job_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  message    VARCHAR(255) NOT NULL,
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bookmarked drives (students can save drives to look at later)
CREATE TABLE IF NOT EXISTS saved_jobs (
  student_id INT NOT NULL,
  job_id     INT NOT NULL,
  saved_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, job_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;
