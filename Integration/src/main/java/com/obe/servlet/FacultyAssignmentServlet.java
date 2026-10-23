package com.obe.servlet;

import com.obe.dao.FacultyDAO;
import com.obe.model.FacultyAssignment;
import com.obe.model.User;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/faculty-assignments/*")
public class FacultyAssignmentServlet extends BaseServlet {

    private final FacultyDAO facultyDAO = new FacultyDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (user == null) {
            sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Login required");
            return;
        }

        try {
            List<FacultyAssignment> list;
            if ("FACULTY".equalsIgnoreCase(user.getRole())) {
                com.obe.model.Faculty faculty = (com.obe.model.Faculty) user;
                list = facultyDAO.getAssignmentsByFaculty(faculty.getFacultyId());
            } else {
                String facultyParam = req.getParameter("facultyId");
                if (facultyParam != null && !facultyParam.isEmpty()) {
                    list = facultyDAO.getAssignmentsByFaculty(Integer.parseInt(facultyParam));
                } else {
                    list = facultyDAO.getAllAssignments();
                }
            }

            JSONArray array = new JSONArray();
            for (FacultyAssignment fa : list) {
                JSONObject obj = new JSONObject();
                obj.put("id", fa.getId());
                obj.put("facultyId", fa.getFacultyId());
                obj.put("facultyName", fa.getFacultyName());
                obj.put("subjectId", fa.getSubjectId());
                obj.put("subjectCode", fa.getSubjectCode());
                obj.put("subjectName", fa.getSubjectName());
                obj.put("classId", fa.getClassId());
                obj.put("className", fa.getClassName());
                obj.put("batchId", fa.getClassId());
                obj.put("batchName", fa.getClassName());
                obj.put("academicYear", fa.getAcademicYear());
                array.put(obj);
            }
            sendSuccess(resp, "Assignments fetched", array);
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN")) return;

        try {
            JSONObject body = readJsonRequest(req);
            int facultyId = body.optInt("facultyId", 0);
            int subjectId = body.optInt("subjectId", 0);
            int classId = body.optInt("classId", 0);
            if (classId <= 0) {
                classId = body.optInt("batchId", 0);
            }
            String academicYear = body.optString("academicYear", "").trim();

            if (facultyId <= 0 || subjectId <= 0 || classId <= 0 || academicYear.isEmpty()) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Faculty, Subject, Class, and Academic Year are required.");
                return;
            }

            FacultyAssignment fa = new FacultyAssignment(0, facultyId, subjectId, classId, academicYear);
            if (facultyDAO.createAssignment(fa)) {
                sendSuccess(resp, "Faculty assigned successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to assign faculty");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN")) return;

        try {
            JSONObject body = readJsonRequest(req);
            int id = body.optInt("id", 0);
            int facultyId = body.optInt("facultyId", 0);
            int subjectId = body.optInt("subjectId", 0);
            int classId = body.optInt("classId", 0);
            if (classId <= 0) {
                classId = body.optInt("batchId", 0);
            }
            String academicYear = body.optString("academicYear", "").trim();

            if (id <= 0 || facultyId <= 0 || subjectId <= 0 || classId <= 0 || academicYear.isEmpty()) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid assignment payload for reassignment.");
                return;
            }

            FacultyAssignment fa = new FacultyAssignment(id, facultyId, subjectId, classId, academicYear);
            if (facultyDAO.updateAssignment(fa)) {
                sendSuccess(resp, "Assignment reassigned successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to reassign faculty");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN")) return;

        try {
            String path = req.getPathInfo();
            if (path == null || path.length() <= 1) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Assignment ID required");
                return;
            }
            int id = Integer.parseInt(path.substring(1));
            if (facultyDAO.deleteAssignment(id)) {
                sendSuccess(resp, "Assignment removed successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to delete assignment");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }
}
