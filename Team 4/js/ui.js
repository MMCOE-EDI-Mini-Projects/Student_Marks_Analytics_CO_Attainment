/**
 * ui.js - shared, reusable UI primitives used across all pages.
 */
(function (global) {
  'use strict';

  // ---------------- Toasts ----------------
  const ICONS = { success: 'fa-circle-check', danger: 'fa-circle-exclamation', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
  const COLORS = { success: 'var(--success)', danger: 'var(--danger)', warning: 'var(--warning)', info: 'var(--primary)' };

  function toast(message, type) {
    type = type || 'info';
    const region = document.getElementById('toast-region');
    if (!region) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = `<i class="fa-solid ${ICONS[type]}" style="color:${COLORS[type]};margin-top:2px;"></i><span>${escapeHtml(message)}</span>`;
    region.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .25s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 250);
    }, 3600);
  }

  // ---------------- Escaping ----------------
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------------- Modal ----------------
  function openModal(innerHtml, opts) {
    opts = opts || {};
    closeOverlay();
    const backdrop = document.createElement('div');
    backdrop.className = 'overlay-backdrop';
    backdrop.id = 'active-overlay';
    backdrop.innerHTML = `<div class="modal-panel" style="width:${opts.width || '640px'};max-width:94vw;" role="dialog" aria-modal="true">${innerHtml}</div>`;
    backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop && !opts.persistent) closeOverlay(); });
    document.body.appendChild(backdrop);
    document.addEventListener('keydown', escCloseHandler);
    return backdrop;
  }

  // ---------------- Drawer ----------------
  function openDrawer(innerHtml) {
    closeOverlay();
    const backdrop = document.createElement('div');
    backdrop.className = 'overlay-backdrop drawer-backdrop';
    backdrop.id = 'active-overlay';
    backdrop.innerHTML = `<div class="drawer-panel" role="dialog" aria-modal="true">${innerHtml}</div>`;
    backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) closeOverlay(); });
    document.body.appendChild(backdrop);
    document.addEventListener('keydown', escCloseHandler);
    return backdrop;
  }

  function escCloseHandler(e) { if (e.key === 'Escape') closeOverlay(); }

  function closeOverlay() {
    const el = document.getElementById('active-overlay');
    if (el) el.remove();
    document.removeEventListener('keydown', escCloseHandler);
  }

  // ---------------- Skeletons ----------------
  function skeletonBlock(height, width) {
    return `<div class="skel" style="height:${height || '16px'};width:${width || '100%'};"></div>`;
  }
  function skeletonCards(n) {
    let html = '<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">';
    for (let i = 0; i < n; i++) {
      html += `<div class="card card-pad">${skeletonBlock('14px', '50%')}<div class="mt-3">${skeletonBlock('28px', '70%')}</div><div class="mt-2">${skeletonBlock('12px', '40%')}</div></div>`;
    }
    return html + '</div>';
  }

  // ---------------- Empty state ----------------
  function emptyState(icon, title, subtitle) {
    return `<div class="empty-state"><i class="fa-solid ${icon}"></i><div style="font-weight:600;color:var(--text);margin-bottom:4px;">${escapeHtml(title)}</div><div style="font-size:12.5px;">${escapeHtml(subtitle || '')}</div></div>`;
  }

  // ---------------- Chart color helpers (dark-mode aware) ----------------
  function chartTextColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#5b6b82';
  }
  function chartGridColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#e3e8f0';
  }
  const palette = {
    primary: '#1c4ed8', primaryLight: '#7da2f0',
    teal: '#0f766e', tealLight: '#7fd6cd',
    success: '#17803d', warning: '#b45309', danger: '#b3261e',
    slate: '#5b6b82',
  };

  function statusColor(status) {
    if (status === 'Achieved' || status === 'Excellent' || status === 'Pass') return 'success';
    if (status === 'Near Target' || status === 'Good' || status === 'Average') return 'warning';
    return 'danger';
  }
  function badgeFor(label) {
    const map = { Achieved: 'success', 'Near Target': 'warning', 'Below Target': 'danger',
      Excellent: 'success', Good: 'info', Average: 'warning', 'At Risk': 'danger',
      'A+': 'success', A: 'success', 'B+': 'info', B: 'info', C: 'warning', D: 'warning', F: 'danger' };
    return `<span class="badge badge-${map[label] || 'neutral'}">${escapeHtml(label)}</span>`;
  }

  function trendBadge(direction, delta, goodDirectionIsUp) {
    goodDirectionIsUp = goodDirectionIsUp !== false;
    const isGood = (direction === 'up' && goodDirectionIsUp) || (direction === 'down' && !goodDirectionIsUp);
    const cls = direction === 'flat' ? 'badge-neutral' : (isGood ? 'badge-success' : 'badge-danger');
    const icon = direction === 'up' ? 'fa-arrow-up' : direction === 'down' ? 'fa-arrow-down' : 'fa-minus';
    return `<span class="badge ${cls}"><i class="fa-solid ${icon}" style="font-size:9px;"></i>${delta}%</span>`;
  }

  function debounce(fn, wait) {
    let t;
    return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
  }

  global.UI = {
    toast, escapeHtml, openModal, openDrawer, closeOverlay,
    skeletonBlock, skeletonCards, emptyState,
    chartTextColor, chartGridColor, palette, statusColor, badgeFor, trendBadge, debounce,
  };
})(window);
