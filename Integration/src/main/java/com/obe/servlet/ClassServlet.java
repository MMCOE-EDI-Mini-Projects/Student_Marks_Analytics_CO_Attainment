package com.obe.servlet;

import com.obe.dao.ClassDAO;
import com.obe.model.ClassModel;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/classes/*")
public class ClassServlet extends BaseServlet {

    protected final ClassDAO classDAO = new ClassDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String deptParam = req.getParameter("departmentId");
            List<ClassModel> list;
            if (deptParam != null && !deptParam.trim().isEmpty()) {
                list = classDAO.getClassesByDepartment(Integer.parseInt(deptParam));
            } else {
                list = classDAO.getAllClasses();
            }

            JSONArray array = new JSONArray();
            for (ClassModel c : list) {
                JSONObject obj = new JSONObject();
                obj.put("id", c.getId());
                obj.put("classId", c.getId());
                obj.put("departmentId", c.getDepartmentId());
                obj.put("departmentCode", c.getDepartmentCode());
                obj.put("departmentName", c.getDepartmentName());
                obj.put("name", c.getName());
                obj.put("className", c.getName());
                obj.put("academicYear", c.getAcademicYear());
                obj.put("semester", c.getSemester());
                obj.put("division", "");
                array.put(obj);
            }
            sendSuccess(resp, "Classes fetched", array);
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
            String name = body.optString("name", "").trim();
            if (name.isEmpty()) {
                name = body.optString("className", "").trim();
            }
            String academicYear = body.optString("academicYear", "").trim();
            int semester = body.optInt("semester", 1);

            if (departmentId <= 0 || name.isEmpty() || academicYear.isEmpty()) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Department, Class Name, and Academic Year are required.");
                return;
            }

            ClassModel c = new ClassModel(0, departmentId, name, academicYear, semester);
            if (classDAO.create(c)) {
                sendSuccess(resp, "Class created successfully", c.getId());
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to create class");
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
            if (id <= 0) {
                id = body.optInt("classId", 0);
            }
            int departmentId = body.optInt("departmentId", 0);
            String name = body.optString("name", "").trim();
            if (name.isEmpty()) {
                name = body.optString("className", "").trim();
            }
            String academicYear = body.optString("academicYear", "").trim();
            int semester = body.optInt("semester", 1);

            if (id <= 0 || departmentId <= 0 || name.isEmpty() || academicYear.isEmpty()) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid class payload.");
                return;
            }

            ClassModel c = new ClassModel(id, departmentId, name, academicYear, semester);
            if (classDAO.update(c)) {
                sendSuccess(resp, "Class updated successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update class");
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
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Class ID required");
                return;
            }
            int id = Integer.parseInt(path.substring(1));
            if (classDAO.delete(id)) {
                sendSuccess(resp, "Class deleted successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to delete class");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }
}
