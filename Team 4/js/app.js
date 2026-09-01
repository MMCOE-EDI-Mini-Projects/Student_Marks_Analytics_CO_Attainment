/**
 * app.js - application shell: routing, sidebar/topbar, global filters,
 * theme, command palette (Ctrl+K), notifications.
 */
(function (global) {
  'use strict';

  const NAV = [
    { section: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high' }] },
    { section: 'Analytics', items: [
      { id: 'performance', label: 'Performance Analytics', icon: 'fa-chart-line' },
      { id: 'co-attainment', label: 'CO Attainment', icon: 'fa-bullseye' },
      { id: 'po-attainment', label: 'PO Attainment', icon: 'fa-diagram-project' },
      { id: 'students', label: 'Student Performance', icon: 'fa-user-graduate' },
      { id: 'assessments', label: 'Assessment Analytics', icon: 'fa-clipboard-list' },
    ]},
    { section: 'Reports', items: [
      { id: 'report-center', label: 'Report Center', icon: 'fa-file-lines' },
      { id: 'report-marksheet', label: 'Individual Marksheet', icon: 'fa-id-card' },
      { id: 'report-class', label: 'Class Performance Report', icon: 'fa-people-group' },
      { id: 'report-co', label: 'CO Attainment Report', icon: 'fa-bullseye' },
      { id: 'report-po', label: 'PO Attainment Report', icon: 'fa-diagram-project' },
    ]},
    { section: 'Administration', items: [
      { id: 'data-preview', label: 'Data Preview', icon: 'fa-database' },
      { id: 'export-history', label: 'Export History', icon: 'fa-clock-rotate-left' },
      { id: 'settings', label: 'Settings', icon: 'fa-gear' },
    ]},
  ];

  const PAGE_TITLES = {
    dashboard: 'Dashboard', performance: 'Performance Analytics', 'co-attainment': 'CO Attainment',
    'po-attainment': 'PO Attainment', students: 'Student Performance', assessments: 'Assessment Analytics',
    'report-center': 'Report Center', 'report-marksheet': 'Individual Marksheet', 'report-class': 'Class Performance Report',
    'report-co': 'CO Attainment Report', 'report-po': 'PO Attainment Report',
    'data-preview': 'Data Preview', 'export-history': 'Export History', settings: 'Settings',
  };

  const RENDERERS = {
    dashboard: () => Dashboard.render(),
    performance: () => Dashboard.renderPerformancePage(),
    'co-attainment': () => COModule.render(),
    'po-attainment': () => POModule.render(),
    students: () => Students.render(),
    assessments: () => Assessments.render(),
    'report-center': () => Reports.renderCenter(),
    'report-marksheet': () => Reports.renderQuickReport('individual-marksheet'),
    'report-class': () => Reports.renderQuickReport('class-performance'),
    'report-co': () => Reports.renderQuickReport('co-attainment'),
    'report-po': () => Reports.renderQuickReport('po-attainment'),
    'data-preview': () => Reports.renderDataPreview(),
    'export-history': () => Reports.renderExportHistory(),
    settings: () => Reports.renderSettings(),
  };

  const state = {
    route: 'dashboard',
    filters: { academicYear: '2026-27', semester: 'Sem 5', branch: 'Computer Engineering', batch: 'All Batches' },
    theme: localStorage.getItem('sma_theme') || 'light',
  };

  function getFilters() { return { ...state.filters }; }

  // ---------------- Theme ----------------
  function applyTheme() {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = `fa-solid ${state.theme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
  }
  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('sma_theme', state.theme);
    applyTheme();
    global.dispatchEvent(new CustomEvent('theme-changed'));
  }

  // ---------------- Sidebar ----------------
  function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = NAV.map((sec) => `
      <div class="sidebar-section-label">${sec.section}</div>
      ${sec.items.map((it) => `
        <div class="nav-item ${state.route === it.id ? 'active' : ''}" data-route="${it.id}" tabindex="0" role="button" aria-label="${it.label}">
          <i class="fa-solid ${it.icon}"></i><span>${it.label}</span>
        </div>`).join('')}
    `).join('');
    nav.querySelectorAll('.nav-item').forEach((el) => {
      el.addEventListener('click', () => navigate(el.dataset.route));
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigate(el.dataset.route); });
    });
  }

  // ---------------- Topbar / filters ----------------
  async function renderTopbar() {
    document.getElementById('page-title').textContent = PAGE_TITLES[state.route] || 'Dashboard';
    document.getElementById('breadcrumb').textContent = `Home / ${PAGE_TITLES[state.route] || 'Dashboard'}`;

    const opts = await ApiService.getFilterOptions();
    const filterBar = document.getElementById('filter-bar');
    filterBar.innerHTML = `
      ${selectHtml('academicYear', opts.academicYears, state.filters.academicYear)}
      ${selectHtml('semester', opts.semesters, state.filters.semester)}
      ${selectHtml('branch', opts.branches, state.filters.branch)}
      ${selectHtml('batch', opts.batches, state.filters.batch)}
    `;
    filterBar.querySelectorAll('select').forEach((sel) => {
      sel.addEventListener('change', () => {
        state.filters[sel.dataset.key] = sel.value;
        UI.toast(`Filters updated — showing ${sel.value}`, 'info');
        renderCurrentPage();
      });
    });
  }
  function selectHtml(key, list, current) {
    return `<select class="filter-select" data-key="${key}" aria-label="${key}">
      ${list.map((v) => `<option value="${v}" ${v === current ? 'selected' : ''}>${v}</option>`).join('')}
    </select>`;
  }

  // ---------------- Routing ----------------
  function navigate(route) {
    if (!RENDERERS[route]) return;
    state.route = route;
    location.hash = route;
    renderSidebar();
    renderTopbar();
    closeMobileSidebar();
    renderCurrentPage();
  }

  async function renderCurrentPage() {
    const container = document.getElementById('page-content');
    container.innerHTML = UI.skeletonCards(3) + `<div class="mt-4">${UI.skeletonBlock('280px')}</div>`;
    try {
      await RENDERERS[state.route]();
    } catch (err) {
      console.error(err);
      container.innerHTML = UI.emptyState('fa-triangle-exclamation', 'Something went wrong', err.message || 'Please try again.');
      UI.toast('Failed to load this page', 'danger');
    }
  }

  function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
  }

  // ---------------- Notifications ----------------
  async function loadNotifications() {
    const dash = await ApiService.getDashboardAnalytics(getFilters());
    const notifs = [
      { icon: 'fa-bullseye', color: 'danger', text: `CO3 attainment is below target`, time: 'Today' },
      { icon: 'fa-user-clock', color: 'warning', text: `${dash.kpis.atRiskStudents} students are currently at risk`, time: 'Today' },
      { icon: 'fa-file-circle-check', color: 'success', text: 'New report generated successfully', time: 'Yesterday' },
      { icon: 'fa-arrow-trend-up', color: 'info', text: 'Class average performance improved since last assessment', time: '2 days ago' },
    ];
    const list = document.getElementById('notif-list');
    if (list) {
      list.innerHTML = notifs.map((n) => `
        <div style="display:flex;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border);">
          <i class="fa-solid ${n.icon}" style="color:var(--${n.color});margin-top:2px;width:16px;"></i>
          <div><div style="font-size:12.5px;color:var(--text);">${n.text}</div><div style="font-size:11px;color:var(--text-faint);">${n.time}</div></div>
        </div>`).join('');
    }
  }

  function toggleNotifDropdown() {
    const dd = document.getElementById('notif-dropdown');
    dd.classList.toggle('hidden');
    document.getElementById('profile-dropdown').classList.add('hidden');
  }
  function toggleProfileDropdown() {
    const dd = document.getElementById('profile-dropdown');
    dd.classList.toggle('hidden');
    document.getElementById('notif-dropdown').classList.add('hidden');
  }

  // ---------------- Command palette (Ctrl+K) ----------------
  const CMDK_ITEMS = Object.keys(PAGE_TITLES).map((id) => ({ id, label: PAGE_TITLES[id] }));
  let cmdkActive = 0;
  function openCommandPalette() {
    const html = `
      <div style="padding:12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">
        <i class="fa-solid fa-magnifying-glass" style="color:var(--text-faint);"></i>
        <input id="cmdk-input" class="text-input" style="border:none;padding:4px;" placeholder="Jump to a page… (Dashboard, Reports, Settings)" autofocus />
        <span style="font-size:11px;color:var(--text-faint);border:1px solid var(--border);padding:1px 6px;border-radius:4px;">Esc</span>
      </div>
      <div id="cmdk-results" style="padding:6px;max-height:320px;overflow-y:auto;"></div>`;
    const overlay = UI.openModal(html, { width: '520px' });
    overlay.querySelector('.modal-panel').style.marginTop = '-30vh';
    const input = document.getElementById('cmdk-input');
    input.focus();
    renderCmdkResults('');
    input.addEventListener('input', () => { cmdkActive = 0; renderCmdkResults(input.value); });
    input.addEventListener('keydown', (e) => {
      const results = document.querySelectorAll('.cmdk-item');
      if (e.key === 'ArrowDown') { e.preventDefault(); cmdkActive = Math.min(cmdkActive + 1, results.length - 1); paintCmdkActive(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); cmdkActive = Math.max(cmdkActive - 1, 0); paintCmdkActive(); }
      if (e.key === 'Enter' && results[cmdkActive]) { navigate(results[cmdkActive].dataset.id); UI.closeOverlay(); }
    });
  }
  function renderCmdkResults(query) {
    const filtered = CMDK_ITEMS.filter((it) => it.label.toLowerCase().includes(query.toLowerCase()));
    const box = document.getElementById('cmdk-results');
    box.innerHTML = filtered.length ? filtered.map((it, i) => `
      <div class="cmdk-item ${i === 0 ? 'active' : ''}" data-id="${it.id}"><i class="fa-solid fa-arrow-right" style="width:14px;color:var(--text-faint);margin-right:8px;"></i>${it.label}</div>
    `).join('') : UI.emptyState('fa-magnifying-glass', 'No matches', 'Try a different search term.');
    box.querySelectorAll('.cmdk-item').forEach((el) => el.addEventListener('click', () => { navigate(el.dataset.id); UI.closeOverlay(); }));
  }
  function paintCmdkActive() {
    document.querySelectorAll('.cmdk-item').forEach((el, i) => el.classList.toggle('active', i === cmdkActive));
  }

  // ---------------- Init ----------------
  async function init() {
    applyTheme();
    renderSidebar();
    await renderTopbar();
    loadNotifications();

    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('mobile-open');
    });
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('notif-btn').addEventListener('click', toggleNotifDropdown);
    document.getElementById('profile-btn').addEventListener('click', toggleProfileDropdown);
    document.getElementById('search-btn').addEventListener('click', openCommandPalette);
    document.getElementById('logout-btn').addEventListener('click', () => UI.toast('Signed out (demo only — no backend session exists yet).', 'info'));

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#notif-btn') && !e.target.closest('#notif-dropdown')) document.getElementById('notif-dropdown').classList.add('hidden');
      if (!e.target.closest('#profile-btn') && !e.target.closest('#profile-dropdown')) document.getElementById('profile-dropdown').classList.add('hidden');
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCommandPalette(); }
    });

    const initialRoute = (location.hash || '').replace('#', '') || 'dashboard';
    state.route = RENDERERS[initialRoute] ? initialRoute : 'dashboard';
    renderSidebar();
    renderCurrentPage();
  }

  global.App = { navigate, getFilters, state };
  document.addEventListener('DOMContentLoaded', init);
})(window);
