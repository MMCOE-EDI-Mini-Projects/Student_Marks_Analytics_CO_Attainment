/**
 * reports.js - Module 7: Report Center, Export History, Data Preview, Settings.
 */
(function (global) {
  'use strict';

  const REPORT_TYPES = [
    { id: 'individual-marksheet', name: 'Individual Marksheet', icon: 'fa-id-card', desc: 'Subject-wise marks, CO attainment and result for one student.', needsStudent: true, pdf: true, excel: false },
    { id: 'class-performance', name: 'Class Performance Report', icon: 'fa-people-group', desc: 'Class statistics, grade distribution, top performers and at-risk students.', pdf: true, excel: true },
    { id: 'co-attainment', name: 'CO Attainment Report', icon: 'fa-bullseye', desc: 'Course Outcome attainment vs target with gap analysis.', pdf: true, excel: true },
    { id: 'po-attainment', name: 'PO Attainment Report', icon: 'fa-diagram-project', desc: 'Programme Outcome attainment vs target with gap analysis.', pdf: true, excel: true },
    { id: 'assessment-analysis', name: 'Assessment Analysis Report', icon: 'fa-clipboard-list', desc: 'Statistical breakdown (avg, median, std. dev, pass %) per assessment.', pdf: true, excel: false },
    { id: 'student-risk', name: 'Student Risk Report', icon: 'fa-user-clock', desc: 'List of at-risk and average-performing students needing attention.', pdf: true, excel: false },
    { id: 'complete-analytics', name: 'Complete Academic Analytics Report', icon: 'fa-file-shield', desc: 'Combined class, CO and PO attainment overview for accreditation review.', pdf: true, excel: false },
  ];

  // ---------------- Report Center ----------------
  async function renderCenter() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        ${REPORT_TYPES.map((r) => `
          <div class="card card-pad">
            <div style="display:flex;gap:10px;align-items:flex-start;">
              <div style="width:38px;height:38px;border-radius:8px;background:var(--primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa-solid ${r.icon}"></i></div>
              <div>
                <div style="font-weight:600;font-size:13.5px;">${r.name}</div>
                <div style="font-size:11.5px;color:var(--text-faint);margin-top:2px;">${r.desc}</div>
              </div>
            </div>
            <button class="btn btn-primary btn-sm mt-3" style="width:100%;justify-content:center;" data-report="${r.id}"><i class="fa-solid fa-eye"></i> Configure & Preview</button>
          </div>`).join('')}
      </div>
    `;
    container.querySelectorAll('[data-report]').forEach((btn) => btn.addEventListener('click', () => openReportModal(btn.dataset.report)));
  }

  async function renderQuickReport(reportId) {
    // Sidebar shortcuts jump straight to the configure modal for that report, on top of a light landing page.
    const meta = REPORT_TYPES.find((r) => r.id === reportId);
    const container = document.getElementById('page-content');
    container.innerHTML = `
      <div class="card card-pad" style="max-width:520px;">
        <div style="display:flex;gap:10px;align-items:center;">
          <div style="width:40px;height:40px;border-radius:8px;background:var(--primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center;"><i class="fa-solid ${meta.icon}"></i></div>
          <div><div style="font-weight:700;">${meta.name}</div><div class="card-subtitle">${meta.desc}</div></div>
        </div>
        <button class="btn btn-primary mt-4" id="open-report-btn"><i class="fa-solid fa-eye"></i> Configure & Preview</button>
        <div style="font-size:11.5px;color:var(--text-faint);margin-top:10px;">More report types are available from the <a href="#report-center" style="color:var(--primary);">Report Center</a>.</div>
      </div>`;
    document.getElementById('open-report-btn').addEventListener('click', () => openReportModal(reportId));
  }

  async function openReportModal(reportId) {
    const meta = REPORT_TYPES.find((r) => r.id === reportId);
    const filters = App.getFilters();
    let studentOptions = '';
    if (meta.needsStudent) {
      const students = await ApiService.getStudents(filters);
      studentOptions = students.map((s) => `<option value="${s.id}">${s.rollNo} — ${s.name}</option>`).join('');
    }

    const html = `
      <div class="card-pad" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);">
        <div><div class="card-title">${meta.name}</div><div class="card-subtitle">${meta.desc}</div></div>
        <button class="icon-btn" id="report-modal-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="card-pad">
        <div class="grid grid-cols-2 gap-3">
          <div><label style="font-size:11.5px;color:var(--text-faint);">Semester</label><select class="text-input" id="rep-semester">${MOCK_DB.filters.semesters.map((s) => `<option ${s === filters.semester ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
          <div><label style="font-size:11.5px;color:var(--text-faint);">Batch</label><select class="text-input" id="rep-batch"><option>All Batches</option>${MOCK_DB.filters.batches['Computer Engineering'].map((b) => `<option ${b === filters.batch ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
          ${meta.needsStudent ? `<div style="grid-column:1/-1;"><label style="font-size:11.5px;color:var(--text-faint);">Student</label><select class="text-input" id="rep-student">${studentOptions}</select></div>` : ''}
        </div>
        <div id="report-preview" style="margin-top:16px;border:1px solid var(--border);border-radius:8px;padding:16px;background:var(--surface-2);max-height:340px;overflow:auto;"></div>
        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" id="rep-refresh-preview"><i class="fa-solid fa-arrows-rotate"></i> Refresh Preview</button>
          <button class="btn btn-primary btn-sm" id="rep-generate-pdf"><i class="fa-solid fa-file-pdf"></i> Generate PDF</button>
          ${meta.excel ? `<button class="btn btn-outline btn-sm" id="rep-generate-excel"><i class="fa-solid fa-file-excel"></i> Export Excel</button>` : ''}
          <button class="btn btn-ghost btn-sm" id="rep-print"><i class="fa-solid fa-print"></i> Print Preview</button>
        </div>
      </div>`;

    const overlay = UI.openModal(html, { width: '660px' });
    document.getElementById('report-modal-close').addEventListener('click', () => UI.closeOverlay());

    async function currentFilters() {
      return { ...filters, semester: document.getElementById('rep-semester').value, batch: document.getElementById('rep-batch').value };
    }
    async function currentOptions() {
      const f = await currentFilters();
      return { filters: f, studentId: meta.needsStudent ? document.getElementById('rep-student').value : undefined };
    }

    async function loadPreview() {
      const box = document.getElementById('report-preview');
      box.innerHTML = UI.skeletonBlock('160px');
      const opts = await currentOptions();
      box.innerHTML = await buildPreviewHtml(reportId, opts);
    }

    document.getElementById('rep-refresh-preview').addEventListener('click', loadPreview);
    document.getElementById('rep-semester').addEventListener('change', loadPreview);
    document.getElementById('rep-batch').addEventListener('change', loadPreview);
    if (meta.needsStudent) document.getElementById('rep-student').addEventListener('change', loadPreview);

    document.getElementById('rep-generate-pdf').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true; const orig = btn.innerHTML; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating…';
      try {
        const opts = await currentOptions();
        const fileName = await ReportService.generateReport(reportId, opts);
        UI.toast(`PDF generated: ${fileName}`, 'success');
      } catch (err) { console.error(err); UI.toast(err.message || 'Failed to generate PDF', 'danger'); }
      finally { btn.disabled = false; btn.innerHTML = orig; }
    });

    const excelBtn = document.getElementById('rep-generate-excel');
    if (excelBtn) excelBtn.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true; const orig = btn.innerHTML; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Exporting…';
      try {
        const opts = await currentOptions();
        const fileName = await ReportService.exportExcel(reportId, opts.filters);
        UI.toast(`Excel file generated: ${fileName}`, 'success');
      } catch (err) { console.error(err); UI.toast(err.message || 'Failed to export Excel', 'danger'); }
      finally { btn.disabled = false; btn.innerHTML = orig; }
    });

    document.getElementById('rep-print').addEventListener('click', () => window.print());

    loadPreview();
  }

  async function buildPreviewHtml(reportId, opts) {
    const head = `
      <div style="text-align:center;border-bottom:2px solid var(--navy);padding-bottom:8px;margin-bottom:10px;">
        <div style="font-weight:700;font-size:13px;">${MOCK_DB.meta.institution}</div>
        <div style="font-size:11.5px;color:var(--text-muted);">${MOCK_DB.meta.department}</div>
        <div style="font-size:11px;color:var(--text-faint);margin-top:4px;">Academic Year: ${opts.filters.academicYear} &nbsp;|&nbsp; ${opts.filters.semester} &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString('en-IN')}</div>
      </div>`;
    try {
      switch (reportId) {
        case 'individual-marksheet': {
          if (!opts.studentId) return head + UI.emptyState('fa-user', 'Select a student', 'Choose a student to preview their marksheet.');
          const s = await ApiService.getStudentById(opts.studentId);
          return head + `<div style="font-size:12.5px;"><b>${s.name}</b> (${s.rollNo}) — ${s.branch}, ${s.batch}</div>
            <table class="data-table mt-2"><thead><tr><th>Subject</th><th>%</th><th>Grade</th></tr></thead><tbody>
            ${s.subjectPerformance.map((x) => `<tr><td>${x.subject}</td><td>${x.percentage}%</td><td>${AnalyticsService.calculateGrade(x.percentage)}</td></tr>`).join('')}
            </tbody></table>
            <div class="mt-2" style="font-size:12.5px;"><b>Overall:</b> ${s.overallPercentage}% &nbsp; <b>Grade:</b> ${s.grade} &nbsp; <b>Result:</b> ${s.passStatus}</div>`;
        }
        case 'class-performance': {
          const dash = await ApiService.getDashboardAnalytics(opts.filters);
          return head + `<table class="data-table"><thead><tr><th>Total Students</th><th>Average</th><th>Pass %</th><th>At-Risk</th></tr></thead>
            <tbody><tr><td>${dash.kpis.totalStudents}</td><td>${dash.kpis.averageMarks}%</td><td>${dash.kpis.passPercentage}%</td><td>${dash.kpis.atRiskStudents}</td></tr></tbody></table>
            <div class="mt-2" style="font-size:12px;font-weight:600;">Grade Distribution</div>
            <table class="data-table mt-1"><thead><tr>${dash.gradeDistribution.map((g) => `<th>${g.grade}</th>`).join('')}</tr></thead>
            <tbody><tr>${dash.gradeDistribution.map((g) => `<td>${g.count}</td>`).join('')}</tr></tbody></table>`;
        }
        case 'co-attainment': {
          const co = await ApiService.getCOAttainment(opts.filters);
          return head + `<table class="data-table"><thead><tr><th>CO</th><th>Target</th><th>Attainment</th><th>Status</th></tr></thead>
            <tbody>${co.map((c) => `<tr><td>${c.id}</td><td>${c.target}%</td><td>${c.attainment}%</td><td>${c.status}</td></tr>`).join('')}</tbody></table>`;
        }
        case 'po-attainment': {
          const po = await ApiService.getPOAttainment(opts.filters);
          return head + `<table class="data-table"><thead><tr><th>PO</th><th>Target</th><th>Attainment</th><th>Status</th></tr></thead>
            <tbody>${po.map((p) => `<tr><td>${p.id}</td><td>${p.target}%</td><td>${p.attainment}%</td><td>${p.status}</td></tr>`).join('')}</tbody></table>`;
        }
        case 'assessment-analysis': {
          const data = await ApiService.getAssessmentAnalytics(opts.filters);
          return head + `<table class="data-table"><thead><tr><th>Assessment</th><th>Avg</th><th>Median</th><th>Std Dev</th><th>Pass %</th></tr></thead>
            <tbody>${data.map((a) => `<tr><td>${a.name}</td><td>${a.average}</td><td>${a.median}</td><td>${a.stdDev}</td><td>${a.passPercentage}%</td></tr>`).join('')}</tbody></table>`;
        }
        case 'student-risk': {
          const students = await ApiService.getStudents(opts.filters);
          const risky = students.filter((s) => s.risk === 'At Risk' || s.risk === 'Average');
          return head + (risky.length ? `<table class="data-table"><thead><tr><th>Roll No.</th><th>Name</th><th>Average</th><th>Risk</th></tr></thead>
            <tbody>${risky.map((s) => `<tr><td>${s.rollNo}</td><td>${s.name}</td><td>${s.average}%</td><td>${s.risk}</td></tr>`).join('')}</tbody></table>` : UI.emptyState('fa-face-smile', 'No at-risk students', 'Everyone in this selection is performing well.'));
        }
        case 'complete-analytics': {
          const dash = await ApiService.getDashboardAnalytics(opts.filters);
          return head + `<div style="font-size:12.5px;">Overall CO Attainment: <b>${dash.kpis.overallCOAttainment}%</b> &nbsp; Overall PO Attainment: <b>${dash.kpis.overallPOAttainment}%</b> &nbsp; Pass %: <b>${dash.kpis.passPercentage}%</b></div>`;
        }
        default: return head + UI.emptyState('fa-file', 'No preview available', '');
      }
    } catch (err) {
      return head + UI.emptyState('fa-triangle-exclamation', 'Preview unavailable', err.message);
    }
  }

  // ---------------- Export History ----------------
  function renderExportHistory() {
    const container = document.getElementById('page-content');
    const history = ReportService.getHistory();
    container.innerHTML = `
      <div class="card">
        <div class="card-pad" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);">
          <div class="card-title">Export History</div>
          <span class="card-subtitle">${history.length} report${history.length === 1 ? '' : 's'} generated this session</span>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Report Name</th><th>Type</th><th>Generated Date</th><th>Generated By</th><th>Format</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody id="history-tbody"></tbody>
          </table>
        </div>
      </div>`;
    paintHistory(history);
  }

  function paintHistory(history) {
    const tbody = document.getElementById('history-tbody');
    if (!history.length) {
      tbody.innerHTML = `<tr><td colspan="7">${UI.emptyState('fa-box-open', 'No reports generated yet', 'Generate a report from the Report Center to see it listed here.')}</td></tr>`;
      return;
    }
    tbody.innerHTML = history.map((h) => `
      <tr>
        <td style="font-weight:600;">${UI.escapeHtml(h.name)}</td>
        <td>${h.type}</td><td>${h.generatedDate}</td><td>${h.generatedBy}</td>
        <td><span class="badge badge-info">${h.format}</span></td>
        <td><span class="badge badge-success">${h.status}</span></td>
        <td style="display:flex;gap:6px;">
          <button class="btn btn-ghost btn-sm" title="Preview not available for past exports in this demo" disabled><i class="fa-solid fa-eye"></i></button>
          <button class="btn btn-ghost btn-sm" disabled title="Files are downloaded directly by the browser"><i class="fa-solid fa-download"></i></button>
          <button class="btn btn-ghost btn-sm delete-history" data-id="${h.id}" title="Remove from history"><i class="fa-solid fa-trash" style="color:var(--danger);"></i></button>
        </td>
      </tr>`).join('');
    tbody.querySelectorAll('.delete-history').forEach((btn) => btn.addEventListener('click', () => {
      const updated = ReportService.deleteHistoryEntry(btn.dataset.id);
      paintHistory(updated);
      UI.toast('Removed from export history', 'info');
    }));
  }

  // ---------------- Data Preview ----------------
  const PREVIEW_TABS = ['Students', 'Subjects', 'Assessments', 'Marks', 'COs', 'POs'];
  let activePreviewTab = 'Students';
  function renderDataPreview() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
      <div class="card">
        <div class="card-pad" style="border-bottom:1px solid var(--border);">
          <div class="card-title">Data Preview</div>
          <div class="card-subtitle">Read-only view of the mock data currently powering this dashboard. Useful for backend/API contract mapping.</div>
        </div>
        <div class="tab-list card-pad" style="padding-bottom:0;">${PREVIEW_TABS.map((t) => `<div class="tab-item ${t === activePreviewTab ? 'active' : ''}" data-tab="${t}">${t}</div>`).join('')}</div>
        <div class="table-scroll card-pad" id="preview-table-wrap"></div>
      </div>`;
    container.querySelectorAll('.tab-item').forEach((el) => el.addEventListener('click', () => { activePreviewTab = el.dataset.tab; renderDataPreview(); }));
    paintPreviewTable();
  }

  function paintPreviewTable() {
    const wrap = document.getElementById('preview-table-wrap');
    let head = [], rows = [];
    switch (activePreviewTab) {
      case 'Students':
        head = ['Roll No', 'Name', 'PRN', 'Branch', 'Batch', 'Attendance'];
        rows = MOCK_DB.students.map((s) => [s.rollNo, s.name, s.prn, s.branch, s.batch, s.attendance + '%']);
        break;
      case 'Subjects':
        head = ['Code', 'Name', 'Credits'];
        rows = MOCK_DB.subjects.map((s) => [s.code, s.name, s.credits]);
        break;
      case 'Assessments':
        head = ['Name', 'Type', 'Max Marks', 'Weight'];
        rows = MOCK_DB.assessments.map((a) => [a.name, a.type, a.maxMarks, (a.weight * 100) + '%']);
        break;
      case 'Marks':
        head = ['Student', 'Subject', 'Assessment', 'Obtained', 'Max'];
        rows = MOCK_DB.marks.slice(0, 150).map((m) => [
          MOCK_DB.students.find((s) => s.id === m.studentId).rollNo,
          MOCK_DB.subjects.find((s) => s.id === m.subjectId).code,
          MOCK_DB.assessments.find((a) => a.id === m.assessmentId).name,
          m.obtained, m.maxMarks]);
        break;
      case 'COs':
        head = ['CO', 'Title', 'Target'];
        rows = MOCK_DB.cos.map((c) => [c.id, c.title, c.target + '%']);
        break;
      case 'POs':
        head = ['PO', 'Title', 'Target'];
        rows = MOCK_DB.pos.map((p) => [p.id, p.title, p.target + '%']);
        break;
    }
    wrap.innerHTML = `<table class="data-table"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${UI.escapeHtml(String(c))}</td>`).join('')}</tr>`).join('')}</tbody></table>
      ${activePreviewTab === 'Marks' ? `<div style="font-size:11px;color:var(--text-faint);margin-top:8px;">Showing first 150 of ${MOCK_DB.marks.length} mark records.</div>` : ''}`;
  }

  // ---------------- Settings ----------------
  const SETTINGS_KEY = 'sma_settings_v1';
  function getSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || defaultSettings(); } catch (e) { return defaultSettings(); }
  }
  function defaultSettings() {
    return { institution: MOCK_DB.meta.institution, department: MOCK_DB.meta.department, academicYear: '2026-27', defaultSemester: 'Sem 5', defaultTarget: 60, footer: 'Generated by Student Marks Analytics & CO Attainment Tool' };
  }
  function renderSettings() {
    const container = document.getElementById('page-content');
    const s = getSettings();
    container.innerHTML = `
      <div class="card card-pad" style="max-width:640px;">
        <div class="card-title">Institution & Report Settings</div>
        <div class="card-subtitle">Stored locally on this device. Affects generated report headers/footers.</div>
        <div class="mt-4" style="display:flex;flex-direction:column;gap:12px;">
          ${field('institution', 'Institution Name', s.institution)}
          ${field('department', 'Department', s.department)}
          ${field('academicYear', 'Academic Year', s.academicYear)}
          ${field('defaultSemester', 'Default Semester', s.defaultSemester)}
          ${field('defaultTarget', 'Default Target Attainment (%)', s.defaultTarget, 'number')}
          ${field('footer', 'Report Footer', s.footer)}
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:16px;">
          <span class="card-subtitle">Theme:</span>
          <button class="btn btn-outline btn-sm" id="settings-theme-toggle"><i class="fa-solid fa-circle-half-stroke"></i> Toggle Light/Dark</button>
        </div>
        <button class="btn btn-primary mt-4" id="save-settings-btn"><i class="fa-solid fa-floppy-disk"></i> Save Settings</button>
      </div>`;

    function field(id, label, value, type) {
      return `<div><label style="font-size:11.5px;color:var(--text-faint);">${label}</label><input class="text-input" id="set-${id}" type="${type || 'text'}" value="${UI.escapeHtml(String(value))}"/></div>`;
    }

    document.getElementById('settings-theme-toggle').addEventListener('click', () => document.getElementById('theme-toggle').click());
    document.getElementById('save-settings-btn').addEventListener('click', () => {
      const updated = {
        institution: document.getElementById('set-institution').value,
        department: document.getElementById('set-department').value,
        academicYear: document.getElementById('set-academicYear').value,
        defaultSemester: document.getElementById('set-defaultSemester').value,
        defaultTarget: +document.getElementById('set-defaultTarget').value,
        footer: document.getElementById('set-footer').value,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      UI.toast('Settings saved', 'success');
    });
  }

  global.Reports = { renderCenter, renderQuickReport, renderExportHistory, renderDataPreview, renderSettings, getSettings };
})(window);
