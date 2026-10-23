package com.obe.dao;

import com.obe.model.Faculty;
import com.obe.model.FacultyAssignment;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class FacultyDAO {

    public List<Faculty> getAllFaculty() throws SQLException {
        List<Faculty> list = new ArrayList<>();
        String sql = "SELECT f.id as f_id, f.user_id, f.department_id, f.designation, f.phone, " +
                     "u.username, u.email, u.first_name, u.last_name, d.code as d_code, d.name as d_name " +
                     "FROM faculty f JOIN users u ON f.user_id = u.id " +
                     "JOIN departments d ON f.department_id = d.id ORDER BY u.first_name, u.last_name";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Faculty f = new Faculty(
                        rs.getInt("user_id"),
                        rs.getString("username"),
                        "",
                        rs.getString("email"),
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        rs.getInt("f_id"),
                        rs.getInt("department_id"),
                        rs.getString("designation"),
                        rs.getString("phone")
                );
                f.setDepartmentCode(rs.getString("d_code"));
                f.setDepartmentName(rs.getString("d_name"));
                list.add(f);
            }
        }
        return list;
    }

    public Faculty getById(int facultyId) throws SQLException {
        String sql = "SELECT f.id as f_id, f.user_id, f.department_id, f.designation, f.phone, " +
                     "u.username, u.email, u.first_name, u.last_name, d.code as d_code, d.name as d_name " +
                     "FROM faculty f JOIN users u ON f.user_id = u.id " +
                     "JOIN departments d ON f.department_id = d.id WHERE f.id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, facultyId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Faculty f = new Faculty(
                            rs.getInt("user_id"),
                            rs.getString("username"),
                            "",
                            rs.getString("email"),
                            rs.getString("first_name"),
                            rs.getString("last_name"),
                            rs.getInt("f_id"),
                            rs.getInt("department_id"),
                            rs.getString("designation"),
                            rs.getString("phone")
                    );
                    f.setDepartmentCode(rs.getString("d_code"));
                    f.setDepartmentName(rs.getString("d_name"));
                    return f;
                }
            }
        }
        return null;
    }

    public boolean createFacultyUser(Faculty faculty, String rawPassword) throws SQLException {
        Connection conn = null;
        try {
            conn = DatabaseUtil.getConnection();
            conn.setAutoCommit(false);

            // 1. Insert into users
            String uSql = "INSERT INTO users (username, password_hash, email, role, first_name, last_name) VALUES (?, ?, ?, 'FACULTY', ?, ?)";
            int userId = 0;
            try (PreparedStatement uStmt = conn.prepareStatement(uSql, Statement.RETURN_GENERATED_KEYS)) {
                uStmt.setString(1, faculty.getUsername().trim());
                uStmt.setString(2, com.obe.util.PasswordUtil.hashPassword(rawPassword));
                uStmt.setString(3, faculty.getEmail().trim());
                uStmt.setString(4, faculty.getFirstName().trim());
                uStmt.setString(5, faculty.getLastName().trim());
                uStmt.executeUpdate();
                try (ResultSet rs = uStmt.getGeneratedKeys()) {
                    if (rs.next()) userId = rs.getInt(1);
                }
            }

            // 2. Insert into faculty
            String fSql = "INSERT INTO faculty (user_id, department_id, designation, phone) VALUES (?, ?, ?, ?)";
            try (PreparedStatement fStmt = conn.prepareStatement(fSql)) {
                fStmt.setInt(1, userId);
                fStmt.setInt(2, faculty.getDepartmentId());
                fStmt.setString(3, faculty.getDesignation());
                fStmt.setString(4, faculty.getPhone());
                fStmt.executeUpdate();
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

    public boolean updateFaculty(Faculty faculty) throws SQLException {
        Connection conn = null;
        try {
            conn = DatabaseUtil.getConnection();
            conn.setAutoCommit(false);

            String uSql = "UPDATE users u JOIN faculty f ON f.user_id = u.id " +
                          "SET u.first_name = ?, u.last_name = ?, u.email = ? WHERE f.id = ?";
            try (PreparedStatement uStmt = conn.prepareStatement(uSql)) {
                uStmt.setString(1, faculty.getFirstName().trim());
                uStmt.setString(2, faculty.getLastName().trim());
                uStmt.setString(3, faculty.getEmail().trim());
                uStmt.setInt(4, faculty.getFacultyId());
                uStmt.executeUpdate();
            }

            String fSql = "UPDATE faculty SET department_id = ?, designation = ?, phone = ? WHERE id = ?";
            try (PreparedStatement fStmt = conn.prepareStatement(fSql)) {
                fStmt.setInt(1, faculty.getDepartmentId());
                fStmt.setString(2, faculty.getDesignation());
                fStmt.setString(3, faculty.getPhone());
                fStmt.setInt(4, faculty.getFacultyId());
                fStmt.executeUpdate();
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

    public boolean deleteFaculty(int facultyId) throws SQLException {
        Connection conn = null;
        try {
            conn = DatabaseUtil.getConnection();
            conn.setAutoCommit(false);

            int userId = 0;
            String findSql = "SELECT user_id FROM faculty WHERE id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(findSql)) {
                stmt.setInt(1, facultyId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) userId = rs.getInt("user_id");
                }
            }

            if (userId > 0) {
                String delUserSql = "DELETE FROM users WHERE id = ?";
                try (PreparedStatement dStmt = conn.prepareStatement(delUserSql)) {
                    dStmt.setInt(1, userId);
                    dStmt.executeUpdate();
                }
            } else {
                String delFacultySql = "DELETE FROM faculty WHERE id = ?";
                try (PreparedStatement dStmt = conn.prepareStatement(delFacultySql)) {
                    dStmt.setInt(1, facultyId);
                    dStmt.executeUpdate();
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

    // Faculty Assignments
    public List<FacultyAssignment> getAssignmentsByFaculty(int facultyId) throws SQLException {
        List<FacultyAssignment> list = new ArrayList<>();
        String sql = "SELECT fa.*, u.first_name, u.last_name, s.code as s_code, s.name as s_name, c.name as c_name " +
                     "FROM faculty_assignments fa " +
                     "JOIN faculty f ON fa.faculty_id = f.id " +
                     "JOIN users u ON f.user_id = u.id " +
                     "JOIN subjects s ON fa.subject_id = s.id " +
                     "JOIN classes c ON fa.class_id = c.id WHERE fa.faculty_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, facultyId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    FacultyAssignment fa = new FacultyAssignment(
                            rs.getInt("id"),
                            rs.getInt("faculty_id"),
                            rs.getInt("subject_id"),
                            rs.getInt("class_id"),
                            rs.getString("academic_year")
                    );
                    fa.setFacultyName(rs.getString("first_name") + " " + rs.getString("last_name"));
                    fa.setSubjectCode(rs.getString("s_code"));
                    fa.setSubjectName(rs.getString("s_name"));
                    fa.setClassName(rs.getString("c_name"));
                    fa.setAssignedAt(rs.getTimestamp("assigned_at"));
                    list.add(fa);
                }
            }
        }
        return list;
    }

    public List<FacultyAssignment> getAllAssignments() throws SQLException {
        List<FacultyAssignment> list = new ArrayList<>();
        String sql = "SELECT fa.*, u.first_name, u.last_name, s.code as s_code, s.name as s_name, c.name as c_name " +
                     "FROM faculty_assignments fa " +
                     "JOIN faculty f ON fa.faculty_id = f.id " +
                     "JOIN users u ON f.user_id = u.id " +
                     "JOIN subjects s ON fa.subject_id = s.id " +
                     "JOIN classes c ON fa.class_id = c.id ORDER BY fa.id DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                FacultyAssignment fa = new FacultyAssignment(
                        rs.getInt("id"),
                        rs.getInt("faculty_id"),
                        rs.getInt("subject_id"),
                        rs.getInt("class_id"),
                        rs.getString("academic_year")
                );
                fa.setFacultyName(rs.getString("first_name") + " " + rs.getString("last_name"));
                fa.setSubjectCode(rs.getString("s_code"));
                fa.setSubjectName(rs.getString("s_name"));
                fa.setClassName(rs.getString("c_name"));
                fa.setAssignedAt(rs.getTimestamp("assigned_at"));
                list.add(fa);
            }
        }
        return list;
    }

    public boolean createAssignment(FacultyAssignment fa) throws SQLException {
        // Prevent invalid or duplicate assignments
        String checkSql = "SELECT COUNT(*) FROM faculty_assignments WHERE subject_id = ? AND class_id = ? AND academic_year = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
            checkStmt.setInt(1, fa.getSubjectId());
            checkStmt.setInt(2, fa.getClassId());
            checkStmt.setString(3, fa.getAcademicYear());
            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next() && rs.getInt(1) > 0) {
                    throw new SQLException("An assignment for this Subject, Class, and Academic Year already exists.");
                }
            }
        }

        String sql = "INSERT INTO faculty_assignments (faculty_id, subject_id, class_id, batch_id, academic_year) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, fa.getFacultyId());
            stmt.setInt(2, fa.getSubjectId());
            stmt.setInt(3, fa.getClassId());
            stmt.setInt(4, fa.getClassId());
            stmt.setString(5, fa.getAcademicYear());
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean updateAssignment(FacultyAssignment fa) throws SQLException {
        // Reassignment
        String sql = "UPDATE faculty_assignments SET faculty_id = ?, subject_id = ?, class_id = ?, batch_id = ?, academic_year = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, fa.getFacultyId());
            stmt.setInt(2, fa.getSubjectId());
            stmt.setInt(3, fa.getClassId());
            stmt.setInt(4, fa.getClassId());
            stmt.setString(5, fa.getAcademicYear());
            stmt.setInt(6, fa.getId());
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean deleteAssignment(int assignmentId) throws SQLException {
        String sql = "DELETE FROM faculty_assignments WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, assignmentId);
            return stmt.executeUpdate() > 0;
        }
    }
}
