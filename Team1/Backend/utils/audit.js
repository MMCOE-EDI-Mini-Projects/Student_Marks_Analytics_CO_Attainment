const { pool } = require("../config/db");

async function createAuditLog(
    userId,
    action,
    description,
    ipAddress
) {

    try {

        await pool.execute(
            `
            INSERT INTO audit_log
            (user_id, action, description, ip_address)
            VALUES (?, ?, ?, ?)
            `,
            [
                userId || null,
                action,
                description || null,
                ipAddress || null
            ]
        );

    } catch (error) {

        console.error(
            "Audit log error:",
            error.message
        );

    }
}

module.exports = {
    createAuditLog
};