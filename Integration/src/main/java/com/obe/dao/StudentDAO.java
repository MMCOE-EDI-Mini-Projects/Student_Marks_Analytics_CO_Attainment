package com.obe.dao;

import com.obe.model.Student;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class StudentDAO {

    public List<Student> getAllStudents() throws SQLException {
        List<Student> list = new ArrayList<>();
        String sql = "SELECT s.id as s_id, s.user_id, s.department_id, s.class_id, s.roll_number, s.register_number, s.date_of_birth, s.phone, " +
                     "u.username, u.email, u.first_name, u.last_name, d.code as d_code, d.name as d_name, c.name as c_name " +
                     "FROM students s JOIN users u ON s.user_id = u.id " +
                     "JOIN departments d ON s.department_id = d.id " +
                     "JOIN classes c ON s.class_id = c.id ORDER BY s.roll_number ASC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapStudent(rs));
            }
        }
        return list;
    }

    public List<Student> getStudentsByClass(int classId) throws SQLException {
        List<Student> list = new ArrayList<>();
        String sql = "SELECT s.id as s_id, s.user_id, s.department_id, s.class_id, s.roll_number, s.register_number, s.date_of_birth, s.phone, " +
                     "u.username, u.email, u.first_name, u.last_name, d.code as d_code, d.name as d_name, c.name as c_name " +
                     "FROM students s JOIN users u ON s.user_id = u.id " +
                     "JOIN departments d ON s.department_id = d.id " +
                     "JOIN classes c ON s.class_id = c.id WHERE s.class_id = ? ORDER BY s.roll_number ASC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, classId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapStudent(rs));
                }
            }
        }
        return list;
    }

    public List<Student> getStudentsByBatch(int batchId) throws SQLException {
        return getStudentsByClass(batchId);
    }

    public Student getById(int studentId) throws SQLException {
        String sql = "SELECT s.id as s_id, s.user_id, s.department_id, s.class_id, s.roll_number, s.register_number, s.date_of_birth, s.phone, " +
                     "u.username, u.email, u.first_name, u.last_name, d.code as d_code, d.name as d_name, c.name as c_name " +
                     "FROM students s JOIN users u ON s.user_id = u.id " +
                     "JOIN departments d ON s.department_id = d.id " +
                     "JOIN classes c ON s.class_id = c.id WHERE s.id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, studentId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return mapStudent(rs);
            }
        }
        return null;
    }

    public boolean createStudentUser(Student student, String rawPassword) throws SQLException {
        Connection conn = null;
        try {
            conn = DatabaseUtil.getConnection();
            conn.setAutoCommit(false);

            // 1. Insert user
            String uSql = "INSERT INTO users (username, password_hash, email, role, first_name, last_name) VALUES (?, ?, ?, 'STUDENT', ?, ?)";
            int userId = 0;
            try (PreparedStatement uStmt = conn.prepareStatement(uSql, Statement.RETURN_GENERATED_KEYS)) {
                uStmt.setString(1, student.getUsername().trim());
                uStmt.setString(2, com.obe.util.PasswordUtil.hashPassword(rawPassword));
                uStmt.setString(3, student.getEmail().trim());
                uStmt.setString(4, student.getFirstName().trim());
                uStmt.setString(5, student.getLastName().trim());
                uStmt.executeUpdate();
                try (ResultSet rs = uStmt.getGeneratedKeys()) {
                    if (rs.next()) userId = rs.getInt(1);
                }
            }

            // 2. Insert student
            String sSql = "INSERT INTO students (user_id, department_id, class_id, batch_id, roll_number, register_number, date_of_birth, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement sStmt = conn.prepareStatement(sSql)) {
                sStmt.setInt(1, userId);
                sStmt.setInt(2, student.getDepartmentId());
                sStmt.setInt(3, student.getClassId());
                sStmt.setInt(4, student.getClassId());
                sStmt.setString(5, student.getRollNumber().trim());
                sStmt.setString(6, student.getRegisterNumber().trim());
                sStmt.setDate(7, student.getDateOfBirth());
                sStmt.setString(8, student.getPhone());
                sStmt.executeUpdate();
            }

            // 3. Auto-enroll student into subjects of the assigned class
            String eSql = "INSERT IGNORE INTO enrollments (student_id, subject_id, class_id, batch_id, status) " +
                          "SELECT s.id, sub.id, sub.class_id, sub.class_id, 'ENROLLED' FROM students s " +
                          "JOIN subjects sub ON s.class_id = sub.class_id WHERE s.user_id = ?";
            try (PreparedStatement eStmt = conn.prepareStatement(eSql)) {
                eStmt.setInt(1, userId);
                eStmt.executeUpdate();
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

    public boolean updateStudent(Student student) throws SQLException {
        Connection conn = null;
        try {
            conn = DatabaseUtil.getConnection();
            conn.setAutoCommit(false);

            // 1. Update user details
            String uSql = "UPDATE users u JOIN students s ON s.user_id = u.id " +
                          "SET u.first_name = ?, u.last_name = ?, u.email = ? WHERE s.id = ?";
            try (PreparedStatement uStmt = conn.prepareStatement(uSql)) {
                uStmt.setString(1, student.getFirstName().trim());
                uStmt.setString(2, student.getLastName().trim());
                uStmt.setString(3, student.getEmail().trim());
                uStmt.setInt(4, student.getStudentId());
                uStmt.executeUpdate();
            }

            // 2. Update student details
            String sSql = "UPDATE students SET department_id = ?, class_id = ?, batch_id = ?, roll_number = ?, register_number = ?, date_of_birth = ?, phone = ? WHERE id = ?";
            try (PreparedStatement sStmt = conn.prepareStatement(sSql)) {
                sStmt.setInt(1, student.getDepartmentId());
                sStmt.setInt(2, student.getClassId());
                sStmt.setInt(3, student.getClassId());
                sStmt.setString(4, student.getRollNumber().trim());
                sStmt.setString(5, student.getRegisterNumber().trim());
                sStmt.setDate(6, student.getDateOfBirth());
                sStmt.setString(7, student.getPhone());
                sStmt.setInt(8, student.getStudentId());
                sStmt.executeUpdate();
            }

            // 3. Ensure enrollments are present for class subjects
            String eSql = "INSERT IGNORE INTO enrollments (student_id, subject_id, class_id, batch_id, status) " +
                          "SELECT ?, sub.id, sub.class_id, sub.class_id, 'ENROLLED' FROM subjects sub WHERE sub.class_id = ?";
            try (PreparedStatement eStmt = conn.prepareStatement(eSql)) {
                eStmt.setInt(1, student.getStudentId());
                eStmt.setInt(2, student.getClassId());
                eStmt.executeUpdate();
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

    public boolean updateStudentProfile(int studentId, String phone, Date dob, String email) throws SQLException {
        Connection conn = null;
        try {
            conn = DatabaseUtil.getConnection();
            conn.setAutoCommit(false);

            String uSql = "UPDATE users u JOIN students s ON s.user_id = u.id SET u.email = ? WHERE s.id = ?";
            try (PreparedStatement uStmt = conn.prepareStatement(uSql)) {
                uStmt.setString(1, email.trim());
                uStmt.setInt(2, studentId);
                uStmt.executeUpdate();
            }

            String sSql = "UPDATE students SET phone = ?, date_of_birth = ? WHERE id = ?";
            try (PreparedStatement sStmt = conn.prepareStatement(sSql)) {
                sStmt.setString(1, phone != null ? phone.trim() : null);
                sStmt.setDate(2, dob);
                sStmt.setInt(3, studentId);
                sStmt.executeUpdate();
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

    public boolean deleteStudent(int studentId) throws SQLException {
        Connection conn = null;
        try {
            conn = DatabaseUtil.getConnection();
            conn.setAutoCommit(false);

            int userId = 0;
            String findUserSql = "SELECT user_id FROM students WHERE id = ?";
            try (PreparedStatement fStmt = conn.prepareStatement(findUserSql)) {
                fStmt.setInt(1, studentId);
                try (ResultSet rs = fStmt.executeQuery()) {
                    if (rs.next()) userId = rs.getInt("user_id");
                }
            }

            if (userId > 0) {
                // Deleting user cascades to student, marks, attendance, submissions, etc.
                String delUserSql = "DELETE FROM users WHERE id = ?";
                try (PreparedStatement dStmt = conn.prepareStatement(delUserSql)) {
                    dStmt.setInt(1, userId);
                    dStmt.executeUpdate();
                }
            } else {
                String delStudentSql = "DELETE FROM students WHERE id = ?";
                try (PreparedStatement dStmt = conn.prepareStatement(delStudentSql)) {
                    dStmt.setInt(1, studentId);
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

    private Student mapStudent(ResultSet rs) throws SQLException {
        Student s = new Student(
                rs.getInt("user_id"),
                rs.getString("username"),
                "",
                rs.getString("email"),
                rs.getString("first_name"),
                rs.getString("last_name"),
                rs.getInt("s_id"),
                rs.getInt("department_id"),
                rs.getInt("class_id"),
                rs.getString("roll_number"),
                rs.getString("register_number"),
                rs.getDate("date_of_birth"),
                rs.getString("phone")
        );
        s.setDepartmentCode(rs.getString("d_code"));
        s.setDepartmentName(rs.getString("d_name"));
        s.setClassName(rs.getString("c_name"));
        return s;
    }
}
