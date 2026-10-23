package com.obe.dao;

import com.obe.model.Attendance;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AttendanceDAO {

    public List<Attendance> getAttendanceBySubjectDate(int subjectId, int classId, Date date) throws SQLException {
        List<Attendance> list = new ArrayList<>();
        String sql = "SELECT att.*, s.code as s_code, c.name as c_name, st.roll_number, u.first_name, u.last_name " +
                     "FROM attendance att " +
                     "JOIN subjects s ON att.subject_id = s.id " +
                     "JOIN classes c ON att.class_id = c.id " +
                     "JOIN students st ON att.student_id = st.id " +
                     "JOIN users u ON st.user_id = u.id " +
                     "WHERE att.subject_id = ? AND att.class_id = ? AND att.attendance_date = ? ORDER BY st.roll_number";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, subjectId);
            stmt.setInt(2, classId);
            stmt.setDate(3, date);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Attendance a = new Attendance(
                            rs.getInt("id"),
                            rs.getInt("subject_id"),
                            rs.getInt("class_id"),
                            rs.getInt("student_id"),
                            rs.getDate("attendance_date"),
                            rs.getString("status")
                    );
                    a.setSubjectCode(rs.getString("s_code"));
                    a.setClassName(rs.getString("c_name"));
                    a.setStudentRollNumber(rs.getString("roll_number"));
                    a.setStudentName(rs.getString("first_name") + " " + rs.getString("last_name"));
                    list.add(a);
                }
            }
        }
        return list;
    }

    public boolean saveBulkAttendance(List<Attendance> attendanceList) throws SQLException {
        String sql = "INSERT INTO attendance (subject_id, class_id, batch_id, student_id, attendance_date, status) VALUES (?, ?, ?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE status = VALUES(status)";
        Connection conn = null;
        try {
            conn = DatabaseUtil.getConnection();
            conn.setAutoCommit(false);
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                for (Attendance a : attendanceList) {
                    stmt.setInt(1, a.getSubjectId());
                    stmt.setInt(2, a.getClassId());
                    stmt.setInt(3, a.getClassId());
                    stmt.setInt(4, a.getStudentId());
                    stmt.setDate(5, a.getAttendanceDate());
                    stmt.setString(6, a.getStatus());
                    stmt.addBatch();
                }
                stmt.executeBatch();
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
}
