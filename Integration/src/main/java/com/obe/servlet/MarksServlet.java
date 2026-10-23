package com.obe.servlet;

import com.obe.dao.MarksDAO;
import com.obe.dao.AssessmentDAO;
import com.obe.dao.AccessControlDAO;
import com.obe.model.Assessment;
import com.obe.model.Faculty;
import com.obe.model.StudentMark;
import com.obe.model.User;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/marks/*")
public class MarksServlet extends BaseServlet {

    private final MarksDAO marksDAO = new MarksDAO();
    private final AssessmentDAO assessmentDAO = new AssessmentDAO();
    private final AccessControlDAO accessControlDAO = new AccessControlDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            User user = getAuthenticatedUser(req);
            if (user == null || !requireRole(req, resp, "FACULTY", "ADMIN")) return;
            String assessmentParam = req.getParameter("assessmentId");
            if (assessmentParam == null || assessmentParam.isEmpty()) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "assessmentId parameter required");
                return;
            }

            Assessment assessment = assessmentDAO.getById(Integer.parseInt(assessmentParam));
            if (assessment == null) {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Assessment not found");
                return;
            }
            if (!"ADMIN".equalsIgnoreCase(user.getRole()) &&
                    !accessControlDAO.facultyAssignedTo(((Faculty) user).getFacultyId(), assessment.getSubjectId(), assessment.getClassId())) {
                sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this assessment.");
                return;
            }
            List<StudentMark> list = marksDAO.getMarksByAssessment(assessment.getId());
            JSONArray array = new JSONArray();
            for (StudentMark sm : list) {
                JSONObject obj = new JSONObject();
                obj.put("id", sm.getId());
                obj.put("assessmentId", sm.getAssessmentId());
                obj.put("questionId", sm.getQuestionId());
                obj.put("questionNumber", sm.getQuestionNumber());
                obj.put("studentId", sm.getStudentId());
                obj.put("rollNumber", sm.getStudentRollNumber());
                obj.put("studentName", sm.getStudentName());
                obj.put("marksObtained", sm.getMarksObtained());
                obj.put("isAbsent", sm.isAbsent());
                array.put(obj);
            }
            sendSuccess(resp, "Marks fetched", array);
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (!requireRole(req, resp, "FACULTY", "ADMIN")) return;

        try {
            JSONObject body = readJsonRequest(req);
            int assessmentId = body.optInt("assessmentId", 0);
            JSONArray marksArray = body.optJSONArray("marks");

            if (assessmentId <= 0 || marksArray == null) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Assessment ID and marks array required.");
                return;
            }

            List<StudentMark> marksList = new ArrayList<>();
            for (int i = 0; i < marksArray.length(); i++) {
                JSONObject mObj = marksArray.getJSONObject(i);
                StudentMark sm = new StudentMark(
                        0,
                        assessmentId,
                        mObj.getInt("questionId"),
                        mObj.getInt("studentId"),
                        mObj.optDouble("marksObtained", 0.0),
                        mObj.optBoolean("isAbsent", false)
                );
                marksList.add(sm);
            }

            boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());
            Integer facultyId = user instanceof Faculty ? ((Faculty) user).getFacultyId() : null;

            if (marksDAO.validateAndSaveMarks(assessmentId, facultyId, isAdmin, marksList)) {
                sendSuccess(resp, "Marks recorded successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to record marks");
            }
        } catch (IllegalArgumentException | SecurityException e) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }
}
