# OBE Management System – CO-PO Attainment Platform

A fully functional, database-driven Outcome-Based Education (OBE) Management System built for colleges to calculate Course Outcome (CO) and Programme Outcome (PO) attainment, manage academic structures, enter student marks, record attendance, and export reports in PDF and Excel formats.

---

## 1. Technology Stack

* **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+ Single Page Application Architecture), Fetch API, Chart.js (CDN).
* **Backend**: Java Servlets (Jakarta EE / Servlet API 6.0), JDBC.
* **Database**: MySQL 8.0+.
* **Application Server**: Apache Tomcat 10+ / Tomcat 9.
* **Build System**: Apache Maven.
* **Libraries**:
  * `jbcrypt`: Password hashing.
  * `org.json` & `jackson-databind`: JSON serialization/deserialization.
  * `openpdf` (`com.github.librepdf:openpdf`): PDF report generation.
  * `poi-ooxml` (`org.apache.poi`): Excel import/export (.xlsx).

---

## 2. Default Seed Credentials

Upon executing the database schema script (`schema.sql`), the system is pre-seeded with default demo accounts:

| User Role | Username | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full access to departments, batches, subjects, faculty, students, and rules |
| **Faculty** | `faculty1` | `faculty123` | Dr. John Smith (CSE Professor & HOD) – Assessments, Marks, Attendance, CO-PO Engine |
| **Student** | `student1` | `student123` | Alice Johnson (Roll: CSE001) – Marksheets, Attendance, Profile |
| **Student** | `student2` | `student123` | Bob Williams (Roll: CSE002) – Marksheets, Attendance, Profile |

---

## 3. Prerequisites

Before running the application, make sure you have the following installed:

1. **Java Development Kit (JDK 17 or higher)**
2. **Apache Maven 3.8+**
3. **MySQL Server 8.0+**
4. **Apache Tomcat 10+** (or Tomcat 9.x)

---

## 4. How to Run the Application (Step-by-Step)

### Step 1: Database Setup
1. Open your MySQL terminal or client (e.g. MySQL Workbench, phpMyAdmin, DBeaver).
2. Execute the included `schema.sql` script to create the `obe_db` database, table structures, and initial seed data:
   ```bash
   mysql -u root -p < schema.sql
   ```
   If you already have an earlier `obe_db`, do **not** rerun the seed script over production data. Back up the database and apply [001_add_batch_compatibility.sql](migrations/001_add_batch_compatibility.sql) once instead.
   The bundled `SchemaMigrationRunner` performs the same non-destructive column/backfill migration when run with the application's JDBC configuration.

### Step 2: Database Configuration
Configure database connection settings in `src/main/resources/db.properties` or set environment variables:

```properties
# src/main/resources/db.properties
db.url=jdbc:mysql://localhost:3306/obe_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
db.user=root
db.password=root
```
*(Alternatively, set `DB_URL`, `DB_USER`, and `DB_PASS` in your environment).*

### Step 3: Build the Project with Maven
Open terminal in the project root directory and run:

```bash
mvn package -DskipTests
```

This compiles the 53+ Java source files and generates the web application package at:
```
target/obe-system.war
```

### Step 4: Deploy to Apache Tomcat
1. Copy the generated WAR file `target/obe-system.war` into Apache Tomcat's `webapps/` directory:
   ```bash
   cp target/obe-system.war /path/to/tomcat/webapps/
   ```
2. Start the Apache Tomcat server:
   * **Windows**: Run `bin/startup.bat`
   * **Linux/Mac**: Run `bin/startup.sh`

### Step 5: Access the Application
Open your browser and navigate to:
```
http://localhost:8080/obe-system/
```

---

## 5. Key Features & Role Capabilities

### 👑 Admin Module
* **Department & Batch Management**: Full CRUD operations for departments and batches (Academic Year, Semester, Division).
* **Subject Configuration**: Assign subjects to departments and batches with dependent dropdown filters.
* **Faculty & Student Accounts**: Create and manage faculty members and student user accounts with BCrypt encrypted passwords.
* **Faculty Assignments**: Assign faculty members to valid subjects and batches.
* **CO-PO Mapping Matrix**: Matrix editor to assign strength levels ($0 = \text{None}, 1 = \text{Low}, 2 = \text{Medium}, 3 = \text{High}$) between Course Outcomes (COs) and Programme Outcomes (POs).
* **Attainment Threshold Rules**: Configurable target percentages and level cutoffs ($Level 1, Level 2, Level 3$).
* **Account lifecycle controls**: Search, filter, edit, reset, activate/deactivate, and delete users from the user-management screen.

### 🎓 Faculty Module
* **Assessment Builder**: Create Internal Tests, Unit Tests, Assignments, and Practicals using polymorphic assessment objects, with question-to-CO mappings.
* **Objective quizzes**: Build timed, deadline-based quizzes, publish them to the assigned class, and review automatically scored submissions.
* **Marks Entry**: Interactive table grid to record student marks with client/server validation.
* **Daily Attendance**: Track daily class attendance (`PRESENT`, `ABSENT`, `LATE`).
* **CO-PO Attainment Calculation Engine**: Automated engine that computes CO attainment percentages, assigns levels, calculates PO attainment, renders Chart.js visualization graphs, and exports official reports in **PDF** and **Excel** formats.

### 👨‍🎓 Student Module
* **Personal Profile**: View academic profile details (Roll Number, Register Number, Department, Batch).
* **Marksheet & Results**: View detailed marks breakdowns by subject, assessment, and question.
* **Attendance Summary**: View subject-wise attendance percentages with visual threshold indicators.
* **Published reports and attainment**: View faculty-published individual reports and subject CO/PO indicators.

### Access controls

Every role-sensitive endpoint checks the current session and role. Faculty access is additionally constrained by a matching faculty assignment; students can only access their own enrolled class and subject records. Server-side validation requires positive marks, valid question totals, and valid CO-to-subject mappings before an assessment or quiz is created.

---

## 6. Directory Structure

```
Current/
├── pom.xml                       # Maven build file with dependencies
├── schema.sql                    # Normalized MySQL database schema & seed script
├── README.md                     # Project quickstart guide & setup instructions
├── COMPLETED_WORK.md             # In-depth architectural & API documentation
└── src/
    ├── main/
    │   ├── java/com/obe/
    │   │   ├── dao/              # JDBC Data Access Objects (UserDAO, AssessmentDAO, etc.)
    │   │   ├── model/            # User & Assessment abstract & concrete model hierarchy
    │   │   ├── service/          # AttainmentEngine & ReportService (PDF/Excel)
    │   │   ├── servlet/          # Servlets processing REST API requests
    │   │   └── util/             # SecurityUtil, PasswordUtil (BCrypt), DatabaseUtil
    │   ├── resources/
    │   │   └── db.properties     # Database connection parameters
    │   └── webapp/
    │       ├── css/style.css     # Custom responsive CSS
    │       ├── js/               # app.js, admin.js, faculty.js, student.js
    │       ├── WEB-INF/web.xml   # Web deployment descriptor
    │       └── index.html        # Main Single-Page Application container
```

---

## 7. Troubleshooting & Common Issues

* **Database Connection Failed**: Verify MySQL is running on port `3306` and credentials in `db.properties` match your local MySQL username/password.
* **Tomcat Port Conflict**: If Tomcat port `8080` is in use, modify port number in Tomcat's `conf/server.xml`.
* **Jakarta EE Compatibility**: Ensure Tomcat 10+ is used (support for `jakarta.servlet.*`).
