package com.obe.dao;

import com.obe.model.Department;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DepartmentDAO {

    public List<Department> getAllDepartments() throws SQLException {
        List<Department> list = new ArrayList<>();
        String sql = "SELECT * FROM departments ORDER BY code ASC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Department d = new Department(
                        rs.getInt("id"),
                        rs.getString("code"),
                        rs.getString("name"),
                        rs.getString("description")
                );
                d.setCreatedAt(rs.getTimestamp("created_at"));
                list.add(d);
            }
        }
        return list;
    }

    public Department getById(int id) throws SQLException {
        String sql = "SELECT * FROM departments WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Department d = new Department(
                            rs.getInt("id"),
                            rs.getString("code"),
                            rs.getString("name"),
                            rs.getString("description")
                    );
                    d.setCreatedAt(rs.getTimestamp("created_at"));
                    return d;
                }
            }
        }
        return null;
    }

    public boolean create(Department department) throws SQLException {
        String sql = "INSERT INTO departments (code, name, description) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, department.getCode().trim().toUpperCase());
            stmt.setString(2, department.getName().trim());
            stmt.setString(3, department.getDescription());
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) department.setId(rs.getInt(1));
                }
                return true;
            }
        }
        return false;
    }

    public boolean update(Department department) throws SQLException {
        String sql = "UPDATE departments SET code = ?, name = ?, description = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, department.getCode().trim().toUpperCase());
            stmt.setString(2, department.getName().trim());
            stmt.setString(3, department.getDescription());
            stmt.setInt(4, department.getId());
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM departments WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        }
    }
}
