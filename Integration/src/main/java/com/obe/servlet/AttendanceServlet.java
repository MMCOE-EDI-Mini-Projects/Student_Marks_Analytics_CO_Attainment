package com.obe.servlet;

import com.obe.dao.AttendanceDAO;
import com.obe.model.Attendance;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/attendance/*")
public class AttendanceServlet extends BaseServlet {

    private final AttendanceDAO attendanceDAO = new AttendanceDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String subjectParam = req.getParameter("subjectId");
            String classParam = req.getParameter("classId");
            if (classParam == null || classParam.trim().isEmpty()) {
                classParam = req.getParameter("batchId");
            }
            String dateStr = req.getParameter("date");

            if (subjectParam == null || classParam == null || dateStr == null) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "subjectId, classId, and date parameters required");
                return;
            }

            Date date = Date.valueOf(dateStr);
            List<Attendance> list = attendanceDAO.getAttendanceBySubjectDate(
                    Integer.parseInt(subjectParam),
                    Integer.parseInt(classParam),
                    date
            );

            JSONArray array = new JSONArray();
            for (Attendance a : list) {
                JSONObject obj = new JSONObject();
                obj.put("id", a.getId());
                obj.put("subjectId", a.getSubjectId());
                obj.put("classId", a.getClassId());
                obj.put("className", a.getClassName());
                obj.put("batchId", a.getClassId());
                obj.put("batchName", a.getClassName());
                obj.put("studentId", a.getStudentId());
                obj.put("rollNumber", a.getStudentRollNumber());
                obj.put("studentName", a.getStudentName());
                obj.put("attendanceDate", a.getAttendanceDate().toString());
                obj.put("status", a.getStatus());
                array.put(obj);
            }
            sendSuccess(resp, "Attendance fetched", array);
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (!requireRole(req, resp, "FACULTY", "ADMIN")) return;

        try {
            JSONObject body = readJsonRequest(req);
            int subjectId = body.optInt("subjectId", 0);
            int classId = body.optInt("classId", 0);
            if (classId <= 0) {
                classId = body.optInt("batchId", 0);
            }
            String dateStr = body.optString("attendanceDate", "");
            JSONArray records = body.optJSONArray("records");

            if (subjectId <= 0 || classId <= 0 || dateStr.isEmpty() || records == null) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid attendance payload.");
                return;
            }

            Date date = Date.valueOf(dateStr);
            List<Attendance> list = new ArrayList<>();
            for (int i = 0; i < records.length(); i++) {
                JSONObject rObj = records.getJSONObject(i);
                Attendance a = new Attendance(
                        0,
                        subjectId,
                        classId,
                        rObj.getInt("studentId"),
                        date,
                        rObj.optString("status", "PRESENT").toUpperCase()
                );
                list.add(a);
            }

            if (attendanceDAO.saveBulkAttendance(list)) {
                sendSuccess(resp, "Attendance saved successfully", null);
            } else {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to save attendance");
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
        }
    }
}
