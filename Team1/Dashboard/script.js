document.addEventListener('DOMContentLoaded', () => {
  // Navigation Routing
  const navItems = document.querySelectorAll('.nav-item');
  const viewSections = document.querySelectorAll('.view-section');
  const currentPageText = document.getElementById('current-page-text');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');

      navItems.forEach(nav => nav.classList.remove('active'));
      viewSections.forEach(section => section.classList.remove('active'));

      item.classList.add('active');
      const targetSection = document.getElementById(targetTab);
      if (targetSection) {
        targetSection.classList.add('active');
      }
      currentPageText.innerText = item.innerText.trim();
    });
  });

  // Login Authentication Flow
  const loginForm = document.getElementById('login-form');
  const loginScreen = document.getElementById('login-screen');
  const logoutBtn = document.getElementById('logout-btn');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const role = document.getElementById('role-select').value;
      const email = document.getElementById('login-email').value;

      document.getElementById('user-name').innerText = (role === 'Student') ? 'Arun Pillai' : 'Dr. Admin';
      document.getElementById('user-email').innerText = email;
      document.getElementById('user-avatar').innerText = (role === 'Student') ? 'AP' : 'DA';

      loginScreen.style.display = 'none';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      loginScreen.style.display = 'flex';
    });
  }

  // Dynamic Matrix Select Class Switcher
  const matrixSelects = document.querySelectorAll('.matrix-select');
  matrixSelects.forEach(select => {
    select.addEventListener('change', (e) => {
      const val = e.target.value;
      e.target.className = `matrix-select m-${val}`;
    });
  });

  // Save Matrix Notification
  const saveMatrixBtn = document.getElementById('save-matrix-btn');
  if (saveMatrixBtn) {
    saveMatrixBtn.addEventListener('click', () => {
      alert('CO-PO Attainment Matrix saved successfully!');
    });
  }

  // Initialize Charts
  initCharts();
});

function initCharts() {
  // CO Attainment Bar Chart
  const ctx1 = document.getElementById('coAttainmentChart');
  if (ctx1) {
    new Chart(ctx1.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'CO6'],
        datasets: [
          { label: 'Target', data: [80, 80, 80, 80, 80, 80], backgroundColor: '#E2E8F0' },
          { label: 'Attained', data: [72, 65, 84, 68, 90, 70], backgroundColor: '#2563EB' }
        ]
      },
      options: { responsive: true, scales: { y: { max: 100 } } }
    });
  }

  // Performance Trend Line Chart
  const ctx2 = document.getElementById('performanceChart');
  if (ctx2) {
    new Chart(ctx2.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Pass Rate %',
          data: [75, 78, 74, 82, 85, 80],
          borderColor: '#10B981',
          tension: 0.3,
          fill: false
        }]
      },
      options: { responsive: true, scales: { y: { max: 100 } } }
    });
  }

  // Grade Distribution Donut Chart
  const ctx3 = document.getElementById('gradeDistributionChart');
  if (ctx3) {
    new Chart(ctx3.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['O Grade', 'A+ Grade', 'A Grade', 'B Grade', 'Fail'],
        datasets: [{
          data: [25, 40, 20, 10, 5],
          backgroundColor: ['#10B981', '#2563EB', '#3B82F6', '#F59E0B', '#EF4444']
        }]
      },
      options: { responsive: true }
    });
  }

  // PO Attainment Horizontal Bar Chart
  const ctx4 = document.getElementById('poAttainmentChart');
  if (ctx4) {
    new Chart(ctx4.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6'],
        datasets: [{
          label: 'Attainment Level',
          data: [2.8, 2.4, 1.9, 2.7, 2.2, 2.9],
          backgroundColor: '#2563EB'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: { x: { max: 3 } }
      }
    });
  }
}