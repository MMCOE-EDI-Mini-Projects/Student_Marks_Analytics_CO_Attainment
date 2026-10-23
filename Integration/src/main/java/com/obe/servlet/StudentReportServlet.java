package com.obe.servlet;

import com.obe.dao.ClassDAO;
import com.obe.dao.AccessControlDAO;
import com.obe.dao.StudentDAO;
import com.obe.dao.StudentReportDAO;
import com.obe.dao.SubjectDAO;
import com.obe.model.*;
import com.obe.service.AttainmentEngine;
import com.obe.service.ReportService;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet("/api/student-reports/*")
public class StudentReportServlet extends BaseServlet {

    private final StudentReportDAO reportDAO = new StudentReportDAO();
    private final StudentDAO studentDAO = new StudentDAO();
    private final SubjectDAO subjectDAO = new SubjectDAO();
    private final ClassDAO classDAO = new ClassDAO();
    private final AttainmentEngine attainmentEngine = new AttainmentEngine();
    private final ReportService reportService = new ReportService();
    private final AccessControlDAO accessControlDAO = new AccessControlDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (user == null) {
            sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Login required");
            return;
        }

        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            if (path.endsWith("/pdf")) {
                int reportId = 0;
                String rIdParam = req.getParameter("reportId");
                if (rIdParam != null && !rIdParam.isEmpty()) {
                    try {
                        reportId = Integer.parseInt(rIdParam);
                    } catch (Exception ignored) {}
                } else if (path.indexOf("/pdf") > 1) {
                    try {
                        reportId = Integer.parseInt(path.substring(1, path.indexOf("/pdf")));
                    } catch (Exception ignored) {}
                }
                if (reportId <= 0) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Valid reportId parameter required");
                    return;
                }
                StudentReport report = reportDAO.getReportById(reportId);
                if (report == null) {
                    sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Report not found");
                    return;
                }

                // Check authorization
                if (user instanceof Student && ((Student) user).getStudentId() != report.getStudentId()) {
                    sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Access denied to other student's report");
                    return;
                }
                if (user instanceof Faculty && !accessControlDAO.facultyAssignedTo(((Faculty) user).getFacultyId(), report.getSubjectId(), report.getClassId())) {
                    sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this report's subject and class.");
                    return;
                }

                Map<String, Object> studentAttainment = attainmentEngine.calculateStudentAttainment(report.getStudentId(), report.getSubjectId());
                byte[] pdfBytes = reportService.generateStudentIndividualReportPdf(
                        report.getStudentName(),
                        report.getStudentRollNumber(),
                        report.getClassName(),
                        report.getSubjectCode() + " - " + report.getSubjectName(),
                        studentAttainment
                );

