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

function courseResult(course, target) {
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

function runCheck(student) {
  const target = student.target || { isPublic: true };
  const courses = student.courses || [];
  const isTransferDegree = TRANSFER_DEGREES.includes(student.degree);

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
  if (isTransferDegree && target.isPublic) {
    report.genEdComplete = true;
    report.juniorStanding = true;
    report.hoursTransferred = 60;
    report.guaranteePromised = true;

    const belowC = courses.filter(isBelowC);
    if (student.allGradesCOrBetter && belowC.length === 0) {
      report.noAdditionalGenEd = true;
    }
    if (belowC.length > 0) {
      // A grade below C puts that course outside the guarantee; the
      // receiving university decides that course on its own.
      report.flaggedCoursesOutsideGuarantee = belowC;
      report.universityDecidesFlaggedCourses = true;
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

  // Course by course outcomes.
  for (const course of courses) {
    const result = courseResult(course, target);
    report.courseResults.push(result);
    if (result.warning) {
      report.warnings.push(result.warning);
    }
  }

  return report;
}

module.exports = { runCheck };
