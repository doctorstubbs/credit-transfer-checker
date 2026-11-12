const { Given, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const { runCheck } = require('../../src/checker');

function check(source, code, target) {
  return runCheck({
    target: { name: target, isPublic: true },
    targetCollege: target,
    sources: [{ institution: source, courses: [{ code }] }],
    programType: 'general',
  });
}

Given('a coverage check of BRCC ENGL 1013 toward UL Lafayette', function () {
  this.report = check('Baton Rouge Community College', 'ENGL 1013', 'University of Louisiana at Lafayette');
});

Given('a coverage check of Delgado FNAR 125 toward UL Lafayette', function () {
  this.report = check('Delgado Community College', 'FNAR 125', 'University of Louisiana at Lafayette');
});

Given('a coverage check of Delgado MUSC 105 toward UL Lafayette', function () {
  this.report = check('Delgado Community College', 'MUSC 105', 'University of Louisiana at Lafayette');
});

Given('a coverage check of Delgado ENGL 101 toward BRCC', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Baton Rouge Community College');
});

Given('a coverage check of BRCC PSYC 2013 toward the University of New Orleans', function () {
  this.report = check('Baton Rouge Community College', 'PSYC 2013', 'University of New Orleans');
});

Given('a coverage check of Southeastern ENGL 1010 toward Delgado', function () {
  this.report = check('Southeastern Louisiana University', 'ENGL 1010', 'Delgado Community College');
});

Given('a coverage check of Southeastern MATH 1610 toward the University of New Orleans', function () {
  this.report = check('Southeastern Louisiana University', 'MATH 1610', 'University of New Orleans');
});

Given('a coverage check of BRCC PSYC 2013 toward LSU', function () {
  this.report = check('Baton Rouge Community College', 'PSYC 2013', 'Louisiana State University and A&M College');
});

Given('a coverage check of Southeastern ENGL 1010 toward LSU', function () {
  this.report = check('Southeastern Louisiana University', 'ENGL 1010', 'Louisiana State University and A&M College');
});

Given('a coverage check of Northwestern ENGL 1010 toward LSU', function () {
  this.report = check('Northwestern State University of Louisiana', 'ENGL 1010', 'Louisiana State University and A&M College');
});

Given('a coverage check of Northwestern PSYC 1010 toward BRCC', function () {
  this.report = check('Northwestern State University of Louisiana', 'PSYC 1010', 'Baton Rouge Community College');
});

Given('a coverage check of Louisiana Tech ENGL 1013 toward LSU', function () {
  this.report = check('Louisiana Tech University', 'ENGL 1013', 'Louisiana State University and A&M College');
});

Given('a coverage check of Louisiana Tech PSYC 1023 toward Southeastern', function () {
  this.report = check('Louisiana Tech University', 'PSYC 1023', 'Southeastern Louisiana University');
});

Then('the result for {string} is matched with {int} degree hours', function (code, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.dataStatus, 'matched');
  assert.strictEqual(r.degreeCredit, hours);
});

Then('the result for {string} shows as {string} at BRCC with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});
