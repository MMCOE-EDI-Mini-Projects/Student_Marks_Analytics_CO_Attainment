# Student Marks Analytics and CO Attainment Tool

A comprehensive web-based academic analytics platform that digitizes student assessment records, automates Course Outcome (CO) and Programme Outcome (PO) attainment calculations, and provides interactive dashboards, reports, and analytics for Outcome-Based Education (OBE). The project demonstrates practical implementation of **Object-Oriented Programming, Database Management Systems, Data Structures, Software Engineering, Web Technologies, and Principles of Programming Languages.**

---

# Table of Contents

* Overview
* Problem Statement
* Objectives
* Key Features
* Technology Stack
* Software Engineering Concepts Applied
* System Architecture
* Module Division
* System Workflow
* User Roles
* Functional Requirements
* Non-Functional Requirements
* Database Design
* Project Structure
* Installation
* Usage
* Future Enhancements
* Team Allocation
* License

---

# Overview

The **Student Marks Analytics and CO Attainment Tool** is designed to simplify academic assessment management by replacing manual spreadsheet-based record keeping with an integrated web application.

The system enables institutions to maintain student information, subjects, assessments, marks, Course Outcomes (COs), and Programme Outcomes (POs) within a centralized database. It automatically computes attainment levels, generates performance analytics, and produces downloadable reports for faculty, students, department heads, and accreditation bodies such as **NBA** and **NAAC**.

The application follows a modular software engineering architecture where each subsystem performs an independent responsibility while collaborating with other modules to provide a scalable academic management solution.

---

# Problem Statement

Many educational institutions still rely on multiple Excel sheets or manual records to maintain student assessment data and Course Outcome attainment. This leads to several challenges:

* Duplicate and inconsistent academic records
* Time-consuming manual calculations
* Difficulty tracking student performance trends
* Errors during CO and PO attainment calculations
* Lack of centralized data management
* Limited visualization of academic analytics
* Increased workload during NBA and NAAC accreditation

The **Student Marks Analytics and CO Attainment Tool** addresses these issues by providing an automated, centralized, and intelligent academic analytics system capable of storing assessment data, computing attainment metrics, generating reports, and presenting meaningful insights through interactive dashboards.

---

# Objectives

The primary objectives of the project are:

* Design a normalized academic database for storing students, faculty, subjects, assessments, marks, COs, and POs.
* Automate CO and PO attainment calculations using efficient algorithms.
* Develop a secure role-based web application.
* Generate analytical dashboards for academic performance.
* Export reports in PDF and Excel formats.
* Reduce manual effort and calculation errors.
* Improve decision making through visual analytics.
* Follow Software Engineering best practices throughout development.

---

# Key Features

* Secure Login & Authentication
* Role-Based Access Control
* Student Management
* Faculty Management
* Subject Management
* Assessment Management
* Marks Entry
* Bulk CSV/Excel Upload
* Automatic Grade Calculation
* CO Mapping
* PO Mapping
* CO Attainment Calculation
* PO Attainment Calculation
* Student Performance Analytics
* Class Performance Analytics
* Interactive Charts & Graphs
* PDF Report Generation
* Excel Export
* Dashboard for Students
* Dashboard for Faculty
* Dashboard for Admin
* Search & Filtering
* Data Validation
* Responsive Web Interface

---

# Technology Stack

## Programming Languages

* Java
* SQL
* JavaScript

## Frontend

* HTML5
* CSS3
* JavaScript

## Backend



## Database

* MySQL

## Visualization

* Chart.js

## Version Control

* Git
* GitHub

---

# Software Engineering Concepts Applied

The project demonstrates concepts from multiple Computer Engineering subjects.

| Subject                             | Implementation                                               |
| ----------------------------------- | ------------------------------------------------------------ |
| Object Oriented Programming         | User hierarchy, inheritance, encapsulation, polymorphism     |
| Database Management Systems         | Relational database, normalization, SQL queries, constraints |
| Data Structures                     | Arrays, Lists, HashMaps, Matrix representation               |
| Software Engineering                | SDLC, Modular Design, Testing, Documentation                 |
| Web Technology                      | REST APIs, HTML, CSS, JavaScript, Responsive UI              |
| Principles of Programming Languages | Exception handling, modular programming, abstraction         |

---

# System Architecture

