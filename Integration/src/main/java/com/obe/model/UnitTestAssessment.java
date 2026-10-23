package com.obe.model;

import java.sql.Date;

public class UnitTestAssessment extends Assessment {
    public UnitTestAssessment() {
        super();
        setType("UNIT_TEST");
    }

    public UnitTestAssessment(int id, int subjectId, int batchId, int facultyId, String title, double totalMarks, double weightage, Date assessmentDate) {
        super(id, subjectId, batchId, facultyId, title, "UNIT_TEST", totalMarks, weightage, assessmentDate);
    }

    @Override
    public String getAssessmentCategory() {
        return "Unit Evaluation Test";
    }

    @Override
    public boolean requiresQuestionsBreakdown() {
        return true;
    }
}
