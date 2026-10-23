package com.obe.servlet;

import com.obe.dao.ClassDAO;
import com.obe.dao.AccessControlDAO;
import com.obe.dao.SubjectDAO;
import com.obe.model.ClassModel;
import com.obe.model.Subject;
import com.obe.model.User;
import com.obe.model.Faculty;
import com.obe.service.AttainmentEngine;
import com.obe.service.ReportService;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/reports/*")
public class ReportServlet extends BaseServlet {

    private final AttainmentEngine attainmentEngine = new AttainmentEngine();
    private final ReportService reportService = new ReportService();
    private final SubjectDAO subjectDAO = new SubjectDAO();
    private final ClassDAO classDAO = new ClassDAO();
    private final AccessControlDAO accessControlDAO = new AccessControlDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (user == null || !requireRole(req, resp, "FACULTY", "ADMIN")) return;
        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            String subjectParam = req.getParameter("subjectId");
            String classParam = req.getParameter("classId");
            if (classParam == null || classParam.trim().isEmpty()) {
                classParam = req.getParameter("batchId");
            }

            if (subjectParam == null || classParam == null) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "subjectId and classId required");
                return;
            }

            int subjectId = Integer.parseInt(subjectParam);
            int classId = Integer.parseInt(classParam);
            if (!"ADMIN".equalsIgnoreCase(user.getRole()) &&
                    !accessControlDAO.facultyAssignedTo(((Faculty) user).getFacultyId(), subjectId, classId)) {
                sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this subject and class.");
                return;
            }

            Subject subject = subjectDAO.getById(subjectId);
            ClassModel cModel = classDAO.getById(classId);

            String subjectName = subject != null ? subject.getCode() + " - " + subject.getName() : "Subject " + subjectId;
            String className = cModel != null ? cModel.getName() + " (Sem " + cModel.getSemester() + ")" : "Class " + classId;

            Map<String, Object> attainmentData = attainmentEngine.calculateSubjectAttainment(subjectId, classId);

            if ("/pdf".equalsIgnoreCase(path)) {
                byte[] pdfBytes = reportService.generateAttainmentPdfReport(subjectName, className, attainmentData);
                resp.setContentType("application/pdf");
                resp.setHeader("Content-Disposition", "attachment; filename=\"OBE_Report_" + subjectId + "_" + classId + ".pdf\"");
                resp.setContentLength(pdfBytes.length);
                resp.getOutputStream().write(pdfBytes);
                resp.getOutputStream().flush();
            } else if ("/excel".equalsIgnoreCase(path)) {
                byte[] excelBytes = reportService.generateAttainmentExcelReport(subjectName, className, attainmentData);
                resp.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                resp.setHeader("Content-Disposition", "attachment; filename=\"OBE_Report_" + subjectId + "_" + classId + ".xlsx\"");
                resp.setContentLength(excelBytes.length);
                resp.getOutputStream().write(excelBytes);
                resp.getOutputStream().flush();
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Report format endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error generating report: " + e.getMessage());
        }
    }
}
