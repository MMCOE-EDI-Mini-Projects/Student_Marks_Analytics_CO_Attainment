package com.obe.model;

import java.sql.Date;

public class PracticalAssessment extends Assessment {
    public PracticalAssessment() {
        super();
        setType("PRACTICAL");
    }

    public PracticalAssessment(int id, int subjectId, int batchId, int facultyId, String title, double totalMarks, double weightage, Date assessmentDate) {
        super(id, subjectId, batchId, facultyId, title, "PRACTICAL", totalMarks, weightage, assessmentDate);
    }

    @Override
    public String getAssessmentCategory() {
        return "Laboratory & Practical Work";
    }

    @Override
    public boolean requiresQuestionsBreakdown() {
        return true;
    }
}
