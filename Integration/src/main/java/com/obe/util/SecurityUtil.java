package com.obe.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.security.SecureRandom;
import java.util.Base64;

public class SecurityUtil {

    private static final SecureRandom random = new SecureRandom();

    public static String generateCsrfToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String getOrCreateCsrfToken(HttpSession session) {
        String token = (String) session.getAttribute("csrfToken");
        if (token == null) {
            token = generateCsrfToken();
            session.setAttribute("csrfToken", token);
        }
        return token;
    }

    public static boolean validateCsrfToken(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return false;
        
        String sessionToken = (String) session.getAttribute("csrfToken");
        String requestToken = request.getHeader("X-CSRF-Token");
        
        if (requestToken == null) {
            requestToken = request.getParameter("csrfToken");
        }
        
        return sessionToken != null && sessionToken.equals(requestToken);
    }

    public static String sanitize(String input) {
        if (input == null) return "";
        return input.replaceAll("<", "&lt;").replaceAll(">", "&gt;").trim();
    }
}
