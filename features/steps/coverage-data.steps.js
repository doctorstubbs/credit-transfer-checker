'use strict';

const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { Given, Then } = require('@cucumber/cucumber');

const COURSES = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/courses.json'), 'utf8'));

Given('the coverage data for all covered colleges', function () {
  this.coverageColleges = COURSES.colleges;
});

Then('all {int} covered colleges carry a last verified date', function (count) {
  const names = Object.keys(this.coverageColleges);
  assert.equal(names.length, count);
  for (const name of names) {
    const v = this.coverageColleges[name].lastVerified;
    assert.ok(typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v), name + ' has no lastVerified date');
  }
});

Then('Delgado Community College was last verified on 2026-11-08', function () {
  assert.equal(this.coverageColleges['Delgado Community College'].lastVerified, '2026-11-08');
});

Then('the Louisiana State University of New Orleans was last verified on 2026-11-08', function () {
  assert.equal(this.coverageColleges['Louisiana State University of New Orleans'].lastVerified, '2026-11-08');
});

Then('Baton Rouge Community College was last verified on 2026-11-11', function () {
  assert.equal(this.coverageColleges['Baton Rouge Community College'].lastVerified, '2026-11-11');
});

Then('the University of Louisiana at Lafayette was last verified on 2026-11-12', function () {
  assert.equal(this.coverageColleges['University of Louisiana at Lafayette'].lastVerified, '2026-11-12');
});

Then('South Louisiana Community College was last verified on 2026-11-16', function () {
  assert.equal(this.coverageColleges['South Louisiana Community College'].lastVerified, '2026-11-16');
});

Then('the University of Holy Cross was last verified on 2026-11-17', function () {
  assert.equal(this.coverageColleges['University of Holy Cross'].lastVerified, '2026-11-17');
});

Then('Dillard University is not in the course data', function () {
  assert.equal(this.coverageColleges['Dillard University'], undefined);
});

Then('Tulane University is not in the course data', function () {
  assert.equal(this.coverageColleges['Tulane University'], undefined);
});

Then('Xavier University of Louisiana is not in the course data', function () {
  assert.equal(this.coverageColleges['Xavier University of Louisiana'], undefined);
});
