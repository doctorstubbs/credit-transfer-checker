// Guidance layer: turns an engine report into an actionable
// result (Kris's direction, Nov 10, 2026).
//
// Three things come out:
// 1. Groups: which courses count toward the degree, which count
//    as credit only, and which are not counted in this check.
//    That degree vs credit-only distinction is the one families
//    miss, so the result shows it as separate groups, never one
//    mixed list.
// 2. Next steps: concrete actions that end the result, naming the
//    target college and the flagged courses.
// 3. Advisor questions: built only from the flagged courses (the
//    electives and the uncovered ones), so a clean check produces
//    none.
//
// Pure functions over the student record and the engine report;
// the page inlines the same code.

function targetNameOf(student) {
  if (!student) return 'the target college';
  if (student.target && student.target.name) return student.target.name;
  if (student.targetCollege) return student.targetCollege;
  return 'the target college';
}

function classifyCourse(c) {
  if (!c) return 'not-counted';
  if (c.dataStatus === 'subject-elective') return 'credit-only';
  if (c.dataStatus === 'no-match-in-data' || c.dataStatus === 'not-in-data') return 'not-counted';
  if (c.degreeCredit && c.countsToward === 'elective hours') return 'credit-only';
  if (c.degreeCredit && c.degreeCredit > 0) return 'degree';
  return 'not-counted';
}

function classifyAp(a) {
  if (!a) return 'not-counted';
  if (a.outcome === 'exact-equivalent') return 'degree';
  if (a.outcome === 'subject-elective') return 'credit-only';
  return 'not-counted';
}

function buildGuidance(student, report) {
  const target = targetNameOf(student);
  const courses = (report && report.courseResults) || [];
  const aps = (report && report.apResults) || [];

  const degree = [];
  const creditOnly = [];
  const notCounted = [];
  for (const c of courses) {
    const kind = classifyCourse(c);
    if (kind === 'degree') degree.push(c);
    else if (kind === 'credit-only') creditOnly.push(c);
    else notCounted.push(c);
  }
  const apDegree = aps.filter((a) => classifyAp(a) === 'degree');
  const apCreditOnly = aps.filter((a) => classifyAp(a) === 'credit-only');
  const apNotCounted = aps.filter((a) => classifyAp(a) === 'not-counted');

  const nextSteps = [];
  if (courses.length) {
    nextSteps.push('Send your official transcript to ' + target + ' so the credits that count can be posted to your record there.');
  }
  if (apDegree.length || apCreditOnly.length) {
    nextSteps.push('Have your official AP score report sent to ' + target + '; AP credit is only awarded once the university receives it.');
  }
  for (const c of creditOnly) {
    nextSteps.push('Ask the registrar at ' + target + ' about ' + c.code + ', since it counts as an elective there, not a direct match, and confirm it fits your degree plan before you count on it.');
  }
  // Choice credit (Stage 24): a course still in progress can still
  // be protected. Under Louisiana's choice credit option, the grade
  // for a dual enrollment course goes on the high school transcript,
  // and the student chooses whether it also goes on the college
  // transcript. The window closes when the course ends, so the step
  // only appears while a course is planned or in progress.
  if (courses.some((c) => c && c.status === 'planned')) {
    nextSteps.push('If any of these courses is a dual enrollment course you are taking now, ask your school counselor about choice credit before the course ends: you can choose whether the grade goes on your college transcript.');
  }

  const advisorQuestions = [];
  for (const c of creditOnly) {
    advisorQuestions.push('Will ' + c.code + ' count toward my degree plan at ' + target + ', or only as elective hours?');
  }
  for (const c of notCounted) {
    advisorQuestions.push('What will ' + c.code + ' count as at ' + target + '? It was not in the course data this check is built on.');
  }
  for (const a of apNotCounted) {
    if (a.outcome === 'verify-individually') {
      advisorQuestions.push('What credit does ' + target + ' award for ' + a.exam + '?');
    }
  }
  if (report && report.prerequisiteStillRequired) {
    advisorQuestions.push('A required major prerequisite is still missing. Which course fills it, and where can it be taken so the credit transfers?');
  }
  // Grade protection (Stage 24): the transfer degree guarantee
  // requires a C or better in each course. The question is only
  // raised while it can still change behavior: a course is planned
  // or in progress, or a below C grade is already on record. A
  // clean finished check stays free of extra questions.
  const anyPlanned = courses.some((c) => c && c.status === 'planned');
  const anyBelowC = courses.some(
    (c) => c && c.grade && ['D', 'F'].includes(String(c.grade).toUpperCase())
  );
  if (anyPlanned || anyBelowC) {
    advisorQuestions.push('Does a grade below a C in any of these courses change what counts? The transfer degree guarantee requires a C or better in each course.');
  }

  const sumHours = (list) => list.reduce((a, c) => a + (c.degreeCredit || 0), 0);
  const totals = {
    degreeHours: sumHours(degree),
    creditOnlyHours: sumHours(creditOnly),
    notCountedCourses: notCounted.length,
    apDegreeHours: sumHours(apDegree),
    apCreditHours: sumHours(apCreditOnly),
  };

  return { degree, creditOnly, notCounted, apDegree, apCreditOnly, apNotCounted, nextSteps, advisorQuestions, totals };
}

// Coverage requests (Kris, Nov 10, 2026): the production design
// lists every college up front. A college with no verified data
// is not a dead end; it is named here so the page can offer the
// email request that queues it for harvesting. Covered colleges
// are the ones with verified course data.
function uncoveredColleges(student, coveredNames) {
  const covered = new Set(coveredNames || []);
  const out = [];
  const add = (name) => { if (name && !covered.has(name) && !out.includes(name)) out.push(name); };
  if (student) {
    (student.sources || []).forEach((s) => add(s.institution));
    add(targetNameOf(student) === 'the target college' ? null : targetNameOf(student));
  }
  return out;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildGuidance, classifyCourse, classifyAp, targetNameOf, uncoveredColleges };
}
if (typeof window !== 'undefined') {
  window.buildGuidance = buildGuidance;
  window.classifyCourse = classifyCourse;
}
