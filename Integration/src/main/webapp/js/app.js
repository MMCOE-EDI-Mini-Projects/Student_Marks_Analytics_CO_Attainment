// OBE Management System - Core SPA Router & API Client

let currentUser = null;
let currentCsrfToken = "";
let currentViewLoader = null;

document.addEventListener("DOMContentLoaded", () => {
    checkCurrentSession();
});

function getContextPath() {
    let path = window.location.pathname;
    if (path.endsWith('.html') || path.endsWith('.htm') || path.endsWith('.jsp')) {
        path = path.substring(0, path.lastIndexOf('/'));
    }
    if (path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    return path;
}

function getApiUrl(endpoint) {
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
        return endpoint;
    }
    const context = getContextPath();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    return context + cleanEndpoint;
}

function checkCurrentSession() {
    fetchAPI("/api/auth/me", "GET", null, true)
        .then(res => {
            if (res && res.status === "success") {
                currentUser = res.data;
                currentCsrfToken = res.data.csrfToken || "";
                renderAppShell();
            } else {
                showAuthContainer();
            }
        })
        .catch(() => {
            showAuthContainer();
        });
}

function fetchAPI(endpoint, method = "GET", data = null, silent401 = false) {
    const url = getApiUrl(endpoint);
    const options = {
        method: method,
        credentials: "same-origin",
        headers: {
            "Accept": "application/json"
        }
    };

    if (currentCsrfToken) {
        options.headers["X-CSRF-Token"] = currentCsrfToken;
    }

    if (data) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(data);
    }

    return fetch(url, options)
        .then(response => {
            if (response.status === 401) {
                const wasLoggedIn = currentUser != null;
                currentUser = null;
                currentCsrfToken = "";
                showAuthContainer();
                
                if (!silent401 && wasLoggedIn) {
                    showToast("Session expired. Please login again.", "error");
                }
                return { status: "unauthenticated", message: "Not authenticated" };
            }
            return response.json();
        });
}

function handleLoginSubmit(event) {
    event.preventDefault();
    const usernameInput = document.getElementById("login-username").value.trim();
    const passwordInput = document.getElementById("login-password").value.trim();

    if (!usernameInput || !passwordInput) {
        showToast("Please enter username and password", "error");
        return;
    }

    fetchAPI("/api/auth/login", "POST", { username: usernameInput, password: passwordInput })
        .then(res => {
            if (res && res.status === "success") {
                currentUser = res.data;
                currentCsrfToken = res.data.csrfToken || "";
                showToast("Welcome back, " + currentUser.fullName, "success");
                renderAppShell();
            } else {
                showToast((res && res.message) ? res.message : "Invalid username or password", "error");
            }
        })
        .catch(err => {
            showToast("Login failed. Check server connection.", "error");
        });
}

function handleLogout() {
    fetchAPI("/api/auth/logout", "POST")
        .then(() => {
            currentUser = null;
            currentCsrfToken = "";
            showAuthContainer();
            showToast("Logged out successfully", "success");
        });
}

function showAuthContainer() {
    document.getElementById("auth-container").classList.remove("hidden");
    document.getElementById("app-container").classList.add("hidden");
}

function renderAppShell() {
    document.getElementById("auth-container").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");

    // Update Sidebar User Info
    document.getElementById("user-display-name").innerText = currentUser.fullName;
    document.getElementById("user-role-tag").innerText = currentUser.role;
    document.getElementById("user-avatar").innerText = currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "U";

    renderSidebarNav();
}

function setActiveNav(navId) {
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });
    const target = document.getElementById(navId);
    if (target) {
        target.classList.add("active");
    }
}

function refreshCurrentView() {
    if (typeof currentViewLoader === "function") {
        currentViewLoader();
    }
}

