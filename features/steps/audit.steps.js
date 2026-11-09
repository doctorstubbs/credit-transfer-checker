const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const { runCheck } = require('../../src/checker');
const { buildAudit, renderAuditHtml } = require('../../src/audit');

let student;
let report;
let audit;
let printedHtml;

function course(code, extra) {
  return Object.assign({ code }, extra || {});
}

Given('a check of Delgado ENGL 101 and UNO BIOS 1083 toward UL Lafayette', function () {
  student = {
    target: { name: 'University of Louisiana at Lafayette', isPublic: true },
    targetCollege: 'University of Louisiana at Lafayette',
    sources: [
      { institution: 'Delgado Community College', courses: [course('ENGL 101')] },
      { institution: 'University of New Orleans', courses: [course('BIOS 1083')] }
    ],
    programType: 'general'
  };
  report = runCheck(student);
});

Given('a check of Delgado ENGL 101 and Delgado MATH 128 toward UL Lafayette', function () {
  student = {
    target: { name: 'University of Louisiana at Lafayette', isPublic: true },
    targetCollege: 'University of Louisiana at Lafayette',
    sources: [
      { institution: 'Delgado Community College', courses: [course('ENGL 101'), course('MATH 128')] }
    ],
    programType: 'general'
  };
  report = runCheck(student);
});

Given('a check of Delgado ENGL 101 toward UL Lafayette', function () {
  student = {
    target: { name: 'University of Louisiana at Lafayette', isPublic: true },
    targetCollege: 'University of Louisiana at Lafayette',
    sources: [
      { institution: 'Delgado Community College', courses: [course('ENGL 101')] }
    ],
    programType: 'general'
  };
  report = runCheck(student);
});

Given('a check with AP English Language and Composition scored 3 with the report sent toward UL Lafayette', function () {
  student = {
    target: { name: 'University of Louisiana at Lafayette', isPublic: true },
    targetCollege: 'University of Louisiana at Lafayette',
    sources: [],
    apExams: [{ exam: 'AP English Language and Composition', score: 3, scoreReportSent: true }],
    programType: 'general'
  };
  report = runCheck(student);
});

Given('a check with Delgado ENGL 101 declared as planned toward UL Lafayette', function () {
  student = {
    target: { name: 'University of Louisiana at Lafayette', isPublic: true },
    targetCollege: 'University of Louisiana at Lafayette',
    sources: [
      { institution: 'Delgado Community College', courses: [course('ENGL 101', { status: 'planned' })] }
    ],
    programType: 'general'
  };
  report = runCheck(student);
});

Given('a check with ENGL 1010 typed in from Baton Rouge Community College toward UL Lafayette', function () {
  student = {
    target: { name: 'University of Louisiana at Lafayette', isPublic: true },
    targetCollege: 'University of Louisiana at Lafayette',
    sources: [
      { institution: 'Baton Rouge Community College', courses: [course('ENGL 1010')] }
    ],
    programType: 'general'
  };
  report = runCheck(student);
});

When('the audit is built from that check', function () {
  audit = buildAudit(student, report);
});

When('the audit is rendered for printing', function () {
  printedHtml = renderAuditHtml(audit);
});

Then('the audit has a group for Delgado Community College', function () {
  assert.ok(audit.groups.some((g) => g.institution === 'Delgado Community College'));
});
Then('the audit has a group for University of New Orleans', function () {
  assert.ok(audit.groups.some((g) => g.institution === 'University of New Orleans'));
});

Then('the Delgado group shows ENGL 101 counting as ENGL 101 with 3 degree credits', function () {
  const g = audit.groups.find((x) => x.institution === 'Delgado Community College');
  const e = g.courses.find((c) => c.code === 'ENGL 101');
  assert.ok(e, 'ENGL 101 missing from the Delgado group');
  assert.strictEqual(e.countsAs, 'ENGL 101');
  assert.strictEqual(e.degreeCredit, 3);
});

