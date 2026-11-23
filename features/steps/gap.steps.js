'use strict';

const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { Given, Then } = require('@cucumber/cucumber');

const { buildGapPlan } = require('../../src/gap');

const COURSES = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/courses.json'), 'utf8'));
const PATHWAYS = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/pathways.json'), 'utf8'));
const STATEWIDE = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/statewide-courses.json'), 'utf8'));
const FRAMEWORK = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/transfer-degree.json'), 'utf8'));
const ADMISSION = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/admission-standards.json'), 'utf8'));
const DATA = {
  courses: COURSES, pathways: PATHWAYS, statewide: STATEWIDE,
  framework: FRAMEWORK, targetTypes: ADMISSION.institutionTypes,
};

function gap(sourceCollege, targetCollege, takenCourses, pathwayId) {
  return buildGapPlan({ sourceCollege, targetCollege, takenCourses, pathwayId }, DATA);
}

Given('a gap analysis for Psychology at Delgado toward the Louisiana State University of New Orleans with {string} taken', function (list) {
  this.gap = gap('Delgado Community College', 'Louisiana State University of New Orleans', list.split(', '), 'psychology');
});

Given('a gap analysis for Psychology at Delgado toward Loyola with nothing taken', function () {
  this.gap = gap('Delgado Community College', 'Loyola University New Orleans', [], 'psychology');
});

Given('a gap analysis at Delgado toward the Louisiana State University of New Orleans with {string} taken and no pathway', function (list) {
  this.gap = gap('Delgado Community College', 'Louisiana State University of New Orleans', list.split(', '), null);
});

Given('a gap analysis at Delgado toward the Louisiana State University of New Orleans with nothing taken and no pathway', function () {
  this.gap = gap('Delgado Community College', 'Louisiana State University of New Orleans', [], null);
});

Given('a gap analysis at Tulane toward the Louisiana State University of New Orleans with nothing taken and no pathway', function () {
  this.gap = gap('Tulane University', 'Louisiana State University of New Orleans', [], null);
});

Then('the gap analysis basis is the pathway', function () {
  assert.equal(this.gap.status, 'ok');
  assert.equal(this.gap.basis, 'pathway');
  assert.equal(this.gap.pathwayId, 'psychology');
});

Then('the gap analysis basis is the general education block', function () {
  assert.equal(this.gap.status, 'ok');
  assert.equal(this.gap.basis, 'general-education');
});

Then('the gap analysis shows {int} hours taken and {int} hours remaining', function (taken, remaining) {
  assert.equal(this.gap.takenHours, taken);
  assert.equal(this.gap.remainingHours, remaining);
});

Then('the gap analysis totals {int} hours with {int} hours taken', function (total, taken) {
  assert.equal(this.gap.totalHours, total);
  assert.equal(this.gap.takenHours, taken);
});

Then('the gap analysis shows {int} hours remaining', function (remaining) {
  assert.equal(this.gap.remainingHours, remaining);
});

function gapRequirement(world, label) {
  const r = world.gap.requirements.find((x) => x.label === label);
  assert.ok(r, 'expected gap requirement ' + label);
  return r;
}

Then('the gap requirement {string} is fully taken', function (label) {
  const r = gapRequirement(this, label);
  assert.equal(r.takenHours, r.hours);
  assert.equal(r.remainingHours, 0);
  assert.equal(r.status, 'taken');
});

Then('the gap requirement {string} offers a Delgado course that counts at the target', function (label) {
  const r = gapRequirement(this, label);
  assert.ok(r.coursesToTake.length > 0, 'expected courses to take for ' + label);
  assert.ok(
    r.coursesToTake.every((c) => c.countsAtTarget === true && c.targetCode),
    'every offered course must count at the target: ' + JSON.stringify(r.coursesToTake)
  );
});

Then('the gap area {string} is met', function (label) {
  const r = gapRequirement(this, label);
  assert.equal(r.status, 'met');
  assert.equal(r.remainingHours, 0);
});

Then('the gap area {string} still needs {int} hours with courses that count at the target', function (label, hours) {
  const r = gapRequirement(this, label);
  assert.equal(r.remainingHours, hours);
  assert.ok(r.coursesToTake.length > 0, 'expected courses to take for ' + label);
  assert.ok(r.coursesToTake.every((c) => c.countsAtTarget === true && c.targetCode));
});

Then('the gap analysis does not apply the state guarantee', function () {
  assert.equal(this.gap.guaranteeApplies, false);
});

Then('no gap course is marked as counting at the target', function () {
  for (const r of this.gap.requirements) {
    for (const c of r.coursesToTake) {
      assert.notEqual(c.countsAtTarget, true);
    }
  }
});

Then('the gap analysis reports the source college as unknown', function () {
  assert.equal(this.gap.status, 'unknown-source-college');
});

Then('the gap plan links the source document {string}', function (url) {
  assert.strictEqual(this.gap.documentUrl, url);
});
