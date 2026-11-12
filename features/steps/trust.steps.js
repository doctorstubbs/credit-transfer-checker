const { Given, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { runCheck } = require('../../src/checker');
const { buildGuidance } = require('../../src/guidance');
const { flagsFor } = require('../../src/quality');

const QUALITY = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/quality.json'), 'utf8')
);

Given('the quality flags data', function () {
  this.quality = QUALITY;
});

Given('a quality dataset recording a NACEP flag for {string}', function (college) {
  this.quality = {
    flags: {
      [college]: [{ label: 'NACEP accredited concurrent enrollment program', source: 'NACEP directory' }],
    },
  };
});

Then('{string} has no quality flags', function (college) {
  assert.deepStrictEqual(flagsFor(college, this.quality), []);
});

Then('{string} has the quality flag {string}', function (college, label) {
  const flags = flagsFor(college, this.quality);
  assert.strictEqual(flags.length, 1);
  assert.strictEqual(flags[0].label, label);
});

const CHOICE_CREDIT_STEP = 'If any of these courses is a dual enrollment course you are taking now, ask your school counselor about choice credit before the course ends: you can choose whether the grade goes on your college transcript.';
const GRADE_QUESTION = 'Does a grade below a C in any of these courses change what counts? The transfer degree guarantee requires a C or better in each course.';

Given('a trust check of Delgado ENGL 101 toward UL Lafayette', function () {
  this.report = runCheck({
    target: { name: 'University of Louisiana at Lafayette', isPublic: true },
    targetCollege: 'University of Louisiana at Lafayette',
    sources: [{ institution: 'Delgado Community College', courses: [{ code: 'ENGL 101' }] }],
    programType: 'general',
  });
});

Given('a trust check of Delgado HIST 103 toward the University of New Orleans', function () {
  this.report = runCheck({
    target: { name: 'University of New Orleans', isPublic: true },
    targetCollege: 'University of New Orleans',
    sources: [{ institution: 'Delgado Community College', courses: [{ code: 'HIST 103' }] }],
    programType: 'general',
  });
});

Then('the result for {string} names the {string} at both colleges', function (code, catalog) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.sourceCatalog, catalog);
  assert.strictEqual(r.targetCatalog, catalog);
});

Then('the result for {string} names {string} at the source and {string} at the target', function (code, sourceCatalog, targetCatalog) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.sourceCatalog, sourceCatalog);
  assert.strictEqual(r.targetCatalog, targetCatalog);
});

Then('the result for {string} carries the common course number {string}', function (code, lccn) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.lccn, lccn);
});

function trustCourse(code, dataStatus, degreeCredit, status) {
  return {
    code, dataStatus, degreeCredit, status,
    shownAs: 'x', countsToward: null,
    sourceInstitution: 'Delgado Community College', condition: null, warning: null,
  };
}

function trustGuidance(courses) {
  const report = { courseResults: courses, apResults: [], prerequisiteStillRequired: false };
  const student = { target: { name: 'University of New Orleans', isPublic: true, teachesSubject: true }, sources: [] };
  return buildGuidance(student, report);
}

Given('a trust guidance check with one planned matched course', function () {
  this.guidance = trustGuidance([trustCourse('ENGL 101', 'matched', 3, 'planned')]);
});

Given('a trust guidance check with one completed matched course', function () {
  this.guidance = trustGuidance([trustCourse('ENGL 101', 'matched', 3, 'completed')]);
});

Given('a trust guidance check with one uncovered course', function () {
  this.guidance = trustGuidance([trustCourse('PHYS 229', 'no-match-in-data', 0, 'completed')]);
});

Then('the next steps include the choice credit step', function () {
  assert.ok(this.guidance.nextSteps.includes(CHOICE_CREDIT_STEP), 'expected the choice credit step');
});

Then('the next steps do not include the choice credit step', function () {
  assert.ok(!this.guidance.nextSteps.includes(CHOICE_CREDIT_STEP), 'did not expect the choice credit step');
});

Then('the advisor questions include the grade protection question', function () {
  assert.ok(this.guidance.advisorQuestions.includes(GRADE_QUESTION), 'expected the grade protection question');
});

Then('the advisor questions do not include the grade protection question', function () {
  assert.ok(!this.guidance.advisorQuestions.includes(GRADE_QUESTION), 'did not expect the grade protection question');
});
