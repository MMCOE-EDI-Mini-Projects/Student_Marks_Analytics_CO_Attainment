package com.obe.model;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

public abstract class Assessment {
    private int id;
    private int subjectId;
    private String subjectCode;
    private String subjectName;
    private int classId;
    private String className;
    private int facultyId;
    private String facultyName;
    private String title;
    private String type; // "INTERNAL_TEST", "UNIT_TEST", "ASSIGNMENT", "PRACTICAL"
    private double totalMarks;
    private double weightage;
    private boolean published = true;
    private Date assessmentDate;
    private String instructions;
    private Date dueDate;
    private List<AssessmentQuestion> questions = new ArrayList<>();

    public Assessment() {}

    public Assessment(int id, int subjectId, int classId, int facultyId, String title, String type, double totalMarks, double weightage, Date assessmentDate) {
        this.id = id;
        this.subjectId = subjectId;
        this.classId = classId;
        this.facultyId = facultyId;
        this.title = title;
        this.type = type;
        this.totalMarks = totalMarks;
        this.weightage = weightage;
        this.assessmentDate = assessmentDate;
        this.published = true;
    }

    public abstract String getAssessmentCategory();
    public abstract boolean requiresQuestionsBreakdown();

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

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

    public int getFacultyId() { return facultyId; }
    public void setFacultyId(int facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public double getTotalMarks() { return totalMarks; }
    public void setTotalMarks(double totalMarks) { this.totalMarks = totalMarks; }

    public double getWeightage() { return weightage; }
    public void setWeightage(double weightage) { this.weightage = weightage; }

    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }

    public Date getAssessmentDate() { return assessmentDate; }
    public void setAssessmentDate(Date assessmentDate) { this.assessmentDate = assessmentDate; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public Date getDueDate() { return dueDate; }
    public void setDueDate(Date dueDate) { this.dueDate = dueDate; }

    public List<AssessmentQuestion> getQuestions() { return questions; }
    public void setQuestions(List<AssessmentQuestion> questions) { this.questions = questions; }
}