```
               Users
(Admin / Faculty / Student)
            │
            ▼
 Authentication Module
            │
            ▼
 Academic Management
            │
            ▼
 Assessment & Marks Module
            │
            ▼
 CO/PO Mapping Engine
            │
            ▼
 Analytics & Attainment Engine
          ╱             ╲
         ▼               ▼
 Report Generator   Dashboard UI
         │               │
         └──────► Database ◄──────┘
```

---

# Module Division

## Module 1: User & Authentication Management

**Primarily draws from:** OOP + Web Technology
**Team Members:** **Om, Ritesh, Aayush**

This module is responsible for managing user accounts and providing secure access to the system through role-based authentication. It implements separate user roles such as **Admin, Faculty, and Student**, ensuring that each user can only access the functionalities assigned to their role. The module includes user registration, secure login and logout, password encryption, session/JWT-based authentication, and profile management. It serves as the entry point of the application and establishes a secure environment for all other modules by enforcing authentication and authorization mechanisms.

---

## Module 2: Academic Master Data Management

**Primarily draws from:** DBMS + OOP
**Team Members:** **Om, Ritesh, Aayush**

This module manages all fundamental academic information required by the system. It provides CRUD operations for **Students, Faculty, Subjects, Departments, Batches, Semesters, and Enrollments** while maintaining data consistency using a normalized relational database. The module ensures referential integrity between academic entities and serves as the central repository for all master data used by other modules. Object-oriented domain classes are mapped to database tables, enabling efficient storage, retrieval, and management of academic records.

---

## Module 3: CO/PO Definition & Mapping

**Primarily draws from:** DBMS + Data Structures
**Team Members:** **Asmi, Niraj, Parth**

This module enables the creation and management of **Course Outcomes (COs)** and **Programme Outcomes (POs)** for different subjects and academic programs. It provides interfaces for defining COs, creating POs, and establishing mappings between them using predefined attainment levels and weightages. The CO–PO relationships are represented using matrix-based data structures, allowing efficient retrieval and computation during attainment analysis. The stored mapping information serves as the foundation for automatic CO and PO attainment calculations performed by the analytics engine.

---

## Module 4: Assessment & Marks Entry

**Primarily draws from:** OOP + DBMS
**Team Members:** **Asmi, Niraj, Parth**

This module is responsible for creating assessments and maintaining student marks throughout the academic semester. It supports multiple assessment types such as **Internal Tests, Assignments, Practicals, Unit Tests, and End-Semester Examinations** through polymorphic assessment classes. Faculty members can enter marks individually or upload them in bulk using CSV or Excel files. The module validates all input data, handles exceptions during data entry, and performs transaction-safe database operations to ensure accuracy and reliability of academic records.

---

## Module 5: Aggregation & CO/PO Attainment Engine

**Primarily draws from:** Data Structures + Principles of Programming Languages
**Team Members:** **Srujal, Atharva, Niranjan**

This module acts as the computational core of the application by processing assessment data and generating meaningful academic analytics. It computes statistics such as **class average, highest marks, lowest marks, pass percentage, grade distribution, student rankings, and subject-wise performance** using efficient data structures like arrays, lists, and HashMaps. The module also implements weighted algorithms and strategy-based computation methods to automatically calculate **Course Outcome (CO)** and **Programme Outcome (PO)** attainment levels. The implementation focuses on optimized performance and scalability to efficiently process large batches of student records.

---

## Module 6: Dashboard & Visualization

**Primarily draws from:** Web Technology
**Team Members:** **Janhavi, Krisha, Renuka**

This module provides interactive and role-based dashboards that present academic data in a clear and visually appealing manner. Separate dashboards are developed for **Admin, Faculty, and Student** users, displaying analytics through charts, graphs, tables, and performance indicators. The module retrieves data using REST APIs and dynamically updates visualizations without requiring full page reloads. Responsive web design principles are applied to ensure seamless access across desktops, tablets, and mobile devices while providing an intuitive user experience.

---

## Module 7: Report Generation & Export

**Primarily draws from:** Web Technology + Software Engineering
**Team Members:** **Janhavi, Krisha, Renuka**

This module automates the generation of academic reports required by students, faculty, departments, and accreditation bodies. It prepares standardized reports such as **individual mark sheets, class performance reports, subject-wise analysis reports, CO attainment reports, and PO attainment reports**. The module supports exporting reports in **PDF and Excel** formats using server-side report generation libraries. Template-based report formatting ensures consistency, readability, and compliance with institutional documentation requirements.

