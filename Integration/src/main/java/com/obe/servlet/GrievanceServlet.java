package com.obe.servlet;

import com.obe.dao.GrievanceDAO;
import com.obe.model.Faculty;
import com.obe.model.Grievance;
import com.obe.model.Student;
import com.obe.model.User;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/grievances/*")
public class GrievanceServlet extends BaseServlet {

    private final GrievanceDAO grievanceDAO = new GrievanceDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (user == null) {
            sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Login required");
            return;
        }

        try {
            List<Grievance> list;
            if ("STUDENT".equalsIgnoreCase(user.getRole())) {
                Student s = (Student) user;
                list = grievanceDAO.getGrievancesByStudent(s.getStudentId());
            } else if ("FACULTY".equalsIgnoreCase(user.getRole())) {
                Faculty f = (Faculty) user;
                list = grievanceDAO.getGrievancesByFaculty(f.getFacultyId());
            } else {
                list = grievanceDAO.getAllGrievances();
            }

            JSONArray array = new JSONArray();
            for (Grievance g : list) {
                JSONObject obj = new JSONObject();
                obj.put("id", g.getId());
                obj.put("studentId", g.getStudentId());
                obj.put("studentName", g.getStudentName());
                obj.put("rollNumber", g.getStudentRollNumber());
                obj.put("classId", g.getClassId());
                obj.put("className", g.getClassName());
                obj.put("subjectId", g.getSubjectId());
                obj.put("subjectCode", g.getSubjectCode() != null ? g.getSubjectCode() : "-");
                obj.put("subjectName", g.getSubjectName() != null ? g.getSubjectName() : "-");
                obj.put("category", g.getCategory());
                obj.put("title", g.getTitle());
                obj.put("description", g.getDescription());
                obj.put("status", g.getStatus());
                obj.put("facultyResponse", g.getFacultyResponse() != null ? g.getFacultyResponse() : "");
                obj.put("resolvedByFacultyName", g.getResolvedByFacultyName() != null ? g.getResolvedByFacultyName() : "");
                obj.put("createdAt", g.getCreatedAt() != null ? g.getCreatedAt().toString() : "");
                obj.put("updatedAt", g.getUpdatedAt() != null ? g.getUpdatedAt().toString() : "");
                array.put(obj);
            }
            sendSuccess(resp, "Grievances fetched", array);
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (user == null) {
            sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Login required");
            return;
        }

        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            if (path.endsWith("/respond")) {
                if (!requireRole(req, resp, "FACULTY", "ADMIN")) return;
                int id = Integer.parseInt(path.substring(1, path.indexOf("/respond")));
                JSONObject body = readJsonRequest(req);
                String response = body.optString("response", "").trim();
                String status = body.optString("status", "RESOLVED").trim();
                int facultyId = user instanceof Faculty ? ((Faculty) user).getFacultyId() : 1;

                if (response.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Response message is required.");
                    return;
                }

                if (grievanceDAO.respond(id, facultyId, response, status)) {
                    sendSuccess(resp, "Grievance responded successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to respond to grievance");
                }
            } else {
                if (!requireRole(req, resp, "STUDENT")) return;
                Student s = (Student) user;
                JSONObject body = readJsonRequest(req);

                String category = body.optString("category", "ACADEMIC_OTHER").trim();
                String title = body.optString("title", "").trim();
                String description = body.optString("description", "").trim();
                int subjectId = body.optInt("subjectId", 0);
                int classId = body.optInt("classId", s.getClassId());

                if (title.isEmpty() || description.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Title and description are required.");
                    return;
                }

                Grievance g = new Grievance(0, s.getStudentId(), classId, subjectId > 0 ? subjectId : null, category, title, description, "OPEN");
                if (grievanceDAO.createGrievance(g)) {
                    sendSuccess(resp, "Grievance submitted successfully", g.getId());
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to submit grievance");
                }
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }
}
