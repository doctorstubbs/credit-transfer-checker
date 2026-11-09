// Credit transfer rules engine, Louisiana v1.
// Built to the approved domain model in features/credit-transfer.feature.
// Every rule below traces to a source listed in README.md.
//
// Input: a student record:
// {
//   degree: 'AALT' | 'ASLT' | 'LT' | null,
//   allGradesCOrBetter: boolean,
//   courses: [ { code, grade, number, directMatch, subjectOffered } ],
//   dualEnrollmentCredits: boolean,
//   missingMajorPrerequisite: boolean,
//   target: { name, isPublic, teachesSubject },
//   programType: 'general' | 'limited_access'
// }

const TRANSFER_DEGREES = ['AALT', 'ASLT', 'LT'];

// Louisiana private universities: the state guarantee and the state
// AP rule bind public institutions only. Names match the target list
// the page offers (Stage 7).
const PRIVATE_UNIVERSITIES = [
  'Centenary College of Louisiana',
  'Dillard University',
  'Franciscan Missionaries of Our Lady University',
  'Louisiana Christian University',
  'Loyola University New Orleans',
  'Tulane University',
  'University of Holy Cross',
  'Xavier University of Louisiana',
];

function isPrivateTarget(target) {
  if (!target) return false;
  if (target.isPublic === false) return true;
  return !!target.name && PRIVATE_UNIVERSITIES.includes(target.name);
}

// AP credit (scenarios approved by Kris, Nov 8, 2026). Louisiana's
// statewide AP policy: public institutions award credit for a score
// of 3 or higher, aligned to the college's own course equivalents
// (College Board state policy summary; Board of Regents dual
// enrollment FAQ, AA 2.22). Credit is awarded only when the student
// sends the official score report at enrollment. Where a college's
// own AP table requires a higher score for the exact course match, a
// qualifying lower score earns credit as an elective in that subject
// instead, and the report shows what the higher score would have
// earned. Private universities set their own AP policy.
function apExamResult(exam, target) {
  const base = { exam: exam.exam, score: exam.score, degreeCredit: 0, creditAwarded: false };
  if (isPrivateTarget(target)) {
    return { ...base, outcome: 'verify-individually',
      note: 'Private universities set their own AP credit policy. Verify this score with the university individually.' };
  }
  if (!exam.scoreReportSent) {
    return { ...base, outcome: 'none', reason: 'score-report-not-sent',
      note: 'AP credit requires the official score report to be sent to the university. A score the university never received earns no credit.' };
  }
  if (typeof exam.score !== 'number' || exam.score < 3) {
    return { ...base, outcome: 'none', reason: 'below-minimum-score',
      note: 'Louisiana public colleges award AP credit for a score of 3 or higher. This score is below that line.' };
  }
  // The university's own AP table, when it is on record, decides the
  // exact courses and hours. UL Lafayette's 2026-2027 table has no
  // elective tier: higher scores earn more courses, and the report
  // shows what the next score band would have earned.
  const table = CATALOG_DATA && CATALOG_DATA.apTables && target.name
    ? CATALOG_DATA.apTables[target.name] : null;
  const bands = table && table[exam.exam];
  if (bands && bands.length) {
    const earned = [...bands].reverse().find((b) => exam.score >= b.minScore);
    if (!earned) {
      return { ...base, outcome: 'none', reason: 'below-table-minimum', matchedBy: 'ap-table',
        note: 'This university\'s AP table starts at a score of ' + bands[0].minScore + ' for this exam. This score is below that line.' };
    }
    const next = bands.find((b) => b.minScore > exam.score);
    const result = { ...base, outcome: 'exact-equivalent', creditAwarded: true,
      degreeCredit: earned.hours, matchedBy: 'ap-table',
      shownAs: earned.courses || null,
      countsToward: earned.courses ? null : "the university's equivalent course for this exam",
      note: earned.courses
        ? 'Awarded from this university\'s own AP table in its current catalog.'
        : 'This university\'s AP table awards the hours for this exam but does not name a course for it.' };
    if (next) {
      result.higherScoreNote = 'A score of ' + next.minScore + ' would have earned ' +
        (next.courses || 'more credit') + ' for ' + next.hours + ' hours.';
    }
    return result;
  }
  if (exam.exactMatchMinScore && exam.score < exam.exactMatchMinScore) {
    return { ...base, outcome: 'subject-elective', creditAwarded: true, degreeCredit: 3,
      countsToward: 'elective hours',
      higherScoreNote: 'A score of ' + exam.exactMatchMinScore + ' or higher would have earned the exact course match at this university.',
      note: 'This score earns credit as an elective in the subject. The exact course match at this university requires a score of ' + exam.exactMatchMinScore + '.' };
  }
  return { ...base, outcome: 'exact-equivalent', creditAwarded: true, degreeCredit: 3,
    countsToward: "the university's equivalent course for this exam",
    note: 'Awarded under the Louisiana statewide AP policy for a score of 3 or higher.' };
}

