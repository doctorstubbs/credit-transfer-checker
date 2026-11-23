const { Given, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const { runCheck } = require('../../src/checker');

function check(source, code, target) {
  return runCheck({
    target: { name: target, isPublic: true },
    targetCollege: target,
    sources: [{ institution: source, courses: [{ code }] }],
    programType: 'general',
  });
}

Given('a coverage check of BRCC ENGL 1013 toward UL Lafayette', function () {
  this.report = check('Baton Rouge Community College', 'ENGL 1013', 'University of Louisiana at Lafayette');
});

Given('a coverage check of Delgado FNAR 125 toward UL Lafayette', function () {
  this.report = check('Delgado Community College', 'FNAR 125', 'University of Louisiana at Lafayette');
});

Given('a coverage check of Delgado MUSC 105 toward UL Lafayette', function () {
  this.report = check('Delgado Community College', 'MUSC 105', 'University of Louisiana at Lafayette');
});

Given('a coverage check of Delgado ENGL 101 toward BRCC', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Baton Rouge Community College');
});

Given('a coverage check of BRCC PSYC 2013 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Baton Rouge Community College', 'PSYC 2013', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Southeastern ENGL 1010 toward Delgado', function () {
  this.report = check('Southeastern Louisiana University', 'ENGL 1010', 'Delgado Community College');
});

Given('a coverage check of Southeastern MATH 1610 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Southeastern Louisiana University', 'MATH 1610', 'Louisiana State University of New Orleans');
});

Given('a coverage check of BRCC PSYC 2013 toward LSU', function () {
  this.report = check('Baton Rouge Community College', 'PSYC 2013', 'Louisiana State University and A&M College');
});

Given('a coverage check of Southeastern ENGL 1010 toward LSU', function () {
  this.report = check('Southeastern Louisiana University', 'ENGL 1010', 'Louisiana State University and A&M College');
});

Given('a coverage check of Northwestern ENGL 1010 toward LSU', function () {
  this.report = check('Northwestern State University of Louisiana', 'ENGL 1010', 'Louisiana State University and A&M College');
});

Given('a coverage check of Northwestern PSYC 1010 toward BRCC', function () {
  this.report = check('Northwestern State University of Louisiana', 'PSYC 1010', 'Baton Rouge Community College');
});

Given('a coverage check of Louisiana Tech ENGL 1013 toward LSU', function () {
  this.report = check('Louisiana Tech University', 'ENGL 1013', 'Louisiana State University and A&M College');
});

Given('a coverage check of Louisiana Tech PSYC 1023 toward Southeastern', function () {
  this.report = check('Louisiana Tech University', 'PSYC 1023', 'Southeastern Louisiana University');
});

Then('the result for {string} is matched with {int} degree hours', function (code, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.dataStatus, 'matched');
  assert.strictEqual(r.degreeCredit, hours);
});

