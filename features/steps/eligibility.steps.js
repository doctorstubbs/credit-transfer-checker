const { Given, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { evaluateEligibility } = require('../../src/eligibility');

const ELIGIBILITY = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/eligibility.json'), 'utf8')
);

Given('an eligibility check at {string} for a junior with GPA {float} and ACT composite {int} English {int} Math {int}', function (college, gpa, composite, english, math) {
  this.result = evaluateEligibility(college, {
    gradeLevel: 'junior', gpa, actComposite: composite, actEnglish: english, actMath: math, track: 'academic',
  }, ELIGIBILITY);
});

Given('an eligibility check at {string} for a junior with GPA {float} and ACT composite {int} English {int} Math {int} and a counselor recommendation', function (college, gpa, composite, english, math) {
  this.result = evaluateEligibility(college, {
    gradeLevel: 'junior', gpa, actComposite: composite, actEnglish: english, actMath: math,
    counselorRecommendation: true, track: 'academic',
  }, ELIGIBILITY);
});

Given('an eligibility check at {string} for a senior with GPA {float} and no scores and no recommendation', function (college, gpa) {
  this.result = evaluateEligibility(college, { gradeLevel: 'senior', gpa, track: 'academic' }, ELIGIBILITY);
});

Given('a technical eligibility check at {string} for a junior with GPA {float}', function (college, gpa) {
  this.result = evaluateEligibility(college, { gradeLevel: 'junior', gpa, track: 'technical' }, ELIGIBILITY);
});

Given('an eligibility check at {string} for a senior with GPA {float} in subject {string} with ACT Math {int}', function (college, gpa, subject, math) {
  this.result = evaluateEligibility(college, {
    gradeLevel: 'senior', gpa, subject, actMath: math, track: 'academic',
  }, ELIGIBILITY);
});

Given('an eligibility check at {string} for a junior with GPA {float} in subject {string} with ACT Math {int}', function (college, gpa, subject, math) {
  this.result = evaluateEligibility(college, {
    gradeLevel: 'junior', gpa, subject, actMath: math, track: 'academic',
  }, ELIGIBILITY);
});

Given('an eligibility check at {string} for a senior with GPA {float} in subject {string} with ACT English {int}', function (college, gpa, subject, english) {
  this.result = evaluateEligibility(college, {
    gradeLevel: 'senior', gpa, subject, actEnglish: english, track: 'academic',
  }, ELIGIBILITY);
});

Given('an eligibility check at {string} for a junior with GPA {float} and a counselor recommendation', function (college, gpa) {
  this.result = evaluateEligibility(college, {
    gradeLevel: 'junior', gpa, counselorRecommendation: true, track: 'academic',
  }, ELIGIBILITY);
});

Given('an eligibility check at {string} for a junior with GPA {float}', function (college, gpa) {
  this.result = evaluateEligibility(college, { gradeLevel: 'junior', gpa, track: 'academic' }, ELIGIBILITY);
});

Then('the eligibility status is {string}', function (status) {
  assert.strictEqual(this.result.status, status,
    'got ' + JSON.stringify(this.result));
});

Then('the missing list names the 2.5 GPA', function () {
  assert.ok(this.result.missing.some((m) => m.includes('2.5')), 'missing: ' + JSON.stringify(this.result.missing));
});

Then('the missing list names the 2.75 GPA', function () {
  assert.ok(this.result.missing.some((m) => m.includes('2.75')), 'missing: ' + JSON.stringify(this.result.missing));
});

Then('the missing list names the English minimum', function () {
  assert.ok(this.result.missing.some((m) => m.includes('English')), 'missing: ' + JSON.stringify(this.result.missing));
});

Then('the basis names Policy 2.22', function () {
  assert.ok(this.result.basis && this.result.basis.includes('2.22'), 'basis: ' + this.result.basis);
});