// Current catalog data (Stage 11b): pairings joined on the Louisiana
// common course number each college prints in its OWN current catalog.
// Sources: data/courses.json, built from the AY 2025-26 statewide
// common course catalog and the colleges' 2026-2027 catalogs.
// No AY 2022-2023 matrix data is used anywhere in this file.
function loadData() {
  try { return require('../data/courses.json'); } catch (e) {
    try { return COURSES_DATA; } catch (e2) { return null; }
  }
}
const CATALOG_DATA = loadData();

function resolveInCollege(college, code) {
  const norm = String(code || '').toUpperCase().replace(/\s+/g, ' ').trim();
  let hit = college.courses.find((c) => c.code === norm);
  if (!hit) {
    const m = norm.match(/^([A-Z]+) (\d{4})$/);
    if (m && m[2].endsWith('0')) {
      hit = college.courses.find((c) => c.code === m[1] + ' ' + m[2].slice(0, 3));
    }
  }
  return hit || null;
}

function lccnHours(lccn) {
  const sw = CATALOG_DATA.statewide && CATALOG_DATA.statewide[lccn];
  return (sw && sw.hours) || parseInt(lccn.slice(-1), 10);
}

function dataCourseResult(course, target, sourceInstitution) {
  if (!CATALOG_DATA || !sourceInstitution || !target.name) return null;
  const srcCol = CATALOG_DATA.colleges[sourceInstitution];
  const tgtCol = CATALOG_DATA.colleges[target.name];
  if (!srcCol || !tgtCol) return null;
  const srcCourse = resolveInCollege(srcCol, course.code);
  if (!srcCourse) return null;
  for (const l of srcCourse.lccns) {
    const partner = tgtCol.courses.find((c) => c.lccns.includes(l));
    if (partner) {
      return { code: course.code, shownAs: partner.code, degreeCredit: lccnHours(l),
        countsToward: null, warning: null,
        matchedBy: 'catalog-data', dataStatus: 'matched', lccn: l };
    }
  }
  const rubric = srcCourse.lccns[0].split(' ')[0];
  const fam = tgtCol.courses.find((c) => c.lccns.some((x) => x.split(' ')[0] === rubric));
  if (fam) {
    const lvl = srcCourse.lccns[0].match(/(\d)/)[1];
    return { code: course.code, shownAs: fam.code.split(' ')[0] + ' ' + lvl + 'XX',
      degreeCredit: lccnHours(srcCourse.lccns[0]), countsToward: 'elective hours',
      warning: 'Elective credit does not satisfy a named course requirement.',
      matchedBy: 'catalog-data', dataStatus: 'subject-elective', lccn: srcCourse.lccns[0] };
  }
  return { code: course.code, shownAs: 'not in the course data yet', degreeCredit: 0,
    countsToward: null,
    warning: 'This course is not in the course data we have for that university yet, so the tool cannot call it. The university decides it on its own.',
    matchedBy: 'catalog-data', dataStatus: 'no-match-in-data', lccn: srcCourse.lccns[0] };
}
const BELOW_C_GRADES = ['D', 'F'];

