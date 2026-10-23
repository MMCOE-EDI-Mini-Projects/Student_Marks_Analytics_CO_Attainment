package com.obe.dao;

import com.obe.model.Grievance;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class GrievanceDAO {

    public boolean createGrievance(Grievance g) throws SQLException {
        String sql = "INSERT INTO grievances (student_id, class_id, subject_id, category, title, description, status) " +
                     "VALUES (?, ?, ?, ?, ?, ?, 'OPEN')";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, g.getStudentId());
            stmt.setInt(2, g.getClassId());
            if (g.getSubjectId() != null && g.getSubjectId() > 0) {
                stmt.setInt(3, g.getSubjectId());
            } else {
                stmt.setNull(3, Types.INTEGER);
            }
            stmt.setString(4, g.getCategory());
            stmt.setString(5, g.getTitle().trim());
            stmt.setString(6, g.getDescription().trim());
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) g.setId(rs.getInt(1));
                }
                return true;
            }
        }
        return false;
    }

    public List<Grievance> getGrievancesByStudent(int studentId) throws SQLException {
        List<Grievance> list = new ArrayList<>();
        String sql = "SELECT g.*, st.roll_number, u.first_name as s_first, u.last_name as s_last, " +
                     "c.name as c_name, s.code as s_code, s.name as s_name, " +
                     "fu.first_name as f_first, fu.last_name as f_last " +
                     "FROM grievances g " +
                     "JOIN students st ON g.student_id = st.id " +
                     "JOIN users u ON st.user_id = u.id " +
                     "JOIN classes c ON g.class_id = c.id " +
                     "LEFT JOIN subjects s ON g.subject_id = s.id " +
                     "LEFT JOIN faculty f ON g.resolved_by_faculty_id = f.id " +
                     "LEFT JOIN users fu ON f.user_id = fu.id " +
                     "WHERE g.student_id = ? ORDER BY g.created_at DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, studentId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapGrievance(rs));
                }
            }
        }
        return list;
    }

    public List<Grievance> getGrievancesByFaculty(int facultyId) throws SQLException {
        List<Grievance> list = new ArrayList<>();
        // Grievances submitted by students belonging to the faculty's assigned classes or subjects
        String sql = "SELECT DISTINCT g.*, st.roll_number, u.first_name as s_first, u.last_name as s_last, " +
                     "c.name as c_name, s.code as s_code, s.name as s_name, " +
                     "fu.first_name as f_first, fu.last_name as f_last " +
                     "FROM grievances g " +
                     "JOIN students st ON g.student_id = st.id " +
                     "JOIN users u ON st.user_id = u.id " +
                     "JOIN classes c ON g.class_id = c.id " +
                     "LEFT JOIN subjects s ON g.subject_id = s.id " +
                     "LEFT JOIN faculty f ON g.resolved_by_faculty_id = f.id " +
                     "LEFT JOIN users fu ON f.user_id = fu.id " +
                     "WHERE g.class_id IN (SELECT class_id FROM faculty_assignments WHERE faculty_id = ?) " +
                     "ORDER BY CASE WHEN g.status = 'OPEN' THEN 1 WHEN g.status = 'IN_PROGRESS' THEN 2 ELSE 3 END, g.created_at DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, facultyId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapGrievance(rs));
                }
            }
        }
        return list;
    }

    public List<Grievance> getAllGrievances() throws SQLException {
        List<Grievance> list = new ArrayList<>();
        String sql = "SELECT g.*, st.roll_number, u.first_name as s_first, u.last_name as s_last, " +
                     "c.name as c_name, s.code as s_code, s.name as s_name, " +
                     "fu.first_name as f_first, fu.last_name as f_last " +
                     "FROM grievances g " +
                     "JOIN students st ON g.student_id = st.id " +
                     "JOIN users u ON st.user_id = u.id " +
                     "JOIN classes c ON g.class_id = c.id " +
                     "LEFT JOIN subjects s ON g.subject_id = s.id " +
                     "LEFT JOIN faculty f ON g.resolved_by_faculty_id = f.id " +
                     "LEFT JOIN users fu ON f.user_id = fu.id " +
                     "ORDER BY g.created_at DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapGrievance(rs));
            }
        }
        return list;
    }

    public Grievance getById(int id) throws SQLException {
        String sql = "SELECT g.*, st.roll_number, u.first_name as s_first, u.last_name as s_last, " +
                     "c.name as c_name, s.code as s_code, s.name as s_name, " +
                     "fu.first_name as f_first, fu.last_name as f_last " +
                     "FROM grievances g " +
                     "JOIN students st ON g.student_id = st.id " +
                     "JOIN users u ON st.user_id = u.id " +
                     "JOIN classes c ON g.class_id = c.id " +
                     "LEFT JOIN subjects s ON g.subject_id = s.id " +
                     "LEFT JOIN faculty f ON g.resolved_by_faculty_id = f.id " +
                     "LEFT JOIN users fu ON f.user_id = fu.id WHERE g.id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapGrievance(rs);
                }
            }
        }
        return null;
    }

    public boolean respond(int grievanceId, int facultyId, String response, String status) throws SQLException {
        String sql = "UPDATE grievances SET faculty_response = ?, resolved_by_faculty_id = ?, status = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, response.trim());
            stmt.setInt(2, facultyId);
            stmt.setString(3, status.trim().toUpperCase());
            stmt.setInt(4, grievanceId);
            return stmt.executeUpdate() > 0;
        }
    }

    private Grievance mapGrievance(ResultSet rs) throws SQLException {
        int subId = rs.getInt("subject_id");
        Integer subjectId = rs.wasNull() ? null : subId;

        int resFacultyId = rs.getInt("resolved_by_faculty_id");
        Integer resolvedByFacultyId = rs.wasNull() ? null : resFacultyId;

        Grievance g = new Grievance(
                rs.getInt("id"),
                rs.getInt("student_id"),
                rs.getInt("class_id"),
                subjectId,
                rs.getString("category"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getString("status")
        );
        g.setStudentRollNumber(rs.getString("roll_number"));
        g.setStudentName(rs.getString("s_first") + " " + rs.getString("s_last"));
        g.setClassName(rs.getString("c_name"));
        g.setSubjectCode(rs.getString("s_code"));
        g.setSubjectName(rs.getString("s_name"));
        g.setFacultyResponse(rs.getString("faculty_response"));
        g.setResolvedByFacultyId(resolvedByFacultyId);
        String fFirst = rs.getString("f_first");
        if (fFirst != null) {
            g.setResolvedByFacultyName(fFirst + " " + rs.getString("f_last"));
        }
        g.setCreatedAt(rs.getTimestamp("created_at"));
        g.setUpdatedAt(rs.getTimestamp("updated_at"));
        return g;
    }
}
