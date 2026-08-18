const bcrypt = require("bcryptjs");

async function hashPassword(password) {
    return await bcrypt.hash(password, 12);
}

async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

function validatePassword(password) {

    if (!password || password.length < 8) {
        return {
            valid: false,
            message: "Password must contain at least 8 characters"
        };
    }

    if (!/[A-Za-z]/.test(password)) {
        return {
            valid: false,
            message: "Password must contain at least one letter"
        };
    }

    if (!/[0-9]/.test(password)) {
        return {
            valid: false,
            message: "Password must contain at least one number"
        };
    }

    return {
        valid: true
    };
}

module.exports = {
    hashPassword,
    comparePassword,
    validatePassword
};