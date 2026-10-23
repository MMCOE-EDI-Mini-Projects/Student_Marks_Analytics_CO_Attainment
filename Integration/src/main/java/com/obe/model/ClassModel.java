package com.obe.model;

import java.sql.Timestamp;

public class ClassModel {
    private int id;
    private int departmentId;
    private String departmentCode;
    private String departmentName;
    private String name;
    private String academicYear;
    private int semester;
    private Timestamp createdAt;

    public ClassModel() {}

    public ClassModel(int id, int departmentId, String name, String academicYear, int semester) {
        this.id = id;
        this.departmentId = departmentId;
        this.name = name;
        this.academicYear = academicYear;
        this.semester = semester;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getClassId() { return id; }
    public void setClassId(int id) { this.id = id; }

    public int getDepartmentId() { return departmentId; }
    public void setDepartmentId(int departmentId) { this.departmentId = departmentId; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getClassName() { return name; }
    public void setClassName(String name) { this.name = name; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
