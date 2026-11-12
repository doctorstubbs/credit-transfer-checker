// Transfer admission check: evaluates a student record against
// the Louisiana Board of Regents minimum admission standards for
// transfer students (data/admission-standards.json; Fall 2024
// edition, policy updates March 21, 2025 and February 3, 2026).
//
// A transfer student meets the state minimum by satisfying ONE
// of the published paths: earned credits, a partnership bridge
// program, an associate degree, or the adult path. The first-year
// path also exists in the standards but needs a high school
// record this check does not collect, so it is named in the
// notes and never scored.
//
// These are state MINIMUMS for public institutions. A college
// may set higher requirements, so a "meets" verdict means the
// state minimum is met, never that admission is guaranteed.
// Two-year colleges are open admission; the standards do not
// apply to private colleges at all.

const defaultStandards = require('../data/admission-standards.json');

function fmtGpa(g) {
  return g.toFixed(2).replace(/0$/, '');
}

function institutionTypeOf(collegeName, standards = defaultStandards) {
  return standards.institutionTypes[collegeName] || null;
}

function earnedCreditsPath(input, type, standards) {
  const t = standards.transfer.earnedCredits[type];
  const missing = [];
  if (input.earnedHours == null || input.gpa == null) {
    if (input.earnedHours == null) missing.push('the number of college-level credit hours earned');
    if (input.gpa == null) missing.push('the GPA on college-level courses');
    return { id: 'earned-credits', status: 'cannot-tell', missing };
  }
  if (input.earnedHours < t.minHours) missing.push(`at least ${t.minHours} college-level credit hours`);
  if (input.gpa < t.minGpa) missing.push(`a GPA of at least ${fmtGpa(t.minGpa)}`);
  if (standards.transfer.earnedCreditsRequiresEnglishAndMath) {
    if (!input.englishCompleted) missing.push('college-level English with a C or better');
    if (!input.mathCompleted) missing.push('college-level mathematics with a C or better');
  }
  return { id: 'earned-credits', status: missing.length === 0 ? 'meets' : 'does-not-meet', missing };
}

function bridgePath(input, standards) {
  const missing = [];
  if (!input.inBridgeProgram) {
    return { id: 'bridge', status: 'does-not-meet', missing: ['enrollment in a partnership bridge program'] };
  }
  if (input.earnedHours == null) {
    return { id: 'bridge', status: 'cannot-tell', missing: ['the number of college-level credit hours earned'] };
  }
  if (input.earnedHours < standards.transfer.bridge.minHours) {
    missing.push(`at least ${standards.transfer.bridge.minHours} college-level credit hours from the bridge program`);
  }
  if (standards.transfer.bridge.requiresEnglishAndMath) {
    if (!input.englishCompleted) missing.push('college-level English with a C or better');
    if (!input.mathCompleted) missing.push('college-level mathematics with a C or better');
  }
  return { id: 'bridge', status: missing.length === 0 ? 'meets' : 'does-not-meet', missing };
}

function associateDegreePath(input) {
  if (input.hasAssociateDegree) return { id: 'associate-degree', status: 'meets', missing: [] };
  return { id: 'associate-degree', status: 'does-not-meet', missing: ['an associate degree (AAS, AA, AS, AALT, or ASLT) or higher'] };
}

function adultPath(input, standards) {
  if (!input.age25OrOver) {
    return { id: 'adult', status: 'does-not-meet', missing: ['age 25 or over'] };
  }
  const missing = ['the admission requirements the institution sets for adult students'];
  if (standards.transfer.adult.requiresPlacementMathOrEnglish && !input.placementMathOrEnglish) {
    missing.push('placement for standalone mathematics or English');
  }
  // The state does not publish the adult bar; each institution
  // sets its own, so this path can never be scored from the
  // state minimums alone.
  return { id: 'adult', status: 'cannot-tell', missing };
}

function evaluateAdmission(input, standards = defaultStandards) {
  const institutionType = institutionTypeOf(input.targetCollege, standards);
  const base = { targetCollege: input.targetCollege, institutionType, paths: [], notes: [...standards.notes] };
  if (!institutionType) return { ...base, verdict: 'unknown-college' };
  if (institutionType === 'two-year') return { ...base, verdict: 'open-admission' };
  if (institutionType === 'private') return { ...base, verdict: 'not-applicable-private' };

  const paths = [
    earnedCreditsPath(input, institutionType, standards),
    bridgePath(input, standards),
    associateDegreePath(input),
    adultPath(input, standards),
  ];
  base.notes.push('A student may also qualify by meeting the first-time first-year standards; this check does not collect high school records.');
  let verdict = 'does-not-meet-state-minimum';
  if (paths.some((p) => p.status === 'meets')) verdict = 'meets-state-minimum';
  else if (paths.some((p) => p.status === 'cannot-tell')) verdict = 'cannot-tell';
  return { ...base, verdict, paths };
}

module.exports = { evaluateAdmission, institutionTypeOf };
