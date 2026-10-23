package com.obe.dao;

import com.obe.model.AttainmentConfig;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.HashMap;
import java.util.Map;

public class AttainmentDAO {

    public AttainmentConfig getConfig() throws SQLException {
        String sql = "SELECT * FROM attainment_config WHERE id = 1";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                return new AttainmentConfig(
                        rs.getInt("id"),
                        rs.getDouble("target_mark_pct"),
                        rs.getDouble("level_1_pct"),
                        rs.getDouble("level_2_pct"),
                        rs.getDouble("level_3_pct"),
                        rs.getDouble("direct_weight"),
                        rs.getDouble("indirect_weight")
                );
            }
        }
        // Fallback default
        return new AttainmentConfig(1, 60.0, 50.0, 60.0, 70.0, 80.0, 20.0);
    }

    public boolean updateConfig(AttainmentConfig config) throws SQLException {
        String sql = "UPDATE attainment_config SET target_mark_pct = ?, level_1_pct = ?, level_2_pct = ?, level_3_pct = ?, direct_weight = ?, indirect_weight = ? WHERE id = 1";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setDouble(1, config.getTargetMarkPct());
            stmt.setDouble(2, config.getLevel1Pct());
            stmt.setDouble(3, config.getLevel2Pct());
            stmt.setDouble(4, config.getLevel3Pct());
            stmt.setDouble(5, config.getDirectWeight());
            stmt.setDouble(6, config.getIndirectWeight());
            return stmt.executeUpdate() > 0;
        }
    }
}
