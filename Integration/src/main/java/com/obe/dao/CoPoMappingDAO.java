package com.obe.dao;

import com.obe.model.CoPoMapping;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CoPoMappingDAO {

    public List<CoPoMapping> getMappingsBySubject(int subjectId) throws SQLException {
        List<CoPoMapping> list = new ArrayList<>();
        String sql = "SELECT m.*, co.co_code, po.po_code " +
                     "FROM co_po_mapping m " +
                     "JOIN course_outcomes co ON m.co_id = co.id " +
                     "JOIN programme_outcomes po ON m.po_id = po.id " +
                     "WHERE co.subject_id = ? ORDER BY co.co_code, po.po_code";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, subjectId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    CoPoMapping m = new CoPoMapping(
                            rs.getInt("id"),
                            rs.getInt("co_id"),
                            rs.getInt("po_id"),
                            rs.getInt("strength")
                    );
                    m.setCoCode(rs.getString("co_code"));
                    m.setPoCode(rs.getString("po_code"));
                    list.add(m);
                }
            }
        }
        return list;
    }

    public boolean saveOrUpdateMapping(int coId, int poId, int strength) throws SQLException {
        String sql = "INSERT INTO co_po_mapping (co_id, po_id, strength) VALUES (?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE strength = VALUES(strength)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, coId);
            stmt.setInt(2, poId);
            stmt.setInt(3, strength);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean batchSaveMappings(List<CoPoMapping> mappings) throws SQLException {
        String sql = "INSERT INTO co_po_mapping (co_id, po_id, strength) VALUES (?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE strength = VALUES(strength)";
        Connection conn = null;
        try {
            conn = DatabaseUtil.getConnection();
            conn.setAutoCommit(false);
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                for (CoPoMapping m : mappings) {
                    stmt.setInt(1, m.getCoId());
                    stmt.setInt(2, m.getPoId());
                    stmt.setInt(3, m.getStrength());
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
