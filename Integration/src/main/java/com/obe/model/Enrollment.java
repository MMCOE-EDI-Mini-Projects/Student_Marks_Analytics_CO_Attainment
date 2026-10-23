package com.obe.model;

import java.sql.Timestamp;

public class Enrollment {
    private int id;
    private int studentId;
    private String studentRollNumber;
    private String studentName;
    private int subjectId;
    private String subjectCode;
    private String subjectName;
    private int classId;
    private String className;
    private String status; // "ENROLLED", "COMPLETED", "DROPPED"
    private Timestamp enrolledAt;

    public Enrollment() {}

    public Enrollment(int id, int studentId, int subjectId, int classId, String status) {
        this.id = id;
        this.studentId = studentId;
        this.subjectId = subjectId;
        this.classId = classId;
        this.status = status;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getStudentRollNumber() { return studentRollNumber; }
    public void setStudentRollNumber(String studentRollNumber) { this.studentRollNumber = studentRollNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Timestamp getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(Timestamp enrolledAt) { this.enrolledAt = enrolledAt; }
}
