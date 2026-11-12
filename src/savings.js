'use strict';

// Savings estimator (Kris, Nov 11, 2026: the funding theme from the
// Dual Enrollment Task Force work, added to the checker).
//
// The estimate answers the family's money question with published
// numbers only: hours that count TOWARD THE DEGREE at the target
// college, multiplied by that college's published tuition and fees
// per credit hour (its 15-hour semester total divided by 15, from
// data/tuition.json, each rate traceable to the college's own fee
// schedule).
//
// Rules:
// - credit-only (elective) hours are never counted: they may not
//   shorten the degree, so pricing them would overstate savings;
// - a college with no verified published rate returns null, and no
//   figure is shown for it, never an interpolated or guessed one;
// - the figure is an estimate at published rates before financial
//   aid, and the result carries its source so it can be checked.

function rateFor(college, ratesData) {
  if (!college || !ratesData || !ratesData.rates) return null;
  return ratesData.rates[college] || null;
}

function estimateSavings(college, degreeHours, ratesData) {
  if (!college || !degreeHours || degreeHours <= 0) return null;
  const rate = rateFor(college, ratesData);
  if (!rate) return null;
  return {
    college,
    hours: degreeHours,
    perCreditHour: rate.perCreditHour,
    amount: Math.round(degreeHours * rate.perCreditHour),
    basis: rate.basis,
    schedule: rate.schedule,
    sourceName: rate.sourceName,
    sourceUrl: rate.sourceUrl,
  };
}

// Degree hours inside a guidance result: the courses and AP results
// the guidance layer classified as counting toward the degree.
function degreeHoursOf(guidance) {
  if (!guidance) return 0;
  const fromCourses = (guidance.degree || []).reduce(
    (sum, c) => sum + (c.degreeCredit || 0), 0
  );
  const fromAp = (guidance.apDegree || []).reduce(
    (sum, a) => sum + (a.degreeCredit || 0), 0
  );
  return fromCourses + fromAp;
}

// Attach the estimate to a guidance result for a target college.
// Returns the guidance object with a `savings` field (null when no
// estimate can be made).
function withSavings(guidance, college, ratesData) {
  if (!guidance) return guidance;
  guidance.savings = estimateSavings(college, degreeHoursOf(guidance), ratesData);
  return guidance;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { estimateSavings, degreeHoursOf, rateFor, withSavings };
}
if (typeof window !== 'undefined') {
  window.estimateSavings = estimateSavings;
}
