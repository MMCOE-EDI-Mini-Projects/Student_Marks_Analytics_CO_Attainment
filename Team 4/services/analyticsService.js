/**
 * analyticsService.js
 * ------------------------------------------------------------------
 * Pure, reusable calculation functions. No DOM access here.
 * Every derived number shown in the UI should be computed by one of
 * these functions rather than hardcoded.
 * ------------------------------------------------------------------
 */

(function (global) {
  'use strict';

  const RISK_THRESHOLDS = { excellent: 85, good: 70, average: 55 };
  const DEFAULT_CO_TARGET = 60;

  function calculateAverage(values) {
    if (!values || !values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  function calculateWeightedAverage(pairs) {
    // pairs: [{ value, weight }]
    if (!pairs || !pairs.length) return 0;
    const totalWeight = pairs.reduce((s, p) => s + p.weight, 0) || 1;
    const totalValue = pairs.reduce((s, p) => s + p.value * p.weight, 0);
    return totalValue / totalWeight;
  }

  function calculatePercentage(obtained, maximum) {
    if (!maximum) return 0;
    return (obtained / maximum) * 100;
  }

  function calculateGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  }

  function calculatePassPercentage(percentages, passMark = 40) {
    if (!percentages.length) return 0;
    const passed = percentages.filter((p) => p >= passMark).length;
    return (passed / percentages.length) * 100;
  }

  function calculateHighest(values) {
    return values.length ? Math.max(...values) : 0;
  }

  function calculateLowest(values) {
    return values.length ? Math.min(...values) : 0;
  }

  function calculateMedian(values) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  function calculateStdDev(values) {
    if (values.length < 2) return 0;
    const avg = calculateAverage(values);
    const variance = calculateAverage(values.map((v) => (v - avg) ** 2));
    return Math.sqrt(variance);
  }

  function calculateGap(target, attainment) {
    return +(target - attainment).toFixed(1);
  }

  function classifyAttainmentStatus(target, attainment) {
    if (attainment >= target) return 'Achieved';
    if (attainment >= target - 10) return 'Near Target';
    return 'Below Target';
  }

  function calculateRisk(percentage) {
    if (percentage >= RISK_THRESHOLDS.excellent) return 'Excellent';
    if (percentage >= RISK_THRESHOLDS.good) return 'Good';
    if (percentage >= RISK_THRESHOLDS.average) return 'Average';
    return 'At Risk';
  }

  function calculateGradeDistribution(percentages) {
    const grades = ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'];
    const dist = Object.fromEntries(grades.map((g) => [g, 0]));
    percentages.forEach((p) => { dist[calculateGrade(p)]++; });
    return grades.map((g) => ({
      grade: g,
      count: dist[g],
      percentage: percentages.length ? +((dist[g] / percentages.length) * 100).toFixed(1) : 0,
    }));
  }

  /**
   * CO attainment (Demo Calculation Method):
   * average of the per-student CO percentage across the given student set.
   */
  function calculateCOAttainment(studentCOMap, studentIds, coId) {
    const values = studentIds.map((sid) => (studentCOMap[sid] || {})[coId]).filter((v) => v != null);
    return +calculateAverage(values).toFixed(1);
  }

  function countStudentsAchievingCO(studentCOMap, studentIds, coId, target) {
    return studentIds.filter((sid) => (studentCOMap[sid] || {})[coId] >= target).length;
  }

  /**
   * PO attainment (Demo Calculation Method):
   * weighted roll-up of CO attainments into each PO using the CO->PO
   * mapping strength as the weight (0 contributes nothing).
   */
  function calculatePOAttainment(coAttainmentMap, coPoMatrix, cos, poIndex) {
    const pairs = cos
      .map((co) => ({ value: coAttainmentMap[co.id] || 0, weight: (coPoMatrix[co.id] || [])[poIndex] || 0 }))
      .filter((p) => p.weight > 0);
    if (!pairs.length) return 0;
    return +calculateWeightedAverage(pairs).toFixed(1);
  }

  function trend(current, previous) {
    if (previous == null || previous === 0) return { direction: 'flat', delta: 0 };
    const delta = +(current - previous).toFixed(1);
    return { direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat', delta: Math.abs(delta) };
  }

  global.AnalyticsService = {
    RISK_THRESHOLDS,
    DEFAULT_CO_TARGET,
    calculateAverage,
    calculateWeightedAverage,
    calculatePercentage,
    calculateGrade,
    calculatePassPercentage,
    calculateHighest,
    calculateLowest,
    calculateMedian,
    calculateStdDev,
    calculateGap,
    classifyAttainmentStatus,
    calculateRisk,
    calculateGradeDistribution,
    calculateCOAttainment,
    countStudentsAchievingCO,
    calculatePOAttainment,
    trend,
  };
})(window);
