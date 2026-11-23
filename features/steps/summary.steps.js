'use strict';

const assert = require('node:assert/strict');
const { Given, Then } = require('@cucumber/cucumber');
const { runCheck } = require('../../src/checker');
const { buildSummary, renderSummaryHtml } = require('../../src/summary');

const META = { generatedOn: '2026-11-17' };

function summarize(target) {
  const student = {
    target,
    targetCollege: target.name,
    sources: [{ institution: 'Delgado Community College', courses: [{ code: 'ENGL 101' }] }],
    programType: 'general',
  };
  return buildSummary(student, runCheck(student), META);
}

Given('a summary of a Delgado ENGL 101 check toward the Louisiana State University of New Orleans', function () {
  this.summary = summarize({ name: 'Louisiana State University of New Orleans', isPublic: true });
});

Given('a summary of a Delgado ENGL 101 check toward Loyola', function () {
  this.summary = summarize({ name: 'Loyola University New Orleans', isPublic: false });
});

Then('the summary lists {string} counting as {string} with {int} degree hours', function (code, countsAs, hours) {
  const row = this.summary.rows.find((r) => r.code === code);
  assert.ok(row, 'expected a summary row for ' + code);
  assert.equal(row.countsAs, countsAs);
  assert.equal(row.degreeCredit, hours);
});

Then('the summary lists {string} as verify with the university', function (code) {
  const row = this.summary.rows.find((r) => r.code === code);
  assert.ok(row, 'expected a summary row for ' + code);
  assert.equal(row.verdict, 'Verify with the university');
  assert.equal(row.degreeCredit, 0);
});

Then('the summary total is {int} degree hours', function (hours) {
  assert.equal(this.summary.totalDegreeHours, hours);
});

Then('the summary names the Louisiana State University of New Orleans as the target', function () {
  assert.equal(this.summary.target, 'Louisiana State University of New Orleans');
});

Then('the summary edition names the AY 2025-26 statewide common course catalog', function () {
  assert.ok(this.summary.edition.includes('AY 2025-26'), this.summary.edition);
  assert.ok(this.summary.edition.includes('Statewide Common Course Catalog'), this.summary.edition);
});

Then('the summary says it is guidance, not an official ruling', function () {
  assert.ok(this.summary.guidanceLine.includes('guidance, not an official ruling'), this.summary.guidanceLine);
});

Then('the summary notes that the state guarantee does not apply', function () {
  assert.equal(this.summary.guaranteeApplies, false);
  assert.ok(this.summary.verifyNote && this.summary.verifyNote.includes('does not apply'));
});

Then('the rendered summary HTML sets a Letter page for printing', function () {
  const html = renderSummaryHtml(this.summary);
  assert.ok(html.includes('@page'), 'expected print page rules');
  assert.ok(html.includes('Letter'), 'expected a Letter page size');
});

Then('the rendered summary HTML carries the guidance line', function () {
  const html = renderSummaryHtml(this.summary);
  assert.ok(html.includes('guidance, not an official ruling'));
});

Then('the rendered summary HTML shows the course and the total', function () {
  const html = renderSummaryHtml(this.summary);
  assert.ok(html.includes('ENGL 101'));
  assert.ok(html.includes('ENGL 1157'));
  assert.ok(html.includes('Total degree hours that count'));
});
