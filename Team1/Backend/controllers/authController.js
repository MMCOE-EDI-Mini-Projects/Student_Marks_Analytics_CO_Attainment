const { pool } = require("../config/db");

const {
    hashPassword,
    comparePassword,
    validatePassword
} = require("../utils/password");

const {
    generateToken,
    hashToken
} = require("../utils/tokens");

const {
    createAuditLog
} = require("../utils/audit");


// ==========================================
// LOGIN
// ==========================================

async function login(req, res) {

    try {

        const {
            username_or_email,
            password
        } = req.body;


        if (!username_or_email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Username/email and password are required"
            });
        }


        // Find user

        const [users] = await pool.execute(
            `
            SELECT *
            FROM users
            WHERE username = ?
               OR email = ?
            LIMIT 1
            `,
            [
                username_or_email,
                username_or_email
            ]
        );


        // Do not reveal whether account exists

        if (users.length === 0) {

            await createAuditLog(
                null,
                "LOGIN_FAIL",
                "Invalid login attempt",
                req.ip
            );

            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }


        const user = users[0];


        // Check active

        if (!user.is_active) {

            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }


        // Check account lock

        if (
            user.locked_until &&
            new Date(user.locked_until) > new Date()
        ) {

            await createAuditLog(
                user.id,
                "LOGIN_LOCKED",
                "Login attempted on locked account",
                req.ip
            );

            return res.status(423).json({
                success: false,
                message:
                    "Account temporarily locked. Try again later."
            });
        }


        // Compare password

        const passwordCorrect =
            await comparePassword(
                password,
                user.password_hash
            );


        // ======================================
        // WRONG PASSWORD
        // ======================================

        if (!passwordCorrect) {

            const attempts =
                user.failed_login_attempts + 1;


            // Lock after 5 failures

            if (attempts >= 5) {

                await pool.execute(
                    `
                    UPDATE users
                    SET
                        failed_login_attempts = 0,
                        locked_until =
                            DATE_ADD(
                                NOW(),
                                INTERVAL 15 MINUTE
                            )
                    WHERE id = ?
                    `,
                    [user.id]
                );


                await createAuditLog(
                    user.id,
                    "LOGIN_LOCKED",
                    "Account locked after 5 failed login attempts",
                    req.ip
                );

            } else {

                await pool.execute(
                    `
                    UPDATE users
                    SET failed_login_attempts = ?
                    WHERE id = ?
                    `,
                    [
                        attempts,
                        user.id
                    ]
                );


                await createAuditLog(
                    user.id,
                    "LOGIN_FAIL",
                    "Incorrect password",
                    req.ip
                );
            }


            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }


        // ======================================
        // SUCCESSFUL LOGIN
        // ======================================

        await pool.execute(
            `
            UPDATE users
            SET
                failed_login_attempts = 0,
                locked_until = NULL,
                last_login_at = NOW()
            WHERE id = ?
            `,
            [user.id]
        );


        // Generate random session token

        const rawSessionToken =
            generateToken();


        const sessionHash =
            hashToken(rawSessionToken);


        // Generate CSRF token

        const csrfToken =
            generateToken();


        const csrfHash =
            hashToken(csrfToken);


        // Store session

        await pool.execute(
            `
            INSERT INTO sessions
            (
                user_id,
                session_token_hash,
                csrf_token_hash,
                device_info,
                ip_address,
                expires_at
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                DATE_ADD(NOW(), INTERVAL 7 DAY)
            )
            `,
            [
                user.id,
                sessionHash,
                csrfHash,
                req.headers["user-agent"] || "Unknown",
                req.ip
            ]
        );


        // ======================================
        // HTTP ONLY COOKIE
        // ======================================

        res.cookie(
            "session_token",
            rawSessionToken,
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite: "strict",

                maxAge:
                    7 * 24 * 60 * 60 * 1000,

                path: "/"
            }
        );


        // Audit

        await createAuditLog(
            user.id,
            "LOGIN_SUCCESS",
            "User logged in successfully",
            req.ip
        );


        // Return user + CSRF token

        return res.json({

            success: true,

            message:
                "Login successful",

            csrfToken,

            user: {

                id: user.id,

                username:
                    user.username,

                email:
                    user.email,

                role:
                    user.role,

                forcePasswordChange:
                    user.force_password_change
            }
        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}



// ==========================================
// SIGNUP
// ==========================================

async function signup(req, res) {

    try {

        const {
            username,
            email,
            password,
            role,
            name,
            roll_no,
            employee_id,
            department,
            semester
        } = req.body;


        // ======================================
        // BASIC VALIDATION
        // ======================================

        if (
            !username ||
            !email ||
            !password ||
            !role ||
            !name
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Please fill all required fields"
            });
        }


        // ======================================
        // ROLE VALIDATION
        // ======================================

        if (
            ![
                "ADMIN",
                "FACULTY",
                "STUDENT"
            ].includes(role)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid account type"
            });
        }


        // ======================================
        // PASSWORD VALIDATION
        // ======================================

        const validation =
            validatePassword(password);


        if (!validation.valid) {

            return res.status(400).json({
                success: false,
                message:
                    validation.message
            });
        }


        // ======================================
        // CHECK USERNAME / EMAIL
        // ======================================

        const [existingUsers] =
            await pool.execute(
                `
                SELECT id
                FROM users
                WHERE username = ?
                   OR email = ?
                `,
                [
                    username,
                    email
                ]
            );


        if (existingUsers.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "Username or email already exists"
            });
        }


        // ======================================
        // HASH PASSWORD
        // ======================================

        const passwordHash =
            await hashPassword(password);


        // ======================================
        // DATABASE TRANSACTION
        // ======================================

        const connection =
            await pool.getConnection();


        try {

            await connection.beginTransaction();


            // ==================================
            // CREATE USER
            // ==================================

            const [userResult] =
                await connection.execute(
                    `
                    INSERT INTO users
                    (
                        username,
                        email,
                        password_hash,
                        role,
                        is_active,
                        force_password_change
                    )
                    VALUES
                    (?, ?, ?, ?, TRUE, FALSE)
                    `,
                    [
                        username,
                        email,
                        passwordHash,
                        role
                    ]
                );


            const userId =
                userResult.insertId;


            // ==================================
            // ADMIN PROFILE
            // ==================================

            if (role === "ADMIN") {

                await connection.execute(
                    `
                    INSERT INTO admins
                    (
                        user_id,
                        name
                    )
                    VALUES
                    (?, ?)
                    `,
                    [
                        userId,
                        name
                    ]
                );
            }


            // ==================================
            // FACULTY PROFILE
            // ==================================

            if (role === "FACULTY") {

                await connection.execute(
                    `
                    INSERT INTO faculty
                    (
                        user_id,
                        name,
                        employee_id,
                        department
                    )
                    VALUES
                    (?, ?, ?, ?)
                    `,
                    [
                        userId,
                        name,
                        employee_id || null,
                        department || null
                    ]
                );
            }


            // ==================================
            // STUDENT PROFILE
            // ==================================

            if (role === "STUDENT") {

                await connection.execute(
                    `
                    INSERT INTO students
                    (
                        user_id,
                        name,
                        roll_no,
                        department,
                        semester
                    )
                    VALUES
                    (?, ?, ?, ?, ?)
                    `,
                    [
                        userId,
                        name,
                        roll_no || null,
                        department || null,
                        semester || null
                    ]
                );
            }


            // Complete transaction

            await connection.commit();


            // Audit log

            await createAuditLog(
                userId,
                "ACCOUNT_CREATED",
                `New ${role} account created`,
                req.ip
            );


            return res.status(201).json({

                success: true,

                message:
                    "Account created successfully",

                userId
            });


        } catch (error) {

            await connection.rollback();

            throw error;

        } finally {

            connection.release();
        }


} catch (error) {

    console.error("================================");
    console.error("SIGNUP ERROR");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("SQL State:", error.sqlState);
    console.error("================================");

    return res.status(500).json({

        success: false,

        message:
            process.env.NODE_ENV === "development"
                ? error.message
                : "Could not create account"
    });
}
}



