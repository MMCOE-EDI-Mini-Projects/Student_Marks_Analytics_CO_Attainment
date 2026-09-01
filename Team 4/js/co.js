/**
 * co.js - CO Attainment analytics page.
 */
(function (global) {
  'use strict';
  let chart;

  async function render() {
    const container = document.getElementById('page-content');
    const co = await ApiService.getCOAttainment(App.getFilters());

    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        ${co.map((c) => `
          <div class="card card-pad">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <div style="font-weight:700;font-size:15px;">${c.id}</div>
                <div style="font-size:11.5px;color:var(--text-faint);max-width:220px;">${MOCK_DB.cos.find(x => x.id === c.id).title}</div>
              </div>
              ${UI.badgeFor(c.status)}
            </div>
            <div style="font-size:24px;font-weight:700;margin-top:10px;">${c.attainment}%</div>
            <div style="font-size:11.5px;color:var(--text-faint);">Target: ${c.target}% &middot; Gap: ${c.gap > 0 ? c.gap : 0}pts</div>
            <div style="height:6px;background:var(--surface-2);border-radius:4px;margin-top:8px;overflow:hidden;">
              <div style="height:100%;width:${Math.min(100, c.attainment)}%;background:${c.status === 'Achieved' ? 'var(--success)' : c.status === 'Near Target' ? 'var(--warning)' : 'var(--danger)'};"></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:11.5px;color:var(--text-muted);">
              <span>${c.studentsAchieved}/${c.totalStudents} students achieved</span>
              <i class="fa-solid ${c.trend === 'up' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}" style="color:${c.trend === 'up' ? 'var(--success)' : 'var(--danger)'};"></i>
            </div>
          </div>`).join('')}
      </div>

      <div class="card mt-4 card-pad">
        <div class="card-title">CO Attainment vs Target</div>
        <div style="height:280px;margin-top:10px;"><canvas id="co-main-chart"></canvas></div>
      </div>

      <div class="card mt-4">
        <div class="card-pad" style="border-bottom:1px solid var(--border);"><div class="card-title">Detailed CO Table</div></div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>CO</th><th>Target</th><th>Attainment</th><th>Gap</th><th>Status</th><th>Students Achieved</th></tr></thead>
            <tbody>
              ${co.map((c) => `<tr><td style="font-weight:600;">${c.id}</td><td>${c.target}%</td><td>${c.attainment}%</td><td>${c.gap > 0 ? c.gap : 0} pts</td><td>${UI.badgeFor(c.status)}</td><td>${c.studentsAchieved}/${c.totalStudents}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card mt-4 card-pad">
        <div class="card-title"><i class="fa-solid fa-wand-magic-sparkles" style="color:var(--primary);"></i> CO Performance Analysis</div>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px;">
          ${co.filter((c) => c.status !== 'Achieved').map((c) => `
            <div style="display:flex;gap:8px;padding:10px;background:var(--surface-2);border-radius:8px;font-size:12.5px;">
              <i class="fa-solid fa-triangle-exclamation" style="color:var(--warning);margin-top:2px;"></i>
              <span>${c.id} is ${c.status.toLowerCase()} at ${c.attainment}%, ${c.gap.toFixed(1)} points below the ${c.target}% target. Consider revisiting associated assessment questions and remedial sessions.</span>
            </div>`).join('') || `<div style="font-size:12.5px;color:var(--text-muted);">All course outcomes have achieved their target attainment for this selection.</div>`}
        </div>
        <div style="font-size:11px;color:var(--text-faint);margin-top:10px;"><i class="fa-solid fa-circle-info"></i> CO attainment uses a Demo Calculation Method (class-average of per-student internal assessment performance mapped to each CO).</div>
      </div>
    `;

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById('co-main-chart'), {
      type: 'bar',
      data: { labels: co.map((c) => c.id), datasets: [
        { label: 'Attainment %', data: co.map((c) => c.attainment), backgroundColor: co.map((c) => c.status === 'Achieved' ? UI.palette.success : c.status === 'Near Target' ? UI.palette.warning : UI.palette.danger), borderRadius: 5 },
        { label: 'Target %', data: co.map((c) => c.target), type: 'line', borderColor: UI.palette.slate, borderDash: [5, 4], pointRadius: 0, fill: false },
      ]},
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: UI.chartTextColor(), boxWidth: 10, font: { size: 11 } } } },
        scales: { x: { grid: { display: false }, ticks: { color: UI.chartTextColor() } }, y: { max: 100, grid: { color: UI.chartGridColor() }, ticks: { color: UI.chartTextColor() } } } },
    });
  }

  global.COModule = { render };
})(window);
