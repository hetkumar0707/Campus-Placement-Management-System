-- CPMS sample data based on the uploaded database/schema.sql
-- Adds 10 student profiles, 10 recruiter profiles, 70 jobs (10 per branch),
-- at least 10 applications and 10 notifications. Safe to re-run for users/profiles/jobs.
-- Demo password for all seeded accounts: password
-- Hash is bcrypt-compatible; change demo passwords after local testing.
CREATE DATABASE IF NOT EXISTS cpms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cpms;

START TRANSACTION;

-- 1) Create TPO, recruiter and student users. Existing emails are preserved.
INSERT INTO users (name, email, password_hash, role) VALUES
('Placement Officer Demo','tpo-seed@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','TPO')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO users (name, email, password_hash, role) VALUES
('Apex Software Labs Recruiter','recruiter1@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','RECRUITER'),
('BlueOrbit Technologies Recruiter','recruiter2@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','RECRUITER'),
('CodeCraft Solutions Recruiter','recruiter3@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','RECRUITER'),
('DataNova Analytics Recruiter','recruiter4@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','RECRUITER'),
('Elevate Systems Recruiter','recruiter5@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','RECRUITER'),
('FutureStack Tech Recruiter','recruiter6@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','RECRUITER'),
('GreenByte Digital Recruiter','recruiter7@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','RECRUITER'),
('HexaCore Systems Recruiter','recruiter8@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','RECRUITER'),
('InfiSpark Technologies Recruiter','recruiter9@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','RECRUITER'),
('Jupiter TechWorks Recruiter','recruiter10@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','RECRUITER'),
('Aarav Shah','student1@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','STUDENT'),
('Diya Patel','student2@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','STUDENT'),
('Vivaan Mehta','student3@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','STUDENT'),
('Anaya Desai','student4@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','STUDENT'),
('Ishaan Joshi','student5@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','STUDENT'),
('Myra Trivedi','student6@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','STUDENT'),
('Reyansh Patel','student7@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','STUDENT'),
('Sara Shah','student8@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','STUDENT'),
('Krish Gandhi','student9@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','STUDENT'),
('Ira Modi','student10@cpms-demo.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','STUDENT')
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- 2) Recruiter profiles (10 records).
INSERT INTO recruiters (user_id, company_name, phone)
SELECT id, 'Apex Software Labs', '9000000001'
FROM users WHERE email = 'recruiter1@cpms-demo.com'
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), phone = VALUES(phone);
INSERT INTO recruiters (user_id, company_name, phone)
SELECT id, 'BlueOrbit Technologies', '9000000002'
FROM users WHERE email = 'recruiter2@cpms-demo.com'
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), phone = VALUES(phone);
INSERT INTO recruiters (user_id, company_name, phone)
SELECT id, 'CodeCraft Solutions', '9000000003'
FROM users WHERE email = 'recruiter3@cpms-demo.com'
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), phone = VALUES(phone);
INSERT INTO recruiters (user_id, company_name, phone)
SELECT id, 'DataNova Analytics', '9000000004'
FROM users WHERE email = 'recruiter4@cpms-demo.com'
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), phone = VALUES(phone);
INSERT INTO recruiters (user_id, company_name, phone)
SELECT id, 'Elevate Systems', '9000000005'
FROM users WHERE email = 'recruiter5@cpms-demo.com'
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), phone = VALUES(phone);
INSERT INTO recruiters (user_id, company_name, phone)
SELECT id, 'FutureStack Tech', '9000000006'
FROM users WHERE email = 'recruiter6@cpms-demo.com'
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), phone = VALUES(phone);
INSERT INTO recruiters (user_id, company_name, phone)
SELECT id, 'GreenByte Digital', '9000000007'
FROM users WHERE email = 'recruiter7@cpms-demo.com'
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), phone = VALUES(phone);
INSERT INTO recruiters (user_id, company_name, phone)
SELECT id, 'HexaCore Systems', '9000000008'
FROM users WHERE email = 'recruiter8@cpms-demo.com'
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), phone = VALUES(phone);
INSERT INTO recruiters (user_id, company_name, phone)
SELECT id, 'InfiSpark Technologies', '9000000009'
FROM users WHERE email = 'recruiter9@cpms-demo.com'
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), phone = VALUES(phone);
INSERT INTO recruiters (user_id, company_name, phone)
SELECT id, 'Jupiter TechWorks', '9000000010'
FROM users WHERE email = 'recruiter10@cpms-demo.com'
ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), phone = VALUES(phone);

