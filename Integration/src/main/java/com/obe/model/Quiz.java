package com.obe.model;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class Quiz {
    private int id;
    private int subjectId;
    private String subjectCode;
    private String subjectName;
    private int classId;
    private String className;
    private int facultyId;
    private String facultyName;
    private String title;
    private String description;
    private double totalMarks;
    private int durationMinutes;
    private Timestamp deadline;
    private boolean published;
    private Timestamp createdAt;
    private List<QuizQuestion> questions = new ArrayList<>();
    private boolean attemptedByCurrentUser;
    private Double userScore;

    public Quiz() {}

    public Quiz(int id, int subjectId, int classId, int facultyId, String title, String description,
                double totalMarks, int durationMinutes, Timestamp deadline, boolean published) {
        this.id = id;
        this.subjectId = subjectId;
        this.classId = classId;
        this.facultyId = facultyId;
        this.title = title;
        this.description = description;
        this.totalMarks = totalMarks;
        this.durationMinutes = durationMinutes;
        this.deadline = deadline;
        this.published = published;
    }

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

    public int getFacultyId() { return facultyId; }
    public void setFacultyId(int facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getTotalMarks() { return totalMarks; }
    public void setTotalMarks(double totalMarks) { this.totalMarks = totalMarks; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public Timestamp getDeadline() { return deadline; }
    public void setDeadline(Timestamp deadline) { this.deadline = deadline; }

    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public List<QuizQuestion> getQuestions() { return questions; }
    public void setQuestions(List<QuizQuestion> questions) { this.questions = questions; }

    public boolean isAttemptedByCurrentUser() { return attemptedByCurrentUser; }
    public void setAttemptedByCurrentUser(boolean attempted) { this.attemptedByCurrentUser = attempted; }

    public Double getUserScore() { return userScore; }
    public void setUserScore(Double userScore) { this.userScore = userScore; }
}
