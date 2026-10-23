package com.obe.model;

import java.sql.Date;

public class Attendance {
    private int id;
    private int subjectId;
    private String subjectCode;
    private int classId;
    private String className;
    private int studentId;
    private String studentRollNumber;
    private String studentName;
    private Date attendanceDate;
    private String status; // "PRESENT", "ABSENT", "LATE"

    public Attendance() {}

    public Attendance(int id, int subjectId, int classId, int studentId, Date attendanceDate, String status) {
        this.id = id;
        this.subjectId = subjectId;
        this.classId = classId;
        this.studentId = studentId;
        this.attendanceDate = attendanceDate;
        this.status = status;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSubjectId() { return subjectId; }
    public void setSubjectId(int subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public int getClassId() { return classId; }
    public void setClassId(int classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    // Backward compatibility aliases
    public int getBatchId() { return classId; }
    public void setBatchId(int batchId) { this.classId = batchId; }
    public String getBatchName() { return className; }
    public void setBatchName(String batchName) { this.className = batchName; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getStudentRollNumber() { return studentRollNumber; }
    public void setStudentRollNumber(String studentRollNumber) { this.studentRollNumber = studentRollNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Date getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(Date attendanceDate) { this.attendanceDate = attendanceDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
