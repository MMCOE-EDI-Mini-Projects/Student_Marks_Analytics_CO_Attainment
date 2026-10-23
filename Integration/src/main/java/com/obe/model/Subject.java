package com.obe.model;

public class Subject {
    private int id;
    private int departmentId;
    private String departmentCode;
    private int classId;
    private String className;
    private String code;
    private String name;
    private int credits;
    private int semester;
    private String subjectType; // "THEORY", "PRACTICAL", "HYBRID", "PROJECT"

    public Subject() {}

    public Subject(int id, int departmentId, int classId, String code, String name, int credits, int semester, String subjectType) {
        this.id = id;
        this.departmentId = departmentId;
        this.classId = classId;
        this.code = code;
        this.name = name;
        this.credits = credits;
        this.semester = semester;
        this.subjectType = subjectType;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getDepartmentId() { return departmentId; }
    public void setDepartmentId(int departmentId) { this.departmentId = departmentId; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public int getClassId() { return classId; }
    public void setClassId(int classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    // Backward compatibility aliases
    public int getBatchId() { return classId; }
    public void setBatchId(int batchId) { this.classId = batchId; }
    public String getBatchName() { return className; }
    public void setBatchName(String batchName) { this.className = batchName; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public String getSubjectType() { return subjectType; }
    public void setSubjectType(String subjectType) { this.subjectType = subjectType; }
}
