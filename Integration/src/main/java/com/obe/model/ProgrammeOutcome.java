package com.obe.model;

public class ProgrammeOutcome {
    private int id;
    private int departmentId;
    private String departmentCode;
    private String poCode; // e.g. "PO1"
    private String title;
    private String description;

    public ProgrammeOutcome() {}

    public ProgrammeOutcome(int id, int departmentId, String poCode, String title, String description) {
        this.id = id;
        this.departmentId = departmentId;
        this.poCode = poCode;
        this.title = title;
        this.description = description;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getDepartmentId() { return departmentId; }
    public void setDepartmentId(int departmentId) { this.departmentId = departmentId; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getPoCode() { return poCode; }
    public void setPoCode(String poCode) { this.poCode = poCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
