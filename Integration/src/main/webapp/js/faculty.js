// OBE System - Faculty Module Components

let activeFacultyAssignments = [];
let attainmentChartInstance = null;

function loadFacultyDashboard() {
    setActiveNav("nav-faculty-dashboard");
    currentViewLoader = loadFacultyDashboard;
    document.getElementById("page-title").innerText = "Faculty Dashboard";
    document.getElementById("page-breadcrumb").innerText = "Home / Faculty Dashboard";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue"><i class="fa-solid fa-book-open"></i></div>
                <div class="stat-details">
                    <h4>Assigned Subjects</h4>
                    <span id="fac-stat-subjects">...</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i class="fa-solid fa-chalkboard"></i></div>
                <div class="stat-details">
                    <h4>Assigned Classes</h4>
                    <span id="fac-stat-classes">...</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon amber"><i class="fa-solid fa-pen-to-square"></i></div>
                <div class="stat-details">
                    <h4>Active Assessments</h4>
                    <span id="fac-stat-assessments">...</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple"><i class="fa-solid fa-clipboard-question"></i></div>
                <div class="stat-details">
                    <h4>Active Quizzes</h4>
                    <span id="fac-stat-quizzes">...</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3>My Assigned Subjects & Classes</h3>
                <button class="btn btn-primary" onclick="loadFacultyAssessmentsView()"><i class="fa-solid fa-plus"></i> Create Assessment</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Assigned Class</th>
                            <th>Academic Year</th>
                            <th>Quick Actions</th>
                        </tr>
                    </thead>
                    <tbody id="fac-dashboard-tbody">
                        <tr><td colspan="5">Loading assigned subjects...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/faculty-assignments").then(res => {
        activeFacultyAssignments = (res && res.data) ? res.data : [];
        const tbody = document.getElementById("fac-dashboard-tbody");
        if (!tbody) return;

        if (activeFacultyAssignments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">No subjects assigned yet. Contact administrator.</td></tr>`;
            document.getElementById("fac-stat-subjects").innerText = "0";
            document.getElementById("fac-stat-classes").innerText = "0";
            document.getElementById("fac-stat-assessments").innerText = "0";
            document.getElementById("fac-stat-quizzes").innerText = "0";
            return;
        }

        const uniqueSubjects = new Set(activeFacultyAssignments.map(a => a.subjectId)).size;
        const uniqueClasses = new Set(activeFacultyAssignments.map(a => a.classId || a.batchId)).size;
        document.getElementById("fac-stat-subjects").innerText = uniqueSubjects;
        document.getElementById("fac-stat-classes").innerText = uniqueClasses;

        tbody.innerHTML = activeFacultyAssignments.map(fa => {
            const classId = fa.classId || fa.batchId;
            const className = fa.className || fa.batchName || 'Class';
            return `
                <tr>
                    <td><strong>${fa.subjectCode}</strong></td>
                    <td>${fa.subjectName}</td>
                    <td><strong>${className}</strong></td>
                    <td>${fa.academicYear}</td>
                    <td>
                        <button class="btn btn-primary" style="padding: 4px 8px; font-size: 11px; margin-right: 4px;" onclick="selectSubjectForAttainment(${fa.subjectId}, ${classId})"><i class="fa-solid fa-bullseye"></i> Attainment</button>
                        <button class="btn btn-success" style="padding: 4px 8px; font-size: 11px; margin-right: 4px;" onclick="selectSubjectForMarks(${fa.subjectId}, ${classId})"><i class="fa-solid fa-file-signature"></i> Marks</button>
                        <button class="btn btn-info" style="padding: 4px 8px; font-size: 11px;" onclick="selectSubjectForQuizzes(${fa.subjectId}, ${classId})"><i class="fa-solid fa-clipboard-question"></i> Quizzes</button>
                    </td>
                </tr>
            `;
        }).join("");

        // Count assessments across assignments
        let totalAssCount = 0;
        const assPromises = activeFacultyAssignments.map(fa => {
            const cId = fa.classId || fa.batchId;
            return fetchAPI(`/api/assessments?subjectId=${fa.subjectId}&classId=${cId}`).then(aRes => {
                if (aRes && aRes.data) totalAssCount += aRes.data.length;
            }).catch(() => {});
        });
        Promise.all(assPromises).then(() => {
            const el = document.getElementById("fac-stat-assessments");
            if (el) el.innerText = totalAssCount;
        });

        // Count quizzes across assignments
        let totalQuizCount = 0;
        const quizPromises = activeFacultyAssignments.map(fa => {
            const cId = fa.classId || fa.batchId;
            return fetchAPI(`/api/quizzes?subjectId=${fa.subjectId}&classId=${cId}`).then(qRes => {
                if (qRes && qRes.data) totalQuizCount += qRes.data.length;
            }).catch(() => {});
        });
        Promise.all(quizPromises).then(() => {
            const el = document.getElementById("fac-stat-quizzes");
            if (el) el.innerText = totalQuizCount;
        });
    });
}

// ==========================================
// 1. MY SUBJECTS VIEW
// ==========================================
function loadFacultyMySubjectsView() {
    setActiveNav("nav-faculty-subjects");
    currentViewLoader = loadFacultyMySubjectsView;
    document.getElementById("page-title").innerText = "My Assigned Subjects";
    document.getElementById("page-breadcrumb").innerText = "Faculty / My Subjects";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Assigned Courses & Classes</h3>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Assigned Class</th>
                            <th>Academic Year</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="fac-mysubjects-tbody">
                        <tr><td colspan="5">Loading your subjects...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/faculty-assignments").then(res => {
        const tbody = document.getElementById("fac-mysubjects-tbody");
        if (!tbody) return;
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">No subjects currently assigned to your account.</td></tr>`;
            return;
        }
        activeFacultyAssignments = res.data;
        tbody.innerHTML = res.data.map(fa => {
            const cId = fa.classId || fa.batchId;
            const cName = fa.className || fa.batchName || 'Class';
            return `
                <tr>
                    <td><strong>${fa.subjectCode}</strong></td>
                    <td>${fa.subjectName}</td>
                    <td><strong>${cName}</strong></td>
                    <td>${fa.academicYear}</td>
                    <td>
                        <button class="btn btn-primary" style="padding: 4px 8px; font-size: 11px; margin-right: 4px;" onclick="loadFacultyCOsViewForSubject(${fa.subjectId})"><i class="fa-solid fa-list-check"></i> View COs</button>
                        <button class="btn btn-success" style="padding: 4px 8px; font-size: 11px; margin-right: 4px;" onclick="selectSubjectForMarks(${fa.subjectId}, ${cId})"><i class="fa-solid fa-file-signature"></i> Marks</button>
                        <button class="btn btn-info" style="padding: 4px 8px; font-size: 11px;" onclick="selectSubjectForAttainment(${fa.subjectId}, ${cId})"><i class="fa-solid fa-bullseye"></i> Attainment</button>
                    </td>
                </tr>
            `;
        }).join("");
    });
}

// ==========================================
// 2. ASSESSMENTS BUILDER, EDIT & PUBLISH TOGGLE
// ==========================================
let currentFacultyAssessments = [];

