package com.obe.model;

public class CourseOutcome {
    private int id;
    private int subjectId;
    private String subjectCode;
    private String coCode; // e.g. "CO1"
    private String description;
    private double targetAttainmentPct;

    public CourseOutcome() {}

    public CourseOutcome(int id, int subjectId, String coCode, String description, double targetAttainmentPct) {
        this.id = id;
        this.subjectId = subjectId;
        this.coCode = coCode;
        this.description = description;
        this.targetAttainmentPct = targetAttainmentPct;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSubjectId() { return subjectId; }
    public void setSubjectId(int subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getCoCode() { return coCode; }
    public void setCoCode(String coCode) { this.coCode = coCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getTargetAttainmentPct() { return targetAttainmentPct; }
    public void setTargetAttainmentPct(double targetAttainmentPct) { this.targetAttainmentPct = targetAttainmentPct; }
}