function isBelowC(course) {
  return course.grade && BELOW_C_GRADES.includes(course.grade.toUpperCase());
}

function annotateCondition(result, course) {
  // One path for every course (Kris's simplifications, Nov 8, 2026):
  // planned and finished courses get the same equivalency answer,
  // and a course entered with no grade is assumed to have been
  // passed with a grade of C or better, which is what transfer
  // credit requires in the first place. The page states that
  // assumption in plain words. A grade on record still rules where
  // it legally matters: a below C grade inside a transfer degree
  // is flagged by name (see the degree block above). Only a course
  // declared planned sight unseen carries the condition line.
  result.status = course.status === 'planned' ? 'planned' : 'completed';
  result.condition = null;
  if (result.status === 'planned' && result.degreeCredit) {
    // The equivalency answer is firm today; the counting is earned.
    result.condition = 'Counts if the student earns a grade of C or better';
  }
  return result;
}

function courseResultRaw(course, target, sourceInstitution) {
  // Delgado catalog floor: only courses numbered 100 and above count.
  if (typeof course.number === 'number' && course.number < 100) {
    return {
      code: course.code,
      shownAs: 'no degree credit',
      degreeCredit: 0,
      countsToward: null,
      warning: 'Only courses numbered 100 and above fulfill degree requirements.',
    };
  }

  // Current catalog data first: when both colleges are in the data,
  // the state common number decides, not a guess typed by the user.
  const dataResult = dataCourseResult(course, target, sourceInstitution);
  if (dataResult) return dataResult;

  // UL Lafayette direct equivalent example: ENGL 1010 becomes ENGL 101.
  // Legacy rule from before the source college model: it fires only
  // when the sending college is Delgado or was never named. A named
  // college outside the course data gets the honest not covered
  // answer below, not a borrowed match.
  if (course.code === 'ENGL 1010' && target.name === 'University of Louisiana at Lafayette'
      && (!sourceInstitution || sourceInstitution === 'Delgado Community College')) {
    return {
      code: course.code,
      shownAs: 'ENGL 101',
      degreeCredit: 3,
      countsToward: 'English composition requirement',
      warning: null,
    };
  }

  // No direct match, but the university teaches the subject: level elective.
  if (course.directMatch === false && target.teachesSubject === true) {
    return {
      code: course.code,
      shownAs: 'subject elective at matching level',
      degreeCredit: 3,
      countsToward: 'elective hours',
      warning: 'Elective credit does not satisfy a named course requirement.',
    };
  }

  // No matching subject at the university: general elective.
  if (course.subjectOffered === false) {
    return {
      code: course.code,
      shownAs: 'general elective',
      degreeCredit: 3,
      countsToward: 'elective hours',
      warning: 'General elective hours do not shorten the degree plan by themselves.',
    };
  }

  // No catalog data and no declared fact: the tool says so honestly
  // instead of asking the user a registrar's question (Kris's call,
  // Nov 8, 2026: the match dropdown came off the page). A counselor
  // who has the receiving college's answer in hand can still declare
  // it through the paths above.
  if (course.directMatch === undefined && course.subjectOffered === undefined) {
    return { code: course.code, shownAs: 'not in the course data yet', degreeCredit: 0,
      countsToward: null,
      warning: 'This course is not in the course data we have yet, so the tool cannot call it. The university decides it on its own.',
      dataStatus: 'not-in-data' };
  }

  return { code: course.code, shownAs: 'unclassified', degreeCredit: null, countsToward: null, warning: null };
}

