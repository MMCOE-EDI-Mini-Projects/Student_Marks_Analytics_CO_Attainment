// OBE System - Admin Module Components

function loadAdminDashboard() {
    setActiveNav("nav-admin-dashboard");
    currentViewLoader = loadAdminDashboard;
    document.getElementById("page-title").innerText = "Admin Dashboard";
    document.getElementById("page-breadcrumb").innerText = "Home / Admin Dashboard";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue"><i class="fa-solid fa-building"></i></div>
                <div class="stat-details">
                    <h4>Departments</h4>
                    <span id="stat-depts">...</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i class="fa-solid fa-chalkboard"></i></div>
                <div class="stat-details">
                    <h4>Active Classes</h4>
                    <span id="stat-classes">...</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon info" style="background: #e0f2fe; color: #0284c7;"><i class="fa-solid fa-book"></i></div>
                <div class="stat-details">
                    <h4>Total Subjects</h4>
                    <span id="stat-subjects">...</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon amber"><i class="fa-solid fa-chalkboard-user"></i></div>
                <div class="stat-details">
                    <h4>Faculty Members</h4>
                    <span id="stat-faculty">...</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple"><i class="fa-solid fa-user-graduate"></i></div>
                <div class="stat-details">
                    <h4>Enrolled Students</h4>
                    <span id="stat-students">...</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3>Quick System Management</h3>
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="loadDepartmentsView()"><i class="fa-solid fa-building"></i> Manage Departments</button>
                <button class="btn btn-success" onclick="loadClassesView()"><i class="fa-solid fa-chalkboard"></i> Manage Classes</button>
                <button class="btn btn-info" onclick="loadSubjectsView()"><i class="fa-solid fa-book"></i> Configure Subjects</button>
                <button class="btn btn-secondary" onclick="loadFacultyView()"><i class="fa-solid fa-chalkboard-user"></i> Faculty Records</button>
                <button class="btn btn-primary" onclick="loadStudentsView()"><i class="fa-solid fa-user-graduate"></i> Student Records</button>
                <button class="btn btn-warning" style="background: #f59e0b; color: white;" onclick="loadAssignmentsView()"><i class="fa-solid fa-link"></i> Faculty Assignment</button>
                <button class="btn btn-secondary" onclick="loadCoPoMatrixView()"><i class="fa-solid fa-table-cells"></i> CO-PO Mapping</button>
                <button class="btn btn-dark" style="background: #334155; color: white;" onclick="loadUserManagementView()"><i class="fa-solid fa-users-gear"></i> User Management</button>
            </div>
        </div>
    `;

    // Fetch live counts
    fetchAPI("/api/departments").then(res => { if(res && res.data) document.getElementById("stat-depts").innerText = res.data.length; });
    fetchAPI("/api/classes").then(res => { if(res && res.data) document.getElementById("stat-classes").innerText = res.data.length; });
    fetchAPI("/api/subjects").then(res => { if(res && res.data) document.getElementById("stat-subjects").innerText = res.data.length; });
    fetchAPI("/api/users/faculty").then(res => { if(res && res.data) document.getElementById("stat-faculty").innerText = res.data.length; });
    fetchAPI("/api/users/students").then(res => { if(res && res.data) document.getElementById("stat-students").innerText = res.data.length; });
}

// ==========================================
// 1. DEPARTMENTS CRUD
// ==========================================
function loadDepartmentsView() {
    setActiveNav("nav-admin-departments");
    currentViewLoader = loadDepartmentsView;
    document.getElementById("page-title").innerText = "Academic Departments";
    document.getElementById("page-breadcrumb").innerText = "Admin / Departments";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Department List</h3>
                <button class="btn btn-primary" onclick="showAddDepartmentModal()"><i class="fa-solid fa-plus"></i> Add Department</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Department Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="departments-tbody">
                        <tr><td colspan="4">Loading departments...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/departments").then(res => {
        const tbody = document.getElementById("departments-tbody");
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4">No departments found.</td></tr>`;
            return;
        }
        tbody.innerHTML = res.data.map(d => `
            <tr>
                <td><strong>${d.code}</strong></td>
                <td>${d.name}</td>
                <td>${d.description || '-'}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteDepartment(${d.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                </td>
            </tr>
        `).join("");
    });
}

function showAddDepartmentModal() {
    const html = `
        <form onsubmit="handleCreateDepartment(event)">
            <div class="form-group">
                <label>Department Code (e.g. CSE, ECE, MECH)</label>
                <input type="text" id="dept-code" required placeholder="CSE">
            </div>
            <div class="form-group">
                <label>Department Name</label>
                <input type="text" id="dept-name" required placeholder="Computer Science & Engineering">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="dept-desc" rows="3" placeholder="Department overview and focus areas..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Create Department</button>
        </form>
    `;
    openModal("Add Department", html);
}

function handleCreateDepartment(e) {
    e.preventDefault();
    const data = {
        code: document.getElementById("dept-code").value.trim(),
        name: document.getElementById("dept-name").value.trim(),
        description: document.getElementById("dept-desc").value.trim()
    };
    fetchAPI("/api/departments", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Department created successfully", "success");
            closeModal();
            loadDepartmentsView();
        } else {
            showToast((res && res.message) ? res.message : "Error creating department", "error");
        }
    });
}

function deleteDepartment(id) {
    if (confirm("Are you sure you want to delete this department? This will affect related classes and subjects.")) {
        fetchAPI(`/api/departments/${id}`, "DELETE").then(res => {
            if (res && res.status === "success") {
                showToast("Department deleted", "success");
                loadDepartmentsView();
            } else {
                showToast((res && res.message) ? res.message : "Error deleting department", "error");
            }
        });
    }
}

// ==========================================
// 2. CLASSES CRUD (Strict Class Naming)
// ==========================================
function loadClassesView() {
    setActiveNav("nav-admin-classes");
    currentViewLoader = loadClassesView;
    document.getElementById("page-title").innerText = "Academic Classes";
    document.getElementById("page-breadcrumb").innerText = "Admin / Classes";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Class List</h3>
                <button class="btn btn-primary" onclick="showAddClassModal()"><i class="fa-solid fa-plus"></i> Add Class</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Class Name</th>
                            <th>Academic Year</th>
                            <th>Semester</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="classes-tbody">
                        <tr><td colspan="5">Loading classes...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/classes").then(res => {
        const tbody = document.getElementById("classes-tbody");
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">No classes found.</td></tr>`;
            return;
        }
        tbody.innerHTML = res.data.map(c => `
            <tr>
                <td><strong>${c.departmentCode || '-'}</strong></td>
                <td><strong>${c.name}</strong></td>
                <td>${c.academicYear}</td>
                <td>Semester ${c.semester}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteClass(${c.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                </td>
            </tr>
        `).join("");
    });
}

