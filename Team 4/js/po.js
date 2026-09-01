/**
 * po.js - PO Attainment analytics page with CO-PO contribution matrix.
 */
(function (global) {
  'use strict';
  let radarChart;

  function heatColor(value) {
    return { 0: 'var(--border)', 1: '#f0a94c', 2: '#4c7cf0', 3: '#17803d' }[value];
  }
  function heatLabel(value) { return { 0: '-', 1: 'L', 2: 'M', 3: 'H' }[value]; }

  async function render() {
    const container = document.getElementById('page-content');
    const [po, matrixData] = await Promise.all([ApiService.getPOAttainment(App.getFilters()), ApiService.getCOPOMatrix()]);

    container.innerHTML = `
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div class="card card-pad">
          <div class="card-title">PO Attainment Radar</div>
          <div class="card-subtitle">Current vs target attainment, PO1–PO12</div>
          <div style="height:320px;margin-top:10px;"><canvas id="po-radar"></canvas></div>
        </div>
        <div class="card card-pad" style="overflow:auto;">
          <div class="card-title">Programme Outcomes</div>
          <div class="table-scroll" style="margin-top:8px;">
            <table class="data-table">
              <thead><tr><th>PO</th><th>Title</th><th>Attainment</th><th>Gap</th><th>Status</th></tr></thead>
              <tbody>
                ${po.map((p) => `<tr title="${UI.escapeHtml(p.title)}"><td style="font-weight:600;">${p.id}</td><td style="max-width:180px;white-space:normal;font-size:12px;">${p.title}</td><td>${p.attainment}%</td><td>${p.gap > 0 ? p.gap : 0}</td><td>${UI.badgeFor(p.status)}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-pad" style="border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div>
            <div class="card-title">PO vs CO Contribution Matrix</div>
            <div class="card-subtitle">Mapping strength: 0 = No Mapping, 1 = Low, 2 = Medium, 3 = High</div>
          </div>
          <div style="display:flex;gap:10px;font-size:11.5px;color:var(--text-muted);">
            <span><span class="heat-cell" style="display:inline-flex;width:16px;height:16px;background:var(--border);color:var(--text);"></span> 0</span>
            <span><span class="heat-cell" style="display:inline-flex;width:16px;height:16px;background:#f0a94c;"></span> 1</span>
            <span><span class="heat-cell" style="display:inline-flex;width:16px;height:16px;background:#4c7cf0;"></span> 2</span>
            <span><span class="heat-cell" style="display:inline-flex;width:16px;height:16px;background:#17803d;"></span> 3</span>
          </div>
        </div>
        <div class="table-scroll card-pad">
          <table class="data-table" style="min-width:900px;">
            <thead><tr><th>CO \\ PO</th>${matrixData.pos.map((p) => `<th style="text-align:center;">${p.id}</th>`).join('')}</tr></thead>
            <tbody>
              ${matrixData.cos.map((co) => `
                <tr><td style="font-weight:600;">${co.id}</td>
                  ${matrixData.matrix[co.id].map((v) => `<td style="padding:4px;"><div class="heat-cell" style="background:${heatColor(v)};">${heatLabel(v)}</div></td>`).join('')}
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    if (radarChart) radarChart.destroy();
    radarChart = new Chart(document.getElementById('po-radar'), {
      type: 'radar',
      data: { labels: po.map((p) => p.id), datasets: [
        { label: 'Current', data: po.map((p) => p.attainment), backgroundColor: 'rgba(28,78,216,0.18)', borderColor: UI.palette.primary, pointBackgroundColor: UI.palette.primary },
        { label: 'Target', data: po.map((p) => p.target), backgroundColor: 'rgba(15,118,110,0.08)', borderColor: UI.palette.teal, borderDash: [4, 4], pointRadius: 0 },
      ]},
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: UI.chartTextColor(), boxWidth: 10, font: { size: 11 } } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label} ${ctx.label}: ${ctx.raw}% — ${MOCK_DB.pos.find(p => p.id === ctx.label).title}` } } },
        scales: { r: { min: 0, max: 100, grid: { color: UI.chartGridColor() }, angleLines: { color: UI.chartGridColor() },
          pointLabels: { color: UI.chartTextColor(), font: { size: 10 } }, ticks: { display: false } } },
      },
    });
  }

  global.POModule = { render };
})(window);
