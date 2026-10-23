package com.obe.dao;

import com.obe.model.ProgrammeOutcome;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProgrammeOutcomeDAO {

    public List<ProgrammeOutcome> getPOsByDepartment(int departmentId) throws SQLException {
        List<ProgrammeOutcome> list = new ArrayList<>();
        String sql = "SELECT po.*, d.code as d_code FROM programme_outcomes po " +
                     "JOIN departments d ON po.department_id = d.id WHERE po.department_id = ? ORDER BY po.po_code ASC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, departmentId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    ProgrammeOutcome po = new ProgrammeOutcome(
                            rs.getInt("id"),
                            rs.getInt("department_id"),
                            rs.getString("po_code"),
                            rs.getString("title"),
                            rs.getString("description")
                    );
                    po.setDepartmentCode(rs.getString("d_code"));
                    list.add(po);
                }
            }
        }
        return list;
    }

    public boolean create(ProgrammeOutcome po) throws SQLException {
        String sql = "INSERT INTO programme_outcomes (department_id, po_code, title, description) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, po.getDepartmentId());
            stmt.setString(2, po.getPoCode().trim().toUpperCase());
            stmt.setString(3, po.getTitle() != null ? po.getTitle().trim() : "");
            stmt.setString(4, po.getDescription().trim());
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) po.setId(rs.getInt(1));
                }
                return true;
            }
        }
        return false;
    }

    public boolean update(ProgrammeOutcome po) throws SQLException {
        String sql = "UPDATE programme_outcomes SET po_code = ?, title = ?, description = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, po.getPoCode().trim().toUpperCase());
            stmt.setString(2, po.getTitle());
            stmt.setString(3, po.getDescription().trim());
            stmt.setInt(4, po.getId());
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM programme_outcomes WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        }
    }
}
