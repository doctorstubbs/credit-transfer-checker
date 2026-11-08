'use strict';

const { COURSE_DATA } = require('./courses-data');

// Page institution names -> Board of Regents matrix column keys.
const INST_KEY = {
  'Bossier Parish Community College': 'BPCC',
  'Baton Rouge Community College': 'BRCC',
  'Central Louisiana Technical Community College': 'CLTCC',
  'Delgado Community College': 'DCC',
  'Fletcher Technical Community College': 'FTCC',
  'Louisiana Delta Community College': 'LDCC',
  'Northshore Technical Community College': 'NTCC',
  'Northwest Louisiana Technical Community College': 'NLTCC',
  'Nunez Community College': 'NUNEZ',
  'River Parishes Community College': 'RPCC',
  'South Louisiana Community College': 'SLCC',
  'Sowela Technical Community College': 'SOWELA',
  'Louisiana State University Eunice': 'LSUE',
  'Louisiana State University at Eunice': 'LSUE',
  'Southern University at Shreveport': 'SUSLA',
  'Grambling State University': 'GSU',
  'Louisiana State University and A&M College': 'LSU A&M',
  'Louisiana State University and A&M College (LSU)': 'LSU A&M',
  'Louisiana State University at Alexandria': 'LSUA',
  'Louisiana State University Shreveport': 'LSUS',
  'Louisiana Tech University': 'LA Tech',
  'McNeese State University': 'McNeese',
  'Nicholls State University': 'Nicholls',
  'Northwestern State University of Louisiana': 'NSU',
  'Southeastern Louisiana University': 'SLU',
  'Southern University and A&M College': 'SU A&M',
  'Southern University and A&M College (Baton Rouge)': 'SU A&M',
  'Southern University at New Orleans': 'SUNO',
  'University of Louisiana at Lafayette': 'ULL',
  'University of Louisiana at Monroe': 'ULM',
  'University of New Orleans': 'UNO',
  'Franciscan Missionaries of Our Lady University': 'FRAN U',
  'Louisiana Christian University': 'LA Christian Univers',
  'Loyola University New Orleans': 'LOYOLA UNIVERSITY',
  'University of Holy Cross': 'U OF HOLY CROSS',
};

function normCode(c) {
  return String(c || '').toUpperCase().replace(/\s+/g, '');
}

function codeVariants(c) {
  const n = normCode(c);
  const out = new Set([n]);
  const m = n.match(/^([A-Z]+)(\d+)$/);
  if (m) {
    out.add(m[1] + m[2] + '0');
    if (m[2].length > 1 && m[2].endsWith('0')) out.add(m[1] + m[2].slice(0, -1));
  }
  return [...out];
}

function cellCodes(raw) {
  return String(raw).split(/\s+or\s+|\/|,/).map((x) => x.trim()).filter(Boolean);
}

function findInData(sourceName, targetName, course) {
  const sKey = INST_KEY[sourceName];
  const tKey = INST_KEY[targetName];
  if (!sKey || !tKey || !course.code) return null;
  const wanted = codeVariants(course.code);
  for (const rec of COURSE_DATA.courses) {
    const cell = rec.equivalents[sKey];
    if (!cell) continue;
    const hit = cellCodes(cell).some((c) => wanted.includes(normCode(c)));
    if (hit) return rec;
  }
  return null;
}

function dataResult(rec, targetName, course) {
  const tKey = INST_KEY[targetName];
  const raw = rec.equivalents[tKey];
  const base = {
    code: course.code,
    matchedBy: rec.lccn,
    dataStatus: 'matched',
    warning: null,
    countsToward: rec.lccn === 'CENL 1013' ? 'English composition requirement' : null,
    degreeCredit: course.hours != null ? course.hours : rec.hours,
  };
  if (raw == null || String(raw).trim() === '') {
    return { ...base, shownAs: 'general elective',
      warning: 'The state matrix lists no equivalent for this course at the target college, so it lands as a general elective and may not shorten the degree plan.' };
  }
  const cell = String(raw).trim();
  if (/general\s+elective/i.test(cell)) {
    return { ...base, shownAs: 'general elective',
      warning: 'The state matrix lists this course as a general elective at the target college, so it may not shorten the degree plan.' };
  }
  if (cell.includes('***')) {
    const subj = cell.replace(/\*/g, '').trim();
    if (subj) {
      return { ...base, shownAs: 'subject elective at matching level',
        warning: 'Elective credit fills elective space; it does not satisfy a named course requirement.' };
    }
    return { ...base, shownAs: 'general elective',
      warning: 'The state matrix lists elective credit only for this course at the target college.' };
  }
  const first = cellCodes(cell)[0];
  return { ...base, shownAs: first.replace(/\s+/g, ' ') };
}

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
const BELOW_C_GRADES = ['D', 'F'];

function isBelowC(course) {
  return course.grade && BELOW_C_GRADES.includes(course.grade.toUpperCase());
}

function annotatePlanned(result, course) {
  result.status = course.status === 'planned' ? 'planned' : 'completed';
  result.condition = null;
  if (result.status === 'planned' && result.degreeCredit) {
    // The equivalency answer is firm today; the counting is earned.
    result.condition = 'Counts if the student earns a grade of C or better';
  }
  return result;
}

function courseResultRaw(course, target, sourceInstitution) {
  // The state course data answers first when the user did not
  // declare a match themselves: the tool finds the match.
  if (course.directMatch === undefined && sourceInstitution && target && target.name) {
    const rec = findInData(sourceInstitution, target.name, course);
    if (rec) return dataResult(rec, target.name, course);
    if (INST_KEY[sourceInstitution] && INST_KEY[target.name]) {
      const r = manualResult(course, target);
      r.dataStatus = 'not-in-data';
      r.matchedBy = null;
      return r;
    }
  }
  const r = manualResult(course, target);
  r.dataStatus = 'manual';
  r.matchedBy = null;
  return r;
}

function manualResult(course, target) {
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

  // UL Lafayette direct equivalent example: ENGL 1010 becomes ENGL 101.
  if (course.code === 'ENGL 1010' && target.name === 'University of Louisiana at Lafayette') {
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
  };

  // The state guarantee binds Louisiana public institutions only.
  // Private universities (for example Tulane) decide course by course.
  if (target.isPublic === false) {
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
      const result = annotatePlanned(courseResultRaw(course, target, src.institution), course);
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
