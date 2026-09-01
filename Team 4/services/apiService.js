/**
 * apiService.js
 * ------------------------------------------------------------------
 * This is the ONLY file that should know whether data comes from
 * mock objects or a real backend.
 *
 * >>> BACKEND TEAM: START HERE <<<
 * Every exported function below currently resolves mock data
 * synchronously wrapped in a Promise. To connect a real backend,
 * replace the body of each function with a fetch() call to the
 * matching REST endpoint (see README.md for the contract), e.g.:
 *
 *   async function getDashboardAnalytics(filters) {
 *     const qs = new URLSearchParams(filters).toString();
 *     const res = await fetch(`/api/dashboard?${qs}`);
 *     if (!res.ok) throw new Error('Failed to load dashboard analytics');
 *     return res.json();
 *   }
 *
 * The rest of the application (js/*.js) only calls these functions
 * and never touches MOCK_DB directly, so no UI code needs to change.
 * ------------------------------------------------------------------
 */

(function (global) {
  'use strict';

  const A = global.AnalyticsService;
  const DB = global.MOCK_DB;

  // Simulate a small, realistic network delay so loading states are visible.
  const NETWORK_DELAY = 260;
  function resolveAfterDelay(value) {
    return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY));
  }

  // ------------------------------------------------------------
  // Filter resolution
  // Only "batch" produces a genuinely different student subset in
  // this demo dataset. Academic Year / Semester / Branch shift the
  // numbers by a small deterministic factor so switching filters
  // visibly changes the dashboard, without needing a second dataset
  // per combination (clearly a Demo Calculation Method).
  // ------------------------------------------------------------
  function resolveStudents(filters) {
    filters = filters || {};
    let students = DB.students;
    if (filters.batch && filters.batch !== 'All Batches') {
      students = students.filter((s) => s.batch === filters.batch);
    }
    return students;
  }

  function filterFactor(filters) {
    filters = filters || {};
    const key = `${filters.academicYear || ''}|${filters.semester || ''}|${filters.branch || ''}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    // small +/-4% wobble so different filter combos read differently
    return 1 + (((hash % 800) - 400) / 10000);
  }

  function studentPercentage(studentId) {
    const rows = DB.marks.filter((m) => m.studentId === studentId);
    const obtained = rows.reduce((s, r) => s + r.obtained, 0);
    const max = rows.reduce((s, r) => s + r.maxMarks, 0);
    return A.calculatePercentage(obtained, max);
  }

  function studentSubjectPercentage(studentId, subjectId) {
    const rows = DB.marks.filter((m) => m.studentId === studentId && m.subjectId === subjectId);
    const obtained = rows.reduce((s, r) => s + r.obtained, 0);
    const max = rows.reduce((s, r) => s + r.maxMarks, 0);
    return A.calculatePercentage(obtained, max);
  }

  function studentAssessmentPercentage(studentId, assessmentId) {
    const rows = DB.marks.filter((m) => m.studentId === studentId && m.assessmentId === assessmentId);
    const obtained = rows.reduce((s, r) => s + r.obtained, 0);
    const max = rows.reduce((s, r) => s + r.maxMarks, 0);
    return A.calculatePercentage(obtained, max);
  }

  // ------------------------------------------------------------
  // Dashboard
  // ------------------------------------------------------------
  async function getFilterOptions() {
    return resolveAfterDelay({
      academicYears: DB.filters.academicYears,
      semesters: DB.filters.semesters,
      branches: DB.filters.branches,
      batches: ['All Batches', ...DB.filters.batches['Computer Engineering']],
    });
  }

  async function getDashboardAnalytics(filters) {
    const students = resolveStudents(filters);
    const factor = filterFactor(filters);
    const ids = students.map((s) => s.id);
    const percentages = students.map((s) => studentPercentage(s.id) * factor);

    const avgMarks = A.calculateAverage(percentages);
    const passPct = A.calculatePassPercentage(percentages, 40);

    const coAttainment = {};
    DB.cos.forEach((co) => { coAttainment[co.id] = A.calculateCOAttainment(DB.studentCOAttainment, ids, co.id) * factor; });
    const overallCO = A.calculateAverage(Object.values(coAttainment));

    const poAttainment = {};
    DB.pos.forEach((po, idx) => { poAttainment[po.id] = A.calculatePOAttainment(coAttainment, DB.coPoMatrix, DB.cos, idx); });
    const overallPO = A.calculateAverage(Object.values(poAttainment));

    const riskCounts = { Excellent: 0, Good: 0, Average: 0, 'At Risk': 0 };
    percentages.forEach((p) => { riskCounts[A.calculateRisk(p)]++; });

    const gradeDist = A.calculateGradeDistribution(percentages);

    const trendLabels = DB.assessments.map((a) => a.name);
    const trendAvg = DB.assessments.map((a) => {
      const vals = students.map((s) => studentAssessmentPercentage(s.id, a.id) * factor);
      return +A.calculateAverage(vals).toFixed(1);
    });
    const trendPass = DB.assessments.map((a) => {
      const vals = students.map((s) => studentAssessmentPercentage(s.id, a.id) * factor);
      return +A.calculatePassPercentage(vals, 40).toFixed(1);
    });

    return resolveAfterDelay({
      kpis: {
        totalStudents: students.length,
        averageMarks: +avgMarks.toFixed(1),
        passPercentage: +passPct.toFixed(1),
        overallCOAttainment: +overallCO.toFixed(1),
        overallPOAttainment: +overallPO.toFixed(1),
        atRiskStudents: riskCounts['At Risk'],
        // "previous assessment" comparison baselines for trend arrows
        previous: {
          averageMarks: +(avgMarks - 4.8).toFixed(1),
          passPercentage: +(passPct - 3.1).toFixed(1),
          overallCOAttainment: +(overallCO - 2.4).toFixed(1),
          overallPOAttainment: +(overallPO - 1.6).toFixed(1),
          atRiskStudents: riskCounts['At Risk'] + 5,
          totalStudents: students.length,
        },
      },
      gradeDistribution: gradeDist,
      coAttainment: DB.cos.map((co) => ({ id: co.id, title: co.title, target: co.target, attainment: +coAttainment[co.id].toFixed(1) })),
      poAttainment: DB.pos.map((po, i) => ({ id: po.id, title: po.title, target: po.target, attainment: poAttainment[po.id] })),
      performanceTrend: { labels: trendLabels, classAverage: trendAvg, passPercentage: trendPass },
      riskDistribution: riskCounts,
      sparkline: {
        averageMarks: trendAvg,
        passPercentage: trendPass,
      },
    });
  }

  async function getInsights(filters) {
    const dash = await getDashboardAnalytics(filters);
    const insights = [];
    const worstCO = [...dash.coAttainment].sort((a, b) => a.attainment - b.attainment)[0];
    if (worstCO) {
      insights.push({
        type: worstCO.attainment < worstCO.target ? 'warning' : 'info',
        text: `${worstCO.id} currently has the lowest attainment at ${worstCO.attainment}%, which is ${Math.abs(A.calculateGap(worstCO.target, worstCO.attainment)).toFixed(1)} percentage points ${worstCO.attainment < worstCO.target ? 'below' : 'above'} the target.`,
      });
    }
    insights.push({ type: 'danger', text: `${dash.kpis.atRiskStudents} students are currently classified as at-risk based on overall performance below 55%.` });
    const marksTrend = A.trend(dash.kpis.averageMarks, dash.kpis.previous.averageMarks);
    insights.push({
      type: marksTrend.direction === 'up' ? 'success' : 'warning',
      text: `Average class performance ${marksTrend.direction === 'up' ? 'improved' : 'declined'} by ${marksTrend.delta.toFixed(1)}% compared with the previous assessment.`,
    });
    const bestPO = [...dash.poAttainment].sort((a, b) => b.attainment - a.attainment)[0];
    if (bestPO) {
      insights.push({ type: 'success', text: `${bestPO.id} (${bestPO.title}) leads programme outcome attainment at ${bestPO.attainment}%.` });
    }
    return resolveAfterDelay(insights);
  }

  // ------------------------------------------------------------
  // Students
  // ------------------------------------------------------------
  async function getStudents(filters) {
    const students = resolveStudents(filters);
    const factor = filterFactor(filters);
    const withMetrics = students.map((s) => {
      const pct = studentPercentage(s.id) * factor;
      const coValues = Object.values(DB.studentCOAttainment[s.id] || {});
      const coAvg = A.calculateAverage(coValues);
      return {
        ...s,
        average: +pct.toFixed(1),
        coAttainment: +coAvg.toFixed(1),
        grade: A.calculateGrade(pct),
        risk: A.calculateRisk(pct),
      };
    }).sort((a, b) => b.average - a.average)
      .map((s, i) => ({ ...s, rank: i + 1 }));
    return resolveAfterDelay(withMetrics);
  }

  async function getStudentById(id) {
    const student = DB.students.find((s) => s.id === id);
    if (!student) return resolveAfterDelay(null);
    const pct = studentPercentage(id);
    const subjectPerf = DB.subjects.map((subj) => ({
      subject: subj.name, code: subj.code, percentage: +studentSubjectPercentage(id, subj.id).toFixed(1),
    }));
    const coPerf = DB.cos.map((co) => ({ co: co.id, title: co.title, target: co.target, attainment: DB.studentCOAttainment[id][co.id] }));
    const assessmentTrend = DB.assessments.map((a) => ({ name: a.name, percentage: +studentAssessmentPercentage(id, a.id).toFixed(1) }));
    const allStudents = await getStudents();
    const rankInfo = allStudents.find((s) => s.id === id);
    const sortedCO = [...coPerf].sort((a, b) => b.attainment - a.attainment);
    return resolveAfterDelay({
      ...student,
      overallPercentage: +pct.toFixed(1),
      grade: A.calculateGrade(pct),
      rank: rankInfo ? rankInfo.rank : null,
      totalStudents: allStudents.length,
      passStatus: pct >= 40 ? 'Pass' : 'Fail',
      coAttainmentOverall: +A.calculateAverage(coPerf.map((c) => c.attainment)).toFixed(1),
      subjectPerformance: subjectPerf,
      coPerformance: coPerf,
      assessmentTrend,
      strengths: sortedCO.slice(0, 2).map((c) => c.co),
      weaknesses: sortedCO.slice(-2).map((c) => c.co),
      marks: DB.marks.filter((m) => m.studentId === id),
    });
  }

  // ------------------------------------------------------------
  // CO / PO
  // ------------------------------------------------------------
  async function getCOAttainment(filters) {
    const dash = await getDashboardAnalytics(filters);
    const students = resolveStudents(filters);
    const ids = students.map((s) => s.id);
    return resolveAfterDelay(dash.coAttainment.map((co) => {
      const gap = A.calculateGap(co.target, co.attainment);
      return {
        ...co,
        gap,
        status: A.classifyAttainmentStatus(co.target, co.attainment),
        studentsAchieved: A.countStudentsAchievingCO(DB.studentCOAttainment, ids, co.id, co.target),
        totalStudents: ids.length,
        trend: A.trend(co.attainment, co.attainment - (2 + (co.id.charCodeAt(2) % 4))).direction,
      };
    }));
  }

  async function getPOAttainment(filters) {
    const dash = await getDashboardAnalytics(filters);
    return resolveAfterDelay(dash.poAttainment.map((po) => ({
      ...po,
      gap: A.calculateGap(po.target, po.attainment),
      status: A.classifyAttainmentStatus(po.target, po.attainment),
    })));
  }

  async function getCOPOMatrix() {
    return resolveAfterDelay({ cos: DB.cos, pos: DB.pos, matrix: DB.coPoMatrix });
  }

  // ------------------------------------------------------------
  // Assessment analytics
  // ------------------------------------------------------------
  async function getAssessmentAnalytics(filters) {
    const students = resolveStudents(filters);
    const factor = filterFactor(filters);
    return resolveAfterDelay(DB.assessments.map((a) => {
      const values = students.map((s) => studentAssessmentPercentage(s.id, a.id) * factor);
      return {
        id: a.id,
        name: a.name,
        type: a.type,
        maxMarks: a.maxMarks,
        average: +A.calculateAverage(values).toFixed(1),
        highest: +A.calculateHighest(values).toFixed(1),
        lowest: +A.calculateLowest(values).toFixed(1),
        median: +A.calculateMedian(values).toFixed(1),
        stdDev: +A.calculateStdDev(values).toFixed(1),
        passPercentage: +A.calculatePassPercentage(values, 40).toFixed(1),
        distribution: A.calculateGradeDistribution(values),
      };
    }));
  }

  global.ApiService = {
    getFilterOptions,
    getDashboardAnalytics,
    getInsights,
    getStudents,
    getStudentById,
    getCOAttainment,
    getPOAttainment,
    getCOPOMatrix,
    getAssessmentAnalytics,
  };
})(window);
