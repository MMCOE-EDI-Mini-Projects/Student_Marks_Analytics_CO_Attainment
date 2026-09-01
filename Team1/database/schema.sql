-- ============================================================
-- STUDENT MARKS ANALYTICS + QUIZ PORTAL DATABASE
-- ============================================================

CREATE DATABASE IF NOT EXISTS marks_analytics
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE marks_analytics;

SET FOREIGN_KEY_CHECKS = 0;


-- ============================================================
-- DROP EXISTING TABLES
-- ============================================================

DROP TABLE IF EXISTS quiz_student_answers;
DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS quiz_assignments;
DROP TABLE IF EXISTS quiz_question_options;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS quizzes;

DROP TABLE IF EXISTS marks;

DROP TABLE IF EXISTS co_po_mapping;
DROP TABLE IF EXISTS course_outcomes;
DROP TABLE IF EXISTS programme_outcomes;

DROP TABLE IF EXISTS assessments;

DROP TABLE IF EXISTS grievances;
DROP TABLE IF EXISTS uploads;
DROP TABLE IF EXISTS activity_logs;

DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS users;


-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(100) NOT NULL UNIQUE,

    email VARCHAR(150) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'ADMIN',
        'FACULTY',
        'STUDENT'
    ) NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    force_password_change BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ============================================================
-- 2. FACULTY
-- ============================================================

CREATE TABLE faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    faculty_code VARCHAR(50) UNIQUE,

    name VARCHAR(150) NOT NULL,

    department VARCHAR(150) NOT NULL,

    designation VARCHAR(100),

    phone VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_faculty_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================
-- 3. STUDENTS
-- ============================================================

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNIQUE,

    prn VARCHAR(50) NOT NULL UNIQUE,

    roll_no VARCHAR(50),

    name VARCHAR(150) NOT NULL,

    email VARCHAR(150),

    department VARCHAR(150),

    batch VARCHAR(50),

    division VARCHAR(20),

    semester INT,

    academic_year VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;


-- ============================================================
-- 4. SUBJECTS
-- ============================================================

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,

    subject_code VARCHAR(50) NOT NULL UNIQUE,

    subject_name VARCHAR(150) NOT NULL,

    semester INT NOT NULL,

    department VARCHAR(150),

    credits DECIMAL(3,1),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ============================================================
-- 5. ASSESSMENTS
-- ============================================================

CREATE TABLE assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    subject_id INT NOT NULL,

    assessment_type ENUM(
        'UNIT_TEST',
        'INSEM',
        'ENDSEM',
        'ASSIGNMENT',
        'PRACTICAL',
        'QUIZ',
        'PROJECT',
        'OTHER'
    ) NOT NULL,

    assessment_name VARCHAR(150) NOT NULL,

    maximum_marks DECIMAL(6,2) NOT NULL,

    assessment_date DATE,

    semester INT,

    created_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assessment_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assessment_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;


-- ============================================================
-- 6. MARKS
-- ============================================================

CREATE TABLE marks (
    id INT AUTO_INCREMENT PRIMARY KEY,

    student_id INT NOT NULL,

    assessment_id INT NOT NULL,

    obtained_marks DECIMAL(6,2) NOT NULL DEFAULT 0,

    entered_by INT,

    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_marks_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_marks_assessment
        FOREIGN KEY (assessment_id)
        REFERENCES assessments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_marks_entered_by
        FOREIGN KEY (entered_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    UNIQUE (student_id, assessment_id)
) ENGINE=InnoDB;


-- ============================================================
-- 7. COURSE OUTCOMES (CO)
-- ============================================================

CREATE TABLE course_outcomes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    co_code VARCHAR(20) NOT NULL,

    description TEXT NOT NULL,

    subject_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_co_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE,

    UNIQUE (subject_id, co_code)
) ENGINE=InnoDB;


-- ============================================================
-- 8. PROGRAMME OUTCOMES (PO)
-- ============================================================

CREATE TABLE programme_outcomes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    po_code VARCHAR(20) NOT NULL UNIQUE,

    description TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ============================================================
-- 9. CO-PO MAPPING
-- ============================================================

CREATE TABLE co_po_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,

    co_id INT NOT NULL,

    po_id INT NOT NULL,

    weightage DECIMAL(4,2) NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mapping_co
        FOREIGN KEY (co_id)
        REFERENCES course_outcomes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_mapping_po
        FOREIGN KEY (po_id)
        REFERENCES programme_outcomes(id)
        ON DELETE CASCADE,

    UNIQUE (co_id, po_id)
) ENGINE=InnoDB;


