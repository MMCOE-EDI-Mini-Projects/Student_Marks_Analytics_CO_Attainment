-- Outcome-Based Education (OBE) Management System Schema
-- Database Creation & Schema Definition

CREATE DATABASE IF NOT EXISTS `obe_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `obe_db`;

-- 1. Users Table (Core Auth Table for Inheritance Mapping)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `role` ENUM('ADMIN', 'FACULTY', 'STUDENT') NOT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `reset_token` VARCHAR(100) DEFAULT NULL,
    `reset_token_expiry` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_username` (`username`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_dept_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Classes Table (Department -> Class)
CREATE TABLE IF NOT EXISTS `classes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `department_id` INT NOT NULL,
    `name` VARCHAR(50) NOT NULL, -- e.g., "Class 5-A", "Class 5-B"
    `academic_year` VARCHAR(20) NOT NULL, -- e.g., "2025-2026"
    `semester` INT NOT NULL CHECK (`semester` BETWEEN 1 AND 8),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `uk_dept_class_sem` (`department_id`, `name`, `semester`),
    INDEX `idx_class_dept` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Faculty Table (Extends User)
CREATE TABLE IF NOT EXISTS `faculty` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `department_id` INT NOT NULL,
    `designation` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_faculty_dept` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Students Table (Extends User)
CREATE TABLE IF NOT EXISTS `students` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `department_id` INT NOT NULL,
    `class_id` INT NOT NULL,
    -- Compatibility alias used by the API; it always contains the same class id.
    `batch_id` INT DEFAULT NULL,
    `roll_number` VARCHAR(30) NOT NULL,
    `register_number` VARCHAR(50) NOT NULL UNIQUE,
    `date_of_birth` DATE DEFAULT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`batch_id`) REFERENCES `classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY `uk_class_roll` (`class_id`, `roll_number`),
    INDEX `idx_student_dept_class` (`department_id`, `class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Subjects Table (Class & Dept -> Subject)
