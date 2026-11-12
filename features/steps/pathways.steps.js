'use strict';

const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { Given, Then } = require('@cucumber/cucumber');

const { buildPathwayPlan } = require('../../src/pathways');

const COURSES = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/courses.json'), 'utf8'));
const PATHWAYS = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/pathways.json'), 'utf8'));
const STATEWIDE = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/statewide-courses.json'), 'utf8'));
const DATA = { courses: COURSES, pathways: PATHWAYS, statewide: STATEWIDE };

function plan(sourceCollege, targetCollege, takenLccns) {
  return buildPathwayPlan(
    { pathwayId: 'psychology', sourceCollege, targetCollege, takenLccns: takenLccns || [] },
    DATA
  );
}

function requirement(label) {
  const r = this.plan.requirements.find((x) => x.label === label);
  assert.ok(r, 'expected requirement ' + label);
  return r;
}

Given('a pathway plan for Psychology at BRCC toward Southeastern', function () {
  this.plan = plan('Baton Rouge Community College', 'Southeastern Louisiana University');
});

Given('a pathway plan for Psychology at BRCC toward Southeastern with {string} already earned', function (list) {
  this.plan = plan('Baton Rouge Community College', 'Southeastern Louisiana University', list.split(', '));
});

Given('a pathway plan for Psychology at BRCC toward Tulane', function () {
  this.plan = plan('Baton Rouge Community College', 'Tulane University');
});

Given('a pathway plan for a pathway that does not exist', function () {
  this.plan = buildPathwayPlan(
    { pathwayId: 'astrophysics', sourceCollege: 'Baton Rouge Community College', targetCollege: 'Southeastern Louisiana University' },
    DATA
  );
});

Given('a pathway plan for Criminal Justice at BRCC toward Southeastern', function () {
  this.plan = buildPathwayPlan(
    { pathwayId: 'criminal-justice', sourceCollege: 'Baton Rouge Community College', targetCollege: 'Southeastern Louisiana University', takenLccns: [] },
    DATA
  );
});

Given('a pathway plan for Biology at BRCC toward LSU', function () {
  this.plan = buildPathwayPlan(
    { pathwayId: 'biology', sourceCollege: 'Baton Rouge Community College', targetCollege: 'Louisiana State University and A&M College', takenLccns: [] },
    DATA
  );
});

Given('a pathway plan for Accounting at BRCC toward Southeastern', function () {
  this.plan = buildPathwayPlan(
    { pathwayId: 'accounting', sourceCollege: 'Baton Rouge Community College', targetCollege: 'Southeastern Louisiana University', takenLccns: [] },
    DATA
  );
});

Given('a pathway plan for Finance at BRCC toward Louisiana Tech', function () {
  this.plan = buildPathwayPlan(
    { pathwayId: 'finance', sourceCollege: 'Baton Rouge Community College', targetCollege: 'Louisiana Tech University', takenLccns: [] },
    DATA
  );
});

Given('a pathway plan for Management at BRCC toward Louisiana Tech', function () {
  this.plan = buildPathwayPlan(
    { pathwayId: 'management', sourceCollege: 'Baton Rouge Community College', targetCollege: 'Louisiana Tech University', takenLccns: [] },
    DATA
  );
});

Given('a pathway plan for Marketing at BRCC toward Southeastern', function () {
  this.plan = buildPathwayPlan(
    { pathwayId: 'marketing', sourceCollege: 'Baton Rouge Community College', targetCollege: 'Southeastern Louisiana University', takenLccns: [] },
    DATA
  );
});

Given('a pathway plan for Social Work at BRCC toward Southeastern', function () {
  this.plan = buildPathwayPlan(
    { pathwayId: 'social-work', sourceCollege: 'Baton Rouge Community College', targetCollege: 'Southeastern Louisiana University', takenLccns: [] },
    DATA
  );
});