-- ============================================================
-- 10. QUIZZES
-- ============================================================

CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    assessment_id INT UNIQUE,

    subject_id INT NOT NULL,

    title VARCHAR(200) NOT NULL,

    description TEXT,

    instructions TEXT,

    time_limit_minutes INT NOT NULL,

    total_marks DECIMAL(6,2) NOT NULL,

    passing_marks DECIMAL(6,2) NOT NULL,

    due_date DATE NOT NULL,

    due_time TIME,

    shuffle_questions BOOLEAN DEFAULT FALSE,

    instant_results BOOLEAN DEFAULT TRUE,

    status ENUM(
        'DRAFT',
        'ASSIGNED',
        'CLOSED'
    ) DEFAULT 'DRAFT',

    created_by INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_quiz_assessment
        FOREIGN KEY (assessment_id)
        REFERENCES assessments(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_quiz_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_quiz_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;


-- ============================================================
-- 11. QUIZ QUESTIONS
-- ============================================================

CREATE TABLE quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    quiz_id INT NOT NULL,

    question_text TEXT NOT NULL,

    marks DECIMAL(5,2) NOT NULL DEFAULT 1,

    question_order INT NOT NULL,

    explanation TEXT,

    co_id INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_question_quiz
        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_question_co
        FOREIGN KEY (co_id)
        REFERENCES course_outcomes(id)
        ON DELETE SET NULL,

    UNIQUE (quiz_id, question_order)
) ENGINE=InnoDB;


-- ============================================================
-- 12. QUIZ QUESTION OPTIONS
-- ============================================================

CREATE TABLE quiz_question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,

    question_id INT NOT NULL,

    option_text VARCHAR(500) NOT NULL,

    option_order INT NOT NULL,

    is_correct BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_option_question
        FOREIGN KEY (question_id)
        REFERENCES quiz_questions(id)
        ON DELETE CASCADE,

    UNIQUE (question_id, option_order)
) ENGINE=InnoDB;


-- ============================================================
-- 13. QUIZ ASSIGNMENTS
-- ============================================================

CREATE TABLE quiz_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    quiz_id INT NOT NULL,

    division VARCHAR(20) NOT NULL,

    batch VARCHAR(50) NOT NULL,

    assigned_by INT,

    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignment_quiz
        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assignment_user
        FOREIGN KEY (assigned_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    UNIQUE (
        quiz_id,
        division,
        batch
    )
) ENGINE=InnoDB;


-- ============================================================
-- 14. QUIZ ATTEMPTS
-- ============================================================

CREATE TABLE quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,

    quiz_id INT NOT NULL,

    student_id INT NOT NULL,

    started_at DATETIME NOT NULL,

    submitted_at DATETIME,

    time_spent_seconds INT DEFAULT 0,

    total_score DECIMAL(6,2) DEFAULT 0,

    max_score DECIMAL(6,2) NOT NULL,

    score_percentage DECIMAL(6,2) DEFAULT 0,

    passed BOOLEAN DEFAULT FALSE,

    attempt_status ENUM(
        'IN_PROGRESS',
        'SUBMITTED',
        'AUTO_SUBMITTED'
    ) DEFAULT 'IN_PROGRESS',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_attempt_quiz
        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_attempt_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    UNIQUE (
        quiz_id,
        student_id
    )
) ENGINE=InnoDB;


-- ============================================================
-- 15. QUIZ STUDENT ANSWERS
-- ============================================================

CREATE TABLE quiz_student_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,

    attempt_id INT NOT NULL,

    question_id INT NOT NULL,

    selected_option_id INT,

    is_correct BOOLEAN DEFAULT FALSE,

    marks_obtained DECIMAL(5,2) DEFAULT 0,

    answered_at DATETIME
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_answer_attempt
        FOREIGN KEY (attempt_id)
        REFERENCES quiz_attempts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_answer_question
        FOREIGN KEY (question_id)
        REFERENCES quiz_questions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_answer_option
        FOREIGN KEY (selected_option_id)
        REFERENCES quiz_question_options(id)
        ON DELETE SET NULL,

    UNIQUE (
        attempt_id,
        question_id
    )
) ENGINE=InnoDB;


