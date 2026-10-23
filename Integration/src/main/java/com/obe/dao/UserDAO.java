package com.obe.dao;

import com.obe.model.Admin;
import com.obe.model.Faculty;
import com.obe.model.Student;
import com.obe.model.User;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserDAO {

    public User authenticate(String username, String rawPassword) throws SQLException {
        String sql = "SELECT * FROM users WHERE username = ? OR email = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, username);
            stmt.setString(2, username);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    boolean active = rs.getBoolean("is_active");
                    if (!active) {
                        return null; // Deactivated user cannot log in
                    }
                    String storedHash = rs.getString("password_hash");
                    if (com.obe.util.PasswordUtil.checkPassword(rawPassword, storedHash)) {
                        return populateUserObject(conn, rs);
                    }
                }
            }
        }
        return null;
    }

    public User findById(int userId) throws SQLException {
        String sql = "SELECT * FROM users WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return populateUserObject(conn, rs);
                }
            }
        }
        return null;
    }

    public List<User> getAllUsers(String search, String roleFilter, Boolean activeFilter) throws SQLException {
        List<User> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT * FROM users WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (search != null && !search.trim().isEmpty()) {
            sql.append("AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?) ");
            String q = "%" + search.trim() + "%";
            params.add(q);
            params.add(q);
            params.add(q);
            params.add(q);
        }
        if (roleFilter != null && !roleFilter.trim().isEmpty() && !"ALL".equalsIgnoreCase(roleFilter.trim())) {
            sql.append("AND role = ? ");
            params.add(roleFilter.trim().toUpperCase());
        }
        if (activeFilter != null) {
            sql.append("AND is_active = ? ");
            params.add(activeFilter ? 1 : 0);
        }
        sql.append("ORDER BY id DESC");

        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(populateUserObject(conn, rs));
                }
            }
        }
        return list;
    }

    public boolean toggleActiveStatus(int userId) throws SQLException {
        String sql = "UPDATE users SET is_active = NOT is_active WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean updateUser(int userId, String username, String email, String firstName, String lastName) throws SQLException {
        String sql = "UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, username.trim());
            stmt.setString(2, email.trim());
            stmt.setString(3, firstName.trim());
            stmt.setString(4, lastName.trim());
            stmt.setInt(5, userId);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean deleteUser(int userId) throws SQLException {
        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            return stmt.executeUpdate() > 0;
        }
    }

    private User populateUserObject(Connection conn, ResultSet rs) throws SQLException {
        int id = rs.getInt("id");
        String username = rs.getString("username");
        String hash = rs.getString("password_hash");
        String email = rs.getString("email");
        String role = rs.getString("role");
        boolean active = rs.getBoolean("is_active");
        String firstName = rs.getString("first_name");
        String lastName = rs.getString("last_name");

        User u;
        if ("ADMIN".equalsIgnoreCase(role)) {
            u = new Admin(id, username, hash, email, firstName, lastName);
        } else if ("FACULTY".equalsIgnoreCase(role)) {
            Faculty faculty = new Faculty(id, username, hash, email, firstName, lastName, 0, 0, "", "");
            String fSql = "SELECT f.id as f_id, f.department_id, f.designation, f.phone, d.code as d_code, d.name as d_name " +
                          "FROM faculty f JOIN departments d ON f.department_id = d.id WHERE f.user_id = ?";
            try (PreparedStatement fStmt = conn.prepareStatement(fSql)) {
                fStmt.setInt(1, id);
                try (ResultSet fRs = fStmt.executeQuery()) {
                    if (fRs.next()) {
                        faculty.setFacultyId(fRs.getInt("f_id"));
                        faculty.setDepartmentId(fRs.getInt("department_id"));
                        faculty.setDepartmentCode(fRs.getString("d_code"));
                        faculty.setDepartmentName(fRs.getString("d_name"));
                        faculty.setDesignation(fRs.getString("designation"));
                        faculty.setPhone(fRs.getString("phone"));
                    }
                }
            }
            u = faculty;
        } else if ("STUDENT".equalsIgnoreCase(role)) {
            Student student = new Student(id, username, hash, email, firstName, lastName, 0, 0, 0, "", "", null, "");
            String sSql = "SELECT s.id as s_id, s.department_id, s.class_id, s.roll_number, s.register_number, s.date_of_birth, s.phone, " +
                          "d.code as d_code, d.name as d_name, c.name as c_name " +
                          "FROM students s JOIN departments d ON s.department_id = d.id " +
                          "JOIN classes c ON s.class_id = c.id WHERE s.user_id = ?";
            try (PreparedStatement sStmt = conn.prepareStatement(sSql)) {
                sStmt.setInt(1, id);
                try (ResultSet sRs = sStmt.executeQuery()) {
                    if (sRs.next()) {
                        student.setStudentId(sRs.getInt("s_id"));
                        student.setDepartmentId(sRs.getInt("department_id"));
                        student.setDepartmentCode(sRs.getString("d_code"));
                        student.setDepartmentName(sRs.getString("d_name"));
                        student.setClassId(sRs.getInt("class_id"));
                        student.setClassName(sRs.getString("c_name"));
                        student.setRollNumber(sRs.getString("roll_number"));
                        student.setRegisterNumber(sRs.getString("register_number"));
                        student.setDateOfBirth(sRs.getDate("date_of_birth"));
                        student.setPhone(sRs.getString("phone"));
                    }
                }
            }
            u = student;
        } else {
            return null;
        }

        u.setActive(active);
        u.setCreatedAt(rs.getTimestamp("created_at"));
        return u;
    }

    public boolean updatePassword(int userId, String newPassword) throws SQLException {
        String sql = "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, com.obe.util.PasswordUtil.hashPassword(newPassword));
            stmt.setInt(2, userId);
            return stmt.executeUpdate() > 0;
        }
    }

    public String createPasswordResetToken(String email) throws SQLException {
        String token = java.util.UUID.randomUUID().toString();
        Timestamp expiry = new Timestamp(System.currentTimeMillis() + (30 * 60 * 1000)); // 30 minutes
        String sql = "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, token);
            stmt.setTimestamp(2, expiry);
            stmt.setString(3, email);
            if (stmt.executeUpdate() > 0) {
                return token;
            }
        }
        return null;
    }

    public User validateResetToken(String token) throws SQLException {
        String sql = "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, token);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return populateUserObject(conn, rs);
                }
            }
        }
        return null;
    }
}