function effectiveSources(student) {
  // One primary source from the top level fields, plus any additional
  // source colleges the student earned credits at. A transfer check is
  // always sending colleges (one or more) to one receiving college.
  const primary = {
    institution: student.primaryInstitution || null,
    degree: student.degree || null,
    degreeStatus: student.degreeStatus || 'completed',
    allGradesCOrBetter: !!student.allGradesCOrBetter,
    courses: student.courses || [],
  };
  const extras = (student.additionalSources || []).map((src) => ({
    institution: src.institution || null,
    degree: src.degree || null,
    degreeStatus: src.degreeStatus || 'completed',
    allGradesCOrBetter: !!src.allGradesCOrBetter,
    courses: src.courses || [],
  }));
  if (Array.isArray(student.sources) && student.sources.length) {
    return student.sources.map((src) => ({
      institution: src.institution || null,
      degree: src.degree || null,
      degreeStatus: src.degreeStatus || 'completed',
      allGradesCOrBetter: !!src.allGradesCOrBetter,
      courses: src.courses || [],
    }));
  }
  return [primary, ...extras];
}

function runCheck(student) {
  const target = student.target || { isPublic: true };
  const sources = effectiveSources(student);

  const report = {
    genEdComplete: false,
    noAdditionalGenEd: false,
    hoursTransferred: 0,
    juniorStanding: false,
    flaggedCoursesOutsideGuarantee: [],
    universityDecidesFlaggedCourses: false,
    programAdmissionSeparate: false,
    programRequirementsStillRequired: false,
    prerequisiteStillRequired: false,
    electiveSubstitutedForPrerequisite: false,
    courseResults: [],
    warnings: [],
    guaranteePromised: false,
    allCoursesVerifyIndividually: false,
    degreeGuaranteeOnCompletion: false,
    degreeGuaranteeCondition: null,
    apResults: [],
  };

  // AP exams are evaluated for every target; at a private university
  // each one is flagged verify individually instead of decided.
  report.apResults = (student.apExams || []).map((exam) => apExamResult(exam, target));

  // The state guarantee binds Louisiana public institutions only.
  // Private universities (for example Tulane) decide course by course.
  if (isPrivateTarget(target)) {
    report.guaranteePromised = false;
    report.allCoursesVerifyIndividually = true;
    return report;
  }

  // Louisiana Transfer Degree (AALT/ASLT) block guarantee at public
  // universities: general education met in full, all 60 hours transfer,
  // junior standing. La. R.S. 17:3163; C or better required per course.
  // The guarantee attaches to the degree granting source college.
  if (target.isPublic) {
    for (const src of sources) {
      if (!TRANSFER_DEGREES.includes(src.degree)) continue;
      if (src.degreeStatus === 'in_progress') {
        // Not a verdict yet: the guarantee is earned at completion.
        report.degreeGuaranteeOnCompletion = true;
        report.degreeGuaranteeCondition =
          'Applies when the degree is finished, if every course is passed with a grade of C or better';
        continue;
      }
      report.genEdComplete = true;
      report.juniorStanding = true;
      report.hoursTransferred = 60;
      report.guaranteePromised = true;

      const belowC = src.courses.filter(isBelowC);
      if (src.allGradesCOrBetter && belowC.length === 0) {
        report.noAdditionalGenEd = true;
      }
      if (belowC.length > 0) {
        // A grade below C puts that course outside the guarantee; the
        // receiving university decides that course on its own.
        report.flaggedCoursesOutsideGuarantee.push(
          ...belowC.map((c) => ({ ...c, sourceInstitution: src.institution }))
        );
        report.universityDecidesFlaggedCourses = true;
      }
    }
  }

  // A completed transfer degree never guarantees a seat in a limited
  // access program; program admission is a separate decision.
  if (student.programType === 'limited_access') {
    report.programAdmissionSeparate = true;
    report.programRequirementsStillRequired = true;
  }

  // Electives never substitute for a missing major prerequisite.
  if (student.missingMajorPrerequisite) {
    report.prerequisiteStillRequired = true;
    report.electiveSubstitutedForPrerequisite = false;
  }

  // Course by course outcomes, tagged with the sending college.
  for (const src of sources) {
    for (const course of src.courses) {
      const result = annotateCondition(courseResultRaw(course, target, src.institution), course);
      result.sourceInstitution = src.institution;
      report.courseResults.push(result);
      if (result.warning) {
        report.warnings.push(result.warning);
      }
    }
  }

  return report;
}

module.exports = { runCheck };
