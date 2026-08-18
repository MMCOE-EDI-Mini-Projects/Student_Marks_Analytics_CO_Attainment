const { pool } = require("../config/db");
const { hashToken } = require("../utils/tokens");

async function authenticate(req, res, next) {

    try {

        const sessionToken = req.cookies.session_token;

        if (!sessionToken) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }

        const sessionHash = hashToken(sessionToken);

        const [rows] = await pool.execute(
            `
            SELECT
                s.id AS session_id,
                s.user_id,
                s.csrf_token_hash,
                s.expires_at,
                s.revoked,

                u.username,
                u.email,
                u.role,
                u.is_active,
                u.force_password_change

            FROM sessions s

            INNER JOIN users u
                ON s.user_id = u.id

            WHERE
                s.session_token_hash = ?
                AND s.revoked = FALSE
                AND s.expires_at > NOW()
            `,
            [sessionHash]
        );

        if (rows.length === 0) {

            res.clearCookie("session_token");

            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again."
            });
        }

        const session = rows[0];

        if (!session.is_active) {

            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }

        req.user = {
            id: session.user_id,
            username: session.username,
            email: session.email,
            role: session.role,
            forcePasswordChange:
                session.force_password_change
        };

        req.session = {
            id: session.session_id,
            csrfTokenHash: session.csrf_token_hash
        };

        await pool.execute(
            `
            UPDATE sessions
            SET last_used_at = NOW()
            WHERE id = ?
            `,
            [session.id]
        );

        next();

    } catch (error) {

        console.error("Authentication error:", error);

        res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
}

module.exports = authenticate;