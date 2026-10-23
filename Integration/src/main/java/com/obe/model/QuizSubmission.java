package com.obe.model;

import java.sql.Timestamp;

public class QuizSubmission {
    private int id;
    private int quizId;
    private int studentId;
    private String studentName;
    private String studentRollNumber;
    private double score;
    private double totalScore;
    private String answersJson;
    private Timestamp submittedAt;

    public QuizSubmission() {}

    public QuizSubmission(int id, int quizId, int studentId, double score, double totalScore, String answersJson) {
        this.id = id;
        this.quizId = quizId;
        this.studentId = studentId;
        this.score = score;
        this.totalScore = totalScore;
        this.answersJson = answersJson;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getQuizId() { return quizId; }
    public void setQuizId(int quizId) { this.quizId = quizId; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRollNumber() { return studentRollNumber; }
    public void setStudentRollNumber(String studentRollNumber) { this.studentRollNumber = studentRollNumber; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public double getTotalScore() { return totalScore; }
    public void setTotalScore(double totalScore) { this.totalScore = totalScore; }

    public String getAnswersJson() { return answersJson; }
    public void setAnswersJson(String answersJson) { this.answersJson = answersJson; }

    public Timestamp getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Timestamp submittedAt) { this.submittedAt = submittedAt; }
}
