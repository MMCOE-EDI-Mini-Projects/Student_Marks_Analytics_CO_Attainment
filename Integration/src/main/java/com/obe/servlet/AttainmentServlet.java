package com.obe.servlet;

import com.obe.dao.AttainmentDAO;
import com.obe.model.AttainmentConfig;
import com.obe.service.AttainmentEngine;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/attainment/*")
public class AttainmentServlet extends BaseServlet {

    private final AttainmentEngine attainmentEngine = new AttainmentEngine();
    private final AttainmentDAO attainmentDAO = new AttainmentDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            if ("/calculate".equalsIgnoreCase(path)) {
                String subjectParam = req.getParameter("subjectId");
                String classParam = req.getParameter("classId");
                if (classParam == null || classParam.trim().isEmpty()) {
                    classParam = req.getParameter("batchId");
                }

                if (subjectParam == null || classParam == null) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "subjectId and classId required");
                    return;
                }

                int subjectId = Integer.parseInt(subjectParam);
                int classId = Integer.parseInt(classParam);

                Map<String, Object> attainmentMap = attainmentEngine.calculateSubjectAttainment(subjectId, classId);
                Map<String, Object> statsMap = attainmentEngine.calculateClassStatistics(subjectId, classId);

                JSONObject res = new JSONObject();
                res.put("attainment", new JSONObject(attainmentMap));
                res.put("statistics", new JSONObject(statsMap));

                sendSuccess(resp, "CO-PO attainment calculated successfully", res);
            } else if ("/config".equalsIgnoreCase(path)) {
                AttainmentConfig config = attainmentDAO.getConfig();
                JSONObject cfgJson = new JSONObject();
                cfgJson.put("id", config.getId());
                cfgJson.put("targetMarkPct", config.getTargetMarkPct());
                cfgJson.put("level1Pct", config.getLevel1Pct());
                cfgJson.put("level2Pct", config.getLevel2Pct());
                cfgJson.put("level3Pct", config.getLevel3Pct());
                cfgJson.put("directWeight", config.getDirectWeight());
                cfgJson.put("indirectWeight", config.getIndirectWeight());
                sendSuccess(resp, "Attainment config fetched", cfgJson);
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Attainment endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN")) return;

        String path = req.getPathInfo();
        if ("/config".equalsIgnoreCase(path)) {
            try {
                JSONObject body = readJsonRequest(req);
                AttainmentConfig cfg = new AttainmentConfig(
                        1,
                        body.optDouble("targetMarkPct", 60.0),
                        body.optDouble("level1Pct", 50.0),
                        body.optDouble("level2Pct", 60.0),
                        body.optDouble("level3Pct", 70.0),
                        body.optDouble("directWeight", 80.0),
                        body.optDouble("indirectWeight", 20.0)
                );
                if (attainmentDAO.updateConfig(cfg)) {
                    sendSuccess(resp, "Attainment rules updated successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update attainment rules");
                }
            } catch (Exception e) {
                sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
            }
        } else {
            sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
        }
    }
}
