// OBE System - Student Portal Module Components

let studentQuizTimerInterval = null;

// ==========================================
// 1. STUDENT DASHBOARD
// ==========================================
function loadStudentDashboard() {
    setActiveNav("nav-student-dashboard");
    currentViewLoader = loadStudentDashboard;
    document.getElementById("page-title").innerText = "Student Dashboard";
    document.getElementById("page-breadcrumb").innerText = "Home / Student Dashboard";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue"><i class="fa-solid fa-book"></i></div>
                <div class="stat-details">
                    <h4>Enrolled Subjects</h4>
                    <span id="stu-stat-subjects">...</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon amber"><i class="fa-solid fa-calendar-days"></i></div>
                <div class="stat-details">
                    <h4>Upcoming Assessments</h4>
                    <span id="stu-stat-assessments">...</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i class="fa-solid fa-clipboard-question"></i></div>
                <div class="stat-details">
                    <h4>Active Quizzes</h4>
                    <span id="stu-stat-quizzes">...</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple"><i class="fa-solid fa-chart-simple"></i></div>
                <div class="stat-details">
                    <h4>Overall Attendance</h4>
                    <span id="stu-stat-attendance">...</span>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
            <!-- Academic Profile Card -->
            <div class="card">
                <div class="card-header">
                    <h3>My Academic Profile</h3>
                    <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 12px;" onclick="loadStudentProfileView()"><i class="fa-solid fa-user-pen"></i> Edit Profile</button>
                </div>
                <div id="stu-dash-profile">
                    <p style="color: var(--text-secondary);">Loading student details...</p>
                </div>
            </div>

            <!-- Recent Marks & Activity -->
            <div class="card">
                <div class="card-header">
                    <h3>Recent Marks</h3>
                    <button class="btn btn-primary" style="padding: 4px 10px; font-size: 12px;" onclick="loadStudentMarksView()"><i class="fa-solid fa-arrow-right"></i> View Marksheet</button>
                </div>
                <div id="stu-dash-recent-marks">
                    <p style="color: var(--text-secondary);">Loading marks...</p>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 20px;">
            <div class="card-header">
                <h3>Quick Academic Navigation</h3>
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="loadStudentSubjectsView()"><i class="fa-solid fa-book"></i> My Subjects</button>
                <button class="btn btn-success" onclick="loadStudentAssessmentsView()"><i class="fa-solid fa-clipboard-list"></i> My Assessment</button>
                <button class="btn btn-info" onclick="loadStudentQuizzesView()"><i class="fa-solid fa-clipboard-question"></i> Quizzes</button>
                <button class="btn btn-secondary" onclick="loadStudentCoAttainmentView()"><i class="fa-solid fa-bullseye"></i> CO Attainment</button>
                <button class="btn btn-secondary" onclick="loadStudentPoAttainmentView()"><i class="fa-solid fa-chart-pie"></i> PO Attainment</button>
                <button class="btn btn-danger" onclick="loadStudentReportsView()"><i class="fa-solid fa-file-arrow-down"></i> My Reports</button>
            </div>
        </div>
    `;

    fetchAPI("/api/student/dashboard").then(res => {
        if (!res || !res.data) return;
        const d = res.data;
        const prof = d.profile || {};

        document.getElementById("stu-stat-subjects").innerText = d.totalSubjects || 0;
        document.getElementById("stu-stat-assessments").innerText = d.upcomingAssessments || 0;
        document.getElementById("stu-stat-quizzes").innerText = d.activeQuizzes || 0;
        document.getElementById("stu-stat-attendance").innerText = (d.attendancePercentage !== undefined ? d.attendancePercentage : 0) + "%";

        const profContainer = document.getElementById("stu-dash-profile");
        if (profContainer) {
            profContainer.innerHTML = `
                <table class="data-table">
                    <tr><td><strong>Full Name:</strong></td><td>${prof.name || '-'}</td></tr>
                    <tr><td><strong>Roll Number:</strong></td><td><strong>${prof.rollNumber || '-'}</strong></td></tr>
                    <tr><td><strong>Assigned Class:</strong></td><td><strong>${prof.className || '-'}</strong></td></tr>
                    <tr><td><strong>Department:</strong></td><td>${prof.departmentName || '-'}</td></tr>
                </table>
            `;
        }

        const marksContainer = document.getElementById("stu-dash-recent-marks");
        if (marksContainer) {
            const marks = d.recentMarks || [];
            if (marks.length === 0) {
                marksContainer.innerHTML = `<p style="color: var(--text-secondary);">No assessment marks recorded yet.</p>`;
            } else {
                marksContainer.innerHTML = `
                    <div class="data-table-wrapper">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Assessment</th>
                                    <th>Question</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${marks.map(m => `
                                    <tr>
                                        <td><strong>${m.subjectCode}</strong></td>
                                        <td>${m.assessmentTitle}</td>
                                        <td>${m.questionNumber}</td>
                                        <td><strong>${m.isAbsent ? '<span style="color: red;">ABSENT</span>' : m.marksObtained + ' / ' + m.maxMarks}</strong></td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }
    });
}

// ==========================================
// 2. MY PROFILE VIEW & EDIT
// ==========================================
let currentStudentProfile = null;

function loadStudentProfileView() {
    setActiveNav("nav-student-profile");
    currentViewLoader = loadStudentProfileView;
    document.getElementById("page-title").innerText = "My Profile";
    document.getElementById("page-breadcrumb").innerText = "Student / My Profile";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card" style="max-width: 680px;">
            <div class="card-header">
                <h3>Personal & Academic Information</h3>
                <button class="btn btn-primary" onclick="showEditStudentProfileModal()"><i class="fa-solid fa-pen-to-square"></i> Edit Details</button>
            </div>
            <div id="student-full-profile-body">
                <p style="color: var(--text-secondary);">Loading profile details...</p>
            </div>
        </div>
    `;

    fetchAPI("/api/student/profile").then(res => {
        const body = document.getElementById("student-full-profile-body");
        if (!body) return;
        if (!res || !res.data) {
            body.innerHTML = `<p style="color: var(--text-secondary);">Error loading profile.</p>`;
            return;
        }
        currentStudentProfile = res.data;
        const p = res.data;
        body.innerHTML = `
            <table class="data-table">
                <tr><td style="width: 200px;"><strong>Full Name:</strong></td><td>${p.fullName}</td></tr>
                <tr><td><strong>Roll Number:</strong></td><td><strong>${p.rollNumber}</strong></td></tr>
                <tr><td><strong>Register Number:</strong></td><td>${p.registerNumber}</td></tr>
                <tr><td><strong>Username:</strong></td><td>${p.username}</td></tr>
                <tr><td><strong>Email Address:</strong></td><td>${p.email}</td></tr>
                <tr><td><strong>Department:</strong></td><td>${p.departmentName} (${p.departmentCode})</td></tr>
                <tr><td><strong>Assigned Class:</strong></td><td><strong>${p.className}</strong></td></tr>
                <tr><td><strong>Phone Number:</strong></td><td>${p.phone || '<span style="color: var(--text-secondary);">(Not set)</span>'}</td></tr>
                <tr><td><strong>Date of Birth:</strong></td><td>${p.dateOfBirth || '<span style="color: var(--text-secondary);">(Not set)</span>'}</td></tr>
            </table>
            <div style="margin-top: 15px; font-size: 12px; color: var(--text-secondary);">
                <i class="fa-solid fa-circle-info"></i> Academic details such as Class, Department, Roll No, and Register No can only be modified by the System Administrator.
            </div>
        `;
    });
}

function showEditStudentProfileModal() {
    if (!currentStudentProfile) return;
    const p = currentStudentProfile;
    const html = `
        <form onsubmit="handleUpdateStudentProfile(event)">
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="edit-stu-email" value="${p.email || ''}" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="edit-stu-phone" value="${p.phone || ''}" placeholder="9876543210">
            </div>
            <div class="form-group">
                <label>Date of Birth</label>
                <input type="date" id="edit-stu-dob" value="${p.dateOfBirth || ''}">
            </div>
            <button type="submit" class="btn btn-success btn-block">Save Profile Changes</button>
        </form>
    `;
    openModal("Edit Personal Details", html);
}

function handleUpdateStudentProfile(e) {
    e.preventDefault();
    const data = {
        email: document.getElementById("edit-stu-email").value.trim(),
        phone: document.getElementById("edit-stu-phone").value.trim(),
        dateOfBirth: document.getElementById("edit-stu-dob").value || null
    };

    fetchAPI("/api/student/profile", "PUT", data).then(res => {
        if (res && res.status === "success") {
            showToast("Profile details updated successfully", "success");
            closeModal();
            loadStudentProfileView();
        } else {
            showToast((res && res.message) ? res.message : "Error updating profile", "error");
        }
    });
}

// ==========================================
// 3. MY SUBJECTS VIEW
// ==========================================
function loadStudentSubjectsView() {
    setActiveNav("nav-student-subjects");
    currentViewLoader = loadStudentSubjectsView;
    document.getElementById("page-title").innerText = "My Subjects";
    document.getElementById("page-breadcrumb").innerText = "Student / My Subjects";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Enrolled Subjects for Your Class</h3>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Credits</th>
                            <th>Semester</th>
                            <th>Subject Type</th>
                            <th>Class</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="student-subjects-tbody">
                        <tr><td colspan="7">Loading subjects...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/student/subjects").then(res => {
        const tbody = document.getElementById("student-subjects-tbody");
        if (!tbody) return;
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7">No subjects currently assigned to your class.</td></tr>`;
            return;
        }

        tbody.innerHTML = res.data.map(s => `
            <tr>
                <td><strong>${s.code}</strong></td>
                <td>${s.name}</td>
                <td>${s.credits} Credits</td>
                <td>Sem ${s.semester}</td>
                <td><span class="badge badge-level-2">${s.subjectType}</span></td>
                <td><strong>${s.className || '-'}</strong></td>
                <td>
                    <button class="btn btn-primary" style="padding: 4px 8px; font-size: 11px;" onclick="loadStudentCoAttainmentForSubject(${s.id})">
                        <i class="fa-solid fa-bullseye"></i> CO Attainment
                    </button>
                </td>
            </tr>
        `).join("");
    });
}

