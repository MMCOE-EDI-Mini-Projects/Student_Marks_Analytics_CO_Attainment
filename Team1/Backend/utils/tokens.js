const crypto = require("crypto");

function generateToken() {
    return crypto.randomBytes(48).toString("hex");
}

function hashToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

module.exports = {
    generateToken,
    hashToken
};