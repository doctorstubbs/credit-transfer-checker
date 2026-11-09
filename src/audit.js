// The full audit: the printable document built from one check.
// Same engine output in, a structured audit document and a
// standalone printable HTML page out. No form elements ever
// appear in the printed document.

const LIMITS =
  'This audit is a planning check built from current college catalogs and the Louisiana articulation rules. ' +
  'It assumes every course was passed with a grade of C or better. ' +
  'It is not an official evaluation, and the receiving university makes the final call on every credit.';

function buildAudit(student, report) {
  const groupsByInstitution = new Map();
  const notCovered = [];
  let total = 0;

  for (const r of report.courseResults || []) {
    const institution = r.sourceInstitution || 'College not specified';
    if (!groupsByInstitution.has(institution)) {
      groupsByInstitution.set(institution, { institution, courses: [] });
    }
    const uncovered = r.dataStatus === 'not-in-data';
    const entry = {
      code: r.code,
      countsAs: r.shownAs,
      countsToward: r.countsToward || null,
      degreeCredit: r.degreeCredit === null || r.degreeCredit === undefined ? 0 : r.degreeCredit,
      condition: r.status === 'planned' ? r.condition || null : null,
      notCovered: uncovered
    };
    if (uncovered) notCovered.push({ code: r.code, sourceInstitution: institution });
    total += entry.degreeCredit;
    groupsByInstitution.get(institution).courses.push(entry);
  }

  const ap = (report.apResults || []).map((a) => {
    const credit = a.degreeCredit || 0;
    total += credit;
    return {
      exam: a.exam,
      score: a.score,
      outcome: a.outcome,
      countsAs: a.shownAs || null,
      countsToward: a.countsToward || null,
      degreeCredit: credit,
      note: a.note || null,
      higherScoreNote: a.higherScoreNote || null
    };
  });

  return {
    target: report.targetCollege || student.targetCollege,
    groups: [...groupsByInstitution.values()],
    ap,
    notCovered,
    totalDegreeCredits: total,
    limits: LIMITS
  };
}

function esc(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderAuditHtml(audit) {
  const parts = [];
  parts.push('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">');
  parts.push('<title>Credit Transfer Audit</title>');
  parts.push('<style>body{font-family:Georgia,serif;max-width:760px;margin:40px auto;padding:0 20px;color:#111}');
  parts.push('h1{font-size:26px;margin-bottom:4px}h2{font-size:19px;margin-top:28px}');
  parts.push('table{border-collapse:collapse;width:100%;margin-top:8px}th,td{border:1px solid #999;padding:6px 8px;text-align:left;font-size:15px}');
  parts.push('.total{font-size:18px;font-weight:bold;margin-top:24px}.limits{margin-top:32px;font-size:14px;color:#333}</style></head><body>');
  parts.push('<h1>Credit Transfer Audit</h1>');
  parts.push('<p>Target college: <strong>' + esc(audit.target) + '</strong></p>');

  for (const g of audit.groups) {
    parts.push('<h2>Courses from ' + esc(g.institution) + '</h2>');
    parts.push('<table><tr><th>Course</th><th>Counts as</th><th>Degree credit</th></tr>');
    for (const c of g.courses) {
      let countsAs = esc(c.countsAs);
      if (c.condition) countsAs += '<br>' + esc(c.condition);
      parts.push('<tr><td>' + esc(c.code) + '</td><td>' + countsAs + '</td><td>' + c.degreeCredit + '</td></tr>');
    }
    parts.push('</table>');
  }

  if (audit.ap.length) {
    parts.push('<h2>AP exams</h2>');
    parts.push('<table><tr><th>AP exam</th><th>Score</th><th>Result</th><th>Degree credit</th></tr>');
    for (const a of audit.ap) {
      let result;
      if (a.outcome === 'exact-equivalent') {
        result = 'Credit awarded: ' + esc(a.countsAs || a.countsToward || '') + '.' + (a.higherScoreNote ? ' ' + esc(a.higherScoreNote) : '');
      } else if (a.outcome === 'subject-elective') {
        result = 'Credit awarded as an elective in the subject. ' + esc(a.higherScoreNote || '');
      } else if (a.outcome === 'verify-individually') {
        result = esc(a.note || '');
      } else {
        result = 'No credit. ' + esc(a.note || '');
      }
      parts.push('<tr><td>' + esc(a.exam) + '</td><td>' + a.score + '</td><td>' + result + '</td><td>' + a.degreeCredit + '</td></tr>');
    }
    parts.push('</table>');
  }

  if (audit.notCovered.length) {
    parts.push('<h2>Not covered yet</h2>');
    parts.push('<p>' + audit.notCovered.map((c) => esc(c.code) + ' (from ' + esc(c.sourceInstitution) + ')').join(', ') +
      ': not in the course data yet, so this audit makes no call on ' +
      (audit.notCovered.length === 1 ? 'it' : 'them') + '. The receiving college can still evaluate ' +
      (audit.notCovered.length === 1 ? 'it' : 'them') + ' from a transcript or syllabus.</p>');
  }

  parts.push('<p class="total">Total degree credits that count at ' + esc(audit.target) + ': ' + audit.totalDegreeCredits + '</p>');
  parts.push('<p class="limits">' + esc(audit.limits) + '</p>');
  parts.push('</body></html>');
  return parts.join('\n');
}

module.exports = { buildAudit, renderAuditHtml };
