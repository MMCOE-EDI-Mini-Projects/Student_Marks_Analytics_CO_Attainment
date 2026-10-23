package com.obe.servlet;

import com.obe.dao.QuizDAO;
import com.obe.dao.AccessControlDAO;
import com.obe.model.Faculty;
import com.obe.model.Quiz;
import com.obe.model.QuizQuestion;
import com.obe.model.QuizSubmission;
import com.obe.model.Student;
import com.obe.model.User;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/quizzes/*")
public class QuizServlet extends BaseServlet {

    private final QuizDAO quizDAO = new QuizDAO();
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
            if (path.isEmpty() || "/".equals(path)) {
                String classParam = req.getParameter("classId");
                if (classParam == null || classParam.trim().isEmpty()) {
                    classParam = req.getParameter("batchId");
                }
                String subjectParam = req.getParameter("subjectId");

                List<Quiz> list;
                if (subjectParam != null && classParam != null) {
                    int subjectId = Integer.parseInt(subjectParam);
                    int classId = Integer.parseInt(classParam);
                    if (!canAccess(user, subjectId, classId)) {
                        sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not allowed to access this subject and class.");
                        return;
                    }
                    list = quizDAO.getQuizzesBySubjectAndClass(subjectId, classId);
                } else if (classParam != null) {
                    if (!(user instanceof Student) || !accessControlDAO.studentInClass(((Student) user).getStudentId(), Integer.parseInt(classParam))) {
                        sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Students may only view quizzes for their own class.");
                        return;
                    }
                    Integer studentId = user instanceof Student ? ((Student) user).getStudentId() : null;
                    list = quizDAO.getQuizzesByClass(Integer.parseInt(classParam), studentId);
                } else if (user instanceof Student) {
                    Student stu = (Student) user;
                    list = quizDAO.getQuizzesByClass(stu.getClassId(), stu.getStudentId());
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "classId required");
                    return;
                }

                boolean isStudent = "STUDENT".equalsIgnoreCase(user.getRole());
                JSONArray array = new JSONArray();
                for (Quiz q : list) {
                    if (isStudent && !q.isPublished()) {
                        continue; // Hidden from students until published
                    }
                    JSONObject obj = new JSONObject();
                    obj.put("id", q.getId());
                    obj.put("subjectId", q.getSubjectId());
                    obj.put("subjectCode", q.getSubjectCode());
                    obj.put("subjectName", q.getSubjectName());
                    obj.put("classId", q.getClassId());
                    obj.put("className", q.getClassName());
                    obj.put("facultyId", q.getFacultyId());
                    obj.put("facultyName", q.getFacultyName());
                    obj.put("title", q.getTitle());
                    obj.put("description", q.getDescription() != null ? q.getDescription() : "");
                    obj.put("totalMarks", q.getTotalMarks());
                    obj.put("durationMinutes", q.getDurationMinutes());
                    obj.put("timeLimitMinutes", q.getDurationMinutes());
                    obj.put("deadline", q.getDeadline() != null ? q.getDeadline().toString() : "");
                    obj.put("dueDate", q.getDeadline() != null ? q.getDeadline().toString() : "");
                    obj.put("isPublished", q.isPublished());
                    obj.put("attempted", q.isAttemptedByCurrentUser());
                    obj.put("isAttemptedByCurrentUser", q.isAttemptedByCurrentUser());
                    obj.put("userScore", q.getUserScore());
                    array.put(obj);
                }
                sendSuccess(resp, "Quizzes fetched", array);
            } else if (path.endsWith("/submissions")) {
                if (!requireRole(req, resp, "FACULTY", "ADMIN")) return;
                int quizId = 0;
                String qIdParam = req.getParameter("quizId");
                if (qIdParam != null && !qIdParam.isEmpty()) {
                    quizId = Integer.parseInt(qIdParam);
                } else if (path.indexOf("/submissions") > 1) {
                    try {
                        quizId = Integer.parseInt(path.substring(1, path.indexOf("/submissions")));
                    } catch (Exception ignored) {}
                }
                if (quizId <= 0) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "quizId parameter required");
                    return;
                }
                List<QuizSubmission> subs = quizDAO.getSubmissionsByQuiz(quizId);
                JSONArray array = new JSONArray();
                for (QuizSubmission s : subs) {
                    JSONObject obj = new JSONObject();
                    obj.put("id", s.getId());
                    obj.put("quizId", s.getQuizId());
                    obj.put("studentId", s.getStudentId());
                    obj.put("rollNumber", s.getStudentRollNumber());
                    obj.put("studentName", s.getStudentName());
                    obj.put("score", s.getScore());
                    obj.put("totalScore", s.getTotalScore());
                    obj.put("totalMarks", s.getTotalScore());
                    obj.put("submittedAt", s.getSubmittedAt() != null ? s.getSubmittedAt().toString() : "");
                    array.put(obj);
                }
                sendSuccess(resp, "Submissions fetched", array);
            } else if (path.startsWith("/") && path.length() > 1) {
                // Get single quiz with questions
                int quizId = Integer.parseInt(path.substring(1));
                Quiz q = quizDAO.getQuizById(quizId);
                if (q == null) {
                    sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Quiz not found");
                    return;
                }
                if (!canAccess(user, q.getSubjectId(), q.getClassId())) {
                    sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not allowed to access this quiz.");
                    return;
                }

                boolean isStudent = "STUDENT".equalsIgnoreCase(user.getRole());
                boolean hasAttempted = false;
                QuizSubmission prevSub = null;
                if (isStudent) {
                    prevSub = quizDAO.getSubmission(quizId, ((Student) user).getStudentId());
                    hasAttempted = (prevSub != null);
                }

                JSONObject obj = new JSONObject();
                obj.put("id", q.getId());
                obj.put("subjectId", q.getSubjectId());
                obj.put("subjectCode", q.getSubjectCode());
                obj.put("subjectName", q.getSubjectName());
                obj.put("classId", q.getClassId());
                obj.put("className", q.getClassName());
                obj.put("title", q.getTitle());
                obj.put("description", q.getDescription() != null ? q.getDescription() : "");
                obj.put("totalMarks", q.getTotalMarks());
                obj.put("durationMinutes", q.getDurationMinutes());
                obj.put("deadline", q.getDeadline() != null ? q.getDeadline().toString() : "");
                obj.put("isPublished", q.isPublished());
                obj.put("attempted", hasAttempted);
                if (prevSub != null) {
                    obj.put("userScore", prevSub.getScore());
                    obj.put("submittedAt", prevSub.getSubmittedAt().toString());
                    obj.put("answersJson", prevSub.getAnswersJson() != null ? prevSub.getAnswersJson() : "[]");
                }

                JSONArray qArray = new JSONArray();
                for (QuizQuestion qq : q.getQuestions()) {
                    JSONObject qqObj = new JSONObject();
                    qqObj.put("id", qq.getId());
                    qqObj.put("questionText", qq.getQuestionText());
                    qqObj.put("optionA", qq.getOptionA());
                    qqObj.put("optionB", qq.getOptionB());
                    qqObj.put("optionC", qq.getOptionC() != null ? qq.getOptionC() : "");
                    qqObj.put("optionD", qq.getOptionD() != null ? qq.getOptionD() : "");
                    qqObj.put("marks", qq.getMarks());
                    // Only show correct option to faculty/admin or to student after submission
                    if (!isStudent || hasAttempted) {
                        qqObj.put("correctOption", qq.getCorrectOption());
                    }
                    qArray.put(qqObj);
                }
                obj.put("questions", qArray);
                sendSuccess(resp, "Quiz details", obj);
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Quiz endpoint not found");
            }
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
            if (path.endsWith("/submit")) {
                if (!requireRole(req, resp, "STUDENT")) return;
                JSONObject body = readJsonRequest(req);
                int quizId = body.optInt("quizId", 0);
                if (quizId <= 0 && path.indexOf("/submit") > 1) {
                    try {
                        quizId = Integer.parseInt(path.substring(1, path.indexOf("/submit")));
                    } catch (Exception ignored) {}
                }
                if (quizId <= 0) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Valid quiz ID required.");
                    return;
                }
                Student student = (Student) user;

                Quiz quiz = quizDAO.getQuizById(quizId);
                if (quiz == null) {
                    sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Quiz not found");
                    return;
                }

                if (!quiz.isPublished()) {
                    sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Quiz is not published yet.");
                    return;
                }
                if (!accessControlDAO.studentEnrolledIn(student.getStudentId(), quiz.getSubjectId(), quiz.getClassId())) {
                    sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not enrolled in this quiz's subject and class.");
                    return;
                }

                if (quiz.getDeadline() != null && quiz.getDeadline().before(new Timestamp(System.currentTimeMillis()))) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "The deadline for this quiz has expired.");
                    return;
                }

                JSONArray answers = body.optJSONArray("answers");
                if (answers == null) answers = new JSONArray();

                double totalScore = 0.0;
                double earnedScore = 0.0;
                List<QuizQuestion> questions = quiz.getQuestions();

                java.util.Map<Integer, String> studentAnswers = new java.util.HashMap<>();
                for (int i = 0; i < answers.length(); i++) {
                    JSONObject ans = answers.getJSONObject(i);
                    studentAnswers.put(ans.getInt("questionId"), ans.optString("selectedOption", "").trim().toUpperCase());
                }

                for (QuizQuestion qq : questions) {
                    totalScore += qq.getMarks();
                    String selected = studentAnswers.get(qq.getId());
                    if (selected != null && selected.equalsIgnoreCase(qq.getCorrectOption())) {
                        earnedScore += qq.getMarks();
                    }
                }

                QuizSubmission sub = new QuizSubmission(0, quizId, student.getStudentId(), earnedScore, totalScore, answers.toString());
                if (quizDAO.submitQuiz(sub)) {
                    JSONObject res = new JSONObject();
                    res.put("score", earnedScore);
                    res.put("totalScore", totalScore);
                    res.put("totalMarks", totalScore);
                    res.put("percentage", totalScore > 0 ? Math.round((earnedScore * 100.0 / totalScore) * 100.0) / 100.0 : 0.0);
                    sendSuccess(resp, "Quiz submitted successfully! Your score: " + earnedScore + " / " + totalScore, res);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to submit quiz");
                }
            } else if (path.endsWith("/toggle-publish")) {
                if (!requireRole(req, resp, "FACULTY", "ADMIN")) return;
                JSONObject body = readJsonRequest(req);
                int quizId = body.optInt("quizId", 0);
                if (quizId <= 0 && path.indexOf("/toggle-publish") > 1) {
                    try {
                        quizId = Integer.parseInt(path.substring(1, path.indexOf("/toggle-publish")));
                    } catch (Exception ignored) {}
                }
                if (quizId <= 0) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Valid quiz ID required.");
                    return;
                }
                Quiz quiz = quizDAO.getQuizById(quizId);
                if (quiz == null) {
                    sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Quiz not found");
                    return;
                }
                if (!canManage(user, quiz.getSubjectId(), quiz.getClassId())) {
                    sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this quiz.");
                    return;
                }
                if (quizDAO.togglePublish(quizId)) {
                    sendSuccess(resp, "Quiz publish status toggled", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to toggle status");
                }
            } else if (path.isEmpty() || "/".equals(path)) {
                if (!requireRole(req, resp, "FACULTY", "ADMIN")) return;
                JSONObject body = readJsonRequest(req);
                int subjectId = body.optInt("subjectId", 0);
                int classId = body.optInt("classId", 0);
                if (classId <= 0) {
                    classId = body.optInt("batchId", 0);
                }
                int facultyId = user instanceof Faculty ? ((Faculty) user).getFacultyId() : body.optInt("facultyId", 1);
                String title = body.optString("title", "").trim();
                String desc = body.optString("description", "").trim();
                double totalMarks = body.optDouble("totalMarks", 10.0);
                int duration = body.optInt("durationMinutes", body.optInt("timeLimitMinutes", 30));
                String deadlineStr = body.optString("deadline", body.optString("dueDate", ""));
                boolean isPublished = body.optBoolean("isPublished", false);

                if (subjectId <= 0 || classId <= 0 || title.isEmpty() || deadlineStr.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Subject, Class, Title, and Deadline are required.");
                    return;
                }
                if (!canManage(user, subjectId, classId)) {
                    sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this subject and class.");
                    return;
                }
                if (totalMarks <= 0 || duration <= 0 || duration > 720) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Total marks and duration must be positive; duration cannot exceed 720 minutes.");
                    return;
                }

                // Handle deadline string (accepts yyyy-MM-ddTHH:mm or yyyy-MM-dd HH:mm:ss)
                if (deadlineStr.contains("T")) {
                    deadlineStr = deadlineStr.replace("T", " ") + (deadlineStr.length() == 16 ? ":00" : "");
                }
                Timestamp deadline = Timestamp.valueOf(deadlineStr);

                Quiz quiz = new Quiz(0, subjectId, classId, facultyId, title, desc, totalMarks, duration, deadline, isPublished);
                JSONArray qArr = body.optJSONArray("questions");
                List<QuizQuestion> questions = new ArrayList<>();
                if (qArr != null) {
                    for (int i = 0; i < qArr.length(); i++) {
                        JSONObject qo = qArr.getJSONObject(i);
                        QuizQuestion qq = new QuizQuestion(
                                0,
                                0,
                                qo.optString("questionText", "").trim(),
                                qo.optString("optionA", "").trim(),
                                qo.optString("optionB", "").trim(),
                                qo.optString("optionC", "").trim(),
                                qo.optString("optionD", "").trim(),
                                qo.optString("correctOption", "A").trim().toUpperCase(),
                                qo.optDouble("marks", 1.0)
                        );
                        questions.add(qq);
                    }
                }
                if (questions.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "A quiz must include at least one question.");
                    return;
                }
                double questionTotal = 0;
                for (QuizQuestion question : questions) {
                    if (question.getQuestionText().isEmpty() || question.getOptionA().isEmpty() || question.getOptionB().isEmpty() ||
                            !question.getCorrectOption().matches("[ABCD]") || question.getMarks() <= 0) {
                        sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Each quiz question needs text, at least two options, a valid A-D answer, and positive marks.");
                        return;
                    }
                    questionTotal += question.getMarks();
                }
                if (Math.abs(questionTotal - totalMarks) > 0.01) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Question marks must equal the quiz total marks.");
                    return;
                }

                if (quizDAO.createQuiz(quiz, questions)) {
                    sendSuccess(resp, "Quiz created successfully", quiz.getId());
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to create quiz");
                }
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Quiz endpoint not found");
            }
        } catch (SQLException e) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "FACULTY", "ADMIN")) return;

        String path = req.getPathInfo();
        if (path == null || path.length() <= 1) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Quiz ID required");
            return;
        }

        try {
            int id = Integer.parseInt(path.substring(1));
            Quiz quiz = quizDAO.getQuizById(id);
            if (quiz == null) {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Quiz not found");
                return;
            }
            if (!canManage(getAuthenticatedUser(req), quiz.getSubjectId(), quiz.getClassId())) {
                sendError(resp, HttpServletResponse.SC_FORBIDDEN, "You are not assigned to this quiz.");
                return;
            }
            if (quizDAO.deleteQuiz(id)) {
                sendSuccess(resp, "Quiz deleted successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to delete quiz");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    private boolean canAccess(User user, int subjectId, int classId) throws SQLException {
        if ("ADMIN".equalsIgnoreCase(user.getRole())) return true;
        if (user instanceof Faculty) return accessControlDAO.facultyAssignedTo(((Faculty) user).getFacultyId(), subjectId, classId);
        return user instanceof Student && accessControlDAO.studentEnrolledIn(((Student) user).getStudentId(), subjectId, classId);
    }

    private boolean canManage(User user, int subjectId, int classId) throws SQLException {
        return "ADMIN".equalsIgnoreCase(user.getRole()) ||
                (user instanceof Faculty && accessControlDAO.facultyAssignedTo(((Faculty) user).getFacultyId(), subjectId, classId));
    }
}
