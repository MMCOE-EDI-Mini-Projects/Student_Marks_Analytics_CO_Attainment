const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

require("dotenv").config();

const { testConnection } = require("./config/db");

const authRoutes =
    require("./routes/authRoutes");

const adminRoutes =
    require("./routes/adminRoutes");

const facultyRoutes =
    require("./routes/facultyRoutes");

const studentRoutes =
    require("./routes/studentRoutes");


const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
    cors({
        origin: "http://localhost:5000",
        credentials: true
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cookieParser());


// ==========================================
// FRONTEND
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


// MAIN PAGE
// Automatically show login page

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../frontend/login.html"
        )
    );

});


// ==========================================
// API ROUTES
// ==========================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/faculty",
    facultyRoutes
);

app.use(
    "/api/student",
    studentRoutes
);


// ==========================================
// HEALTH CHECK
// ==========================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            success: true,
            message: "Server is running"
        });

    }
);


// ==========================================
// ERROR HANDLER
// ==========================================

app.use(
    (err, req, res, next) => {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
);


// ==========================================
// START SERVER
// ==========================================

const PORT =
    process.env.PORT || 5000;


async function startServer() {

    await testConnection();

    app.listen(
        PORT,
        () => {

            console.log(
                `Server running at http://localhost:${PORT}`
            );

        }
    );

}

startServer();