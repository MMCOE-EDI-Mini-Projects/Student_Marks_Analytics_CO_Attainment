package com.obe.servlet;

import com.obe.dao.FacultyDAO;
import com.obe.dao.StudentDAO;
import com.obe.dao.UserDAO;
import com.obe.dao.AccessControlDAO;
import com.obe.model.Faculty;
import com.obe.model.Student;
import com.obe.model.User;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.sql.*;
import java.util.List;
import com.obe.util.DatabaseUtil;

@WebServlet("/api/users/*")
public class UserManagementServlet extends BaseServlet {

    private final FacultyDAO facultyDAO = new FacultyDAO();
    private final StudentDAO studentDAO = new StudentDAO();
    private final UserDAO userDAO = new UserDAO();
    private final AccessControlDAO accessControlDAO = new AccessControlDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User currentUser = getAuthenticatedUser(req);
        if (currentUser == null) {
            sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Login required");
            return;
        }
        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
            // Faculty may obtain a roster only for a class they teach. All other
            // user-management data remains administrator-only.
            if (!isAdmin && !(currentUser instanceof Faculty && "/students".equalsIgnoreCase(path))) {
                sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Administrator access required.");
                return;
            }
            if ("/faculty".equalsIgnoreCase(path)) {
                List<Faculty> list = facultyDAO.getAllFaculty();
                JSONArray array = new JSONArray();
                for (Faculty f : list) {
                    JSONObject obj = new JSONObject();
                    obj.put("facultyId", f.getFacultyId());
                    obj.put("userId", f.getId());
                    obj.put("username", f.getUsername());
                    obj.put("email", f.getEmail());
                    obj.put("fullName", f.getFullName());
                    obj.put("firstName", f.getFirstName());
                    obj.put("lastName", f.getLastName());
                    obj.put("departmentId", f.getDepartmentId());
                    obj.put("departmentCode", f.getDepartmentCode());
                    obj.put("departmentName", f.getDepartmentName());
                    obj.put("designation", f.getDesignation());
                    obj.put("phone", f.getPhone() != null ? f.getPhone() : "");
                    obj.put("active", f.isActive());
                    array.put(obj);
                }
                sendSuccess(resp, "Faculty fetched", array);
            } else if ("/students".equalsIgnoreCase(path)) {
                String classParam = req.getParameter("classId");
                if (classParam == null || classParam.trim().isEmpty()) {
                    classParam = req.getParameter("batchId");
                }
                if (!isAdmin) {
                    if (classParam == null || classParam.trim().isEmpty()) {
                        sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "classId is required for a faculty roster.");
                        return;
                    }
                    if (!accessControlDAO.facultyAssignedToClass(((Faculty) currentUser).getFacultyId(), Integer.parseInt(classParam))) {
                        sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this class.");
                        return;
                    }
                }
                List<Student> list;
                if (classParam != null && !classParam.trim().isEmpty()) {
                    list = studentDAO.getStudentsByClass(Integer.parseInt(classParam));
                } else {
                    list = studentDAO.getAllStudents();
                }

