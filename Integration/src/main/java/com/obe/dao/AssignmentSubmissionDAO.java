package com.obe.dao;

import com.obe.model.AssignmentSubmission;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AssignmentSubmissionDAO {

    public boolean submitAssignment(AssignmentSubmission submission) throws SQLException {
        String sql = "INSERT INTO assignment_submissions (assessment_id, student_id, submission_text, submission_file) " +
                     "VALUES (?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE submission_text = VALUES(submission_text), submission_file = VALUES(submission_file), submitted_at = NOW()";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, submission.getAssessmentId());
            stmt.setInt(2, submission.getStudentId());
            stmt.setString(3, submission.getSubmissionText() != null ? submission.getSubmissionText().trim() : "");
            stmt.setString(4, submission.getSubmissionFile() != null ? submission.getSubmissionFile().trim() : "");
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) submission.setId(rs.getInt(1));
                }
                return true;
            }
        }
        return false;
    }

    public AssignmentSubmission getSubmissionByAssessmentAndStudent(int assessmentId, int studentId) throws SQLException {
        String sql = "SELECT sub.*, a.title as a_title, st.roll_number, u.first_name, u.last_name " +
                     "FROM assignment_submissions sub " +
                     "JOIN assessments a ON sub.assessment_id = a.id " +
                     "JOIN students st ON sub.student_id = st.id " +
                     "JOIN users u ON st.user_id = u.id " +
                     "WHERE sub.assessment_id = ? AND sub.student_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, assessmentId);
            stmt.setInt(2, studentId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapSubmission(rs);
                }
            }
        }
        return null;
    }

    public List<AssignmentSubmission> getSubmissionsByAssessment(int assessmentId) throws SQLException {
        List<AssignmentSubmission> list = new ArrayList<>();
        String sql = "SELECT sub.*, a.title as a_title, st.roll_number, u.first_name, u.last_name " +
                     "FROM assignment_submissions sub " +
                     "JOIN assessments a ON sub.assessment_id = a.id " +
                     "JOIN students st ON sub.student_id = st.id " +
                     "JOIN users u ON st.user_id = u.id " +
                     "WHERE sub.assessment_id = ? ORDER BY st.roll_number ASC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, assessmentId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapSubmission(rs));
                }
            }
        }
        return list;
    }

    public boolean gradeSubmission(int submissionId, double marksAwarded, String feedback) throws SQLException {
        String sql = "UPDATE assignment_submissions SET marks_awarded = ?, feedback = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setDouble(1, marksAwarded);
            stmt.setString(2, feedback != null ? feedback.trim() : "");
            stmt.setInt(3, submissionId);
            return stmt.executeUpdate() > 0;
        }
    }

    private AssignmentSubmission mapSubmission(ResultSet rs) throws SQLException {
        AssignmentSubmission s = new AssignmentSubmission(
                rs.getInt("id"),
                rs.getInt("assessment_id"),
                rs.getInt("student_id"),
                rs.getString("submission_text"),
                rs.getString("submission_file")
        );
        s.setAssessmentTitle(rs.getString("a_title"));
        s.setStudentRollNumber(rs.getString("roll_number"));
        s.setStudentName(rs.getString("first_name") + " " + rs.getString("last_name"));
        s.setSubmittedAt(rs.getTimestamp("submitted_at"));

        double marks = rs.getDouble("marks_awarded");
        s.setMarksAwarded(rs.wasNull() ? null : marks);
        s.setFeedback(rs.getString("feedback"));
        return s;
    }
}