// ==========================================
// CURRENT USER
// ==========================================

async function me(req, res) {

    return res.json({

        success: true,

        user: req.user
    });
}



// ==========================================
// LOGOUT
// ==========================================

async function logout(req, res) {

    try {

        await pool.execute(
            `
            UPDATE sessions
            SET
                revoked = TRUE,
                revoked_at = NOW()
            WHERE id = ?
            `,
            [req.session.id]
        );


        await createAuditLog(
            req.user.id,
            "LOGOUT",
            "User logged out",
            req.ip
        );


        res.clearCookie(
            "session_token"
        );


        return res.json({

            success: true,

            message:
                "Logged out successfully"
        });


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Logout failed"
        });
    }
}



// ==========================================
// LOGOUT ALL DEVICES
// ==========================================

async function logoutAll(req, res) {

    try {

        await pool.execute(
            `
            UPDATE sessions
            SET
                revoked = TRUE,
                revoked_at = NOW()
            WHERE user_id = ?
            `,
            [req.user.id]
        );


        await createAuditLog(
            req.user.id,
            "LOGOUT_ALL",
            "All sessions revoked",
            req.ip
        );


        res.clearCookie(
            "session_token"
        );


        return res.json({

            success: true,

            message:
                "All devices have been logged out"
        });


    } catch (error) {

        console.error(
            "Logout all error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Logout all failed"
        });
    }
}



// ==========================================
// CHANGE PASSWORD
// ==========================================

async function changePassword(req, res) {

    try {

        const {
            currentPassword,
            newPassword
        } = req.body;


        if (
            !currentPassword ||
            !newPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Current and new password are required"
            });
        }


        // Get current password hash

        const [users] =
            await pool.execute(
                `
                SELECT password_hash
                FROM users
                WHERE id = ?
                `,
                [req.user.id]
            );


        if (users.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"
            });
        }


        // Verify old password

        const correct =
            await comparePassword(
                currentPassword,
                users[0].password_hash
            );


        if (!correct) {

            return res.status(401).json({

                success: false,

                message:
                    "Current password is incorrect"
            });
        }


        // Validate new password

        const validation =
            validatePassword(
                newPassword
            );


        if (!validation.valid) {

            return res.status(400).json({

                success: false,

                message:
                    validation.message
            });
        }


        // Hash new password

        const newHash =
            await hashPassword(
                newPassword
            );


        // Update password

        await pool.execute(
            `
            UPDATE users
            SET
                password_hash = ?,
                force_password_change = FALSE
            WHERE id = ?
            `,
            [
                newHash,
                req.user.id
            ]
        );


        // Revoke all sessions

        await pool.execute(
            `
            UPDATE sessions
            SET
                revoked = TRUE,
                revoked_at = NOW()
            WHERE user_id = ?
            `,
            [req.user.id]
        );


        await createAuditLog(
            req.user.id,
            "PASSWORD_CHANGED",
            "Password changed successfully",
            req.ip
        );


        res.clearCookie(
            "session_token"
        );


        return res.json({

            success: true,

            message:
                "Password changed successfully. Please login again."
        });


    } catch (error) {

        console.error(
            "Change password error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Password change failed"
        });
    }
}



// ==========================================
// EXPORT ALL CONTROLLERS
// ==========================================

module.exports = {

    login,

    signup,

    me,

    logout,

    logoutAll,

    changePassword

};