CREATE TABLE IF NOT EXISTS `subjects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `department_id` INT NOT NULL,
    `class_id` INT NOT NULL,
    -- The UI exposes classes as batches; retain this alias for API compatibility.
    `batch_id` INT DEFAULT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `credits` INT NOT NULL DEFAULT 3,
    `semester` INT NOT NULL,
    `subject_type` ENUM('THEORY', 'PRACTICAL', 'HYBRID', 'PROJECT') NOT NULL DEFAULT 'THEORY',
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`batch_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `uk_class_subject_code` (`class_id`, `code`),
    INDEX `idx_subject_dept_class` (`department_id`, `class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Faculty Assignments Table
CREATE TABLE IF NOT EXISTS `faculty_assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `faculty_id` INT NOT NULL,
    `subject_id` INT NOT NULL,
    `class_id` INT NOT NULL,
    `batch_id` INT DEFAULT NULL,
    `academic_year` VARCHAR(20) NOT NULL,
    `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`faculty_id`) REFERENCES `faculty`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`batch_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `uk_faculty_subject_class` (`faculty_id`, `subject_id`, `class_id`, `academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Enrollments Table
CREATE TABLE IF NOT EXISTS `enrollments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `subject_id` INT NOT NULL,
    `class_id` INT NOT NULL,
    `batch_id` INT DEFAULT NULL,
    `status` ENUM('ENROLLED', 'COMPLETED', 'DROPPED') DEFAULT 'ENROLLED',
    `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`batch_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `uk_student_subject` (`student_id`, `subject_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Programme Outcomes (POs) Table
CREATE TABLE IF NOT EXISTS `programme_outcomes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `department_id` INT NOT NULL,
    `po_code` VARCHAR(20) NOT NULL, -- e.g., "PO1", "PO2"
    `title` VARCHAR(100) DEFAULT NULL,
    `description` TEXT NOT NULL,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `uk_dept_po` (`department_id`, `po_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Course Outcomes (COs) Table
CREATE TABLE IF NOT EXISTS `course_outcomes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `subject_id` INT NOT NULL,
    `co_code` VARCHAR(20) NOT NULL, -- e.g., "CO1", "CO2"
    `description` TEXT NOT NULL,
    `target_attainment_pct` DECIMAL(5,2) DEFAULT 60.00,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `uk_subject_co` (`subject_id`, `co_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. CO-PO Mapping Table (Matrix strengths: 0=None, 1=Low, 2=Medium, 3=High)
CREATE TABLE IF NOT EXISTS `co_po_mapping` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `co_id` INT NOT NULL,
    `po_id` INT NOT NULL,
    `strength` INT NOT NULL DEFAULT 0 CHECK (`strength` BETWEEN 0 AND 3),
    FOREIGN KEY (`co_id`) REFERENCES `course_outcomes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`po_id`) REFERENCES `programme_outcomes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `uk_co_po` (`co_id`, `po_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Assessments Table (Polymorphic Assessment Types)
CREATE TABLE IF NOT EXISTS `assessments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `subject_id` INT NOT NULL,
    `class_id` INT NOT NULL,
    `batch_id` INT DEFAULT NULL,
    `faculty_id` INT NOT NULL,
    `title` VARCHAR(100) NOT NULL, -- e.g., "Internal Test 1", "Assignment 1"
    `type` ENUM('INTERNAL_TEST', 'UNIT_TEST', 'ASSIGNMENT', 'PRACTICAL') NOT NULL,
    `total_marks` DECIMAL(6,2) NOT NULL,
    `weightage` DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    `is_published` TINYINT(1) NOT NULL DEFAULT 1,
    `assessment_date` DATE NOT NULL,
    `instructions` TEXT DEFAULT NULL,
    `due_date` DATE DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`batch_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`faculty_id`) REFERENCES `faculty`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Assessment Questions Table (Question -> CO Mapping)
CREATE TABLE IF NOT EXISTS `assessment_questions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `assessment_id` INT NOT NULL,
    `question_number` VARCHAR(10) NOT NULL, -- e.g. "Q1a", "Q1b", "Q2"
    `question_text` TEXT DEFAULT NULL,
    `max_marks` DECIMAL(5,2) NOT NULL,
    `co_id` INT NOT NULL,
    FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`co_id`) REFERENCES `course_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY `uk_assessment_question` (`assessment_id`, `question_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Student Marks Table
CREATE TABLE IF NOT EXISTS `student_marks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `assessment_id` INT NOT NULL,
    `question_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `marks_obtained` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `is_absent` TINYINT(1) NOT NULL DEFAULT 0,
    `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `assessment_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `uk_student_question` (`student_id`, `question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Attendance Table
CREATE TABLE IF NOT EXISTS `attendance` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `subject_id` INT NOT NULL,
    `class_id` INT NOT NULL,
    `batch_id` INT DEFAULT NULL,
    `student_id` INT NOT NULL,
    `attendance_date` DATE NOT NULL,
    `status` ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL DEFAULT 'PRESENT',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`batch_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `uk_student_subject_date` (`student_id`, `subject_id`, `attendance_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. Attainment Rules & Configuration Table
CREATE TABLE IF NOT EXISTS `attainment_config` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `target_mark_pct` DECIMAL(5,2) NOT NULL DEFAULT 60.00,
    `level_1_pct` DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    `level_2_pct` DECIMAL(5,2) NOT NULL DEFAULT 60.00,
    `level_3_pct` DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    `direct_weight` DECIMAL(5,2) NOT NULL DEFAULT 80.00,
    `indirect_weight` DECIMAL(5,2) NOT NULL DEFAULT 20.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. Quizzes Table
CREATE TABLE IF NOT EXISTS `quizzes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `subject_id` INT NOT NULL,
    `class_id` INT NOT NULL,
    `faculty_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `total_marks` DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    `duration_minutes` INT NOT NULL DEFAULT 30,
    `deadline` DATETIME NOT NULL,
    `is_published` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`faculty_id`) REFERENCES `faculty`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. Quiz Questions Table
CREATE TABLE IF NOT EXISTS `quiz_questions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `quiz_id` INT NOT NULL,
    `question_text` TEXT NOT NULL,
    `option_a` VARCHAR(255) NOT NULL,
    `option_b` VARCHAR(255) NOT NULL,
    `option_c` VARCHAR(255) DEFAULT NULL,
    `option_d` VARCHAR(255) DEFAULT NULL,
    `correct_option` VARCHAR(5) NOT NULL,
    `marks` DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. Quiz Submissions Table
CREATE TABLE IF NOT EXISTS `quiz_submissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `quiz_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `score` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `total_score` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `answers_json` TEXT DEFAULT NULL,
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_quiz_student` (`quiz_id`, `student_id`),
    FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 20. Assignment Submissions Table
CREATE TABLE IF NOT EXISTS `assignment_submissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `assessment_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `submission_text` TEXT DEFAULT NULL,
    `submission_file` VARCHAR(255) DEFAULT NULL,
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `marks_awarded` DECIMAL(5,2) DEFAULT NULL,
    `feedback` TEXT DEFAULT NULL,
    UNIQUE KEY `uk_assignment_student` (`assessment_id`, `student_id`),
    FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 21. Grievances Table
CREATE TABLE IF NOT EXISTS `grievances` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `class_id` INT NOT NULL,
    `subject_id` INT DEFAULT NULL,
    `category` ENUM('MARKS', 'ASSESSMENT', 'ATTENDANCE', 'ACADEMIC_OTHER') NOT NULL DEFAULT 'ACADEMIC_OTHER',
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    `faculty_response` TEXT DEFAULT NULL,
    `resolved_by_faculty_id` INT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (`resolved_by_faculty_id`) REFERENCES `faculty`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 22. Student Reports Table
CREATE TABLE IF NOT EXISTS `student_reports` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `class_id` INT NOT NULL,
    `subject_id` INT NOT NULL,
    `faculty_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `academic_year` VARCHAR(20) NOT NULL,
    `report_summary` TEXT DEFAULT NULL,
    `co_attainment_json` TEXT DEFAULT NULL,
    `marks_summary_json` TEXT DEFAULT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'PUBLISHED',
    `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`faculty_id`) REFERENCES `faculty`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- INITIAL SEED DATA
-- Default Passwords:
-- admin / admin123
-- faculty1 / faculty123
-- student1 / student123
-- (Hashed with BCrypt: $2a$10$Tdu/84l1QDfkvOOc96CY3um3C3tKUzIN5e4gNf9/ImAc8uA/ns1LO)
-- =========================================================================

-- Seed Default Attainment Config
INSERT INTO `attainment_config` (`id`, `target_mark_pct`, `level_1_pct`, `level_2_pct`, `level_3_pct`, `direct_weight`, `indirect_weight`)
VALUES (1, 60.00, 50.00, 60.00, 70.00, 80.00, 20.00)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Users
INSERT INTO `users` (`id`, `username`, `password_hash`, `email`, `role`, `is_active`, `first_name`, `last_name`) VALUES
(1, 'admin', '$2a$10$Tdu/84l1QDfkvOOc96CY3um3C3tKUzIN5e4gNf9/ImAc8uA/ns1LO', 'admin@college.edu', 'ADMIN', 1, 'System', 'Admin'),
(2, 'faculty1', '$2a$10$Tdu/84l1QDfkvOOc96CY3um3C3tKUzIN5e4gNf9/ImAc8uA/ns1LO', 'dr.smith@college.edu', 'FACULTY', 1, 'Dr. John', 'Smith'),
(3, 'student1', '$2a$10$Tdu/84l1QDfkvOOc96CY3um3C3tKUzIN5e4gNf9/ImAc8uA/ns1LO', 'alice.student@college.edu', 'STUDENT', 1, 'Alice', 'Johnson'),
(4, 'student2', '$2a$10$Tdu/84l1QDfkvOOc96CY3um3C3tKUzIN5e4gNf9/ImAc8uA/ns1LO', 'bob.student@college.edu', 'STUDENT', 1, 'Bob', 'Williams')
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`);

-- Seed Departments
INSERT INTO `departments` (`id`, `code`, `name`, `description`) VALUES
(1, 'CSE', 'Computer Science & Engineering', 'Department of Computer Science and Engineering'),
(2, 'ECE', 'Electronics & Communication Engineering', 'Department of Electronics and Communication')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Classes
INSERT INTO `classes` (`id`, `department_id`, `name`, `academic_year`, `semester`) VALUES
(1, 1, 'Class 5-A', '2025-2026', 5),
(2, 1, 'Class 5-B', '2025-2026', 5)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Faculty Detail
INSERT INTO `faculty` (`id`, `user_id`, `department_id`, `designation`, `phone`) VALUES
(1, 2, 1, 'Professor & HOD', '9876543210')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Students Detail
INSERT INTO `students` (`id`, `user_id`, `department_id`, `class_id`, `roll_number`, `register_number`, `date_of_birth`, `phone`) VALUES
(1, 3, 1, 1, 'CSE001', 'REG2023001', '2004-05-15', '9123456780'),
(2, 4, 1, 1, 'CSE002', 'REG2023002', '2004-08-20', '9123456781')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Existing installations created before batch compatibility was added can run
-- the following idempotent migration statements once (MySQL 8.0+):
-- ALTER TABLE students ADD COLUMN batch_id INT NULL AFTER class_id;
-- ALTER TABLE subjects ADD COLUMN batch_id INT NULL AFTER class_id;
-- ALTER TABLE enrollments ADD COLUMN batch_id INT NULL AFTER class_id;
-- ALTER TABLE assessments ADD COLUMN batch_id INT NULL AFTER class_id;
-- ALTER TABLE attendance ADD COLUMN batch_id INT NULL AFTER class_id;
-- ALTER TABLE faculty_assignments ADD COLUMN batch_id INT NULL AFTER class_id;
-- UPDATE students SET batch_id = class_id WHERE batch_id IS NULL;
-- UPDATE subjects SET batch_id = class_id WHERE batch_id IS NULL;
-- UPDATE enrollments SET batch_id = class_id WHERE batch_id IS NULL;
-- UPDATE assessments SET batch_id = class_id WHERE batch_id IS NULL;
-- UPDATE attendance SET batch_id = class_id WHERE batch_id IS NULL;
-- UPDATE faculty_assignments SET batch_id = class_id WHERE batch_id IS NULL;

-- Seed Subjects
INSERT INTO `subjects` (`id`, `department_id`, `class_id`, `code`, `name`, `credits`, `semester`, `subject_type`) VALUES
(1, 1, 1, 'CS501', 'Database Management Systems', 4, 5, 'THEORY'),
(2, 1, 1, 'CS502', 'Software Engineering', 3, 5, 'THEORY')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Faculty Assignments
INSERT INTO `faculty_assignments` (`id`, `faculty_id`, `subject_id`, `class_id`, `academic_year`) VALUES
(1, 1, 1, 1, '2025-2026')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Enrollments
INSERT INTO `enrollments` (`id`, `student_id`, `subject_id`, `class_id`, `status`) VALUES
(1, 1, 1, 1, 'ENROLLED'),
(2, 2, 1, 1, 'ENROLLED')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Programme Outcomes (POs) for CSE
INSERT INTO `programme_outcomes` (`id`, `department_id`, `po_code`, `title`, `description`) VALUES
(1, 1, 'PO1', 'Engineering Knowledge', 'Apply knowledge of mathematics, science, engineering fundamentals to solve complex problems.'),
(2, 1, 'PO2', 'Problem Analysis', 'Identify, formulate, and analyze complex engineering problems reaching substantiated conclusions.'),
(3, 1, 'PO3', 'Design/Development of Solutions', 'Design solutions for complex engineering problems and system components.'),
(4, 1, 'PO4', 'Modern Tool Usage', 'Create, select, and apply appropriate techniques, resources, and modern engineering tools.')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Course Outcomes (COs) for CS501
INSERT INTO `course_outcomes` (`id`, `subject_id`, `co_code`, `description`, `target_attainment_pct`) VALUES
(1, 1, 'CO1', 'Understand relational database concepts and ER diagrams', 60.00),
(2, 1, 'CO2', 'Formulate SQL queries for database creation and retrieval', 60.00),
(3, 1, 'CO3', 'Apply database normalization principles up to 3NF/BCNF', 60.00),
(4, 1, 'CO4', 'Understand transaction management and concurrency control', 60.00)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed CO-PO Mapping
INSERT INTO `co_po_mapping` (`co_id`, `po_id`, `strength`) VALUES
(1, 1, 3), (1, 2, 2), (1, 3, 1), (1, 4, 0),
(2, 1, 3), (2, 2, 3), (2, 3, 2), (2, 4, 3),
(3, 1, 2), (3, 2, 3), (3, 3, 3), (3, 4, 1),
(4, 1, 2), (4, 2, 2), (4, 3, 2), (4, 4, 0)
ON DUPLICATE KEY UPDATE `strength` = VALUES(`strength`);

-- Keep the backward-compatible API alias in sync for the supplied seed data.
UPDATE `students` SET `batch_id` = `class_id` WHERE `batch_id` IS NULL;
UPDATE `subjects` SET `batch_id` = `class_id` WHERE `batch_id` IS NULL;
UPDATE `enrollments` SET `batch_id` = `class_id` WHERE `batch_id` IS NULL;
UPDATE `assessments` SET `batch_id` = `class_id` WHERE `batch_id` IS NULL;
UPDATE `attendance` SET `batch_id` = `class_id` WHERE `batch_id` IS NULL;
UPDATE `faculty_assignments` SET `batch_id` = `class_id` WHERE `batch_id` IS NULL;
