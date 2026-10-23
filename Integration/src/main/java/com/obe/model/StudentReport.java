package com.obe.model;

import java.sql.Timestamp;

public class StudentReport {
    private int id;
    private int studentId;
    private String studentName;
    private String studentRollNumber;
    private int classId;
    private String className;
    private int subjectId;
    private String subjectCode;
    private String subjectName;
    private int facultyId;
    private String facultyName;
    private String title;
    private String academicYear;
    private String reportSummary;
    private String coAttainmentJson;
    private String marksSummaryJson;
    private String status; // "DRAFT", "PUBLISHED"
    private Timestamp publishedAt;

    public StudentReport() {}

    public StudentReport(int id, int studentId, int classId, int subjectId, int facultyId,
                         String title, String academicYear, String reportSummary,
                         String coAttainmentJson, String marksSummaryJson, String status) {
        this.id = id;
        this.studentId = studentId;
        this.classId = classId;
        this.subjectId = subjectId;
        this.facultyId = facultyId;
        this.title = title;
        this.academicYear = academicYear;
        this.reportSummary = reportSummary;
        this.coAttainmentJson = coAttainmentJson;
        this.marksSummaryJson = marksSummaryJson;
        this.status = status;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRollNumber() { return studentRollNumber; }
    public void setStudentRollNumber(String studentRollNumber) { this.studentRollNumber = studentRollNumber; }

    public int getClassId() { return classId; }
    public void setClassId(int classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public int getSubjectId() { return subjectId; }
    public void setSubjectId(int subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public int getFacultyId() { return facultyId; }
    public void setFacultyId(int facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getReportSummary() { return reportSummary; }
    public void setReportSummary(String reportSummary) { this.reportSummary = reportSummary; }

    public String getCoAttainmentJson() { return coAttainmentJson; }
    public void setCoAttainmentJson(String coAttainmentJson) { this.coAttainmentJson = coAttainmentJson; }

    public String getMarksSummaryJson() { return marksSummaryJson; }
    public void setMarksSummaryJson(String marksSummaryJson) { this.marksSummaryJson = marksSummaryJson; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Timestamp getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Timestamp publishedAt) { this.publishedAt = publishedAt; }
}
