const { Given, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const { buildGuidance } = require('../../src/guidance');

function emptyReport() {
  return { courseResults: [], apResults: [], prerequisiteStillRequired: false };
}

function course(code, dataStatus, degreeCredit) {
  return {
    code, dataStatus, degreeCredit,
    shownAs: 'x', countsToward: dataStatus === 'subject-elective' ? 'elective hours' : null,
    sourceInstitution: 'Delgado Community College', status: 'completed', condition: null, warning: null,
  };
}

function studentFor(targetName) {
  return { target: { name: targetName, isPublic: true, teachesSubject: true }, sources: [] };
}

Given('a checked course {string} with data status {string} and {int} degree credits', function (code, status, credits) {
  this.report = emptyReport();
  this.report.courseResults.push(course(code, status, credits));
  this.student = studentFor('University of Louisiana at Lafayette');
  this.guidance = buildGuidance(this.student, this.report);
});

Given('a check for target {string} with one matched course', function (target) {
  this.report = emptyReport();
  this.report.courseResults.push(course('ENGL 101', 'matched', 3));
  this.student = studentFor(target);
  this.guidance = buildGuidance(this.student, this.report);
});

Given('a check for target {string} with one elective course {string}', function (target, code) {
  this.report = emptyReport();
  this.report.courseResults.push(course(code, 'subject-elective', 3));
  this.student = studentFor(target);
  this.guidance = buildGuidance(this.student, this.report);
});

Given('a check for target {string} with one elective course {string} and one uncovered course {string}', function (target, elective, uncovered) {
  this.report = emptyReport();
  this.report.courseResults.push(course(elective, 'subject-elective', 3));
  this.report.courseResults.push(course(uncovered, 'no-match-in-data', 0));
  this.student = studentFor(target);
  this.guidance = buildGuidance(this.student, this.report);
});

Given('a check with an AP exact-equivalent result and an AP subject-elective result', function () {
  this.report = emptyReport();
  this.report.apResults.push({ exam: 'AP Biology', score: 4, outcome: 'exact-equivalent', creditAwarded: true, degreeCredit: 4 });
  this.report.apResults.push({ exam: 'AP Psychology', score: 3, outcome: 'subject-elective', creditAwarded: true, degreeCredit: 3 });
  this.student = studentFor('University of Louisiana at Lafayette');
  this.guidance = buildGuidance(this.student, this.report);
});

Given('a check for target {string} with an AP exact-equivalent result', function (target) {
  this.report = emptyReport();
  this.report.apResults.push({ exam: 'AP Biology', score: 4, outcome: 'exact-equivalent', creditAwarded: true, degreeCredit: 4 });
  this.student = studentFor(target);
  this.guidance = buildGuidance(this.student, this.report);
});

function codesIn(list) {
  return list.map((c) => c.code || c.exam);
}

Then('the course is grouped as counting toward the degree', function () {
  assert.ok(codesIn(this.guidance.degree).length >= 1, 'degree group is empty');
});

Then('the course is grouped as counting as credit only', function () {
  assert.ok(codesIn(this.guidance.creditOnly).length >= 1, 'creditOnly group is empty');
});

Then('the course is grouped as not counted', function () {
  assert.ok(codesIn(this.guidance.notCounted).length >= 1, 'notCounted group is empty');
});

Then('the AP exact-equivalent result is grouped as counting toward the degree', function () {
  assert.ok(this.guidance.apDegree.some((a) => a.exam === 'AP Biology'), 'AP Biology not in apDegree');
});

Then('the AP subject-elective result is grouped as counting as credit only', function () {
  assert.ok(this.guidance.apCreditOnly.some((a) => a.exam === 'AP Psychology'), 'AP Psychology not in apCreditOnly');
});

Then('the next steps include sending the official transcript to {string}', function (target) {
  assert.ok(
    this.guidance.nextSteps.some((s) => s.includes('official transcript') && s.includes(target)),
    'no transcript next step naming the target: ' + JSON.stringify(this.guidance.nextSteps));
});

Then('the next steps include asking the registrar about {string} as an elective, not a direct match', function (code) {
  assert.ok(
    this.guidance.nextSteps.some((s) => s.includes('registrar') && s.includes(code) && s.includes('elective')),
    'no registrar next step for the elective: ' + JSON.stringify(this.guidance.nextSteps));
});

Then('the next steps include having the official AP score report sent to {string}', function (target) {
  assert.ok(
    this.guidance.nextSteps.some((s) => s.includes('AP score report') && s.includes(target)),
    'no AP score report next step: ' + JSON.stringify(this.guidance.nextSteps));
});

Then('the advisor questions ask whether {string} counts toward the degree plan or only as elective hours', function (code) {
  assert.ok(
    this.guidance.advisorQuestions.some((q) => q.includes(code) && q.includes('degree plan') && q.includes('elective')),
    'no advisor question for the elective: ' + JSON.stringify(this.guidance.advisorQuestions));
});

Then('the advisor questions ask what {string} counts as at the target', function (code) {
  assert.ok(
    this.guidance.advisorQuestions.some((q) => q.includes(code) && q.includes('count as')),
    'no advisor question for the uncovered course: ' + JSON.stringify(this.guidance.advisorQuestions));
});

Then('there are no advisor questions', function () {
  assert.strictEqual(this.guidance.advisorQuestions.length, 0,
    'expected no advisor questions, got: ' + JSON.stringify(this.guidance.advisorQuestions));
});
