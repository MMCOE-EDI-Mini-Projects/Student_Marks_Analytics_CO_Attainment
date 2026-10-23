package com.obe.dao;

import com.obe.model.StudentReport;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class StudentReportDAO {

    public boolean publishReport(StudentReport report) throws SQLException {
        String sql = "INSERT INTO student_reports (student_id, class_id, subject_id, faculty_id, title, academic_year, report_summary, co_attainment_json, marks_summary_json, status) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED') " +
                     "ON DUPLICATE KEY UPDATE report_summary = VALUES(report_summary), co_attainment_json = VALUES(co_attainment_json), marks_summary_json = VALUES(marks_summary_json), published_at = NOW()";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, report.getStudentId());
            stmt.setInt(2, report.getClassId());
            stmt.setInt(3, report.getSubjectId());
            stmt.setInt(4, report.getFacultyId());
            stmt.setString(5, report.getTitle().trim());
            stmt.setString(6, report.getAcademicYear());
            stmt.setString(7, report.getReportSummary());
            stmt.setString(8, report.getCoAttainmentJson());
            stmt.setString(9, report.getMarksSummaryJson());
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) report.setId(rs.getInt(1));
                }
                return true;
            }
        }
        return false;
    }

    public List<StudentReport> getReportsByStudent(int studentId) throws SQLException {
        List<StudentReport> list = new ArrayList<>();
        String sql = "SELECT sr.*, s.code as s_code, s.name as s_name, c.name as c_name, " +
                     "st.roll_number, u.first_name as st_first, u.last_name as st_last, " +
                     "fu.first_name as f_first, fu.last_name as f_last " +
                     "FROM student_reports sr " +
                     "JOIN subjects s ON sr.subject_id = s.id " +
                     "JOIN classes c ON sr.class_id = c.id " +
                     "JOIN students st ON sr.student_id = st.id " +
                     "JOIN users u ON st.user_id = u.id " +
                     "JOIN faculty f ON sr.faculty_id = f.id " +
                     "JOIN users fu ON f.user_id = fu.id " +
                     "WHERE sr.student_id = ? AND sr.status = 'PUBLISHED' ORDER BY sr.published_at DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, studentId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapReport(rs));
                }
            }
        }
        return list;
    }

    public List<StudentReport> getReportsByClassSubject(int classId, int subjectId) throws SQLException {
        List<StudentReport> list = new ArrayList<>();
        String sql = "SELECT sr.*, s.code as s_code, s.name as s_name, c.name as c_name, " +
                     "st.roll_number, u.first_name as st_first, u.last_name as st_last, " +
                     "fu.first_name as f_first, fu.last_name as f_last " +
                     "FROM student_reports sr " +
                     "JOIN subjects s ON sr.subject_id = s.id " +
                     "JOIN classes c ON sr.class_id = c.id " +
                     "JOIN students st ON sr.student_id = st.id " +
                     "JOIN users u ON st.user_id = u.id " +
                     "JOIN faculty f ON sr.faculty_id = f.id " +
                     "JOIN users fu ON f.user_id = fu.id " +
                     "WHERE sr.class_id = ? AND sr.subject_id = ? ORDER BY st.roll_number ASC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, classId);
            stmt.setInt(2, subjectId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapReport(rs));
                }
            }
        }
        return list;
    }

    public StudentReport getReportById(int reportId) throws SQLException {
        String sql = "SELECT sr.*, s.code as s_code, s.name as s_name, c.name as c_name, " +
                     "st.roll_number, u.first_name as st_first, u.last_name as st_last, " +
                     "fu.first_name as f_first, fu.last_name as f_last " +
                     "FROM student_reports sr " +
                     "JOIN subjects s ON sr.subject_id = s.id " +
                     "JOIN classes c ON sr.class_id = c.id " +
                     "JOIN students st ON sr.student_id = st.id " +
                     "JOIN users u ON st.user_id = u.id " +
                     "JOIN faculty f ON sr.faculty_id = f.id " +
                     "JOIN users fu ON f.user_id = fu.id WHERE sr.id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, reportId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapReport(rs);
                }
            }
        }
        return null;
    }

    private StudentReport mapReport(ResultSet rs) throws SQLException {
        StudentReport sr = new StudentReport(
                rs.getInt("id"),
                rs.getInt("student_id"),
                rs.getInt("class_id"),
                rs.getInt("subject_id"),
                rs.getInt("faculty_id"),
                rs.getString("title"),
                rs.getString("academic_year"),
                rs.getString("report_summary"),
                rs.getString("co_attainment_json"),
                rs.getString("marks_summary_json"),
                rs.getString("status")
        );
        sr.setSubjectCode(rs.getString("s_code"));
        sr.setSubjectName(rs.getString("s_name"));
        sr.setClassName(rs.getString("c_name"));
        sr.setStudentRollNumber(rs.getString("roll_number"));
        sr.setStudentName(rs.getString("st_first") + " " + rs.getString("st_last"));
        sr.setFacultyName(rs.getString("f_first") + " " + rs.getString("f_last"));
        sr.setPublishedAt(rs.getTimestamp("published_at"));
        return sr;
    }
}
