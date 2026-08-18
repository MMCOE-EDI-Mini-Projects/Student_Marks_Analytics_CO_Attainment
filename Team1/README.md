🔐 Authentication & Authorization System

A full-stack authentication and authorization module built using HTML, CSS, JavaScript, Node.js, Express.js, and MySQL.

The system supports three roles:

Admin

Faculty

Student

🚀 Features

Login and Signup

Role-Based Access Control (RBAC)

Secure password hashing using bcrypt

Server-side session authentication

HttpOnly cookies

Account lockout after failed login attempts

Logout and Logout All Devices

Password change

CSRF protection

Audit logging

MySQL database integration

Protected role-based API routes

🛠️ Tech Stack

Frontend

HTML

CSS

JavaScript

Backend

Node.js

Express.js

Database

MySQL

Security

bcrypt

Server-side Sessions

HttpOnly Cookies

CSRF Protection

RBAC

📁 Project Structure

authentication/
│
├── frontend/
│   ├── login.html
│   ├── admin.html
│   ├── faculty.html
│   ├── student.html
│   ├── css/
│   └── js/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── database/
│   └── schema.sql
│
├── .gitignore
└── README.md

🔐 Authentication Flow

Login
  ↓
Verify User
  ↓
Verify Password
  ↓
Create Session
  ↓
Store Session in MySQL
  ↓
HttpOnly Cookie
  ↓
Authenticated User
  ↓
Check Role
  ↓
Admin / Faculty / Student

This project uses server-side sessions instead of JWT.

🗄️ Database

Database:

marks_analytics

Main tables:

users
admins
faculty
students
sessions
password_reset_tokens
audit_log

⚙️ Setup

1. Clone

git clone https://github.com/AayushJoshi8/authentication.git
cd authentication

2. Install dependencies

cd backend
npm install

3. Configure .env

Create backend/.env:

PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=marks_analytics

NODE_ENV=development

4. Setup database

Run database/schema.sql in MySQL Workbench.

5. Start server

npm run dev

Open:

http://localhost:5000

👤 Development Admin

Username: admin
Password: Admin@123

Create it using:

node createAdmin.js

👨‍💻 Author

Aayush Joshi

Computer Engineering Student
