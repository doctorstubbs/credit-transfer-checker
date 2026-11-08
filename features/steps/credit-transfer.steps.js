const { Given, When, Then, Before } = require('@cucumber/cucumber');
const assert = require('node:assert');
const { runCheck } = require('../../src/checker');

Before(function () {
  this.student = {
    degree: null,
    allGradesCOrBetter: false,
    courses: [],
    dualEnrollmentCredits: false,
    missingMajorPrerequisite: false,
    target: { name: null, isPublic: true, teachesSubject: null },
    programType: 'general',
  };
  this.report = null;
  this.student.primaryInstitution = null;
  this.student.additionalSources = [];
  this.currentSource = null;
});

function doCheck(world) {
  world.report = runCheck(world.student);
}

// ---------- Given ----------

Given('a student completes an Associate of Arts Louisiana Transfer degree at Delgado Community College', function () {
  this.student.degree = 'AALT';
  this.student.primaryInstitution = 'Delgado Community College';
});

Given('a student earned dual enrollment credits at Delgado Community College', function () {
  this.student.dualEnrollmentCredits = true;
  this.student.primaryInstitution = 'Delgado Community College';
});

Given('at Delgado Community College, the student passed ENGL 1010', function () {
  this.student.courses.push({ code: 'ENGL 1010', grade: 'C or better' });
});

Given('the student also earned credits at Baton Rouge Community College', function () {
  const src = { institution: 'Baton Rouge Community College', degree: null, allGradesCOrBetter: false, courses: [] };
  this.student.additionalSources.push(src);
  this.currentSource = src;
});

Given('at Baton Rouge Community College, the student passed a course in a subject the receiving university does not offer', function () {
  this.currentSource.courses.push({ code: 'UNSPECIFIED', subjectOffered: false });
});

Given('at Baton Rouge Community College, the student passed a course that the receiving university offers no direct match for', function () {
  this.currentSource.courses.push({ code: 'UNSPECIFIED', directMatch: false });
});

Given('a student completes an Associate of Arts Louisiana Transfer degree', function () {
  this.student.degree = 'AALT';
});

Given('a student is planning to take ENGL 1010 at a Louisiana community college, and has not taken it yet', function () {
  this.student.courses.push({ code: 'ENGL 1010', status: 'planned', grade: null });
});

Given('a student is planning to take a course that the receiving university offers no direct match for', function () {
  this.student.courses.push({ code: 'UNSPECIFIED', status: 'planned', directMatch: false });
});

Given('a student is working on an Associate of Arts Louisiana Transfer degree and has not finished it yet', function () {
  this.student.degree = 'AALT';
  this.student.degreeStatus = 'in_progress';
});

Given('a student completes an Associate of Science Louisiana Transfer degree', function () {
  this.student.degree = 'ASLT';
});

Given('a student completes a Louisiana Transfer degree', function () {
  this.student.degree = 'LT';
});

Given('a student completes a Louisiana Transfer degree with junior standing', function () {
  this.student.degree = 'LT';
});

Given('every course in the degree was passed with a grade of C or better', function () {
  this.student.allGradesCOrBetter = true;
});

Given('one course in the degree was passed with a grade of D', function () {
  this.student.courses.push({ code: 'UNSPECIFIED', grade: 'D' });
});

Given("the student's target major requires a specific prerequisite course the student never took", function () {
  this.student.missingMajorPrerequisite = true;
});

Given('a student passed ENGL 1010 at a Louisiana community college', function () {
  this.student.courses.push({ code: 'ENGL 1010', grade: 'C or better' });
});

Given('a student passed a course that the receiving university offers no direct match for', function () {
  this.student.courses.push({ code: 'UNSPECIFIED', directMatch: false });
});

Given('the receiving university does teach that subject area', function () {
  this.student.target.teachesSubject = true;
});

Given('a student passed a course in a subject the receiving university does not offer', function () {
  this.student.courses.push({ code: 'UNSPECIFIED', subjectOffered: false });
});

Given('a student completed dual enrollment credits in Louisiana', function () {
  this.student.dualEnrollmentCredits = true;
});

Given('a student passed a course numbered below 100 at Delgado Community College', function () {
  this.student.courses.push({ code: 'BELOW 100', number: 95, grade: 'C or better' });
});

