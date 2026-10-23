package com.obe.servlet;

import com.obe.dao.DepartmentDAO;
import com.obe.model.Department;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/departments/*")
public class DepartmentServlet extends BaseServlet {

    private final DepartmentDAO departmentDAO = new DepartmentDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            List<Department> list = departmentDAO.getAllDepartments();
            JSONArray array = new JSONArray();
            for (Department d : list) {
                JSONObject obj = new JSONObject();
                obj.put("id", d.getId());
                obj.put("code", d.getCode());
                obj.put("name", d.getName());
                obj.put("description", d.getDescription() != null ? d.getDescription() : "");
                array.put(obj);
            }
            sendSuccess(resp, "Departments fetched", array);
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN")) return;

        try {
            JSONObject body = readJsonRequest(req);
            String code = body.optString("code", "").trim();
            String name = body.optString("name", "").trim();
            String description = body.optString("description", "").trim();

            if (code.isEmpty() || name.isEmpty()) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Department code and name are required.");
                return;
            }

            Department d = new Department(0, code, name, description);
            if (departmentDAO.create(d)) {
                sendSuccess(resp, "Department created successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to create department");
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
            String code = body.optString("code", "").trim();
            String name = body.optString("name", "").trim();
            String description = body.optString("description", "").trim();

            if (id <= 0 || code.isEmpty() || name.isEmpty()) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid department payload.");
                return;
            }

            Department d = new Department(id, code, name, description);
            if (departmentDAO.update(d)) {
                sendSuccess(resp, "Department updated successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update department");
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
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Department ID required");
                return;
            }
            int id = Integer.parseInt(path.substring(1));
            if (departmentDAO.delete(id)) {
                sendSuccess(resp, "Department deleted successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to delete department");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }
}
