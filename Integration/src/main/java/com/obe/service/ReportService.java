package com.obe.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.util.Map;

public class ReportService {

    public byte[] generateAttainmentPdfReport(String subjectName, String className, Map<String, Object> attainmentData) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(document, baos);

        document.open();

        // Header Title
        com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("Outcome-Based Education (OBE) Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        com.lowagie.text.Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
        Paragraph subTitle = new Paragraph("Subject: " + subjectName + " | Class: " + className, subFont);
        subTitle.setAlignment(Element.ALIGN_CENTER);
        subTitle.setSpacingAfter(20);
        document.add(subTitle);

        // 1. CO Attainment Table
        Paragraph coHeader = new Paragraph("1. Course Outcome (CO) Attainment", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
        coHeader.setSpacingAfter(10);
        document.add(coHeader);

        PdfPTable coTable = new PdfPTable(5);
        coTable.setWidthPercentage(100);
        coTable.setWidths(new float[]{1.5f, 4f, 2f, 2f, 2f});

        String[] headers = {"CO Code", "Description", "Total Attempts", "Attainment %", "Attainment Level"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            coTable.addCell(cell);
        }

        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> coMap = (Map<String, Map<String, Object>>) attainmentData.get("coAttainment");
        if (coMap != null) {
            for (Map<String, Object> co : coMap.values()) {
                coTable.addCell(new Phrase((String) co.get("coCode"), FontFactory.getFont(FontFactory.HELVETICA, 10)));
                coTable.addCell(new Phrase((String) co.get("description"), FontFactory.getFont(FontFactory.HELVETICA, 9)));
                coTable.addCell(new Phrase(String.valueOf(co.get("totalAttempts")), FontFactory.getFont(FontFactory.HELVETICA, 10)));
                coTable.addCell(new Phrase(co.get("attainmentPct") + "%", FontFactory.getFont(FontFactory.HELVETICA, 10)));
                coTable.addCell(new Phrase(String.valueOf(co.get("attainmentLevel")), FontFactory.getFont(FontFactory.HELVETICA, 10)));
            }
        }
        document.add(coTable);

        // 2. PO Attainment Table
        Paragraph poHeader = new Paragraph("2. Programme Outcome (PO) Attainment Level", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
        poHeader.setSpacingBefore(20);
        poHeader.setSpacingAfter(10);
        document.add(poHeader);

        PdfPTable poTable = new PdfPTable(3);
        poTable.setWidthPercentage(100);
        poTable.setWidths(new float[]{2f, 4f, 3f});

        String[] poHeaders = {"PO Code", "Total CO Strength", "Calculated PO Level"};
        for (String h : poHeaders) {
            PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            poTable.addCell(cell);
        }

        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> poMap = (Map<String, Map<String, Object>>) attainmentData.get("poAttainment");
        if (poMap != null) {
            for (Map<String, Object> po : poMap.values()) {
                poTable.addCell(new Phrase((String) po.get("poCode"), FontFactory.getFont(FontFactory.HELVETICA, 10)));
                poTable.addCell(new Phrase(String.valueOf(po.get("totalStrength")), FontFactory.getFont(FontFactory.HELVETICA, 10)));
                poTable.addCell(new Phrase(String.valueOf(po.get("poAttainmentLevel")), FontFactory.getFont(FontFactory.HELVETICA, 10)));
            }
        }
        document.add(poTable);

        document.close();
        return baos.toByteArray();
    }

    public byte[] generateAttainmentExcelReport(String subjectName, String className, Map<String, Object> attainmentData) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("OBE Attainment Report");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            int rowIdx = 0;
            Row titleRow = sheet.createRow(rowIdx++);
            titleRow.createCell(0).setCellValue("OBE Attainment Report - " + subjectName + " (" + className + ")");
            titleRow.getCell(0).setCellStyle(headerStyle);

            rowIdx++; // Blank

            // 1. CO Attainment Table
            Row coTitleRow = sheet.createRow(rowIdx++);
            coTitleRow.createCell(0).setCellValue("Course Outcome (CO) Attainment Summary");
            coTitleRow.getCell(0).setCellStyle(headerStyle);

            Row coHeaderRow = sheet.createRow(rowIdx++);
            String[] coHeaders = {"CO Code", "Description", "Total Attempts", "Attained Count", "Attainment %", "Attainment Level"};
            for (int i = 0; i < coHeaders.length; i++) {
                Cell cell = coHeaderRow.createCell(i);
                cell.setCellValue(coHeaders[i]);
                cell.setCellStyle(headerStyle);
            }

            @SuppressWarnings("unchecked")
            Map<String, Map<String, Object>> coMap = (Map<String, Map<String, Object>>) attainmentData.get("coAttainment");
            if (coMap != null) {
                for (Map<String, Object> co : coMap.values()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue((String) co.get("coCode"));
                    row.createCell(1).setCellValue((String) co.get("description"));
                    row.createCell(2).setCellValue(Double.parseDouble(co.get("totalAttempts").toString()));
                    row.createCell(3).setCellValue(Double.parseDouble(co.get("attainedCount").toString()));
                    row.createCell(4).setCellValue(Double.parseDouble(co.get("attainmentPct").toString()));
                    row.createCell(5).setCellValue(Double.parseDouble(co.get("attainmentLevel").toString()));
                }
            }

            rowIdx++; // Blank

            // 2. PO Attainment Table
            Row poTitleRow = sheet.createRow(rowIdx++);
            poTitleRow.createCell(0).setCellValue("Programme Outcome (PO) Attainment Level Summary");
            poTitleRow.getCell(0).setCellStyle(headerStyle);

            Row poHeaderRow = sheet.createRow(rowIdx++);
            String[] poHeaders = {"PO Code", "Total CO Mapping Strength", "PO Attainment Level"};
            for (int i = 0; i < poHeaders.length; i++) {
                Cell cell = poHeaderRow.createCell(i);
                cell.setCellValue(poHeaders[i]);
                cell.setCellStyle(headerStyle);
            }

            @SuppressWarnings("unchecked")
            Map<String, Map<String, Object>> poMap = (Map<String, Map<String, Object>>) attainmentData.get("poAttainment");
            if (poMap != null) {
                for (Map<String, Object> po : poMap.values()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue((String) po.get("poCode"));
                    row.createCell(1).setCellValue(Double.parseDouble(po.get("totalStrength").toString()));
                    row.createCell(2).setCellValue(Double.parseDouble(po.get("poAttainmentLevel").toString()));
                }
            }

            for (int i = 0; i < 6; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    public byte[] generateStudentIndividualReportPdf(String studentName, String rollNumber, String className,
                                                    String subjectName, Map<String, Object> studentAttainmentData) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(document, baos);

        document.open();

        com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("Student Academic Attainment Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        com.lowagie.text.Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 11);
        Paragraph subTitle = new Paragraph("Student: " + studentName + " (Roll: " + rollNumber + ") | Class: " + className + " | Subject: " + subjectName, subFont);
        subTitle.setAlignment(Element.ALIGN_CENTER);
        subTitle.setSpacingAfter(20);
        document.add(subTitle);

        Paragraph coHeader = new Paragraph("Course Outcome (CO) Performance", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
        coHeader.setSpacingAfter(10);
        document.add(coHeader);

        PdfPTable coTable = new PdfPTable(5);
        coTable.setWidthPercentage(100);
        coTable.setWidths(new float[]{1.5f, 4f, 2f, 2f, 2f});

        String[] headers = {"CO Code", "Description", "Marks Obtained", "Percentage", "Attainment Level"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            coTable.addCell(cell);
        }

        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> coMap = (Map<String, Map<String, Object>>) studentAttainmentData.get("coAttainment");
        if (coMap != null) {
            for (Map<String, Object> co : coMap.values()) {
                coTable.addCell(new Phrase((String) co.get("coCode"), FontFactory.getFont(FontFactory.HELVETICA, 10)));
                coTable.addCell(new Phrase((String) co.get("description"), FontFactory.getFont(FontFactory.HELVETICA, 9)));
                coTable.addCell(new Phrase(co.get("marksObtained") + " / " + co.get("maxMarks"), FontFactory.getFont(FontFactory.HELVETICA, 10)));
                coTable.addCell(new Phrase(co.get("attainmentPct") + "%", FontFactory.getFont(FontFactory.HELVETICA, 10)));
                coTable.addCell(new Phrase(String.valueOf(co.get("attainmentLevel")), FontFactory.getFont(FontFactory.HELVETICA, 10)));
            }
        }
        document.add(coTable);

        Paragraph poHeader = new Paragraph("Programme Outcome (PO) Derived Performance", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
        poHeader.setSpacingBefore(20);
        poHeader.setSpacingAfter(10);
        document.add(poHeader);

        PdfPTable poTable = new PdfPTable(3);
        poTable.setWidthPercentage(100);
        poTable.setWidths(new float[]{2f, 4f, 3f});

        String[] poHeaders = {"PO Code", "Total CO Mapping Strength", "PO Attainment Level"};
        for (String h : poHeaders) {
            PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
            cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            poTable.addCell(cell);
        }

        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> poMap = (Map<String, Map<String, Object>>) studentAttainmentData.get("poAttainment");
        if (poMap != null) {
            for (Map<String, Object> po : poMap.values()) {
                poTable.addCell(new Phrase((String) po.get("poCode"), FontFactory.getFont(FontFactory.HELVETICA, 10)));
                poTable.addCell(new Phrase(String.valueOf(po.get("totalStrength")), FontFactory.getFont(FontFactory.HELVETICA, 10)));
                poTable.addCell(new Phrase(String.valueOf(po.get("poAttainmentLevel")), FontFactory.getFont(FontFactory.HELVETICA, 10)));
            }
        }
        document.add(poTable);

        document.close();
        return baos.toByteArray();
    }
}