// ---------- When ----------

When('the student enrolls at a Louisiana public university', function () {
  this.student.target.isPublic = true;
  doCheck(this);
});

When('the credit check runs against a Louisiana public university', function () {
  this.student.target.isPublic = true;
  doCheck(this);
});

When('the student applies to a limited access program at a public university', function () {
  this.student.target.isPublic = true;
  this.student.programType = 'limited_access';
  doCheck(this);
});

When('the credit check runs for that major', function () {
  doCheck(this);
});

When('the credit check runs against the University of Louisiana at Lafayette', function () {
  this.student.target.name = 'University of Louisiana at Lafayette';
  doCheck(this);
});

When('the credit check runs', function () {
  doCheck(this);
});

When('the student enrolls at McNeese State University', function () {
  this.student.target.name = 'McNeese State University';
  this.student.target.isPublic = true;
  doCheck(this);
});

When('the credit check runs against a private university such as Loyola University New Orleans', function () {
  this.student.target.name = 'Loyola University New Orleans';
  this.student.target.isPublic = false;
  doCheck(this);
});

When('the credit check runs against a private university such as Tulane', function () {
  this.student.target.name = 'Tulane University';
  this.student.target.isPublic = false;
  doCheck(this);
});

// ---------- Then ----------

Then('the report says the general education requirements are met in full', function () {
  assert.strictEqual(this.report.genEdComplete, true);
});

Then('the report says no additional general education courses are required', function () {
  assert.strictEqual(this.report.noAdditionalGenEd, true);
});

Then('the report shows all 60 credit hours transferring', function () {
  assert.strictEqual(this.report.hoursTransferred, 60);
});

Then('the report shows the student entering with junior standing', function () {
  assert.strictEqual(this.report.juniorStanding, true);
});

Then('the report flags that course as outside the transfer guarantee', function () {
  assert.ok(this.report.flaggedCoursesOutsideGuarantee.length >= 1);
});

Then('the report tells the family the receiving university decides that course on its own', function () {
  assert.strictEqual(this.report.universityDecidesFlaggedCourses, true);
});

Then('the report says general education is complete', function () {
  assert.strictEqual(this.report.genEdComplete, true);
});

Then('the report warns that admission to that program is a separate decision', function () {
  assert.strictEqual(this.report.programAdmissionSeparate, true);
});

Then("the report lists the program's own admission requirements as still to be met", function () {
  assert.strictEqual(this.report.programRequirementsStillRequired, true);
});

Then('the report marks that prerequisite as still required', function () {
  assert.strictEqual(this.report.prerequisiteStillRequired, true);
});

Then('the report does not count any elective credit as a substitute for it', function () {
  assert.strictEqual(this.report.electiveSubstitutedForPrerequisite, false);
});

Then('the report shows the credit as ENGL 101, English Composition', function () {
  assert.strictEqual(this.report.courseResults[0].shownAs, 'ENGL 101');
});

Then('the report counts it toward the English composition requirement', function () {
  assert.strictEqual(this.report.courseResults[0].countsToward, 'English composition requirement');
});

Then('the report shows the credit as an elective in that subject at the matching level', function () {
  assert.strictEqual(this.report.courseResults[0].shownAs, 'subject elective at matching level');
});

Then('the report warns that elective credit does not satisfy a named course requirement', function () {
  assert.ok(this.report.warnings.some((w) => w.includes('does not satisfy a named course requirement')));
});

Then('the report shows the credit as a general elective', function () {
  assert.strictEqual(this.report.courseResults[0].shownAs, 'general elective');
});

Then('the report warns that general elective hours do not shorten the degree plan by themselves', function () {
  assert.ok(this.report.warnings.some((w) => w.includes('do not shorten the degree plan')));
});

Then('the report does not promise transfer under the Louisiana public guarantee', function () {
  assert.strictEqual(this.report.guaranteePromised, false);
});

Then('the report marks every course as verify with the university individually', function () {
  assert.strictEqual(this.report.allCoursesVerifyIndividually, true);
});

Then('the report shows zero degree credit for that course', function () {
  assert.strictEqual(this.report.courseResults[0].degreeCredit, 0);
});