function loadFacultyAssessmentsView() {
    setActiveNav("nav-faculty-assessments");
    currentViewLoader = loadFacultyAssessmentsView;
    document.getElementById("page-title").innerText = "Assessments & Question Mapping";
    document.getElementById("page-breadcrumb").innerText = "Faculty / Assessments";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Subject Assessments</h3>
                <button class="btn btn-primary" onclick="showCreateAssessmentModal()"><i class="fa-solid fa-plus"></i> Create Assessment</button>
            </div>
            <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <label style="font-weight: 600;">Select Assigned Subject & Class: </label>
                <select id="fac-asgn-select" style="max-width: 400px;" onchange="renderSubjectAssessments(this.value)">
                    <option value="">-- Select Subject & Class --</option>
                </select>
            </div>
            <div id="assessments-list-container">
                <p style="color: var(--text-secondary);">Select a subject above to view and manage assessments.</p>
            </div>
        </div>
    `;

    fetchAPI("/api/faculty-assignments").then(res => {
        activeFacultyAssignments = (res && res.data) ? res.data : [];
        const select = document.getElementById("fac-asgn-select");
        if (!select) return;
        select.innerHTML = `<option value="">-- Select Subject & Class --</option>` +
            activeFacultyAssignments.map(fa => {
                const cId = fa.classId || fa.batchId;
                const cName = fa.className || fa.batchName || 'Class';
                return `<option value="${fa.subjectId}_${cId}">${fa.subjectCode} - ${fa.subjectName} (${cName})</option>`;
            }).join("");

        if (activeFacultyAssignments.length > 0) {
            const first = activeFacultyAssignments[0];
            const firstVal = `${first.subjectId}_${first.classId || first.batchId}`;
            select.value = firstVal;
            renderSubjectAssessments(firstVal);
        }
    });
}

function renderSubjectAssessments(val) {
    if (!val) {
        document.getElementById("assessments-list-container").innerHTML = `<p style="color: var(--text-secondary);">Select a subject above.</p>`;
        return;
    }
    const [subjectId, classId] = val.split("_");

    fetchAPI(`/api/assessments?subjectId=${subjectId}&classId=${classId}`).then(res => {
        const container = document.getElementById("assessments-list-container");
        if (!container) return;
        if (!res || !res.data || res.data.length === 0) {
            container.innerHTML = `
                <div style="padding: 20px; background: #f8fafc; border: 1px dashed var(--border-color); border-radius: 8px; text-align: center;">
                    <p style="color: var(--text-secondary); margin-bottom: 12px;">No assessments created for this subject and class yet.</p>
                    <button class="btn btn-primary" onclick="showCreateAssessmentModal()"><i class="fa-solid fa-plus"></i> Create First Assessment</button>
                </div>
            `;
            return;
        }

        currentFacultyAssessments = res.data;
        container.innerHTML = res.data.map(a => {
            const isPub = (a.isPublished === true || a.isPublished === 1);
            return `
                <div style="border: 1px solid var(--border-color); padding: 18px; border-radius: 8px; margin-bottom: 16px; background: var(--bg-card);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <h4 style="font-size: 16px; font-weight: 700;">${a.title}</h4>
                                <span class="badge badge-level-2">${a.type}</span>
                                <span class="badge ${isPub ? 'badge-level-3' : 'badge-level-0'}">${isPub ? 'PUBLISHED' : 'DRAFT'}</span>
                            </div>
                            <div style="font-size: 13px; color: var(--text-secondary); margin-top: 6px;">
                                <span><i class="fa-solid fa-award"></i> Total Marks: <strong>${a.totalMarks}</strong></span>
                                <span style="margin: 0 10px;">|</span>
                                <span><i class="fa-solid fa-calendar"></i> Date: ${a.assessmentDate || 'Not set'}</span>
                                ${a.dueDate ? `<span style="margin: 0 10px;">|</span><span><i class="fa-solid fa-clock"></i> Due: ${a.dueDate}</span>` : ''}
                            </div>
                            ${a.instructions ? `<p style="font-size: 13px; color: var(--text-primary); margin-top: 8px;"><strong>Instructions:</strong> ${a.instructions}</p>` : ''}
                        </div>
                        <div style="display: flex; gap: 6px;">
                            <button class="${isPub ? 'btn btn-secondary' : 'btn btn-success'}" style="padding: 4px 10px; font-size: 12px;" onclick="toggleAssessmentPublish(${a.id}, '${val}')">
                                <i class="fa-solid ${isPub ? 'fa-eye-slash' : 'fa-globe'}"></i> ${isPub ? 'Unpublish' : 'Publish to Students'}
                            </button>
                            <button class="btn btn-danger" style="padding: 4px 10px; font-size: 12px;" onclick="deleteAssessment(${a.id}, '${val}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #f1f5f9;">
                        <strong style="font-size: 12px; color: var(--text-secondary); text-transform: uppercase;">Question Breakdown & CO Mapping:</strong>
                        <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                            ${(a.questions || []).map(q => `
                                <span style="background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 12px; border: 1px solid var(--border-color);">
                                    <strong>${q.questionNumber}</strong> (${q.maxMarks}M) &rarr; <span style="color: var(--primary-color); font-weight: 700;">${q.coCode || ('CO ' + q.coId)}</span>
                                </span>
                            `).join("")}
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    });
}

function showCreateAssessmentModal() {
    const val = document.getElementById("fac-asgn-select").value;
    if (!val) {
        showToast("Please select an assigned subject and class first.", "error");
        return;
    }
    const [subjectId, classId] = val.split("_");

    fetchAPI(`/api/copo/cos?subjectId=${subjectId}`).then(coRes => {
        const cos = (coRes && coRes.data) ? coRes.data : [];
        if (cos.length === 0) {
            showToast("No Course Outcomes (COs) found for this subject. Please add COs first in Course Outcomes view.", "error");
            return;
        }

        const html = `
            <form onsubmit="handleCreateAssessmentSubmit(event, ${subjectId}, ${classId})">
                <div class="form-group">
                    <label>Assessment Title</label>
                    <input type="text" id="ass-title" required placeholder="Internal Test 1">
                </div>
                <div class="form-group">
                    <label>Assessment Type</label>
                    <select id="ass-type">
                        <option value="INTERNAL_TEST">Internal Examination</option>
                        <option value="UNIT_TEST">Unit Test</option>
                        <option value="ASSIGNMENT">Assignment</option>
                        <option value="PRACTICAL">Practical / Lab Exam</option>
                    </select>
                </div>
                <div style="display: flex; gap: 15px;">
                    <div class="form-group" style="flex: 1;">
                        <label>Total Marks</label>
                        <input type="number" id="ass-total" value="10" min="1" step="0.5" required>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Exam Date</label>
                        <input type="date" id="ass-date" required>
                    </div>
                </div>
                <div style="display: flex; gap: 15px;">
                    <div class="form-group" style="flex: 1;">
                        <label>Due Date / Deadline (Optional)</label>
                        <input type="date" id="ass-due-date">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Publication Status</label>
                        <select id="ass-is-published">
                            <option value="1">Publish to Students Immediately</option>
                            <option value="0">Save as Draft (Unpublished)</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Instructions for Students</label>
                    <textarea id="ass-instructions" rows="2" placeholder="Answer all questions. Show step-by-step calculations..."></textarea>
                </div>

                <hr style="margin: 15px 0; border: none; border-top: 1px solid var(--border-color);">
                <h4>Questions Breakdown & CO Mapping</h4>
                <div id="questions-builder-container" style="margin-top: 10px;">
                    <div class="question-row" style="display: grid; grid-template-columns: 75px minmax(180px, 1fr) 105px minmax(170px, 1fr); gap: 10px; margin-bottom: 10px; align-items: center;">
                        <input type="text" class="q-num" value="Q1" placeholder="Q1" style="width: 80px;" required>
                        <input type="text" class="q-text" placeholder="Question text (required)" required>
                        <input type="number" class="q-marks" placeholder="Max Marks" value="10" style="width: 110px;" min="0.5" step="0.5" required>
                        <select class="q-co" style="flex: 1;" required>
                            ${cos.map(c => `<option value="${c.id}">${c.coCode} - ${c.description.substring(0, 35)}...</option>`).join("")}
                        </select>
                    </div>
                </div>
                <button type="button" class="btn btn-secondary" onclick="addQuestionRowToModal()"><i class="fa-solid fa-plus"></i> Add Another Question</button>
                <button type="submit" class="btn btn-primary btn-block" style="margin-top: 20px;">Save Assessment</button>
            </form>
        `;
        openModal("Create Assessment with CO Mapping", html);
        document.getElementById("ass-date").valueAsDate = new Date();
    });
}

