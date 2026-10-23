package com.obe.servlet;

import com.obe.dao.SubjectDAO;
import com.obe.model.Subject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/subjects/*")
public class SubjectServlet extends BaseServlet {

    private final SubjectDAO subjectDAO = new SubjectDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String classParam = req.getParameter("classId");
            if (classParam == null || classParam.trim().isEmpty()) {
                classParam = req.getParameter("batchId");
            }
            String deptParam = req.getParameter("departmentId");
            List<Subject> list;

            if (deptParam != null && classParam != null) {
                list = subjectDAO.getSubjectsByDepartmentAndClass(Integer.parseInt(deptParam), Integer.parseInt(classParam));
            } else if (classParam != null) {
                list = subjectDAO.getSubjectsByClass(Integer.parseInt(classParam));
            } else {
                list = subjectDAO.getAllSubjects();
            }

            JSONArray array = new JSONArray();
            for (Subject s : list) {
                JSONObject obj = new JSONObject();
                obj.put("id", s.getId());
                obj.put("departmentId", s.getDepartmentId());
                obj.put("departmentCode", s.getDepartmentCode());
                obj.put("classId", s.getClassId());
                obj.put("className", s.getClassName());
                obj.put("batchId", s.getClassId());
                obj.put("batchName", s.getClassName());
                obj.put("code", s.getCode());
                obj.put("name", s.getName());
                obj.put("credits", s.getCredits());
                obj.put("semester", s.getSemester());
                obj.put("subjectType", s.getSubjectType());
                array.put(obj);
            }
            sendSuccess(resp, "Subjects fetched", array);
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN")) return;

        try {
            JSONObject body = readJsonRequest(req);
            int departmentId = body.optInt("departmentId", 0);
            int classId = body.optInt("classId", 0);
            if (classId <= 0) {
                classId = body.optInt("batchId", 0);
            }
            String code = body.optString("code", "").trim();
            String name = body.optString("name", "").trim();
            int credits = body.optInt("credits", 3);
            int semester = body.optInt("semester", 1);
            String subjectType = body.optString("subjectType", "THEORY").trim();

            if (departmentId <= 0 || classId <= 0 || code.isEmpty() || name.isEmpty()) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Department, Class, Code, and Name are required.");
                return;
            }

            Subject s = new Subject(0, departmentId, classId, code, name, credits, semester, subjectType);
            if (subjectDAO.create(s)) {
                sendSuccess(resp, "Subject created successfully", s.getId());
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to create subject");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN")) return;

        try {
            JSONObject body = readJsonRequest(req);
            int id = body.optInt("id", 0);
            int departmentId = body.optInt("departmentId", 0);
            int classId = body.optInt("classId", 0);
            if (classId <= 0) {
                classId = body.optInt("batchId", 0);
            }
            String code = body.optString("code", "").trim();
            String name = body.optString("name", "").trim();
            int credits = body.optInt("credits", 3);
            int semester = body.optInt("semester", 1);
            String subjectType = body.optString("subjectType", "THEORY").trim();

            if (id <= 0 || departmentId <= 0 || classId <= 0 || code.isEmpty() || name.isEmpty()) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid subject payload.");
                return;
            }

            Subject s = new Subject(id, departmentId, classId, code, name, credits, semester, subjectType);
            if (subjectDAO.update(s)) {
                sendSuccess(resp, "Subject updated successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update subject");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN")) return;

        try {
            String path = req.getPathInfo();
            if (path == null || path.length() <= 1) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Subject ID required");
                return;
            }
            int id = Integer.parseInt(path.substring(1));
            if (subjectDAO.delete(id)) {
                sendSuccess(resp, "Subject deleted successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to delete subject");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }
}
