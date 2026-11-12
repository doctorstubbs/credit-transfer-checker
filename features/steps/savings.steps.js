const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { estimateSavings, withSavings } = require('../../src/savings');
const { buildGuidance } = require('../../src/guidance');
const { buildPlan } = require('../../src/planner');

const RATES = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/tuition.json'), 'utf8')
);
const COURSES = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/courses.json'), 'utf8')
);
const FRAMEWORK = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/transfer-degree.json'), 'utf8')
);

Given('the published tuition rates', function () {
  this.rates = RATES;
});

When('I estimate savings for {string} with {int} degree hours', function (college, hours) {
  this.estimate = estimateSavings(college, hours, this.rates);
});

Then('the savings estimate is {int} dollars for {int} hours at {float} dollars per credit hour', function (amount, hours, perCredit) {
  assert.ok(this.estimate, 'expected a savings estimate');
  assert.strictEqual(this.estimate.amount, amount);
  assert.strictEqual(this.estimate.hours, hours);
  assert.strictEqual(this.estimate.perCreditHour, perCredit);
});

Then('the estimate names its source {string}', function (sourceName) {
  assert.ok(this.estimate, 'expected a savings estimate');
  assert.strictEqual(this.estimate.sourceName, sourceName);
});

Then('there is no savings estimate', function () {
  assert.strictEqual(this.estimate, null);
});

function savingsCourse(code, dataStatus, degreeCredit) {
  return {
    code, dataStatus, degreeCredit,
    shownAs: 'x', countsToward: dataStatus === 'subject-elective' ? 'elective hours' : null,
    sourceInstitution: 'Delgado Community College', status: 'completed', condition: null, warning: null,
  };
}

Given('a savings check for target {string} with one matched course and one elective course', function (target) {
  const report = { courseResults: [], apResults: [], prerequisiteStillRequired: false };
  report.courseResults.push(savingsCourse('ENGL 101', 'matched', 3));
  report.courseResults.push(savingsCourse('HIST 103', 'subject-elective', 3));
  const student = { target: { name: target, isPublic: true, teachesSubject: true }, sources: [] };
  this.guidance = withSavings(buildGuidance(student, report), target, RATES);
});

Then('the guidance carries a savings estimate of {int} dollars for {int} hours', function (amount, hours) {
  assert.ok(this.guidance.savings, 'expected guidance to carry a savings estimate');
  assert.strictEqual(this.guidance.savings.amount, amount);
  assert.strictEqual(this.guidance.savings.hours, hours);
});

Then('the guidance carries no savings estimate', function () {
  assert.strictEqual(this.guidance.savings, null);
});

When('I build a transfer degree plan from {string} to {string} with tuition rates', function (source, target) {
  this.plan = buildPlan(
    { sourceCollege: source, targetCollege: target },
    { courses: COURSES, framework: FRAMEWORK, tuition: RATES }
  );
});

Then('the plan carries a savings estimate of {int} dollars for {int} hours', function (amount, hours) {
  assert.ok(this.plan.savings, 'expected the plan to carry a savings estimate');
  assert.strictEqual(this.plan.savings.amount, amount);
  assert.strictEqual(this.plan.savings.hours, hours);
});