function addQuestionRowToModal() {
    const container = document.getElementById("questions-builder-container");
    const count = container.children.length + 1;
    const firstSelect = container.querySelector(".q-co").cloneNode(true);

    const div = document.createElement("div");
    div.className = "question-row";
    div.style = "display: grid; grid-template-columns: 75px minmax(180px, 1fr) 105px minmax(170px, 1fr); gap: 10px; margin-bottom: 10px; align-items: center;";
    div.innerHTML = `
        <input type="text" class="q-num" value="Q${count}" placeholder="Q${count}" style="width: 80px;" required>
        <input type="text" class="q-text" placeholder="Question text (required)" required>
        <input type="number" class="q-marks" placeholder="Max Marks" value="10" style="width: 110px;" min="0.5" step="0.5" required>
    `;
    div.appendChild(firstSelect);
    container.appendChild(div);
}

function handleCreateAssessmentSubmit(e, subjectId, classId) {
    e.preventDefault();
    const rows = document.querySelectorAll(".question-row");
    const questions = [];
    for (const row of rows) {
        const questionNumber = row.querySelector(".q-num").value.trim();
        const questionText = row.querySelector(".q-text").value.trim();
        const maxMarks = parseFloat(row.querySelector(".q-marks").value);
        const coId = parseInt(row.querySelector(".q-co").value);
        if (!questionNumber || !questionText || !Number.isFinite(maxMarks) || maxMarks <= 0 || !Number.isInteger(coId) || coId <= 0) {
            showToast("Complete every question: number, text, positive marks, and course outcome are required.", "error");
            return;
        }
        questions.push({ questionNumber, questionText, maxMarks, coId });
    }

    const totalMarks = parseFloat(document.getElementById("ass-total").value);
    const questionTotal = questions.reduce((sum, question) => sum + question.maxMarks, 0);
    if (!Number.isFinite(totalMarks) || totalMarks <= 0 || Math.abs(questionTotal - totalMarks) > 0.01) {
        showToast(`Question marks total ${questionTotal}; it must equal the assessment total of ${totalMarks}.`, "error");
        return;
    }

    const isPubVal = document.getElementById("ass-is-published").value === "1";
    const data = {
        subjectId: subjectId,
        classId: classId,
        batchId: classId,
        title: document.getElementById("ass-title").value.trim(),
        type: document.getElementById("ass-type").value,
        totalMarks: totalMarks,
        assessmentDate: document.getElementById("ass-date").value,
        dueDate: document.getElementById("ass-due-date").value || null,
        instructions: document.getElementById("ass-instructions").value.trim(),
        isPublished: isPubVal,
        questions: questions
    };

    fetchAPI("/api/assessments", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Assessment created successfully", "success");
            closeModal();
            renderSubjectAssessments(`${subjectId}_${classId}`);
        } else {
            showToast((res && res.message) ? res.message : "Error creating assessment", "error");
        }
    });
}

function showEditAssessmentModal(assessmentId, val) {
    const a = currentFacultyAssessments.find(item => item.id === assessmentId);
    if (!a) {
        showToast("Assessment details not found", "error");
        return;
    }

    const html = `
        <form onsubmit="handleUpdateAssessmentSubmit(event, ${assessmentId}, '${val}')">
            <div class="form-group">
                <label>Assessment Title</label>
                <input type="text" id="edit-ass-title" value="${a.title}" required>
            </div>
            <div class="form-group">
                <label>Assessment Type</label>
                <select id="edit-ass-type">
                    <option value="INTERNAL_TEST" ${a.type === 'INTERNAL_TEST' ? 'selected' : ''}>Internal Examination</option>
                    <option value="UNIT_TEST" ${a.type === 'UNIT_TEST' ? 'selected' : ''}>Unit Test</option>
                    <option value="ASSIGNMENT" ${a.type === 'ASSIGNMENT' ? 'selected' : ''}>Assignment</option>
                    <option value="PRACTICAL" ${a.type === 'PRACTICAL' ? 'selected' : ''}>Practical / Lab Exam</option>
                </select>
            </div>
            <div style="display: flex; gap: 15px;">
                <div class="form-group" style="flex: 1;">
                    <label>Total Marks</label>
                    <input type="number" id="edit-ass-total" value="${a.totalMarks}" min="1" required>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label>Exam Date</label>
                    <input type="date" id="edit-ass-date" value="${a.assessmentDate || ''}" required>
                </div>
            </div>
            <div style="display: flex; gap: 15px;">
                <div class="form-group" style="flex: 1;">
                    <label>Due Date / Deadline</label>
                    <input type="date" id="edit-ass-due-date" value="${a.dueDate || ''}">
                </div>
                <div class="form-group" style="flex: 1;">
                    <label>Publication Status</label>
                    <select id="edit-ass-is-published">
                        <option value="1" ${(a.isPublished === true || a.isPublished === 1) ? 'selected' : ''}>Published to Students</option>
                        <option value="0" ${!(a.isPublished === true || a.isPublished === 1) ? 'selected' : ''}>Draft (Hidden from Students)</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Instructions</label>
                <textarea id="edit-ass-instructions" rows="2">${a.instructions || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-success btn-block">Update Assessment</button>
        </form>
    `;
    openModal("Edit Assessment", html);
}

function handleUpdateAssessmentSubmit(e, assessmentId, val) {
    e.preventDefault();
    const isPubVal = document.getElementById("edit-ass-is-published").value === "1";
    const data = {
        title: document.getElementById("edit-ass-title").value.trim(),
        type: document.getElementById("edit-ass-type").value,
        totalMarks: parseFloat(document.getElementById("edit-ass-total").value),
        assessmentDate: document.getElementById("edit-ass-date").value,
        dueDate: document.getElementById("edit-ass-due-date").value || null,
        instructions: document.getElementById("edit-ass-instructions").value.trim(),
        isPublished: isPubVal
    };

    fetchAPI(`/api/assessments/${assessmentId}`, "PUT", data).then(res => {
        if (res && res.status === "success") {
            showToast("Assessment updated successfully", "success");
            closeModal();
            renderSubjectAssessments(val);
        } else {
            showToast((res && res.message) ? res.message : "Error updating assessment", "error");
        }
    });
}

function toggleAssessmentPublish(assessmentId, val) {
    fetchAPI("/api/assessments/toggle-publish", "POST", { assessmentId: assessmentId }).then(res => {
        if (res && res.status === "success") {
            showToast("Assessment publication status toggled", "success");
            renderSubjectAssessments(val);
        } else {
            showToast((res && res.message) ? res.message : "Error toggling status", "error");
        }
    });
}

function deleteAssessment(id, val) {
    if (confirm("Are you sure you want to delete this assessment? All recorded marks for this assessment will be deleted.")) {
        fetchAPI(`/api/assessments/${id}`, "DELETE").then(res => {
            if (res && res.status === "success") {
                showToast("Assessment deleted", "success");
                renderSubjectAssessments(val);
            } else {
                showToast((res && res.message) ? res.message : "Error deleting assessment", "error");
            }
        });
    }
}

