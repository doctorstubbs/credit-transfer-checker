'use strict';

const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { Given, When, Then } = require('@cucumber/cucumber');

const { buildPlan } = require('../../src/planner');

const COURSES = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/courses.json'), 'utf8')
);
const FRAMEWORK = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/transfer-degree.json'), 'utf8')
);

function allPlannedCourses(plan) {
  const fromAreas = plan.areas.flatMap((area) => area.courses);
  return fromAreas.concat(plan.disciplineCourses || []);
}

Given('a tiny course dataset with a 4-hour matched course', function () {
  this.plannerCourses = {
    colleges: {
      'Delgado Community College': {
        courses: [
          { code: 'BIOL 101', title: 'General Biology I', lccns: ['CBIO 1014'] },
        ],
      },
      'University of New Orleans': {
        courses: [
          { code: 'BIOS 1074', title: 'Biology I', lccns: ['CBIO 1014'] },
        ],
      },
    },
  };
});

When(
  'I build a transfer degree plan from {string} to {string}',
  function (sourceCollege, targetCollege) {
    this.planSource = sourceCollege;
    this.planTarget = targetCollege;
    this.plan = buildPlan(
      { sourceCollege, targetCollege },
      { courses: this.plannerCourses || COURSES, framework: FRAMEWORK }
    );
  }
);

Then('the plan status is {string}', function (status) {
  assert.equal(this.plan.status, status, JSON.stringify(this.plan.gaps || this.plan.reason));
});

Then('the plan has at least {int} general education hours', function (hours) {
  assert.ok(
    this.plan.generalEducationHours >= hours,
    `general education hours ${this.plan.generalEducationHours} < ${hours}`
  );
});

Then('the plan has at least {int} total hours', function (hours) {
  assert.ok(this.plan.totalHours >= hours, `total hours ${this.plan.totalHours} < ${hours}`);
});

Then("the plan's {string} area includes {string}", function (areaId, lccn) {
  const area = this.plan.areas.find((a) => a.id === areaId);
  assert.ok(area, `no area ${areaId}`);
  assert.ok(
    area.courses.some((c) => c.lccn === lccn),
    `${areaId} does not include ${lccn}: ${area.courses.map((c) => c.lccn).join(', ')}`
  );
});

Then("the plan's {string} area has {int} hours", function (areaId, hours) {
  const area = this.plan.areas.find((a) => a.id === areaId);
  assert.ok(area, `no area ${areaId}`);
  assert.equal(area.hours, hours);
});

Then('every planned course is offered at the source college', function () {
  const offered = COURSES.colleges[this.planSource].courses;
  for (const entry of allPlannedCourses(this.plan)) {
    assert.ok(
      offered.some((c) => c.code === entry.sourceCode && c.lccns.includes(entry.lccn)),
      `${entry.sourceCode} (${entry.lccn}) not in ${this.planSource} data`
    );
  }
});

Then('every planned course matches a course at the target college', function () {
  const offered = COURSES.colleges[this.planTarget].courses;
  for (const entry of allPlannedCourses(this.plan)) {
    assert.ok(
      offered.some((c) => c.code === entry.targetCode && c.lccns.includes(entry.lccn)),
      `${entry.targetCode} (${entry.lccn}) not in ${this.planTarget} data`
    );
  }
});

Then("the plan's natural sciences include a biological science course", function () {
  const area = this.plan.areas.find((a) => a.id === 'natural-sciences');
  assert.ok(area, 'no natural sciences area');
  assert.ok(
    area.courses.some((c) => c.branch === 'biological'),
    `no biological course in ${area.courses.map((c) => c.lccn).join(', ')}`
  );
});

Then("the plan's natural sciences include a physical science course", function () {
  const area = this.plan.areas.find((a) => a.id === 'natural-sciences');
  assert.ok(area, 'no natural sciences area');
  assert.ok(
    area.courses.some((c) => c.branch === 'physical'),
    `no physical course in ${area.courses.map((c) => c.lccn).join(', ')}`
  );
});

Then('the plan names a gap in the {string} area', function (areaId) {
  assert.ok(
    (this.plan.gaps || []).some((g) => g.area === areaId),
    `gaps do not name ${areaId}: ${JSON.stringify(this.plan.gaps)}`
  );
});

Then('the planned course {string} counts {int} hours', function (lccn, hours) {
  const entry = allPlannedCourses(this.plan).find((c) => c.lccn === lccn);
  assert.ok(entry, `${lccn} was not planned`);
  assert.equal(entry.hours, hours);
});

Then('the plan states the transfer degree guarantee', function () {
  assert.ok(
    Array.isArray(this.plan.guarantee) && this.plan.guarantee.length > 0,
    'guarantee missing'
  );
});

Then('the plan states the guarantee limits', function () {
  assert.ok(
    Array.isArray(this.plan.guaranteeLimits) && this.plan.guaranteeLimits.length > 0,
    'guarantee limits missing'
  );
});

Then('the plan does not state the transfer degree guarantee', function () {
  assert.ok(
    !this.plan.guarantee || this.plan.guarantee.length === 0,
    'a partial plan must not claim the guarantee'
  );
});

Then('every semester in the plan has at most {int} hours', function (hours) {
  assert.ok(this.plan.semesters.length > 0, 'no semesters');
  for (const semester of this.plan.semesters) {
    assert.ok(semester.hours <= hours, `semester ${semester.number} has ${semester.hours} hours`);
  }
});
