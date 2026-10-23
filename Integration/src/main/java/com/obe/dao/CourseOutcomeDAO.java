package com.obe.dao;

import com.obe.model.CourseOutcome;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CourseOutcomeDAO {

    public List<CourseOutcome> getCOsBySubject(int subjectId) throws SQLException {
        List<CourseOutcome> list = new ArrayList<>();
        String sql = "SELECT co.*, s.code as s_code FROM course_outcomes co " +
                     "JOIN subjects s ON co.subject_id = s.id WHERE co.subject_id = ? ORDER BY co.co_code ASC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, subjectId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    CourseOutcome co = new CourseOutcome(
                            rs.getInt("id"),
                            rs.getInt("subject_id"),
                            rs.getString("co_code"),
                            rs.getString("description"),
                            rs.getDouble("target_attainment_pct")
                    );
                    co.setSubjectCode(rs.getString("s_code"));
                    list.add(co);
                }
            }
        }
        return list;
    }

    public CourseOutcome getById(int id) throws SQLException {
        String sql = "SELECT co.*, s.code as s_code FROM course_outcomes co " +
                     "JOIN subjects s ON co.subject_id = s.id WHERE co.id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    CourseOutcome co = new CourseOutcome(
                            rs.getInt("id"),
                            rs.getInt("subject_id"),
                            rs.getString("co_code"),
                            rs.getString("description"),
                            rs.getDouble("target_attainment_pct")
                    );
                    co.setSubjectCode(rs.getString("s_code"));
                    return co;
                }
            }
        }
        return null;
    }

    public boolean create(CourseOutcome co) throws SQLException {
        String sql = "INSERT INTO course_outcomes (subject_id, co_code, description, target_attainment_pct) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, co.getSubjectId());
            stmt.setString(2, co.getCoCode().trim().toUpperCase());
            stmt.setString(3, co.getDescription().trim());
            stmt.setDouble(4, co.getTargetAttainmentPct() > 0 ? co.getTargetAttainmentPct() : 60.00);
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) co.setId(rs.getInt(1));
                }
                return true;
            }
        }
        return false;
    }

    public boolean update(CourseOutcome co) throws SQLException {
        String sql = "UPDATE course_outcomes SET co_code = ?, description = ?, target_attainment_pct = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, co.getCoCode().trim().toUpperCase());
            stmt.setString(2, co.getDescription().trim());
            stmt.setDouble(3, co.getTargetAttainmentPct());
            stmt.setInt(4, co.getId());
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM course_outcomes WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        }
    }
}
