const { Given, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { buildPlan } = require('../../src/planner');
const { buildPacket } = require('../../src/packet');

const COURSES = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/courses.json'), 'utf8'));
const FRAMEWORK = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/transfer-degree.json'), 'utf8'));
const TUITION = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/tuition.json'), 'utf8'));
const APPS = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/applications.json'), 'utf8'));

Given('an apply packet for a plan from {string} to {string}', function (source, target) {
  const plan = buildPlan(
    { sourceCollege: source, targetCollege: target },
    { courses: COURSES, framework: FRAMEWORK, tuition: TUITION }
  );
  this.packet = buildPacket(plan, APPS);
});

Given('an apply packet for a plan to {string}', function (target) {
  const plan = {
    status: 'complete',
    sourceCollege: 'Delgado Community College',
    targetCollege: target,
    totalHours: 3,
    semesters: [{ number: 1, hours: 3, courses: [{ sourceCode: 'ENGL 101', sourceTitle: 'English Composition I', targetCode: 'ENGL 101', targetTitle: 'English Composition I', hours: 3 }] }],
    savings: null,
  };
  this.packet = buildPacket(plan, APPS);
});

Then('the packet status is {string}', function (status) {
  assert.strictEqual(this.packet.status, status);
});

Then('the first step sends the family to ApplyDE', function () {
  assert.ok(this.packet.steps.length > 0);
  assert.ok(this.packet.steps[0].detail.includes('ApplyDE'), 'first step should route through ApplyDE');
  assert.strictEqual(this.packet.steps[0].url, 'https://applyde.laregents.edu');
});

Then('the packet lists ENGL 101 in semester 1', function () {
  const hit = this.packet.courses.find((c) => c.sourceCode === 'ENGL 101' && c.semester === 1);
  assert.ok(hit, 'expected ENGL 101 in semester 1 of the packet');
});

Then('the packet carries the UNO Spring final deadline of January 2', function () {
  const hit = this.packet.deadlines.find((d) => d.term === 'Spring' && d.kind === 'final' && d.date === 'January 2');
  assert.ok(hit, 'expected the UNO Spring final deadline');
});

Then('the packet includes the official transcript step', function () {
  const hit = this.packet.steps.find((s) => s.title.includes('official') && s.title.includes('transcript'));
  assert.ok(hit, 'expected an official transcript step');
});

Then('the packet carries the UL Lafayette Spring deadline of November 30', function () {
  const hit = this.packet.deadlines.find((d) => d.term === 'Spring' && d.date === 'November 30');
  assert.ok(hit, 'expected the UL Lafayette Spring deadline');
});

Then('the admission step names the $25 application fee', function () {
  const step = this.packet.steps.find((s) => s.title.startsWith('Apply for admission'));
  assert.ok(step && step.detail.includes('$25 application fee'), 'expected the fee in the admission step');
});

Then('the packet prints no deadlines', function () {
  assert.deepStrictEqual(this.packet.deadlines, []);
});

Then('the admission step prints no application link', function () {
  const step = this.packet.steps.find((s) => s.title.startsWith('Apply for admission'));
  assert.ok(step, 'expected an admission step');
  assert.strictEqual(step.url, null);
});
