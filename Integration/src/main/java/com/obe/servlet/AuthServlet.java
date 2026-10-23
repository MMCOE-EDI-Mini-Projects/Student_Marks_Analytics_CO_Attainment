package com.obe.servlet;

import com.obe.dao.UserDAO;
import com.obe.model.User;
import com.obe.util.SecurityUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.json.JSONObject;

import java.io.IOException;

@WebServlet("/api/auth/*")
public class AuthServlet extends BaseServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            switch (path) {
                case "/login":
                    handleLogin(req, resp);
                    break;
                case "/logout":
                    handleLogout(req, resp);
                    break;
                case "/forgot-password":
                    handleForgotPassword(req, resp);
                    break;
                case "/reset-password":
                    handleResetPassword(req, resp);
                    break;
                default:
                    sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Auth endpoint not found");
                    break;
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Server Error: " + e.getMessage());
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if ("/me".equalsIgnoreCase(path)) {
            handleMe(req, resp);
        } else {
            sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        JSONObject body = readJsonRequest(req);
        String username = body.optString("username", "").trim();
        String password = body.optString("password", "").trim();

        if (username.isEmpty() || password.isEmpty()) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Username and password are required.");
            return;
        }

        User user = userDAO.authenticate(username, password);
        if (user != null) {
            HttpSession session = req.getSession(true);
            session.setAttribute("authenticatedUser", user);
            String csrfToken = SecurityUtil.getOrCreateCsrfToken(session);

            JSONObject userJson = new JSONObject();
            userJson.put("id", user.getId());
            userJson.put("username", user.getUsername());
            userJson.put("email", user.getEmail());
            userJson.put("role", user.getRole());
            userJson.put("fullName", user.getFullName());
            userJson.put("dashboardRoute", user.getDashboardRoute());
            userJson.put("csrfToken", csrfToken);

            sendSuccess(resp, "Login successful", userJson);
        } else {
            sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Invalid username or password.");
        }
    }

    private void handleLogout(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        sendSuccess(resp, "Logged out successfully", null);
    }

    private void handleMe(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = getAuthenticatedUser(req);
        if (user != null) {
            String csrfToken = SecurityUtil.getOrCreateCsrfToken(req.getSession());
            JSONObject userJson = new JSONObject();
            userJson.put("id", user.getId());
            userJson.put("username", user.getUsername());
            userJson.put("email", user.getEmail());
            userJson.put("role", user.getRole());
            userJson.put("fullName", user.getFullName());
            userJson.put("dashboardRoute", user.getDashboardRoute());
            userJson.put("csrfToken", csrfToken);
            sendSuccess(resp, "Authenticated user info", userJson);
        } else {
            sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not logged in");
        }
    }

    private void handleForgotPassword(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        JSONObject body = readJsonRequest(req);
        String email = body.optString("email", "").trim();
        if (email.isEmpty()) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Email address is required.");
            return;
        }

        String token = userDAO.createPasswordResetToken(email);
        if (token != null) {
            // Return simulation token in response for quick testing/demo
            JSONObject res = new JSONObject();
            res.put("resetToken", token);
            sendSuccess(resp, "Password reset link generated successfully.", res);
        } else {
            sendError(resp, HttpServletResponse.SC_NOT_FOUND, "No account found with specified email.");
        }
    }

    private void handleResetPassword(HttpServletRequest req, HttpServletResponse resp) throws Exception {
        JSONObject body = readJsonRequest(req);
        String token = body.optString("token", "").trim();
        String newPassword = body.optString("newPassword", "").trim();

        if (token.isEmpty() || newPassword.isEmpty()) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Token and new password are required.");
            return;
        }

        User user = userDAO.validateResetToken(token);
        if (user != null) {
            userDAO.updatePassword(user.getId(), newPassword);
            sendSuccess(resp, "Password has been reset successfully. You can now login.", null);
        } else {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid or expired reset token.");
        }
    }
}