function showAddClassModal() {
    fetchAPI("/api/departments").then(res => {
        const depts = (res && res.data) ? res.data : [];
        const html = `
            <form onsubmit="handleCreateClass(event)">
                <div class="form-group">
                    <label>Department</label>
                    <select id="class-dept" required>
                        ${depts.map(d => `<option value="${d.id}">${d.code} - ${d.name}</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Class Name (e.g. Class 2023-A, TY-CSE-A, Class 2024)</label>
                    <input type="text" id="class-name" required placeholder="Class 2023-A">
                </div>
                <div class="form-group">
                    <label>Academic Year (e.g. 2025-2026)</label>
                    <input type="text" id="class-ay" required placeholder="2025-2026">
                </div>
                <div class="form-group">
                    <label>Semester (1 to 8)</label>
                    <input type="number" id="class-sem" min="1" max="8" value="5" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Create Class</button>
            </form>
        `;
        openModal("Add Academic Class", html);
    });
}

function handleCreateClass(e) {
    e.preventDefault();
    const data = {
        departmentId: parseInt(document.getElementById("class-dept").value),
        name: document.getElementById("class-name").value.trim(),
        academicYear: document.getElementById("class-ay").value.trim(),
        semester: parseInt(document.getElementById("class-sem").value)
    };
    fetchAPI("/api/classes", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Class created successfully", "success");
            closeModal();
            loadClassesView();
        } else {
            showToast((res && res.message) ? res.message : "Error creating class", "error");
        }
    });
}

function showEditClassModal(classId) {
    Promise.all([
        fetchAPI("/api/departments"),
        fetchAPI(`/api/classes/${classId}`)
    ]).then(([dRes, cRes]) => {
        const depts = (dRes && dRes.data) ? dRes.data : [];
        const c = (cRes && cRes.data) ? cRes.data : null;
        if (!c) {
            showToast("Class not found", "error");
            return;
        }

        const html = `
            <form onsubmit="handleUpdateClass(event, ${classId})">
                <div class="form-group">
                    <label>Department</label>
                    <select id="edit-class-dept" required>
                        ${depts.map(d => `<option value="${d.id}" ${d.id === c.departmentId ? 'selected' : ''}>${d.code} - ${d.name}</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Class Name</label>
                    <input type="text" id="edit-class-name" value="${c.name}" required>
                </div>
                <div class="form-group">
                    <label>Academic Year</label>
                    <input type="text" id="edit-class-ay" value="${c.academicYear}" required>
                </div>
                <div class="form-group">
                    <label>Semester (1 to 8)</label>
                    <input type="number" id="edit-class-sem" min="1" max="8" value="${c.semester}" required>
                </div>
                <button type="submit" class="btn btn-success btn-block">Update Class</button>
            </form>
        `;
        openModal("Edit Academic Class", html);
    });
}

function handleUpdateClass(e, classId) {
    e.preventDefault();
    const data = {
        departmentId: parseInt(document.getElementById("edit-class-dept").value),
        name: document.getElementById("edit-class-name").value.trim(),
        academicYear: document.getElementById("edit-class-ay").value.trim(),
        semester: parseInt(document.getElementById("edit-class-sem").value)
    };
    fetchAPI(`/api/classes/${classId}`, "PUT", data).then(res => {
        if (res && res.status === "success") {
            showToast("Class updated successfully", "success");
            closeModal();
            loadClassesView();
        } else {
            showToast((res && res.message) ? res.message : "Error updating class", "error");
        }
    });
}

function deleteClass(id) {
    if (confirm("Are you sure you want to delete this class? All associated enrollments and assignments will be checked.")) {
        fetchAPI(`/api/classes/${id}`, "DELETE").then(res => {
            if (res && res.status === "success") {
                showToast("Class deleted successfully", "success");
                loadClassesView();
            } else {
                showToast((res && res.message) ? res.message : "Error deleting class", "error");
            }
        });
    }
}

// Backward compatibility alias for any legacy triggers
function loadBatchesView() {
    loadClassesView();
}

// ==========================================
// 3. SUBJECTS CRUD & CLASS DEPENDENT DROPDOWNS
// ==========================================
let adminCachedSubjects = [];

function loadSubjectsView() {
    setActiveNav("nav-admin-subjects");
    currentViewLoader = loadSubjectsView;
    document.getElementById("page-title").innerText = "Subjects & Courses";
    document.getElementById("page-breadcrumb").innerText = "Admin / Subjects";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Course Subject List</h3>
                <button class="btn btn-primary" onclick="showAddSubjectModal()"><i class="fa-solid fa-plus"></i> Add Subject</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Subject Name</th>
                            <th>Department</th>
                            <th>Assigned Class</th>
                            <th>Credits</th>
                            <th>Sem</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="subjects-tbody">
                        <tr><td colspan="8">Loading subjects...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/subjects").then(res => {
        const tbody = document.getElementById("subjects-tbody");
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8">No subjects found.</td></tr>`;
            return;
        }
        adminCachedSubjects = res.data;
        tbody.innerHTML = res.data.map(s => `
            <tr>
                <td><strong>${s.code}</strong></td>
                <td>${s.name}</td>
                <td>${s.departmentCode || '-'}</td>
                <td><strong>${s.className || s.batchName || '-'}</strong></td>
                <td>${s.credits} Credits</td>
                <td>Sem ${s.semester}</td>
                <td><span class="badge badge-level-2">${s.subjectType}</span></td>
                <td>
                    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteSubject(${s.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join("");
    });
}

function showAddSubjectModal() {
    Promise.all([
        fetchAPI("/api/departments"),
        fetchAPI("/api/classes")
    ]).then(([dRes, cRes]) => {
        const depts = (dRes && dRes.data) ? dRes.data : [];
        const classes = (cRes && cRes.data) ? cRes.data : [];

        const html = `
            <form onsubmit="handleCreateSubject(event)">
                <div class="form-group">
                    <label>Department</label>
                    <select id="sub-dept" onchange="onSubjectDeptChange(this.value)" required>
                        <option value="">Select Department</option>
                        ${depts.map(d => `<option value="${d.id}">${d.code} - ${d.name}</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Class (Assigned Class)</label>
                    <select id="sub-class" required>
                        <option value="">Select Class</option>
                        ${classes.map(c => `<option value="${c.id}">${c.name} (${c.departmentCode || ''} - Sem ${c.semester})</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Subject Code</label>
                    <input type="text" id="sub-code" required placeholder="CS501">
                </div>
                <div class="form-group">
                    <label>Subject Name</label>
                    <input type="text" id="sub-name" required placeholder="Database Management Systems">
                </div>
                <div style="display: flex; gap: 15px;">
                    <div class="form-group" style="flex: 1;">
                        <label>Credits</label>
                        <input type="number" id="sub-credits" min="1" max="10" value="4" required>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Semester</label>
                        <input type="number" id="sub-sem" min="1" max="8" value="5" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Subject Type</label>
                    <select id="sub-type">
                        <option value="THEORY">Theory</option>
                        <option value="PRACTICAL">Practical / Lab</option>
                        <option value="HYBRID">Hybrid</option>
                        <option value="PROJECT">Project Work</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Create Subject</button>
            </form>
        `;
        openModal("Add Subject", html);
    });
}

function onSubjectDeptChange(deptId) {
    const classSelect = document.getElementById("sub-class") || document.getElementById("edit-sub-class");
    if (!classSelect) return;
    if (!deptId) {
        classSelect.innerHTML = `<option value="">Select Class</option>`;
        return;
    }
    fetchAPI(`/api/classes?departmentId=${deptId}`).then(res => {
        if (res && res.data) {
            classSelect.innerHTML = res.data.map(c => `<option value="${c.id}">${c.name} (Sem ${c.semester} - AY ${c.academicYear})</option>`).join("");
        }
    });
}

function handleCreateSubject(e) {
    e.preventDefault();
    const classVal = document.getElementById("sub-class").value;
    const data = {
        departmentId: parseInt(document.getElementById("sub-dept").value),
        classId: parseInt(classVal),
        batchId: parseInt(classVal),
        code: document.getElementById("sub-code").value.trim(),
        name: document.getElementById("sub-name").value.trim(),
        credits: parseInt(document.getElementById("sub-credits").value),
        semester: parseInt(document.getElementById("sub-sem").value),
        subjectType: document.getElementById("sub-type").value
    };
    fetchAPI("/api/subjects", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Subject created successfully", "success");
            closeModal();
            loadSubjectsView();
        } else {
            showToast((res && res.message) ? res.message : "Error creating subject", "error");
        }
    });
}

function showEditSubjectModal(id) {
    Promise.all([
        fetchAPI(`/api/subjects/${id}`),
        fetchAPI("/api/departments"),
        fetchAPI("/api/classes")
    ]).then(([sRes, dRes, cRes]) => {
        const s = (sRes && sRes.data) ? sRes.data : null;
        if (!s) {
            showToast("Subject not found", "error");
            return;
        }
        const depts = (dRes && dRes.data) ? dRes.data : [];
        const classes = (cRes && cRes.data) ? cRes.data : [];
        const currentClassId = s.classId || s.batchId;

        const html = `
            <form onsubmit="handleUpdateSubject(event, ${id})">
                <div class="form-group">
                    <label>Department</label>
                    <select id="edit-sub-dept" onchange="onSubjectDeptChange(this.value)" required>
                        ${depts.map(d => `<option value="${d.id}" ${d.id === s.departmentId ? 'selected' : ''}>${d.code} - ${d.name}</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Class (Assigned Class)</label>
                    <select id="edit-sub-class" required>
                        ${classes.map(c => `<option value="${c.id}" ${c.id === currentClassId ? 'selected' : ''}>${c.name} (${c.departmentCode || ''} - Sem ${c.semester})</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Subject Code</label>
                    <input type="text" id="edit-sub-code" value="${s.code}" required>
                </div>
                <div class="form-group">
                    <label>Subject Name</label>
                    <input type="text" id="edit-sub-name" value="${s.name}" required>
                </div>
                <div style="display: flex; gap: 15px;">
                    <div class="form-group" style="flex: 1;">
                        <label>Credits</label>
                        <input type="number" id="edit-sub-credits" min="1" max="10" value="${s.credits}" required>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Semester</label>
                        <input type="number" id="edit-sub-sem" min="1" max="8" value="${s.semester}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Subject Type</label>
                    <select id="edit-sub-type">
                        <option value="THEORY" ${s.subjectType === 'THEORY' ? 'selected' : ''}>Theory</option>
                        <option value="PRACTICAL" ${s.subjectType === 'PRACTICAL' ? 'selected' : ''}>Practical / Lab</option>
                        <option value="HYBRID" ${s.subjectType === 'HYBRID' ? 'selected' : ''}>Hybrid</option>
                        <option value="PROJECT" ${s.subjectType === 'PROJECT' ? 'selected' : ''}>Project Work</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-success btn-block">Update Subject</button>
            </form>
        `;
        openModal("Edit Subject", html);
    });
}

function handleUpdateSubject(e, id) {
    e.preventDefault();
    const classVal = document.getElementById("edit-sub-class").value;
    const data = {
        departmentId: parseInt(document.getElementById("edit-sub-dept").value),
        classId: parseInt(classVal),
        batchId: parseInt(classVal),
        code: document.getElementById("edit-sub-code").value.trim(),
        name: document.getElementById("edit-sub-name").value.trim(),
        credits: parseInt(document.getElementById("edit-sub-credits").value),
        semester: parseInt(document.getElementById("edit-sub-sem").value),
        subjectType: document.getElementById("edit-sub-type").value
    };
    fetchAPI(`/api/subjects/${id}`, "PUT", data).then(res => {
        if (res && res.status === "success") {
            showToast("Subject updated successfully", "success");
            closeModal();
            loadSubjectsView();
        } else {
            showToast((res && res.message) ? res.message : "Error updating subject", "error");
        }
    });
}

function deleteSubject(id) {
    if (confirm("Are you sure you want to delete this subject? This will remove related assessments and CO mappings.")) {
        fetchAPI(`/api/subjects/${id}`, "DELETE").then(res => {
            if (res && res.status === "success") {
                showToast("Subject deleted successfully", "success");
                loadSubjectsView();
            } else {
                showToast((res && res.message) ? res.message : "Error deleting subject", "error");
            }
        });
    }
}

// ==========================================
// 4. FACULTY USERS CRUD
// ==========================================
let adminCachedFaculty = [];

function loadFacultyView() {
    setActiveNav("nav-admin-faculty");
    currentViewLoader = loadFacultyView;
    document.getElementById("page-title").innerText = "Faculty User Accounts";
    document.getElementById("page-breadcrumb").innerText = "Admin / Faculty";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Faculty Members</h3>
                <button class="btn btn-primary" onclick="showAddFacultyModal()"><i class="fa-solid fa-plus"></i> Add Faculty User</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="faculty-tbody">
                        <tr><td colspan="7">Loading faculty...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/users/faculty").then(res => {
        const tbody = document.getElementById("faculty-tbody");
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7">No faculty found.</td></tr>`;
            return;
        }
        adminCachedFaculty = res.data;
        tbody.innerHTML = res.data.map(f => `
            <tr>
                <td><strong>${f.username}</strong></td>
                <td>${f.fullName}</td>
                <td>${f.email}</td>
                <td>${f.departmentCode || '-'}</td>
                <td>${f.designation || '-'}</td>
                <td>${f.phone || '-'}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteFaculty(${f.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                </td>
            </tr>
        `).join("");
    });
}

function showAddFacultyModal() {
    fetchAPI("/api/departments").then(res => {
        const depts = (res && res.data) ? res.data : [];
        const html = `
            <form onsubmit="handleCreateFaculty(event)">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="fac-username" required placeholder="dr.smith">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="fac-password" required placeholder="••••••••">
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="fac-email" required placeholder="smith@college.edu">
                </div>
                <div style="display: flex; gap: 15px;">
                    <div class="form-group" style="flex: 1;">
                        <label>First Name</label>
                        <input type="text" id="fac-fname" required placeholder="John">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Last Name</label>
                        <input type="text" id="fac-lname" required placeholder="Smith">
                    </div>
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <select id="fac-dept" required>
                        ${depts.map(d => `<option value="${d.id}">${d.code} - ${d.name}</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Designation</label>
                    <input type="text" id="fac-desig" value="Assistant Professor" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="fac-phone" placeholder="9876543210">
                </div>
                <button type="submit" class="btn btn-primary btn-block">Create Faculty User</button>
            </form>
        `;
        openModal("Add Faculty User", html);
    });
}

function handleCreateFaculty(e) {
    e.preventDefault();
    const data = {
        username: document.getElementById("fac-username").value.trim(),
        password: document.getElementById("fac-password").value.trim(),
        email: document.getElementById("fac-email").value.trim(),
        firstName: document.getElementById("fac-fname").value.trim(),
        lastName: document.getElementById("fac-lname").value.trim(),
        departmentId: parseInt(document.getElementById("fac-dept").value),
        designation: document.getElementById("fac-desig").value.trim(),
        phone: document.getElementById("fac-phone").value.trim()
    };
    fetchAPI("/api/users/faculty", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Faculty created successfully", "success");
            closeModal();
            loadFacultyView();
        } else {
            showToast((res && res.message) ? res.message : "Error creating faculty", "error");
        }
    });
}

function showEditFacultyModal(userId) {
    const f = adminCachedFaculty.find(fac => fac.id === userId);
    if (!f) {
        showToast("Faculty details not found", "error");
        return;
    }

    fetchAPI("/api/departments").then(res => {
        const depts = (res && res.data) ? res.data : [];
        const html = `
            <form onsubmit="handleUpdateFaculty(event, ${userId})">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="edit-fac-username" value="${f.username}" required>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="edit-fac-email" value="${f.email}" required>
                </div>
                <div style="display: flex; gap: 15px;">
                    <div class="form-group" style="flex: 1;">
                        <label>First Name</label>
                        <input type="text" id="edit-fac-fname" value="${f.firstName}" required>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Last Name</label>
                        <input type="text" id="edit-fac-lname" value="${f.lastName}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <select id="edit-fac-dept" required>
                        ${depts.map(d => `<option value="${d.id}" ${d.id === f.departmentId ? 'selected' : ''}>${d.code} - ${d.name}</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Designation</label>
                    <input type="text" id="edit-fac-desig" value="${f.designation || ''}" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="edit-fac-phone" value="${f.phone || ''}">
                </div>
                <button type="submit" class="btn btn-success btn-block">Update Faculty</button>
            </form>
        `;
        openModal("Edit Faculty User", html);
    });
}

function handleUpdateFaculty(e, userId) {
    e.preventDefault();
    const data = {
        username: document.getElementById("edit-fac-username").value.trim(),
        email: document.getElementById("edit-fac-email").value.trim(),
        firstName: document.getElementById("edit-fac-fname").value.trim(),
        lastName: document.getElementById("edit-fac-lname").value.trim(),
        departmentId: parseInt(document.getElementById("edit-fac-dept").value),
        designation: document.getElementById("edit-fac-desig").value.trim(),
        phone: document.getElementById("edit-fac-phone").value.trim()
    };
    fetchAPI(`/api/users/faculty/${userId}`, "PUT", data).then(res => {
        if (res && res.status === "success") {
            showToast("Faculty updated successfully", "success");
            closeModal();
            loadFacultyView();
        } else {
            showToast((res && res.message) ? res.message : "Error updating faculty", "error");
        }
    });
}

function deleteFaculty(userId) {
    if (confirm("Are you sure you want to delete this faculty member? Assigned courses will be detached.")) {
        fetchAPI(`/api/users/faculty/${userId}`, "DELETE").then(res => {
            if (res && res.status === "success") {
                showToast("Faculty deleted successfully", "success");
                loadFacultyView();
            } else {
                showToast((res && res.message) ? res.message : "Error deleting faculty", "error");
            }
        });
    }
}

// ==========================================
// 5. STUDENT USERS CRUD (with Class association)
// ==========================================
let adminCachedStudents = [];

function loadStudentsView() {
    setActiveNav("nav-admin-students");
    currentViewLoader = loadStudentsView;
    document.getElementById("page-title").innerText = "Student User Accounts";
    document.getElementById("page-breadcrumb").innerText = "Admin / Students";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Enrolled Students</h3>
                <button class="btn btn-primary" onclick="showAddStudentModal()"><i class="fa-solid fa-plus"></i> Add Student User</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Register No</th>
                            <th>Full Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Dept</th>
                            <th>Class</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="students-tbody">
                        <tr><td colspan="8">Loading students...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/users/students").then(res => {
        const tbody = document.getElementById("students-tbody");
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8">No students found.</td></tr>`;
            return;
        }
        adminCachedStudents = res.data;
        tbody.innerHTML = res.data.map(s => `
            <tr>
                <td><strong>${s.rollNumber}</strong></td>
                <td>${s.registerNumber}</td>
                <td>${s.fullName}</td>
                <td>${s.username}</td>
                <td>${s.email}</td>
                <td>${s.departmentCode || '-'}</td>
                <td><strong>${s.className || s.batchName || '-'}</strong></td>
                <td>
                    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteStudent(${s.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                </td>
            </tr>
        `).join("");
    });
}

function showAddStudentModal() {
    Promise.all([
        fetchAPI("/api/departments"),
        fetchAPI("/api/classes")
    ]).then(([dRes, cRes]) => {
        const depts = (dRes && dRes.data) ? dRes.data : [];
        const classes = (cRes && cRes.data) ? cRes.data : [];

        const html = `
            <form onsubmit="handleCreateStudent(event)">
                <div class="form-group">
                    <label>Department</label>
                    <select id="stu-dept" onchange="onStudentDeptChange(this.value)" required>
                        <option value="">Select Department</option>
                        ${depts.map(d => `<option value="${d.id}">${d.code} - ${d.name}</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Assigned Class</label>
                    <select id="stu-class" required>
                        <option value="">Select Class</option>
                        ${classes.map(c => `<option value="${c.id}">${c.name} (${c.departmentCode || ''} - Sem ${c.semester})</option>`).join("")}
                    </select>
                </div>
                <div style="display: flex; gap: 15px;">
                    <div class="form-group" style="flex: 1;">
                        <label>Roll Number</label>
                        <input type="text" id="stu-roll" required placeholder="CSE003">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Register Number</label>
                        <input type="text" id="stu-reg" required placeholder="REG2023003">
                    </div>
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="stu-username" required placeholder="student3">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="stu-password" required placeholder="••••••••">
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="stu-email" required placeholder="student3@college.edu">
                </div>
                <div style="display: flex; gap: 15px;">
                    <div class="form-group" style="flex: 1;">
                        <label>First Name</label>
                        <input type="text" id="stu-fname" required placeholder="Charlie">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Last Name</label>
                        <input type="text" id="stu-lname" required placeholder="Brown">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Create Student</button>
            </form>
        `;
        openModal("Add Student User", html);
    });
}

function onStudentDeptChange(deptId) {
    const classSelect = document.getElementById("stu-class") || document.getElementById("edit-stu-class");
    if (!classSelect) return;
    if (!deptId) {
        classSelect.innerHTML = `<option value="">Select Class</option>`;
        return;
    }
    fetchAPI(`/api/classes?departmentId=${deptId}`).then(res => {
        if (res && res.data) {
            classSelect.innerHTML = res.data.map(c => `<option value="${c.id}">${c.name} (Sem ${c.semester} - AY ${c.academicYear})</option>`).join("");
        }
    });
}

function handleCreateStudent(e) {
    e.preventDefault();
    const classVal = document.getElementById("stu-class").value;
    const data = {
        departmentId: parseInt(document.getElementById("stu-dept").value),
        classId: parseInt(classVal),
        batchId: parseInt(classVal),
        rollNumber: document.getElementById("stu-roll").value.trim(),
        registerNumber: document.getElementById("stu-reg").value.trim(),
        username: document.getElementById("stu-username").value.trim(),
        password: document.getElementById("stu-password").value.trim(),
        email: document.getElementById("stu-email").value.trim(),
        firstName: document.getElementById("stu-fname").value.trim(),
        lastName: document.getElementById("stu-lname").value.trim()
    };
    fetchAPI("/api/users/students", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Student created successfully", "success");
            closeModal();
            loadStudentsView();
        } else {
            showToast((res && res.message) ? res.message : "Error creating student", "error");
        }
    });
}

function showEditStudentModal(userId) {
    const s = adminCachedStudents.find(stu => stu.id === userId);
    if (!s) {
        showToast("Student details not found", "error");
        return;
    }

    Promise.all([
        fetchAPI("/api/departments"),
        fetchAPI("/api/classes")
    ]).then(([dRes, cRes]) => {
        const depts = (dRes && dRes.data) ? dRes.data : [];
        const classes = (cRes && cRes.data) ? cRes.data : [];
        const currentClassId = s.classId || s.batchId;

        const html = `
            <form onsubmit="handleUpdateStudent(event, ${userId})">
                <div class="form-group">
                    <label>Department</label>
                    <select id="edit-stu-dept" onchange="onStudentDeptChange(this.value)" required>
                        ${depts.map(d => `<option value="${d.id}" ${d.id === s.departmentId ? 'selected' : ''}>${d.code} - ${d.name}</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Assigned Class</label>
                    <select id="edit-stu-class" required>
                        ${classes.map(c => `<option value="${c.id}" ${c.id === currentClassId ? 'selected' : ''}>${c.name} (${c.departmentCode || ''} - Sem ${c.semester})</option>`).join("")}
                    </select>
                </div>
                <div style="display: flex; gap: 15px;">
                    <div class="form-group" style="flex: 1;">
                        <label>Roll Number</label>
                        <input type="text" id="edit-stu-roll" value="${s.rollNumber}" required>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Register Number</label>
                        <input type="text" id="edit-stu-reg" value="${s.registerNumber}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="edit-stu-username" value="${s.username}" required>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="edit-stu-email" value="${s.email}" required>
                </div>
                <div style="display: flex; gap: 15px;">
                    <div class="form-group" style="flex: 1;">
                        <label>First Name</label>
                        <input type="text" id="edit-stu-fname" value="${s.firstName}" required>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Last Name</label>
                        <input type="text" id="edit-stu-lname" value="${s.lastName}" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-success btn-block">Update Student</button>
            </form>
        `;
        openModal("Edit Student User", html);
    });
}

function handleUpdateStudent(e, userId) {
    e.preventDefault();
    const classVal = document.getElementById("edit-stu-class").value;
    const data = {
        departmentId: parseInt(document.getElementById("edit-stu-dept").value),
        classId: parseInt(classVal),
        batchId: parseInt(classVal),
        rollNumber: document.getElementById("edit-stu-roll").value.trim(),
        registerNumber: document.getElementById("edit-stu-reg").value.trim(),
        username: document.getElementById("edit-stu-username").value.trim(),
        email: document.getElementById("edit-stu-email").value.trim(),
        firstName: document.getElementById("edit-stu-fname").value.trim(),
        lastName: document.getElementById("edit-stu-lname").value.trim()
    };
    fetchAPI(`/api/users/students/${userId}`, "PUT", data).then(res => {
        if (res && res.status === "success") {
            showToast("Student updated successfully", "success");
            closeModal();
            loadStudentsView();
        } else {
            showToast((res && res.message) ? res.message : "Error updating student", "error");
        }
    });
}

function deleteStudent(userId) {
    if (confirm("Are you sure you want to delete this student? All marks and submission records will be checked.")) {
        fetchAPI(`/api/users/students/${userId}`, "DELETE").then(res => {
            if (res && res.status === "success") {
                showToast("Student deleted successfully", "success");
                loadStudentsView();
            } else {
                showToast((res && res.message) ? res.message : "Error deleting student", "error");
            }
        });
    }
}

// ==========================================
// 6. FACULTY ASSIGNMENTS (Assign, Reassign, Delete)
// ==========================================
let adminCachedAssignments = [];

function loadAssignmentsView() {
    setActiveNav("nav-admin-assignments");
    currentViewLoader = loadAssignmentsView;
    document.getElementById("page-title").innerText = "Faculty Subject Assignments";
    document.getElementById("page-breadcrumb").innerText = "Admin / Faculty Assignments";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Faculty Assignments</h3>
                <button class="btn btn-primary" onclick="showAddAssignmentModal()"><i class="fa-solid fa-plus"></i> Assign Faculty</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Faculty Member</th>
                            <th>Subject</th>
                            <th>Assigned Class</th>
                            <th>Academic Year</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="assignments-tbody">
                        <tr><td colspan="5">Loading assignments...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/faculty-assignments").then(res => {
        const tbody = document.getElementById("assignments-tbody");
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">No faculty assignments found.</td></tr>`;
            return;
        }
        adminCachedAssignments = res.data;
        tbody.innerHTML = res.data.map(fa => `
            <tr>
                <td><strong>${fa.facultyName}</strong></td>
                <td>${fa.subjectCode} - ${fa.subjectName}</td>
                <td><strong>${fa.className || fa.batchName || '-'}</strong></td>
                <td>${fa.academicYear}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteAssignment(${fa.id})"><i class="fa-solid fa-trash"></i> Remove</button>
                </td>
            </tr>
        `).join("");
    });
}

function showAddAssignmentModal() {
    Promise.all([
        fetchAPI("/api/users/faculty"),
        fetchAPI("/api/subjects"),
        fetchAPI("/api/classes")
    ]).then(([fRes, sRes, cRes]) => {
        const faculties = (fRes && fRes.data) ? fRes.data : [];
        const subjects = (sRes && sRes.data) ? sRes.data : [];
        const classes = (cRes && cRes.data) ? cRes.data : [];

        const html = `
            <form onsubmit="handleCreateAssignment(event)">
                <div class="form-group">
                    <label>Select Faculty Member</label>
                    <select id="asgn-faculty" required>
                        ${faculties.map(f => `<option value="${f.facultyId || f.id}">${f.fullName} (${f.departmentCode || ''})</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Select Subject</label>
                    <select id="asgn-subject" required>
                        ${subjects.map(s => `<option value="${s.id}">${s.code} - ${s.name} (${s.className || s.batchName || ''})</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Select Class</label>
                    <select id="asgn-class" required>
                        ${classes.map(c => `<option value="${c.id}">${c.name} (${c.departmentCode || ''} - Sem ${c.semester})</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Academic Year</label>
                    <input type="text" id="asgn-ay" value="2025-2026" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Create Assignment</button>
            </form>
        `;
        openModal("Assign Faculty to Class & Subject", html);
    });
}

function handleCreateAssignment(e) {
    e.preventDefault();
    const classVal = document.getElementById("asgn-class").value;
    const data = {
        facultyId: parseInt(document.getElementById("asgn-faculty").value),
        subjectId: parseInt(document.getElementById("asgn-subject").value),
        classId: parseInt(classVal),
        batchId: parseInt(classVal),
        academicYear: document.getElementById("asgn-ay").value.trim()
    };
    fetchAPI("/api/faculty-assignments", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Faculty assigned successfully", "success");
            closeModal();
            loadAssignmentsView();
        } else {
            showToast((res && res.message) ? res.message : "Error assigning faculty. Avoid duplicate assignments.", "error");
        }
    });
}

function showEditAssignmentModal(id) {
    const asgn = adminCachedAssignments.find(a => a.id === id);
    if (!asgn) {
        showToast("Assignment record not found", "error");
        return;
    }

    Promise.all([
        fetchAPI("/api/users/faculty"),
        fetchAPI("/api/subjects"),
        fetchAPI("/api/classes")
    ]).then(([fRes, sRes, cRes]) => {
        const faculties = (fRes && fRes.data) ? fRes.data : [];
        const subjects = (sRes && sRes.data) ? sRes.data : [];
        const classes = (cRes && cRes.data) ? cRes.data : [];
        const currentClassId = asgn.classId || asgn.batchId;

        const html = `
            <form onsubmit="handleUpdateAssignment(event, ${id})">
                <div class="form-group">
                    <label>Faculty Member</label>
                    <select id="edit-asgn-faculty" required>
                        ${faculties.map(f => `<option value="${f.facultyId || f.id}" ${(f.facultyId || f.id) === asgn.facultyId ? 'selected' : ''}>${f.fullName} (${f.departmentCode || ''})</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <select id="edit-asgn-subject" required>
                        ${subjects.map(s => `<option value="${s.id}" ${s.id === asgn.subjectId ? 'selected' : ''}>${s.code} - ${s.name} (${s.className || s.batchName || ''})</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Class</label>
                    <select id="edit-asgn-class" required>
                        ${classes.map(c => `<option value="${c.id}" ${c.id === currentClassId ? 'selected' : ''}>${c.name} (${c.departmentCode || ''} - Sem ${c.semester})</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Academic Year</label>
                    <input type="text" id="edit-asgn-ay" value="${asgn.academicYear}" required>
                </div>
                <button type="submit" class="btn btn-success btn-block">Update Assignment</button>
            </form>
        `;
        openModal("Reassign Faculty", html);
    });
}

function handleUpdateAssignment(e, id) {
    e.preventDefault();
    const classVal = document.getElementById("edit-asgn-class").value;
    const data = {
        facultyId: parseInt(document.getElementById("edit-asgn-faculty").value),
        subjectId: parseInt(document.getElementById("edit-asgn-subject").value),
        classId: parseInt(classVal),
        batchId: parseInt(classVal),
        academicYear: document.getElementById("edit-asgn-ay").value.trim()
    };
    fetchAPI(`/api/faculty-assignments/${id}`, "PUT", data).then(res => {
        if (res && res.status === "success") {
            showToast("Assignment updated successfully", "success");
            closeModal();
            loadAssignmentsView();
        } else {
            showToast((res && res.message) ? res.message : "Error updating assignment", "error");
        }
    });
}

function deleteAssignment(id) {
    if (confirm("Are you sure you want to remove this faculty assignment?")) {
        fetchAPI(`/api/faculty-assignments/${id}`, "DELETE").then(res => {
            if (res && res.status === "success") {
                showToast("Assignment removed successfully", "success");
                loadAssignmentsView();
            } else {
                showToast((res && res.message) ? res.message : "Error deleting assignment", "error");
            }
        });
    }
}

// ==========================================
// 7. CO-PO MAPPING MATRIX & PO / CO MANAGEMENT
// ==========================================
let currentSubjectList = [];

function loadCoPoMatrixView() {
    setActiveNav("nav-admin-copo");
    currentViewLoader = loadCoPoMatrixView;
    document.getElementById("page-title").innerText = "CO-PO Mapping Matrix";
    document.getElementById("page-breadcrumb").innerText = "Admin / CO-PO Matrix";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Select Subject to Configure Mapping</h3>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="showManagePosModal()"><i class="fa-solid fa-list-check"></i> Manage Programme Outcomes (POs)</button>
                </div>
            </div>
            <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center; flex-wrap: wrap;">
                <label style="font-weight: 600;">Subject:</label>
                <select id="matrix-subject-select" style="max-width: 380px;" onchange="renderMatrixTable(this.value)">
                    <option value="">-- Select Subject --</option>
                </select>
            </div>
            <div id="matrix-container">
                <p style="color: var(--text-secondary);">Please select a subject above to view and edit its CO-PO mapping matrix strength (0=None, 1=Low, 2=Medium, 3=High).</p>
            </div>
        </div>
    `;

    fetchAPI("/api/subjects").then(res => {
        if (res && res.data) {
            currentSubjectList = res.data;
            const select = document.getElementById("matrix-subject-select");
            select.innerHTML = `<option value="">-- Select Subject --</option>` +
                res.data.map(s => `<option value="${s.id}">${s.code} - ${s.name} (${s.className || s.batchName || 'Sem ' + s.semester})</option>`).join("");
        }
    });
}

function renderMatrixTable(subjectId) {
    if (!subjectId) {
        document.getElementById("matrix-container").innerHTML = `<p style="color: var(--text-secondary);">Please select a subject above.</p>`;
        return;
    }

    const sObj = currentSubjectList.find(s => s.id === parseInt(subjectId));
    const deptId = sObj ? sObj.departmentId : 1;

    Promise.all([
        fetchAPI(`/api/copo/cos?subjectId=${subjectId}`),
        fetchAPI(`/api/copo/pos?departmentId=${deptId}`),
        fetchAPI(`/api/copo/mapping-matrix?subjectId=${subjectId}`)
    ]).then(([coRes, poRes, mapRes]) => {
        const cos = (coRes && coRes.data) ? coRes.data : [];
        const pos = (poRes && poRes.data) ? poRes.data : [];
        const mappings = (mapRes && mapRes.data) ? mapRes.data : [];

        if (cos.length === 0) {
            document.getElementById("matrix-container").innerHTML = `
                <div style="padding: 18px; background: #fff3cd; border-radius: 8px; border: 1px solid #ffeeba;">
                    <p style="margin-bottom: 12px; font-weight: 500; color: #856404;">No Course Outcomes (COs) created for this subject yet.</p>
                    <button class="btn btn-primary" onclick="showAddCoModal(${subjectId})"><i class="fa-solid fa-plus"></i> Add First CO</button>
                </div>
            `;
            return;
        }

        // Map strength matrix lookup key: "coId_poId"
        const matrixMap = {};
        mappings.forEach(m => {
            matrixMap[`${m.coId}_${m.poId}`] = m.strength;
        });

        let tableHtml = `
            <div style="margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <button class="btn btn-primary" onclick="showAddCoModal(${subjectId})"><i class="fa-solid fa-plus"></i> Add CO</button>
                    <button class="btn btn-secondary" onclick="showManageCosModal(${subjectId})"><i class="fa-solid fa-pen-to-square"></i> Manage Subject COs</button>
                </div>
                <button class="btn btn-success" onclick="saveMatrixChanges(${subjectId})"><i class="fa-solid fa-floppy-disk"></i> Save Matrix Strengths</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table" style="text-align: center;">
                    <thead>
                        <tr>
                            <th style="text-align: left; min-width: 260px;">Course Outcome (CO)</th>
                            ${pos.map(p => `<th title="${p.description || p.poCode}">${p.poCode}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${cos.map(co => `
                            <tr>
                                <td style="text-align: left;">
                                    <strong>${co.coCode}</strong>: ${co.description}
                                    <br><small style="color: var(--text-secondary);">Target: ${co.targetAttainmentPct}%</small>
                                </td>
                                ${pos.map(po => {
                                    const strength = matrixMap[`${co.id}_${po.id}`] !== undefined ? matrixMap[`${co.id}_${po.id}`] : 0;
                                    return `
                                        <td>
                                            <select class="matrix-strength-input" data-co-id="${co.id}" data-po-id="${po.id}" style="width: 58px; text-align: center; padding: 4px; border-radius: 4px; border: 1px solid var(--border-color);">
                                                <option value="0" ${strength === 0 ? 'selected' : ''}>-</option>
                                                <option value="1" ${strength === 1 ? 'selected' : ''}>1</option>
                                                <option value="2" ${strength === 2 ? 'selected' : ''}>2</option>
                                                <option value="3" ${strength === 3 ? 'selected' : ''}>3</option>
                                            </select>
                                        </td>
                                    `;
                                }).join("")}
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; font-size: 12px; color: var(--text-secondary);">
                <strong>Mapping Scale:</strong> 0 = None / Not Mapped, 1 = Low Correlation, 2 = Medium Correlation, 3 = High Correlation.
            </div>
        `;
        document.getElementById("matrix-container").innerHTML = tableHtml;
    });
}

function showAddCoModal(subjectId) {
    const html = `
        <form onsubmit="handleCreateCo(event, ${subjectId})">
            <div class="form-group">
                <label>CO Code (e.g. CO1, CO2, CO3)</label>
                <input type="text" id="co-code" required placeholder="CO1">
            </div>
            <div class="form-group">
                <label>CO Description</label>
                <textarea id="co-desc" rows="3" required placeholder="Understand relational database concepts and schema normalization..."></textarea>
            </div>
            <div class="form-group">
                <label>Target Attainment Percentage Threshold (%)</label>
                <input type="number" id="co-target" value="60" min="1" max="100" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Add Course Outcome</button>
        </form>
    `;
    openModal("Add Course Outcome (CO)", html);
}

function handleCreateCo(e, subjectId) {
    e.preventDefault();
    const data = {
        subjectId: subjectId,
        coCode: document.getElementById("co-code").value.trim(),
        description: document.getElementById("co-desc").value.trim(),
        targetAttainmentPct: parseFloat(document.getElementById("co-target").value)
    };
    fetchAPI("/api/copo/cos", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Course Outcome added", "success");
            closeModal();
            renderMatrixTable(subjectId);
        } else {
            showToast((res && res.message) ? res.message : "Error adding CO", "error");
        }
    });
}

function showManageCosModal(subjectId) {
    fetchAPI(`/api/copo/cos?subjectId=${subjectId}`).then(res => {
        const cos = (res && res.data) ? res.data : [];
        let html = `
            <div class="data-table-wrapper" style="margin-bottom: 15px;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Description</th>
                            <th>Target %</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cos.length === 0 ? '<tr><td colspan="4">No COs found.</td></tr>' : cos.map(c => `
                            <tr>
                                <td><strong>${c.coCode}</strong></td>
                                <td>${c.description}</td>
                                <td>${c.targetAttainmentPct}%</td>
                                <td>
                                    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 11px;" onclick="deleteCo(${c.id}, ${subjectId})"><i class="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
            <button class="btn btn-primary btn-block" onclick="showAddCoModal(${subjectId})"><i class="fa-solid fa-plus"></i> Add New CO</button>
        `;
        openModal("Manage Course Outcomes", html);
    });
}

function deleteCo(coId, subjectId) {
    if (confirm("Are you sure you want to delete this CO? Associated questions will need reassignment.")) {
        fetchAPI(`/api/copo/cos/${coId}`, "DELETE").then(res => {
            if (res && res.status === "success") {
                showToast("CO deleted", "success");
                closeModal();
                renderMatrixTable(subjectId);
            } else {
                showToast((res && res.message) ? res.message : "Error deleting CO", "error");
            }
        });
    }
}

function showManagePosModal() {
    fetchAPI("/api/departments").then(dRes => {
        const depts = (dRes && dRes.data) ? dRes.data : [];
        const firstDeptId = depts.length > 0 ? depts[0].id : 1;

        const html = `
            <div>
                <div class="form-group">
                    <label>Department:</label>
                    <select id="po-dept-select" onchange="renderPoListInModal(this.value)">
                        ${depts.map(d => `<option value="${d.id}">${d.code} - ${d.name}</option>`).join("")}
                    </select>
                </div>
                <div id="po-list-modal-container">
                    <p>Loading POs...</p>
                </div>
                <hr style="margin: 15px 0; border: none; border-top: 1px solid var(--border-color);">
                <h4>Add New Programme Outcome</h4>
                <form onsubmit="handleCreatePoSubmit(event)">
                    <div class="form-group">
                        <label>PO Code (e.g. PO1, PO2, PSO1)</label>
                        <input type="text" id="new-po-code" required placeholder="PO1">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="new-po-desc" rows="2" required placeholder="Engineering knowledge: Apply the knowledge of mathematics, science..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Save PO</button>
                </form>
            </div>
        `;
        openModal("Manage Programme Outcomes (POs)", html);
        renderPoListInModal(firstDeptId);
    });
}

function renderPoListInModal(deptId) {
    fetchAPI(`/api/copo/pos?departmentId=${deptId}`).then(res => {
        const pos = (res && res.data) ? res.data : [];
        const container = document.getElementById("po-list-modal-container");
        if (!container) return;

        if (pos.length === 0) {
            container.innerHTML = `<p style="color: var(--text-secondary);">No POs registered for this department.</p>`;
            return;
        }

        container.innerHTML = `
            <div class="data-table-wrapper" style="max-height: 250px; overflow-y: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Description</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pos.map(p => `
                            <tr>
                                <td><strong>${p.poCode}</strong></td>
                                <td style="font-size: 12px;">${p.description}</td>
                                <td>
                                    <button class="btn btn-danger" style="padding: 3px 6px; font-size: 11px;" onclick="deletePo(${p.id}, ${deptId})"><i class="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    });
}

function handleCreatePoSubmit(e) {
    e.preventDefault();
    const deptId = parseInt(document.getElementById("po-dept-select").value);
    const data = {
        departmentId: deptId,
        poCode: document.getElementById("new-po-code").value.trim(),
        description: document.getElementById("new-po-desc").value.trim()
    };
    fetchAPI("/api/copo/pos", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Programme Outcome added successfully", "success");
            document.getElementById("new-po-code").value = "";
            document.getElementById("new-po-desc").value = "";
            renderPoListInModal(deptId);
        } else {
            showToast((res && res.message) ? res.message : "Error adding PO", "error");
        }
    });
}

function deletePo(id, deptId) {
    if (confirm("Are you sure you want to delete this Programme Outcome?")) {
        fetchAPI(`/api/copo/pos/${id}`, "DELETE").then(res => {
            if (res && res.status === "success") {
                showToast("PO deleted", "success");
                renderPoListInModal(deptId);
            } else {
                showToast((res && res.message) ? res.message : "Error deleting PO", "error");
            }
        });
    }
}

function saveMatrixChanges(subjectId) {
    const inputs = document.querySelectorAll(".matrix-strength-input");
    const mappings = [];
    inputs.forEach(input => {
        mappings.push({
            coId: parseInt(input.getAttribute("data-co-id")),
            poId: parseInt(input.getAttribute("data-po-id")),
            strength: parseInt(input.value)
        });
    });

    fetchAPI("/api/copo/mapping-matrix", "POST", { mappings: mappings }).then(res => {
        if (res && res.status === "success") {
            showToast("CO-PO Matrix strengths saved successfully", "success");
        } else {
            showToast((res && res.message) ? res.message : "Error saving matrix", "error");
        }
    });
}

// ==========================================
// 8. USER MANAGEMENT VIEW (Search, Filter, Status, Password Reset, Delete)
// ==========================================
function loadUserManagementView() {
    setActiveNav("nav-admin-users");
    currentViewLoader = loadUserManagementView;
    document.getElementById("page-title").innerText = "User Management";
    document.getElementById("page-breadcrumb").innerText = "Admin / User Management";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>System Users</h3>
            </div>
            <!-- Search & Filters -->
            <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;">
                <input type="text" id="user-search-input" placeholder="Search by name, username, or email..." style="max-width: 320px; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius);" onkeyup="if(event.key === 'Enter') fetchAndRenderUsers()">
                <select id="user-role-filter" style="max-width: 160px; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius);" onchange="fetchAndRenderUsers()">
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="STUDENT">Student</option>
                </select>
                <select id="user-status-filter" style="max-width: 160px; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius);" onchange="fetchAndRenderUsers()">
                    <option value="">All Statuses</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                </select>
                <button class="btn btn-primary" onclick="fetchAndRenderUsers()"><i class="fa-solid fa-magnifying-glass"></i> Search</button>
            </div>

            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-tbody">
                        <tr><td colspan="7">Loading users...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAndRenderUsers();
}

function fetchAndRenderUsers() {
    const search = document.getElementById("user-search-input") ? encodeURIComponent(document.getElementById("user-search-input").value.trim()) : "";
    const role = document.getElementById("user-role-filter") ? encodeURIComponent(document.getElementById("user-role-filter").value.trim()) : "";
    const active = document.getElementById("user-status-filter") ? encodeURIComponent(document.getElementById("user-status-filter").value.trim()) : "";

    const url = `/api/users/list?search=${search}&role=${role}&active=${active}`;
    fetchAPI(url).then(res => {
        const tbody = document.getElementById("users-table-tbody");
        if (!tbody) return;
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7">No matching users found.</td></tr>`;
            return;
        }

        tbody.innerHTML = res.data.map(u => {
            const isActive = (u.active === true || u.active === 1 || u.is_active === 1);
            return `
                <tr>
                    <td>#${u.id}</td>
                    <td><strong>${u.username}</strong></td>
                    <td>${u.fullName || (u.firstName ? u.firstName + ' ' + (u.lastName || '') : '-')}</td>
                    <td>${u.email}</td>
                    <td><span class="badge ${u.role === 'ADMIN' ? 'badge-level-0' : (u.role === 'FACULTY' ? 'badge-level-2' : 'badge-level-3')}">${u.role}</span></td>
                    <td>
                        <span class="badge ${isActive ? 'badge-level-3' : 'badge-level-0'}">${isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                    </td>
                    <td>
                        <button class="btn ${isActive ? 'btn-secondary' : 'btn-success'}" style="padding: 4px 8px; font-size: 11px; margin-right: 4px;" title="Toggle Account Status" onclick="toggleUserStatus(${u.id})">
                            <i class="fa-solid ${isActive ? 'fa-user-slash' : 'fa-user-check'}"></i> ${isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button class="btn btn-warning" style="background: #f59e0b; color: white; padding: 4px 8px; font-size: 11px; margin-right: 4px;" title="Reset Password" onclick="showResetUserPasswordModal(${u.id}, '${u.username}')">
                            <i class="fa-solid fa-key"></i> Reset Key
                        </button>
                        <button class="btn btn-danger" style="padding: 4px 8px; font-size: 11px;" title="Delete User Account" onclick="deleteUserAccount(${u.id}, '${u.username}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    });
}

function toggleUserStatus(userId) {
    fetchAPI("/api/users/toggle-status", "POST", { userId: userId }).then(res => {
        if (res && res.status === "success") {
            showToast("User account status updated", "success");
            fetchAndRenderUsers();
        } else {
            showToast((res && res.message) ? res.message : "Error updating status", "error");
        }
    });
}

function showResetUserPasswordModal(userId, username) {
    const html = `
        <form onsubmit="handleDirectPasswordResetSubmit(event, ${userId})">
            <p style="margin-bottom: 12px; color: var(--text-secondary);">Set new password for user <strong>${username}</strong>.</p>
            <div class="form-group">
                <label>New Password</label>
                <input type="password" id="user-new-password" required placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-success btn-block">Set New Password</button>
        </form>
    `;
    openModal("Reset User Password", html);
}

function handleDirectPasswordResetSubmit(e, userId) {
    e.preventDefault();
    const newPassword = document.getElementById("user-new-password").value.trim();
    fetchAPI("/api/users/reset-password", "POST", { userId: userId, newPassword: newPassword }).then(res => {
        if (res && res.status === "success") {
            showToast("Password updated successfully", "success");
            closeModal();
        } else {
            showToast((res && res.message) ? res.message : "Error updating password", "error");
        }
    });
}

function deleteUserAccount(userId, username) {
    if (confirm(`Are you sure you want to permanently delete user account '${username}'? Associated role data will also be purged.`)) {
        fetchAPI(`/api/users/${userId}`, "DELETE").then(res => {
            if (res && res.status === "success") {
                showToast("User deleted successfully", "success");
                fetchAndRenderUsers();
            } else {
                showToast((res && res.message) ? res.message : "Error deleting user", "error");
            }
        });
    }
}

// ==========================================
// 9. ATTAINMENT CONFIG RULES
// ==========================================
function loadAttainmentConfigView() {
    setActiveNav("nav-admin-rules");
    currentViewLoader = loadAttainmentConfigView;
    document.getElementById("page-title").innerText = "Attainment Rules & Configuration";
    document.getElementById("page-breadcrumb").innerText = "Admin / Attainment Rules";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card" style="max-width: 600px;">
            <div class="card-header">
                <h3>Configure CO-PO Attainment Calculation Thresholds</h3>
            </div>
            <form onsubmit="handleSaveAttainmentConfig(event)">
                <div class="form-group">
                    <label>Target Question Mark Threshold (%)</label>
                    <input type="number" id="cfg-target" step="0.1" required>
                    <small style="color: var(--text-secondary);">Minimum mark percentage a student must score in a question to be counted as "Attained".</small>
                </div>
                <div class="form-group">
                    <label>Level 1 Cutoff (% Students Attained)</label>
                    <input type="number" id="cfg-lvl1" step="0.1" required>
                </div>
                <div class="form-group">
                    <label>Level 2 Cutoff (% Students Attained)</label>
                    <input type="number" id="cfg-lvl2" step="0.1" required>
                </div>
                <div class="form-group">
                    <label>Level 3 Cutoff (% Students Attained)</label>
                    <input type="number" id="cfg-lvl3" step="0.1" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Save Configuration</button>
            </form>
        </div>
    `;

    fetchAPI("/api/attainment/config").then(res => {
        if (res && res.data) {
            const c = res.data;
            document.getElementById("cfg-target").value = c.targetMarkPct;
            document.getElementById("cfg-lvl1").value = c.level1Pct;
            document.getElementById("cfg-lvl2").value = c.level2Pct;
            document.getElementById("cfg-lvl3").value = c.level3Pct;
        }
    });
}

function handleSaveAttainmentConfig(e) {
    e.preventDefault();
    const data = {
        targetMarkPct: parseFloat(document.getElementById("cfg-target").value),
        level1Pct: parseFloat(document.getElementById("cfg-lvl1").value),
        level2Pct: parseFloat(document.getElementById("cfg-lvl2").value),
        level3Pct: parseFloat(document.getElementById("cfg-lvl3").value),
        directWeight: 80.0,
        indirectWeight: 20.0
    };
    fetchAPI("/api/attainment/config", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Attainment calculation thresholds updated!", "success");
        } else {
            showToast((res && res.message) ? res.message : "Error updating rules", "error");
        }
    });
}