// ==========================================
// 4. MY ASSESSMENTS VIEW (published faculty assessments)
// ==========================================
let currentStudentAssessments = [];

function loadStudentAssessmentsView() {
    setActiveNav("nav-student-assessments");
    currentViewLoader = loadStudentAssessmentsView;
    document.getElementById("page-title").innerText = "My Assessment";
    document.getElementById("page-breadcrumb").innerText = "Student / My Assessment";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Published Assessments for Your Class</h3>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Subject</th>
                            <th>Faculty</th>
                            <th>Total Marks</th>
                            <th>Exam Date</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Score / Feedback</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="student-assessments-tbody">
                        <tr><td colspan="10">Loading assessments...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/student/assessments").then(res => {
        const tbody = document.getElementById("student-assessments-tbody");
        if (!tbody) return;
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10">No assessments have been published for your class yet.</td></tr>`;
            return;
        }

        currentStudentAssessments = res.data;
        tbody.innerHTML = res.data.map(a => {
            const isSub = a.submitted === true;
            const isAssignment = a.type === "ASSIGNMENT";
            const isLive = a.isLive === true;
            return `
                <tr>
                    <td>
                        <strong>${a.title}</strong>
                        ${a.instructions ? `<br><small style="color: var(--text-secondary);">${a.instructions}</small>` : ''}
                    </td>
                    <td>${(a.type || '').replaceAll('_', ' ')}</td>
                    <td>${a.subjectCode} - ${a.subjectName}</td>
                    <td>${a.facultyName || '-'}</td>
                    <td>${a.totalMarks} Marks</td>
                    <td>${a.assessmentDate || '-'}</td>
                    <td>${a.dueDate || '-'}</td>
                    <td>
                        <span class="badge ${isLive ? 'badge-level-3' : 'badge-level-1'}">${isLive ? (isSub ? 'SUBMITTED' : 'LIVE') : 'CLOSED'}</span>
                    </td>
                    <td>
                        ${isAssignment && isSub ? (a.marksAwarded !== null && a.marksAwarded !== undefined ? `<strong>${a.marksAwarded} / ${a.totalMarks}</strong>` : '<span style="color: var(--text-secondary);">Awaiting Evaluation</span>') : '-'}
                        ${a.feedback ? `<br><small style="color: #15803d;">${a.feedback}</small>` : ''}
                    </td>
                    <td>
                        ${isAssignment && isLive && !isSub ? `<button class="btn btn-primary" style="padding: 4px 10px; font-size: 11px;" onclick="showAssignmentSubmissionModal(${a.id})"><i class="fa-solid fa-upload"></i> Submit Answer</button>` : '<span style="color: var(--text-secondary);">—</span>'}
                    </td>
                </tr>
            `;
        }).join("");
    });
}

