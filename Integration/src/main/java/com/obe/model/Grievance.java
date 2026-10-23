package com.obe.model;

import java.sql.Timestamp;

public class Grievance {
    private int id;
    private int studentId;
    private String studentName;
    private String studentRollNumber;
    private int classId;
    private String className;
    private Integer subjectId;
    private String subjectCode;
    private String subjectName;
    private String category; // "MARKS", "ASSESSMENT", "ATTENDANCE", "ACADEMIC_OTHER"
    private String title;
    private String description;
    private String status; // "OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"
    private String facultyResponse;
    private Integer resolvedByFacultyId;
    private String resolvedByFacultyName;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public Grievance() {}

    public Grievance(int id, int studentId, int classId, Integer subjectId, String category,
                     String title, String description, String status) {
        this.id = id;
        this.studentId = studentId;
        this.classId = classId;
        this.subjectId = subjectId;
        this.category = category;
        this.title = title;
        this.description = description;
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

    public Integer getSubjectId() { return subjectId; }
    public void setSubjectId(Integer subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFacultyResponse() { return facultyResponse; }
    public void setFacultyResponse(String facultyResponse) { this.facultyResponse = facultyResponse; }

    public Integer getResolvedByFacultyId() { return resolvedByFacultyId; }
    public void setResolvedByFacultyId(Integer resolvedByFacultyId) { this.resolvedByFacultyId = resolvedByFacultyId; }

    public String getResolvedByFacultyName() { return resolvedByFacultyName; }
    public void setResolvedByFacultyName(String resolvedByFacultyName) { this.resolvedByFacultyName = resolvedByFacultyName; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
