package com.obe.servlet;

import com.obe.model.User;
import com.obe.util.SecurityUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;

public abstract class BaseServlet extends HttpServlet {

    protected User getAuthenticatedUser(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session != null) {
            return (User) session.getAttribute("authenticatedUser");
        }
        return null;
    }

    protected boolean requireRole(HttpServletRequest req, HttpServletResponse resp, String... allowedRoles) throws IOException {
        User user = getAuthenticatedUser(req);
        if (user == null) {
            sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: Please log in first.");
            return false;
        }

        for (String role : allowedRoles) {
            if (role.equalsIgnoreCase(user.getRole())) {
                return true;
            }
        }

        sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Forbidden: Insufficient privileges.");
        return false;
    }

    protected JSONObject readJsonRequest(HttpServletRequest req) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        String body = sb.toString().trim();
        if (body.isEmpty()) {
            return new JSONObject();
        }
        return new JSONObject(body);
    }

    protected void sendJsonResponse(HttpServletResponse resp, JSONObject json) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().write(json.toString());
    }

    protected void sendSuccess(HttpServletResponse resp, String message, Object data) throws IOException {
        JSONObject json = new JSONObject();
        json.put("status", "success");
        json.put("message", message);
        if (data != null) {
            json.put("data", data);
        }
        sendJsonResponse(resp, json);
    }

    protected void sendError(HttpServletResponse resp, int statusCode, String message) throws IOException {
        resp.setStatus(statusCode);
        JSONObject json = new JSONObject();
        json.put("status", "error");
        json.put("message", message);
        sendJsonResponse(resp, json);
    }
}
