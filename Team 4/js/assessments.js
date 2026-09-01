/**
 * assessments.js - Assessment Analytics page.
 */
(function (global) {
  'use strict';
  const charts = {};
  function destroyAll() { Object.values(charts).forEach((c) => c.destroy()); Object.keys(charts).forEach((k) => delete charts[k]); }

  let selectedId = null;

  async function render() {
    const container = document.getElementById('page-content');
    const data = await ApiService.getAssessmentAnalytics(App.getFilters());
    if (!selectedId) selectedId = data[0].id;
    const current = data.find((a) => a.id === selectedId) || data[0];

    container.innerHTML = `
      <div class="card card-pad" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <span class="card-subtitle">Assessment:</span>
        <select id="assessment-select" class="filter-select">
          ${data.map((a) => `<option value="${a.id}" ${a.id === current.id ? 'selected' : ''}>${a.name} (${a.type})</option>`).join('')}
        </select>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mt-4">
        ${stat('Average', current.average + '%')}
        ${stat('Highest', current.highest + '%')}
        ${stat('Lowest', current.lowest + '%')}
        ${stat('Median', current.median + '%')}
        ${stat('Std. Deviation', current.stdDev)}
        ${stat('Pass %', current.passPercentage + '%')}
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <div class="card card-pad">
          <div class="card-title">Assessment Comparison</div>
          <div class="card-subtitle">Average % across all assessments</div>
          <div style="height:260px;margin-top:10px;"><canvas id="assess-compare-chart"></canvas></div>
        </div>
        <div class="card card-pad">
          <div class="card-title">Grade Distribution — ${current.name}</div>
          <div style="height:260px;margin-top:10px;"><canvas id="assess-dist-chart"></canvas></div>
        </div>
      </div>

      <div class="card card-pad mt-4">
        <div class="card-title">Performance Trend</div>
        <div class="card-subtitle">Average and pass % progression across assessments</div>
        <div style="height:260px;margin-top:10px;"><canvas id="assess-trend-chart"></canvas></div>
      </div>
    `;

    document.getElementById('assessment-select').addEventListener('change', (e) => { selectedId = e.target.value; render(); });

    destroyAll();
    charts.compare = new Chart(document.getElementById('assess-compare-chart'), {
      type: 'bar',
      data: { labels: data.map((a) => a.name), datasets: [{ label: 'Average %', data: data.map((a) => a.average), backgroundColor: data.map((a) => a.id === current.id ? UI.palette.primary : UI.palette.primaryLight), borderRadius: 5 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false }, ticks: { color: UI.chartTextColor(), font: { size: 10 } } }, y: { max: 100, grid: { color: UI.chartGridColor() }, ticks: { color: UI.chartTextColor() } } } },
    });
    charts.dist = new Chart(document.getElementById('assess-dist-chart'), {
      type: 'doughnut',
      data: { labels: current.distribution.map((d) => d.grade), datasets: [{ data: current.distribution.map((d) => d.count),
        backgroundColor: [UI.palette.success, '#2f9e5c', UI.palette.teal, UI.palette.primary, UI.palette.warning, '#c47a2a', UI.palette.danger] }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { color: UI.chartTextColor(), boxWidth: 10, font: { size: 10.5 } } } } },
    });
    charts.trend = new Chart(document.getElementById('assess-trend-chart'), {
      type: 'line',
      data: { labels: data.map((a) => a.name), datasets: [
        { label: 'Average %', data: data.map((a) => a.average), borderColor: UI.palette.primary, backgroundColor: 'rgba(28,78,216,0.08)', fill: true, tension: 0.35 },
        { label: 'Pass %', data: data.map((a) => a.passPercentage), borderColor: UI.palette.teal, borderDash: [5, 3], fill: false, tension: 0.35 },
      ]},
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: UI.chartTextColor(), boxWidth: 10, font: { size: 11 } } } },
        scales: { x: { grid: { display: false }, ticks: { color: UI.chartTextColor(), font: { size: 10 } } }, y: { max: 100, grid: { color: UI.chartGridColor() }, ticks: { color: UI.chartTextColor() } } } },
    });
  }

  function stat(label, value) {
    return `<div class="kpi-card"><div class="card-subtitle">${label}</div><div style="font-size:19px;font-weight:700;margin-top:4px;">${value}</div></div>`;
  }

  global.Assessments = { render };
})(window);
