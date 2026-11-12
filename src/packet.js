'use strict';

// Apply-ready packet (Stage 25, applications theme).
//
// Turns a transfer degree plan into the packet a family acts on:
// the courses, semester by semester, with the code each college
// uses; where to apply for dual enrollment (ApplyDE where the
// college takes it, the state's common application the Regents
// are rolling out); the target college's published application
// deadlines; and the transcript step families most often get
// wrong (the official college transcript carries the credit, not
// the high school transcript). Every route and date comes from
// data/applications.json, harvested from the colleges' own pages.
// A college missing from that data yields an honest partial
// packet, never an invented link or date.

function deadlineText(entry) {
  return entry.kind
    ? `${entry.term}: ${entry.date} (${entry.kind})`
    : `${entry.term}: ${entry.date}`;
}

function buildPacket(plan, applicationsData) {
  const apps = (applicationsData && applicationsData.colleges) || {};
  const stateLinks = (applicationsData && applicationsData.stateLinks) || {};
  const sourceApp = apps[plan.sourceCollege] || null;
  const targetApp = apps[plan.targetCollege] || null;

  const courses = [];
  for (const sem of plan.semesters || []) {
    for (const c of sem.courses) {
      courses.push({
        semester: sem.number,
        sourceCode: c.sourceCode,
        sourceTitle: c.sourceTitle,
        targetCode: c.targetCode,
        targetTitle: c.targetTitle,
        hours: c.hours,
      });
    }
  }

  const steps = [];
  if (plan.sourceCollege && plan.status !== 'cannot-plan') {
    const de = sourceApp && sourceApp.dualEnrollment;
    if (de && de.onApplyDE) {
      steps.push({
        title: `Apply for dual enrollment at ${plan.sourceCollege}`,
        detail: `Apply through ApplyDE, the state's common dual enrollment application. ${de.note || ''} ${de.deadlineNote || ''}`.trim(),
        url: stateLinks.applyDE || de.applyUrl,
      });
    } else if (de && de.infoUrl) {
      steps.push({
        title: `Apply for dual enrollment at ${plan.sourceCollege}`,
        detail: (de.note || '') + (de.deadlineNote ? ' ' + de.deadlineNote : ''),
        url: de.infoUrl,
      });
    }
    steps.push({
      title: `Take these ${courses.length} courses at ${plan.sourceCollege}`,
      detail: `${plan.totalHours} credit hours in the order listed, semester by semester. Each one is matched to ${plan.targetCollege} in the statewide course data.`,
      url: null,
    });
  }
  if (plan.targetCollege && plan.status !== 'cannot-plan') {
    const admission = targetApp && targetApp.admission;
    steps.push({
      title: `Send your official ${plan.sourceCollege} transcript to ${plan.targetCollege}`,
      detail: (admission && admission.transcriptNote) ||
        'Ask the college that awarded the credit to send the official transcript with final grades. High school transcripts cannot be used to award college credit.',
      url: null,
    });
    if (admission) {
      const dl = (admission.deadlines || []).map(deadlineText).join('; ');
      steps.push({
        title: `Apply for admission at ${plan.targetCollege}`,
        detail: `Published deadlines: ${dl}. ${admission.basis || ''} ${admission.fee || ''}`.trim(),
        url: admission.applyUrl || null,
      });
    } else {
      steps.push({
        title: `Apply for admission at ${plan.targetCollege}`,
        detail: 'This college is not in the application data yet, so no deadlines are printed here. Check the college admissions page for its current dates.',
        url: null,
      });
    }
  }

  return {
    status: targetApp && targetApp.admission ? 'ready' : 'partial-data',
    sourceCollege: plan.sourceCollege,
    targetCollege: plan.targetCollege,
    planStatus: plan.status,
    courses,
    totalHours: plan.totalHours || 0,
    savings: plan.savings || null,
    deadlines: targetApp && targetApp.admission ? targetApp.admission.deadlines || [] : [],
    steps,
    stateLinks,
    sources: (applicationsData && applicationsData.sources) || [],
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildPacket, deadlineText };
}
if (typeof window !== 'undefined') {
  window.buildPacket = buildPacket;
}