-- 3) Student profiles (10 records).
INSERT INTO students (user_id, phone, enrollment_no, branch, cgpa, backlogs, graduation_year)
SELECT id, '9100000001', 'CE2027001', 'Computer Engineering', 8.40, 0, 2027
FROM users WHERE email = 'student1@cpms-demo.com'
ON DUPLICATE KEY UPDATE branch = VALUES(branch), cgpa = VALUES(cgpa), graduation_year = VALUES(graduation_year);
INSERT INTO students (user_id, phone, enrollment_no, branch, cgpa, backlogs, graduation_year)
SELECT id, '9100000002', 'CE2027002', 'Computer Engineering', 7.80, 0, 2027
FROM users WHERE email = 'student2@cpms-demo.com'
ON DUPLICATE KEY UPDATE branch = VALUES(branch), cgpa = VALUES(cgpa), graduation_year = VALUES(graduation_year);
INSERT INTO students (user_id, phone, enrollment_no, branch, cgpa, backlogs, graduation_year)
SELECT id, '9100000003', 'IT2027003', 'Information Technology', 8.10, 0, 2027
FROM users WHERE email = 'student3@cpms-demo.com'
ON DUPLICATE KEY UPDATE branch = VALUES(branch), cgpa = VALUES(cgpa), graduation_year = VALUES(graduation_year);
INSERT INTO students (user_id, phone, enrollment_no, branch, cgpa, backlogs, graduation_year)
SELECT id, '9100000004', 'IT2027004', 'Information Technology', 8.70, 0, 2027
FROM users WHERE email = 'student4@cpms-demo.com'
ON DUPLICATE KEY UPDATE branch = VALUES(branch), cgpa = VALUES(cgpa), graduation_year = VALUES(graduation_year);
INSERT INTO students (user_id, phone, enrollment_no, branch, cgpa, backlogs, graduation_year)
SELECT id, '9100000005', 'AIDS2027005', 'Artificial Intelligence & Data Science', 8.90, 0, 2027
FROM users WHERE email = 'student5@cpms-demo.com'
ON DUPLICATE KEY UPDATE branch = VALUES(branch), cgpa = VALUES(cgpa), graduation_year = VALUES(graduation_year);
INSERT INTO students (user_id, phone, enrollment_no, branch, cgpa, backlogs, graduation_year)
SELECT id, '9100000006', 'EC2027006', 'Electronics & Communication', 7.60, 0, 2027
FROM users WHERE email = 'student6@cpms-demo.com'
ON DUPLICATE KEY UPDATE branch = VALUES(branch), cgpa = VALUES(cgpa), graduation_year = VALUES(graduation_year);
INSERT INTO students (user_id, phone, enrollment_no, branch, cgpa, backlogs, graduation_year)
SELECT id, '9100000007', 'EE2027007', 'Electrical Engineering', 7.40, 0, 2027
FROM users WHERE email = 'student7@cpms-demo.com'
ON DUPLICATE KEY UPDATE branch = VALUES(branch), cgpa = VALUES(cgpa), graduation_year = VALUES(graduation_year);
INSERT INTO students (user_id, phone, enrollment_no, branch, cgpa, backlogs, graduation_year)
SELECT id, '9100000008', 'ME2027008', 'Mechanical Engineering', 8.00, 0, 2027
FROM users WHERE email = 'student8@cpms-demo.com'
ON DUPLICATE KEY UPDATE branch = VALUES(branch), cgpa = VALUES(cgpa), graduation_year = VALUES(graduation_year);
INSERT INTO students (user_id, phone, enrollment_no, branch, cgpa, backlogs, graduation_year)
SELECT id, '9100000009', 'MCA2027009', 'MCA', 8.30, 0, 2027
FROM users WHERE email = 'student9@cpms-demo.com'
ON DUPLICATE KEY UPDATE branch = VALUES(branch), cgpa = VALUES(cgpa), graduation_year = VALUES(graduation_year);
INSERT INTO students (user_id, phone, enrollment_no, branch, cgpa, backlogs, graduation_year)
SELECT id, '9100000010', 'AIDS2027010', 'Artificial Intelligence & Data Science', 9.10, 0, 2027
FROM users WHERE email = 'student10@cpms-demo.com'
ON DUPLICATE KEY UPDATE branch = VALUES(branch), cgpa = VALUES(cgpa), graduation_year = VALUES(graduation_year);

