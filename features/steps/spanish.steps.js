const { Given, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const { buildGuidance } = require('../../src/guidance');
const { spanishHeadline, translateGuidance, statusLabel } = require('../../src/i18n');

const CHOICE_ES = 'Si alguna de estas clases es de doble inscripción y la estás tomando ahora, pregunta a tu consejero escolar sobre el crédito por elección (choice credit) antes de que termine el curso: tú decides si la calificación aparece en tu transcripción universitaria.';
const GRADE_ES = '¿Una calificación menor que C en alguna de estas clases cambia lo que cuenta? La garantía del título de transferencia exige una C o mejor en cada clase.';

function course(code, dataStatus, degreeCredit, status) {
  return {
    code, dataStatus, degreeCredit, status: status || 'completed',
    shownAs: 'x', countsToward: null,
    sourceInstitution: 'Delgado Community College', condition: null, warning: null,
  };
}

function guidanceFor(courses, target) {
  const report = { courseResults: courses, apResults: [], prerequisiteStillRequired: false };
  const student = { target: { name: target, isPublic: true, teachesSubject: true }, sources: [] };
  return buildGuidance(student, report);
}

Given('a Spanish guidance check with one matched course and one elective course toward the University of New Orleans', function () {
  this.guidance = guidanceFor([
    course('ENGL 101', 'matched', 3),
    course('HIST 103', 'subject-elective', 3),
  ], 'University of New Orleans');
  this.target = 'University of New Orleans';
});

Given('a Spanish guidance check with one uncovered course toward Delgado Community College', function () {
  this.guidance = guidanceFor([course('PHYS 229', 'no-match-in-data', 0)], 'Delgado Community College');
  this.target = 'Delgado Community College';
});

Given('a Spanish guidance check with one planned matched course', function () {
  this.guidance = guidanceFor([course('ENGL 101', 'matched', 3, 'planned')], 'University of New Orleans');
  this.target = 'University of New Orleans';
});

Then('the Spanish headline reads {string}', function (expected) {
  assert.strictEqual(spanishHeadline(this.guidance, this.target), expected);
});

Then('the Spanish next steps include the choice credit step in Spanish', function () {
  const es = translateGuidance(this.guidance);
  assert.ok(es.nextSteps.includes(CHOICE_ES), 'next steps: ' + JSON.stringify(es.nextSteps));
});

Then('the Spanish advisor questions include the grade protection question in Spanish', function () {
  const es = translateGuidance(this.guidance);
  assert.ok(es.advisorQuestions.includes(GRADE_ES), 'questions: ' + JSON.stringify(es.advisorQuestions));
});

Then('the Spanish next steps include the transcript step in Spanish for the University of New Orleans', function () {
  const es = translateGuidance(this.guidance);
  const expected = 'Envía tu transcripción oficial a University of New Orleans para que los créditos que cuentan queden registrados en tu expediente allí.';
  assert.ok(es.nextSteps.includes(expected), 'next steps: ' + JSON.stringify(es.nextSteps));
});

Then('the Spanish label for {string} is {string}', function (status, label) {
  assert.strictEqual(statusLabel(status, 'es'), label);
});
