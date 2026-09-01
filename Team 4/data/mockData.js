/**
 * mockData.js
 * ------------------------------------------------------------------
 * Centralized, deterministic mock dataset for the Student Marks
 * Analytics & CO/PO Attainment Tool (Module 6 & 7).
 *
 * ALL demo numbers used anywhere in the UI are derived from this file
 * (via services/analyticsService.js). Nothing is hardcoded again in
 * the page-rendering modules.
 *
 * >>> BACKEND INTEGRATION NOTE <<<
 * When the real backend (Modules 1-5) is ready, this file is no
 * longer needed. Replace the functions in services/apiService.js so
 * they call real REST endpoints instead of reading MOCK_DB below.
 * Nothing else in the app needs to change.
 * ------------------------------------------------------------------
 */

(function (global) {
  'use strict';

  // ---------------------------------------------------------------
  // Deterministic PRNG (mulberry32) so the "random" academic data is
  // stable across reloads/screenshots/exports.
  // ---------------------------------------------------------------
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(20260901);
  const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
  const pick = (arr) => arr[randInt(0, arr.length - 1)];
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // ---------------------------------------------------------------
  // Static reference data
  // ---------------------------------------------------------------
  const ACADEMIC_YEARS = ['2025-26', '2026-27'];
  const SEMESTERS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
  const BRANCHES = ['Computer Engineering', 'IT', 'ENTC'];
  const BATCHES = { 'Computer Engineering': ['TE-A', 'TE-B', 'TE-C'], 'IT': ['TE-A', 'TE-B'], 'ENTC': ['TE-A', 'TE-B'] };

  const SUBJECTS = [
    { id: 'SUB1', code: 'CE301', name: 'Database Management Systems', credits: 4 },
    { id: 'SUB2', code: 'CE302', name: 'Data Structures & Algorithms', credits: 4 },
    { id: 'SUB3', code: 'CE303', name: 'Computer Networks', credits: 3 },
    { id: 'SUB4', code: 'CE304', name: 'Operating Systems', credits: 4 },
    { id: 'SUB5', code: 'CE305', name: 'Software Engineering', credits: 3 },
  ];

  const ASSESSMENTS = [
    { id: 'A1', name: 'Unit Test 1', type: 'Unit Test', maxMarks: 20, weight: 0.1 },
    { id: 'A2', name: 'Internal Assessment', type: 'Internal Test', maxMarks: 30, weight: 0.2 },
    { id: 'A3', name: 'Mid Semester', type: 'Internal Test', maxMarks: 30, weight: 0.2 },
    { id: 'A4', name: 'Unit Test 2', type: 'Unit Test', maxMarks: 20, weight: 0.1 },
    { id: 'A5', name: 'Final Internal', type: 'Internal Test', maxMarks: 100, weight: 0.4 },
  ];

  const COS = [
    { id: 'CO1', title: 'Design and implement relational database schemas', target: 60 },
    { id: 'CO2', title: 'Apply normalization and query optimization techniques', target: 60 },
    { id: 'CO3', title: 'Analyze algorithmic complexity and select appropriate data structures', target: 60 },
    { id: 'CO4', title: 'Design solutions using core software engineering principles', target: 60 },
    { id: 'CO5', title: 'Evaluate networking protocols and system architectures', target: 60 },
    { id: 'CO6', title: 'Demonstrate professional, ethical and collaborative practice', target: 60 },
  ];

  const POS = [
    { id: 'PO1', title: 'Engineering Knowledge', target: 60 },
    { id: 'PO2', title: 'Problem Analysis', target: 60 },
    { id: 'PO3', title: 'Design/Development of Solutions', target: 60 },
    { id: 'PO4', title: 'Conduct Investigations of Complex Problems', target: 60 },
    { id: 'PO5', title: 'Modern Tool Usage', target: 60 },
    { id: 'PO6', title: 'The Engineer and Society', target: 60 },
    { id: 'PO7', title: 'Environment and Sustainability', target: 60 },
    { id: 'PO8', title: 'Ethics', target: 60 },
    { id: 'PO9', title: 'Individual and Team Work', target: 60 },
    { id: 'PO10', title: 'Communication', target: 60 },
    { id: 'PO11', title: 'Project Management and Finance', target: 60 },
    { id: 'PO12', title: 'Life-long Learning', target: 60 },
  ];

  // CO -> PO mapping strength (0 = none, 1 = low, 2 = medium, 3 = high)
  const CO_PO_MATRIX = {
    CO1: [3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 1],
    CO2: [3, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1],
    CO3: [2, 3, 2, 1, 1, 0, 0, 0, 1, 0, 0, 2],
    CO4: [2, 2, 3, 1, 2, 1, 0, 0, 2, 1, 1, 2],
    CO5: [2, 2, 2, 2, 2, 1, 1, 0, 1, 0, 0, 1],
    CO6: [0, 0, 1, 0, 1, 2, 2, 3, 3, 3, 2, 3],
  };

  const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Rohan', 'Kabir', 'Arjun',
    'Ananya', 'Diya', 'Saanvi', 'Myra', 'Isha', 'Kiara', 'Riya', 'Sneha', 'Neha', 'Priya',
    'Om', 'Yash', 'Dev', 'Aryan', 'Vihaan', 'Tanish', 'Sanika', 'Pooja', 'Meera', 'Vedika'];
  const LAST_NAMES = ['Kulkarni', 'Deshmukh', 'Patil', 'Joshi', 'Shah', 'Rane', 'Kadam', 'More', 'Gaikwad', 'Bhosale',
    'Sharma', 'Verma', 'Iyer', 'Nair', 'Kale', 'Pawar', 'Chavan', 'Jadhav', 'Salunkhe', 'Wagh'];

  // ---------------------------------------------------------------
  // Student generation
  // A student "aptitude" 0..1 drives correlated performance across
  // subjects/assessments/COs so the dataset feels internally
  // consistent instead of pure noise.
  // ---------------------------------------------------------------
  function buildStudents(count) {
    const students = [];
    for (let i = 0; i < count; i++) {
      const roll = 21 + i;
      const first = FIRST_NAMES[i % FIRST_NAMES.length];
      const last = LAST_NAMES[(i * 7) % LAST_NAMES.length];
      // aptitude skewed so most students cluster mid-high, some struggle
      let aptitude = clamp(rand() * 0.55 + rand() * 0.35 + 0.1, 0.15, 0.98);
      if (i % 9 === 0) aptitude = clamp(aptitude - 0.28, 0.1, 1); // deliberate strugglers
      if (i % 11 === 0) aptitude = clamp(aptitude + 0.15, 0.1, 0.99); // toppers

      const attendance = clamp(Math.round((aptitude * 30 + rand() * 25 + 60)), 55, 100);

      students.push({
        id: 'STU' + (1000 + i),
        rollNo: 'TE' + String(roll).padStart(3, '0'),
        prn: '72' + String(100000 + roll * 37),
        name: `${first} ${last}`,
        branch: 'Computer Engineering',
        batch: BATCHES['Computer Engineering'][i % 3],
        semester: 'Sem 5',
        academicYear: '2026-27',
        aptitude,
        attendance,
      });
    }
    return students;
  }

  const STUDENTS = buildStudents(30);

  // ---------------------------------------------------------------
  // Marks: for every student x subject x assessment
  // ---------------------------------------------------------------
  function buildMarks(students) {
    const marks = [];
    students.forEach((stu) => {
      SUBJECTS.forEach((subj) => {
        // slight per-subject variance around the student's aptitude
        const subjSkew = (rand() - 0.5) * 0.18;
        ASSESSMENTS.forEach((a) => {
          const perf = clamp(stu.aptitude + subjSkew + (rand() - 0.5) * 0.12, 0.08, 1);
          const obtained = Math.round(perf * a.maxMarks);
          marks.push({
            studentId: stu.id,
            subjectId: subj.id,
            assessmentId: a.id,
            obtained: clamp(obtained, 0, a.maxMarks),
            maxMarks: a.maxMarks,
          });
        });
      });
    });
    return marks;
  }

  const MARKS = buildMarks(STUDENTS);

  // ---------------------------------------------------------------
  // CO attainment per student (derived from a weighted mix of
  // assessments per CO, using the same aptitude model + noise so it
  // correlates with, but is not identical to, subject marks).
  // ---------------------------------------------------------------
  function buildStudentCOAttainment(students) {
    const table = {}; // studentId -> { CO1: pct, ... }
    students.forEach((stu) => {
      table[stu.id] = {};
      COS.forEach((co, idx) => {
        const coSkew = (rand() - 0.5) * 0.16;
        // CO3 (algorithms) intentionally trends lower across the class
        const classBias = co.id === 'CO3' ? -0.08 : co.id === 'CO1' ? 0.05 : 0;
        const pct = clamp((stu.aptitude + coSkew + classBias) * 100, 5, 100);
        table[stu.id][co.id] = Math.round(pct);
      });
    });
    return table;
  }

  const STUDENT_CO = buildStudentCOAttainment(STUDENTS);

  // ---------------------------------------------------------------
  // Export a single frozen MOCK_DB object
  // ---------------------------------------------------------------
  const MOCK_DB = Object.freeze({
    meta: {
      institution: "Marathwada Mitra Mandal's College of Engineering",
      department: 'Department of Computer Engineering',
      generatedBy: 'Student Marks Analytics & CO Attainment Tool',
    },
    filters: {
      academicYears: ACADEMIC_YEARS,
      semesters: SEMESTERS,
      branches: BRANCHES,
      batches: BATCHES,
    },
    subjects: SUBJECTS,
    assessments: ASSESSMENTS,
    cos: COS,
    pos: POS,
    coPoMatrix: CO_PO_MATRIX,
    students: STUDENTS,
    marks: MARKS,
    studentCOAttainment: STUDENT_CO,
  });

  global.MOCK_DB = MOCK_DB;
})(window);
