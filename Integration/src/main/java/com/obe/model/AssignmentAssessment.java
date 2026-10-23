package com.obe.model;

import java.sql.Date;

public class AssignmentAssessment extends Assessment {
    public AssignmentAssessment() {
        super();
        setType("ASSIGNMENT");
    }

    public AssignmentAssessment(int id, int subjectId, int batchId, int facultyId, String title, double totalMarks, double weightage, Date assessmentDate) {
        super(id, subjectId, batchId, facultyId, title, "ASSIGNMENT", totalMarks, weightage, assessmentDate);
    }

    @Override
    public String getAssessmentCategory() {
        return "Continuous Assignment";
    }

    @Override
    public boolean requiresQuestionsBreakdown() {
        return false;
    }
}
