const express = require("express");

const router = express.Router();

const authenticate =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/roleMiddleware");

const csrf =
    require("../middleware/csrfMiddleware");


// Faculty dashboard

router.get(
    "/dashboard",

    authenticate,

    authorize("FACULTY", "ADMIN"),

    async (req, res) => {

        res.json({
            success: true,

            message:
                "Faculty dashboard",

            user: req.user
        });
    }
);


// Add marks

router.post(
    "/marks",

    authenticate,

    authorize("FACULTY", "ADMIN"),

    csrf,

    async (req, res) => {

        const {
            student_id,
            subject_id,
            marks
        } = req.body;


        if (
            !student_id ||
            !subject_id ||
            marks === undefined
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Student, subject and marks required"
            });
        }


        // Later connect this with marks table.

        res.json({
            success: true,
            message: "Marks received successfully",
            data: {
                student_id,
                subject_id,
                marks
            }
        });
    }
);


module.exports = router;