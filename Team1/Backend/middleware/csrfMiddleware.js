const crypto = require("crypto");

function hashCSRF(token) {

    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

async function verifyCSRF(req, res, next) {

    try {

        const safeMethods = [
            "GET",
            "HEAD",
            "OPTIONS"
        ];

        if (safeMethods.includes(req.method)) {
            return next();
        }

        const csrfToken =
            req.headers["x-csrf-token"];

        if (!csrfToken) {

            return res.status(403).json({
                success: false,
                message: "CSRF token missing"
            });
        }

        const incomingHash =
            hashCSRF(csrfToken);

        if (
            incomingHash !==
            req.session.csrfTokenHash
        ) {

            return res.status(403).json({
                success: false,
                message: "Invalid CSRF token"
            });
        }

        next();

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "CSRF validation failed"
        });
    }
}

module.exports = verifyCSRF;