package com.obe.service;

import com.obe.dao.*;
import com.obe.model.*;
import com.obe.util.DatabaseUtil;

import java.sql.*;
import java.util.*;

public class AttainmentEngine {

    private final CourseOutcomeDAO coDao = new CourseOutcomeDAO();
    private final ProgrammeOutcomeDAO poDao = new ProgrammeOutcomeDAO();
    private final CoPoMappingDAO mappingDao = new CoPoMappingDAO();
    private final AttainmentDAO attainmentDao = new AttainmentDAO();

    public Map<String, Object> calculateSubjectAttainment(int subjectId, int classId) throws SQLException {
        AttainmentConfig config = attainmentDao.getConfig();
        List<CourseOutcome> cos = coDao.getCOsBySubject(subjectId);
        List<CoPoMapping> mappings = mappingDao.getMappingsBySubject(subjectId);

        Map<String, Object> result = new HashMap<>();
        Map<String, Map<String, Object>> coAttainmentResults = new LinkedHashMap<>();

        // 1. Calculate CO Attainment for each CO across the class
        String coSql = "SELECT co.id as co_id, co.co_code, q.max_marks, sm.marks_obtained, sm.is_absent " +
                      "FROM course_outcomes co " +
                      "JOIN assessment_questions q ON q.co_id = co.id " +
                      "JOIN assessments a ON q.assessment_id = a.id " +
                      "JOIN student_marks sm ON sm.question_id = q.id " +
                      "WHERE co.subject_id = ? AND a.class_id = ?";

        Map<Integer, Integer> totalAttemptsPerCo = new HashMap<>();
        Map<Integer, Integer> targetAttainedCountPerCo = new HashMap<>();

        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(coSql)) {
            stmt.setInt(1, subjectId);
            stmt.setInt(2, classId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    int coId = rs.getInt("co_id");
                    double maxMarks = rs.getDouble("max_marks");
                    double marks = rs.getDouble("marks_obtained");
                    boolean absent = rs.getBoolean("is_absent");

                    if (absent) continue;

                    totalAttemptsPerCo.put(coId, totalAttemptsPerCo.getOrDefault(coId, 0) + 1);

                    double thresholdMarks = maxMarks * (config.getTargetMarkPct() / 100.0);
                    if (marks >= thresholdMarks) {
                        targetAttainedCountPerCo.put(coId, targetAttainedCountPerCo.getOrDefault(coId, 0) + 1);
                    }
                }
            }
        }

        Map<Integer, Double> coLevelMap = new HashMap<>();

        for (CourseOutcome co : cos) {
            int total = totalAttemptsPerCo.getOrDefault(co.getId(), 0);
            int attained = targetAttainedCountPerCo.getOrDefault(co.getId(), 0);
            double pct = total > 0 ? (attained * 100.0 / total) : 0.0;

            double level = 0.0;
            if (pct >= config.getLevel3Pct()) {
                level = 3.0;
            } else if (pct >= config.getLevel2Pct()) {
                level = 2.0;
            } else if (pct >= config.getLevel1Pct()) {
                level = 1.0;
            }

            coLevelMap.put(co.getId(), level);

            Map<String, Object> coData = new HashMap<>();
            coData.put("coId", co.getId());
            coData.put("coCode", co.getCoCode());
            coData.put("description", co.getDescription());
            coData.put("totalAttempts", total);
            coData.put("attainedCount", attained);
            coData.put("attainmentPct", Math.round(pct * 100.0) / 100.0);
            coData.put("attainmentLevel", level);
            coData.put("targetPct", co.getTargetAttainmentPct());
            coAttainmentResults.put(co.getCoCode(), coData);
        }

        // 2. Calculate PO Attainment from CO levels weighted by CO-PO matrix mapping strengths
        Map<String, List<CoPoMapping>> poToCoMappings = new LinkedHashMap<>();
        for (CoPoMapping m : mappings) {
            poToCoMappings.computeIfAbsent(m.getPoCode(), k -> new ArrayList<>()).add(m);
        }

        Map<String, Map<String, Object>> poAttainmentResults = new LinkedHashMap<>();
        for (Map.Entry<String, List<CoPoMapping>> entry : poToCoMappings.entrySet()) {
            String poCode = entry.getKey();
            List<CoPoMapping> mapList = entry.getValue();

            double weightedSum = 0.0;
            int totalStrength = 0;

            for (CoPoMapping m : mapList) {
                if (m.getStrength() > 0) {
                    double coLevel = coLevelMap.getOrDefault(m.getCoId(), 0.0);
                    weightedSum += coLevel * m.getStrength();
                    totalStrength += m.getStrength();
                }
            }

            double poLevel = totalStrength > 0 ? (weightedSum / totalStrength) : 0.0;

            Map<String, Object> poData = new HashMap<>();
            poData.put("poCode", poCode);
            poData.put("totalStrength", totalStrength);
            poData.put("poAttainmentLevel", Math.round(poLevel * 100.0) / 100.0);
            poAttainmentResults.put(poCode, poData);
        }

        result.put("config", config);
        result.put("coAttainment", coAttainmentResults);
        result.put("poAttainment", poAttainmentResults);

        return result;
    }

    public Map<String, Object> calculateStudentAttainment(int studentId, int subjectId) throws SQLException {
        AttainmentConfig config = attainmentDao.getConfig();
        List<CourseOutcome> cos = coDao.getCOsBySubject(subjectId);
        List<CoPoMapping> mappings = mappingDao.getMappingsBySubject(subjectId);

        Map<String, Object> result = new HashMap<>();
        Map<String, Map<String, Object>> coResults = new LinkedHashMap<>();

        String sql = "SELECT co.id as co_id, co.co_code, co.description, " +
                     "COALESCE(SUM(sm.marks_obtained), 0) as total_obtained, " +
                     "COALESCE(SUM(q.max_marks), 0) as total_max " +
                     "FROM course_outcomes co " +
                     "JOIN assessment_questions q ON q.co_id = co.id " +
                     "JOIN assessments a ON q.assessment_id = a.id " +
                     "LEFT JOIN student_marks sm ON sm.question_id = q.id AND sm.student_id = ? " +
                     "WHERE co.subject_id = ? GROUP BY co.id, co.co_code, co.description";

        Map<Integer, Double> studentCoLevelMap = new HashMap<>();

        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, studentId);
            stmt.setInt(2, subjectId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    int coId = rs.getInt("co_id");
                    String coCode = rs.getString("co_code");
                    String desc = rs.getString("description");
                    double obtained = rs.getDouble("total_obtained");
                    double maxMarks = rs.getDouble("total_max");
                    double pct = maxMarks > 0 ? (obtained * 100.0 / maxMarks) : 0.0;

                    double level = 0.0;
                    if (pct >= config.getLevel3Pct()) level = 3.0;
                    else if (pct >= config.getLevel2Pct()) level = 2.0;
                    else if (pct >= config.getLevel1Pct()) level = 1.0;

                    studentCoLevelMap.put(coId, level);

                    Map<String, Object> coData = new HashMap<>();
                    coData.put("coId", coId);
                    coData.put("coCode", coCode);
                    coData.put("description", desc);
                    coData.put("marksObtained", obtained);
                    coData.put("maxMarks", maxMarks);
                    coData.put("attainmentPct", Math.round(pct * 100.0) / 100.0);
                    coData.put("attainmentLevel", level);
                    coResults.put(coCode, coData);
                }
            }
        }

        // Fill in any COs without questions yet
        for (CourseOutcome co : cos) {
            if (!coResults.containsKey(co.getCoCode())) {
                Map<String, Object> coData = new HashMap<>();
                coData.put("coId", co.getId());
                coData.put("coCode", co.getCoCode());
                coData.put("description", co.getDescription());
                coData.put("marksObtained", 0.0);
                coData.put("maxMarks", 0.0);
                coData.put("attainmentPct", 0.0);
                coData.put("attainmentLevel", 0.0);
                coResults.put(co.getCoCode(), coData);
            }
        }

        // PO calculation for student
        Map<String, List<CoPoMapping>> poToCoMappings = new LinkedHashMap<>();
        for (CoPoMapping m : mappings) {
            poToCoMappings.computeIfAbsent(m.getPoCode(), k -> new ArrayList<>()).add(m);
        }

        Map<String, Map<String, Object>> poResults = new LinkedHashMap<>();
        for (Map.Entry<String, List<CoPoMapping>> entry : poToCoMappings.entrySet()) {
            String poCode = entry.getKey();
            List<CoPoMapping> mapList = entry.getValue();

            double weightedSum = 0.0;
            int totalStrength = 0;

            for (CoPoMapping m : mapList) {
                if (m.getStrength() > 0) {
                    double coLevel = studentCoLevelMap.getOrDefault(m.getCoId(), 0.0);
                    weightedSum += coLevel * m.getStrength();
                    totalStrength += m.getStrength();
                }
            }

            double poLevel = totalStrength > 0 ? (weightedSum / totalStrength) : 0.0;

            Map<String, Object> poData = new HashMap<>();
            poData.put("poCode", poCode);
            poData.put("totalStrength", totalStrength);
            poData.put("poAttainmentLevel", Math.round(poLevel * 100.0) / 100.0);
            poResults.put(poCode, poData);
        }

        result.put("coAttainment", coResults);
        result.put("poAttainment", poResults);
        return result;
    }

    public Map<String, Object> calculateClassStatistics(int subjectId, int classId) throws SQLException {
        String sql = "SELECT st.id as student_id, st.roll_number, u.first_name, u.last_name, " +
                      "COALESCE(SUM(sm.marks_obtained), 0) as total_obtained, " +
                      "COALESCE(SUM(q.max_marks), 0) as total_max " +
                      "FROM students st " +
                      "JOIN users u ON st.user_id = u.id " +
                      "JOIN enrollments e ON e.student_id = st.id AND e.subject_id = ? AND e.class_id = ? " +
                      "LEFT JOIN assessments a ON a.subject_id = e.subject_id AND a.class_id = e.class_id " +
                      "LEFT JOIN assessment_questions q ON q.assessment_id = a.id " +
                      "LEFT JOIN student_marks sm ON sm.question_id = q.id AND sm.student_id = st.id " +
                      "GROUP BY st.id, st.roll_number, u.first_name, u.last_name";

        List<Map<String, Object>> studentSummary = new ArrayList<>();
        double totalSum = 0;
        double maxScore = -1;
        double minScore = 99999;
        int passCount = 0;
        int failCount = 0;
        int count = 0;

        Map<String, Integer> gradeDist = new LinkedHashMap<>();
        gradeDist.put("O (90-100%)", 0);
        gradeDist.put("A+ (80-89%)", 0);
        gradeDist.put("A (70-79%)", 0);
        gradeDist.put("B (60-69%)", 0);
        gradeDist.put("C (50-59%)", 0);
        gradeDist.put("F (<50%)", 0);

        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, subjectId);
            stmt.setInt(2, classId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    count++;
                    double obtained = rs.getDouble("total_obtained");
                    double totalMax = rs.getDouble("total_max");
                    double pct = totalMax > 0 ? (obtained * 100.0 / totalMax) : 0.0;

                    totalSum += pct;
                    if (pct > maxScore) maxScore = pct;
                    if (pct < minScore) minScore = pct;

                    String grade;
                    if (pct >= 90) { grade = "O (90-100%)"; passCount++; }
                    else if (pct >= 80) { grade = "A+ (80-89%)"; passCount++; }
                    else if (pct >= 70) { grade = "A (70-79%)"; passCount++; }
                    else if (pct >= 60) { grade = "B (60-69%)"; passCount++; }
                    else if (pct >= 50) { grade = "C (50-59%)"; passCount++; }
                    else { grade = "F (<50%)"; failCount++; }

                    gradeDist.put(grade, gradeDist.get(grade) + 1);

                    Map<String, Object> sMap = new HashMap<>();
                    sMap.put("studentId", rs.getInt("student_id"));
                    sMap.put("rollNumber", rs.getString("roll_number"));
                    sMap.put("name", rs.getString("first_name") + " " + rs.getString("last_name"));
                    sMap.put("totalObtained", obtained);
                    sMap.put("totalMax", totalMax);
                    sMap.put("percentage", Math.round(pct * 100.0) / 100.0);
                    sMap.put("grade", grade.split(" ")[0]);
                    studentSummary.add(sMap);
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalStudents", count);
        result.put("classAveragePct", count > 0 ? Math.round((totalSum / count) * 100.0) / 100.0 : 0.0);
        result.put("highestPct", maxScore >= 0 ? Math.round(maxScore * 100.0) / 100.0 : 0.0);
        result.put("lowestPct", minScore != 99999 ? Math.round(minScore * 100.0) / 100.0 : 0.0);
        result.put("passPct", count > 0 ? Math.round((passCount * 100.0 / count) * 100.0) / 100.0 : 0.0);
        result.put("gradeDistribution", gradeDist);
        result.put("studentSummary", studentSummary);

        return result;
    }
}
