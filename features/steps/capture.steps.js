'use strict';

const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Given, Then } = require('@cucumber/cucumber');
const {
  buildCaptureRecord,
  createRateLimiter,
  createCaptureStore,
} = require('../../src/capture');

const CHECK = {
  input: {
    target: { name: 'Louisiana State University of New Orleans', isPublic: true },
    targetCollege: 'Louisiana State University of New Orleans',
    sources: [{ institution: 'Delgado Community College', courses: [{ code: 'ENGL 101' }] }],
    programType: 'general',
  },
  result: { totalDegreeHours: 3 },
};

Given('a capture posted with email {string} and a completed check', function (email) {
  this.captureOutcome = buildCaptureRecord({ email, check: CHECK }, '2026-11-17T12:00:00.000Z');
});

Given('a capture posted with an email and no check result', function () {
  this.captureOutcome = buildCaptureRecord(
    { email: 'parent@example.com', check: { input: CHECK.input } },
    '2026-11-17T12:00:00.000Z'
  );
});

Then('the stored record carries only the email, the check, and the received time', function () {
  assert.ok(this.captureOutcome.record, JSON.stringify(this.captureOutcome));
  assert.deepEqual(Object.keys(this.captureOutcome.record).sort(), ['check', 'email', 'receivedAt']);
  assert.equal(this.captureOutcome.record.email, 'parent@example.com');
  assert.equal(this.captureOutcome.record.receivedAt, '2026-11-17T12:00:00.000Z');
});

Then('the stored record keeps the check inputs and the check result', function () {
  assert.deepEqual(this.captureOutcome.record.check.input, CHECK.input);
  assert.deepEqual(this.captureOutcome.record.check.result, CHECK.result);
});

Then('the capture is refused for the email', function () {
  assert.ok(this.captureOutcome.error && this.captureOutcome.error.includes('email'), JSON.stringify(this.captureOutcome));
  assert.equal(this.captureOutcome.record, undefined);
});

Then('the capture is refused for the check payload', function () {
  assert.ok(this.captureOutcome.error && this.captureOutcome.error.includes('check'), JSON.stringify(this.captureOutcome));
  assert.equal(this.captureOutcome.record, undefined);
});

const COUNSELOR = { name: 'Jamie Rivera', organization: 'Bright Futures Tutoring', students: '25', betaCode: '' };

Given('a counselor capture posted with email {string} and counselor details', function (email) {
  this.captureOutcome = buildCaptureRecord(
    { kind: 'counselor', email, counselor: COUNSELOR },
    '2026-11-17T12:00:00.000Z'
  );
});

Given('a counselor capture posted with beta code {string}', function (betaCode) {
  this.captureOutcome = buildCaptureRecord(
    { kind: 'counselor', email: 'counselor@example.com', counselor: { ...COUNSELOR, betaCode } },
    '2026-11-17T12:00:00.000Z'
  );
});

Then('the stored record keeps the beta code {string}', function (betaCode) {
  assert.ok(this.captureOutcome.record, JSON.stringify(this.captureOutcome));
  assert.equal(this.captureOutcome.record.counselor.betaCode, betaCode);
});

Given('a counselor capture posted without a counselor name', function () {
  this.captureOutcome = buildCaptureRecord(
    {
      kind: 'counselor',
      email: 'counselor@example.com',
      counselor: { organization: COUNSELOR.organization, students: COUNSELOR.students },
    },
    '2026-11-17T12:00:00.000Z'
  );
});

Given('a counselor capture posted with no counselor payload', function () {
  this.captureOutcome = buildCaptureRecord(
    { kind: 'counselor', email: 'counselor@example.com' },
    '2026-11-17T12:00:00.000Z'
  );
});

Given('a counselor capture posted with only a counselor name', function () {
  this.captureOutcome = buildCaptureRecord(
    { kind: 'counselor', email: 'counselor@example.com', counselor: { name: COUNSELOR.name } },
    '2026-11-17T12:00:00.000Z'
  );
});

Given('a counselor capture posted with a counselor name of 201 characters', function () {
  this.captureOutcome = buildCaptureRecord(
    { kind: 'counselor', email: 'counselor@example.com', counselor: { name: 'x'.repeat(201) } },
    '2026-11-17T12:00:00.000Z'
  );
});

Then('the stored record carries the email, the counselor kind, the counselor details, and the received time', function () {
  assert.ok(this.captureOutcome.record, JSON.stringify(this.captureOutcome));
  assert.deepEqual(this.captureOutcome.record, {
    email: 'counselor@example.com',
    kind: 'counselor',
    counselor: COUNSELOR,
    receivedAt: '2026-11-17T12:00:00.000Z',
  });
});

Then('the capture is refused for the counselor name', function () {
  assert.ok(this.captureOutcome.error && this.captureOutcome.error.includes('name'), JSON.stringify(this.captureOutcome));
  assert.equal(this.captureOutcome.record, undefined);
});

Then('the capture is refused for the counselor payload', function () {
  assert.ok(
    this.captureOutcome.error && this.captureOutcome.error.includes('counselor payload'),
    JSON.stringify(this.captureOutcome)
  );
  assert.equal(this.captureOutcome.record, undefined);
});

Then('the stored counselor record defaults organization and students to empty strings', function () {
  assert.ok(this.captureOutcome.record, JSON.stringify(this.captureOutcome));
  assert.deepEqual(this.captureOutcome.record.counselor, {
    name: COUNSELOR.name,
    organization: '',
    students: '',
    betaCode: '',
  });
});

Given('a capture rate limiter of 5 per 10 minutes', function () {
  let t = 1000000;
  this.limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000, now: () => t });
});

Then('the first 5 captures from one source are allowed', function () {
  for (let i = 0; i < 5; i++) assert.equal(this.limiter.allow('203.0.113.7'), true);
});

Then('the 6th capture from that source is refused', function () {
  assert.equal(this.limiter.allow('203.0.113.7'), false);
});

Then('a capture from a different source is still allowed', function () {
  assert.equal(this.limiter.allow('198.51.100.2'), true);
});

Given('two captures stored in a capture file', function () {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ctc-capture-')), 'captures.jsonl');
  this.captureStore = createCaptureStore(file);
  const a = buildCaptureRecord({ email: 'a@example.com', check: CHECK }, '2026-11-17T12:00:00.000Z').record;
  const b = buildCaptureRecord({ email: 'b@example.com', check: CHECK }, '2026-11-17T12:05:00.000Z').record;
  this.captureStore.append(a);
  this.captureStore.append(b);
});

Then('reading the capture file returns both in order', function () {
  const all = this.captureStore.readAll();
  assert.equal(all.length, 2);
  assert.equal(all[0].email, 'a@example.com');
  assert.equal(all[1].email, 'b@example.com');
});