---

## Module 8: Testing, Documentation & Deployment

**Primarily draws from:** Software Engineering
**Team Members:** **Srujal, Atharva, Niranjan**

This module focuses on ensuring the overall quality, reliability, and maintainability of the software system. It includes **unit testing** of individual components, **integration testing** of end-to-end workflows, and **User Acceptance Testing (UAT)** using sample academic data to validate system functionality. In addition, the module is responsible for preparing comprehensive project documentation, including the **Software Requirements Specification (SRS), UML diagrams, design documents, testing reports, deployment guidelines, and user manuals**. It also manages version control, deployment configuration, and final project packaging to ensure a smooth software delivery process.


---

# System Workflow

```
Admin / Faculty Login
          │
          ▼
 Academic Data Management
          │
          ▼
 Assessment Creation
          │
          ▼
 Marks Entry
          │
          ▼
 CO & PO Mapping
          │
          ▼
 Analytics Engine
       ╱         ╲
      ▼           ▼
 Dashboard     Reports
          │
          ▼
      MySQL Database
```

---

# User Roles

### Admin

* Manage Users
* Manage Faculty
* Manage Students
* Manage Subjects
* Configure CO/PO Mapping
* Generate Reports

---

### Faculty

* Create Assessments
* Enter Marks
* View Analytics
* Generate Reports

---

### Student

* View Marks
* View Grades
* View CO Attainment
* Download Marksheet
* Track Academic Progress

---

# Functional Requirements

* User Authentication
* Student Management
* Faculty Management
* Subject Management
* Assessment Management
* Marks Management
* CO Definition
* PO Definition
* CO–PO Mapping
* Analytics Generation
* Dashboard Visualization
* Report Generation
* PDF Export
* Excel Export

---

# Non-Functional Requirements

* Secure Authentication
* High Performance
* Scalability
* Data Integrity
* Reliability
* Maintainability
* Responsive Design
* Easy Navigation
* Modular Architecture
* Database Consistency

---

# Database Design

## Users

* User ID
* Name
* Email
* Password
* Role

---

## Students

* Student ID
* PRN
* Name
* Batch
* Semester

---

## Faculty

* Faculty ID
* Name
* Department

---

## Subjects

* Subject ID
* Subject Name
* Semester

---

## Assessments

* Assessment ID
* Assessment Type
* Subject ID
* Maximum Marks

---

## Marks

* Marks ID
* Student ID
* Assessment ID
* Obtained Marks

---

## Course Outcomes (CO)

* CO ID
* Description
* Subject ID

---

## Programme Outcomes (PO)

* PO ID
* Description

---

## CO–PO Mapping

* Mapping ID
* CO ID
* PO ID
* Weightage

---

# Project Structure

```
Student-Marks-Analytics-CO-Attainment-Tool/

├── backend/
├── frontend/
├── database/
├── reports/
├── docs/
├── tests/
├── screenshots/
├── api/
├── README.md
└── LICENSE
```

---

# Installation

```bash
git clone https://github.com/yourusername/Student-Marks-Analytics-and-CO-Attainment-Tool.git

cd Student-Marks-Analytics-and-CO-Attainment-Tool
```

Install backend dependencies, configure the MySQL database, and run the application server.

---

# Usage

1. Start the backend server.
2. Configure the MySQL database.
3. Launch the frontend application.
4. Login as Admin, Faculty, or Student.
5. Manage academic records.
6. Enter assessment marks.
7. View dashboards and analytics.
8. Generate PDF or Excel reports.

---

# Future Enhancements

* AI-based student performance prediction
* Machine Learning recommendation system
* Attendance integration
* Email & SMS notifications
* Mobile application
* Multi-college support
* Cloud deployment
* Role-based audit logs
* Real-time analytics using WebSockets
* ERP/LMS integration (Moodle, Google Classroom)

---

# License

This project is developed as part of the **Engineering Design & Innovation Mini Project** for academic purposes. It demonstrates the practical application of core Computer Engineering concepts, including **Object-Oriented Programming, Database Management Systems, Data Structures, Software Engineering, Web Technologies, and Principles of Programming Languages**, to solve real-world academic outcome assessment and analytics challenges.
