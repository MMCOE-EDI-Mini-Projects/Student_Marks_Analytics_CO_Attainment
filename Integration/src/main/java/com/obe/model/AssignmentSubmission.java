package com.obe.model;

import java.sql.Timestamp;

public class AssignmentSubmission {
    private int id;
    private int assessmentId;
    private String assessmentTitle;
    private int studentId;
    private String studentName;
    private String studentRollNumber;
    private String submissionText;
    private String submissionFile;
    private Timestamp submittedAt;
    private Double marksAwarded;
    private String feedback;

    public AssignmentSubmission() {}

    public AssignmentSubmission(int id, int assessmentId, int studentId, String submissionText, String submissionFile) {
        this.id = id;
        this.assessmentId = assessmentId;
        this.studentId = studentId;
        this.submissionText = submissionText;
        this.submissionFile = submissionFile;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getAssessmentId() { return assessmentId; }
    public void setAssessmentId(int assessmentId) { this.assessmentId = assessmentId; }

    public String getAssessmentTitle() { return assessmentTitle; }
    public void setAssessmentTitle(String assessmentTitle) { this.assessmentTitle = assessmentTitle; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRollNumber() { return studentRollNumber; }
    public void setStudentRollNumber(String studentRollNumber) { this.studentRollNumber = studentRollNumber; }

    public String getSubmissionText() { return submissionText; }
    public void setSubmissionText(String submissionText) { this.submissionText = submissionText; }

    public String getSubmissionFile() { return submissionFile; }
    public void setSubmissionFile(String submissionFile) { this.submissionFile = submissionFile; }

    public Timestamp getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Timestamp submittedAt) { this.submittedAt = submittedAt; }

    public Double getMarksAwarded() { return marksAwarded; }
    public void setMarksAwarded(Double marksAwarded) { this.marksAwarded = marksAwarded; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}