function showAssignmentSubmissionModal(assessmentId) {
    const a = currentStudentAssessments.find(item => item.id === assessmentId);
    if (!a) return;

    const html = `
        <form onsubmit="handleSubmitAssignmentForm(event, ${assessmentId})">
            <div class="form-group">
                <label>Assignment Title</label>
                <input type="text" value="${a.title} (${a.subjectCode})" readonly style="background: #f8fafc;">
            </div>
            ${a.instructions ? `
                <div style="background: #f1f5f9; padding: 10px 14px; border-radius: 6px; margin-bottom: 15px; font-size: 13px;">
                    <strong>Instructions:</strong> ${a.instructions}
                </div>
            ` : ''}
            <div class="form-group">
                <label>Written Answer / Response Text</label>
                <textarea id="sub-text" rows="5" placeholder="Type your answers, code, or explanation here...">${a.submissionText || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Attachment URL / Drive Link (Optional)</label>
                <input type="url" id="sub-file" value="${a.submissionFile || ''}" placeholder="https://drive.google.com/file/...">
                <small style="color: var(--text-secondary);">Provide link to GitHub repo, Google Drive PDF, or OneDrive document if required.</small>
            </div>
            <button type="submit" class="btn btn-primary btn-block"><i class="fa-solid fa-paper-plane"></i> Submit Assignment</button>
        </form>
    `;
    openModal("Submit Assignment", html);
}