Given('a pathway plan for Political Science at BRCC toward UNO', function () {
  this.plan = buildPathwayPlan(
    { pathwayId: 'political-science', sourceCollege: 'Baton Rouge Community College', targetCollege: 'University of New Orleans', takenLccns: [] },
    DATA
  );
});

Given('a pathway plan for Art at Northwestern toward Louisiana Tech', function () {
  this.plan = buildPathwayPlan(
    { pathwayId: 'art', sourceCollege: 'Northwestern State University of Louisiana', targetCollege: 'Louisiana Tech University', takenLccns: [] },
    DATA
  );
});

Given('a pathway plan for Computer Science at BRCC toward LSU', function () {
  this.plan = buildPathwayPlan(
    { pathwayId: 'computer-science', sourceCollege: 'Baton Rouge Community College', targetCollege: 'Louisiana State University and A&M College', takenLccns: [] },
    DATA
  );
});

Given('a pathway plan for Kinesiology Sport Management at Delgado toward Southeastern', function () {
  this.plan = buildPathwayPlan(
    { pathwayId: 'kinesiology-sport-management', sourceCollege: 'Delgado Community College', targetCollege: 'Southeastern Louisiana University', takenLccns: [] },
    DATA
  );
});

Given('a pathway plan for Kinesiology Pre-Allied Health at Delgado toward LSU', function () {
  this.plan = buildPathwayPlan(
    { pathwayId: 'kinesiology-pre-allied-health', sourceCollege: 'Delgado Community College', targetCollege: 'Louisiana State University and A&M College', takenLccns: [] },
    DATA
  );
});

Then('the {string} requirement is a gap', function (label) {
  const r = requirement.call(this, label);
  assert.strictEqual(r.status, 'gap');
  assert.strictEqual(r.picks.length, 0);
});

Then('the plan has {int} gap hours', function (hours) {
  assert.strictEqual(this.plan.gapHours, hours);
});

Then('the plan totals {int} hours across {int} requirements', function (hours, count) {
  assert.strictEqual(this.plan.totalHours, hours);
  assert.strictEqual(this.plan.requirements.length, count);
});

Then('the plan lists careers from the published document', function () {
  assert.ok(this.plan.careers.includes('Child Psychologist'));
  assert.ok(this.plan.careers.includes('Behavioral Health Specialist'));
});

Then('the {string} requirement is available with statewide number {string} counting at the target', function (label, lccn) {
  const r = requirement.call(this, label);
  assert.strictEqual(r.status, 'available');
  assert.strictEqual(r.picks[0].lccn, lccn);
  assert.strictEqual(r.picks[0].countsAtTarget, true);
});

Then('the {string} requirement is taken', function (label) {
  const r = requirement.call(this, label);
  assert.strictEqual(r.status, 'taken');
});

Then('the next semester does not include {string}', function (lccn) {
  assert.ok(!this.plan.nextSemester.some((p) => p.lccn === lccn));
});

Then('the next semester totals between {int} and {int} hours', function (lo, hi) {
  assert.ok(this.plan.nextSemesterHours >= lo && this.plan.nextSemesterHours <= hi,
    'next semester hours ' + this.plan.nextSemesterHours);
});

Then('the next semester starts with {string}', function (lccn) {
  assert.strictEqual(this.plan.nextSemester[0].lccn, lccn);
});

Then('the {string} requirement is filled with {int} hours that count at the target', function (label, hours) {
  const r = requirement.call(this, label);
  const sum = r.picks.reduce((s, p) => s + p.hours, 0);
  assert.strictEqual(sum, hours);
  assert.ok(r.picks.every((p) => p.countsAtTarget === true));
});

Then('the plan reports the target as not covered', function () {
  assert.strictEqual(this.plan.targetCovered, false);
});

Then('the {string} requirement has no target verdict', function (label) {
  const r = requirement.call(this, label);
  assert.ok(r.picks.length > 0);
  assert.strictEqual(r.picks[0].countsAtTarget, null);
});

Then('the pathway plan status is {string}', function (status) {
  assert.strictEqual(this.plan.status, status);
});
