// The API contract for the credit transfer checker.
//
// Input: a student record built by the scenario steps:
// {
//   degree: 'AALT' | 'ASLT' | 'LT' | null,
//   allGradesCOrBetter: boolean,
//   courses: [ { code, grade, number, directMatch, subjectOffered } ],
//   dualEnrollmentCredits: boolean,
//   missingMajorPrerequisite: boolean,
//   target: { name, isPublic, teachesSubject },
//   programType: 'general' | 'limited_access'
// }
//
// Output: a report object:
// {
//   genEdComplete, noAdditionalGenEd, hoursTransferred, juniorStanding,
//   flaggedCoursesOutsideGuarantee, universityDecidesFlaggedCourses,
//   programAdmissionSeparate, programRequirementsStillRequired,
//   prerequisiteStillRequired, electiveSubstitutedForPrerequisite,
//   courseResults: [ { shownAs, countsToward, degreeCredit } ],
//   warnings: [ string ],
//   guaranteePromised, allCoursesVerifyIndividually
// }
//
// RED STATE (Nov 7, 2026): intentionally not implemented. The scenarios
// must fail here first. Nothing gets built until the red run is recorded.

function runCheck(student) {
  throw new Error('Not implemented: credit transfer rules engine');
}

module.exports = { runCheck };