                JSONArray array = new JSONArray();
                for (Student s : list) {
                    JSONObject obj = new JSONObject();
                    obj.put("studentId", s.getStudentId());
                    obj.put("userId", s.getId());
                    obj.put("username", s.getUsername());
                    obj.put("email", s.getEmail());
                    obj.put("fullName", s.getFullName());
                    obj.put("firstName", s.getFirstName());
                    obj.put("lastName", s.getLastName());
                    obj.put("departmentId", s.getDepartmentId());
                    obj.put("departmentCode", s.getDepartmentCode());
                    obj.put("departmentName", s.getDepartmentName());
                    obj.put("classId", s.getClassId());
                    obj.put("className", s.getClassName());
                    obj.put("batchId", s.getClassId());
                    obj.put("batchName", s.getClassName());
                    obj.put("rollNumber", s.getRollNumber());
                    obj.put("registerNumber", s.getRegisterNumber());
                    obj.put("dateOfBirth", s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : "");
                    obj.put("phone", s.getPhone() != null ? s.getPhone() : "");
                    obj.put("active", s.isActive());
                    array.put(obj);
                }
                sendSuccess(resp, "Students fetched", array);
            } else if ("/list".equalsIgnoreCase(path)) {
                String search = req.getParameter("search");
                String role = req.getParameter("role");
                String activeStr = req.getParameter("active");
                Boolean active = (activeStr != null && !activeStr.isEmpty()) ? Boolean.valueOf(activeStr) : null;

                List<User> list = userDAO.getAllUsers(search, role, active);
                JSONArray array = new JSONArray();
                for (User u : list) {
                    JSONObject obj = new JSONObject();
                    obj.put("id", u.getId());
                    obj.put("username", u.getUsername());
                    obj.put("email", u.getEmail());
                    obj.put("role", u.getRole());
                    obj.put("roleName", u.getRoleName());
                    obj.put("fullName", u.getFullName());
                    obj.put("firstName", u.getFirstName());
                    obj.put("lastName", u.getLastName());
                    obj.put("active", u.isActive());
                    obj.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
                    array.put(obj);
                }
                sendSuccess(resp, "Users fetched", array);
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "User endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN")) return;

        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            JSONObject body = readJsonRequest(req);
            if ("/faculty".equalsIgnoreCase(path)) {
                String username = body.optString("username", "").trim();
                String password = body.optString("password", "").trim();
                String email = body.optString("email", "").trim();
                String firstName = body.optString("firstName", "").trim();
                String lastName = body.optString("lastName", "").trim();
                int departmentId = body.optInt("departmentId", 0);
                String designation = body.optString("designation", "Assistant Professor").trim();
                String phone = body.optString("phone", "").trim();

                if (username.isEmpty() || password.isEmpty() || email.isEmpty() || departmentId <= 0) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Username, password, email, and department are required.");
                    return;
                }

                Faculty f = new Faculty(0, username, "", email, firstName, lastName, 0, departmentId, designation, phone);
                if (facultyDAO.createFacultyUser(f, password)) {
                    sendSuccess(resp, "Faculty created successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to create faculty");
                }
            } else if ("/students".equalsIgnoreCase(path)) {
                String username = body.optString("username", "").trim();
                String password = body.optString("password", "").trim();
                String email = body.optString("email", "").trim();
                String firstName = body.optString("firstName", "").trim();
                String lastName = body.optString("lastName", "").trim();
                int departmentId = body.optInt("departmentId", 0);
                int classId = body.optInt("classId", 0);
                if (classId <= 0) {
                    classId = body.optInt("batchId", 0);
                }
                String rollNumber = body.optString("rollNumber", "").trim();
                String registerNumber = body.optString("registerNumber", "").trim();
                String dobStr = body.optString("dateOfBirth", null);
                Date dob = dobStr != null && !dobStr.isEmpty() ? Date.valueOf(dobStr) : null;
                String phone = body.optString("phone", "").trim();

                if (username.isEmpty() || password.isEmpty() || email.isEmpty() || departmentId <= 0 || classId <= 0 || rollNumber.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Required student fields missing.");
                    return;
                }

                Student s = new Student(0, username, "", email, firstName, lastName, 0, departmentId, classId, rollNumber, registerNumber, dob, phone);
                if (studentDAO.createStudentUser(s, password)) {
                    sendSuccess(resp, "Student created successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to create student");
                }
            } else if (path.endsWith("/toggle-status")) {
                int userId = body.optInt("userId", 0);
                if (userId <= 0 && path.indexOf("/toggle-status") > 1) {
                    try {
                        userId = Integer.parseInt(path.substring(1, path.indexOf("/toggle-status")));
                    } catch (Exception ignored) {}
                }
                if (userId <= 0) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Valid user ID is required.");
                    return;
                }
                User current = getAuthenticatedUser(req);
                if (current != null && current.getId() == userId) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Cannot deactivate your own administrator account.");
                    return;
                }
                if (userDAO.toggleActiveStatus(userId)) {
                    sendSuccess(resp, "User status updated", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to toggle status");
                }
            } else if (path.endsWith("/reset-password")) {
                int userId = body.optInt("userId", 0);
                if (userId <= 0 && path.indexOf("/reset-password") > 1) {
                    try {
                        userId = Integer.parseInt(path.substring(1, path.indexOf("/reset-password")));
                    } catch (Exception ignored) {}
                }
                String newPassword = body.optString("newPassword", "").trim();
                if (userId <= 0 || newPassword.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Valid user ID and new password are required.");
                    return;
                }
                if (userDAO.updatePassword(userId, newPassword)) {
                    sendSuccess(resp, "Password reset successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to reset password");
                }
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "User endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN")) return;

        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            JSONObject body = readJsonRequest(req);
            if (path.startsWith("/faculty")) {
                int facultyId = body.optInt("facultyId", 0);
                if (facultyId <= 0 && path.length() > "/faculty/".length()) {
                    try {
                        int idParam = Integer.parseInt(path.substring("/faculty/".length()));
                        try (Connection conn = DatabaseUtil.getConnection();
                             PreparedStatement stmt = conn.prepareStatement("SELECT id FROM faculty WHERE id = ? OR user_id = ?")) {
                            stmt.setInt(1, idParam);
                            stmt.setInt(2, idParam);
                            try (ResultSet rs = stmt.executeQuery()) {
                                if (rs.next()) facultyId = rs.getInt("id");
                            }
                        }
                    } catch (Exception ignored) {}
                }
                String email = body.optString("email", "").trim();
                String firstName = body.optString("firstName", "").trim();
                String lastName = body.optString("lastName", "").trim();
                int departmentId = body.optInt("departmentId", 0);
                String designation = body.optString("designation", "").trim();
                String phone = body.optString("phone", "").trim();

                if (facultyId <= 0 || email.isEmpty() || departmentId <= 0) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid faculty update data.");
                    return;
                }

                Faculty f = new Faculty(0, "", "", email, firstName, lastName, facultyId, departmentId, designation, phone);
                if (facultyDAO.updateFaculty(f)) {
                    sendSuccess(resp, "Faculty updated successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update faculty");
                }
            } else if (path.startsWith("/students")) {
                int studentId = body.optInt("studentId", 0);
                if (studentId <= 0 && path.length() > "/students/".length()) {
                    try {
                        int idParam = Integer.parseInt(path.substring("/students/".length()));
                        try (Connection conn = DatabaseUtil.getConnection();
                             PreparedStatement stmt = conn.prepareStatement("SELECT id FROM students WHERE id = ? OR user_id = ?")) {
                            stmt.setInt(1, idParam);
                            stmt.setInt(2, idParam);
                            try (ResultSet rs = stmt.executeQuery()) {
                                if (rs.next()) studentId = rs.getInt("id");
                            }
                        }
                    } catch (Exception ignored) {}
                }
                String email = body.optString("email", "").trim();
                String firstName = body.optString("firstName", "").trim();
                String lastName = body.optString("lastName", "").trim();
                int departmentId = body.optInt("departmentId", 0);
                int classId = body.optInt("classId", 0);
                if (classId <= 0) {
                    classId = body.optInt("batchId", 0);
                }
                String rollNumber = body.optString("rollNumber", "").trim();
                String registerNumber = body.optString("registerNumber", "").trim();
                String dobStr = body.optString("dateOfBirth", null);
                Date dob = (dobStr != null && !dobStr.isEmpty()) ? Date.valueOf(dobStr) : null;
                String phone = body.optString("phone", "").trim();

                if (studentId <= 0 || email.isEmpty() || departmentId <= 0 || classId <= 0) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid student update data.");
                    return;
                }

                Student s = new Student(0, "", "", email, firstName, lastName, studentId, departmentId, classId, rollNumber, registerNumber, dob, phone);
                if (studentDAO.updateStudent(s)) {
                    sendSuccess(resp, "Student updated successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update student");
                }
            } else if (path.startsWith("/") && path.length() > 1) {
                int userId = Integer.parseInt(path.substring(1));
                String username = body.optString("username", "").trim();
                String email = body.optString("email", "").trim();
                String firstName = body.optString("firstName", "").trim();
                String lastName = body.optString("lastName", "").trim();

                if (userId <= 0 || username.isEmpty() || email.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Username and email are required.");
                    return;
                }

                if (userDAO.updateUser(userId, username, email, firstName, lastName)) {
                    sendSuccess(resp, "User updated successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update user");
                }
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "User endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN")) return;

        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            if (path.startsWith("/faculty/")) {
                int idParam = Integer.parseInt(path.substring("/faculty/".length()));
                int facultyId = idParam;
                try (Connection conn = DatabaseUtil.getConnection();
                     PreparedStatement stmt = conn.prepareStatement("SELECT id FROM faculty WHERE id = ? OR user_id = ?")) {
                    stmt.setInt(1, idParam);
                    stmt.setInt(2, idParam);
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) facultyId = rs.getInt("id");
                    }
                }
                if (facultyDAO.deleteFaculty(facultyId)) {
                    sendSuccess(resp, "Faculty deleted successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to delete faculty");
                }
            } else if (path.startsWith("/students/")) {
                int idParam = Integer.parseInt(path.substring("/students/".length()));
                int studentId = idParam;
                try (Connection conn = DatabaseUtil.getConnection();
                     PreparedStatement stmt = conn.prepareStatement("SELECT id FROM students WHERE id = ? OR user_id = ?")) {
                    stmt.setInt(1, idParam);
                    stmt.setInt(2, idParam);
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) studentId = rs.getInt("id");
                    }
                }
                if (studentDAO.deleteStudent(studentId)) {
                    sendSuccess(resp, "Student deleted successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to delete student");
                }
            } else if (path.startsWith("/") && path.length() > 1) {
                int userId = Integer.parseInt(path.substring(1));
                User current = getAuthenticatedUser(req);
                if (current != null && current.getId() == userId) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Cannot delete your own administrator account.");
                    return;
                }
                if (userDAO.deleteUser(userId)) {
                    sendSuccess(resp, "User deleted successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to delete user");
                }
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "User endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }
}