// ==========================================
// 3. MARKS ENTRY WITH VALIDATION
// ==========================================
function loadFacultyMarksView() {
    setActiveNav("nav-faculty-marks");
    currentViewLoader = loadFacultyMarksView;
    document.getElementById("page-title").innerText = "Enter Student Marks";
    document.getElementById("page-breadcrumb").innerText = "Faculty / Marks Entry";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Record Assessment Marks</h3>
            </div>
            <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 20px;">
                <select id="marks-subject-select" style="max-width: 320px;" onchange="onMarksSubjectSelect(this.value)">
                    <option value="">-- Select Subject & Class --</option>
                </select>
                <select id="marks-assessment-select" style="max-width: 320px;" onchange="renderMarksEntryGrid(this.value)">
                    <option value="">-- Select Assessment --</option>
                </select>
            </div>

            <div id="marks-grid-container">
                <p style="color: var(--text-secondary);">Select subject and assessment above to enter marks.</p>
            </div>
        </div>
    `;

    fetchAPI("/api/faculty-assignments").then(res => {
        activeFacultyAssignments = (res && res.data) ? res.data : [];
        const select = document.getElementById("marks-subject-select");
        if (!select) return;
        select.innerHTML = `<option value="">-- Select Subject & Class --</option>` +
            activeFacultyAssignments.map(fa => {
                const cId = fa.classId || fa.batchId;
                const cName = fa.className || fa.batchName || 'Class';
                return `<option value="${fa.subjectId}_${cId}">${fa.subjectCode} - ${fa.subjectName} (${cName})</option>`;
            }).join("");
    });
}

function onMarksSubjectSelect(val) {
    const assSelect = document.getElementById("marks-assessment-select");
    if (!assSelect) return;
    if (!val) {
        assSelect.innerHTML = `<option value="">-- Select Assessment --</option>`;
        document.getElementById("marks-grid-container").innerHTML = `<p style="color: var(--text-secondary);">Select subject and assessment above.</p>`;
        return;
    }
    const [subjectId, classId] = val.split("_");
    fetchAPI(`/api/assessments?subjectId=${subjectId}&classId=${classId}`).then(res => {
        const assessments = (res && res.data) ? res.data : [];
        assSelect.innerHTML = `<option value="">-- Select Assessment --</option>` +
            assessments.map(a => `<option value="${a.id}">${a.title} (${a.type} - Max ${a.totalMarks}M)</option>`).join("");
    });
}

function renderMarksEntryGrid(assessmentId) {
    if (!assessmentId) {
        document.getElementById("marks-grid-container").innerHTML = `<p style="color: var(--text-secondary);">Select an assessment to enter marks.</p>`;
        return;
    }

    const val = document.getElementById("marks-subject-select").value;
    const [subjectId, classId] = val.split("_");

    Promise.all([
        fetchAPI(`/api/assessments?subjectId=${subjectId}&classId=${classId}`),
        fetchAPI(`/api/users/students?classId=${classId}`),
        fetchAPI(`/api/marks?assessmentId=${assessmentId}`)
    ]).then(([aRes, sRes, mRes]) => {
        const assessment = (aRes && aRes.data) ? aRes.data.find(a => a.id === parseInt(assessmentId)) : null;
        const students = (sRes && sRes.data) ? sRes.data : [];
        const existingMarks = (mRes && mRes.data) ? mRes.data : [];

        if (!assessment) {
            document.getElementById("marks-grid-container").innerHTML = `<p style="color: var(--text-secondary);">Assessment not found.</p>`;
            return;
        }

        if (students.length === 0) {
            document.getElementById("marks-grid-container").innerHTML = `<p style="color: var(--text-secondary);">No enrolled students found in this class.</p>`;
            return;
        }

        // Lookup: "studentId_questionId" -> mark
        const markMap = {};
        existingMarks.forEach(m => {
            markMap[`${m.studentId}_${m.questionId}`] = m.marksObtained;
        });

        let gridHtml = `
            <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <strong>Total Exam Marks:</strong> ${assessment.totalMarks} |
                    <strong>Questions:</strong> ${assessment.questions.length} |
                    <strong>Students:</strong> ${students.length}
                </div>
                <button class="btn btn-success" onclick="saveMarksGrid(${assessmentId})"><i class="fa-solid fa-floppy-disk"></i> Save All Marks</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table" style="text-align: center;">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Roll No</th>
                            <th style="text-align: left;">Student Name</th>
                            ${assessment.questions.map(q => `<th>${q.questionNumber}<br><small>(${q.maxMarks}M / ${q.coCode})</small></th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                            <tr>
                                <td style="text-align: left;"><strong>${s.rollNumber}</strong></td>
                                <td style="text-align: left;">${s.fullName}</td>
                                ${assessment.questions.map(q => {
                                    const val = markMap[`${s.studentId || s.id}_${q.id}`] !== undefined ? markMap[`${s.studentId || s.id}_${q.id}`] : 0;
                                    return `
                                        <td>
                                            <input type="number" class="mark-input" data-student-id="${s.studentId || s.id}" data-question-id="${q.id}" data-max="${q.maxMarks}" value="${val}" step="0.5" min="0" max="${q.maxMarks}" style="width: 75px; text-align: center; padding: 4px; border: 1px solid var(--border-color); border-radius: 4px;">
                                        </td>
                                    `;
                                }).join("")}
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById("marks-grid-container").innerHTML = gridHtml;
    });
}

function saveMarksGrid(assessmentId) {
    const inputs = document.querySelectorAll(".mark-input");
    const marks = [];
    let hasValidationError = false;

    inputs.forEach(input => {
        const val = parseFloat(input.value) || 0;
        const max = parseFloat(input.getAttribute("data-max"));
        if (val < 0 || val > max) {
            hasValidationError = true;
            input.style.borderColor = "red";
        } else {
            input.style.borderColor = "#e2e8f0";
        }

        marks.push({
            studentId: parseInt(input.getAttribute("data-student-id")),
            questionId: parseInt(input.getAttribute("data-question-id")),
            marksObtained: val,
            isAbsent: false
        });
    });

    if (hasValidationError) {
        showToast("Validation Error: Marks obtained cannot exceed question maximum marks!", "error");
        return;
    }

    fetchAPI("/api/marks", "POST", { assessmentId: assessmentId, marks: marks }).then(res => {
        if (res && res.status === "success") {
            showToast("Marks recorded successfully", "success");
        } else {
            showToast((res && res.message) ? res.message : "Error saving marks", "error");
        }
    });
}

// ==========================================
// 4. QUIZZES BUILDER, PUBLISH & SUBMISSIONS
// ==========================================
let currentQuizList = [];

function loadFacultyQuizzesView() {
    setActiveNav("nav-faculty-quizzes");
    currentViewLoader = loadFacultyQuizzesView;
    document.getElementById("page-title").innerText = "Online Quizzes";
    document.getElementById("page-breadcrumb").innerText = "Faculty / Quizzes";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Course Quizzes</h3>
                <button class="btn btn-primary" onclick="showCreateQuizModal()"><i class="fa-solid fa-plus"></i> Create New Quiz</button>
            </div>
            <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <label style="font-weight: 600;">Select Assigned Subject & Class: </label>
                <select id="fac-quiz-select" style="max-width: 400px;" onchange="renderSubjectQuizzes(this.value)">
                    <option value="">-- Select Subject & Class --</option>
                </select>
            </div>
            <div id="quizzes-list-container">
                <p style="color: var(--text-secondary);">Select subject and class above to manage quizzes.</p>
            </div>
        </div>
    `;

    fetchAPI("/api/faculty-assignments").then(res => {
        activeFacultyAssignments = (res && res.data) ? res.data : [];
        const select = document.getElementById("fac-quiz-select");
        if (!select) return;
        select.innerHTML = `<option value="">-- Select Subject & Class --</option>` +
            activeFacultyAssignments.map(fa => {
                const cId = fa.classId || fa.batchId;
                const cName = fa.className || fa.batchName || 'Class';
                return `<option value="${fa.subjectId}_${cId}">${fa.subjectCode} - ${fa.subjectName} (${cName})</option>`;
            }).join("");

        if (activeFacultyAssignments.length > 0) {
            const first = activeFacultyAssignments[0];
            const firstVal = `${first.subjectId}_${first.classId || first.batchId}`;
            select.value = firstVal;
            renderSubjectQuizzes(firstVal);
        }
    });
}

function renderSubjectQuizzes(val) {
    if (!val) {
        document.getElementById("quizzes-list-container").innerHTML = `<p style="color: var(--text-secondary);">Select a subject above.</p>`;
        return;
    }
    const [subjectId, classId] = val.split("_");

    fetchAPI(`/api/quizzes?subjectId=${subjectId}&classId=${classId}`).then(res => {
        const container = document.getElementById("quizzes-list-container");
        if (!container) return;
        if (!res || !res.data || res.data.length === 0) {
            container.innerHTML = `
                <div style="padding: 20px; background: #f8fafc; border: 1px dashed var(--border-color); border-radius: 8px; text-align: center;">
                    <p style="color: var(--text-secondary); margin-bottom: 12px;">No quizzes created for this subject and class yet.</p>
                    <button class="btn btn-primary" onclick="showCreateQuizModal()"><i class="fa-solid fa-plus"></i> Create Quiz</button>
                </div>
            `;
            return;
        }

        currentQuizList = res.data;
        container.innerHTML = res.data.map(q => {
            const isPub = (q.isPublished === true || q.isPublished === 1);
            return `
                <div style="border: 1px solid var(--border-color); padding: 18px; border-radius: 8px; margin-bottom: 16px; background: var(--bg-card);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <h4 style="font-size: 16px; font-weight: 700;">${q.title}</h4>
                                <span class="badge ${isPub ? 'badge-level-3' : 'badge-level-0'}">${isPub ? 'PUBLISHED' : 'DRAFT'}</span>
                            </div>
                            <div style="font-size: 13px; color: var(--text-secondary); margin-top: 6px;">
                                <span><i class="fa-solid fa-clock"></i> Time Limit: ${q.timeLimitMinutes} mins</span>
                                <span style="margin: 0 10px;">|</span>
                                <span><i class="fa-solid fa-award"></i> Total Marks: ${q.totalMarks}</span>
                                <span style="margin: 0 10px;">|</span>
                                <span><i class="fa-solid fa-calendar-xmark"></i> Deadline: ${q.dueDate || 'No deadline'}</span>
                            </div>
                            ${q.description ? `<p style="font-size: 13px; margin-top: 8px;">${q.description}</p>` : ''}
                        </div>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn ${isPub ? 'btn-secondary' : 'btn-success'}" style="padding: 4px 10px; font-size: 12px;" onclick="toggleQuizPublish(${q.id}, '${val}')">
                                <i class="fa-solid ${isPub ? 'fa-eye-slash' : 'fa-globe'}"></i> ${isPub ? 'Unpublish' : 'Publish'}
                            </button>
                            <button class="btn btn-info" style="padding: 4px 10px; font-size: 12px;" onclick="viewQuizSubmissions(${q.id}, '${q.title}')">
                                <i class="fa-solid fa-square-poll-vertical"></i> Submissions
                            </button>
                            <button class="btn btn-danger" style="padding: 4px 10px; font-size: 12px;" onclick="deleteQuiz(${q.id}, '${val}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    });
}

function showCreateQuizModal() {
    const val = document.getElementById("fac-quiz-select") ? document.getElementById("fac-quiz-select").value : "";
    if (!val) {
        showToast("Please select a subject and class first", "error");
        return;
    }
    const [subjectId, classId] = val.split("_");

    const html = `
        <form onsubmit="handleCreateQuizSubmit(event, ${subjectId}, ${classId})">
            <div class="form-group">
                <label>Quiz Title</label>
                <input type="text" id="quiz-title" required placeholder="Unit 1 MCQ Quiz">
            </div>
            <div class="form-group">
                <label>Description / Guidelines</label>
                <textarea id="quiz-desc" rows="2" placeholder="Contains 5 multiple choice questions. 1 mark each..."></textarea>
            </div>
            <div style="display: flex; gap: 15px;">
                <div class="form-group" style="flex: 1;">
                    <label>Time Limit (Minutes)</label>
                    <input type="number" id="quiz-time" value="20" min="1" max="180" required>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label>Total Marks</label>
                    <input type="number" id="quiz-total-marks" value="10" min="1" required>
                </div>
            </div>
            <div style="display: flex; gap: 15px;">
                <div class="form-group" style="flex: 1;">
                    <label>Deadline / Due Date (YYYY-MM-DD HH:MM:SS)</label>
                    <input type="datetime-local" id="quiz-due" required>
                </div>
                <div class="form-group" style="flex: 1;">
                    <label>Publication Status</label>
                    <select id="quiz-pub">
                        <option value="1">Publish Immediately</option>
                        <option value="0">Draft</option>
                    </select>
                </div>
            </div>

            <hr style="margin: 15px 0; border: none; border-top: 1px solid var(--border-color);">
            <h4>Quiz Questions</h4>
            <div id="quiz-questions-builder" style="margin-top: 10px;">
                <div class="quiz-q-block" style="border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                    <div class="form-group">
                        <label>Question 1 Text</label>
                        <input type="text" class="q-text" required placeholder="What does SQL stand for?">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <input type="text" class="opt-a" placeholder="Option A" required>
                        <input type="text" class="opt-b" placeholder="Option B" required>
                        <input type="text" class="opt-c" placeholder="Option C" required>
                        <input type="text" class="opt-d" placeholder="Option D" required>
                    </div>
                    <div style="display: flex; gap: 15px; margin-top: 10px;">
                        <div style="flex: 1;">
                            <label style="font-size: 12px;">Correct Option</label>
                            <select class="correct-opt">
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        </div>
                        <div style="flex: 1;">
                            <label style="font-size: 12px;">Marks</label>
                            <input type="number" class="q-mark" value="2" min="1" required>
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" class="btn btn-secondary" onclick="addQuizQuestionRow()"><i class="fa-solid fa-plus"></i> Add Question</button>
            <button type="submit" class="btn btn-primary btn-block" style="margin-top: 18px;">Save Quiz</button>
        </form>
    `;
    openModal("Create Online Quiz", html);
}

function addQuizQuestionRow() {
    const container = document.getElementById("quiz-questions-builder");
    const count = container.children.length + 1;
    const div = document.createElement("div");
    div.className = "quiz-q-block";
    div.style = "border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; margin-bottom: 12px;";
    div.innerHTML = `
        <div class="form-group">
            <label>Question ${count} Text</label>
            <input type="text" class="q-text" required placeholder="Enter question...">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <input type="text" class="opt-a" placeholder="Option A" required>
            <input type="text" class="opt-b" placeholder="Option B" required>
            <input type="text" class="opt-c" placeholder="Option C" required>
            <input type="text" class="opt-d" placeholder="Option D" required>
        </div>
        <div style="display: flex; gap: 15px; margin-top: 10px;">
            <div style="flex: 1;">
                <label style="font-size: 12px;">Correct Option</label>
                <select class="correct-opt">
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
            <div style="flex: 1;">
                <label style="font-size: 12px;">Marks</label>
                <input type="number" class="q-mark" value="2" min="1" required>
            </div>
        </div>
    `;
    container.appendChild(div);
}

function handleCreateQuizSubmit(e, subjectId, classId) {
    e.preventDefault();
    const blocks = document.querySelectorAll(".quiz-q-block");
    const questions = [];
    blocks.forEach(b => {
        questions.push({
            questionText: b.querySelector(".q-text").value.trim(),
            optionA: b.querySelector(".opt-a").value.trim(),
            optionB: b.querySelector(".opt-b").value.trim(),
            optionC: b.querySelector(".opt-c").value.trim(),
            optionD: b.querySelector(".opt-d").value.trim(),
            correctOption: b.querySelector(".correct-opt").value,
            marks: parseFloat(b.querySelector(".q-mark").value)
        });
    });

    const dueDateVal = document.getElementById("quiz-due").value.replace('T', ' ') + ':00';
    const isPubVal = document.getElementById("quiz-pub").value === "1";

    const data = {
        subjectId: subjectId,
        classId: classId,
        title: document.getElementById("quiz-title").value.trim(),
        description: document.getElementById("quiz-desc").value.trim(),
        timeLimitMinutes: parseInt(document.getElementById("quiz-time").value),
        totalMarks: parseFloat(document.getElementById("quiz-total-marks").value),
        dueDate: dueDateVal,
        isPublished: isPubVal,
        questions: questions
    };

    fetchAPI("/api/quizzes", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Quiz created successfully", "success");
            closeModal();
            renderSubjectQuizzes(`${subjectId}_${classId}`);
        } else {
            showToast((res && res.message) ? res.message : "Error creating quiz", "error");
        }
    });
}

function toggleQuizPublish(quizId, val) {
    fetchAPI("/api/quizzes/toggle-publish", "POST", { quizId: quizId }).then(res => {
        if (res && res.status === "success") {
            showToast("Quiz publication status updated", "success");
            renderSubjectQuizzes(val);
        } else {
            showToast((res && res.message) ? res.message : "Error updating status", "error");
        }
    });
}

function viewQuizSubmissions(quizId, title) {
    fetchAPI(`/api/quizzes/submissions?quizId=${quizId}`).then(res => {
        const subs = (res && res.data) ? res.data : [];
        let html = `
            <div>
                <h4>Submissions for: <strong>${title}</strong></h4>
                <div class="data-table-wrapper" style="margin-top: 15px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Roll Number</th>
                                <th>Student Name</th>
                                <th>Score Obtained</th>
                                <th>Submitted At</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subs.length === 0 ? '<tr><td colspan="4">No student submissions recorded yet.</td></tr>' : subs.map(s => `
                                <tr>
                                    <td><strong>${s.rollNumber}</strong></td>
                                    <td>${s.studentName}</td>
                                    <td><strong>${s.score} / ${s.totalMarks}</strong></td>
                                    <td>${s.submittedAt || '-'}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        openModal("Quiz Submissions", html);
    });
}

function deleteQuiz(id, val) {
    if (confirm("Are you sure you want to delete this quiz? Student submissions will also be deleted.")) {
        fetchAPI(`/api/quizzes/${id}`, "DELETE").then(res => {
            if (res && res.status === "success") {
                showToast("Quiz deleted successfully", "success");
                renderSubjectQuizzes(val);
            } else {
                showToast((res && res.message) ? res.message : "Error deleting quiz", "error");
            }
        });
    }
}

// ==========================================
// 5. ATTENDANCE RECORDING
// ==========================================
function loadFacultyAttendanceView() {
    setActiveNav("nav-faculty-attendance");
    currentViewLoader = loadFacultyAttendanceView;
    document.getElementById("page-title").innerText = "Record Attendance";
    document.getElementById("page-breadcrumb").innerText = "Faculty / Attendance";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Daily Class Attendance</h3>
            </div>
            <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 20px;">
                <select id="att-subject-select" style="max-width: 320px;">
                    <option value="">-- Select Subject & Class --</option>
                </select>
                <input type="date" id="att-date-input" style="max-width: 200px;">
                <button class="btn btn-primary" onclick="renderAttendanceGrid()"><i class="fa-solid fa-list-check"></i> Load Sheet</button>
            </div>
            <div id="attendance-sheet-container"></div>
        </div>
    `;

    document.getElementById("att-date-input").valueAsDate = new Date();

    fetchAPI("/api/faculty-assignments").then(res => {
        activeFacultyAssignments = (res && res.data) ? res.data : [];
        const select = document.getElementById("att-subject-select");
        if (!select) return;
        select.innerHTML = `<option value="">-- Select Subject & Class --</option>` +
            activeFacultyAssignments.map(fa => {
                const cId = fa.classId || fa.batchId;
                const cName = fa.className || fa.batchName || 'Class';
                return `<option value="${fa.subjectId}_${cId}">${fa.subjectCode} - ${fa.subjectName} (${cName})</option>`;
            }).join("");
    });
}

function renderAttendanceGrid() {
    const val = document.getElementById("att-subject-select").value;
    const dateStr = document.getElementById("att-date-input").value;
    if (!val || !dateStr) {
        showToast("Select subject, class, and date first.", "error");
        return;
    }
    const [subjectId, classId] = val.split("_");

    Promise.all([
        fetchAPI(`/api/users/students?classId=${classId}`),
        fetchAPI(`/api/attendance?subjectId=${subjectId}&classId=${classId}&date=${dateStr}`)
    ]).then(([sRes, aRes]) => {
        const students = (sRes && sRes.data) ? sRes.data : [];
        const existingAtt = (aRes && aRes.data) ? aRes.data : [];

        if (students.length === 0) {
            document.getElementById("attendance-sheet-container").innerHTML = `<p style="color: var(--text-secondary);">No enrolled students found in this class.</p>`;
            return;
        }

        const attMap = {};
        existingAtt.forEach(a => attMap[a.studentId] = a.status);

        let html = `
            <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
                <div><strong>Enrolled Students:</strong> ${students.length}</div>
                <button class="btn btn-success" onclick="saveAttendanceSheet(${subjectId}, ${classId}, '${dateStr}')"><i class="fa-solid fa-floppy-disk"></i> Save Attendance</button>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Roll Number</th>
                            <th>Student Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => {
                            const status = attMap[s.studentId || s.id] || "PRESENT";
                            return `
                                <tr>
                                    <td><strong>${s.rollNumber}</strong></td>
                                    <td>${s.fullName}</td>
                                    <td>
                                        <select class="att-status-select" data-student-id="${s.studentId || s.id}" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color);">
                                            <option value="PRESENT" ${status === 'PRESENT' ? 'selected' : ''}>PRESENT</option>
                                            <option value="ABSENT" ${status === 'ABSENT' ? 'selected' : ''}>ABSENT</option>
                                            <option value="LATE" ${status === 'LATE' ? 'selected' : ''}>LATE</option>
                                        </select>
                                    </td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById("attendance-sheet-container").innerHTML = html;
    });
}

function saveAttendanceSheet(subjectId, classId, dateStr) {
    const selects = document.querySelectorAll(".att-status-select");
    const records = [];
    selects.forEach(s => {
        records.push({
            studentId: parseInt(s.getAttribute("data-student-id")),
            status: s.value
        });
    });

    const data = {
        subjectId: subjectId,
        classId: classId,
        batchId: classId,
        attendanceDate: dateStr,
        records: records
    };

    fetchAPI("/api/attendance", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Attendance saved successfully", "success");
        } else {
            showToast((res && res.message) ? res.message : "Error saving attendance", "error");
        }
    });
}

// ==========================================
// 6. COURSE OUTCOMES (COs) VIEW
// ==========================================
function loadFacultyCOsView() {
    setActiveNav("nav-faculty-cos");
    currentViewLoader = loadFacultyCOsView;
    document.getElementById("page-title").innerText = "Course Outcomes (COs)";
    document.getElementById("page-breadcrumb").innerText = "Faculty / Course Outcomes";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Course Outcomes for Assigned Subjects</h3>
            </div>
            <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <label style="font-weight: 600;">Select Subject: </label>
                <select id="fac-co-subject-select" style="max-width: 380px;" onchange="renderFacultyCOList(this.value)">
                    <option value="">-- Select Subject --</option>
                </select>
                <button class="btn btn-primary" onclick="showFacultyAddCoModal()"><i class="fa-solid fa-plus"></i> Add Course Outcome</button>
            </div>
            <div id="faculty-cos-container">
                <p style="color: var(--text-secondary);">Select a subject above to view and manage its Course Outcomes.</p>
            </div>
        </div>
    `;

    fetchAPI("/api/faculty-assignments").then(res => {
        activeFacultyAssignments = (res && res.data) ? res.data : [];
        const select = document.getElementById("fac-co-subject-select");
        if (!select) return;

        // Unique subjects only
        const seen = new Set();
        const unique = [];
        activeFacultyAssignments.forEach(fa => {
            if (!seen.has(fa.subjectId)) {
                seen.add(fa.subjectId);
                unique.push(fa);
            }
        });

        select.innerHTML = `<option value="">-- Select Subject --</option>` +
            unique.map(fa => `<option value="${fa.subjectId}">${fa.subjectCode} - ${fa.subjectName}</option>`).join("");

        if (unique.length > 0) {
            select.value = unique[0].subjectId;
            renderFacultyCOList(unique[0].subjectId);
        }
    });
}

function loadFacultyCOsViewForSubject(subjectId) {
    loadFacultyCOsView();
    setTimeout(() => {
        const select = document.getElementById("fac-co-subject-select");
        if (select) {
            select.value = subjectId;
            renderFacultyCOList(subjectId);
        }
    }, 150);
}

function renderFacultyCOList(subjectId) {
    if (!subjectId) {
        document.getElementById("faculty-cos-container").innerHTML = `<p style="color: var(--text-secondary);">Select a subject above.</p>`;
        return;
    }

    fetchAPI(`/api/copo/cos?subjectId=${subjectId}`).then(res => {
        const container = document.getElementById("faculty-cos-container");
        if (!container) return;
        const cos = (res && res.data) ? res.data : [];
        if (cos.length === 0) {
            container.innerHTML = `
                <div style="padding: 20px; background: #fff3cd; border-radius: 8px;">
                    No Course Outcomes defined for this subject yet.
                    <button class="btn btn-primary" style="margin-left: 10px;" onclick="showFacultyAddCoModal()">Add First CO</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>CO Code</th>
                            <th>Description</th>
                            <th>Target Attainment %</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cos.map(c => `
                            <tr>
                                <td><strong>${c.coCode}</strong></td>
                                <td>${c.description}</td>
                                <td><span class="badge badge-level-2">${c.targetAttainmentPct}%</span></td>
                                <td>
                                    <button class="btn btn-danger" style="padding: 4px 8px; font-size: 11px;" onclick="deleteFacultyCo(${c.id}, ${subjectId})"><i class="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    });
}

function showFacultyAddCoModal() {
    const subjectId = document.getElementById("fac-co-subject-select") ? document.getElementById("fac-co-subject-select").value : "";
    if (!subjectId) {
        showToast("Please select a subject first", "error");
        return;
    }

    const html = `
        <form onsubmit="handleFacultyCreateCo(event, ${subjectId})">
            <div class="form-group">
                <label>CO Code (e.g. CO1, CO2, CO3)</label>
                <input type="text" id="fac-co-code" required placeholder="CO1">
            </div>
            <div class="form-group">
                <label>CO Description</label>
                <textarea id="fac-co-desc" rows="3" required placeholder="Understand fundamental database concepts and query optimization..."></textarea>
            </div>
            <div class="form-group">
                <label>Target Attainment Percentage Threshold (%)</label>
                <input type="number" id="fac-co-target" value="60" min="1" max="100" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Add Course Outcome</button>
        </form>
    `;
    openModal("Add Course Outcome", html);
}

function handleFacultyCreateCo(e, subjectId) {
    e.preventDefault();
    const data = {
        subjectId: parseInt(subjectId),
        coCode: document.getElementById("fac-co-code").value.trim(),
        description: document.getElementById("fac-co-desc").value.trim(),
        targetAttainmentPct: parseFloat(document.getElementById("fac-co-target").value)
    };
    fetchAPI("/api/copo/cos", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Course Outcome added", "success");
            closeModal();
            renderFacultyCOList(subjectId);
        } else {
            showToast((res && res.message) ? res.message : "Error adding CO", "error");
        }
    });
}

function deleteFacultyCo(coId, subjectId) {
    if (confirm("Are you sure you want to delete this Course Outcome?")) {
        fetchAPI(`/api/copo/cos/${coId}`, "DELETE").then(res => {
            if (res && res.status === "success") {
                showToast("CO deleted", "success");
                renderFacultyCOList(subjectId);
            } else {
                showToast((res && res.message) ? res.message : "Error deleting CO", "error");
            }
        });
    }
}

// ==========================================
// 7. CO ATTAINMENT ENGINE RUNNER
// ==========================================
function loadFacultyAttainmentView() {
    setActiveNav("nav-faculty-attainment");
    currentViewLoader = loadFacultyAttainmentView;
    document.getElementById("page-title").innerText = "CO-PO Attainment Calculation Engine";
    document.getElementById("page-breadcrumb").innerText = "Faculty / CO-PO Attainment";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Select Subject & Class to Run Attainment Calculations</h3>
            </div>
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                <select id="attainment-subject-select" style="max-width: 400px;" onchange="runAttainmentEngine(this.value)">
                    <option value="">-- Select Subject & Class --</option>
                </select>
            </div>
            <div id="attainment-results-container">
                <p style="color: var(--text-secondary);">Select an assigned subject and class to trigger the automated attainment engine.</p>
            </div>
        </div>
    `;

    fetchAPI("/api/faculty-assignments").then(res => {
        activeFacultyAssignments = (res && res.data) ? res.data : [];
        const select = document.getElementById("attainment-subject-select");
        if (!select) return;
        select.innerHTML = `<option value="">-- Select Subject & Class --</option>` +
            activeFacultyAssignments.map(fa => {
                const cId = fa.classId || fa.batchId;
                const cName = fa.className || fa.batchName || 'Class';
                return `<option value="${fa.subjectId}_${cId}">${fa.subjectCode} - ${fa.subjectName} (${cName})</option>`;
            }).join("");
    });
}

function selectSubjectForAttainment(subjectId, classId) {
    loadFacultyAttainmentView();
    setTimeout(() => {
        const select = document.getElementById("attainment-subject-select");
        if (select) {
            select.value = `${subjectId}_${classId}`;
            runAttainmentEngine(`${subjectId}_${classId}`);
        }
    }, 150);
}

function selectSubjectForMarks(subjectId, classId) {
    loadFacultyMarksView();
    setTimeout(() => {
        const select = document.getElementById("marks-subject-select");
        if (select) {
            select.value = `${subjectId}_${classId}`;
            onMarksSubjectSelect(`${subjectId}_${classId}`);
        }
    }, 150);
}

function selectSubjectForQuizzes(subjectId, classId) {
    loadFacultyQuizzesView();
    setTimeout(() => {
        const select = document.getElementById("fac-quiz-select");
        if (select) {
            select.value = `${subjectId}_${classId}`;
            renderSubjectQuizzes(`${subjectId}_${classId}`);
        }
    }, 150);
}

function runAttainmentEngine(val) {
    if (!val) {
        document.getElementById("attainment-results-container").innerHTML = `<p style="color: var(--text-secondary);">Select a subject and class above.</p>`;
        return;
    }
    const [subjectId, classId] = val.split("_");

    fetchAPI(`/api/attainment/calculate?subjectId=${subjectId}&classId=${classId}`).then(res => {
        const container = document.getElementById("attainment-results-container");
        if (!container) return;
        if (!res || !res.data) {
            container.innerHTML = `<p style="color: var(--text-secondary);">Unable to calculate attainment. Ensure assessments and marks are recorded.</p>`;
            return;
        }

        const data = res.data;
        const attainment = data.attainment || {};
        const stats = data.statistics || {};
        const coMap = attainment.coAttainment || {};
        const poMap = attainment.poAttainment || {};

        const pdfUrl = `${getApiUrl('/api/reports/pdf')}?subjectId=${subjectId}&classId=${classId}`;
        const excelUrl = `${getApiUrl('/api/reports/excel')}?subjectId=${subjectId}&classId=${classId}`;

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                <button class="btn btn-primary" onclick="showPublishIndividualReportsModal(${subjectId}, ${classId})">
                    <i class="fa-solid fa-paper-plane"></i> Publish Individual Reports to Students
                </button>
                <div style="display: flex; gap: 10px;">
                    <a href="${pdfUrl}" class="btn btn-danger" target="_blank"><i class="fa-solid fa-file-pdf"></i> Export Class PDF Report</a>
                    <a href="${excelUrl}" class="btn btn-success" target="_blank"><i class="fa-solid fa-file-excel"></i> Export Class Excel</a>
                </div>
            </div>

            <!-- Stats Bar -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue"><i class="fa-solid fa-users"></i></div>
                    <div class="stat-details">
                        <h4>Class Average %</h4>
                        <span>${stats.classAveragePct || 0}%</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fa-solid fa-trophy"></i></div>
                    <div class="stat-details">
                        <h4>Pass Percentage</h4>
                        <span>${stats.passPct || 0}%</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon amber"><i class="fa-solid fa-chart-line-up"></i></div>
                    <div class="stat-details">
                        <h4>Highest Score</h4>
                        <span>${stats.highestPct || 0}%</span>
                    </div>
                </div>
            </div>

            <!-- CO Table -->
            <div class="card">
                <div class="card-header">
                    <h3>1. Course Outcome (CO) Attainment Summary</h3>
                </div>
                <div class="data-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>CO Code</th>
                                <th>Description</th>
                                <th>Total Attempts</th>
                                <th>Attained Count</th>
                                <th>Attainment %</th>
                                <th>Attainment Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.values(coMap).length === 0 ? '<tr><td colspan="6">No CO data available.</td></tr>' : Object.values(coMap).map(c => `
                                <tr>
                                    <td><strong>${c.coCode}</strong></td>
                                    <td>${c.description}</td>
                                    <td>${c.totalAttempts}</td>
                                    <td>${c.attainedCount}</td>
                                    <td>${c.attainmentPct}%</td>
                                    <td><span class="badge badge-level-${Math.floor(c.attainmentLevel || 0)}">Level ${c.attainmentLevel}</span></td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- PO Table & Graph -->
            <div class="card">
                <div class="card-header">
                    <h3>2. Programme Outcome (PO) Attainment Level Summary</h3>
                </div>
                <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px;" class="data-table-wrapper">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>PO Code</th>
                                    <th>CO Mapping Strength Sum</th>
                                    <th>Attainment Level (0 - 3)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.values(poMap).length === 0 ? '<tr><td colspan="3">No PO mappings found.</td></tr>' : Object.values(poMap).map(p => `
                                    <tr>
                                        <td><strong>${p.poCode}</strong></td>
                                        <td>${p.totalStrength}</td>
                                        <td><span class="badge badge-level-${Math.floor(p.poAttainmentLevel || 0)}">Level ${p.poAttainmentLevel}</span></td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                    <div style="flex: 1; min-width: 300px; height: 280px;">
                        <canvas id="poAttainmentChart"></canvas>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;

        // Render Chart.js Graph
        setTimeout(() => {
            const chartCanvas = document.getElementById("poAttainmentChart");
            if (!chartCanvas) return;
            const ctx = chartCanvas.getContext("2d");
            const poLabels = Object.values(poMap).map(p => p.poCode);
            const poLevels = Object.values(poMap).map(p => p.poAttainmentLevel);

            if (attainmentChartInstance) attainmentChartInstance.destroy();

            attainmentChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: poLabels,
                    datasets: [{
                        label: 'PO Attainment Level (0 to 3)',
                        data: poLevels,
                        backgroundColor: '#2563eb',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            min: 0,
                            max: 3,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });
        }, 100);
    });
}

// ==========================================
// 8. CLASS REPORTS & PUBLISH INDIVIDUAL REPORTS
// ==========================================
function loadFacultyReportsView() {
    setActiveNav("nav-faculty-reports");
    currentViewLoader = loadFacultyReportsView;
    document.getElementById("page-title").innerText = "Class Academic Reports";
    document.getElementById("page-breadcrumb").innerText = "Faculty / Class Reports";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Generate Class Reports & Publish to Students</h3>
            </div>
            <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <label style="font-weight: 600;">Select Assigned Subject & Class: </label>
                <select id="fac-reports-select" style="max-width: 400px;" onchange="renderReportsPanel(this.value)">
                    <option value="">-- Select Subject & Class --</option>
                </select>
            </div>
            <div id="reports-panel-container">
                <p style="color: var(--text-secondary);">Select a subject and class above to access performance reports.</p>
            </div>
        </div>
    `;

    fetchAPI("/api/faculty-assignments").then(res => {
        activeFacultyAssignments = (res && res.data) ? res.data : [];
        const select = document.getElementById("fac-reports-select");
        if (!select) return;
        select.innerHTML = `<option value="">-- Select Subject & Class --</option>` +
            activeFacultyAssignments.map(fa => {
                const cId = fa.classId || fa.batchId;
                const cName = fa.className || fa.batchName || 'Class';
                return `<option value="${fa.subjectId}_${cId}">${fa.subjectCode} - ${fa.subjectName} (${cName})</option>`;
            }).join("");

        if (activeFacultyAssignments.length > 0) {
            const first = activeFacultyAssignments[0];
            const firstVal = `${first.subjectId}_${first.classId || first.batchId}`;
            select.value = firstVal;
            renderReportsPanel(firstVal);
        }
    });
}

function renderReportsPanel(val) {
    if (!val) {
        document.getElementById("reports-panel-container").innerHTML = `<p style="color: var(--text-secondary);">Select a subject and class above.</p>`;
        return;
    }
    const [subjectId, classId] = val.split("_");

    const pdfUrl = `${getApiUrl('/api/reports/pdf')}?subjectId=${subjectId}&classId=${classId}`;
    const excelUrl = `${getApiUrl('/api/reports/excel')}?subjectId=${subjectId}&classId=${classId}`;

    fetchAPI(`/api/student-reports?subjectId=${subjectId}&classId=${classId}`).then(res => {
        const publishedReports = (res && res.data) ? res.data : [];

        let html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 25px;">
                <div style="border: 1px solid var(--border-color); padding: 20px; border-radius: 8px; background: #f8fafc;">
                    <h4 style="font-size: 16px; margin-bottom: 8px;"><i class="fa-solid fa-file-pdf" style="color: #dc2626;"></i> Class Performance Report (PDF)</h4>
                    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 15px;">Complete compilation of question-wise marks, student performance, and CO-PO attainment levels.</p>
                    <a href="${pdfUrl}" target="_blank" class="btn btn-danger"><i class="fa-solid fa-download"></i> Download Class PDF</a>
                </div>
                <div style="border: 1px solid var(--border-color); padding: 20px; border-radius: 8px; background: #f8fafc;">
                    <h4 style="font-size: 16px; margin-bottom: 8px;"><i class="fa-solid fa-file-excel" style="color: #16a34a;"></i> Class Marksheet (Excel)</h4>
                    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 15px;">Spreadsheet containing raw marks, student roll numbers, and question-level attainment data.</p>
                    <a href="${excelUrl}" target="_blank" class="btn btn-success"><i class="fa-solid fa-download"></i> Download Excel</a>
                </div>
                <div style="border: 1px solid var(--border-color); padding: 20px; border-radius: 8px; background: #f8fafc;">
                    <h4 style="font-size: 16px; margin-bottom: 8px;"><i class="fa-solid fa-paper-plane" style="color: #2563eb;"></i> Publish Individual Reports</h4>
                    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 15px;">Generate personalized attainment report cards and dispatch them directly to each student's portal.</p>
                    <button class="btn btn-primary" onclick="showPublishIndividualReportsModal(${subjectId}, ${classId})"><i class="fa-solid fa-share-nodes"></i> Publish to Students</button>
                </div>
            </div>

            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3>Dispatched Student Reports History</h3>
                </div>
                <div class="data-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Roll Number</th>
                                <th>Student Name</th>
                                <th>Report Title</th>
                                <th>Dispatched Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${publishedReports.length === 0 ? '<tr><td colspan="5">No individual student reports published yet for this class.</td></tr>' : publishedReports.map(r => `
                                <tr>
                                    <td><strong>${r.rollNumber || '-'}</strong></td>
                                    <td>${r.studentName || '-'}</td>
                                    <td>${r.title}</td>
                                    <td>${r.publishedAt || '-'}</td>
                                    <td>
                                        <a href="${getApiUrl('/api/student-reports/pdf')}?reportId=${r.id}" target="_blank" class="btn btn-danger" style="padding: 3px 8px; font-size: 11px;"><i class="fa-solid fa-file-pdf"></i> View PDF</a>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.getElementById("reports-panel-container").innerHTML = html;
    });
}

function showPublishIndividualReportsModal(subjectId, classId) {
    const html = `
        <form onsubmit="handlePublishReportsSubmit(event, ${subjectId}, ${classId})">
            <div class="form-group">
                <label>Report Title</label>
                <input type="text" id="report-title" value="Semester Outcome Attainment Report" required>
            </div>
            <div class="form-group">
                <label>Faculty Remarks / Message to Students</label>
                <textarea id="report-remarks" rows="3" placeholder="Congratulations on completing the semester. Review your CO attainment strengths and areas for improvement."></textarea>
            </div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 15px;">
                <i class="fa-solid fa-info-circle"></i> This will calculate individual CO/PO attainment for every student in this class and publish a downloadable report card directly to their student dashboard.
            </p>
            <button type="submit" class="btn btn-primary btn-block">Publish Reports Now</button>
        </form>
    `;
    openModal("Publish Individual Student Reports", html);
}

function handlePublishReportsSubmit(e, subjectId, classId) {
    e.preventDefault();
    const data = {
        subjectId: subjectId,
        classId: classId,
        batchId: classId,
        title: document.getElementById("report-title").value.trim(),
        remarks: document.getElementById("report-remarks").value.trim()
    };
    fetchAPI("/api/student-reports/publish", "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Individual reports published to all students in this class!", "success");
            closeModal();
            renderReportsPanel(`${subjectId}_${classId}`);
        } else {
            showToast((res && res.message) ? res.message : "Error publishing reports", "error");
        }
    });
}
