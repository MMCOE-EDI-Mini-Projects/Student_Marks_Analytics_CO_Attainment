package com.obe.servlet;

import com.obe.dao.*;
import com.obe.model.*;
import com.obe.service.AttainmentEngine;
import com.obe.util.DatabaseUtil;
import com.obe.util.PasswordUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@WebServlet("/api/student/*")
public class StudentPortalServlet extends BaseServlet {

    private final StudentDAO studentDAO = new StudentDAO();
    private final SubjectDAO subjectDAO = new SubjectDAO();
    private final AssessmentDAO assessmentDAO = new AssessmentDAO();
    private final AssignmentSubmissionDAO submissionDAO = new AssignmentSubmissionDAO();
    private final QuizDAO quizDAO = new QuizDAO();
    private final GrievanceDAO grievanceDAO = new GrievanceDAO();
    private final StudentReportDAO reportDAO = new StudentReportDAO();
    private final AttainmentEngine attainmentEngine = new AttainmentEngine();
    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (user == null || !requireRole(req, resp, "STUDENT")) return;

        Student student = (Student) user;
        // Refresh student details from DB
        try {
            Student fresh = studentDAO.getById(student.getStudentId());
            if (fresh != null) {
                student = fresh;
            }
        } catch (Exception ignored) {}

        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            if ("/dashboard".equalsIgnoreCase(path)) {
                JSONObject dash = new JSONObject();

                // 1. Student basic info
                JSONObject prof = new JSONObject();
                prof.put("name", student.getFullName());
                prof.put("rollNumber", student.getRollNumber());
                prof.put("className", student.getClassName());
                prof.put("departmentName", student.getDepartmentName());
                dash.put("profile", prof);

                // 2. Counts
                List<Subject> mySubjects = subjectDAO.getSubjectsByClass(student.getClassId());
                dash.put("totalSubjects", mySubjects.size());

                List<Assessment> classAssessments = assessmentDAO.getPublishedAssessmentsByClass(student.getClassId());
                int upcomingAssessments = 0;
                int totalAssignments = 0;
                long now = System.currentTimeMillis();
                for (Assessment a : classAssessments) {
                    if (a.getAssessmentDate() != null && a.getAssessmentDate().getTime() >= now - 86400000L) {
                        upcomingAssessments++;
                    }
                    if ("ASSIGNMENT".equalsIgnoreCase(a.getType())) {
                        totalAssignments++;
                    }
                }
                dash.put("upcomingAssessments", upcomingAssessments);
                dash.put("totalAssignments", totalAssignments);

                List<Quiz> quizzes = quizDAO.getQuizzesByClass(student.getClassId(), student.getStudentId());
                int activeQuizzes = 0;
                for (Quiz q : quizzes) {
                    if (q.isPublished() && !q.isAttemptedByCurrentUser() && (q.getDeadline() == null || q.getDeadline().getTime() > now)) {
                        activeQuizzes++;
                    }
                }
                dash.put("activeQuizzes", activeQuizzes);

                List<Grievance> grievances = grievanceDAO.getGrievancesByStudent(student.getStudentId());
                int openGrievances = 0;
                for (Grievance g : grievances) {
                    if ("OPEN".equalsIgnoreCase(g.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(g.getStatus())) {
                        openGrievances++;
                    }
                }
                dash.put("openGrievances", openGrievances);

                // 3. Overall attendance summary
                String attSql = "SELECT COUNT(id) as total, SUM(CASE WHEN status='PRESENT' THEN 1 ELSE 0 END) as present " +
                                "FROM attendance WHERE student_id = ?";
                try (Connection conn = DatabaseUtil.getConnection();
                     PreparedStatement stmt = conn.prepareStatement(attSql)) {
                    stmt.setInt(1, student.getStudentId());
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            int total = rs.getInt("total");
                            int present = rs.getInt("present");
                            double pct = total > 0 ? (present * 100.0 / total) : 0.0;
                            dash.put("attendancePercentage", Math.round(pct * 100.0) / 100.0);
                            dash.put("totalAttendanceClasses", total);
                            dash.put("presentAttendanceClasses", present);
                        }
                    }
                }