-- ============================================================
-- 16. ACTIVITY LOGS
-- ============================================================

CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT,

    action VARCHAR(100) NOT NULL,

    entity_type VARCHAR(100),

    entity_id INT,

    description TEXT,

    ip_address VARCHAR(45),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;


-- ============================================================
-- 17. UPLOADS
-- ============================================================

CREATE TABLE uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,

    uploaded_by INT NOT NULL,

    file_name VARCHAR(255) NOT NULL,

    file_path VARCHAR(500) NOT NULL,

    file_type VARCHAR(100),

    file_size BIGINT,

    upload_status ENUM(
        'PENDING',
        'PROCESSING',
        'COMPLETED',
        'FAILED'
    ) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_upload_user
        FOREIGN KEY (uploaded_by)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================
-- 18. GRIEVANCES
-- ============================================================

CREATE TABLE grievances (
    id INT AUTO_INCREMENT PRIMARY KEY,

    student_id INT NOT NULL,

    assessment_id INT,

    subject_id INT,

    title VARCHAR(200) NOT NULL,

    description TEXT NOT NULL,

    status ENUM(
        'OPEN',
        'IN_REVIEW',
        'RESOLVED',
        'REJECTED'
    ) DEFAULT 'OPEN',

    response TEXT,

    resolved_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    resolved_at DATETIME,

    CONSTRAINT fk_grievance_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_grievance_assessment
        FOREIGN KEY (assessment_id)
        REFERENCES assessments(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_grievance_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_grievance_resolver
        FOREIGN KEY (resolved_by)
        REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_students_batch
    ON students(batch);

CREATE INDEX idx_students_division
    ON students(division);

CREATE INDEX idx_assessments_subject
    ON assessments(subject_id);

CREATE INDEX idx_marks_student
    ON marks(student_id);

CREATE INDEX idx_marks_assessment
    ON marks(assessment_id);

CREATE INDEX idx_quizzes_subject
    ON quizzes(subject_id);

CREATE INDEX idx_quiz_questions_quiz
    ON quiz_questions(quiz_id);

CREATE INDEX idx_quiz_questions_co
    ON quiz_questions(co_id);

CREATE INDEX idx_quiz_attempts_student
    ON quiz_attempts(student_id);

CREATE INDEX idx_quiz_attempts_quiz
    ON quiz_attempts(quiz_id);

CREATE INDEX idx_answers_attempt
    ON quiz_student_answers(attempt_id);

CREATE INDEX idx_activity_user
    ON activity_logs(user_id);


-- ============================================================
-- VIEW 1: QUIZ RESULTS
-- ============================================================

CREATE OR REPLACE VIEW quiz_results AS
SELECT
    qa.id AS attempt_id,

    q.id AS quiz_id,

    q.title AS quiz_title,

    s.id AS student_id,

    s.prn,

    s.roll_no,

    s.name AS student_name,

    sub.subject_code,

    sub.subject_name,

    qa.started_at,

    qa.submitted_at,

    qa.time_spent_seconds,

    qa.total_score,

    qa.max_score,

    qa.score_percentage,

    qa.passed,

    qa.attempt_status

FROM quiz_attempts qa

JOIN quizzes q
    ON qa.quiz_id = q.id

JOIN students s
    ON qa.student_id = s.id

JOIN subjects sub
    ON q.subject_id = sub.id;


-- ============================================================
-- VIEW 2: QUESTION-WISE QUIZ RESULT
-- ============================================================

CREATE OR REPLACE VIEW quiz_question_results AS
SELECT
    qa.id AS attempt_id,

    q.id AS quiz_id,

    qq.id AS question_id,

    s.id AS student_id,

    s.prn,

    s.name AS student_name,

    qq.question_text,

    qq.marks AS maximum_marks,

    qsa.marks_obtained,

    qsa.is_correct,

    qq.co_id

FROM quiz_student_answers qsa

JOIN quiz_attempts qa
    ON qsa.attempt_id = qa.id

JOIN quiz_questions qq
    ON qsa.question_id = qq.id

JOIN quizzes q
    ON qa.quiz_id = q.id

JOIN students s
    ON qa.student_id = s.id;


-- ============================================================
-- VIEW 3: CO-WISE QUIZ ATTAINMENT
-- ============================================================

CREATE OR REPLACE VIEW quiz_co_attainment AS
SELECT
    qa.id AS attempt_id,

    qa.student_id,

    q.id AS quiz_id,

    q.title AS quiz_title,

    co.id AS co_id,

    co.co_code,

    SUM(qq.marks) AS maximum_marks,

    SUM(qsa.marks_obtained) AS obtained_marks,

    ROUND(
        (
            SUM(qsa.marks_obtained) /
            NULLIF(SUM(qq.marks), 0)
        ) * 100,
        2
    ) AS attainment_percentage

FROM quiz_attempts qa

JOIN quizzes q
    ON qa.quiz_id = q.id

JOIN quiz_student_answers qsa
    ON qa.id = qsa.attempt_id

JOIN quiz_questions qq
    ON qsa.question_id = qq.id

JOIN course_outcomes co
    ON qq.co_id = co.id

GROUP BY
    qa.id,
    qa.student_id,
    q.id,
    q.title,
    co.id,
    co.co_code;


-- ============================================================
-- VIEW 4: STUDENT MARKS WITH ASSESSMENT
-- ============================================================

CREATE OR REPLACE VIEW student_marks_report AS
SELECT
    s.id AS student_id,

    s.prn,

    s.roll_no,

    s.name AS student_name,

    sub.subject_code,

    sub.subject_name,

    a.id AS assessment_id,

    a.assessment_name,

    a.assessment_type,

    a.maximum_marks,

    m.obtained_marks,

    ROUND(
        (m.obtained_marks / NULLIF(a.maximum_marks, 0)) * 100,
        2
    ) AS percentage

FROM marks m

JOIN students s
    ON m.student_id = s.id

JOIN assessments a
    ON m.assessment_id = a.id

JOIN subjects sub
    ON a.subject_id = sub.id;


-- ============================================================
-- VIEW 5: CO-PO MAPPING
-- ============================================================

CREATE OR REPLACE VIEW co_po_mapping_report AS
SELECT
    cpm.id AS mapping_id,

    co.id AS co_id,

    co.co_code,

    co.description AS co_description,

    po.id AS po_id,

    po.po_code,

    po.description AS po_description,

    cpm.weightage

FROM co_po_mapping cpm

JOIN course_outcomes co
    ON cpm.co_id = co.id

JOIN programme_outcomes po
    ON cpm.po_id = po.id;


-- ============================================================
-- TRIGGER 1:
-- Automatically update quiz score when answers are inserted/updated
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_update_quiz_score
AFTER INSERT ON quiz_student_answers
FOR EACH ROW
BEGIN

    UPDATE quiz_attempts qa

    SET
        qa.total_score = (
            SELECT COALESCE(
                SUM(qsa.marks_obtained),
                0
            )
            FROM quiz_student_answers qsa
            WHERE qsa.attempt_id = NEW.attempt_id
        ),

        qa.max_score = (
            SELECT COALESCE(
                SUM(qq.marks),
                0
            )
            FROM quiz_student_answers qsa
            JOIN quiz_questions qq
                ON qsa.question_id = qq.id
            WHERE qsa.attempt_id = NEW.attempt_id
        )

    WHERE qa.id = NEW.attempt_id;

END$$

DELIMITER ;


-- ============================================================
-- SAMPLE ADMIN USER
-- ============================================================

INSERT INTO users
(
    username,
    email,
    password_hash,
    role
)
VALUES
(
    'admin',
    'admin@example.com',
    'CHANGE_THIS_HASH',
    'ADMIN'
);


-- ============================================================
-- SAMPLE PROGRAMME OUTCOMES
-- ============================================================

INSERT INTO programme_outcomes
(
    po_code,
    description
)
VALUES
('PO1', 'Engineering Knowledge'),
('PO2', 'Problem Analysis'),
('PO3', 'Design and Development of Solutions'),
('PO4', 'Conduct Investigations of Complex Problems'),
('PO5', 'Modern Tool Usage'),
('PO6', 'Engineer and Society'),
('PO7', 'Environment and Sustainability'),
('PO8', 'Ethics'),
('PO9', 'Individual and Team Work'),
('PO10', 'Communication'),
('PO11', 'Project Management and Finance'),
('PO12', 'Life-long Learning');


-- ============================================================
-- END
-- ============================================================

SET FOREIGN_KEY_CHECKS = 1;
