const { Given, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const { evaluateAdmission } = require('../../src/admission');

function freshInput(target) {
  return {
    targetCollege: target,
    earnedHours: null,
    gpa: null,
    englishCompleted: false,
    mathCompleted: false,
    hasAssociateDegree: false,
    inBridgeProgram: false,
    age25OrOver: false,
    placementMathOrEnglish: false,
  };
}

Given('an admission check for target {string}', function (target) {
  this.admissionInput = freshInput(target);
  this.admission = evaluateAdmission(this.admissionInput);
});

Given('an admission check for target {string} with {int} earned hours and a {float} GPA', function (target, hours, gpa) {
  this.admissionInput = freshInput(target);
  this.admissionInput.earnedHours = hours;
  this.admissionInput.gpa = gpa;
  this.admission = null;
});

Given('an admission check for target {string} with {int} earned hours and no GPA', function (target, hours) {
  this.admissionInput = freshInput(target);
  this.admissionInput.earnedHours = hours;
  this.admissionInput.gpa = null;
  this.admission = null;
});

Given('English and math are completed with a C or better', function () {
  this.admissionInput.englishCompleted = true;
  this.admissionInput.mathCompleted = true;
});

Given('math is completed with a C or better', function () {
  this.admissionInput.mathCompleted = true;
});

Given('the student holds an associate degree', function () {
  this.admissionInput.hasAssociateDegree = true;
});

Given('the student is in a partnership bridge program', function () {
  this.admissionInput.inBridgeProgram = true;
});

Given('the student is 25 or older and meets placement for standalone math or English', function () {
  this.admissionInput.age25OrOver = true;
  this.admissionInput.placementMathOrEnglish = true;
});

function result(world) {
  if (!world.admission) world.admission = evaluateAdmission(world.admissionInput);
  return world.admission;
}

Then('the institution type is {string}', function (type) {
  assert.strictEqual(result(this).institutionType, type);
});

Then('the admission verdict is {string}', function (verdict) {
  assert.strictEqual(result(this).verdict, verdict);
});

Then('the {string} path status is {string}', function (pathId, status) {
  const path = result(this).paths.find((p) => p.id === pathId);
  assert.ok(path, `no path named ${pathId}`);
  assert.strictEqual(path.status, status);
});

Then('the missing requirements include {string}', function (text) {
  const missing = result(this).paths.flatMap((p) => p.missing || []);
  assert.ok(
    missing.some((m) => m.includes(text)),
    `expected missing requirements to include "${text}", got: ${JSON.stringify(missing)}`,
  );
});
