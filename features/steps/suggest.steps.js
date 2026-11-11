'use strict';

const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const { suggestionPool, matchSuggestions } = require('../../src/suggest');

Given('the suggestion data has a covered college {string} with course {string} titled {string} with state number {string}',
  function (college, code, title, lccn) {
    this.suggestData = this.suggestData || { colleges: {}, statewide: {} };
    if (!this.suggestData.colleges[college]) this.suggestData.colleges[college] = { courses: [] };
    this.suggestData.colleges[college].courses.push({ code, title, lccns: [lccn] });
  });

Given('the statewide catalog has {string} titled {string}', function (lccn, title) {
  this.suggestData = this.suggestData || { colleges: {}, statewide: {} };
  this.suggestData.statewide[lccn] = { title, hours: 3 };
});

When('the suggestion pool is built for {string}', function (college) {
  this.pool = suggestionPool(this.suggestData, college);
});

When('suggestions are matched for the typed text {string}', function (text) {
  this.matches = matchSuggestions(this.pool, text);
});

Then('the pool has {int} entry with code {string} and state number {string}', function (n, code, lccn) {
  assert.strictEqual(this.pool.length, n, 'pool size');
  assert.strictEqual(this.pool[0].code, code);
  assert.strictEqual(this.pool[0].lccn, lccn);
});

Then('the pool has {int} entries from the statewide catalog', function (n) {
  assert.strictEqual(this.pool.length, n, 'pool size, got ' + JSON.stringify(this.pool));
  assert.ok(this.pool.every((e) => e.statewide), 'every entry is a statewide entry');
});

Then('the first suggestion is {string}', function (code) {
  assert.ok(this.matches.length >= 1, 'expected at least one suggestion');
  assert.strictEqual(this.matches[0].code, code);
});

Then('there are no suggestions', function () {
  assert.deepStrictEqual(this.matches, []);
});
