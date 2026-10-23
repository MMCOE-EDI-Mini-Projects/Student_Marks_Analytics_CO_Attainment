package com.obe.dao;

import com.obe.model.Subject;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SubjectDAO {

    public List<Subject> getAllSubjects() throws SQLException {
        List<Subject> list = new ArrayList<>();
        String sql = "SELECT s.*, d.code as d_code, c.name as c_name " +
                     "FROM subjects s JOIN departments d ON s.department_id = d.id " +
                     "JOIN classes c ON s.class_id = c.id ORDER BY d.code, s.code";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapSubject(rs));
            }
        }
        return list;
    }

    public List<Subject> getSubjectsByClass(int classId) throws SQLException {
        List<Subject> list = new ArrayList<>();
        String sql = "SELECT s.*, d.code as d_code, c.name as c_name " +
                     "FROM subjects s JOIN departments d ON s.department_id = d.id " +
                     "JOIN classes c ON s.class_id = c.id WHERE s.class_id = ? ORDER BY s.code";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, classId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapSubject(rs));
                }
            }
        }
        return list;
    }

    public List<Subject> getSubjectsByBatch(int batchId) throws SQLException {
        return getSubjectsByClass(batchId);
    }

    public List<Subject> getSubjectsByDepartmentAndClass(int departmentId, int classId) throws SQLException {
        List<Subject> list = new ArrayList<>();
        String sql = "SELECT s.*, d.code as d_code, c.name as c_name " +
                     "FROM subjects s JOIN departments d ON s.department_id = d.id " +
                     "JOIN classes c ON s.class_id = c.id WHERE s.department_id = ? AND s.class_id = ? ORDER BY s.code";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, departmentId);
            stmt.setInt(2, classId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapSubject(rs));
                }
            }
        }
        return list;
    }

    public List<Subject> getSubjectsByDepartmentAndBatch(int departmentId, int batchId) throws SQLException {
        return getSubjectsByDepartmentAndClass(departmentId, batchId);
    }

    public Subject getById(int id) throws SQLException {
        String sql = "SELECT s.*, d.code as d_code, c.name as c_name " +
                     "FROM subjects s JOIN departments d ON s.department_id = d.id " +
                     "JOIN classes c ON s.class_id = c.id WHERE s.id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return mapSubject(rs);
            }
        }
        return null;
    }

    public boolean create(Subject subject) throws SQLException {
        String sql = "INSERT INTO subjects (department_id, class_id, batch_id, code, name, credits, semester, subject_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, subject.getDepartmentId());
            stmt.setInt(2, subject.getClassId());
            stmt.setInt(3, subject.getClassId());
            stmt.setString(4, subject.getCode().trim().toUpperCase());
            stmt.setString(5, subject.getName().trim());
            stmt.setInt(6, subject.getCredits());
            stmt.setInt(7, subject.getSemester());
            stmt.setString(8, subject.getSubjectType());
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) subject.setId(rs.getInt(1));
                }
                // Students already in this class inherit a newly added subject.
                String enrollmentSql = "INSERT IGNORE INTO enrollments (student_id, subject_id, class_id, batch_id, status) " +
                        "SELECT id, ?, class_id, class_id, 'ENROLLED' FROM students WHERE class_id = ?";
                try (PreparedStatement enrollment = conn.prepareStatement(enrollmentSql)) {
                    enrollment.setInt(1, subject.getId());
                    enrollment.setInt(2, subject.getClassId());
                    enrollment.executeUpdate();
                }
                return true;
            }
        }
        return false;
    }

    public boolean update(Subject subject) throws SQLException {
        String sql = "UPDATE subjects SET department_id = ?, class_id = ?, code = ?, name = ?, credits = ?, semester = ?, subject_type = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, subject.getDepartmentId());
            stmt.setInt(2, subject.getClassId());
            stmt.setString(3, subject.getCode().trim().toUpperCase());
            stmt.setString(4, subject.getName().trim());
            stmt.setInt(5, subject.getCredits());
            stmt.setInt(6, subject.getSemester());
            stmt.setString(7, subject.getSubjectType());
            stmt.setInt(8, subject.getId());
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM subjects WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        }
    }

    private Subject mapSubject(ResultSet rs) throws SQLException {
        Subject s = new Subject(
                rs.getInt("id"),
                rs.getInt("department_id"),
                rs.getInt("class_id"),
                rs.getString("code"),
                rs.getString("name"),
                rs.getInt("credits"),
                rs.getInt("semester"),
                rs.getString("subject_type")
        );
        s.setDepartmentCode(rs.getString("d_code"));
        s.setClassName(rs.getString("c_name"));
        return s;
    }
}
