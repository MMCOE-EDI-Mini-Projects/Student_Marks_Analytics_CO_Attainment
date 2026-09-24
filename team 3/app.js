/**
 * Quiz Portal - Assessment System
 * Pure Vanilla JavaScript (No Frameworks, No Build Tool Required)
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. Initial Demo Data
     ========================================================================== */
  const INITIAL_STUDENTS = [
    { id: 'std-1', rollNo: 'CS-2024-042', name: 'Aarav Sharma', email: 'aarav.s@college.edu', division: 'DIV_A', batch: 'BATCH_A' },
    { id: 'std-2', rollNo: 'CS-2024-043', name: 'Aditi Deshmukh', email: 'aditi.d@college.edu', division: 'DIV_A', batch: 'BATCH_A' },
    { id: 'std-3', rollNo: 'CS-2024-055', name: 'Sneha Patil', email: 'sneha.p@college.edu', division: 'DIV_A', batch: 'BATCH_B' },
    { id: 'std-4', rollNo: 'CS-2024-068', name: 'Rohan Kulkarni', email: 'rohan.k@college.edu', division: 'DIV_A', batch: 'BATCH_C' },
    { id: 'std-5', rollNo: 'CS-2024-102', name: 'Kavya Pillai', email: 'kavya.p@college.edu', division: 'DIV_B', batch: 'BATCH_A' },
    { id: 'std-6', rollNo: 'CS-2024-118', name: 'Tanmay Joshi', email: 'tanmay.j@college.edu', division: 'DIV_B', batch: 'BATCH_B' },
  ];

  const INITIAL_QUIZZES = [
    {
      id: 'quiz-dsa-1',
      title: 'Data Structures & Algorithms - Mid-Term',
      subjectCode: 'CS301',
      subjectName: 'Data Structures & Algorithms',
      description: 'Covers Trees, Binary Search Trees, Heaps, Graph Traversals, and Big-O notation.',
      timeLimitMinutes: 15,
      totalMarks: 10,
      passingMarks: 5,
      instructions: 'Select the correct answer for each multiple-choice question. Each question carries 2 marks. Click submit before the timer expires.',
      dueDate: '2026-09-25',
      dueTime: '23:59',
      shuffleQuestions: true,
      instantResults: true,
      createdAt: '2026-08-10',
      status: 'assigned',
      assignedTo: [
        { division: 'DIV_A', batches: ['BATCH_A', 'BATCH_B', 'BATCH_C'] },
        { division: 'DIV_B', batches: ['BATCH_A', 'BATCH_B', 'BATCH_C'] },
      ],
      questions: [
        {
          id: 'q1',
          text: 'What is the worst-case time complexity of searching in an unbalanced Binary Search Tree (BST)?',
          marks: 2,
          explanation: 'In the worst case (a skewed tree), BST operations degenerate to sequential traversal of a linked list, taking O(n) time.',
          options: [
            { id: 'q1_opt1', text: 'O(1)', isCorrect: false },
            { id: 'q1_opt2', text: 'O(log n)', isCorrect: false },
            { id: 'q1_opt3', text: 'O(n)', isCorrect: true },
            { id: 'q1_opt4', text: 'O(n log n)', isCorrect: false },
          ],
        },
        {
          id: 'q2',
          text: 'Which data structure operates on a First-In, First-Out (FIFO) principle?',
          marks: 2,
          explanation: 'A Queue adheres strictly to First-In, First-Out order where elements are inserted at the rear and removed from the front.',
          options: [
            { id: 'q2_opt1', text: 'Stack', isCorrect: false },
            { id: 'q2_opt2', text: 'Queue', isCorrect: true },
            { id: 'q2_opt3', text: 'Binary Tree', isCorrect: false },
            { id: 'q2_opt4', text: 'Max-Heap', isCorrect: false },
          ],
        },
        {
          id: 'q3',
          text: 'What is the minimum number of queues needed to implement a Stack?',
          marks: 2,
          explanation: 'A Stack (LIFO) can be simulated using 2 standard FIFO Queues by making either push or pop operation costly.',
          options: [
            { id: 'q3_opt1', text: '1 Queue', isCorrect: false },
            { id: 'q3_opt2', text: '2 Queues', isCorrect: true },
            { id: 'q3_opt3', text: '3 Queues', isCorrect: false },
            { id: 'q3_opt4', text: '4 Queues', isCorrect: false },
          ],
        },
        {
          id: 'q4',
          text: 'Which sorting algorithm has the best average-case and worst-case time complexity of O(n log n) with guaranteed stability?',
          marks: 2,
          explanation: 'Merge Sort guarantees O(n log n) in all cases (best, average, and worst) and is a stable sorting algorithm.',
          options: [
            { id: 'q4_opt1', text: 'Quick Sort', isCorrect: false },
            { id: 'q4_opt2', text: 'Merge Sort', isCorrect: true },
            { id: 'q4_opt3', text: 'Selection Sort', isCorrect: false },
            { id: 'q4_opt4', text: 'Bubble Sort', isCorrect: false },
          ],
        },
        {
          id: 'q5',
          text: 'In Graph Theory, which algorithm finds the shortest path between all pairs of vertices in O(V^3) time?',
          marks: 2,
          explanation: 'Floyd-Warshall algorithm uses dynamic programming to find shortest paths between all vertex pairs with O(V^3) runtime.',
          options: [
            { id: 'q5_opt1', text: 'Dijkstra\'s Algorithm', isCorrect: false },
            { id: 'q5_opt2', text: 'Prim\'s Algorithm', isCorrect: false },
            { id: 'q5_opt3', text: 'Floyd-Warshall Algorithm', isCorrect: true },
            { id: 'q5_opt4', text: 'Kruskal\'s Algorithm', isCorrect: false },
          ],
        },
      ],
    },
    {
      id: 'quiz-dbms-1',
      title: 'Database Normalization & SQL Queries',
      subjectCode: 'CS302',
      subjectName: 'Database Management Systems',
      description: 'Questions on 1NF, 2NF, 3NF, BCNF decomposition and relational algebra query optimization.',
      timeLimitMinutes: 10,
      totalMarks: 8,
      passingMarks: 4,
      instructions: 'Answer all 4 questions. Make sure to review functional dependencies before selecting your options.',
      dueDate: '2026-09-28',
      dueTime: '23:59',
      shuffleQuestions: false,
      instantResults: true,
      createdAt: '2026-08-11',
      status: 'assigned',
      assignedTo: [
        { division: 'DIV_A', batches: ['BATCH_A', 'BATCH_B'] },
        { division: 'DIV_B', batches: ['BATCH_A'] },
      ],
      questions: [
        {
          id: 'db_q1',
          text: 'A table is in 2NF if and only if it is in 1NF and what other condition is satisfied?',
          marks: 2,
          explanation: 'Second Normal Form (2NF) eliminates partial dependency — no non-prime attribute should be functionally dependent on a subset of any candidate key.',
          options: [
            { id: 'db_q1_opt1', text: 'No transitive dependencies exist', isCorrect: false },
            { id: 'db_q1_opt2', text: 'No partial dependencies on candidate keys', isCorrect: true },
            { id: 'db_q1_opt3', text: 'All columns contain foreign keys', isCorrect: false },
            { id: 'db_q1_opt4', text: 'Every determinant is a superkey', isCorrect: false },
          ],
        },
        {
          id: 'db_q2',
          text: 'Which SQL clause is evaluated first in a standard SELECT query execution plan?',
          marks: 2,
          explanation: 'SQL query execution logically starts with the FROM clause to identify and join the tables from which data is retrieved.',
          options: [
            { id: 'db_q2_opt1', text: 'WHERE', isCorrect: false },
            { id: 'db_q2_opt2', text: 'FROM', isCorrect: true },
            { id: 'db_q2_opt3', text: 'SELECT', isCorrect: false },
            { id: 'db_q2_opt4', text: 'GROUP BY', isCorrect: false },
          ],
        },
        {
          id: 'db_q3',
          text: 'What is the highest normal form where every functional dependency X -> Y requires X to be a superkey?',
          marks: 2,
          explanation: 'Boyce-Codd Normal Form (BCNF) strictly mandates that for every non-trivial functional dependency X -> Y, X must be a superkey.',
          options: [
            { id: 'db_q3_opt1', text: '1NF', isCorrect: false },
            { id: 'db_q3_opt2', text: '2NF', isCorrect: false },
            { id: 'db_q3_opt3', text: '3NF', isCorrect: false },
            { id: 'db_q3_opt4', text: 'BCNF', isCorrect: true },
          ],
        },
        {
          id: 'db_q4',
          text: 'Which ACID property guarantees that all operations in a database transaction complete successfully, or none do?',
          marks: 2,
          explanation: 'Atomicity ensures all-or-nothing execution: if any operation fails, the entire transaction is rolled back.',
          options: [
            { id: 'db_q4_opt1', text: 'Atomicity', isCorrect: true },
            { id: 'db_q4_opt2', text: 'Consistency', isCorrect: false },
            { id: 'db_q4_opt3', text: 'Isolation', isCorrect: false },
            { id: 'db_q4_opt4', text: 'Durability', isCorrect: false },
          ],
        },
      ],
    },
    {
      id: 'quiz-cn-1',
      title: 'Computer Networks: OSI Layer Architecture',
      subjectCode: 'CS304',
      subjectName: 'Computer Networks',
      description: 'Review of Application, Transport, Network, Data Link, and Physical layers.',
      timeLimitMinutes: 10,
      totalMarks: 6,
      passingMarks: 3,
      instructions: 'Test your understanding of protocol layers, packet headers, and network hardware.',
      dueDate: '2026-09-20',
      dueTime: '18:00',
      shuffleQuestions: false,
      instantResults: true,
      createdAt: '2026-08-05',
      status: 'assigned',
      assignedTo: [
        { division: 'DIV_A', batches: ['BATCH_A', 'BATCH_B', 'BATCH_C'] },
        { division: 'DIV_B', batches: ['BATCH_A', 'BATCH_B', 'BATCH_C'] },
      ],
      questions: [
        {
          id: 'cn_q1',
          text: 'At which OSI layer does IP (Internet Protocol) routing take place?',
          marks: 2,
          explanation: 'The Network Layer (Layer 3) handles logical IP addressing and packet routing across intermediate routers.',
          options: [
            { id: 'cn_q1_opt1', text: 'Data Link Layer (Layer 2)', isCorrect: false },
            { id: 'cn_q1_opt2', text: 'Network Layer (Layer 3)', isCorrect: true },
            { id: 'cn_q1_opt3', text: 'Transport Layer (Layer 4)', isCorrect: false },
            { id: 'cn_q1_opt4', text: 'Session Layer (Layer 5)', isCorrect: false },
          ],
        },
        {
          id: 'cn_q2',
          text: 'Which transport protocol is connection-oriented and provides reliable, ordered data delivery with flow control?',
          marks: 2,
          explanation: 'TCP (Transmission Control Protocol) is connection-oriented, provides sequence numbering, acknowledgments, and flow control.',
          options: [
            { id: 'cn_q2_opt1', text: 'UDP', isCorrect: false },
            { id: 'cn_q2_opt2', text: 'TCP', isCorrect: true },
            { id: 'cn_q2_opt3', text: 'ICMP', isCorrect: false },
            { id: 'cn_q2_opt4', text: 'ARP', isCorrect: false },
          ],
        },
        {
          id: 'cn_q3',
          text: 'What is the default port number used by secure HTTPS communication?',
          marks: 2,
          explanation: 'HTTPS operates by default over TCP port 443 with TLS encryption (standard HTTP uses port 80).',
          options: [
            { id: 'cn_q3_opt1', text: '80', isCorrect: false },
            { id: 'cn_q3_opt2', text: '8080', isCorrect: false },
            { id: 'cn_q3_opt3', text: '443', isCorrect: true },
            { id: 'cn_q3_opt4', text: '22', isCorrect: false },
          ],
        },
      ],
    },
  ];

  const INITIAL_ATTEMPTS = [
    {
      id: 'att-cn-1-std-1',
      quizId: 'quiz-cn-1',
      studentId: 'std-1',
      studentName: 'Aarav Sharma',
      studentRoll: 'CS-2024-042',
      division: 'DIV_A',
      batch: 'BATCH_A',
      startedAt: '2026-08-14T14:10:00Z',
      submittedAt: '2026-08-14T14:16:30Z',
      timeSpentSeconds: 390,
      totalScore: 6,
      maxScore: 6,
      scorePercentage: 100,
      passed: true,
      answers: [
        { questionId: 'cn_q1', selectedOptionId: 'cn_q1_opt2', isCorrect: true, marksObtained: 2 },
        { questionId: 'cn_q2', selectedOptionId: 'cn_q2_opt2', isCorrect: true, marksObtained: 2 },
        { questionId: 'cn_q3', selectedOptionId: 'cn_q3_opt3', isCorrect: true, marksObtained: 2 },
      ],
    },
    {
      id: 'att-dsa-1-std-3',
      quizId: 'quiz-dsa-1',
      studentId: 'std-3',
      studentName: 'Sneha Patil',
      studentRoll: 'CS-2024-055',
      division: 'DIV_A',
      batch: 'BATCH_B',
      startedAt: '2026-08-15T09:00:00Z',
      submittedAt: '2026-08-15T09:12:15Z',
      timeSpentSeconds: 735,
      totalScore: 8,
      maxScore: 10,
      scorePercentage: 80,
      passed: true,
      answers: [
        { questionId: 'q1', selectedOptionId: 'q1_opt3', isCorrect: true, marksObtained: 2 },
        { questionId: 'q2', selectedOptionId: 'q2_opt2', isCorrect: true, marksObtained: 2 },
        { questionId: 'q3', selectedOptionId: 'q3_opt2', isCorrect: true, marksObtained: 2 },
        { questionId: 'q4', selectedOptionId: 'q4_opt1', isCorrect: false, marksObtained: 0 },
        { questionId: 'q5', selectedOptionId: 'q5_opt3', isCorrect: true, marksObtained: 2 },
      ],
    },
  ];

  /* ==========================================================================
     2. Application State & Storage
     ========================================================================== */
  function loadFromStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage save failed', e);
    }
  }

  const state = {
    quizzes: loadFromStorage('app_quizzes_v2', INITIAL_QUIZZES),
    attempts: loadFromStorage('app_attempts_v2', INITIAL_ATTEMPTS),
    students: INITIAL_STUDENTS,
    currentStudentId: loadFromStorage('app_current_student_id', INITIAL_STUDENTS[0].id),
    activeDashboard: 'teacher', // 'teacher' | 'student'
    teacherTab: 'curate',       // 'curate' | 'assign' | 'list'
    
    // In-memory curation draft
    editingQuizId: null,
    curateQuestions: [],

    // Exam taking active session
    activeExam: null,
    examTimerInterval: null,
  };

  /* ==========================================================================
     3. Helper Utilities
     ========================================================================== */
  function showToast(message, type = 'success') {
    const existing = document.getElementById('toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${type === 'success' ? '#34d399' : '#60a5fa'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span>${escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.remove();
      }
    }, 3500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getCurrentStudent() {
    return state.students.find(s => s.id === state.currentStudentId) || state.students[0];
  }

  function isQuizAssignedToStudent(quiz, student) {
    if (quiz.status === 'draft' || !quiz.assignedTo || quiz.assignedTo.length === 0) {
      return false;
    }
    return quiz.assignedTo.some(assign => {
      return assign.division === student.division &&
        (assign.batches.includes(student.batch) || assign.batches.length === 0);
    });
  }

  function getStudentAttempt(quizId, studentId) {
    return state.attempts.find(a => a.quizId === quizId && a.studentId === studentId);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /* ==========================================================================
     4. Render Functions: Teacher Dashboard
     ========================================================================== */
  function renderTeacherDashboard() {
    const curateTabBtn = document.getElementById('tab-btn-curate');
    const assignTabBtn = document.getElementById('tab-btn-assign');
    const listTabBtn = document.getElementById('tab-btn-list');

    const curateView = document.getElementById('teacher-view-curate');
    const assignView = document.getElementById('teacher-view-assign');
    const listView = document.getElementById('teacher-view-list');

    // Update teacher hero metrics
    const statQuizzes = document.getElementById('teacher-stat-quizzes');
    if (statQuizzes) statQuizzes.textContent = state.quizzes.length;
    const statStudents = document.getElementById('teacher-stat-students');
    if (statStudents) statStudents.textContent = state.students.length;
    const statAttempts = document.getElementById('teacher-stat-attempts');
    if (statAttempts) statAttempts.textContent = state.attempts.length;

    curateTabBtn.classList.toggle('active', state.teacherTab === 'curate');
    assignTabBtn.classList.toggle('active', state.teacherTab === 'assign');
    listTabBtn.classList.toggle('active', state.teacherTab === 'list');
    listTabBtn.textContent = `3. All Quizzes (${state.quizzes.length})`;

    curateView.classList.toggle('hidden', state.teacherTab !== 'curate');
    assignView.classList.toggle('hidden', state.teacherTab !== 'assign');
    listView.classList.toggle('hidden', state.teacherTab !== 'list');

    if (state.teacherTab === 'curate') {
      renderCurateForm();
    } else if (state.teacherTab === 'assign') {
      renderAssignForm();
    } else if (state.teacherTab === 'list') {
      renderQuizzesTable();
    }
  }

  // --- TAB 1: CURATE QUIZ ---
  function initDefaultCurateQuestions() {
    return [
      {
        id: 'q_' + Date.now() + '_1',
        text: 'What is the time complexity of pushing an element onto a Stack implemented with an array?',
        marks: 2,
        explanation: 'Pushing to an array stack at top index is a direct index assignment taking O(1) constant time.',
        options: [
          { id: 'opt_1', text: 'O(1)', isCorrect: true },
          { id: 'opt_2', text: 'O(n)', isCorrect: false },
          { id: 'opt_3', text: 'O(log n)', isCorrect: false },
          { id: 'opt_4', text: 'O(n^2)', isCorrect: false },
        ],
      },
      {
        id: 'q_' + Date.now() + '_2',
        text: 'Which data structure is typically used in the implementation of Breadth-First Search (BFS) on graphs?',
        marks: 2,
        explanation: 'BFS explores vertices level by level, requiring a FIFO Queue to maintain discovery order.',
        options: [
          { id: 'opt_5', text: 'Stack', isCorrect: false },
          { id: 'opt_6', text: 'Queue', isCorrect: true },
          { id: 'opt_7', text: 'Binary Search Tree', isCorrect: false },
          { id: 'opt_8', text: 'Hash Table', isCorrect: false },
        ],
      },
    ];
  }

  function renderCurateForm() {
    const titleEl = document.getElementById('curate-title');
    const subjectCodeEl = document.getElementById('curate-subject-code');
    const subjectNameEl = document.getElementById('curate-subject-name');
    const durationEl = document.getElementById('curate-duration');
    const passingMarksEl = document.getElementById('curate-passing-marks');
    const instructionsEl = document.getElementById('curate-instructions');
    const headerTitleEl = document.getElementById('curate-header-title');
    const cancelEditBtn = document.getElementById('curate-cancel-edit-btn');
    const saveBtn = document.getElementById('curate-save-btn');

    if (state.editingQuizId) {
      const quizToEdit = state.quizzes.find(q => q.id === state.editingQuizId);
      if (quizToEdit) {
        headerTitleEl.textContent = 'Edit Curated Quiz';
        saveBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Update Curated Quiz
        `;
        cancelEditBtn.classList.remove('hidden');
      }
    } else {
      headerTitleEl.textContent = 'Curate New Assessment';
      saveBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Save Curated Quiz
      `;
      cancelEditBtn.classList.add('hidden');
    }

    renderCurateQuestionList();
    updateTotalMarksDisplay();
  }

  function renderCurateQuestionList() {
    const container = document.getElementById('curate-questions-container');
    const countBadge = document.getElementById('curate-question-count');
    countBadge.textContent = state.curateQuestions.length;

    container.innerHTML = '';

    state.curateQuestions.forEach((q, qIndex) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'question-item';

      let optionsHtml = '';
      q.options.forEach((opt, optIndex) => {
        const letter = String.fromCharCode(65 + optIndex);
        optionsHtml += `
          <div class="option-box ${opt.isCorrect ? 'correct' : ''}">
            <input type="radio" name="q_${q.id}_correct" class="option-radio" ${opt.isCorrect ? 'checked' : ''} data-qindex="${qIndex}" data-optindex="${optIndex}">
            <span class="option-letter">${letter}.</span>
            <input type="text" class="option-input" placeholder="Option ${letter}" value="${escapeHtml(opt.text)}" data-qindex="${qIndex}" data-optindex="${optIndex}">
            ${opt.isCorrect ? '<span class="correct-badge">Correct</span>' : ''}
          </div>
        `;
      });

      qDiv.innerHTML = `
        <div class="question-item-top">
          <span class="question-label">Question #${qIndex + 1}</span>
          <div class="question-controls">
            <label style="font-size:12px; color:var(--text-muted); display:flex; align-items:center; gap:4px;">
              Marks:
              <input type="number" min="1" class="input marks-input" value="${q.marks || 2}" data-qindex="${qIndex}">
            </label>
            <button type="button" class="btn-danger-ghost btn-remove-question" data-qindex="${qIndex}" title="Remove Question">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        <input type="text" class="input question-text-input" placeholder="Enter question text here..." value="${escapeHtml(q.text)}" data-qindex="${qIndex}" style="margin-bottom:8px;">

        <div>
          <label style="font-size:11px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">
            Multiple Choice Options (Select 1 Correct Answer)
          </label>
          <div class="options-grid">
            ${optionsHtml}
          </div>
        </div>

        <input type="text" class="input question-explanation-input" placeholder="Optional: Explanation / Hint for students after quiz submission" value="${escapeHtml(q.explanation || '')}" data-qindex="${qIndex}" style="margin-top:10px; font-size:11px;">
      `;

      container.appendChild(qDiv);
    });

    // Wire up events
    container.querySelectorAll('.btn-remove-question').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qIndex = parseInt(btn.getAttribute('data-qindex'), 10);
        if (state.curateQuestions.length <= 1) {
          showCurateAlert('A quiz must contain at least 1 question.');
          return;
        }
        state.curateQuestions.splice(qIndex, 1);
        renderCurateQuestionList();
        updateTotalMarksDisplay();
      });
    });

    container.querySelectorAll('.marks-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const qIndex = parseInt(input.getAttribute('data-qindex'), 10);
        const marks = Math.max(1, parseInt(input.value, 10) || 1);
        state.curateQuestions[qIndex].marks = marks;
        updateTotalMarksDisplay();
      });
    });

    container.querySelectorAll('.question-text-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const qIndex = parseInt(input.getAttribute('data-qindex'), 10);
        state.curateQuestions[qIndex].text = input.value;
      });
    });

    container.querySelectorAll('.question-explanation-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const qIndex = parseInt(input.getAttribute('data-qindex'), 10);
        state.curateQuestions[qIndex].explanation = input.value;
      });
    });

    container.querySelectorAll('.option-radio').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const qIndex = parseInt(radio.getAttribute('data-qindex'), 10);
        const optIndex = parseInt(radio.getAttribute('data-optindex'), 10);
        state.curateQuestions[qIndex].options.forEach((opt, idx) => {
          opt.isCorrect = (idx === optIndex);
        });
        renderCurateQuestionList();
      });
    });

    container.querySelectorAll('.option-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const qIndex = parseInt(input.getAttribute('data-qindex'), 10);
        const optIndex = parseInt(input.getAttribute('data-optindex'), 10);
        state.curateQuestions[qIndex].options[optIndex].text = input.value;
      });
    });
  }

  function updateTotalMarksDisplay() {
    const total = state.curateQuestions.reduce((sum, q) => sum + (parseInt(q.marks, 10) || 0), 0);
    document.getElementById('curate-calculated-marks').textContent = `${total} Marks (${state.curateQuestions.length} Questions)`;
  }

  function showCurateAlert(msg) {
    const alert = document.getElementById('curate-alert');
    if (!msg) {
      alert.classList.add('hidden');
      alert.textContent = '';
      return;
    }
    alert.textContent = msg;
    alert.classList.remove('hidden');
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // --- TAB 2: ASSIGN QUIZ ---
  function renderAssignForm() {
    const selectEl = document.getElementById('assign-quiz-select');
    const previewEl = document.getElementById('assign-quiz-preview');

    selectEl.innerHTML = '';
    state.quizzes.forEach(q => {
      const opt = document.createElement('option');
      opt.value = q.id;
      opt.textContent = `${q.subjectCode} - ${q.title} (${q.questions.length} Qs, ${q.timeLimitMinutes} Mins, ${q.totalMarks} Marks)`;
      selectEl.appendChild(opt);
    });

    if (state.selectedAssignQuizId) {
      selectEl.value = state.selectedAssignQuizId;
    } else if (state.quizzes.length > 0) {
      state.selectedAssignQuizId = state.quizzes[0].id;
      selectEl.value = state.selectedAssignQuizId;
    }

    updateAssignPreview();
  }

  function updateAssignPreview() {
    const previewEl = document.getElementById('assign-quiz-preview');
    const quiz = state.quizzes.find(q => q.id === state.selectedAssignQuizId);
    if (!quiz) {
      previewEl.classList.add('hidden');
      return;
    }

    previewEl.innerHTML = `
      <div style="font-weight:700; color:var(--primary-text); margin-bottom:4px;">${escapeHtml(quiz.title)}</div>
      <div style="color:var(--text-muted);">
        Course: <strong>${escapeHtml(quiz.subjectCode)} - ${escapeHtml(quiz.subjectName)}</strong> • ${quiz.questions.length} Questions • ${quiz.timeLimitMinutes} Mins Duration • Passing Marks: ${quiz.passingMarks}
      </div>
    `;
    previewEl.classList.remove('hidden');
  }

  // --- TAB 3: ALL QUIZZES TABLE ---
  function renderQuizzesTable() {
    const tbody = document.getElementById('quizzes-table-body');
    tbody.innerHTML = '';

    if (state.quizzes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center" style="padding: 24px; color: var(--text-muted);">
            No quizzes found. Click "Curate New Quiz" to create your first assessment!
          </td>
        </tr>
      `;
      return;
    }

    state.quizzes.forEach(quiz => {
      const attemptCount = state.attempts.filter(a => a.quizId === quiz.id).length;
      const isAssigned = quiz.status === 'assigned';

      let targetHtml = '';
      if (isAssigned && quiz.assignedTo && quiz.assignedTo.length > 0) {
        const divs = quiz.assignedTo.map(a => a.division.replace('_', ' ')).join(', ');
        const batches = quiz.assignedTo.flatMap(a => a.batches).map(b => b.replace('BATCH_', '')).join(',');
        targetHtml = `<span class="badge badge-indigo">${escapeHtml(divs)} (${escapeHtml(batches)})</span>`;
      } else {
        targetHtml = `<span class="badge badge-neutral">Draft (Unassigned)</span>`;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600; color:var(--text-main);">${escapeHtml(quiz.title)}</td>
        <td style="font-family:var(--font-mono); color:var(--text-muted); font-size:11px;">${escapeHtml(quiz.subjectCode)}</td>
        <td>${targetHtml}</td>
        <td class="text-center" style="font-weight:600;">${quiz.questions.length} Qs</td>
        <td class="text-center" style="color:var(--text-muted);">${quiz.timeLimitMinutes} mins</td>
        <td class="text-center">
          <span class="badge ${attemptCount > 0 ? 'badge-success' : 'badge-neutral'}">
            ${attemptCount} Students
          </span>
        </td>
        <td style="color:var(--text-muted);">${quiz.dueDate || '-'}</td>
        <td class="text-right">
          <button type="button" class="btn btn-secondary btn-edit-quiz" data-id="${quiz.id}" style="padding:4px 8px; font-size:11px;">Edit</button>
          <button type="button" class="btn btn-subtle btn-assign-quiz" data-id="${quiz.id}" style="padding:4px 8px; font-size:11px;">Assign</button>
          <button type="button" class="btn btn-secondary btn-submissions-quiz" data-id="${quiz.id}" style="padding:4px 8px; font-size:11px;">Submissions</button>
          <button type="button" class="btn-danger-ghost btn-delete-quiz" data-id="${quiz.id}" style="padding:4px 6px;" title="Delete Quiz">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Wire actions
    tbody.querySelectorAll('.btn-edit-quiz').forEach(btn => {
      btn.addEventListener('click', () => {
        const quizId = btn.getAttribute('data-id');
        const quiz = state.quizzes.find(q => q.id === quizId);
        if (quiz) {
          state.editingQuizId = quiz.id;
          document.getElementById('curate-title').value = quiz.title;
          document.getElementById('curate-subject-code').value = quiz.subjectCode;
          document.getElementById('curate-subject-name').value = quiz.subjectName;
          document.getElementById('curate-duration').value = quiz.timeLimitMinutes;
          document.getElementById('curate-passing-marks').value = quiz.passingMarks;
          document.getElementById('curate-instructions').value = quiz.instructions || '';
          state.curateQuestions = JSON.parse(JSON.stringify(quiz.questions));

          state.teacherTab = 'curate';
          renderTeacherDashboard();
          showToast(`Editing "${quiz.title}"`);
        }
      });
    });

    tbody.querySelectorAll('.btn-assign-quiz').forEach(btn => {
      btn.addEventListener('click', () => {
        const quizId = btn.getAttribute('data-id');
        state.selectedAssignQuizId = quizId;
        state.teacherTab = 'assign';
        renderTeacherDashboard();
      });
    });

    tbody.querySelectorAll('.btn-submissions-quiz').forEach(btn => {
      btn.addEventListener('click', () => {
        const quizId = btn.getAttribute('data-id');
        const quiz = state.quizzes.find(q => q.id === quizId);
        if (quiz) {
          openSubmissionsModal(quiz);
        }
      });
    });

    tbody.querySelectorAll('.btn-delete-quiz').forEach(btn => {
      btn.addEventListener('click', () => {
        const quizId = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this quiz and all student submissions for it?')) {
          state.quizzes = state.quizzes.filter(q => q.id !== quizId);
          state.attempts = state.attempts.filter(a => a.quizId !== quizId);
          saveToStorage('app_quizzes_v2', state.quizzes);
          saveToStorage('app_attempts_v2', state.attempts);
          renderTeacherDashboard();
          showToast('Quiz deleted successfully.', 'info');
        }
      });
    });
  }

  /* ==========================================================================
     5. Render Functions: Student Dashboard
     ========================================================================== */
  function renderStudentDashboard() {
    const student = getCurrentStudent();

    // Student profile header
    document.getElementById('student-display-name').textContent = student.name;
    document.getElementById('student-display-roll').textContent = student.rollNo;
    document.getElementById('student-display-meta').textContent = `${student.division.replace('_', ' ')} • ${student.batch.replace('_', ' ')} • Department of Computer Science`;

    const loggedBadge = document.getElementById('student-logged-in-badge');
    if (loggedBadge) {
      loggedBadge.textContent = student.rollNo;
    }

    const welcomeHeading = document.getElementById('student-welcome-heading');
    if (welcomeHeading) {
      welcomeHeading.textContent = `Ready for your test, ${student.name.split(' ')[0]}?`;
    }

    // Populate student selector if present
    const switcher = document.getElementById('student-view-switcher');
    if (switcher) {
      switcher.innerHTML = '';
      state.students.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.name} (${s.division.replace('_', ' ')} - ${s.batch.replace('_', ' ')})`;
        if (s.id === state.currentStudentId) opt.selected = true;
        switcher.appendChild(opt);
      });
    }

    // Compute student stats
    const assignedQuizzes = state.quizzes.filter(q => isQuizAssignedToStudent(q, student));
    const completedAttempts = assignedQuizzes
      .map(q => getStudentAttempt(q.id, student.id))
      .filter(Boolean);
    const completedCount = completedAttempts.length;
    const pendingCount = Math.max(0, assignedQuizzes.length - completedCount);
    const avgScore = completedCount > 0
      ? Math.round(completedAttempts.reduce((sum, a) => sum + a.scorePercentage, 0) / completedCount)
      : 0;

    const statCompletedEl = document.getElementById('student-stat-completed');
    if (statCompletedEl) statCompletedEl.textContent = completedCount;
    const statPendingEl = document.getElementById('student-stat-pending');
    if (statPendingEl) statPendingEl.textContent = pendingCount;
    const statAvgEl = document.getElementById('student-stat-avg');
    if (statAvgEl) statAvgEl.textContent = completedCount > 0 ? `${avgScore}%` : '—';

    // Render Quizzes Grid
    const countEl = document.getElementById('student-quiz-count');
    countEl.textContent = `(${assignedQuizzes.length})`;

    const grid = document.getElementById('student-quiz-grid');
    grid.innerHTML = '';

    if (assignedQuizzes.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 48px 24px; text-align: center; box-shadow: var(--shadow-sm);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #e0e7ff; color: #4338ca; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <p style="font-size:16px; font-weight:700; color:var(--text-main);">No quizzes assigned to your batch at this time.</p>
          <p style="font-size:13px; color:var(--text-muted); margin-top:6px; max-width: 440px; margin-left: auto; margin-right: auto;">
            Switch to the Teacher Dashboard to curate and assign a quiz to Division ${student.division.replace('DIV_', '')} - Batch ${student.batch.replace('BATCH_', '')}.
          </p>
        </div>
      `;
      return;
    }

    assignedQuizzes.forEach(quiz => {
      const attempt = getStudentAttempt(quiz.id, student.id);
      const isCompleted = !!attempt;

      // Dynamic color theme per subject code to make the UI colorful
      let colorClass = 'theme-indigo';
      if (quiz.subjectCode.includes('301')) colorClass = 'theme-purple';
      else if (quiz.subjectCode.includes('302')) colorClass = 'theme-blue';
      else if (quiz.subjectCode.includes('304')) colorClass = 'theme-emerald';
      else colorClass = 'theme-amber';

      const card = document.createElement('div');
      card.className = `quiz-card ${isCompleted ? 'completed' : ''} ${colorClass}`;

      card.innerHTML = `
        <div class="quiz-card-content">
          <div class="quiz-card-top">
            <span class="quiz-subject-tag">${escapeHtml(quiz.subjectCode)}</span>
            ${
              isCompleted
                ? `<span class="badge ${attempt.passed ? 'badge-success' : 'badge-danger'}">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Score: ${attempt.scorePercentage}%
                   </span>`
                : `<span class="badge badge-warning">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Due: ${quiz.dueDate || 'Pending'}
                   </span>`
            }
          </div>

          <h3 class="quiz-card-title">${escapeHtml(quiz.title)}</h3>
          <p class="quiz-card-desc">${escapeHtml(quiz.description || quiz.instructions || 'Assessment test.')}</p>

          ${
            isCompleted
              ? `
              <div class="score-progress-bar-wrap">
                <div class="score-progress-labels">
                  <span>Score: <strong>${attempt.totalScore}/${attempt.maxScore}</strong> (${attempt.passed ? 'Passed' : 'Failed'})</span>
                  <span class="score-percent-val">${attempt.scorePercentage}%</span>
                </div>
                <div class="score-progress-track">
                  <div class="score-progress-fill ${attempt.passed ? 'fill-passed' : 'fill-failed'}" style="width: ${attempt.scorePercentage}%;"></div>
                </div>
              </div>`
              : ''
          }

          <div class="quiz-card-meta">
            <span class="meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              ${quiz.questions.length} Questions
            </span>
            <span class="meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${quiz.timeLimitMinutes} Mins
            </span>
            <span class="meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              ${quiz.totalMarks} Marks
            </span>
          </div>
        </div>

        <div class="quiz-card-actions">
          <button type="button" class="btn ${isCompleted ? 'btn-retake' : 'btn-primary-action'} btn-start-quiz" data-id="${quiz.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ${isCompleted ? 'Retake Test' : 'Start Test'}
          </button>
          
          <button type="button" class="btn btn-secondary-action btn-result-quiz" data-id="${quiz.id}" ${!isCompleted ? 'disabled' : ''}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            ${isCompleted ? 'View Report' : 'Locked'}
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

    // Wire actions
    grid.querySelectorAll('.btn-start-quiz').forEach(btn => {
      btn.addEventListener('click', () => {
        const quizId = btn.getAttribute('data-id');
        const quiz = state.quizzes.find(q => q.id === quizId);
        if (quiz) {
          startExam(quiz, student);
        }
      });
    });

    grid.querySelectorAll('.btn-result-quiz').forEach(btn => {
      btn.addEventListener('click', () => {
        const quizId = btn.getAttribute('data-id');
        const quiz = state.quizzes.find(q => q.id === quizId);
        const attempt = getStudentAttempt(quizId, student.id);
        if (quiz && attempt) {
          openResultReviewModal(quiz, attempt);
        } else {
          showToast('Attempt the quiz first to review results.', 'info');
        }
      });
    });
  }

  /* ==========================================================================
     6. Exam Engine: Take Quiz Modal
     ========================================================================== */
  function startExam(quiz, student) {
    let examQuestions = quiz.questions;
    if (quiz.shuffleQuestions) {
      examQuestions = [...quiz.questions].sort(() => Math.random() - 0.5);
    }

    state.activeExam = {
      quiz,
      student,
      questions: examQuestions,
      currentIdx: 0,
      selectedAnswers: {}, // questionId -> optionId
      timeLeftSeconds: quiz.timeLimitMinutes * 60,
      startTime: Date.now(),
    };

    const modal = document.getElementById('exam-modal');
    modal.classList.remove('hidden');

    document.getElementById('exam-quiz-title').textContent = `${quiz.subjectCode} • ${quiz.title}`;
    document.getElementById('exam-student-info').textContent = `Student: ${student.name} (${student.rollNo})`;

    renderExamView();

    // Start Timer
    if (state.examTimerInterval) clearInterval(state.examTimerInterval);
    state.examTimerInterval = setInterval(() => {
      if (!state.activeExam) {
        clearInterval(state.examTimerInterval);
        return;
      }

      state.activeExam.timeLeftSeconds--;
      updateExamTimerDisplay();

      if (state.activeExam.timeLeftSeconds <= 0) {
        clearInterval(state.examTimerInterval);
        submitExam(true); // Auto-submit
      }
    }, 1000);
  }

  function updateExamTimerDisplay() {
    if (!state.activeExam) return;
    const timerBox = document.getElementById('exam-timer');
    const timerText = document.getElementById('exam-timer-text');
    const seconds = state.activeExam.timeLeftSeconds;

    timerText.textContent = `Time Left: ${formatTime(seconds)}`;
    if (seconds <= 60) {
      timerBox.classList.add('warning');
    } else {
      timerBox.classList.remove('warning');
    }
  }

  function renderExamView() {
    if (!state.activeExam) return;
    const { questions, currentIdx, selectedAnswers } = state.activeExam;
    const currentQ = questions[currentIdx];

    document.getElementById('exam-q-current').textContent = `Question ${currentIdx + 1} of ${questions.length}`;
    document.getElementById('exam-q-marks').textContent = `(${currentQ.marks} Marks)`;
    document.getElementById('exam-q-text').textContent = currentQ.text;

    // Palette
    const palette = document.getElementById('exam-palette');
    palette.innerHTML = '';
    questions.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isCurrent = idx === currentIdx;
      const isAnswered = !!selectedAnswers[q.id];

      btn.className = `palette-btn ${isCurrent ? 'active' : ''} ${isAnswered && !isCurrent ? 'answered' : ''}`;
      btn.textContent = idx + 1;
      btn.addEventListener('click', () => {
        state.activeExam.currentIdx = idx;
        renderExamView();
      });
      palette.appendChild(btn);
    });

    // Options
    const optionsContainer = document.getElementById('exam-options-container');
    optionsContainer.innerHTML = '';

    currentQ.options.forEach((opt, optIndex) => {
      const letter = String.fromCharCode(65 + optIndex);
      const isSelected = selectedAnswers[currentQ.id] === opt.id;

      const optBtn = document.createElement('button');
      optBtn.type = 'button';
      optBtn.className = `exam-option-btn ${isSelected ? 'selected' : ''}`;
      optBtn.innerHTML = `
        <span class="exam-option-badge">${letter}</span>
        <span style="flex:1;">${escapeHtml(opt.text)}</span>
      `;

      optBtn.addEventListener('click', () => {
        state.activeExam.selectedAnswers[currentQ.id] = opt.id;
        renderExamView();
      });

      optionsContainer.appendChild(optBtn);
    });

    // Controls
    const clearBtn = document.getElementById('exam-clear-choice-btn');
    clearBtn.disabled = !selectedAnswers[currentQ.id];

    const prevBtn = document.getElementById('exam-prev-btn');
    prevBtn.disabled = currentIdx === 0;

    const nextBtn = document.getElementById('exam-next-btn');
    const submitBtn = document.getElementById('exam-submit-btn');

    if (currentIdx < questions.length - 1) {
      nextBtn.classList.remove('hidden');
      submitBtn.classList.add('hidden');
    } else {
      nextBtn.classList.add('hidden');
      submitBtn.classList.remove('hidden');
    }

    const answeredCount = Object.keys(selectedAnswers).length;
    document.getElementById('exam-answered-count').textContent = `Answered: ${answeredCount} / ${questions.length}`;
  }

  function submitExam(isAuto = false) {
    if (!state.activeExam) return;

    if (state.examTimerInterval) {
      clearInterval(state.examTimerInterval);
      state.examTimerInterval = null;
    }

    const { quiz, student, questions, selectedAnswers, startTime } = state.activeExam;
    const timeSpentSeconds = Math.min(
      quiz.timeLimitMinutes * 60,
      Math.floor((Date.now() - startTime) / 1000)
    );

    const answers = questions.map(q => {
      const selectedOptionId = selectedAnswers[q.id] || null;
      const correctOption = q.options.find(opt => opt.isCorrect);
      const isCorrect = selectedOptionId !== null && selectedOptionId === correctOption?.id;
      const marksObtained = isCorrect ? q.marks : 0;

      return {
        questionId: q.id,
        selectedOptionId,
        isCorrect,
        marksObtained,
      };
    });

    const totalScore = answers.reduce((sum, a) => sum + a.marksObtained, 0);
    const maxScore = quiz.totalMarks || questions.reduce((sum, q) => sum + q.marks, 0);
    const scorePercentage = Math.round((totalScore / maxScore) * 100);
    const passed = totalScore >= quiz.passingMarks;

    const newAttempt = {
      id: `att-${quiz.id}-${student.id}-${Date.now()}`,
      quizId: quiz.id,
      studentId: student.id,
      studentName: student.name,
      studentRoll: student.rollNo,
      division: student.division,
      batch: student.batch,
      startedAt: new Date(startTime).toISOString(),
      submittedAt: new Date().toISOString(),
      timeSpentSeconds,
      totalScore,
      maxScore,
      scorePercentage,
      passed,
      answers,
    };

    // Save attempt
    const existingIdx = state.attempts.findIndex(a => a.quizId === quiz.id && a.studentId === student.id);
    if (existingIdx >= 0) {
      state.attempts[existingIdx] = newAttempt;
    } else {
      state.attempts.unshift(newAttempt);
    }
    saveToStorage('app_attempts_v2', state.attempts);

    // Close Exam Modal
    closeExamModal();

    // Trigger confetti if passed
    if (passed && typeof confetti === 'function') {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }
    }

    showToast(`Quiz submitted! Score: ${newAttempt.totalScore} / ${newAttempt.maxScore} (${newAttempt.scorePercentage}%)`);

    // Render Student View updates
    renderStudentDashboard();

    // Open detailed result breakdown immediately
    openResultReviewModal(quiz, newAttempt);
  }

  function closeExamModal() {
    if (state.examTimerInterval) {
      clearInterval(state.examTimerInterval);
      state.examTimerInterval = null;
    }
    state.activeExam = null;
    document.getElementById('exam-modal').classList.add('hidden');
    document.getElementById('exam-confirm-dialog').classList.add('hidden');
  }

  /* ==========================================================================
     7. Result Review Modal (Used by both Student & Teacher)
     ========================================================================== */
  function openResultReviewModal(quiz, attempt) {
    const modal = document.getElementById('result-modal');
    modal.classList.remove('hidden');

    document.getElementById('result-header-quiz').textContent = `${quiz.subjectCode} • Assessment Report`;
    document.getElementById('result-quiz-title').textContent = quiz.title;

    const scoreCircle = document.getElementById('result-score-circle');
    scoreCircle.textContent = `${attempt.scorePercentage}%`;
    scoreCircle.className = `score-badge-circle ${attempt.passed ? 'passed' : 'failed'}`;

    const statusBadge = document.getElementById('result-status-badge');
    statusBadge.className = `badge ${attempt.passed ? 'badge-success' : 'badge-danger'}`;
    statusBadge.textContent = attempt.passed ? 'Passed' : 'Needs Improvement';

    document.getElementById('result-passing-label').textContent = `(Passing: ${quiz.passingMarks} Marks)`;
    document.getElementById('result-score-text').textContent = `Score: ${attempt.totalScore} / ${attempt.maxScore} Marks`;
    document.getElementById('result-student-label').textContent = `Student: ${attempt.studentName} (${attempt.studentRoll})`;

    const mins = Math.floor(attempt.timeSpentSeconds / 60);
    const secs = attempt.timeSpentSeconds % 60;
    document.getElementById('result-time-taken').textContent = `${mins}m ${secs}s`;

    const subDate = new Date(attempt.submittedAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    document.getElementById('result-submitted-at').textContent = subDate;
    document.getElementById('result-footer-date').textContent = `Completed on ${subDate}`;

    // Questions Breakdown
    const list = document.getElementById('result-questions-list');
    list.innerHTML = '';

    quiz.questions.forEach((q, idx) => {
      const answer = attempt.answers.find(a => a.questionId === q.id);
      const isCorrect = answer?.isCorrect || false;
      const studentOptId = answer?.selectedOptionId;

      const item = document.createElement('div');
      item.className = `review-q-card ${isCorrect ? 'correct' : 'incorrect'}`;

      let optionsHtml = '';
      q.options.forEach((opt, optIdx) => {
        const letter = String.fromCharCode(65 + optIdx);
        const isTheCorrectAnswer = opt.isCorrect;
        const isStudentPick = studentOptId === opt.id;

        let optStyle = 'background-color:#ffffff; border:1px solid var(--border-color); color:var(--text-main);';
        if (isTheCorrectAnswer) {
          optStyle = 'background-color:#dcfce7; border:1px solid #86efac; color:#065f46; font-weight:600;';
        } else if (isStudentPick && !isTheCorrectAnswer) {
          optStyle = 'background-color:#ffe4e6; border:1px solid #fecdd3; color:#9f1239; text-decoration:line-through;';
        }

        optionsHtml += `
          <div style="padding:8px 12px; border-radius:var(--radius-md); font-size:12px; display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; ${optStyle}">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-weight:700; color:var(--text-muted);">${letter}.</span>
              <span>${escapeHtml(opt.text)}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              ${isTheCorrectAnswer ? '<span class="badge badge-success">Correct Answer</span>' : ''}
              ${isStudentPick ? `<span class="badge ${isTheCorrectAnswer ? 'badge-success' : 'badge-danger'}">Your Choice</span>` : ''}
            </div>
          </div>
        `;
      });

      item.innerHTML = `
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:10px;">
          <div style="display:flex; align-items:flex-start; gap:8px;">
            <span class="badge ${isCorrect ? 'badge-success' : 'badge-danger'}">Q${idx + 1}</span>
            <span style="font-weight:600; font-size:13px; color:var(--text-main);">${escapeHtml(q.text)}</span>
          </div>
          <span class="badge ${isCorrect ? 'badge-success' : 'badge-danger'}">
            ${answer?.marksObtained || 0} / ${q.marks} Marks
          </span>
        </div>

        <div style="padding-left: 28px;">
          ${optionsHtml}
          ${
            q.explanation
              ? `<div style="margin-top:8px; padding:8px 12px; background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-md); font-size:11px; color:var(--text-muted);">
                   <strong style="color:var(--primary);">Explanation:</strong> ${escapeHtml(q.explanation)}
                 </div>`
              : ''
          }
        </div>
      `;

      list.appendChild(item);
    });

    // Retake handler
    const retakeBtn = document.getElementById('result-retake-btn');
    retakeBtn.onclick = () => {
      modal.classList.add('hidden');
      const student = getCurrentStudent();
      startExam(quiz, student);
    };
  }

  /* ==========================================================================
     8. Submissions Modal (Teacher)
     ========================================================================== */
  function openSubmissionsModal(quiz) {
    const modal = document.getElementById('submissions-modal');
    modal.classList.remove('hidden');

    document.getElementById('submissions-quiz-code').textContent = `${quiz.subjectCode} • Student Submissions`;
    document.getElementById('submissions-quiz-title').textContent = quiz.title;

    const searchInput = document.getElementById('submissions-search');
    searchInput.value = '';

    function renderList() {
      const query = searchInput.value.trim().toLowerCase();
      const quizAttempts = state.attempts.filter(a => a.quizId === quiz.id);

      const filtered = quizAttempts.filter(a =>
        a.studentName.toLowerCase().includes(query) ||
        a.studentRoll.toLowerCase().includes(query)
      );

      const total = quizAttempts.length;
      const passed = quizAttempts.filter(a => a.passed).length;
      const avg = total > 0 ? Math.round(quizAttempts.reduce((sum, a) => sum + a.scorePercentage, 0) / total) : 0;

      document.getElementById('sub-metric-total').textContent = `${total} Students`;
      document.getElementById('sub-metric-avg').textContent = `${avg}%`;
      document.getElementById('sub-metric-pass').textContent = `${total > 0 ? Math.round((passed / total) * 100) : 0}% (${passed}/${total})`;
      document.getElementById('sub-records-count').textContent = `Showing ${filtered.length} of ${total} records`;

      const tbody = document.getElementById('submissions-table-body');
      tbody.innerHTML = '';

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center" style="padding: 24px; color: var(--text-muted);">
              ${total === 0 ? 'No student has attempted this quiz yet.' : 'No submissions found matching your search.'}
            </td>
          </tr>
        `;
        return;
      }

      filtered.forEach(att => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:600; color:var(--text-main);">${escapeHtml(att.studentName)}</td>
          <td style="font-family:var(--font-mono); color:var(--text-muted);">${escapeHtml(att.studentRoll)}</td>
          <td style="color:var(--text-muted);">${att.division.replace('_', ' ')} • ${att.batch.replace('_', ' ')}</td>
          <td class="text-center" style="font-weight:700;">${att.totalScore} / ${att.maxScore}</td>
          <td class="text-center" style="font-weight:700; color:var(--primary);">${att.scorePercentage}%</td>
          <td class="text-center">
            <span class="badge ${att.passed ? 'badge-success' : 'badge-danger'}">
              ${att.passed ? 'Passed' : 'Failed'}
            </span>
          </td>
          <td class="text-right">
            <button type="button" class="btn btn-subtle btn-view-attempt-ans" style="padding:4px 10px; font-size:11px;">
              View Answers
            </button>
          </td>
        `;

        tr.querySelector('.btn-view-attempt-ans').addEventListener('click', () => {
          openResultReviewModal(quiz, att);
        });

        tbody.appendChild(tr);
      });
    }

    searchInput.oninput = renderList;
    renderList();
  }

  /* ==========================================================================
     9. Global Events & Navigation Initialization
     ========================================================================== */
  function init() {
    // 1. Navigation Switcher
    const switchTeacherBtn = document.getElementById('btn-switch-teacher');
    const switchStudentBtn = document.getElementById('btn-switch-student');
    const teacherSection = document.getElementById('teacher-dashboard-section');
    const studentSection = document.getElementById('student-dashboard-section');

    function updateDashboardView() {
      if (state.activeDashboard === 'teacher') {
        switchTeacherBtn.classList.add('active');
        switchStudentBtn.classList.remove('active');
        teacherSection.classList.remove('hidden');
        studentSection.classList.add('hidden');
        renderTeacherDashboard();
      } else {
        switchStudentBtn.classList.add('active');
        switchTeacherBtn.classList.remove('active');
        studentSection.classList.remove('hidden');
        teacherSection.classList.add('hidden');
        renderStudentDashboard();
      }
    }

    switchTeacherBtn.addEventListener('click', () => {
      state.activeDashboard = 'teacher';
      updateDashboardView();
    });

    switchStudentBtn.addEventListener('click', () => {
      state.activeDashboard = 'student';
      updateDashboardView();
    });

    // 2. Teacher Sub-navigation tabs
    document.getElementById('tab-btn-curate').addEventListener('click', () => {
      state.teacherTab = 'curate';
      state.editingQuizId = null;
      document.getElementById('curate-title').value = '';
      document.getElementById('curate-subject-code').value = 'CS301';
      document.getElementById('curate-subject-name').value = 'Data Structures & Algorithms';
      document.getElementById('curate-duration').value = 20;
      document.getElementById('curate-passing-marks').value = 5;
      document.getElementById('curate-instructions').value = 'Answer all multiple choice questions. Each question carries marks as indicated. Click submit before time runs out.';
      state.curateQuestions = initDefaultCurateQuestions();
      renderTeacherDashboard();
    });

    document.getElementById('tab-btn-assign').addEventListener('click', () => {
      state.teacherTab = 'assign';
      renderTeacherDashboard();
    });

    document.getElementById('tab-btn-list').addEventListener('click', () => {
      state.teacherTab = 'list';
      renderTeacherDashboard();
    });

    // Curate Tab: Add Question Button
    document.getElementById('curate-add-q-btn').addEventListener('click', () => {
      const newId = 'q_' + Date.now();
      state.curateQuestions.push({
        id: newId,
        text: '',
        marks: 2,
        explanation: '',
        options: [
          { id: newId + '_opt1', text: '', isCorrect: true },
          { id: newId + '_opt2', text: '', isCorrect: false },
          { id: newId + '_opt3', text: '', isCorrect: false },
          { id: newId + '_opt4', text: '', isCorrect: false },
        ],
      });
      renderCurateQuestionList();
      updateTotalMarksDisplay();
    });

    // Curate Tab: Cancel Edit
    document.getElementById('curate-cancel-edit-btn').addEventListener('click', () => {
      state.editingQuizId = null;
      state.teacherTab = 'list';
      renderTeacherDashboard();
    });

    // Curate Tab: Save Quiz
    document.getElementById('curate-save-btn').addEventListener('click', () => {
      showCurateAlert(null);

      const title = document.getElementById('curate-title').value.trim();
      const subjectCode = document.getElementById('curate-subject-code').value.trim();
      const subjectName = document.getElementById('curate-subject-name').value.trim() || subjectCode;
      const duration = Math.max(1, parseInt(document.getElementById('curate-duration').value, 10) || 15);
      const passingMarks = Math.max(1, parseInt(document.getElementById('curate-passing-marks').value, 10) || 5);
      const instructions = document.getElementById('curate-instructions').value.trim();

      if (!title) {
        showCurateAlert('Please enter a quiz title.');
        return;
      }
      if (!subjectCode) {
        showCurateAlert('Please enter a subject code (e.g. CS301).');
        return;
      }
      if (state.curateQuestions.length === 0) {
        showCurateAlert('Please add at least 1 question.');
        return;
      }

      for (let i = 0; i < state.curateQuestions.length; i++) {
        const q = state.curateQuestions[i];
        if (!q.text.trim()) {
          showCurateAlert(`Question #${i + 1} is missing question text.`);
          return;
        }
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].text.trim()) {
            showCurateAlert(`Question #${i + 1} Option ${String.fromCharCode(65 + j)} cannot be blank.`);
            return;
          }
        }
        const hasCorrect = q.options.some(opt => opt.isCorrect);
        if (!hasCorrect) {
          showCurateAlert(`Question #${i + 1} must have a designated correct option.`);
          return;
        }
      }

      const totalMarks = state.curateQuestions.reduce((sum, q) => sum + (parseInt(q.marks, 10) || 0), 0);

      let savedQuiz;
      if (state.editingQuizId) {
        const existing = state.quizzes.find(q => q.id === state.editingQuizId);
        savedQuiz = {
          ...existing,
          title,
          subjectCode,
          subjectName,
          timeLimitMinutes: duration,
          totalMarks,
          passingMarks: Math.min(totalMarks, passingMarks),
          instructions,
          questions: state.curateQuestions,
        };

        state.quizzes = state.quizzes.map(q => q.id === savedQuiz.id ? savedQuiz : q);
        showToast(`Quiz "${savedQuiz.title}" updated successfully!`);
      } else {
        const newId = 'quiz-' + Date.now();
        savedQuiz = {
          id: newId,
          title,
          subjectCode,
          subjectName,
          description: `Assessment on ${subjectCode}: ${title}`,
          timeLimitMinutes: duration,
          totalMarks,
          passingMarks: Math.min(totalMarks, passingMarks),
          instructions,
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          dueTime: '23:59',
          shuffleQuestions: true,
          instantResults: true,
          createdAt: new Date().toISOString(),
          status: 'draft',
          assignedTo: [],
          questions: state.curateQuestions,
        };

        state.quizzes.unshift(savedQuiz);
        showToast(`New quiz "${savedQuiz.title}" created!`);
      }

      saveToStorage('app_quizzes_v2', state.quizzes);
      state.editingQuizId = null;

      // Automatically transition to Assign tab with this quiz selected
      state.selectedAssignQuizId = savedQuiz.id;
      state.teacherTab = 'assign';
      renderTeacherDashboard();
    });

    // Assign Tab: Quiz Select change
    document.getElementById('assign-quiz-select').addEventListener('change', (e) => {
      state.selectedAssignQuizId = e.target.value;
      updateAssignPreview();
    });

    // Assign Tab: Submit Assignment
    document.getElementById('assign-submit-btn').addEventListener('click', () => {
      const quizId = document.getElementById('assign-quiz-select').value;
      const divA = document.getElementById('assign-div-a').checked;
      const divB = document.getElementById('assign-div-b').checked;

      const batchA = document.getElementById('assign-batch-a').checked;
      const batchB = document.getElementById('assign-batch-b').checked;
      const batchC = document.getElementById('assign-batch-c').checked;

      const dueDate = document.getElementById('assign-due-date').value;
      const dueTime = document.getElementById('assign-due-time').value;

      const shuffle = document.getElementById('assign-shuffle').checked;
      const instant = document.getElementById('assign-instant').checked;

      const alert = document.getElementById('assign-alert');
      alert.classList.add('hidden');

      if (!quizId) {
        alert.textContent = 'Please select a quiz to assign.';
        alert.classList.remove('hidden');
        return;
      }
      if (!divA && !divB) {
        alert.textContent = 'Please select at least one division (Division A or Division B).';
        alert.classList.remove('hidden');
        return;
      }

      const selectedBatches = [];
      if (batchA) selectedBatches.push('BATCH_A');
      if (batchB) selectedBatches.push('BATCH_B');
      if (batchC) selectedBatches.push('BATCH_C');

      if (selectedBatches.length === 0) {
        alert.textContent = 'Please select at least one batch.';
        alert.classList.remove('hidden');
        return;
      }
      if (!dueDate) {
        alert.textContent = 'Please select a submission due date.';
        alert.classList.remove('hidden');
        return;
      }

      const assignments = [];
      if (divA) assignments.push({ division: 'DIV_A', batches: selectedBatches });
      if (divB) assignments.push({ division: 'DIV_B', batches: selectedBatches });

      state.quizzes = state.quizzes.map(q => {
        if (q.id === quizId) {
          return {
            ...q,
            assignedTo: assignments,
            dueDate,
            dueTime,
            shuffleQuestions: shuffle,
            instantResults: instant,
            status: 'assigned',
          };
        }
        return q;
      });

      saveToStorage('app_quizzes_v2', state.quizzes);
      const assignedQuiz = state.quizzes.find(q => q.id === quizId);
      showToast(`Quiz "${assignedQuiz?.title}" has been assigned to student batches!`);

      state.teacherTab = 'list';
      renderTeacherDashboard();
    });

    // List Tab: Curate New Quiz button
    document.getElementById('list-curate-new-btn').addEventListener('click', () => {
      document.getElementById('tab-btn-curate').click();
    });

    // Student Switcher (if present)
    const studentSwitcherEl = document.getElementById('student-view-switcher');
    if (studentSwitcherEl) {
      studentSwitcherEl.addEventListener('change', (e) => {
        state.currentStudentId = e.target.value;
        saveToStorage('app_current_student_id', state.currentStudentId);
        renderStudentDashboard();
        const student = getCurrentStudent();
        showToast(`Switched view to student: ${student.name}`);
      });
    }

    // Exam Controls
    document.getElementById('exam-clear-choice-btn').addEventListener('click', () => {
      if (!state.activeExam) return;
      const currentQ = state.activeExam.questions[state.activeExam.currentIdx];
      delete state.activeExam.selectedAnswers[currentQ.id];
      renderExamView();
    });

    document.getElementById('exam-prev-btn').addEventListener('click', () => {
      if (!state.activeExam) return;
      state.activeExam.currentIdx = Math.max(0, state.activeExam.currentIdx - 1);
      renderExamView();
    });

    document.getElementById('exam-next-btn').addEventListener('click', () => {
      if (!state.activeExam) return;
      state.activeExam.currentIdx = Math.min(state.activeExam.questions.length - 1, state.activeExam.currentIdx + 1);
      renderExamView();
    });

    document.getElementById('exam-submit-btn').addEventListener('click', () => {
      if (!state.activeExam) return;
      const answered = Object.keys(state.activeExam.selectedAnswers).length;
      const total = state.activeExam.questions.length;

      document.getElementById('exam-confirm-answered-text').textContent = `You have answered ${answered} of ${total} questions.`;

      const warningEl = document.getElementById('exam-confirm-warning');
      if (answered < total) {
        warningEl.innerHTML = `<span>You have <strong>${total - answered} unanswered</strong> questions. Once submitted, answers cannot be modified.</span>`;
        warningEl.classList.remove('hidden');
      } else {
        warningEl.classList.add('hidden');
      }

      document.getElementById('exam-confirm-dialog').classList.remove('hidden');
    });

    document.getElementById('exam-confirm-cancel-btn').addEventListener('click', () => {
      document.getElementById('exam-confirm-dialog').classList.add('hidden');
    });

    document.getElementById('exam-confirm-yes-btn').addEventListener('click', () => {
      submitExam(false);
    });

    document.getElementById('exam-close-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to exit the quiz? Your progress in this session will be lost.')) {
        closeExamModal();
      }
    });

    // Close Result Modal
    document.getElementById('result-close-btn').addEventListener('click', () => {
      document.getElementById('result-modal').classList.add('hidden');
    });
    document.getElementById('result-header-close-btn').addEventListener('click', () => {
      document.getElementById('result-modal').classList.add('hidden');
    });

    // Close Submissions Modal
    document.getElementById('submissions-close-btn').addEventListener('click', () => {
      document.getElementById('submissions-modal').classList.add('hidden');
    });
    document.getElementById('submissions-header-close-btn').addEventListener('click', () => {
      document.getElementById('submissions-modal').classList.add('hidden');
    });

    // Initial state setup
    state.curateQuestions = initDefaultCurateQuestions();
    updateDashboardView();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