function handleSubmitAssignmentForm(e, assessmentId) {
    e.preventDefault();
    const data = {
        submissionText: document.getElementById("sub-text").value.trim(),
        submissionFile: document.getElementById("sub-file").value.trim()
    };

    fetchAPI(`/api/student/assignments/${assessmentId}/submit`, "POST", data).then(res => {
        if (res && res.status === "success") {
            showToast("Assignment submitted successfully!", "success");
            closeModal();
            loadStudentAssessmentsView();
        } else {
            showToast((res && res.message) ? res.message : "Error submitting assignment", "error");
        }
    });
}

// ==========================================
// 5. MY MARKS VIEW
// ==========================================
function loadStudentMarksView() {
    setActiveNav("nav-student-marks");
    currentViewLoader = loadStudentMarksView;
    document.getElementById("page-title").innerText = "Academic Marksheet";
    document.getElementById("page-breadcrumb").innerText = "Student / My Marks";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Assessment Marks Breakdown</h3>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Assessment</th>
                            <th>Exam Type</th>
                            <th>Question</th>
                            <th>Max Marks</th>
                            <th>Marks Obtained</th>
                            <th>Performance Grade</th>
                        </tr>
                    </thead>
                    <tbody id="student-marksheet-tbody">
                        <tr><td colspan="7">Loading marksheet...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/student/marks").then(res => {
        const tbody = document.getElementById("student-marksheet-tbody");
        if (!tbody) return;
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7">No assessment marks recorded yet for your account.</td></tr>`;
            return;
        }

        tbody.innerHTML = res.data.map(m => {
            const pct = m.maxMarks > 0 ? (m.marksObtained * 100.0 / m.maxMarks) : 0;
            let grade = 'F';
            let badgeClass = 'badge-level-0';
            if (m.isAbsent) {
                grade = 'ABSENT';
            } else if (pct >= 90) {
                grade = 'O (Outstanding)';
                badgeClass = 'badge-level-3';
            } else if (pct >= 80) {
                grade = 'A+ (Excellent)';
                badgeClass = 'badge-level-3';
            } else if (pct >= 70) {
                grade = 'A (Very Good)';
                badgeClass = 'badge-level-2';
            } else if (pct >= 60) {
                grade = 'B+ (Good)';
                badgeClass = 'badge-level-2';
            } else if (pct >= 50) {
                grade = 'B (Above Average)';
                badgeClass = 'badge-level-1';
            } else if (pct >= 40) {
                grade = 'C (Pass)';
                badgeClass = 'badge-level-1';
            }

            return `
                <tr>
                    <td><strong>${m.subjectCode}</strong> - ${m.subjectName}</td>
                    <td>${m.assessmentTitle}</td>
                    <td><span class="badge badge-level-2">${m.assessmentType}</span></td>
                    <td>${m.questionNumber}</td>
                    <td>${m.maxMarks}</td>
                    <td><strong>${m.isAbsent ? '<span style="color: red;">ABSENT</span>' : m.marksObtained}</strong></td>
                    <td><span class="badge ${badgeClass}">${grade}</span></td>
                </tr>
            `;
        }).join("");
    });
}

// Backward compatibility alias for legacy call
function loadStudentMarksheetView() {
    loadStudentMarksView();
}

// ==========================================
// 6. ONLINE QUIZZES & INTERACTIVE QUIZ TAKING
// ==========================================
let currentStudentQuizzes = [];

