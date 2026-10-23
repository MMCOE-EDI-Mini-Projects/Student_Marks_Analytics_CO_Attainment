package com.obe.model;

import java.sql.Timestamp;

public class Batch {
    private int id;
    private int departmentId;
    private String departmentCode;
    private String departmentName;
    private String name;
    private String academicYear;
    private int semester;
    private String division;
    private Timestamp createdAt;

    public Batch() {}

    public Batch(int id, int departmentId, String name, String academicYear, int semester, String division) {
        this.id = id;
        this.departmentId = departmentId;
        this.name = name;
        this.academicYear = academicYear;
        this.semester = semester;
        this.division = division;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getDepartmentId() { return departmentId; }
    public void setDepartmentId(int departmentId) { this.departmentId = departmentId; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public String getDivision() { return division; }
    public void setDivision(String division) { this.division = division; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
