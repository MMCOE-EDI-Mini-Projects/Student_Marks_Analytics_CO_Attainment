const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const csrf = require("../middleware/csrfMiddleware");

const {
    login,
    signup,
    me,
    logout,
    logoutAll,
    changePassword
} = require("../controllers/authController");


// ==========================================
// PUBLIC ROUTES
// ==========================================

// Login
router.post(
    "/login",
    login
);


// Signup
router.post(
    "/signup",
    signup
);


// ==========================================
// PROTECTED ROUTES
// ==========================================

// Get logged-in user
router.get(
    "/me",
    authenticate,
    me
);


// Logout
router.post(
    "/logout",
    authenticate,
    csrf,
    logout
);


// Logout from all devices
router.post(
    "/logout-all",
    authenticate,
    csrf,
    logoutAll
);


// Change password
router.post(
    "/change-password",
    authenticate,
    csrf,
    changePassword
);


module.exports = router;