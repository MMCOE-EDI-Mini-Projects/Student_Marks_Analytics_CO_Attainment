package com.obe.dao;

import com.obe.model.Batch;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BatchDAO {

    public List<Batch> getAllBatches() throws SQLException {
        List<Batch> list = new ArrayList<>();
        String sql = "SELECT c.*, d.code as d_code, d.name as d_name " +
                     "FROM classes c JOIN departments d ON c.department_id = d.id " +
                     "ORDER BY d.code, c.semester, c.name";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapBatch(rs));
            }
        }
        return list;
    }

    public List<Batch> getBatchesByDepartment(int departmentId) throws SQLException {
        List<Batch> list = new ArrayList<>();
        String sql = "SELECT c.*, d.code as d_code, d.name as d_name " +
                     "FROM classes c JOIN departments d ON c.department_id = d.id " +
                     "WHERE c.department_id = ? ORDER BY c.semester, c.name";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, departmentId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapBatch(rs));
                }
            }
        }
        return list;
    }

    public Batch getById(int id) throws SQLException {
        String sql = "SELECT c.*, d.code as d_code, d.name as d_name " +
                     "FROM classes c JOIN departments d ON c.department_id = d.id WHERE c.id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return mapBatch(rs);
            }
        }
        return null;
    }

    public boolean create(Batch batch) throws SQLException {
        String sql = "INSERT INTO classes (department_id, name, academic_year, semester) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, batch.getDepartmentId());
            stmt.setString(2, batch.getName().trim());
            stmt.setString(3, batch.getAcademicYear().trim());
            stmt.setInt(4, batch.getSemester());
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) batch.setId(rs.getInt(1));
                }
                return true;
            }
        }
        return false;
    }

    public boolean update(Batch batch) throws SQLException {
        String sql = "UPDATE classes SET department_id = ?, name = ?, academic_year = ?, semester = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, batch.getDepartmentId());
            stmt.setString(2, batch.getName().trim());
            stmt.setString(3, batch.getAcademicYear().trim());
            stmt.setInt(4, batch.getSemester());
            stmt.setInt(5, batch.getId());
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

    private Batch mapBatch(ResultSet rs) throws SQLException {
        Batch b = new Batch(
                rs.getInt("id"),
                rs.getInt("department_id"),
                rs.getString("name"),
                rs.getString("academic_year"),
                rs.getInt("semester"),
                ""
        );
        b.setDepartmentCode(rs.getString("d_code"));
        b.setDepartmentName(rs.getString("d_name"));
        b.setCreatedAt(rs.getTimestamp("created_at"));
        return b;
    }
}
