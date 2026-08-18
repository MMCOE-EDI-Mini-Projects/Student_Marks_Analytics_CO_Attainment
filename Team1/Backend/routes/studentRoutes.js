const express = require("express");

const router = express.Router();

const authenticate =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/roleMiddleware");


// Student dashboard

router.get(
    "/dashboard",

    authenticate,

    authorize("STUDENT"),

    async (req, res) => {

        res.json({
            success: true,

            message:
                "Student dashboard",

            user: req.user
        });
    }
);


// Student marks

router.get(
    "/marks",

    authenticate,

    authorize("STUDENT"),

    async (req, res) => {

        // Important:
        // Never accept student_id
        // from frontend here.

        // Use req.user.id.

        res.json({
            success: true,

            message:
                "Return marks belonging to logged-in student",

            userId:
                req.user.id
        });
    }
);


module.exports = router;