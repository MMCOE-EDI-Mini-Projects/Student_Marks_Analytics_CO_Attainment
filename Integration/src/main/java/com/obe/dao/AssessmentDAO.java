package com.obe.dao;

import com.obe.model.*;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AssessmentDAO {

    public List<Assessment> getAssessmentsBySubjectAndClass(int subjectId, int classId) throws SQLException {
        List<Assessment> list = new ArrayList<>();
        String sql = "SELECT a.*, s.code as s_code, s.name as s_name, c.name as c_name, u.first_name, u.last_name " +
                     "FROM assessments a " +
                     "JOIN subjects s ON a.subject_id = s.id " +
                     "JOIN classes c ON a.class_id = c.id " +
                     "JOIN faculty f ON a.faculty_id = f.id " +
                     "JOIN users u ON f.user_id = u.id " +
                     "WHERE a.subject_id = ? AND a.class_id = ? ORDER BY a.assessment_date DESC, a.id DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, subjectId);
            stmt.setInt(2, classId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Assessment a = instantiatePolymorphicAssessment(rs);
                    a.setQuestions(getQuestionsByAssessmentId(conn, a.getId()));
                    list.add(a);
                }
            }
        }
        return list;
    }

    public List<Assessment> getAssessmentsBySubjectAndBatch(int subjectId, int batchId) throws SQLException {
        return getAssessmentsBySubjectAndClass(subjectId, batchId);
    }

    public List<Assessment> getPublishedAssessmentsByClass(int classId) throws SQLException {
        List<Assessment> list = new ArrayList<>();
        String sql = "SELECT a.*, s.code as s_code, s.name as s_name, c.name as c_name, u.first_name, u.last_name " +
                     "FROM assessments a " +
                     "JOIN subjects s ON a.subject_id = s.id " +
                     "JOIN classes c ON a.class_id = c.id " +
                     "JOIN faculty f ON a.faculty_id = f.id " +
                     "JOIN users u ON f.user_id = u.id " +
                     "WHERE a.class_id = ? AND a.is_published = 1 ORDER BY a.assessment_date DESC, a.id DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, classId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Assessment a = instantiatePolymorphicAssessment(rs);
                    a.setQuestions(getQuestionsByAssessmentId(conn, a.getId()));
                    list.add(a);
                }
            }
        }
        return list;
    }

    public Assessment getById(int assessmentId) throws SQLException {
        String sql = "SELECT a.*, s.code as s_code, s.name as s_name, c.name as c_name, u.first_name, u.last_name " +
                     "FROM assessments a " +
                     "JOIN subjects s ON a.subject_id = s.id " +
                     "JOIN classes c ON a.class_id = c.id " +
                     "JOIN faculty f ON a.faculty_id = f.id " +
                     "JOIN users u ON f.user_id = u.id WHERE a.id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, assessmentId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Assessment a = instantiatePolymorphicAssessment(rs);
                    a.setQuestions(getQuestionsByAssessmentId(conn, a.getId()));
                    return a;
                }
            }
        }
        return null;
    }

    private Assessment instantiatePolymorphicAssessment(ResultSet rs) throws SQLException {
        int id = rs.getInt("id");
        int subjectId = rs.getInt("subject_id");
        int classId = rs.getInt("class_id");
        int facultyId = rs.getInt("faculty_id");
        String title = rs.getString("title");
        String type = rs.getString("type");
        double totalMarks = rs.getDouble("total_marks");
        double weightage = rs.getDouble("weightage");
        Date date = rs.getDate("assessment_date");

        Assessment a;
        switch (type != null ? type.toUpperCase() : "INTERNAL_TEST") {
            case "UNIT_TEST":
                a = new UnitTestAssessment(id, subjectId, classId, facultyId, title, totalMarks, weightage, date);
                break;
            case "ASSIGNMENT":
                a = new AssignmentAssessment(id, subjectId, classId, facultyId, title, totalMarks, weightage, date);
                break;
            case "PRACTICAL":
                a = new PracticalAssessment(id, subjectId, classId, facultyId, title, totalMarks, weightage, date);
                break;
            case "INTERNAL_TEST":
            default:
                a = new InternalTestAssessment(id, subjectId, classId, facultyId, title, totalMarks, weightage, date);
                break;
        }

        a.setSubjectCode(rs.getString("s_code"));
        a.setSubjectName(rs.getString("s_name"));
        a.setClassName(rs.getString("c_name"));
        a.setFacultyName(rs.getString("first_name") + " " + rs.getString("last_name"));
        a.setPublished(rs.getBoolean("is_published"));
        a.setInstructions(rs.getString("instructions"));
        a.setDueDate(rs.getDate("due_date"));
        return a;
    }

    public List<AssessmentQuestion> getQuestionsByAssessmentId(Connection conn, int assessmentId) throws SQLException {
        List<AssessmentQuestion> list = new ArrayList<>();
        String sql = "SELECT q.*, co.co_code FROM assessment_questions q " +
                     "JOIN course_outcomes co ON q.co_id = co.id " +
                     "WHERE q.assessment_id = ? ORDER BY q.question_number ASC";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, assessmentId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    AssessmentQuestion q = new AssessmentQuestion(
                            rs.getInt("id"),
                            rs.getInt("assessment_id"),
                            rs.getString("question_number"),
                            rs.getString("question_text"),
                            rs.getDouble("max_marks"),
                            rs.getInt("co_id")
                    );
                    q.setCoCode(rs.getString("co_code"));
                    list.add(q);
                }
            }
        }
        return list;
    }

    public boolean createAssessmentWithQuestions(Assessment assessment, List<AssessmentQuestion> questions) throws SQLException {
        Connection conn = null;
        try {
            conn = DatabaseUtil.getConnection();
            conn.setAutoCommit(false);

            String aSql = "INSERT INTO assessments (subject_id, class_id, batch_id, faculty_id, title, type, total_marks, weightage, is_published, assessment_date, instructions, due_date) " +
                          "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            int assessmentId = 0;
            try (PreparedStatement aStmt = conn.prepareStatement(aSql, Statement.RETURN_GENERATED_KEYS)) {
                aStmt.setInt(1, assessment.getSubjectId());
                aStmt.setInt(2, assessment.getClassId());
                aStmt.setInt(3, assessment.getClassId());
                aStmt.setInt(4, assessment.getFacultyId());
                aStmt.setString(5, assessment.getTitle().trim());
                aStmt.setString(6, assessment.getType());
                aStmt.setDouble(7, assessment.getTotalMarks());
                aStmt.setDouble(8, assessment.getWeightage());
                aStmt.setBoolean(9, assessment.isPublished());
                aStmt.setDate(10, assessment.getAssessmentDate());
                aStmt.setString(11, assessment.getInstructions());
                aStmt.setDate(12, assessment.getDueDate() != null ? assessment.getDueDate() : assessment.getAssessmentDate());
                aStmt.executeUpdate();
                try (ResultSet rs = aStmt.getGeneratedKeys()) {
                    if (rs.next()) assessmentId = rs.getInt(1);
                }
            }
            assessment.setId(assessmentId);

            if (questions != null && !questions.isEmpty()) {
                String qSql = "INSERT INTO assessment_questions (assessment_id, question_number, question_text, max_marks, co_id) VALUES (?, ?, ?, ?, ?)";
                try (PreparedStatement qStmt = conn.prepareStatement(qSql)) {
                    for (AssessmentQuestion q : questions) {
                        qStmt.setInt(1, assessmentId);
                        qStmt.setString(2, q.getQuestionNumber().trim());
                        qStmt.setString(3, q.getQuestionText() != null ? q.getQuestionText().trim() : "");
                        qStmt.setDouble(4, q.getMaxMarks());
                        qStmt.setInt(5, q.getCoId());
                        qStmt.addBatch();
                    }
                    qStmt.executeBatch();
                }
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            if (conn != null) conn.rollback();
            throw e;
        } finally {
            if (conn != null) conn.setAutoCommit(true);
        }
    }

    public boolean updateAssessment(Assessment assessment) throws SQLException {
        String sql = "UPDATE assessments SET title = ?, total_marks = ?, weightage = ?, assessment_date = ?, is_published = ?, instructions = ?, due_date = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, assessment.getTitle().trim());
            stmt.setDouble(2, assessment.getTotalMarks());
            stmt.setDouble(3, assessment.getWeightage());
            stmt.setDate(4, assessment.getAssessmentDate());
            stmt.setBoolean(5, assessment.isPublished());
            stmt.setString(6, assessment.getInstructions());
            stmt.setDate(7, assessment.getDueDate());
            stmt.setInt(8, assessment.getId());
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean togglePublishStatus(int assessmentId) throws SQLException {
        String sql = "UPDATE assessments SET is_published = NOT is_published WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, assessmentId);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean deleteAssessment(int assessmentId) throws SQLException {
        String sql = "DELETE FROM assessments WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, assessmentId);
            return stmt.executeUpdate() > 0;
        }
    }
}