function renderSidebarNav() {
    const nav = document.getElementById("sidebar-nav");
    nav.innerHTML = "";

    if (currentUser.role === "ADMIN") {
        nav.innerHTML = `
            <a href="javascript:void(0)" id="nav-admin-dashboard" class="nav-item active" onclick="loadAdminDashboard()"><i class="fa-solid fa-chart-line"></i> Dashboard</a>
            <a href="javascript:void(0)" id="nav-admin-departments" class="nav-item" onclick="loadDepartmentsView()"><i class="fa-solid fa-building"></i> Departments</a>
            <a href="javascript:void(0)" id="nav-admin-classes" class="nav-item" onclick="loadClassesView()"><i class="fa-solid fa-chalkboard"></i> Classes</a>
            <a href="javascript:void(0)" id="nav-admin-subjects" class="nav-item" onclick="loadSubjectsView()"><i class="fa-solid fa-book"></i> Subjects</a>
            <a href="javascript:void(0)" id="nav-admin-faculty" class="nav-item" onclick="loadFacultyView()"><i class="fa-solid fa-chalkboard-user"></i> Faculty</a>
            <a href="javascript:void(0)" id="nav-admin-students" class="nav-item" onclick="loadStudentsView()"><i class="fa-solid fa-user-graduate"></i> Students</a>
            <a href="javascript:void(0)" id="nav-admin-assignments" class="nav-item" onclick="loadAssignmentsView()"><i class="fa-solid fa-link"></i> Faculty Assignment</a>
            <a href="javascript:void(0)" id="nav-admin-copo" class="nav-item" onclick="loadCoPoMatrixView()"><i class="fa-solid fa-table-cells"></i> CO-PO Mapping</a>
            <a href="javascript:void(0)" id="nav-admin-users" class="nav-item" onclick="loadUserManagementView()"><i class="fa-solid fa-users-gear"></i> User Management</a>
            <a href="javascript:void(0)" id="nav-admin-rules" class="nav-item" onclick="loadAttainmentConfigView()"><i class="fa-solid fa-sliders"></i> Attainment Rules</a>
        `;
        loadAdminDashboard();
    } else if (currentUser.role === "FACULTY") {
        nav.innerHTML = `
            <a href="javascript:void(0)" id="nav-faculty-dashboard" class="nav-item active" onclick="loadFacultyDashboard()"><i class="fa-solid fa-chart-line"></i> Dashboard</a>
            <a href="javascript:void(0)" id="nav-faculty-subjects" class="nav-item" onclick="loadFacultyMySubjectsView()"><i class="fa-solid fa-book-open"></i> My Subjects</a>
            <a href="javascript:void(0)" id="nav-faculty-assessments" class="nav-item" onclick="loadFacultyAssessmentsView()"><i class="fa-solid fa-pen-to-square"></i> Assessments</a>
            <a href="javascript:void(0)" id="nav-faculty-marks" class="nav-item" onclick="loadFacultyMarksView()"><i class="fa-solid fa-file-signature"></i> Marks Entry</a>
            <a href="javascript:void(0)" id="nav-faculty-quizzes" class="nav-item" onclick="loadFacultyQuizzesView()"><i class="fa-solid fa-clipboard-question"></i> Quizzes</a>
            <a href="javascript:void(0)" id="nav-faculty-attendance" class="nav-item" onclick="loadFacultyAttendanceView()"><i class="fa-solid fa-calendar-check"></i> Attendance</a>
            <a href="javascript:void(0)" id="nav-faculty-cos" class="nav-item" onclick="loadFacultyCOsView()"><i class="fa-solid fa-list-check"></i> Course Outcomes</a>
            <a href="javascript:void(0)" id="nav-faculty-attainment" class="nav-item" onclick="loadFacultyAttainmentView()"><i class="fa-solid fa-bullseye"></i> CO Attainment</a>
            <a href="javascript:void(0)" id="nav-faculty-reports" class="nav-item" onclick="loadFacultyReportsView()"><i class="fa-solid fa-file-invoice"></i> Class Reports</a>
        `;
        loadFacultyDashboard();
    } else if (currentUser.role === "STUDENT") {
        nav.innerHTML = `
            <a href="javascript:void(0)" id="nav-student-dashboard" class="nav-item active" onclick="loadStudentDashboard()"><i class="fa-solid fa-house"></i> Dashboard</a>
            <a href="javascript:void(0)" id="nav-student-profile" class="nav-item" onclick="loadStudentProfileView()"><i class="fa-solid fa-id-card"></i> My Profile</a>
            <a href="javascript:void(0)" id="nav-student-subjects" class="nav-item" onclick="loadStudentSubjectsView()"><i class="fa-solid fa-book"></i> My Subjects</a>
            <a href="javascript:void(0)" id="nav-student-assessments" class="nav-item" onclick="loadStudentAssessmentsView()"><i class="fa-solid fa-clipboard-list"></i> My Assessment</a>
            <a href="javascript:void(0)" id="nav-student-marks" class="nav-item" onclick="loadStudentMarksView()"><i class="fa-solid fa-file-signature"></i> My Marks</a>
            <a href="javascript:void(0)" id="nav-student-quizzes" class="nav-item" onclick="loadStudentQuizzesView()"><i class="fa-solid fa-clipboard-question"></i> Quizzes</a>
            <a href="javascript:void(0)" id="nav-student-coattainment" class="nav-item" onclick="loadStudentCoAttainmentView()"><i class="fa-solid fa-bullseye"></i> CO Attainment</a>
            <a href="javascript:void(0)" id="nav-student-poattainment" class="nav-item" onclick="loadStudentPoAttainmentView()"><i class="fa-solid fa-chart-pie"></i> PO Attainment</a>
            <a href="javascript:void(0)" id="nav-student-attendance" class="nav-item" onclick="loadStudentAttendanceView()"><i class="fa-solid fa-calendar-days"></i> Attendance</a>
            <a href="javascript:void(0)" id="nav-student-reports" class="nav-item" onclick="loadStudentReportsView()"><i class="fa-solid fa-file-arrow-down"></i> Reports</a>
            <a href="javascript:void(0)" id="nav-student-settings" class="nav-item" onclick="loadStudentSettingsView()"><i class="fa-solid fa-gear"></i> Settings</a>
        `;
        loadStudentDashboard();
    }
}

