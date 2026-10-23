package com.obe.dao;

import com.obe.model.ClassModel;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ClassDAO {

    public List<ClassModel> getAllClasses() throws SQLException {
        List<ClassModel> list = new ArrayList<>();
        String sql = "SELECT c.*, d.code as d_code, d.name as d_name " +
                     "FROM classes c JOIN departments d ON c.department_id = d.id " +
                     "ORDER BY d.code, c.semester, c.name";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapClass(rs));
            }
        }
        return list;
    }

    public List<ClassModel> getClassesByDepartment(int departmentId) throws SQLException {
        List<ClassModel> list = new ArrayList<>();
        String sql = "SELECT c.*, d.code as d_code, d.name as d_name " +
                     "FROM classes c JOIN departments d ON c.department_id = d.id " +
                     "WHERE c.department_id = ? ORDER BY c.semester, c.name";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, departmentId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapClass(rs));
                }
            }
        }
        return list;
    }

    public ClassModel getById(int id) throws SQLException {
        String sql = "SELECT c.*, d.code as d_code, d.name as d_name " +
                     "FROM classes c JOIN departments d ON c.department_id = d.id WHERE c.id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapClass(rs);
                }
            }
        }
        return null;
    }

    public boolean create(ClassModel c) throws SQLException {
        String sql = "INSERT INTO classes (department_id, name, academic_year, semester) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, c.getDepartmentId());
            stmt.setString(2, c.getName().trim());
            stmt.setString(3, c.getAcademicYear().trim());
            stmt.setInt(4, c.getSemester());
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) c.setId(rs.getInt(1));
                }
                return true;
            }
        }
        return false;
    }

    public boolean update(ClassModel c) throws SQLException {
        String sql = "UPDATE classes SET department_id = ?, name = ?, academic_year = ?, semester = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, c.getDepartmentId());
            stmt.setString(2, c.getName().trim());
            stmt.setString(3, c.getAcademicYear().trim());
            stmt.setInt(4, c.getSemester());
            stmt.setInt(5, c.getId());
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM classes WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        }
    }

    private ClassModel mapClass(ResultSet rs) throws SQLException {
        ClassModel c = new ClassModel(
                rs.getInt("id"),
                rs.getInt("department_id"),
                rs.getString("name"),
                rs.getString("academic_year"),
                rs.getInt("semester")
        );
        c.setDepartmentCode(rs.getString("d_code"));
        c.setDepartmentName(rs.getString("d_name"));
        c.setCreatedAt(rs.getTimestamp("created_at"));
        return c;
    }
}