Then('the New Orleans group shows BIOS 1083 counting as BIOL 110', function () {
  const g = audit.groups.find((x) => x.institution === 'University of New Orleans');
  const e = g.courses.find((c) => c.code === 'BIOS 1083');
  assert.ok(e, 'BIOS 1083 missing from the New Orleans group');
  assert.strictEqual(e.countsAs, 'BIOL 110');
});

Then('the audit total degree credits are {int}', function (n) {
  assert.strictEqual(audit.totalDegreeCredits, n);
});

Then('the audit AP section shows AP English Language and Composition earning ENGL 101 for 3 credits', function () {
  const a = audit.ap.find((x) => x.exam === 'AP English Language and Composition');
  assert.ok(a, 'AP exam missing from the audit AP section');
  assert.strictEqual(a.countsAs, 'ENGL 101');
  assert.strictEqual(a.degreeCredit, 3);
});

Then('the audit entry for ENGL 101 carries the C or better condition', function () {
  const g = audit.groups[0];
  const e = g.courses.find((c) => c.code === 'ENGL 101');
  assert.ok(e.condition && e.condition.includes('C or better'), 'condition missing: ' + JSON.stringify(e));
});

Then('the audit lists ENGL 1010 as not covered yet', function () {
  assert.ok(audit.notCovered.some((c) => c.code === 'ENGL 1010'), 'notCovered: ' + JSON.stringify(audit.notCovered));
});

Then('the audit limits say it is not an official evaluation', function () {
  assert.ok(audit.limits.includes('not an official evaluation'), audit.limits);
});
Then('the audit limits say the receiving university makes the final call', function () {
  assert.ok(audit.limits.includes('receiving university makes the final call'), audit.limits);
});

Then('the printed document names University of Louisiana at Lafayette and the total of 6', function () {
  assert.ok(printedHtml.includes('University of Louisiana at Lafayette'));
  assert.ok(printedHtml.includes('6'), 'total missing from the printed document');
});
Then('the printed document contains no form elements', function () {
  assert.ok(!/<(form|input|select|textarea|button)[\s>]/i.test(printedHtml), 'form element found in the printed document');
});

Given('a page style check of Delgado ENGL 101 toward UL Lafayette', function () {
  student = {
    target: { name: 'University of Louisiana at Lafayette', isPublic: true, teachesSubject: true },
    sources: [
      { institution: 'Delgado Community College', courses: [course('ENGL 101')] }
    ],
    programType: 'general'
  };
  report = runCheck(student);
});

Then('every course group heading in the printed document names University of Louisiana at Lafayette as where the courses count', function () {
  const headings = printedHtml.match(/<h2>[\s\S]*?<\/h2>/g) || [];
  const groupHeadings = headings.filter((h) => h.includes('Courses from'));
  assert.ok(groupHeadings.length >= 2, 'expected at least 2 course groups, got: ' + headings.join(' | '));
  for (const h of groupHeadings) {
    const text = h.replace(/<[^>]*>/g, '');
    assert.ok(text.includes('counting at University of Louisiana at Lafayette'), 'group heading missing target: ' + h);
  }
});

Then('the printed document summary names Delgado Community College and University of New Orleans as where the courses come from', function () {
  const head = printedHtml.slice(0, printedHtml.indexOf('<h2>'));
  assert.ok(head.includes('Delgado Community College'), 'summary missing Delgado');
  assert.ok(head.includes('University of New Orleans'), 'summary missing UNO');
});

Then('the printed document summary names University of Louisiana at Lafayette as where they count', function () {
  const head = printedHtml.slice(0, printedHtml.indexOf('<h2>'));
  assert.ok(head.includes('counting at') && head.includes('University of Louisiana at Lafayette'), 'summary missing target');
});

Then('the audit target is University of Louisiana at Lafayette', function () {
  assert.strictEqual(audit.target, 'University of Louisiana at Lafayette');
});
