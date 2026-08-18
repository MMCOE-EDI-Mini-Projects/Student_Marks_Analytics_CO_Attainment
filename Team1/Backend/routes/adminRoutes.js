const express = require("express");

const router = express.Router();

const authenticate =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/roleMiddleware");

const csrf =
    require("../middleware/csrfMiddleware");

const {
    pool
} = require("../config/db");

const {
    hashPassword
} = require("../utils/password");


// ==========================================
// ADMIN DASHBOARD
// ==========================================

router.get(
    "/dashboard",
    authenticate,
    authorize("ADMIN"),

    async (req, res) => {

        res.json({
            success: true,
            message: "Welcome Admin",
            user: req.user
        });

    }
);


// ==========================================
// CREATE USER
// ==========================================

router.post(
    "/users",

    authenticate,

    authorize("ADMIN"),

    csrf,

    async (req, res) => {

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
                        "Required fields missing"
                });
            }


            if (
                !["ADMIN", "FACULTY", "STUDENT"]
                    .includes(role)
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid role"
                });
            }


            const passwordHash =
                await hashPassword(password);


            const connection =
                await pool.getConnection();


            try {

                await connection.beginTransaction();


                const [result] =
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
                        (?, ?, ?, ?, TRUE, TRUE)
                        `,
                        [
                            username,
                            email,
                            passwordHash,
                            role
                        ]
                    );


                const userId =
                    result.insertId;


                if (role === "ADMIN") {

                    await connection.execute(
                        `
                        INSERT INTO admins
                        (user_id, name)
                        VALUES (?, ?)
                        `,
                        [
                            userId,
                            name
                        ]
                    );
                }


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
                        VALUES (?, ?, ?, ?)
                        `,
                        [
                            userId,
                            name,
                            employee_id || null,
                            department || null
                        ]
                    );
                }


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
                        VALUES (?, ?, ?, ?, ?)
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


                await connection.commit();


                res.status(201).json({
                    success: true,
                    message: "User created successfully",
                    userId
                });

            } catch (error) {

                await connection.rollback();

                throw error;

            } finally {

                connection.release();
            }

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Could not create user"
            });
        }
    }
);


// ==========================================
// GET ALL USERS
// ==========================================

router.get(
    "/users",

    authenticate,

    authorize("ADMIN"),

    async (req, res) => {

        try {

            const [users] =
                await pool.execute(
                    `
                    SELECT
                        id,
                        username,
                        email,
                        role,
                        is_active,
                        failed_login_attempts,
                        locked_until,
                        last_login_at,
                        created_at
                    FROM users
                    ORDER BY created_at DESC
                    `
                );


            res.json({
                success: true,
                users
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Could not fetch users"
            });
        }
    }
);


// ==========================================
// ACTIVATE / DEACTIVATE USER
// ==========================================

router.patch(
    "/users/:id/status",

    authenticate,

    authorize("ADMIN"),

    csrf,

    async (req, res) => {

        try {

            const {
                is_active
            } = req.body;


            await pool.execute(
                `
                UPDATE users
                SET is_active = ?
                WHERE id = ?
                `,
                [
                    is_active,
                    req.params.id
                ]
            );


            res.json({
                success: true,
                message:
                    "User status updated"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Could not update status"
            });
        }
    }
);


module.exports = router;