Then('the report explains that only courses numbered 100 and above fulfill degree requirements', function () {
  assert.ok(this.report.warnings.some((w) => w.includes('100 and above')));
});

Then('the report lists the ENGL 1010 result under Delgado Community College', function () {
  const r = this.report.courseResults.find((c) => c.code === 'ENGL 1010');
  assert.ok(r, 'ENGL 1010 result missing');
  assert.strictEqual(r.sourceInstitution, 'Delgado Community College');
  assert.strictEqual(r.shownAs, 'ENGL 101');
});

Then('the report lists the general elective result under Baton Rouge Community College', function () {
  const r = this.report.courseResults.find((c) => c.sourceInstitution === 'Baton Rouge Community College');
  assert.ok(r, 'Baton Rouge Community College result missing');
  assert.strictEqual(r.shownAs, 'general elective');
});

Then('the report shows the Baton Rouge Community College course as an elective in that subject at the matching level', function () {
  const r = this.report.courseResults.find((c) => c.sourceInstitution === 'Baton Rouge Community College');
  assert.ok(r, 'Baton Rouge Community College result missing');
  assert.strictEqual(r.shownAs, 'subject elective at matching level');
});

Then('the report marks the course as planned', function () {
  assert.strictEqual(this.report.courseResults[0].status, 'planned');
});

Then('the report shows the planned credit as ENGL 101, English Composition', function () {
  assert.strictEqual(this.report.courseResults[0].shownAs, 'ENGL 101');
});

Then('the report says it counts toward the English composition requirement if the student earns a grade of C or better', function () {
  assert.strictEqual(this.report.courseResults[0].countsToward, 'English composition requirement');
  assert.ok(this.report.courseResults[0].condition && this.report.courseResults[0].condition.includes('C or better'));
});

Then('the report does not say general education is complete yet', function () {
  assert.strictEqual(this.report.genEdComplete, false);
});

Then('the report says the transfer guarantee applies when the degree is finished, if every course is passed with a grade of C or better', function () {
  assert.strictEqual(this.report.degreeGuaranteeOnCompletion, true);
  assert.ok(this.report.degreeGuaranteeCondition && this.report.degreeGuaranteeCondition.includes('C or better'));
});

Given('the student completed {string} at {string} with a grade of {string}', function (code, institution, grade) {
  this.student.sources = [{ institution, degree: null, allGradesCOrBetter: false,
    courses: [{ code, grade, status: 'completed' }] }];
});

Given('the student plans to take {string} at {string}', function (code, institution) {
  this.student.sources = [{ institution, degree: null, allGradesCOrBetter: false,
    courses: [{ code, status: 'planned' }] }];
});

Then('the match comes from the current catalog data', function () {
  const r = this.report.courseResults[0];
  assert.strictEqual(r.matchedBy, 'catalog-data');
});

Then('the course is flagged as not covered by the current course data yet', function () {
  const r = this.report.courseResults[0];
  assert.strictEqual(r.dataStatus, 'no-match-in-data');
});

Given('a student plans to attend {string}', function (institution) {
  this.student.targetInstitution = institution;
  this.student.target = { name: institution, isPublic: true };
});

Then('the course counts as {string}', function (expected) {
  const r = this.report.courseResults[0];
  assert.strictEqual(r.shownAs, expected);
});

Then('the course counts as a level elective at the {int} level', function (level) {
  const r = this.report.courseResults[0];
  assert.ok(/^[A-Z]+ \dXX$/.test(r.shownAs || ''),
    'shownAs should be a level elective code, got: ' + r.shownAs);
  assert.strictEqual(r.shownAs.split(' ')[1][0], String(level)[0]);
});

Then('the student is warned the credit fills no named course requirement', function () {
  const r = this.report.courseResults[0];
  assert.ok(r.warning && r.warning.includes('named course requirement'),
    'expected a named-requirement warning, got: ' + r.warning);
});

Then('the course counts only if the student earns a grade of C or better', function () {
  const r = this.report.courseResults[0];
  assert.ok(r.condition && r.condition.includes('C or better'),
    'expected a C-or-better condition, got: ' + r.condition);
});
