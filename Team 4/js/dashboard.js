/**
 * dashboard.js - Main Dashboard + Performance Analytics page.
 */
(function (global) {
  'use strict';

  const chartRegistry = {};
  function destroyChart(id) { if (chartRegistry[id]) { chartRegistry[id].destroy(); delete chartRegistry[id]; } }
  function registerChart(id, chart) { destroyChart(id); chartRegistry[id] = chart; return chart; }

  function kpiCard({ icon, label, value, suffix, prevValue, goodUp, sparkline }) {
    const tr = AnalyticsService.trend(parseFloat(value), prevValue);
    return `
      <div class="kpi-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div class="card-subtitle">${label}</div>
            <div style="font-size:22px;font-weight:700;margin-top:4px;">${value}${suffix || ''}</div>
          </div>
          <div style="width:36px;height:36px;border-radius:8px;background:var(--primary-soft);display:flex;align-items:center;justify-content:center;color:var(--primary);">
            <i class="fa-solid ${icon}"></i>
          </div>
        </div>
        <div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;">
          ${UI.trendBadge(tr.direction, tr.delta, goodUp)}
          <div class="sparkline-wrap"><canvas id="spark-${label.replace(/\s/g, '')}"></canvas></div>
        </div>
        <div style="font-size:11px;color:var(--text-faint);margin-top:2px;">vs previous assessment</div>
      </div>`;
  }

  function drawSparkline(canvasId, data, color) {
    const el = document.getElementById(canvasId);
    if (!el) return;
    registerChart(canvasId, new Chart(el, {
      type: 'line',
      data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, borderWidth: 2, pointRadius: 0, tension: 0.4, fill: false }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } }, elements: { line: { borderJoinStyle: 'round' } } },
    }));
  }

  async function render() {
    const filters = App.getFilters();
    const container = document.getElementById('page-content');
    const [dash, insights] = await Promise.all([ApiService.getDashboardAnalytics(filters), ApiService.getInsights(filters)]);

    container.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        ${kpiCard({ icon: 'fa-users', label: 'Total Students', value: dash.kpis.totalStudents, prevValue: dash.kpis.previous.totalStudents })}
        ${kpiCard({ icon: 'fa-chart-simple', label: 'Average Marks', value: dash.kpis.averageMarks, suffix: '%', prevValue: dash.kpis.previous.averageMarks })}
        ${kpiCard({ icon: 'fa-square-check', label: 'Pass Percentage', value: dash.kpis.passPercentage, suffix: '%', prevValue: dash.kpis.previous.passPercentage })}
        ${kpiCard({ icon: 'fa-bullseye', label: 'Overall CO Attainment', value: dash.kpis.overallCOAttainment, suffix: '%', prevValue: dash.kpis.previous.overallCOAttainment })}
        ${kpiCard({ icon: 'fa-diagram-project', label: 'Overall PO Attainment', value: dash.kpis.overallPOAttainment, suffix: '%', prevValue: dash.kpis.previous.overallPOAttainment })}
        ${kpiCard({ icon: 'fa-user-clock', label: 'At-Risk Students', value: dash.kpis.atRiskStudents, prevValue: dash.kpis.previous.atRiskStudents, goodUp: false })}
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-5">
        <div class="card card-pad xl:col-span-2">
          <div class="card-title">Class Performance Distribution</div>
          <div class="card-subtitle">Grade-wise student count for the current selection</div>
          <div style="height:260px;margin-top:10px;"><canvas id="chart-grade-dist"></canvas></div>
        </div>
        <div class="card card-pad">
          <div class="card-title">Student Risk Distribution</div>
          <div class="card-subtitle">Based on overall performance</div>
          <div style="height:260px;margin-top:10px;"><canvas id="chart-risk-donut"></canvas></div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <div class="card card-pad">
          <div class="card-title">CO Attainment</div>
          <div class="card-subtitle">Target = 60% (dashed line)</div>
          <div style="height:280px;margin-top:10px;"><canvas id="chart-co-bar"></canvas></div>
        </div>
        <div class="card card-pad">
          <div class="card-title">PO Attainment Radar</div>
          <div class="card-subtitle">Current vs target attainment across PO1–PO12</div>
          <div style="height:280px;margin-top:10px;"><canvas id="chart-po-radar"></canvas></div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <div class="card card-pad xl:col-span-2">
          <div class="card-title">Performance Trend</div>
          <div class="card-subtitle">Class average and pass % across assessments</div>
          <div style="height:260px;margin-top:10px;"><canvas id="chart-trend"></canvas></div>
        </div>
        <div class="card card-pad">
          <div style="display:flex;align-items:center;gap:8px;">
            <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--primary);"></i>
            <div class="card-title">Automated Analytics Insights</div>
          </div>
          <div class="card-subtitle">Generated from current filtered dataset</div>
          <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px;">
            ${insights.map((i) => `
              <div style="display:flex;gap:8px;padding:10px;background:var(--surface-2);border-radius:8px;">
                <i class="fa-solid ${i.type === 'danger' ? 'fa-triangle-exclamation' : i.type === 'success' ? 'fa-circle-check' : i.type === 'warning' ? 'fa-circle-exclamation' : 'fa-circle-info'}" style="color:var(--${i.type === 'danger' ? 'danger' : i.type === 'success' ? 'success' : i.type === 'warning' ? 'warning' : 'primary'});margin-top:2px;"></i>
                <div style="font-size:12.5px;color:var(--text);line-height:1.5;">${UI.escapeHtml(i.text)}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    `;

    drawSparkline(`spark-TotalStudents`, dash.sparkline.averageMarks, UI.palette.slate);
    drawSparkline(`spark-AverageMarks`, dash.sparkline.averageMarks, UI.palette.primary);
    drawSparkline(`spark-PassPercentage`, dash.sparkline.passPercentage, UI.palette.teal);
    drawSparkline(`spark-OverallCOAttainment`, dash.sparkline.averageMarks, UI.palette.success);
    drawSparkline(`spark-OverallPOAttainment`, dash.sparkline.passPercentage, UI.palette.success);
    drawSparkline(`spark-At-RiskStudents`, dash.sparkline.averageMarks.map((v) => 100 - v), UI.palette.danger);

    drawGradeDistribution(dash.gradeDistribution);
    drawRiskDonut(dash.riskDistribution);
    drawCOBar(dash.coAttainment);
    drawPORadar(dash.poAttainment);
    drawTrend(dash.performanceTrend);
  }

  function drawGradeDistribution(dist) {
    const el = document.getElementById('chart-grade-dist');
    registerChart('chart-grade-dist', new Chart(el, {
      type: 'bar',
      data: {
        labels: dist.map((d) => d.grade),
        datasets: [{ label: 'Students', data: dist.map((d) => d.count), backgroundColor: UI.palette.primary, borderRadius: 5, maxBarThickness: 42 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { afterLabel: (ctx) => `${dist[ctx.dataIndex].percentage}% of class` } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: UI.chartTextColor() } },
          y: { beginAtZero: true, grid: { color: UI.chartGridColor() }, ticks: { color: UI.chartTextColor() } },
        },
      },
    }));
  }

  function drawRiskDonut(risk) {
    const el = document.getElementById('chart-risk-donut');
    const labels = ['Excellent', 'Good', 'Average', 'At Risk'];
    const colors = [UI.palette.success, UI.palette.teal, UI.palette.warning, UI.palette.danger];
    registerChart('chart-risk-donut', new Chart(el, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: labels.map((l) => risk[l] || 0), backgroundColor: colors, borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: { legend: { position: 'bottom', labels: { color: UI.chartTextColor(), boxWidth: 10, font: { size: 11 } } } } },
    }));
  }

  function drawCOBar(coData) {
    const el = document.getElementById('chart-co-bar');
    const colors = coData.map((c) => c.attainment >= c.target ? UI.palette.success : c.attainment >= c.target - 10 ? UI.palette.warning : UI.palette.danger);
    registerChart('chart-co-bar', new Chart(el, {
      type: 'bar',
      data: { labels: coData.map((c) => c.id), datasets: [
        { label: 'Attainment %', data: coData.map((c) => c.attainment), backgroundColor: colors, borderRadius: 5 },
      ]},
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `Attainment: ${ctx.raw}% (Target: ${coData[ctx.dataIndex].target}%)` } },
          annotation: undefined,
        },
        scales: { x: { max: 100, grid: { color: UI.chartGridColor() }, ticks: { color: UI.chartTextColor() } },
          y: { grid: { display: false }, ticks: { color: UI.chartTextColor() } } },
      },
      plugins: [{
        id: 'targetLine',
        afterDraw(chart) {
          const { ctx, chartArea, scales } = chart;
          const x = scales.x.getPixelForValue(coData[0].target);
          ctx.save();
          ctx.strokeStyle = UI.palette.slate;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(x, chartArea.top);
          ctx.lineTo(x, chartArea.bottom);
          ctx.stroke();
          ctx.restore();
        },
      }],
    }));
  }

  function drawPORadar(poData) {
    const el = document.getElementById('chart-po-radar');
    registerChart('chart-po-radar', new Chart(el, {
      type: 'radar',
      data: {
        labels: poData.map((p) => p.id),
        datasets: [
          { label: 'Current', data: poData.map((p) => p.attainment), backgroundColor: 'rgba(28,78,216,0.18)', borderColor: UI.palette.primary, pointBackgroundColor: UI.palette.primary },
          { label: 'Target', data: poData.map((p) => p.target), backgroundColor: 'rgba(15,118,110,0.08)', borderColor: UI.palette.teal, borderDash: [4, 4], pointRadius: 0 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: UI.chartTextColor(), boxWidth: 10, font: { size: 11 } } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%` } } },
        scales: { r: { min: 0, max: 100, grid: { color: UI.chartGridColor() }, angleLines: { color: UI.chartGridColor() },
          pointLabels: { color: UI.chartTextColor(), font: { size: 10.5 } }, ticks: { display: false } } },
      },
    }));
  }

  function drawTrend(trendData) {
    const el = document.getElementById('chart-trend');
    registerChart('chart-trend', new Chart(el, {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: [
          { label: 'Class Average %', data: trendData.classAverage, borderColor: UI.palette.primary, backgroundColor: 'rgba(28,78,216,0.08)', tension: 0.35, fill: true },
          { label: 'Pass %', data: trendData.passPercentage, borderColor: UI.palette.teal, backgroundColor: 'transparent', tension: 0.35, borderDash: [5, 3] },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: UI.chartTextColor(), boxWidth: 10, font: { size: 11 } } } },
        scales: { x: { grid: { display: false }, ticks: { color: UI.chartTextColor(), font: { size: 10.5 } } },
          y: { min: 0, max: 100, grid: { color: UI.chartGridColor() }, ticks: { color: UI.chartTextColor() } } },
      },
    }));
  }

  // ---------------- Performance Analytics page (subject-focused view) ----------------
  async function renderPerformancePage() {
    const filters = App.getFilters();
    const container = document.getElementById('page-content');
    const dash = await ApiService.getDashboardAnalytics(filters);
    const students = await ApiService.getStudents(filters);

    const subjectAverages = MOCK_DB.subjects.map((subj) => {
      const values = students.map((s) => {
        const rows = MOCK_DB.marks.filter((m) => m.studentId === s.id && m.subjectId === subj.id);
        const obtained = rows.reduce((a, b) => a + b.obtained, 0);
        const max = rows.reduce((a, b) => a + b.maxMarks, 0);
        return AnalyticsService.calculatePercentage(obtained, max);
      });
      return { name: subj.name, code: subj.code, average: +AnalyticsService.calculateAverage(values).toFixed(1), pass: +AnalyticsService.calculatePassPercentage(values, 40).toFixed(1) };
    });

    container.innerHTML = `
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div class="card card-pad xl:col-span-2">
          <div class="card-title">Subject-wise Average Performance</div>
          <div class="card-subtitle">Average percentage per subject for the current selection</div>
          <div style="height:300px;margin-top:10px;"><canvas id="chart-subject-avg"></canvas></div>
        </div>
        <div class="card card-pad">
          <div class="card-title">Performance Trend</div>
          <div class="card-subtitle">Assessment-wise class average</div>
          <div style="height:300px;margin-top:10px;"><canvas id="chart-perf-trend"></canvas></div>
        </div>
      </div>
      <div class="card mt-4">
        <div class="card-pad" style="border-bottom:1px solid var(--border);">
          <div class="card-title">Subject Performance Summary</div>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>Subject</th><th>Code</th><th>Average %</th><th>Pass %</th><th>Status</th></tr></thead>
            <tbody>
              ${subjectAverages.map((s) => `
                <tr>
                  <td style="font-weight:600;">${s.name}</td><td>${s.code}</td><td>${s.average}%</td><td>${s.pass}%</td>
                  <td>${UI.badgeFor(s.average >= 60 ? 'Achieved' : s.average >= 50 ? 'Near Target' : 'Below Target')}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    registerChart('chart-subject-avg', new Chart(document.getElementById('chart-subject-avg'), {
      type: 'bar',
      data: { labels: subjectAverages.map((s) => s.code), datasets: [{ label: 'Average %', data: subjectAverages.map((s) => s.average), backgroundColor: UI.palette.primary, borderRadius: 5 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false }, ticks: { color: UI.chartTextColor() } }, y: { max: 100, grid: { color: UI.chartGridColor() }, ticks: { color: UI.chartTextColor() } } } },
    }));

    registerChart('chart-perf-trend', new Chart(document.getElementById('chart-perf-trend'), {
      type: 'line',
      data: { labels: dash.performanceTrend.labels, datasets: [{ label: 'Class Average %', data: dash.performanceTrend.classAverage, borderColor: UI.palette.primary, backgroundColor: 'rgba(28,78,216,0.1)', fill: true, tension: 0.35 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false }, ticks: { color: UI.chartTextColor(), font: { size: 10 } } }, y: { max: 100, grid: { color: UI.chartGridColor() }, ticks: { color: UI.chartTextColor() } } } },
    }));
  }

  global.Dashboard = { render, renderPerformancePage };
})(window);
