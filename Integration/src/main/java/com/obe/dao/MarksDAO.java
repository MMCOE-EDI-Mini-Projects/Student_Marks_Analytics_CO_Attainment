package com.obe.dao;

import com.obe.model.StudentMark;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class MarksDAO {

    public List<StudentMark> getMarksByAssessment(int assessmentId) throws SQLException {
        List<StudentMark> list = new ArrayList<>();
        String sql = "SELECT sm.*, q.question_number, s.roll_number, u.first_name, u.last_name " +
                     "FROM student_marks sm " +
                     "JOIN assessment_questions q ON sm.question_id = q.id " +
                     "JOIN students s ON sm.student_id = s.id " +
                     "JOIN users u ON s.user_id = u.id " +
                     "WHERE sm.assessment_id = ? ORDER BY s.roll_number, q.question_number";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, assessmentId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    StudentMark sm = new StudentMark(
                            rs.getInt("id"),
                            rs.getInt("assessment_id"),
                            rs.getInt("question_id"),
                            rs.getInt("student_id"),
                            rs.getDouble("marks_obtained"),
                            rs.getBoolean("is_absent")
                    );
                    sm.setQuestionNumber(rs.getString("question_number"));
                    sm.setStudentRollNumber(rs.getString("roll_number"));
                    sm.setStudentName(rs.getString("first_name") + " " + rs.getString("last_name"));
                    sm.setRecordedAt(rs.getTimestamp("recorded_at"));
                    list.add(sm);
                }
            }
        }
        return list;
    }

    public boolean validateAndSaveMarks(int assessmentId, Integer facultyId, boolean isAdmin, List<StudentMark> marksList) throws SQLException {
        Connection conn = null;
        try {
            conn = DatabaseUtil.getConnection();
            conn.setAutoCommit(false);

            // 1. Validate assessment ownership & details
            int subjectId = 0;
            int classId = 0;
            int ownerFacultyId = 0;
            String aSql = "SELECT subject_id, class_id, faculty_id FROM assessments WHERE id = ?";
            try (PreparedStatement aStmt = conn.prepareStatement(aSql)) {
                aStmt.setInt(1, assessmentId);
                try (ResultSet rs = aStmt.executeQuery()) {
                    if (rs.next()) {
                        subjectId = rs.getInt("subject_id");
                        classId = rs.getInt("class_id");
                        ownerFacultyId = rs.getInt("faculty_id");
                    } else {
                        throw new IllegalArgumentException("Assessment not found");
                    }
                }
            }

            // Check faculty ownership if not admin
            if (!isAdmin && facultyId != null) {
                if (ownerFacultyId != facultyId) {
                    // Check if faculty is assigned to this subject and class
                    String faSql = "SELECT COUNT(*) FROM faculty_assignments WHERE faculty_id = ? AND subject_id = ? AND class_id = ?";
                    try (PreparedStatement faStmt = conn.prepareStatement(faSql)) {
                        faStmt.setInt(1, facultyId);
                        faStmt.setInt(2, subjectId);
                        faStmt.setInt(3, classId);
                        try (ResultSet rs = faStmt.executeQuery()) {
                            if (!rs.next() || rs.getInt(1) == 0) {
                                throw new SecurityException("Unauthorized: You are not assigned to this subject and class.");
                            }
                        }
                    }
                }
            }

            // 2. Load question max marks map
            java.util.Map<Integer, Double> questionMaxMarks = new java.util.HashMap<>();
            String qSql = "SELECT id, max_marks FROM assessment_questions WHERE assessment_id = ?";
            try (PreparedStatement qStmt = conn.prepareStatement(qSql)) {
                qStmt.setInt(1, assessmentId);
                try (ResultSet rs = qStmt.executeQuery()) {
                    while (rs.next()) {
                        questionMaxMarks.put(rs.getInt("id"), rs.getDouble("max_marks"));
                    }
                }
            }

            // 3. Load enrolled students for this class and subject
            Set<Integer> enrolledStudents = new HashSet<>();
            String eSql = "SELECT student_id FROM enrollments WHERE subject_id = ? AND class_id = ?";
            try (PreparedStatement eStmt = conn.prepareStatement(eSql)) {
                eStmt.setInt(1, subjectId);
                eStmt.setInt(2, classId);
                try (ResultSet rs = eStmt.executeQuery()) {
                    while (rs.next()) {
                        enrolledStudents.add(rs.getInt("student_id"));
                    }
                }
            }

            // Also check students belonging directly to the class
            String sSql = "SELECT id FROM students WHERE class_id = ?";
            try (PreparedStatement sStmt = conn.prepareStatement(sSql)) {
                sStmt.setInt(1, classId);
                try (ResultSet rs = sStmt.executeQuery()) {
                    while (rs.next()) {
                        enrolledStudents.add(rs.getInt("id"));
                    }
                }
            }

            // 4. Validate marks records
            Set<String> seenEntries = new HashSet<>();
            for (StudentMark sm : marksList) {
                String key = sm.getStudentId() + "-" + sm.getQuestionId();
                if (seenEntries.contains(key)) {
                    throw new IllegalArgumentException("Duplicate marks entry detected for student ID " + sm.getStudentId() + " on question ID " + sm.getQuestionId());
                }
                seenEntries.add(key);

                if (!enrolledStudents.contains(sm.getStudentId())) {
                    throw new IllegalArgumentException("Student ID " + sm.getStudentId() + " is not enrolled in this class or subject.");
                }

                if (!sm.isAbsent()) {
                    Double maxMarks = questionMaxMarks.get(sm.getQuestionId());
                    if (maxMarks != null && sm.getMarksObtained() > maxMarks) {
                        throw new IllegalArgumentException("Marks obtained (" + sm.getMarksObtained() + ") cannot exceed maximum marks (" + maxMarks + ") for question " + sm.getQuestionId());
                    }
                    if (sm.getMarksObtained() < 0) {
                        throw new IllegalArgumentException("Marks obtained cannot be negative.");
                    }
                }
            }

            // 5. Bulk Upsert Marks
            String upsertSql = "INSERT INTO student_marks (assessment_id, question_id, student_id, marks_obtained, is_absent) " +
                               "VALUES (?, ?, ?, ?, ?) " +
                               "ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained), is_absent = VALUES(is_absent)";
            try (PreparedStatement uStmt = conn.prepareStatement(upsertSql)) {
                for (StudentMark sm : marksList) {
                    uStmt.setInt(1, assessmentId);
                    uStmt.setInt(2, sm.getQuestionId());
                    uStmt.setInt(3, sm.getStudentId());
                    uStmt.setDouble(4, sm.isAbsent() ? 0.0 : sm.getMarksObtained());
                    uStmt.setBoolean(5, sm.isAbsent());
                    uStmt.addBatch();
                }
                uStmt.executeBatch();
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

    public boolean saveBulkMarks(List<StudentMark> marksList) throws SQLException {
        if (marksList.isEmpty()) return true;
        return validateAndSaveMarks(marksList.get(0).getAssessmentId(), null, true, marksList);
    }
}
