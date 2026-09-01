/**
 * students.js - Student Performance Analytics page + student detail drawer.
 */
(function (global) {
  'use strict';

  const state = { search: '', gradeFilter: 'All', riskFilter: 'All', sortKey: 'rank', sortDir: 'asc', page: 1, pageSize: 8 };
  let allStudents = [];

  async function render() {
    const container = document.getElementById('page-content');
    allStudents = await ApiService.getStudents(App.getFilters());
    state.page = 1;
    container.innerHTML = layoutHtml();
    bindControls();
    renderTable();
  }

  function layoutHtml() {
    return `
      <div class="card">
        <div class="card-pad" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);">
          <div style="position:relative;flex:1;min-width:220px;max-width:320px;">
            <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-faint);font-size:12px;"></i>
            <input id="stu-search" class="text-input" style="padding-left:30px;" placeholder="Search by name, roll no. or PRN" aria-label="Search students" />
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <select id="grade-filter" class="filter-select" aria-label="Filter by grade">
              <option value="All">All Grades</option>
              ${['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map((g) => `<option value="${g}">${g}</option>`).join('')}
            </select>
            <select id="risk-filter" class="filter-select" aria-label="Filter by risk">
              <option value="All">All Risk Levels</option>
              ${['Excellent', 'Good', 'Average', 'At Risk'].map((r) => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="table-scroll">
          <table class="data-table" id="students-table">
            <thead><tr>
              <th data-sort="rank" style="cursor:pointer;">Rank <i class="fa-solid fa-sort" style="font-size:9px;"></i></th>
              <th data-sort="rollNo" style="cursor:pointer;">Roll No.</th>
              <th data-sort="name" style="cursor:pointer;">Student Name</th>
              <th data-sort="average" style="cursor:pointer;">Average</th>
              <th data-sort="attendance" style="cursor:pointer;">Attendance</th>
              <th data-sort="coAttainment" style="cursor:pointer;">CO Attainment</th>
              <th>Grade</th><th>Risk</th><th>Trend</th><th>Actions</th>
            </tr></thead>
            <tbody id="students-tbody"></tbody>
          </table>
        </div>
        <div class="card-pad" style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border);">
          <div id="pagination-info" style="font-size:12px;color:var(--text-faint);"></div>
          <div id="pagination-controls" style="display:flex;gap:6px;"></div>
        </div>
      </div>`;
  }

  function bindControls() {
    document.getElementById('stu-search').addEventListener('input', UI.debounce((e) => { state.search = e.target.value; state.page = 1; renderTable(); }, 200));
    document.getElementById('grade-filter').addEventListener('change', (e) => { state.gradeFilter = e.target.value; state.page = 1; renderTable(); });
    document.getElementById('risk-filter').addEventListener('change', (e) => { state.riskFilter = e.target.value; state.page = 1; renderTable(); });
    document.querySelectorAll('#students-table th[data-sort]').forEach((th) => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        state.sortDir = state.sortKey === key && state.sortDir === 'asc' ? 'desc' : 'asc';
        state.sortKey = key;
        renderTable();
      });
    });
  }

  function getFiltered() {
    const q = state.search.trim().toLowerCase();
    let rows = allStudents.filter((s) =>
      (!q || s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q) || s.prn.toLowerCase().includes(q)) &&
      (state.gradeFilter === 'All' || s.grade === state.gradeFilter) &&
      (state.riskFilter === 'All' || s.risk === state.riskFilter)
    );
    rows.sort((a, b) => {
      const dir = state.sortDir === 'asc' ? 1 : -1;
      const va = a[state.sortKey], vb = b[state.sortKey];
      if (typeof va === 'string') return va.localeCompare(vb) * dir;
      return (va - vb) * dir;
    });
    return rows;
  }

  function renderTable() {
    const rows = getFiltered();
    const tbody = document.getElementById('students-tbody');
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="10">${UI.emptyState('fa-user-slash', 'No students found', 'Try adjusting your search or filters.')}</td></tr>`;
      document.getElementById('pagination-info').textContent = '';
      document.getElementById('pagination-controls').innerHTML = '';
      return;
    }
    const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * state.pageSize;
    const pageRows = rows.slice(start, start + state.pageSize);

    tbody.innerHTML = pageRows.map((s) => `
      <tr class="clickable" data-id="${s.id}">
        <td>#${s.rank}</td>
        <td>${s.rollNo}</td>
        <td style="font-weight:600;">${UI.escapeHtml(s.name)}</td>
        <td>${s.average}%</td>
        <td>${s.attendance}%</td>
        <td>${s.coAttainment}%</td>
        <td>${UI.badgeFor(s.grade)}</td>
        <td>${UI.badgeFor(s.risk)}</td>
        <td><i class="fa-solid ${s.average >= 60 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}" style="color:${s.average >= 60 ? 'var(--success)' : 'var(--danger)'};"></i></td>
        <td><button class="btn btn-outline btn-sm view-btn" data-id="${s.id}"><i class="fa-solid fa-eye"></i> View</button></td>
      </tr>`).join('');

    tbody.querySelectorAll('tr[data-id]').forEach((tr) => tr.addEventListener('click', (e) => {
      if (e.target.closest('.view-btn')) return;
      openStudentDrawer(tr.dataset.id);
    }));
    tbody.querySelectorAll('.view-btn').forEach((btn) => btn.addEventListener('click', () => openStudentDrawer(btn.dataset.id)));

    document.getElementById('pagination-info').textContent = `Showing ${start + 1}-${Math.min(start + state.pageSize, rows.length)} of ${rows.length} students`;
    const controls = document.getElementById('pagination-controls');
    controls.innerHTML = `
      <button class="btn btn-outline btn-sm" id="prev-page" ${state.page === 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i></button>
      <span style="font-size:12.5px;padding:5px 8px;color:var(--text-muted);">Page ${state.page} of ${totalPages}</span>
      <button class="btn btn-outline btn-sm" id="next-page" ${state.page === totalPages ? 'disabled' : ''}><i class="fa-solid fa-chevron-right"></i></button>`;
    const prevBtn = document.getElementById('prev-page'), nextBtn = document.getElementById('next-page');
    if (prevBtn) prevBtn.addEventListener('click', () => { state.page--; renderTable(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { state.page++; renderTable(); });
  }

  // ---------------- Student detail drawer ----------------
  const drawerCharts = {};
  function destroyDrawerCharts() { Object.values(drawerCharts).forEach((c) => c.destroy()); Object.keys(drawerCharts).forEach((k) => delete drawerCharts[k]); }

  async function openStudentDrawer(studentId) {
    const student = await ApiService.getStudentById(studentId);
    const overlay = UI.openDrawer(drawerSkeleton());
    fillDrawer(student);
  }

  function drawerSkeleton() {
    return `<div class="card-pad" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);">
      <div class="card-title">Student Details</div>
      <button class="icon-btn" onclick="UI.closeOverlay()" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
    </div><div class="card-pad">${UI.skeletonBlock('120px')}</div>`;
  }

  function fillDrawer(s) {
    const panel = document.querySelector('.drawer-panel');
    if (!panel) return;
    panel.innerHTML = `
      <div class="card-pad" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--surface);z-index:2;">
        <div class="card-title">Student Details</div>
        <button class="icon-btn" id="drawer-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="card-pad">
        <div style="display:flex;gap:14px;align-items:center;">
          <div style="width:52px;height:52px;border-radius:50%;background:var(--primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;">${s.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
          <div>
            <div style="font-weight:700;font-size:15px;">${UI.escapeHtml(s.name)}</div>
            <div style="font-size:12px;color:var(--text-faint);">${s.rollNo} · PRN ${s.prn} · ${s.branch} · ${s.batch}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
          ${miniKpi('Overall %', s.overallPercentage + '%')}
          ${miniKpi('Grade', s.grade)}
          ${miniKpi('Class Rank', `${s.rank}/${s.totalStudents}`)}
          ${miniKpi('CO Attainment', s.coAttainmentOverall + '%')}
          ${miniKpi('Result', s.passStatus)}
          ${miniKpi('Attendance', s.attendance + '%')}
        </div>

        <div class="card mt-4"><div class="card-pad">
          <div class="card-title">Subject-wise Performance</div>
          <div style="height:220px;margin-top:8px;"><canvas id="drawer-subject-chart"></canvas></div>
        </div></div>

        <div class="card mt-3"><div class="card-pad">
          <div class="card-title">CO-wise Performance</div>
          <div style="height:220px;margin-top:8px;"><canvas id="drawer-co-chart"></canvas></div>
        </div></div>

        <div class="card mt-3"><div class="card-pad">
          <div class="card-title">Assessment Trend</div>
          <div style="height:200px;margin-top:8px;"><canvas id="drawer-trend-chart"></canvas></div>
        </div></div>

        <div class="grid grid-cols-2 gap-3 mt-3">
          <div class="card card-pad">
            <div class="card-title" style="color:var(--success);">Strengths</div>
            <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">${s.strengths.map((c) => `<span class="badge badge-success">${c}</span>`).join('')}</div>
          </div>
          <div class="card card-pad">
            <div class="card-title" style="color:var(--danger);">Needs Attention</div>
            <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">${s.weaknesses.map((c) => `<span class="badge badge-danger">${c}</span>`).join('')}</div>
          </div>
        </div>

        <button class="btn btn-primary mt-4" style="width:100%;justify-content:center;" id="gen-marksheet-btn"><i class="fa-solid fa-file-pdf"></i> Generate Marksheet (PDF)</button>
      </div>`;

    panel.querySelector('#drawer-close').addEventListener('click', () => UI.closeOverlay());
    panel.querySelector('#gen-marksheet-btn').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating…';
      try {
        const fileName = await ReportService.generateMarksheetPDF(s.id);
        UI.toast(`Marksheet generated: ${fileName}`, 'success');
      } catch (err) {
        UI.toast('Failed to generate marksheet', 'danger');
      } finally {
        btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Generate Marksheet (PDF)';
      }
    });

    destroyDrawerCharts();
    drawerCharts.subject = new Chart(document.getElementById('drawer-subject-chart'), {
      type: 'bar',
      data: { labels: s.subjectPerformance.map((x) => x.code), datasets: [{ label: '%', data: s.subjectPerformance.map((x) => x.percentage), backgroundColor: UI.palette.primary, borderRadius: 5 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false }, ticks: { color: UI.chartTextColor(), font: { size: 10 } } }, y: { max: 100, grid: { color: UI.chartGridColor() }, ticks: { color: UI.chartTextColor() } } } },
    });
    drawerCharts.co = new Chart(document.getElementById('drawer-co-chart'), {
      type: 'bar',
      data: { labels: s.coPerformance.map((x) => x.co), datasets: [{ label: 'Attainment %', data: s.coPerformance.map((x) => x.attainment),
        backgroundColor: s.coPerformance.map((x) => x.attainment >= x.target ? UI.palette.success : UI.palette.danger), borderRadius: 5 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false }, ticks: { color: UI.chartTextColor(), font: { size: 10 } } }, y: { max: 100, grid: { color: UI.chartGridColor() }, ticks: { color: UI.chartTextColor() } } } },
    });
    drawerCharts.trend = new Chart(document.getElementById('drawer-trend-chart'), {
      type: 'line',
      data: { labels: s.assessmentTrend.map((x) => x.name), datasets: [{ label: '%', data: s.assessmentTrend.map((x) => x.percentage), borderColor: UI.palette.teal, backgroundColor: 'rgba(15,118,110,0.1)', fill: true, tension: 0.35 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false }, ticks: { color: UI.chartTextColor(), font: { size: 9.5 } } }, y: { max: 100, grid: { color: UI.chartGridColor() }, ticks: { color: UI.chartTextColor() } } } },
    });
  }

  function miniKpi(label, value) {
    return `<div style="background:var(--surface-2);border-radius:8px;padding:8px 10px;">
      <div style="font-size:10.5px;color:var(--text-faint);">${label}</div>
      <div style="font-weight:700;font-size:14px;">${value}</div>
    </div>`;
  }

  global.Students = { render, openStudentDrawer };
})(window);
