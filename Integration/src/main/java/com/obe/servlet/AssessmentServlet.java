package com.obe.servlet;

import com.obe.dao.AssessmentDAO;
import com.obe.dao.AccessControlDAO;
import com.obe.model.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/assessments/*")
public class AssessmentServlet extends BaseServlet {

    private final AssessmentDAO assessmentDAO = new AssessmentDAO();
    private final AccessControlDAO accessControlDAO = new AccessControlDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (user == null) {
            sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Login required");
            return;
        }

        try {
            String subjectParam = req.getParameter("subjectId");
            String classParam = req.getParameter("classId");
            if (classParam == null || classParam.trim().isEmpty()) {
                classParam = req.getParameter("batchId");
            }

            List<Assessment> list;
            if (subjectParam != null && classParam != null) {
                int subjectId = Integer.parseInt(subjectParam);
                int classId = Integer.parseInt(classParam);
                if (!canAccess(user, subjectId, classId)) {
                    sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not allowed to access this subject and class.");
                    return;
                }
                list = assessmentDAO.getAssessmentsBySubjectAndClass(
                        subjectId, classId
                );
            } else if (classParam != null) {
                int classId = Integer.parseInt(classParam);
                if (!(user instanceof Student) || !accessControlDAO.studentInClass(((Student) user).getStudentId(), classId)) {
                    sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Students may only view assessments for their own class.");
                    return;
                }
                list = assessmentDAO.getPublishedAssessmentsByClass(classId);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "classId required");
                return;
            }

            // Filter out unpublished assessments for students
            boolean isStudent = "STUDENT".equalsIgnoreCase(user.getRole());

            JSONArray array = new JSONArray();
            for (Assessment a : list) {
                if (isStudent && !a.isPublished()) {
                    continue;
                }
                JSONObject obj = new JSONObject();
                obj.put("id", a.getId());
                obj.put("subjectId", a.getSubjectId());
                obj.put("subjectCode", a.getSubjectCode());
                obj.put("subjectName", a.getSubjectName());
                obj.put("classId", a.getClassId());
                obj.put("className", a.getClassName());
                obj.put("batchId", a.getClassId());
                obj.put("batchName", a.getClassName());
                obj.put("facultyId", a.getFacultyId());
                obj.put("facultyName", a.getFacultyName());
                obj.put("title", a.getTitle());
                obj.put("type", a.getType());
                obj.put("category", a.getAssessmentCategory());
                obj.put("requiresBreakdown", a.requiresQuestionsBreakdown());
                obj.put("totalMarks", a.getTotalMarks());
                obj.put("weightage", a.getWeightage());
                obj.put("isPublished", a.isPublished());
                obj.put("assessmentDate", a.getAssessmentDate() != null ? a.getAssessmentDate().toString() : "");
                obj.put("instructions", a.getInstructions() != null ? a.getInstructions() : "");
                obj.put("dueDate", a.getDueDate() != null ? a.getDueDate().toString() : "");

                JSONArray qArray = new JSONArray();
                for (AssessmentQuestion q : a.getQuestions()) {
                    JSONObject qObj = new JSONObject();
                    qObj.put("id", q.getId());
                    qObj.put("questionNumber", q.getQuestionNumber());
                    qObj.put("questionText", q.getQuestionText());
                    qObj.put("maxMarks", q.getMaxMarks());
                    qObj.put("coId", q.getCoId());
                    qObj.put("coCode", q.getCoCode());
                    qArray.put(qObj);
                }
                obj.put("questions", qArray);
                array.put(obj);
            }
            sendSuccess(resp, "Assessments fetched", array);
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
            if (path.endsWith("/toggle-publish")) {
                int id = Integer.parseInt(path.substring(1, path.indexOf("/toggle-publish")));
                Assessment existing = assessmentDAO.getById(id);
                if (existing == null) {
                    sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Assessment not found");
                    return;
                }
                if (!canManage(user, existing.getSubjectId(), existing.getClassId())) {
                    sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this assessment.");
                    return;
                }
                if (assessmentDAO.togglePublishStatus(id)) {
                    sendSuccess(resp, "Assessment publication status updated", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update publication status");
                }
                return;
            }

            JSONObject body = readJsonRequest(req);
            int subjectId = body.optInt("subjectId", 0);
            int classId = body.optInt("classId", 0);
            if (classId <= 0) {
                classId = body.optInt("batchId", 0);
            }
            int facultyId = user instanceof Faculty ? ((Faculty) user).getFacultyId() : body.optInt("facultyId", 1);
            String title = body.optString("title", "").trim();
            String type = body.optString("type", "INTERNAL_TEST").trim();
            double totalMarks = body.optDouble("totalMarks", 50.0);
            double weightage = body.optDouble("weightage", 100.0);
            boolean isPublished = body.optBoolean("isPublished", true);
            String dateStr = body.optString("assessmentDate", new Date(System.currentTimeMillis()).toString());
            String instructions = body.optString("instructions", "").trim();
            String dueDateStr = body.optString("dueDate", dateStr);

            if (subjectId <= 0 || classId <= 0 || title.isEmpty()) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Subject, Class, and Title are required.");
                return;
            }
            if (!canManage(user, subjectId, classId)) {
                sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this subject and class.");
                return;
            }
            if (totalMarks <= 0 || weightage < 0 || weightage > 100) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Total marks must be positive and weightage must be between 0 and 100.");
                return;
            }

            Date date = Date.valueOf(dateStr);
            Date dueDate = Date.valueOf(dueDateStr);
            Assessment assessment;
            switch (type.toUpperCase()) {
                case "UNIT_TEST":
                    assessment = new UnitTestAssessment(0, subjectId, classId, facultyId, title, totalMarks, weightage, date);
                    break;
                case "ASSIGNMENT":
                    assessment = new AssignmentAssessment(0, subjectId, classId, facultyId, title, totalMarks, weightage, date);
                    break;
                case "PRACTICAL":
                    assessment = new PracticalAssessment(0, subjectId, classId, facultyId, title, totalMarks, weightage, date);
                    break;
                default:
                    assessment = new InternalTestAssessment(0, subjectId, classId, facultyId, title, totalMarks, weightage, date);
                    break;
            }
            assessment.setPublished(isPublished);
            assessment.setInstructions(instructions);
            assessment.setDueDate(dueDate);

            JSONArray questionsArray = body.optJSONArray("questions");
            List<AssessmentQuestion> questions = new ArrayList<>();
            if (questionsArray != null) {
                for (int i = 0; i < questionsArray.length(); i++) {
                    JSONObject qObj = questionsArray.getJSONObject(i);
                    AssessmentQuestion q = new AssessmentQuestion(
                            0,
                            0,
                            qObj.optString("questionNumber", "Q" + (i + 1)).trim(),
                            qObj.optString("questionText", "").trim(),
                            qObj.optDouble("maxMarks", 10.0),
                            qObj.optInt("coId", 0)
                    );
                    questions.add(q);
                }
            }
            if (questions.isEmpty()) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "At least one question mapped to a course outcome is required.");
                return;
            }
            double questionTotal = 0;
            for (AssessmentQuestion q : questions) {
                if (q.getQuestionText().isEmpty() || q.getCoId() <= 0 || q.getMaxMarks() <= 0) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Every question needs text, positive marks, and a course outcome.");
                    return;
                }
                if (!accessControlDAO.courseOutcomeBelongsToSubject(q.getCoId(), subjectId)) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Each question's course outcome must belong to the selected subject.");
                    return;
                }
                questionTotal += q.getMaxMarks();
            }
            if (Math.abs(questionTotal - totalMarks) > 0.01) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Question marks must equal the assessment total marks.");
                return;
            }

            if (assessmentDAO.createAssessmentWithQuestions(assessment, questions)) {
                sendSuccess(resp, "Assessment created successfully", assessment.getId());
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to create assessment");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "FACULTY", "ADMIN")) return;

        try {
            JSONObject body = readJsonRequest(req);
            int id = body.optInt("id", 0);
            String title = body.optString("title", "").trim();
            double totalMarks = body.optDouble("totalMarks", 50.0);
            double weightage = body.optDouble("weightage", 100.0);
            String dateStr = body.optString("assessmentDate", new Date(System.currentTimeMillis()).toString());
            boolean isPublished = body.optBoolean("isPublished", true);
            String instructions = body.optString("instructions", "").trim();
            String dueDateStr = body.optString("dueDate", dateStr);

            if (id <= 0 || title.isEmpty()) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Assessment ID and title are required.");
                return;
            }

            Assessment existing = assessmentDAO.getById(id);
            if (existing == null) {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Assessment not found");
                return;
            }
            if (!canManage(getAuthenticatedUser(req), existing.getSubjectId(), existing.getClassId())) {
                sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this assessment.");
                return;
            }

            existing.setTitle(title);
            existing.setTotalMarks(totalMarks);
            existing.setWeightage(weightage);
            existing.setAssessmentDate(Date.valueOf(dateStr));
            existing.setPublished(isPublished);
            existing.setInstructions(instructions);
            existing.setDueDate(Date.valueOf(dueDateStr));

            if (assessmentDAO.updateAssessment(existing)) {
                sendSuccess(resp, "Assessment updated successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update assessment");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "FACULTY", "ADMIN")) return;

        try {
            String path = req.getPathInfo();
            if (path == null || path.length() <= 1) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Assessment ID required");
                return;
            }
            int id = Integer.parseInt(path.substring(1));
            Assessment existing = assessmentDAO.getById(id);
            if (existing == null) {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Assessment not found");
                return;
            }
            if (!canManage(getAuthenticatedUser(req), existing.getSubjectId(), existing.getClassId())) {
                sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this assessment.");
                return;
            }
            if (assessmentDAO.deleteAssessment(id)) {
                sendSuccess(resp, "Assessment deleted successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to delete assessment");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    private boolean canAccess(User user, int subjectId, int classId) throws Exception {
        if ("ADMIN".equalsIgnoreCase(user.getRole())) return true;
        if (user instanceof Faculty) return accessControlDAO.facultyAssignedTo(((Faculty) user).getFacultyId(), subjectId, classId);
        return user instanceof Student && accessControlDAO.studentEnrolledIn(((Student) user).getStudentId(), subjectId, classId);
    }

    private boolean canManage(User user, int subjectId, int classId) throws Exception {
        return "ADMIN".equalsIgnoreCase(user.getRole()) ||
                (user instanceof Faculty && accessControlDAO.facultyAssignedTo(((Faculty) user).getFacultyId(), subjectId, classId));
    }
}
