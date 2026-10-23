package com.obe.model;

import java.sql.Timestamp;

public class FacultyAssignment {
    private int id;
    private int facultyId;
    private String facultyName;
    private int subjectId;
    private String subjectCode;
    private String subjectName;
    private int classId;
    private String className;
    private String academicYear;
    private Timestamp assignedAt;

    public FacultyAssignment() {}

    public FacultyAssignment(int id, int facultyId, int subjectId, int classId, String academicYear) {
        this.id = id;
        this.facultyId = facultyId;
        this.subjectId = subjectId;
        this.classId = classId;
        this.academicYear = academicYear;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getFacultyId() { return facultyId; }
    public void setFacultyId(int facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public int getSubjectId() { return subjectId; }
    public void setSubjectId(int subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public int getClassId() { return classId; }
    public void setClassId(int classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    // Backward compatibility aliases
    public int getBatchId() { return classId; }
    public void setBatchId(int batchId) { this.classId = batchId; }
    public String getBatchName() { return className; }
    public void setBatchName(String batchName) { this.className = batchName; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public Timestamp getAssignedAt() { return assignedAt; }
    public void setAssignedAt(Timestamp assignedAt) { this.assignedAt = assignedAt; }
}