function loadStudentQuizzesView() {
    setActiveNav("nav-student-quizzes");
    currentViewLoader = loadStudentQuizzesView;
    document.getElementById("page-title").innerText = "Online Quizzes";
    document.getElementById("page-breadcrumb").innerText = "Student / Quizzes";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Available Online Quizzes</h3>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Quiz Title</th>
                            <th>Subject</th>
                            <th>Time Limit</th>
                            <th>Total Marks</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="student-quizzes-tbody">
                        <tr><td colspan="7">Loading quizzes...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/quizzes").then(res => {
        const tbody = document.getElementById("student-quizzes-tbody");
        if (!tbody) return;
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7">No active quizzes published for your class right now.</td></tr>`;
            return;
        }

        currentStudentQuizzes = res.data;
        tbody.innerHTML = res.data.map(q => {
            const attempted = q.isAttemptedByCurrentUser === true;
            return `
                <tr>
                    <td>
                        <strong>${q.title}</strong>
                        ${q.description ? `<br><small style="color: var(--text-secondary);">${q.description}</small>` : ''}
                    </td>
                    <td>${q.subjectCode} - ${q.subjectName}</td>
                    <td><i class="fa-solid fa-clock"></i> ${q.timeLimitMinutes} mins</td>
                    <td>${q.totalMarks} Marks</td>
                    <td>${q.dueDate || '-'}</td>
                    <td>
                        <span class="badge ${attempted ? 'badge-level-3' : 'badge-level-1'}">${attempted ? 'COMPLETED' : 'AVAILABLE'}</span>
                    </td>
                    <td>
                        ${attempted ? `
                            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11px;" onclick="viewQuizScore(${q.id})">
                                <i class="fa-solid fa-check"></i> Score: ${q.userScore} / ${q.totalMarks}
                            </button>
                        ` : `
                            <button class="btn btn-success" style="padding: 4px 10px; font-size: 11px;" onclick="startQuizAttemptModal(${q.id})">
                                <i class="fa-solid fa-play"></i> Start Quiz
                            </button>
                        `}
                    </td>
                </tr>
            `;
        }).join("");
    });
}

function startQuizAttemptModal(quizId) {
    fetchAPI(`/api/quizzes/${quizId}`).then(res => {
        const q = (res && res.data) ? res.data : null;
        if (!q || !q.questions || q.questions.length === 0) {
            showToast("Quiz details or questions could not be loaded.", "error");
            return;
        }

        let timeRemainingSeconds = q.timeLimitMinutes * 60;

        let questionsHtml = q.questions.map((qn, idx) => `
            <div class="quiz-question-box" style="margin-bottom: 20px; padding: 16px; border: 1px solid var(--border-color); border-radius: 8px; background: #fff;">
                <p style="font-size: 15px; font-weight: 600; margin-bottom: 12px;">${idx + 1}. ${qn.questionText} <span style="font-size: 12px; color: var(--text-secondary); font-weight: normal;">(${qn.marks} Marks)</span></p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px; border-radius: 4px; background: #f8fafc;">
                        <input type="radio" name="quiz_q_${qn.id}" value="A" required>
                        <span><strong>A)</strong> ${qn.optionA}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px; border-radius: 4px; background: #f8fafc;">
                        <input type="radio" name="quiz_q_${qn.id}" value="B">
                        <span><strong>B)</strong> ${qn.optionB}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px; border-radius: 4px; background: #f8fafc;">
                        <input type="radio" name="quiz_q_${qn.id}" value="C">
                        <span><strong>C)</strong> ${qn.optionC}</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px; border-radius: 4px; background: #f8fafc;">
                        <input type="radio" name="quiz_q_${qn.id}" value="D">
                        <span><strong>D)</strong> ${qn.optionD}</span>
                    </label>
                </div>
            </div>
        `).join("");

        const html = `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; background: #e0f2fe; padding: 12px 18px; border-radius: 8px; margin-bottom: 18px;">
                    <div>
                        <strong style="color: #0369a1; font-size: 16px;">${q.title}</strong>
                        <div style="font-size: 12px; color: var(--text-secondary);">Total Questions: ${q.questions.length} | Total Marks: ${q.totalMarks}</div>
                    </div>
                    <div style="font-size: 18px; font-weight: 700; color: #dc2626;" id="quiz-live-timer">
                        <i class="fa-solid fa-stopwatch"></i> ${formatTime(timeRemainingSeconds)}
                    </div>
                </div>

                <form id="quiz-attempt-form" onsubmit="handleQuizSubmit(event, ${quizId}, ${JSON.stringify(q.questions.map(item => item.id))})">
                    ${questionsHtml}
                    <button type="submit" class="btn btn-success btn-block" style="padding: 12px; font-size: 16px;"><i class="fa-solid fa-circle-check"></i> Submit Answers</button>
                </form>
            </div>
        `;
        openModal("Attempt Quiz", html);

        // Timer interval
        if (studentQuizTimerInterval) clearInterval(studentQuizTimerInterval);
        studentQuizTimerInterval = setInterval(() => {
            timeRemainingSeconds--;
            const timerEl = document.getElementById("quiz-live-timer");
            if (timerEl) {
                timerEl.innerHTML = `<i class="fa-solid fa-stopwatch"></i> ${formatTime(timeRemainingSeconds)}`;
            }
            if (timeRemainingSeconds <= 0) {
                clearInterval(studentQuizTimerInterval);
                showToast("Time's up! Auto-submitting quiz.", "error");
                const form = document.getElementById("quiz-attempt-form");
                if (form) form.requestSubmit();
            }
        }, 1000);
    });
}

