package com.obe.model;

import java.sql.Timestamp;

public class StudentMark {
    private int id;
    private int assessmentId;
    private int questionId;
    private String questionNumber;
    private int studentId;
    private String studentRollNumber;
    private String studentName;
    private double marksObtained;
    private boolean isAbsent;
    private Timestamp recordedAt;

    public StudentMark() {}

    public StudentMark(int id, int assessmentId, int questionId, int studentId, double marksObtained, boolean isAbsent) {
        this.id = id;
        this.assessmentId = assessmentId;
        this.questionId = questionId;
        this.studentId = studentId;
        this.marksObtained = marksObtained;
        this.isAbsent = isAbsent;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getAssessmentId() { return assessmentId; }
    public void setAssessmentId(int assessmentId) { this.assessmentId = assessmentId; }

    public int getQuestionId() { return questionId; }
    public void setQuestionId(int questionId) { this.questionId = questionId; }

    public String getQuestionNumber() { return questionNumber; }
    public void setQuestionNumber(String questionNumber) { this.questionNumber = questionNumber; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getStudentRollNumber() { return studentRollNumber; }
    public void setStudentRollNumber(String studentRollNumber) { this.studentRollNumber = studentRollNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public double getMarksObtained() { return marksObtained; }
    public void setMarksObtained(double marksObtained) { this.marksObtained = marksObtained; }

    public boolean isAbsent() { return isAbsent; }
    public void setAbsent(boolean absent) { isAbsent = absent; }

    public Timestamp getRecordedAt() { return recordedAt; }
    public void setRecordedAt(Timestamp recordedAt) { this.recordedAt = recordedAt; }
}
