const { Given, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const { runCheck, compareTargets } = require('../../src/checker');

const STUDENT = {
  targetCollege: 'Louisiana State University of New Orleans',
  sources: [{ institution: 'Delgado Community College', courses: [{ code: 'ENGL 101' }] }],
  programType: 'general',
};

const TARGETS = {
  'Louisiana State University of New Orleans': { name: 'Louisiana State University of New Orleans', isPublic: true },
  'Southeastern': { name: 'Southeastern Louisiana University', isPublic: true },
  'Loyola': { name: 'Loyola University New Orleans', isPublic: false },
};

Given('a comparison of Delgado ENGL 101 against the Louisiana State University of New Orleans and Southeastern', function () {
  this.comparisons = compareTargets(STUDENT, [TARGETS['Louisiana State University of New Orleans'], TARGETS['Southeastern']]);
});

Given('a comparison of Delgado ENGL 101 against the Louisiana State University of New Orleans and Loyola', function () {
  this.comparisons = compareTargets(STUDENT, [TARGETS['Louisiana State University of New Orleans'], TARGETS['Loyola']]);
});

function side(world, label) {
  const entry = world.comparisons.find((c) => c.target.name === TARGETS[label].name);
  assert.ok(entry, 'expected a comparison side for ' + label);
  return entry.report;
}

Then('the comparison returns {int} result sets', function (count) {
  assert.strictEqual(this.comparisons.length, count);
});

Then('the comparison result for the Louisiana State University of New Orleans shows {string} as {string} with {int} degree hours', function (code, shownAs, hours) {
  const r = side(this, 'Louisiana State University of New Orleans').courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
  assert.strictEqual(r.dataStatus, 'matched');
});

Then('the comparison result for Southeastern shows {string} as {string} with {int} degree hours', function (code, shownAs, hours) {
  const r = side(this, 'Southeastern').courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
  assert.strictEqual(r.dataStatus, 'matched');
});

Then('the comparison result for Loyola marks every course as verify individually', function () {
  assert.strictEqual(side(this, 'Loyola').allCoursesVerifyIndividually, true);
});

Then('the comparison result for Loyola lists {string} with the verify individually status', function (code) {
  const r = side(this, 'Loyola').courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.dataStatus, 'verify-individually');
});

Then('each comparison side equals the single-target check for that target', function () {
  for (const entry of this.comparisons) {
    const single = runCheck({ ...STUDENT, target: entry.target, targetCollege: entry.target.name });
    assert.deepStrictEqual(entry.report, single);
  }
});