function formatTime(seconds) {
    if (seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function handleQuizSubmit(e, quizId, questionIds) {
    e.preventDefault();
    if (studentQuizTimerInterval) clearInterval(studentQuizTimerInterval);

    const answers = [];
    questionIds.forEach(qId => {
        const checked = document.querySelector(`input[name="quiz_q_${qId}"]:checked`);
        if (checked) {
            answers.push({
                questionId: qId,
                selectedOption: checked.value
            });
        }
    });

    fetchAPI("/api/quizzes/submit", "POST", { quizId: quizId, answers: answers }).then(res => {
        if (res && res.status === "success") {
            const data = res.data;
            showToast(`Quiz completed! You scored ${data.score} out of ${data.totalMarks}.`, "success");
            closeModal();
            loadStudentQuizzesView();
        } else {
            showToast((res && res.message) ? res.message : "Error submitting quiz", "error");
        }
    });
}

function viewQuizScore(quizId) {
    const q = currentStudentQuizzes.find(item => item.id === quizId);
    if (!q) return;
    const html = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; color: #16a34a; margin-bottom: 10px;">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <h3>${q.title}</h3>
            <p style="color: var(--text-secondary); margin-bottom: 15px;">${q.subjectCode} - ${q.subjectName}</p>
            <div style="font-size: 28px; font-weight: 700; color: var(--primary-color); margin-bottom: 10px;">
                ${q.userScore} / ${q.totalMarks} Marks
            </div>
            <p style="font-size: 13px; color: var(--text-secondary);">Your answers were submitted and graded automatically.</p>
        </div>
    `;
    openModal("Quiz Result", html);
}

// ==========================================
// 7. CO ATTAINMENT VIEW FOR STUDENT
// ==========================================
function loadStudentCoAttainmentView() {
    setActiveNav("nav-student-coattainment");
    currentViewLoader = loadStudentCoAttainmentView;
    document.getElementById("page-title").innerText = "Course Outcome (CO) Attainment";
    document.getElementById("page-breadcrumb").innerText = "Student / CO Attainment";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Select Subject to View Your CO Attainment</h3>
            </div>
            <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <label style="font-weight: 600;">Subject:</label>
                <select id="stu-co-subject-select" style="max-width: 380px;" onchange="renderStudentCoAttainment(this.value)">
                    <option value="">-- Select Subject --</option>
                </select>
            </div>
            <div id="stu-co-results-container">
                <p style="color: var(--text-secondary);">Select a subject above to view attainment calculation details.</p>
            </div>
        </div>
    `;

    fetchAPI("/api/student/subjects").then(res => {
        const select = document.getElementById("stu-co-subject-select");
        if (!select || !res || !res.data) return;
        select.innerHTML = `<option value="">-- Select Subject --</option>` +
            res.data.map(s => `<option value="${s.id}">${s.code} - ${s.name}</option>`).join("");

        if (res.data.length > 0) {
            select.value = res.data[0].id;
            renderStudentCoAttainment(res.data[0].id);
        }
    });
}

function loadStudentCoAttainmentForSubject(subjectId) {
    loadStudentCoAttainmentView();
    setTimeout(() => {
        const select = document.getElementById("stu-co-subject-select");
        if (select) {
            select.value = subjectId;
            renderStudentCoAttainment(subjectId);
        }
    }, 150);
}

function renderStudentCoAttainment(subjectId) {
    if (!subjectId) {
        document.getElementById("stu-co-results-container").innerHTML = `<p style="color: var(--text-secondary);">Select a subject above.</p>`;
        return;
    }

    fetchAPI(`/api/student/co-attainment?subjectId=${subjectId}`).then(res => {
        const container = document.getElementById("stu-co-results-container");
        if (!container) return;
        if (!res || !res.data) {
            container.innerHTML = `<p style="color: var(--text-secondary);">No CO attainment data recorded for this subject.</p>`;
            return;
        }

        const data = res.data;
        const coMap = data.coAttainment || {};

        container.innerHTML = `
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>CO Code</th>
                            <th>Description</th>
                            <th>Target %</th>
                            <th>My Score %</th>
                            <th>Attainment Status</th>
                            <th>Attainment Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.values(coMap).length === 0 ? '<tr><td colspan="6">No Course Outcomes evaluated for this subject yet.</td></tr>' : Object.values(coMap).map(c => {
                            const isAttained = (c.isAttained === true || c.attainmentPct >= c.targetPct);
                            return `
                                <tr>
                                    <td><strong>${c.coCode}</strong></td>
                                    <td>${c.description}</td>
                                    <td>${c.targetPct || 60}%</td>
                                    <td><strong>${c.attainmentPct}%</strong></td>
                                    <td>
                                        <span class="badge ${isAttained ? 'badge-level-3' : 'badge-level-0'}">${isAttained ? 'ATTAINED' : 'NOT ATTAINED'}</span>
                                    </td>
                                    <td><span class="badge badge-level-${Math.floor(c.attainmentLevel || 0)}">Level ${c.attainmentLevel || 0}</span></td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; font-size: 12px; color: var(--text-secondary);">
                <strong>Formula:</strong> CO Attainment is derived from marks scored in mapped assessment questions divided by question maximum marks.
            </div>
        `;
    });
}

// ==========================================
// 8. PO ATTAINMENT VIEW FOR STUDENT
// ==========================================
function loadStudentPoAttainmentView() {
    setActiveNav("nav-student-poattainment");
    currentViewLoader = loadStudentPoAttainmentView;
    document.getElementById("page-title").innerText = "Programme Outcome (PO) Attainment";
    document.getElementById("page-breadcrumb").innerText = "Student / PO Attainment";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Select Subject to View Calculated PO Attainment</h3>
            </div>
            <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <label style="font-weight: 600;">Subject:</label>
                <select id="stu-po-subject-select" style="max-width: 380px;" onchange="renderStudentPoAttainment(this.value)">
                    <option value="">-- Select Subject --</option>
                </select>
            </div>
            <div id="stu-po-results-container">
                <p style="color: var(--text-secondary);">Select a subject above to view derived PO attainment.</p>
            </div>
        </div>
    `;

    fetchAPI("/api/student/subjects").then(res => {
        const select = document.getElementById("stu-po-subject-select");
        if (!select || !res || !res.data) return;
        select.innerHTML = `<option value="">-- Select Subject --</option>` +
            res.data.map(s => `<option value="${s.id}">${s.code} - ${s.name}</option>`).join("");

        if (res.data.length > 0) {
            select.value = res.data[0].id;
            renderStudentPoAttainment(res.data[0].id);
        }
    });
}

function renderStudentPoAttainment(subjectId) {
    if (!subjectId) {
        document.getElementById("stu-po-results-container").innerHTML = `<p style="color: var(--text-secondary);">Select a subject above.</p>`;
        return;
    }

    fetchAPI(`/api/student/po-attainment?subjectId=${subjectId}`).then(res => {
        const container = document.getElementById("stu-po-results-container");
        if (!container) return;
        if (!res || !res.data) {
            container.innerHTML = `<p style="color: var(--text-secondary);">No PO attainment data recorded for this subject.</p>`;
            return;
        }

        const poMap = res.data;
        container.innerHTML = `
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Programme Outcome</th>
                            <th>CO Matrix Correlation Sum</th>
                            <th>Achieved Attainment Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.values(poMap).length === 0 ? '<tr><td colspan="3">No PO mappings found.</td></tr>' : Object.values(poMap).map(p => `
                            <tr>
                                <td><strong>${p.poCode}</strong></td>
                                <td>${p.totalStrength || '-'}</td>
                                <td><span class="badge badge-level-${Math.floor(p.poAttainmentLevel || 0)}">Level ${p.poAttainmentLevel || 0}</span></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; font-size: 12px; color: var(--text-secondary);">
                <strong>Mapping Scale:</strong> Level 0 = None, Level 1 = Low Attainment, Level 2 = Medium Attainment, Level 3 = High Attainment.
            </div>
        `;
    });
}

// ==========================================
// 9. ATTENDANCE VIEW
// ==========================================
function loadStudentAttendanceView() {
    setActiveNav("nav-student-attendance");
    currentViewLoader = loadStudentAttendanceView;
    document.getElementById("page-title").innerText = "Attendance Summary";
    document.getElementById("page-breadcrumb").innerText = "Student / Attendance";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>My Subject Attendance Records</h3>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Total Classes</th>
                            <th>Present Classes</th>
                            <th>Attendance Percentage</th>
                            <th>Eligibility Status</th>
                        </tr>
                    </thead>
                    <tbody id="student-attendance-tbody">
                        <tr><td colspan="6">Loading attendance summary...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/student/attendance").then(res => {
        const tbody = document.getElementById("student-attendance-tbody");
        if (!tbody) return;
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">No attendance data recorded yet for your account.</td></tr>`;
            return;
        }

        tbody.innerHTML = res.data.map(a => {
            const isEligible = a.attendancePct >= 75;
            return `
                <tr>
                    <td><strong>${a.subjectCode}</strong></td>
                    <td>${a.subjectName}</td>
                    <td>${a.totalClasses}</td>
                    <td>${a.presentClasses}</td>
                    <td><span class="badge ${isEligible ? 'badge-level-3' : 'badge-level-0'}">${a.attendancePct}%</span></td>
                    <td>
                        <span class="badge ${isEligible ? 'badge-level-3' : 'badge-level-0'}">
                            ${isEligible ? 'ELIGIBLE' : 'SHORTAGE (< 75%)'}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    });
}

// ==========================================
// 10. REPORTS VIEW (View & Download Published Reports)
// ==========================================
function loadStudentReportsView() {
    setActiveNav("nav-student-reports");
    currentViewLoader = loadStudentReportsView;
    document.getElementById("page-title").innerText = "Academic Reports";
    document.getElementById("page-breadcrumb").innerText = "Student / Reports";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>My Published Attainment Report Cards</h3>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Report Title</th>
                            <th>Subject</th>
                            <th>Faculty Remarks</th>
                            <th>Published Date</th>
                            <th>Download</th>
                        </tr>
                    </thead>
                    <tbody id="student-reports-tbody">
                        <tr><td colspan="5">Loading reports...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    fetchAPI("/api/student-reports").then(res => {
        const tbody = document.getElementById("student-reports-tbody");
        if (!tbody) return;
        if (!res || !res.data || res.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">No individual reports published for your account yet. Faculty publishes reports after attainment evaluation.</td></tr>`;
            return;
        }

        tbody.innerHTML = res.data.map(r => `
            <tr>
                <td><strong>${r.title}</strong></td>
                <td>${r.subjectCode || ''} ${r.subjectName ? '- ' + r.subjectName : ''}</td>
                <td>${r.remarks || '-'}</td>
                <td>${r.publishedAt || '-'}</td>
                <td>
                    <a href="${getApiUrl('/api/student-reports/pdf')}?reportId=${r.id}" target="_blank" class="btn btn-danger" style="padding: 4px 10px; font-size: 11px;">
                        <i class="fa-solid fa-file-pdf"></i> Download PDF
                    </a>
                </td>
            </tr>
        `).join("");
    });
}

// ==========================================
// 12. SETTINGS VIEW (Password Change)
// ==========================================
function loadStudentSettingsView() {
    setActiveNav("nav-student-settings");
    currentViewLoader = loadStudentSettingsView;
    document.getElementById("page-title").innerText = "Account Settings";
    document.getElementById("page-breadcrumb").innerText = "Student / Settings";

    const content = document.getElementById("view-content");
    content.innerHTML = `
        <div class="card" style="max-width: 500px;">
            <div class="card-header">
                <h3>Security & Password Management</h3>
            </div>
            <form onsubmit="handleStudentChangePassword(event)">
                <div class="form-group">
                    <label>Current Password</label>
                    <input type="password" id="stu-old-pass" required placeholder="••••••••">
                </div>
                <div class="form-group">
                    <label>New Password</label>
                    <input type="password" id="stu-new-pass" required placeholder="••••••••">
                </div>
                <div class="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" id="stu-confirm-pass" required placeholder="••••••••">
                </div>
                <button type="submit" class="btn btn-success btn-block"><i class="fa-solid fa-lock"></i> Update Password</button>
            </form>
        </div>
    `;
}

function handleStudentChangePassword(e) {
    e.preventDefault();
    const oldPass = document.getElementById("stu-old-pass").value.trim();
    const newPass = document.getElementById("stu-new-pass").value.trim();
    const confirmPass = document.getElementById("stu-confirm-pass").value.trim();

    if (newPass !== confirmPass) {
        showToast("New passwords do not match!", "error");
        return;
    }

    if (newPass.length < 6) {
        showToast("New password must be at least 6 characters.", "error");
        return;
    }

    fetchAPI("/api/student/change-password", "POST", { oldPassword: oldPass, newPassword: newPass }).then(res => {
        if (res && res.status === "success") {
            showToast("Password updated successfully!", "success");
            document.getElementById("stu-old-pass").value = "";
            document.getElementById("stu-new-pass").value = "";
            document.getElementById("stu-confirm-pass").value = "";
        } else {
            showToast((res && res.message) ? res.message : "Error changing password", "error");
        }
    });
}
