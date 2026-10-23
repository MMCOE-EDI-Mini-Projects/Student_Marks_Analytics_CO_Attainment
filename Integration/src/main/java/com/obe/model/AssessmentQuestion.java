package com.obe.model;

public class AssessmentQuestion {
    private int id;
    private int assessmentId;
    private String questionNumber; // e.g. "Q1a"
    private String questionText;
    private double maxMarks;
    private int coId;
    private String coCode;

    public AssessmentQuestion() {}

    public AssessmentQuestion(int id, int assessmentId, String questionNumber, String questionText, double maxMarks, int coId) {
        this.id = id;
        this.assessmentId = assessmentId;
        this.questionNumber = questionNumber;
        this.questionText = questionText;
        this.maxMarks = maxMarks;
        this.coId = coId;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getAssessmentId() { return assessmentId; }
    public void setAssessmentId(int assessmentId) { this.assessmentId = assessmentId; }

    public String getQuestionNumber() { return questionNumber; }
    public void setQuestionNumber(String questionNumber) { this.questionNumber = questionNumber; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public double getMaxMarks() { return maxMarks; }
    public void setMaxMarks(double maxMarks) { this.maxMarks = maxMarks; }

    public int getCoId() { return coId; }
    public void setCoId(int coId) { this.coId = coId; }

    public String getCoCode() { return coCode; }
    public void setCoCode(String coCode) { this.coCode = coCode; }
}
