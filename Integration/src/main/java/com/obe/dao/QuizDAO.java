package com.obe.dao;

import com.obe.model.Quiz;
import com.obe.model.QuizQuestion;
import com.obe.model.QuizSubmission;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class QuizDAO {

    public boolean createQuiz(Quiz quiz, List<QuizQuestion> questions) throws SQLException {
        Connection conn = null;
        try {
            conn = DatabaseUtil.getConnection();
            conn.setAutoCommit(false);

            String qSql = "INSERT INTO quizzes (subject_id, class_id, faculty_id, title, description, total_marks, duration_minutes, deadline, is_published) " +
                          "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            int quizId = 0;
            try (PreparedStatement qStmt = conn.prepareStatement(qSql, Statement.RETURN_GENERATED_KEYS)) {
                qStmt.setInt(1, quiz.getSubjectId());
                qStmt.setInt(2, quiz.getClassId());
                qStmt.setInt(3, quiz.getFacultyId());
                qStmt.setString(4, quiz.getTitle().trim());
                qStmt.setString(5, quiz.getDescription() != null ? quiz.getDescription().trim() : "");
                qStmt.setDouble(6, quiz.getTotalMarks());
                qStmt.setInt(7, quiz.getDurationMinutes());
                qStmt.setTimestamp(8, quiz.getDeadline());
                qStmt.setBoolean(9, quiz.isPublished());
                qStmt.executeUpdate();
                try (ResultSet rs = qStmt.getGeneratedKeys()) {
                    if (rs.next()) quizId = rs.getInt(1);
                }
            }
            quiz.setId(quizId);

            if (questions != null && !questions.isEmpty()) {
                String qqSql = "INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks) " +
                               "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                try (PreparedStatement qqStmt = conn.prepareStatement(qqSql)) {
                    for (QuizQuestion qq : questions) {
                        qqStmt.setInt(1, quizId);
                        qqStmt.setString(2, qq.getQuestionText().trim());
                        qqStmt.setString(3, qq.getOptionA().trim());
                        qqStmt.setString(4, qq.getOptionB().trim());
                        qqStmt.setString(5, qq.getOptionC() != null ? qq.getOptionC().trim() : "");
                        qqStmt.setString(6, qq.getOptionD() != null ? qq.getOptionD().trim() : "");
                        qqStmt.setString(7, qq.getCorrectOption().trim().toUpperCase());
                        qqStmt.setDouble(8, qq.getMarks());
                        qqStmt.addBatch();
                    }
                    qqStmt.executeBatch();
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

    public List<Quiz> getQuizzesByClass(int classId, Integer studentId) throws SQLException {
        List<Quiz> list = new ArrayList<>();
        String sql = "SELECT q.*, s.code as s_code, s.name as s_name, c.name as c_name, u.first_name, u.last_name " +
                     "FROM quizzes q " +
                     "JOIN subjects s ON q.subject_id = s.id " +
                     "JOIN classes c ON q.class_id = c.id " +
                     "JOIN faculty f ON q.faculty_id = f.id " +
                     "JOIN users u ON f.user_id = u.id " +
                     "WHERE q.class_id = ? ORDER BY q.deadline DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, classId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Quiz q = mapQuiz(rs);
                    if (studentId != null) {
                        loadStudentAttemptStatus(conn, q, studentId);
                    }
                    list.add(q);
                }
            }
        }
        return list;
    }

    public List<Quiz> getQuizzesBySubjectAndClass(int subjectId, int classId) throws SQLException {
        List<Quiz> list = new ArrayList<>();
        String sql = "SELECT q.*, s.code as s_code, s.name as s_name, c.name as c_name, u.first_name, u.last_name " +
                     "FROM quizzes q " +
                     "JOIN subjects s ON q.subject_id = s.id " +
                     "JOIN classes c ON q.class_id = c.id " +
                     "JOIN faculty f ON q.faculty_id = f.id " +
                     "JOIN users u ON f.user_id = u.id " +
                     "WHERE q.subject_id = ? AND q.class_id = ? ORDER BY q.deadline DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, subjectId);
            stmt.setInt(2, classId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Quiz q = mapQuiz(rs);
                    q.setQuestions(getQuestionsByQuizId(conn, q.getId()));
                    list.add(q);
                }
            }
        }
        return list;
    }

    public Quiz getQuizById(int quizId) throws SQLException {
        String sql = "SELECT q.*, s.code as s_code, s.name as s_name, c.name as c_name, u.first_name, u.last_name " +
                     "FROM quizzes q " +
                     "JOIN subjects s ON q.subject_id = s.id " +
                     "JOIN classes c ON q.class_id = c.id " +
                     "JOIN faculty f ON q.faculty_id = f.id " +
                     "JOIN users u ON f.user_id = u.id WHERE q.id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, quizId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Quiz q = mapQuiz(rs);
                    q.setQuestions(getQuestionsByQuizId(conn, q.getId()));
                    return q;
                }
            }
        }
        return null;
    }

    public List<QuizQuestion> getQuestionsByQuizId(Connection conn, int quizId) throws SQLException {
        List<QuizQuestion> list = new ArrayList<>();
        String sql = "SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, quizId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    QuizQuestion qq = new QuizQuestion(
                            rs.getInt("id"),
                            rs.getInt("quiz_id"),
                            rs.getString("question_text"),
                            rs.getString("option_a"),
                            rs.getString("option_b"),
                            rs.getString("option_c"),
                            rs.getString("option_d"),
                            rs.getString("correct_option"),
                            rs.getDouble("marks")
                    );
                    list.add(qq);
                }
            }
        }
        return list;
    }

    public boolean togglePublish(int quizId) throws SQLException {
        String sql = "UPDATE quizzes SET is_published = NOT is_published WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, quizId);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean deleteQuiz(int quizId) throws SQLException {
        String sql = "DELETE FROM quizzes WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, quizId);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean submitQuiz(QuizSubmission submission) throws SQLException {
        // Enforce single attempt check
        String checkSql = "SELECT COUNT(*) FROM quiz_submissions WHERE quiz_id = ? AND student_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
            checkStmt.setInt(1, submission.getQuizId());
            checkStmt.setInt(2, submission.getStudentId());
            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next() && rs.getInt(1) > 0) {
                    throw new SQLException("You have already submitted this quiz. Multiple attempts are not allowed.");
                }
            }
        }

        String sql = "INSERT INTO quiz_submissions (quiz_id, student_id, score, total_score, answers_json) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, submission.getQuizId());
            stmt.setInt(2, submission.getStudentId());
            stmt.setDouble(3, submission.getScore());
            stmt.setDouble(4, submission.getTotalScore());
            stmt.setString(5, submission.getAnswersJson());
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

    public List<QuizSubmission> getSubmissionsByQuiz(int quizId) throws SQLException {
        List<QuizSubmission> list = new ArrayList<>();
        String sql = "SELECT qs.*, st.roll_number, u.first_name, u.last_name " +
                     "FROM quiz_submissions qs " +
                     "JOIN students st ON qs.student_id = st.id " +
                     "JOIN users u ON st.user_id = u.id " +
                     "WHERE qs.quiz_id = ? ORDER BY qs.score DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, quizId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    QuizSubmission qs = new QuizSubmission(
                            rs.getInt("id"),
                            rs.getInt("quiz_id"),
                            rs.getInt("student_id"),
                            rs.getDouble("score"),
                            rs.getDouble("total_score"),
                            rs.getString("answers_json")
                    );
                    qs.setStudentRollNumber(rs.getString("roll_number"));
                    qs.setStudentName(rs.getString("first_name") + " " + rs.getString("last_name"));
                    qs.setSubmittedAt(rs.getTimestamp("submitted_at"));
                    list.add(qs);
                }
            }
        }
        return list;
    }

    public QuizSubmission getSubmission(int quizId, int studentId) throws SQLException {
        String sql = "SELECT * FROM quiz_submissions WHERE quiz_id = ? AND student_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, quizId);
            stmt.setInt(2, studentId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    QuizSubmission qs = new QuizSubmission(
                            rs.getInt("id"),
                            rs.getInt("quiz_id"),
                            rs.getInt("student_id"),
                            rs.getDouble("score"),
                            rs.getDouble("total_score"),
                            rs.getString("answers_json")
                    );
                    qs.setSubmittedAt(rs.getTimestamp("submitted_at"));
                    return qs;
                }
            }
        }
        return null;
    }

    private void loadStudentAttemptStatus(Connection conn, Quiz q, int studentId) throws SQLException {
        String sql = "SELECT score FROM quiz_submissions WHERE quiz_id = ? AND student_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, q.getId());
            stmt.setInt(2, studentId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    q.setAttemptedByCurrentUser(true);
                    q.setUserScore(rs.getDouble("score"));
                } else {
                    q.setAttemptedByCurrentUser(false);
                    q.setUserScore(null);
                }
            }
        }
    }

    private Quiz mapQuiz(ResultSet rs) throws SQLException {
        Quiz q = new Quiz(
                rs.getInt("id"),
                rs.getInt("subject_id"),
                rs.getInt("class_id"),
                rs.getInt("faculty_id"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getDouble("total_marks"),
                rs.getInt("duration_minutes"),
                rs.getTimestamp("deadline"),
                rs.getBoolean("is_published")
        );
        q.setSubjectCode(rs.getString("s_code"));
        q.setSubjectName(rs.getString("s_name"));
        q.setClassName(rs.getString("c_name"));
        q.setFacultyName(rs.getString("first_name") + " " + rs.getString("last_name"));
        q.setCreatedAt(rs.getTimestamp("created_at"));
        return q;
    }
}