-- 4) Jobs: 10 for each branch, 70 total. Each job is tied to a recruiter.
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Software Engineer Intern - Computer Engineering - 01', 'Build and maintain web applications and REST APIs.', 6.00, 6.00, '["Computer Engineering"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter1@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Software Engineer Intern - Computer Engineering - 01');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Full Stack Developer - Computer Engineering - 02', 'Develop responsive user interfaces and backend services.', 7.20, 6.25, '["Computer Engineering"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 21 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter2@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Full Stack Developer - Computer Engineering - 02');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Python Developer - Computer Engineering - 03', 'Write Python services, scripts and automated tests.', 5.50, 6.50, '["Computer Engineering"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 22 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter3@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Python Developer - Computer Engineering - 03');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Data Analyst - Computer Engineering - 04', 'Prepare datasets, build dashboards and report insights.', 5.00, 6.75, '["Computer Engineering"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 23 DAY), DATE_ADD(CURDATE(), INTERVAL 13 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter4@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Data Analyst - Computer Engineering - 04');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Machine Learning Intern - Computer Engineering - 05', 'Support model training, evaluation and feature engineering.', 6.50, 6.00, '["Computer Engineering"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 24 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter5@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Machine Learning Intern - Computer Engineering - 05');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'QA Automation Engineer - Computer Engineering - 06', 'Create and maintain automated software tests.', 4.80, 6.25, '["Computer Engineering"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 25 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter6@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'QA Automation Engineer - Computer Engineering - 06');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cloud Support Associate - Computer Engineering - 07', 'Assist with cloud deployment, monitoring and troubleshooting.', 5.20, 6.50, '["Computer Engineering"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 26 DAY), DATE_ADD(CURDATE(), INTERVAL 16 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter7@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cloud Support Associate - Computer Engineering - 07');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cybersecurity Analyst Intern - Computer Engineering - 08', 'Review logs, identify suspicious activity and document findings.', 5.80, 6.75, '["Computer Engineering"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 27 DAY), DATE_ADD(CURDATE(), INTERVAL 17 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter8@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cybersecurity Analyst Intern - Computer Engineering - 08');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Java Developer Trainee - Computer Engineering - 09', 'Develop Java modules and participate in code reviews.', 5.00, 6.00, '["Computer Engineering"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 28 DAY), DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter9@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Java Developer Trainee - Computer Engineering - 09');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'UI Developer Intern - Computer Engineering - 10', 'Implement accessible, responsive web interfaces.', 4.50, 6.25, '["Computer Engineering"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 29 DAY), DATE_ADD(CURDATE(), INTERVAL 19 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter10@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'UI Developer Intern - Computer Engineering - 10');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Software Engineer Intern - Information Technology - 01', 'Build and maintain web applications and REST APIs.', 6.00, 6.00, '["Information Technology"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter2@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Software Engineer Intern - Information Technology - 01');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Full Stack Developer - Information Technology - 02', 'Develop responsive user interfaces and backend services.', 7.20, 6.25, '["Information Technology"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 21 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter3@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Full Stack Developer - Information Technology - 02');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Python Developer - Information Technology - 03', 'Write Python services, scripts and automated tests.', 5.50, 6.50, '["Information Technology"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 22 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter4@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Python Developer - Information Technology - 03');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Data Analyst - Information Technology - 04', 'Prepare datasets, build dashboards and report insights.', 5.00, 6.75, '["Information Technology"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 23 DAY), DATE_ADD(CURDATE(), INTERVAL 13 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter5@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Data Analyst - Information Technology - 04');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Machine Learning Intern - Information Technology - 05', 'Support model training, evaluation and feature engineering.', 6.50, 6.00, '["Information Technology"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 24 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter6@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Machine Learning Intern - Information Technology - 05');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'QA Automation Engineer - Information Technology - 06', 'Create and maintain automated software tests.', 4.80, 6.25, '["Information Technology"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 25 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter7@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'QA Automation Engineer - Information Technology - 06');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cloud Support Associate - Information Technology - 07', 'Assist with cloud deployment, monitoring and troubleshooting.', 5.20, 6.50, '["Information Technology"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 26 DAY), DATE_ADD(CURDATE(), INTERVAL 16 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter8@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cloud Support Associate - Information Technology - 07');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cybersecurity Analyst Intern - Information Technology - 08', 'Review logs, identify suspicious activity and document findings.', 5.80, 6.75, '["Information Technology"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 27 DAY), DATE_ADD(CURDATE(), INTERVAL 17 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter9@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cybersecurity Analyst Intern - Information Technology - 08');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Java Developer Trainee - Information Technology - 09', 'Develop Java modules and participate in code reviews.', 5.00, 6.00, '["Information Technology"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 28 DAY), DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter10@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Java Developer Trainee - Information Technology - 09');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'UI Developer Intern - Information Technology - 10', 'Implement accessible, responsive web interfaces.', 4.50, 6.25, '["Information Technology"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 29 DAY), DATE_ADD(CURDATE(), INTERVAL 19 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter1@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'UI Developer Intern - Information Technology - 10');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Software Engineer Intern - Artificial Intelligence & Data Science - 01', 'Build and maintain web applications and REST APIs.', 6.00, 6.00, '["Artificial Intelligence & Data Science"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter3@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Software Engineer Intern - Artificial Intelligence & Data Science - 01');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Full Stack Developer - Artificial Intelligence & Data Science - 02', 'Develop responsive user interfaces and backend services.', 7.20, 6.25, '["Artificial Intelligence & Data Science"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 21 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter4@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Full Stack Developer - Artificial Intelligence & Data Science - 02');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Python Developer - Artificial Intelligence & Data Science - 03', 'Write Python services, scripts and automated tests.', 5.50, 6.50, '["Artificial Intelligence & Data Science"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 22 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter5@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Python Developer - Artificial Intelligence & Data Science - 03');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Data Analyst - Artificial Intelligence & Data Science - 04', 'Prepare datasets, build dashboards and report insights.', 5.00, 6.75, '["Artificial Intelligence & Data Science"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 23 DAY), DATE_ADD(CURDATE(), INTERVAL 13 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter6@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Data Analyst - Artificial Intelligence & Data Science - 04');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Machine Learning Intern - Artificial Intelligence & Data Science - 05', 'Support model training, evaluation and feature engineering.', 6.50, 6.00, '["Artificial Intelligence & Data Science"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 24 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter7@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Machine Learning Intern - Artificial Intelligence & Data Science - 05');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'QA Automation Engineer - Artificial Intelligence & Data Science - 06', 'Create and maintain automated software tests.', 4.80, 6.25, '["Artificial Intelligence & Data Science"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 25 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter8@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'QA Automation Engineer - Artificial Intelligence & Data Science - 06');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cloud Support Associate - Artificial Intelligence & Data Science - 07', 'Assist with cloud deployment, monitoring and troubleshooting.', 5.20, 6.50, '["Artificial Intelligence & Data Science"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 26 DAY), DATE_ADD(CURDATE(), INTERVAL 16 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter9@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cloud Support Associate - Artificial Intelligence & Data Science - 07');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cybersecurity Analyst Intern - Artificial Intelligence & Data Science - 08', 'Review logs, identify suspicious activity and document findings.', 5.80, 6.75, '["Artificial Intelligence & Data Science"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 27 DAY), DATE_ADD(CURDATE(), INTERVAL 17 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter10@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cybersecurity Analyst Intern - Artificial Intelligence & Data Science - 08');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Java Developer Trainee - Artificial Intelligence & Data Science - 09', 'Develop Java modules and participate in code reviews.', 5.00, 6.00, '["Artificial Intelligence & Data Science"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 28 DAY), DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter1@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Java Developer Trainee - Artificial Intelligence & Data Science - 09');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'UI Developer Intern - Artificial Intelligence & Data Science - 10', 'Implement accessible, responsive web interfaces.', 4.50, 6.25, '["Artificial Intelligence & Data Science"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 29 DAY), DATE_ADD(CURDATE(), INTERVAL 19 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter2@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'UI Developer Intern - Artificial Intelligence & Data Science - 10');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Software Engineer Intern - Electronics & Communication - 01', 'Build and maintain web applications and REST APIs.', 6.00, 6.00, '["Electronics & Communication"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter4@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Software Engineer Intern - Electronics & Communication - 01');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Full Stack Developer - Electronics & Communication - 02', 'Develop responsive user interfaces and backend services.', 7.20, 6.25, '["Electronics & Communication"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 21 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter5@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Full Stack Developer - Electronics & Communication - 02');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Python Developer - Electronics & Communication - 03', 'Write Python services, scripts and automated tests.', 5.50, 6.50, '["Electronics & Communication"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 22 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter6@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Python Developer - Electronics & Communication - 03');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Data Analyst - Electronics & Communication - 04', 'Prepare datasets, build dashboards and report insights.', 5.00, 6.75, '["Electronics & Communication"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 23 DAY), DATE_ADD(CURDATE(), INTERVAL 13 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter7@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Data Analyst - Electronics & Communication - 04');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Machine Learning Intern - Electronics & Communication - 05', 'Support model training, evaluation and feature engineering.', 6.50, 6.00, '["Electronics & Communication"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 24 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter8@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Machine Learning Intern - Electronics & Communication - 05');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'QA Automation Engineer - Electronics & Communication - 06', 'Create and maintain automated software tests.', 4.80, 6.25, '["Electronics & Communication"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 25 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter9@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'QA Automation Engineer - Electronics & Communication - 06');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cloud Support Associate - Electronics & Communication - 07', 'Assist with cloud deployment, monitoring and troubleshooting.', 5.20, 6.50, '["Electronics & Communication"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 26 DAY), DATE_ADD(CURDATE(), INTERVAL 16 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter10@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cloud Support Associate - Electronics & Communication - 07');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cybersecurity Analyst Intern - Electronics & Communication - 08', 'Review logs, identify suspicious activity and document findings.', 5.80, 6.75, '["Electronics & Communication"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 27 DAY), DATE_ADD(CURDATE(), INTERVAL 17 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter1@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cybersecurity Analyst Intern - Electronics & Communication - 08');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Java Developer Trainee - Electronics & Communication - 09', 'Develop Java modules and participate in code reviews.', 5.00, 6.00, '["Electronics & Communication"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 28 DAY), DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter2@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Java Developer Trainee - Electronics & Communication - 09');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'UI Developer Intern - Electronics & Communication - 10', 'Implement accessible, responsive web interfaces.', 4.50, 6.25, '["Electronics & Communication"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 29 DAY), DATE_ADD(CURDATE(), INTERVAL 19 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter3@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'UI Developer Intern - Electronics & Communication - 10');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Software Engineer Intern - Electrical Engineering - 01', 'Build and maintain web applications and REST APIs.', 6.00, 6.00, '["Electrical Engineering"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter5@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Software Engineer Intern - Electrical Engineering - 01');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Full Stack Developer - Electrical Engineering - 02', 'Develop responsive user interfaces and backend services.', 7.20, 6.25, '["Electrical Engineering"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 21 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter6@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Full Stack Developer - Electrical Engineering - 02');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Python Developer - Electrical Engineering - 03', 'Write Python services, scripts and automated tests.', 5.50, 6.50, '["Electrical Engineering"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 22 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter7@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Python Developer - Electrical Engineering - 03');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Data Analyst - Electrical Engineering - 04', 'Prepare datasets, build dashboards and report insights.', 5.00, 6.75, '["Electrical Engineering"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 23 DAY), DATE_ADD(CURDATE(), INTERVAL 13 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter8@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Data Analyst - Electrical Engineering - 04');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Machine Learning Intern - Electrical Engineering - 05', 'Support model training, evaluation and feature engineering.', 6.50, 6.00, '["Electrical Engineering"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 24 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter9@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Machine Learning Intern - Electrical Engineering - 05');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'QA Automation Engineer - Electrical Engineering - 06', 'Create and maintain automated software tests.', 4.80, 6.25, '["Electrical Engineering"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 25 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter10@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'QA Automation Engineer - Electrical Engineering - 06');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cloud Support Associate - Electrical Engineering - 07', 'Assist with cloud deployment, monitoring and troubleshooting.', 5.20, 6.50, '["Electrical Engineering"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 26 DAY), DATE_ADD(CURDATE(), INTERVAL 16 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter1@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cloud Support Associate - Electrical Engineering - 07');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cybersecurity Analyst Intern - Electrical Engineering - 08', 'Review logs, identify suspicious activity and document findings.', 5.80, 6.75, '["Electrical Engineering"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 27 DAY), DATE_ADD(CURDATE(), INTERVAL 17 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter2@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cybersecurity Analyst Intern - Electrical Engineering - 08');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Java Developer Trainee - Electrical Engineering - 09', 'Develop Java modules and participate in code reviews.', 5.00, 6.00, '["Electrical Engineering"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 28 DAY), DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter3@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Java Developer Trainee - Electrical Engineering - 09');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'UI Developer Intern - Electrical Engineering - 10', 'Implement accessible, responsive web interfaces.', 4.50, 6.25, '["Electrical Engineering"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 29 DAY), DATE_ADD(CURDATE(), INTERVAL 19 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter4@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'UI Developer Intern - Electrical Engineering - 10');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Software Engineer Intern - Mechanical Engineering - 01', 'Build and maintain web applications and REST APIs.', 6.00, 6.00, '["Mechanical Engineering"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter6@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Software Engineer Intern - Mechanical Engineering - 01');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Full Stack Developer - Mechanical Engineering - 02', 'Develop responsive user interfaces and backend services.', 7.20, 6.25, '["Mechanical Engineering"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 21 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter7@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Full Stack Developer - Mechanical Engineering - 02');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Python Developer - Mechanical Engineering - 03', 'Write Python services, scripts and automated tests.', 5.50, 6.50, '["Mechanical Engineering"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 22 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter8@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Python Developer - Mechanical Engineering - 03');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Data Analyst - Mechanical Engineering - 04', 'Prepare datasets, build dashboards and report insights.', 5.00, 6.75, '["Mechanical Engineering"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 23 DAY), DATE_ADD(CURDATE(), INTERVAL 13 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter9@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Data Analyst - Mechanical Engineering - 04');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Machine Learning Intern - Mechanical Engineering - 05', 'Support model training, evaluation and feature engineering.', 6.50, 6.00, '["Mechanical Engineering"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 24 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter10@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Machine Learning Intern - Mechanical Engineering - 05');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'QA Automation Engineer - Mechanical Engineering - 06', 'Create and maintain automated software tests.', 4.80, 6.25, '["Mechanical Engineering"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 25 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter1@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'QA Automation Engineer - Mechanical Engineering - 06');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cloud Support Associate - Mechanical Engineering - 07', 'Assist with cloud deployment, monitoring and troubleshooting.', 5.20, 6.50, '["Mechanical Engineering"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 26 DAY), DATE_ADD(CURDATE(), INTERVAL 16 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter2@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cloud Support Associate - Mechanical Engineering - 07');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cybersecurity Analyst Intern - Mechanical Engineering - 08', 'Review logs, identify suspicious activity and document findings.', 5.80, 6.75, '["Mechanical Engineering"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 27 DAY), DATE_ADD(CURDATE(), INTERVAL 17 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter3@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cybersecurity Analyst Intern - Mechanical Engineering - 08');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Java Developer Trainee - Mechanical Engineering - 09', 'Develop Java modules and participate in code reviews.', 5.00, 6.00, '["Mechanical Engineering"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 28 DAY), DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter4@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Java Developer Trainee - Mechanical Engineering - 09');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'UI Developer Intern - Mechanical Engineering - 10', 'Implement accessible, responsive web interfaces.', 4.50, 6.25, '["Mechanical Engineering"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 29 DAY), DATE_ADD(CURDATE(), INTERVAL 19 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter5@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'UI Developer Intern - Mechanical Engineering - 10');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Software Engineer Intern - MCA - 01', 'Build and maintain web applications and REST APIs.', 6.00, 6.00, '["MCA"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter7@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Software Engineer Intern - MCA - 01');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Full Stack Developer - MCA - 02', 'Develop responsive user interfaces and backend services.', 7.20, 6.25, '["MCA"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 21 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter8@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Full Stack Developer - MCA - 02');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Python Developer - MCA - 03', 'Write Python services, scripts and automated tests.', 5.50, 6.50, '["MCA"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 22 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter9@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Python Developer - MCA - 03');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Data Analyst - MCA - 04', 'Prepare datasets, build dashboards and report insights.', 5.00, 6.75, '["MCA"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 23 DAY), DATE_ADD(CURDATE(), INTERVAL 13 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter10@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Data Analyst - MCA - 04');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Machine Learning Intern - MCA - 05', 'Support model training, evaluation and feature engineering.', 6.50, 6.00, '["MCA"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 24 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter1@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Machine Learning Intern - MCA - 05');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'QA Automation Engineer - MCA - 06', 'Create and maintain automated software tests.', 4.80, 6.25, '["MCA"]', 0, 'Surat',
DATE_ADD(CURDATE(), INTERVAL 25 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter2@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'QA Automation Engineer - MCA - 06');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cloud Support Associate - MCA - 07', 'Assist with cloud deployment, monitoring and troubleshooting.', 5.20, 6.50, '["MCA"]', 0, 'Ahmedabad',
DATE_ADD(CURDATE(), INTERVAL 26 DAY), DATE_ADD(CURDATE(), INTERVAL 16 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter3@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cloud Support Associate - MCA - 07');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Cybersecurity Analyst Intern - MCA - 08', 'Review logs, identify suspicious activity and document findings.', 5.80, 6.75, '["MCA"]', 0, 'Vadodara',
DATE_ADD(CURDATE(), INTERVAL 27 DAY), DATE_ADD(CURDATE(), INTERVAL 17 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter4@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Cybersecurity Analyst Intern - MCA - 08');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'Java Developer Trainee - MCA - 09', 'Develop Java modules and participate in code reviews.', 5.00, 6.00, '["MCA"]', 0, 'Pune',
DATE_ADD(CURDATE(), INTERVAL 28 DAY), DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter5@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'Java Developer Trainee - MCA - 09');
INSERT INTO jobs
(recruiter_id, title, description, package_lpa, min_cgpa, eligible_branches, max_backlogs, location, drive_date, application_deadline, status)
SELECT r.id, 'UI Developer Intern - MCA - 10', 'Implement accessible, responsive web interfaces.', 4.50, 6.25, '["MCA"]', 0, 'Remote',
DATE_ADD(CURDATE(), INTERVAL 29 DAY), DATE_ADD(CURDATE(), INTERVAL 19 DAY), 'OPEN'
FROM recruiters r JOIN users u ON u.id = r.user_id
WHERE u.email = 'recruiter6@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM jobs existing WHERE existing.recruiter_id = r.id AND existing.title = 'UI Developer Intern - MCA - 10');

-- 5) At least 10 applications, using unique student/job pairs.
INSERT INTO applications (student_id, job_id, status)
SELECT s.id, j.id, 'APPLIED'
FROM students s
JOIN users su ON su.id = s.user_id
JOIN jobs j ON j.title = 'Software Engineer Intern - Computer Engineering - 01'
WHERE su.email = 'student1@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.job_id = j.id)
LIMIT 1;
INSERT INTO applications (student_id, job_id, status)
SELECT s.id, j.id, 'SHORTLISTED'
FROM students s
JOIN users su ON su.id = s.user_id
JOIN jobs j ON j.title = 'Full Stack Developer - Information Technology - 02'
WHERE su.email = 'student2@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.job_id = j.id)
LIMIT 1;
INSERT INTO applications (student_id, job_id, status)
SELECT s.id, j.id, 'INTERVIEW'
FROM students s
JOIN users su ON su.id = s.user_id
JOIN jobs j ON j.title = 'Python Developer - Artificial Intelligence & Data Science - 03'
WHERE su.email = 'student3@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.job_id = j.id)
LIMIT 1;
INSERT INTO applications (student_id, job_id, status)
SELECT s.id, j.id, 'APPLIED'
FROM students s
JOIN users su ON su.id = s.user_id
JOIN jobs j ON j.title = 'Data Analyst - Electronics & Communication - 04'
WHERE su.email = 'student4@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.job_id = j.id)
LIMIT 1;
INSERT INTO applications (student_id, job_id, status)
SELECT s.id, j.id, 'SELECTED'
FROM students s
JOIN users su ON su.id = s.user_id
JOIN jobs j ON j.title = 'Machine Learning Intern - Electrical Engineering - 05'
WHERE su.email = 'student5@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.job_id = j.id)
LIMIT 1;
INSERT INTO applications (student_id, job_id, status)
SELECT s.id, j.id, 'APPLIED'
FROM students s
JOIN users su ON su.id = s.user_id
JOIN jobs j ON j.title = 'QA Automation Engineer - Mechanical Engineering - 06'
WHERE su.email = 'student6@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.job_id = j.id)
LIMIT 1;
INSERT INTO applications (student_id, job_id, status)
SELECT s.id, j.id, 'REJECTED'
FROM students s
JOIN users su ON su.id = s.user_id
JOIN jobs j ON j.title = 'Cloud Support Associate - MCA - 07'
WHERE su.email = 'student7@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.job_id = j.id)
LIMIT 1;
INSERT INTO applications (student_id, job_id, status)
SELECT s.id, j.id, 'SHORTLISTED'
FROM students s
JOIN users su ON su.id = s.user_id
JOIN jobs j ON j.title = 'Cybersecurity Analyst Intern - Computer Engineering - 08'
WHERE su.email = 'student8@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.job_id = j.id)
LIMIT 1;
INSERT INTO applications (student_id, job_id, status)
SELECT s.id, j.id, 'APPLIED'
FROM students s
JOIN users su ON su.id = s.user_id
JOIN jobs j ON j.title = 'Java Developer Trainee - Information Technology - 09'
WHERE su.email = 'student9@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.job_id = j.id)
LIMIT 1;
INSERT INTO applications (student_id, job_id, status)
SELECT s.id, j.id, 'INTERVIEW'
FROM students s
JOIN users su ON su.id = s.user_id
JOIN jobs j ON j.title = 'UI Developer Intern - Artificial Intelligence & Data Science - 10'
WHERE su.email = 'student10@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.job_id = j.id)
LIMIT 1;

-- 6) At least 10 notifications, one per seeded user.
INSERT INTO notifications (user_id, message, is_read)
SELECT id, 'Welcome to CPMS, Aarav Shah! Explore eligible placement opportunities.', 0 FROM users
WHERE email = 'student1@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = users.id AND n.message = 'Welcome to CPMS, Aarav Shah! Explore eligible placement opportunities.');
INSERT INTO notifications (user_id, message, is_read)
SELECT id, 'Welcome to CPMS, Diya Patel! Explore eligible placement opportunities.', 0 FROM users
WHERE email = 'student2@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = users.id AND n.message = 'Welcome to CPMS, Diya Patel! Explore eligible placement opportunities.');
INSERT INTO notifications (user_id, message, is_read)
SELECT id, 'Welcome to CPMS, Vivaan Mehta! Explore eligible placement opportunities.', 0 FROM users
WHERE email = 'student3@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = users.id AND n.message = 'Welcome to CPMS, Vivaan Mehta! Explore eligible placement opportunities.');
INSERT INTO notifications (user_id, message, is_read)
SELECT id, 'Welcome to CPMS, Anaya Desai! Explore eligible placement opportunities.', 0 FROM users
WHERE email = 'student4@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = users.id AND n.message = 'Welcome to CPMS, Anaya Desai! Explore eligible placement opportunities.');
INSERT INTO notifications (user_id, message, is_read)
SELECT id, 'Welcome to CPMS, Ishaan Joshi! Explore eligible placement opportunities.', 0 FROM users
WHERE email = 'student5@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = users.id AND n.message = 'Welcome to CPMS, Ishaan Joshi! Explore eligible placement opportunities.');
INSERT INTO notifications (user_id, message, is_read)
SELECT id, 'Welcome to CPMS, Myra Trivedi! Explore eligible placement opportunities.', 0 FROM users
WHERE email = 'student6@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = users.id AND n.message = 'Welcome to CPMS, Myra Trivedi! Explore eligible placement opportunities.');
INSERT INTO notifications (user_id, message, is_read)
SELECT id, 'Welcome to CPMS, Reyansh Patel! Explore eligible placement opportunities.', 0 FROM users
WHERE email = 'student7@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = users.id AND n.message = 'Welcome to CPMS, Reyansh Patel! Explore eligible placement opportunities.');
INSERT INTO notifications (user_id, message, is_read)
SELECT id, 'Welcome to CPMS, Sara Shah! Explore eligible placement opportunities.', 0 FROM users
WHERE email = 'student8@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = users.id AND n.message = 'Welcome to CPMS, Sara Shah! Explore eligible placement opportunities.');
INSERT INTO notifications (user_id, message, is_read)
SELECT id, 'Welcome to CPMS, Krish Gandhi! Explore eligible placement opportunities.', 0 FROM users
WHERE email = 'student9@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = users.id AND n.message = 'Welcome to CPMS, Krish Gandhi! Explore eligible placement opportunities.');
INSERT INTO notifications (user_id, message, is_read)
SELECT id, 'Welcome to CPMS, Ira Modi! Explore eligible placement opportunities.', 0 FROM users
WHERE email = 'student10@cpms-demo.com'
AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id = users.id AND n.message = 'Welcome to CPMS, Ira Modi! Explore eligible placement opportunities.');

COMMIT;

-- Verification queries:
SELECT role, COUNT(*) AS total_users FROM users GROUP BY role;
SELECT branch, COUNT(*) AS total_students FROM students GROUP BY branch ORDER BY branch;
SELECT COUNT(*) AS total_recruiters FROM recruiters;
SELECT COUNT(*) AS total_jobs FROM jobs;
SELECT COUNT(*) AS total_applications FROM applications;
SELECT COUNT(*) AS total_notifications FROM notifications;
-- Count jobs for a particular branch (eligible_branches is JSON text):
SELECT COUNT(*) AS jobs_for_computer_engineering
FROM jobs
WHERE JSON_CONTAINS(eligible_branches, JSON_QUOTE('Computer Engineering'));