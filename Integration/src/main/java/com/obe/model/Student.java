package com.obe.model;

import java.sql.Date;

public class Student extends User {
    private int studentId;
    private int departmentId;
    private String departmentCode;
    private String departmentName;
    private int classId;
    private String className;
    private String rollNumber;
    private String registerNumber;
    private Date dateOfBirth;
    private String phone;

    public Student() {
        super();
        setRole("STUDENT");
    }

    public Student(int id, String username, String passwordHash, String email, String firstName, String lastName,
                   int studentId, int departmentId, int classId, String rollNumber, String registerNumber,
                   Date dateOfBirth, String phone) {
        super(id, username, passwordHash, email, "STUDENT", firstName, lastName);
        this.studentId = studentId;
        this.departmentId = departmentId;
        this.classId = classId;
        this.rollNumber = rollNumber;
        this.registerNumber = registerNumber;
        this.dateOfBirth = dateOfBirth;
        this.phone = phone;
    }

    @Override
    public String getRoleName() {
        return "Student";
    }

    @Override
    public String getDashboardRoute() {
        return "#student-dashboard";
    }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public int getDepartmentId() { return departmentId; }
    public void setDepartmentId(int departmentId) { this.departmentId = departmentId; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public int getClassId() { return classId; }
    public void setClassId(int classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    // Backward compatibility aliases
    public int getBatchId() { return classId; }
    public void setBatchId(int batchId) { this.classId = batchId; }
    public String getBatchName() { return className; }
    public void setBatchName(String batchName) { this.className = batchName; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public Date getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(Date dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
