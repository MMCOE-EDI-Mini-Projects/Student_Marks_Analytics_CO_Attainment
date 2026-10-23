package com.obe.servlet;

import jakarta.servlet.annotation.WebServlet;

@WebServlet("/api/batches/*")
public class BatchServlet extends ClassServlet {
    // Inherits all endpoints from ClassServlet for backward compatibility
}