                resp.setContentType("application/pdf");
                resp.setHeader("Content-Disposition", "attachment; filename=\"Student_Report_" + report.getStudentRollNumber() + "_" + report.getSubjectCode() + ".pdf\"");
                resp.setContentLength(pdfBytes.length);
                resp.getOutputStream().write(pdfBytes);
                resp.getOutputStream().flush();
            } else if (path.isEmpty() || "/".equals(path)) {
                List<StudentReport> list;
                if ("STUDENT".equalsIgnoreCase(user.getRole())) {
                    Student s = (Student) user;
                    list = reportDAO.getReportsByStudent(s.getStudentId());
                } else {
                    String classParam = req.getParameter("classId");
                    if (classParam == null || classParam.trim().isEmpty()) {
                        classParam = req.getParameter("batchId");
                    }
                    String subjectParam = req.getParameter("subjectId");
                    if (classParam == null || subjectParam == null) {
                        sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "classId and subjectId parameters required");
                        return;
                    }
                    if (user instanceof Faculty && !accessControlDAO.facultyAssignedTo(((Faculty) user).getFacultyId(), Integer.parseInt(subjectParam), Integer.parseInt(classParam))) {
                        sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this subject and class.");
                        return;
                    }
                    list = reportDAO.getReportsByClassSubject(Integer.parseInt(classParam), Integer.parseInt(subjectParam));
                }

                JSONArray array = new JSONArray();
                for (StudentReport r : list) {
                    JSONObject obj = new JSONObject();
                    obj.put("id", r.getId());
                    obj.put("studentId", r.getStudentId());
                    obj.put("studentName", r.getStudentName());
                    obj.put("rollNumber", r.getStudentRollNumber());
                    obj.put("classId", r.getClassId());
                    obj.put("className", r.getClassName());
                    obj.put("subjectId", r.getSubjectId());
                    obj.put("subjectCode", r.getSubjectCode());
                    obj.put("subjectName", r.getSubjectName());
                    obj.put("facultyName", r.getFacultyName());
                    obj.put("title", r.getTitle());
                    obj.put("academicYear", r.getAcademicYear());
                    obj.put("reportSummary", r.getReportSummary() != null ? r.getReportSummary() : "");
                    obj.put("coAttainmentJson", r.getCoAttainmentJson() != null ? r.getCoAttainmentJson() : "{}");
                    obj.put("status", r.getStatus());
                    obj.put("publishedAt", r.getPublishedAt() != null ? r.getPublishedAt().toString() : "");
                    array.put(obj);
                }
                sendSuccess(resp, "Student reports fetched", array);
            } else {
                int reportId = Integer.parseInt(path.substring(1));
                StudentReport r = reportDAO.getReportById(reportId);
                if (r == null) {
                    sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Report not found");
                    return;
                }
                if (user instanceof Student && ((Student) user).getStudentId() != r.getStudentId()) {
                    sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Access denied");
                    return;
                }
                if (user instanceof Faculty && !accessControlDAO.facultyAssignedTo(((Faculty) user).getFacultyId(), r.getSubjectId(), r.getClassId())) {
                    sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this report's subject and class.");
                    return;
                }
                JSONObject obj = new JSONObject();
                obj.put("id", r.getId());
                obj.put("studentId", r.getStudentId());
                obj.put("studentName", r.getStudentName());
                obj.put("rollNumber", r.getStudentRollNumber());
                obj.put("classId", r.getClassId());
                obj.put("className", r.getClassName());
                obj.put("subjectId", r.getSubjectId());
                obj.put("subjectCode", r.getSubjectCode());
                obj.put("subjectName", r.getSubjectName());
                obj.put("facultyName", r.getFacultyName());
                obj.put("title", r.getTitle());
                obj.put("academicYear", r.getAcademicYear());
                obj.put("reportSummary", r.getReportSummary());
                obj.put("coAttainmentJson", r.getCoAttainmentJson());
                obj.put("publishedAt", r.getPublishedAt() != null ? r.getPublishedAt().toString() : "");
                sendSuccess(resp, "Report details", obj);
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (!requireRole(req, resp, "FACULTY", "ADMIN")) return;

        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            if ("/publish".equalsIgnoreCase(path)) {
                JSONObject body = readJsonRequest(req);
                int classId = body.optInt("classId", 0);
                if (classId <= 0) {
                    classId = body.optInt("batchId", 0);
                }
                int subjectId = body.optInt("subjectId", 0);
                int facultyId = user instanceof Faculty ? ((Faculty) user).getFacultyId() : body.optInt("facultyId", 1);
                String academicYear = body.optString("academicYear", "2025-2026").trim();
                String title = body.optString("title", "CO-PO Attainment Report Card").trim();

                if (classId <= 0 || subjectId <= 0) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "classId and subjectId are required.");
                    return;
                }
                if (user instanceof Faculty && !accessControlDAO.facultyAssignedTo(((Faculty) user).getFacultyId(), subjectId, classId)) {
                    sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this subject and class.");
                    return;
                }

                Subject subject = subjectDAO.getById(subjectId);
                ClassModel cModel = classDAO.getById(classId);
                List<Student> students = studentDAO.getStudentsByClass(classId);

                int publishedCount = 0;
                for (Student st : students) {
                    Map<String, Object> attainment = attainmentEngine.calculateStudentAttainment(st.getStudentId(), subjectId);
                    JSONObject coAttainmentJson = new JSONObject(attainment);

                    String summary = "Individual Attainment and Performance Report for " + st.getFullName() +
                                     " in " + (subject != null ? subject.getName() : "Subject") + " (" + (cModel != null ? cModel.getName() : "") + ").";

                    StudentReport sr = new StudentReport(
                            0,
                            st.getStudentId(),
                            classId,
                            subjectId,
                            facultyId,
                            title,
                            academicYear,
                            summary,
                            coAttainmentJson.toString(),
                            "{}",
                            "PUBLISHED"
                    );
                    if (reportDAO.publishReport(sr)) {
                        publishedCount++;
                    }
                }

                sendSuccess(resp, "Published individual reports for " + publishedCount + " students successfully.", publishedCount);
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }
}