function fillDemo(username, password) {
    document.getElementById("login-username").value = username;
    document.getElementById("login-password").value = password;
}

function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

function openModal(title, bodyHtml) {
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-body").innerHTML = bodyHtml;
    document.getElementById("modal-backdrop").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal-backdrop").classList.add("hidden");
}

function showForgotPasswordModal() {
    const html = `
        <form onsubmit="handleForgotPasswordSubmit(event)">
            <div class="form-group">
                <label>Enter Registered Email</label>
                <input type="email" id="forgot-email" required placeholder="name@college.edu">
            </div>
            <button type="submit" class="btn btn-primary btn-block">Generate Reset Link</button>
        </form>
    `;
    openModal("Forgot Password", html);
}

function handleForgotPasswordSubmit(event) {
    event.preventDefault();
    const email = document.getElementById("forgot-email").value.trim();
    fetchAPI("/api/auth/forgot-password", "POST", { email: email })
        .then(res => {
            if (res && res.status === "success") {
                showToast("Token generated! Token: " + res.data.resetToken, "success");
                showResetPasswordModal(res.data.resetToken);
            } else {
                showToast((res && res.message) ? res.message : "Error generating token", "error");
            }
        });
}

function showResetPasswordModal(token = "") {
    const html = `
        <form onsubmit="handleResetPasswordSubmit(event)">
            <div class="form-group">
                <label>Reset Token</label>
                <input type="text" id="reset-token" value="${token}" required readonly>
            </div>
            <div class="form-group">
                <label>New Password</label>
                <input type="password" id="reset-new-password" required placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-success btn-block">Update Password</button>
        </form>
    `;
    openModal("Reset Password", html);
}

function handleResetPasswordSubmit(event) {
    event.preventDefault();
    const token = document.getElementById("reset-token").value.trim();
    const newPassword = document.getElementById("reset-new-password").value.trim();

    fetchAPI("/api/auth/reset-password", "POST", { token: token, newPassword: newPassword })
        .then(res => {
            if (res && res.status === "success") {
                showToast("Password reset successfully. Please login.", "success");
                closeModal();
            } else {
                showToast((res && res.message) ? res.message : "Reset failed", "error");
            }
        });
}