Then('the result for {string} shows as {string} at BRCC with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of SLCC ENGL 1010 toward the Louisiana State University of New Orleans', function () {
  this.report = check('South Louisiana Community College', 'ENGL 1010', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward SLCC', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'South Louisiana Community College');
});

Given('a coverage check of SLCC PSYC 2010 toward LSU', function () {
  this.report = check('South Louisiana Community College', 'PSYC 2010', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at SLCC with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of Nunez ENGL 1010 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Nunez Community College', 'ENGL 1010', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward Nunez', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Nunez Community College');
});

Given('a coverage check of Nunez PSYC 1100 toward LSU', function () {
  this.report = check('Nunez Community College', 'PSYC 1100', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at Nunez with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of RPCC ENGL 1013 toward the Louisiana State University of New Orleans', function () {
  this.report = check('River Parishes Community College', 'ENGL 1013', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward RPCC', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'River Parishes Community College');
});

Given('a coverage check of RPCC PSYC 2013 toward LSU', function () {
  this.report = check('River Parishes Community College', 'PSYC 2013', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at RPCC with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of BPCC ENGL 101 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Bossier Parish Community College', 'ENGL 101', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward BPCC', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Bossier Parish Community College');
});

Given('a coverage check of BPCC PSYC 201 toward LSU', function () {
  this.report = check('Bossier Parish Community College', 'PSYC 201', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at BPCC with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of SOWELA ENGL 1010 toward the Louisiana State University of New Orleans', function () {
  this.report = check('SOWELA Technical Community College', 'ENGL 1010', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward SOWELA', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'SOWELA Technical Community College');
});

Given('a coverage check of SOWELA PSYC 2010 toward LSU', function () {
  this.report = check('SOWELA Technical Community College', 'PSYC 2010', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at SOWELA with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of Fletcher ENGL 1010 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Fletcher Technical Community College', 'ENGL 1010', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward Fletcher', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Fletcher Technical Community College');
});

Given('a coverage check of Fletcher PSYC 2010 toward LSU', function () {
  this.report = check('Fletcher Technical Community College', 'PSYC 2010', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at Fletcher with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of Louisiana Delta ENGL 101 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Louisiana Delta Community College', 'ENGL 101', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward Louisiana Delta', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Louisiana Delta Community College');
});

Given('a coverage check of Louisiana Delta PSYC 201 toward LSU', function () {
  this.report = check('Louisiana Delta Community College', 'PSYC 201', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at Louisiana Delta with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of Central Louisiana Tech ENGL 1010 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Central Louisiana Technical Community College', 'ENGL 1010', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward Central Louisiana Tech', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Central Louisiana Technical Community College');
});

Given('a coverage check of Central Louisiana Tech PSYC 2010 toward LSU', function () {
  this.report = check('Central Louisiana Technical Community College', 'PSYC 2010', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at Central Louisiana Tech with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of Northshore ENGL 1015 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Northshore Technical Community College', 'ENGL 1015', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward Northshore', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Northshore Technical Community College');
});

Given('a coverage check of Northshore PSYC 2015 toward LSU', function () {
  this.report = check('Northshore Technical Community College', 'PSYC 2015', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at Northshore with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of LSU Eunice ENGL 1001 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Louisiana State University at Eunice', 'ENGL 1001', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward LSU Eunice', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Louisiana State University at Eunice');
});

Given('a coverage check of LSU Eunice PSYC 2015 toward LSU', function () {
  this.report = check('Louisiana State University at Eunice', 'PSYC 2015', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at LSU Eunice with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Then('the result for {string} is a subject elective with {int} degree hours', function (code, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.dataStatus, 'subject-elective');
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of Northwest Louisiana Tech ENGL 1015 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Northwest Louisiana Technical Community College', 'ENGL 1015', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward Northwest Louisiana Tech', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Northwest Louisiana Technical Community College');
});

Given('a coverage check of Northwest Louisiana Tech PSYC 2015 toward LSU', function () {
  this.report = check('Northwest Louisiana Technical Community College', 'PSYC 2015', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at Northwest Louisiana Tech with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of Southern Shreveport SENL 101S toward the Louisiana State University of New Orleans', function () {
  this.report = check('Southern University Shreveport', 'SENL 101S', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward Southern Shreveport', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Southern University Shreveport');
});

Given('a coverage check of Southern Shreveport SPSY 201S toward LSU', function () {
  this.report = check('Southern University Shreveport', 'SPSY 201S', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at Southern Shreveport with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of Grambling ENG 101 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Grambling State University', 'ENG 101', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward Grambling', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Grambling State University');
});

Given('a coverage check of Grambling PSY 200 toward LSU', function () {
  this.report = check('Grambling State University', 'PSY 200', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at Grambling with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of LSUA ENGL 1001 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Louisiana State University at Alexandria', 'ENGL 1001', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward LSUA', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Louisiana State University at Alexandria');
});

Given('a coverage check of LSUA PSYC 2000 toward LSU', function () {
  this.report = check('Louisiana State University at Alexandria', 'PSYC 2000', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at LSUA with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of LSUS ENGL 105 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Louisiana State University Shreveport', 'ENGL 105', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward LSUS', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Louisiana State University Shreveport');
});

Given('a coverage check of LSUS PSYC 152 toward LSU', function () {
  this.report = check('Louisiana State University Shreveport', 'PSYC 152', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at LSUS with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of McNeese ENGL 101 toward the Louisiana State University of New Orleans', function () {
  this.report = check('McNeese State University', 'ENGL 101', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward McNeese', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'McNeese State University');
});

Given('a coverage check of McNeese PSYC 101 toward LSU', function () {
  this.report = check('McNeese State University', 'PSYC 101', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at McNeese with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of Nicholls ENGL 101 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Nicholls State University', 'ENGL 101', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward Nicholls', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Nicholls State University');
});

Given('a coverage check of Nicholls PSYC 101 toward LSU', function () {
  this.report = check('Nicholls State University', 'PSYC 101', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at Nicholls with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of Southern SENL 101B toward the Louisiana State University of New Orleans', function () {
  this.report = check('Southern University and A&M College', 'SENL 101B', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward Southern', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Southern University and A&M College');
});

Given('a coverage check of Southern SPSY 201B toward LSU', function () {
  this.report = check('Southern University and A&M College', 'SPSY 201B', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at Southern with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of SUNO SENL 101N toward the Louisiana State University of New Orleans', function () {
  this.report = check('Southern University at New Orleans', 'SENL 101N', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward SUNO', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'Southern University at New Orleans');
});

Given('a coverage check of SUNO SPSY 201N toward LSU', function () {
  this.report = check('Southern University at New Orleans', 'SPSY 201N', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at SUNO with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of UL Monroe ENGL 1001 toward the Louisiana State University of New Orleans', function () {
  this.report = check('University of Louisiana at Monroe', 'ENGL 1001', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Delgado ENGL 101 toward UL Monroe', function () {
  this.report = check('Delgado Community College', 'ENGL 101', 'University of Louisiana at Monroe');
});

Given('a coverage check of UL Monroe PSYC 2001 toward LSU', function () {
  this.report = check('University of Louisiana at Monroe', 'PSYC 2001', 'Louisiana State University and A&M College');
});

Then('the result for {string} shows as {string} at UL Monroe with {int} degree hours', function (code, shownAs, hours) {
  const r = this.report.courseResults.find((x) => x.code === code);
  assert.ok(r, 'expected a result for ' + code);
  assert.strictEqual(r.shownAs, shownAs);
  assert.strictEqual(r.degreeCredit, hours);
});

Given('a coverage check of Centenary ENGL 101 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Centenary College of Louisiana', 'ENGL 101', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Centenary PSY 101 toward LSU', function () {
  this.report = check('Centenary College of Louisiana', 'PSY 101', 'Louisiana State University and A&M College');
});

Given('a coverage check of Delgado ENGL 101 toward Centenary', function () {
  this.report = runCheck({
    target: { name: 'Centenary College of Louisiana', isPublic: false },
    targetCollege: 'Centenary College of Louisiana',
    sources: [{ institution: 'Delgado Community College', courses: [{ code: 'ENGL 101' }] }],
    programType: 'general',
  });
});

Then('the report marks every course as verify individually', function () {
  assert.strictEqual(this.report.allCoursesVerifyIndividually, true);
});

Given('a coverage check of FranU WRIT 1310 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Franciscan Missionaries of Our Lady University', 'WRIT 1310', 'Louisiana State University of New Orleans');
});

Given('a coverage check of FranU PSYC 1310 toward LSU', function () {
  this.report = check('Franciscan Missionaries of Our Lady University', 'PSYC 1310', 'Louisiana State University and A&M College');
});

Given('a coverage check of Delgado ENGL 101 toward Franciscan Missionaries', function () {
  this.report = runCheck({
    target: { name: 'Franciscan Missionaries of Our Lady University', isPublic: false },
    targetCollege: 'Franciscan Missionaries of Our Lady University',
    sources: [{ institution: 'Delgado Community College', courses: [{ code: 'ENGL 101' }] }],
    programType: 'general',
  });
});

Given('a coverage check of Louisiana Christian EN 101 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Louisiana Christian University', 'EN 101', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Louisiana Christian PY 220 toward LSU', function () {
  this.report = check('Louisiana Christian University', 'PY 220', 'Louisiana State University and A&M College');
});

Given('a coverage check of Delgado ENGL 101 toward Louisiana Christian', function () {
  this.report = runCheck({
    target: { name: 'Louisiana Christian University', isPublic: false },
    targetCollege: 'Louisiana Christian University',
    sources: [{ institution: 'Delgado Community College', courses: [{ code: 'ENGL 101' }] }],
    programType: 'general',
  });
});

Given('a coverage check of Delgado ENGL 101 and ENGL 102 toward Loyola', function () {
  this.report = runCheck({
    target: { name: 'Loyola University New Orleans', isPublic: false },
    targetCollege: 'Loyola University New Orleans',
    sources: [{ institution: 'Delgado Community College', courses: [{ code: 'ENGL 101' }, { code: 'ENGL 102' }] }],
    programType: 'general',
  });
});

Given('a coverage check of Loyola ENGL A100 toward the Louisiana State University of New Orleans', function () {
  this.report = check('Loyola University New Orleans', 'ENGL A100', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Loyola PSYC A100 toward LSU', function () {
  this.report = check('Loyola University New Orleans', 'PSYC A100', 'Louisiana State University and A&M College');
});

Given('a coverage check of Delgado ENGL 101 toward Loyola', function () {
  this.report = runCheck({
    target: { name: 'Loyola University New Orleans', isPublic: false },
    targetCollege: 'Loyola University New Orleans',
    sources: [{ institution: 'Delgado Community College', courses: [{ code: 'ENGL 101' }] }],
    programType: 'general',
  });
});

Given('a coverage check of Holy Cross ENG 101 toward the Louisiana State University of New Orleans', function () {
  this.report = check('University of Holy Cross', 'ENG 101', 'Louisiana State University of New Orleans');
});

Given('a coverage check of Holy Cross PSY 101 toward LSU', function () {
  this.report = check('University of Holy Cross', 'PSY 101', 'Louisiana State University and A&M College');
});

Given('a coverage check of Delgado ENGL 101 toward Holy Cross', function () {
  this.report = runCheck({
    target: { name: 'University of Holy Cross', isPublic: false },
    targetCollege: 'University of Holy Cross',
    sources: [{ institution: 'Delgado Community College', courses: [{ code: 'ENGL 101' }] }],
    programType: 'general',
  });
});