                // 4. Recent marks
                JSONArray recentMarks = new JSONArray();
                String mSql = "SELECT s.code as s_code, a.title as a_title, q.question_number, q.max_marks, sm.marks_obtained, sm.is_absent, sm.recorded_at " +
                              "FROM student_marks sm " +
                              "JOIN assessment_questions q ON sm.question_id = q.id " +
                              "JOIN assessments a ON sm.assessment_id = a.id " +
                              "JOIN subjects s ON a.subject_id = s.id " +
                              "WHERE sm.student_id = ? ORDER BY sm.recorded_at DESC LIMIT 5";
                try (Connection conn = DatabaseUtil.getConnection();
                     PreparedStatement stmt = conn.prepareStatement(mSql)) {
                    stmt.setInt(1, student.getStudentId());
                    try (ResultSet rs = stmt.executeQuery()) {
                        while (rs.next()) {
                            JSONObject m = new JSONObject();
                            m.put("subjectCode", rs.getString("s_code"));
                            m.put("assessmentTitle", rs.getString("a_title"));
                            m.put("questionNumber", rs.getString("question_number"));
                            m.put("maxMarks", rs.getDouble("max_marks"));
                            m.put("marksObtained", rs.getDouble("marks_obtained"));
                            m.put("isAbsent", rs.getBoolean("is_absent"));
                            m.put("recordedAt", rs.getTimestamp("recorded_at").toString());
                            recentMarks.put(m);
                        }
                    }
                }
                dash.put("recentMarks", recentMarks);

