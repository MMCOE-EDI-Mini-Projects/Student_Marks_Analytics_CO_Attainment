package com.obe.servlet;

import com.obe.dao.CoPoMappingDAO;
import com.obe.dao.CourseOutcomeDAO;
import com.obe.dao.ProgrammeOutcomeDAO;
import com.obe.model.CoPoMapping;
import com.obe.model.CourseOutcome;
import com.obe.model.ProgrammeOutcome;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/copo/*")
public class CoPoServlet extends BaseServlet {

    private final CourseOutcomeDAO coDAO = new CourseOutcomeDAO();
    private final ProgrammeOutcomeDAO poDAO = new ProgrammeOutcomeDAO();
    private final CoPoMappingDAO mappingDAO = new CoPoMappingDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            if ("/cos".equalsIgnoreCase(path)) {
                String subjectParam = req.getParameter("subjectId");
                if (subjectParam == null || subjectParam.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "subjectId parameter required");
                    return;
                }
                List<CourseOutcome> list = coDAO.getCOsBySubject(Integer.parseInt(subjectParam));
                JSONArray array = new JSONArray();
                for (CourseOutcome co : list) {
                    JSONObject obj = new JSONObject();
                    obj.put("id", co.getId());
                    obj.put("subjectId", co.getSubjectId());
                    obj.put("coCode", co.getCoCode());
                    obj.put("description", co.getDescription());
                    obj.put("targetAttainmentPct", co.getTargetAttainmentPct());
                    array.put(obj);
                }
                sendSuccess(resp, "COs fetched", array);
            } else if ("/pos".equalsIgnoreCase(path)) {
                String deptParam = req.getParameter("departmentId");
                if (deptParam == null || deptParam.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "departmentId parameter required");
                    return;
                }
                List<ProgrammeOutcome> list = poDAO.getPOsByDepartment(Integer.parseInt(deptParam));
                JSONArray array = new JSONArray();
                for (ProgrammeOutcome po : list) {
                    JSONObject obj = new JSONObject();
                    obj.put("id", po.getId());
                    obj.put("departmentId", po.getDepartmentId());
                    obj.put("poCode", po.getPoCode());
                    obj.put("title", po.getTitle() != null ? po.getTitle() : "");
                    obj.put("description", po.getDescription());
                    array.put(obj);
                }
                sendSuccess(resp, "POs fetched", array);
            } else if ("/mapping-matrix".equalsIgnoreCase(path)) {
                String subjectParam = req.getParameter("subjectId");
                if (subjectParam == null || subjectParam.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "subjectId parameter required");
                    return;
                }
                List<CoPoMapping> list = mappingDAO.getMappingsBySubject(Integer.parseInt(subjectParam));
                JSONArray array = new JSONArray();
                for (CoPoMapping m : list) {
                    JSONObject obj = new JSONObject();
                    obj.put("id", m.getId());
                    obj.put("coId", m.getCoId());
                    obj.put("coCode", m.getCoCode());
                    obj.put("poId", m.getPoId());
                    obj.put("poCode", m.getPoCode());
                    obj.put("strength", m.getStrength());
                    array.put(obj);
                }
                sendSuccess(resp, "CO-PO mapping matrix fetched", array);
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "COPO endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN", "FACULTY")) return;

        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            JSONObject body = readJsonRequest(req);

            if ("/cos".equalsIgnoreCase(path)) {
                int subjectId = body.optInt("subjectId", 0);
                String coCode = body.optString("coCode", "").trim();
                String description = body.optString("description", "").trim();
                double targetPct = body.optDouble("targetAttainmentPct", 60.0);

                if (subjectId <= 0 || coCode.isEmpty() || description.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Subject ID, CO Code, and Description are required.");
                    return;
                }

                CourseOutcome co = new CourseOutcome(0, subjectId, coCode, description, targetPct);
                if (coDAO.create(co)) {
                    sendSuccess(resp, "Course Outcome created successfully", co.getId());
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to create Course Outcome");
                }
            } else if ("/pos".equalsIgnoreCase(path)) {
                int departmentId = body.optInt("departmentId", 0);
                String poCode = body.optString("poCode", "").trim();
                String title = body.optString("title", "").trim();
                String description = body.optString("description", "").trim();

                if (departmentId <= 0 || poCode.isEmpty() || description.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Department ID, PO Code, and Description are required.");
                    return;
                }

                ProgrammeOutcome po = new ProgrammeOutcome(0, departmentId, poCode, title, description);
                if (poDAO.create(po)) {
                    sendSuccess(resp, "Programme Outcome created successfully", po.getId());
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to create Programme Outcome");
                }
            } else if ("/mapping-matrix".equalsIgnoreCase(path)) {
                JSONArray mappingsArray = body.optJSONArray("mappings");
                if (mappingsArray == null || mappingsArray.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Mappings array required.");
                    return;
                }

                List<CoPoMapping> mappings = new ArrayList<>();
                for (int i = 0; i < mappingsArray.length(); i++) {
                    JSONObject mObj = mappingsArray.getJSONObject(i);
                    int coId = mObj.getInt("coId");
                    int poId = mObj.getInt("poId");
                    int strength = mObj.optInt("strength", 0);
                    mappings.add(new CoPoMapping(0, coId, poId, strength));
                }

                if (mappingDAO.batchSaveMappings(mappings)) {
                    sendSuccess(resp, "CO-PO mapping matrix updated successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update mapping matrix");
                }
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "COPO endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN", "FACULTY")) return;

        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            JSONObject body = readJsonRequest(req);
            if ("/cos".equalsIgnoreCase(path)) {
                int id = body.optInt("id", 0);
                String coCode = body.optString("coCode", "").trim();
                String description = body.optString("description", "").trim();
                double targetPct = body.optDouble("targetAttainmentPct", 60.0);

                if (id <= 0 || coCode.isEmpty() || description.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "CO ID, Code, and Description required.");
                    return;
                }

                CourseOutcome co = new CourseOutcome(id, 0, coCode, description, targetPct);
                if (coDAO.update(co)) {
                    sendSuccess(resp, "Course Outcome updated successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update Course Outcome");
                }
            } else if ("/pos".equalsIgnoreCase(path)) {
                int id = body.optInt("id", 0);
                String poCode = body.optString("poCode", "").trim();
                String title = body.optString("title", "").trim();
                String description = body.optString("description", "").trim();

                if (id <= 0 || poCode.isEmpty() || description.isEmpty()) {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "PO ID, Code, and Description required.");
                    return;
                }

                ProgrammeOutcome po = new ProgrammeOutcome(id, 0, poCode, title, description);
                if (poDAO.update(po)) {
                    sendSuccess(resp, "Programme Outcome updated successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update Programme Outcome");
                }
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "ADMIN", "FACULTY")) return;

        String path = req.getPathInfo();
        if (path == null) path = "";

        try {
            if (path.startsWith("/cos/")) {
                int id = Integer.parseInt(path.substring("/cos/".length()));
                if (coDAO.delete(id)) {
                    sendSuccess(resp, "Course Outcome deleted successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to delete Course Outcome");
                }
            } else if (path.startsWith("/pos/")) {
                int id = Integer.parseInt(path.substring("/pos/".length()));
                if (poDAO.delete(id)) {
                    sendSuccess(resp, "Programme Outcome deleted successfully", null);
                } else {
                    sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to delete Programme Outcome");
                }
            } else {
                sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }
}
