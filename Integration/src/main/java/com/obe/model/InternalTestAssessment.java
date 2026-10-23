package com.obe.model;

import java.sql.Date;

public class InternalTestAssessment extends Assessment {
    public InternalTestAssessment() {
        super();
        setType("INTERNAL_TEST");
    }

    public InternalTestAssessment(int id, int subjectId, int batchId, int facultyId, String title, double totalMarks, double weightage, Date assessmentDate) {
        super(id, subjectId, batchId, facultyId, title, "INTERNAL_TEST", totalMarks, weightage, assessmentDate);
    }

    @Override
    public String getAssessmentCategory() {
        return "Internal Formative Examination";
    }

    @Override
    public boolean requiresQuestionsBreakdown() {
        return true;
    }
}