                sendSuccess(resp, "Student dashboard", dash);
            } else if ("/profile".equalsIgnoreCase(path)) {
                JSONObject obj = new JSONObject();
                obj.put("studentId", student.getStudentId());
                obj.put("userId", student.getId());
                obj.put("username", student.getUsername());
                obj.put("fullName", student.getFullName());
                obj.put("firstName", student.getFirstName());
                obj.put("lastName", student.getLastName());
                obj.put("email", student.getEmail());
                obj.put("rollNumber", student.getRollNumber());
                obj.put("registerNumber", student.getRegisterNumber());
                obj.put("departmentName", student.getDepartmentName());
                obj.put("departmentCode", student.getDepartmentCode());
                obj.put("classId", student.getClassId());
                obj.put("className", student.getClassName());
                obj.put("dateOfBirth", student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : "");
                obj.put("phone", student.getPhone() != null ? student.getPhone() : "");
                sendSuccess(resp, "Student profile", obj);
            } else if ("/subjects".equalsIgnoreCase(path)) {
                List<Subject> list = subjectDAO.getSubjectsByClass(student.getClassId());
                JSONArray array = new JSONArray();
                for (Subject s : list) {
                    JSONObject obj = new JSONObject();
                    obj.put("id", s.getId());
                    obj.put("code", s.getCode());
                    obj.put("name", s.getName());
                    obj.put("credits", s.getCredits());
                    obj.put("semester", s.getSemester());
                    obj.put("subjectType", s.getSubjectType());
                    obj.put("className", s.getClassName());
                    array.put(obj);
                }
                sendSuccess(resp, "Student subjects", array);
            } else if ("/assessments".equalsIgnoreCase(path)) {
                List<Assessment> assessments = assessmentDAO.getPublishedAssessmentsByClass(student.getClassId());
                JSONArray array = new JSONArray();
                java.sql.Date today = new java.sql.Date(System.currentTimeMillis());
                for (Assessment a : assessments) {
                    JSONObject obj = new JSONObject();
                    obj.put("id", a.getId());
                    obj.put("title", a.getTitle());
                    obj.put("type", a.getType());
                    obj.put("subjectCode", a.getSubjectCode());
                    obj.put("subjectName", a.getSubjectName());
                    obj.put("facultyName", a.getFacultyName());
                    obj.put("totalMarks", a.getTotalMarks());
                    obj.put("assessmentDate", a.getAssessmentDate() != null ? a.getAssessmentDate().toString() : "");
                    obj.put("dueDate", a.getDueDate() != null ? a.getDueDate().toString() : "");
                    obj.put("instructions", a.getInstructions() != null ? a.getInstructions() : "");
                    boolean isLive = a.getDueDate() == null || !a.getDueDate().before(today);
                    obj.put("isLive", isLive);
                    if ("ASSIGNMENT".equalsIgnoreCase(a.getType())) {
                        AssignmentSubmission sub = submissionDAO.getSubmissionByAssessmentAndStudent(a.getId(), student.getStudentId());
                        obj.put("submitted", sub != null);
                        if (sub != null) {
                            obj.put("marksAwarded", sub.getMarksAwarded());
                            obj.put("feedback", sub.getFeedback() != null ? sub.getFeedback() : "");
                        }
                    } else {
                        obj.put("submitted", false);
                    }
                    array.put(obj);
                }
                sendSuccess(resp, "Published assessments fetched", array);
            } else if ("/assignments".equalsIgnoreCase(path)) {
                List<Assessment> assessments = assessmentDAO.getPublishedAssessmentsByClass(student.getClassId());
                JSONArray array = new JSONArray();
                for (Assessment a : assessments) {
                    if ("ASSIGNMENT".equalsIgnoreCase(a.getType())) {
                        JSONObject obj = new JSONObject();
                        obj.put("id", a.getId());
                        obj.put("title", a.getTitle());
                        obj.put("subjectCode", a.getSubjectCode());
                        obj.put("subjectName", a.getSubjectName());
                        obj.put("className", a.getClassName());
                        obj.put("facultyName", a.getFacultyName());
                        obj.put("totalMarks", a.getTotalMarks());
                        obj.put("dueDate", a.getDueDate() != null ? a.getDueDate().toString() : a.getAssessmentDate().toString());
                        obj.put("instructions", a.getInstructions() != null ? a.getInstructions() : "");

                        AssignmentSubmission sub = submissionDAO.getSubmissionByAssessmentAndStudent(a.getId(), student.getStudentId());
                        if (sub != null) {
                            obj.put("submitted", true);
                            obj.put("submissionText", sub.getSubmissionText());
                            obj.put("submissionFile", sub.getSubmissionFile());
                            obj.put("submittedAt", sub.getSubmittedAt() != null ? sub.getSubmittedAt().toString() : "");
                            obj.put("marksAwarded", sub.getMarksAwarded());
                            obj.put("feedback", sub.getFeedback() != null ? sub.getFeedback() : "");
                        } else {
                            obj.put("submitted", false);
                        }
                        array.put(obj);
                    }
                }
                sendSuccess(resp, "Assignments fetched", array);
            } else if ("/marks".equalsIgnoreCase(path) || "/marksheet".equalsIgnoreCase(path)) {
                String sql = "SELECT s.id as subject_id, s.code as s_code, s.name as s_name, a.id as a_id, a.title as a_title, a.type as a_type, " +
                             "q.question_number, q.max_marks, sm.marks_obtained, sm.is_absent " +
                             "FROM enrollments e " +
                             "JOIN subjects s ON e.subject_id = s.id " +
                             "JOIN assessments a ON a.subject_id = s.id AND a.class_id = e.class_id AND a.is_published = 1 " +
                             "JOIN assessment_questions q ON q.assessment_id = a.id " +
                             "LEFT JOIN student_marks sm ON sm.question_id = q.id AND sm.student_id = e.student_id " +
                             "WHERE e.student_id = ? ORDER BY s.code, a.id, q.question_number";
                JSONArray array = new JSONArray();
                try (Connection conn = DatabaseUtil.getConnection();
                     PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setInt(1, student.getStudentId());
                    try (ResultSet rs = stmt.executeQuery()) {
                        while (rs.next()) {
                            JSONObject item = new JSONObject();
                            item.put("subjectId", rs.getInt("subject_id"));
                            item.put("subjectCode", rs.getString("s_code"));
                            item.put("subjectName", rs.getString("s_name"));
                            item.put("assessmentId", rs.getInt("a_id"));
                            item.put("assessmentTitle", rs.getString("a_title"));
                            item.put("assessmentType", rs.getString("a_type"));
                            item.put("questionNumber", rs.getString("question_number"));
                            item.put("maxMarks", rs.getDouble("max_marks"));
                            item.put("marksObtained", rs.getObject("marks_obtained") != null ? rs.getDouble("marks_obtained") : 0.0);
                            item.put("isAbsent", rs.getBoolean("is_absent"));
                            array.put(item);
                        }
                    }
                }
                sendSuccess(resp, "Student marksheet", array);
            } else if ("/co-attainment".equalsIgnoreCase(path)) {
                String subParam = req.getParameter("subjectId");
                List<Subject> subs = subjectDAO.getSubjectsByClass(student.getClassId());
                int subjectId = (subParam != null && !subParam.isEmpty()) ? Integer.parseInt(subParam) : (subs.isEmpty() ? 0 : subs.get(0).getId());

                if (subjectId > 0) {
                    Map<String, Object> data = attainmentEngine.calculateStudentAttainment(student.getStudentId(), subjectId);
                    sendSuccess(resp, "CO Attainment fetched", new JSONObject(data));
                } else {
                    sendSuccess(resp, "No subjects found", new JSONObject());
                }
            } else if ("/po-attainment".equalsIgnoreCase(path)) {
                String subParam = req.getParameter("subjectId");
                List<Subject> subs = subjectDAO.getSubjectsByClass(student.getClassId());
                int subjectId = (subParam != null && !subParam.isEmpty()) ? Integer.parseInt(subParam) : (subs.isEmpty() ? 0 : subs.get(0).getId());

                if (subjectId > 0) {
                    Map<String, Object> data = attainmentEngine.calculateStudentAttainment(student.getStudentId(), subjectId);
                    JSONObject json = new JSONObject(data);
                    sendSuccess(resp, "PO Attainment fetched", json.optJSONObject("poAttainment"));
                } else {
                    sendSuccess(resp, "No subjects found", new JSONObject());
                }
            } else if ("/attendance".equalsIgnoreCase(path)) {
                String sql = "SELECT s.code as s_code, s.name as s_name, " +
                             "COUNT(att.id) as total_classes, " +
                             "SUM(CASE WHEN att.status = 'PRESENT' THEN 1 ELSE 0 END) as present_classes " +
                             "FROM enrollments e " +
                             "JOIN subjects s ON e.subject_id = s.id " +
                             "LEFT JOIN attendance att ON att.subject_id = s.id AND att.student_id = e.student_id " +
                             "WHERE e.student_id = ? GROUP BY s.id, s.code, s.name";
                JSONArray array = new JSONArray();
                try (Connection conn = DatabaseUtil.getConnection();
                     PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setInt(1, student.getStudentId());
                    try (ResultSet rs = stmt.executeQuery()) {
                        while (rs.next()) {
                            int total = rs.getInt("total_classes");
                            int present = rs.getInt("present_classes");
                            double pct = total > 0 ? (present * 100.0 / total) : 0.0;
                            JSONObject item = new JSONObject();
                            item.put("subjectCode", rs.getString("s_code"));
                            item.put("subjectName", rs.getString("s_name"));
                            item.put("totalClasses", total);
                            item.put("presentClasses", present);
                            item.put("attendancePct", Math.round(pct * 100.0) / 100.0);
                            array.put(item);
                        }
                    }
                }
                sendSuccess(resp, "Student attendance summary", array);
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Student portal endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (user == null || !requireRole(req, resp, "STUDENT")) return;

        Student student = (Student) user;
        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            if ("/profile".equalsIgnoreCase(path)) {
                JSONObject body = readJsonRequest(req);
                String phone = body.optString("phone", "").trim();
                String email = body.optString("email", student.getEmail()).trim();
                String dobStr = body.optString("dateOfBirth", null);
                Date dob = (dobStr != null && !dobStr.isEmpty()) ? Date.valueOf(dobStr) : null;

                if (email.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Email cannot be empty.");
                    return;
                }

                if (studentDAO.updateStudentProfile(student.getStudentId(), phone, dob, email)) {
                    student.setEmail(email);
                    student.setPhone(phone);
                    student.setDateOfBirth(dob);
                    sendSuccess(resp, "Profile updated successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update profile");
                }
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (user == null || !requireRole(req, resp, "STUDENT")) return;

        Student student = (Student) user;
        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            if (path.startsWith("/assignments/") && path.endsWith("/submit")) {
                int assessmentId = Integer.parseInt(path.substring("/assignments/".length(), path.indexOf("/submit")));
                JSONObject body = readJsonRequest(req);
                String text = body.optString("submissionText", "").trim();
                String file = body.optString("submissionFile", "").trim();

                if (text.isEmpty() && file.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Please provide answer text or file attachment link.");
                    return;
                }

                AssignmentSubmission sub = new AssignmentSubmission(0, assessmentId, student.getStudentId(), text, file);
                if (submissionDAO.submitAssignment(sub)) {
                    sendSuccess(resp, "Assignment submitted successfully!", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to submit assignment");
                }
            } else if ("/change-password".equalsIgnoreCase(path)) {
                JSONObject body = readJsonRequest(req);
                String oldPass = body.optString("oldPassword", "").trim();
                String newPass = body.optString("newPassword", "").trim();

                if (oldPass.isEmpty() || newPass.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Current password and new password are required.");
                    return;
                }

                // Verify old password
                User check = userDAO.authenticate(student.getUsername(), oldPass);
                if (check == null) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Incorrect current password.");
                    return;
                }

                if (userDAO.updatePassword(student.getId(), newPass)) {
                    sendSuccess(resp, "Password changed successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to change password");
                }
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }
}
