CREATE DATABASE IF NOT EXISTS marks_analytics;

USE marks_analytics;

-- =========================
-- USERS
-- =========================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(100) NOT NULL UNIQUE,

    email VARCHAR(150) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM('ADMIN', 'FACULTY', 'STUDENT') NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    force_password_change BOOLEAN DEFAULT FALSE,

    failed_login_attempts INT DEFAULT 0,

    locked_until DATETIME NULL,

    last_login_at DATETIME NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================
-- ADMINS
-- =========================

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    name VARCHAR(150) NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================
-- FACULTY
-- =========================

CREATE TABLE faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    name VARCHAR(150) NOT NULL,

    employee_id VARCHAR(100) UNIQUE,

    department VARCHAR(150),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================
-- STUDENTS
-- =========================

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    name VARCHAR(150) NOT NULL,

    roll_no VARCHAR(100) UNIQUE,

    department VARCHAR(150),

    semester INT,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================
-- SESSIONS
-- =========================

CREATE TABLE sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    session_token_hash CHAR(64) NOT NULL UNIQUE,

    csrf_token_hash CHAR(64) NOT NULL,

    device_info VARCHAR(255),

    ip_address VARCHAR(100),

    expires_at DATETIME NOT NULL,

    revoked BOOLEAN DEFAULT FALSE,

    revoked_at DATETIME NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================
-- PASSWORD RESET TOKENS
-- =========================

CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    token_hash CHAR(64) NOT NULL UNIQUE,

    expires_at DATETIME NOT NULL,

    used BOOLEAN DEFAULT FALSE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================
-- AUDIT LOG
-- =========================

CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NULL,

    action VARCHAR(100) NOT NULL,

    description TEXT,

    ip_address VARCHAR(100),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);