'use strict';

// Dual enrollment eligibility check (Stage 26, access theme).
//
// Answers the question a family asks before anything else: can
// my student take dual enrollment at this college yet? The rules
// come from data/eligibility.json, harvested from the colleges'
// own published criteria and the Board of Regents Policy 2.22
// statewide floor. A college may add criteria above the floor
// (UL Lafayette does: juniors need a 2.75 GPA, seniors a 2.50).
// Verdicts stay in the product's discipline: eligible means the
// published minimums are met, never that the college has admitted
// the student; not-yet names the exact requirement that is
// missing; cannot-tell names the information still needed.

function has(v) {
  return v !== undefined && v !== null && v !== '';
}

function actParts(act, subjectOnly) {
  const parts = [];
  if (act.composite) parts.push(['actComposite', act.composite]);
  if (act.english) parts.push(['actEnglish', act.english]);
  if (act.math) parts.push(['actMath', act.math]);
  if (subjectOnly === 'english') return parts.filter(([key]) => key === 'actEnglish');
  if (subjectOnly === 'math') return parts.filter(([key]) => key === 'actMath');
  return parts;
}

function scorePath(student, act, subjectOnly) {
  // Returns 'met', 'below', or 'unknown' for the ACT minimums.
  // 'met' requires every evaluated score to be on file and at or
  // above its minimum: a partial set of scores never reads as met.
  if (!act) return 'unknown';
  const parts = actParts(act, subjectOnly);
  if (!parts.length) return 'unknown';
  const any = parts.some(([key]) => has(student[key]));
  if (!any) return 'unknown';
  const below = parts.some(([key, min]) => has(student[key]) && student[key] < min);
  if (below) return 'below';
  return parts.every(([key]) => has(student[key])) ? 'met' : 'unknown';
}

function evaluateEligibility(college, student, eligibilityData) {
  const data = (eligibilityData && eligibilityData.colleges) || {};
  const rules = data[college];
  const base = { college, basis: rules ? rules.basis : null, sourceName: rules ? rules.sourceName : null, notes: [] };
  if (!rules) {
    return { ...base, status: 'cannot-tell', met: [], missing: [], unknown: [college],
      reason: `No published eligibility rules for ${college} are in the data yet.` };
  }
  if (rules.gradeLevelNote) base.notes.push(rules.gradeLevelNote);

  const met = [];
  const missing = [];
  const unknown = [];

  // Grade level. A college with published grade levels is held to
  // them; the Policy 2.22 state floor sets no grade levels, so a
  // college read on the floor alone (no gradeLevels in its data)
  // is not blocked by grade.
  const grade = student.gradeLevel;
  if (!has(grade)) {
    unknown.push('grade level');
  } else if (college === 'Delgado Community College' && grade === 'sophomore') {
    base.notes.push('Sophomores may be eligible in some instances at Delgado; the college decides case by case.');
  } else if (rules.gradeLevels && !rules.gradeLevels.includes(grade)) {
    missing.push(`Grade level: this program takes ${rules.gradeLevels.join(' and ')} students`);
  } else {
    met.push(`Grade level: ${grade}`);
  }

  // UL Lafayette: GPA by grade level, then subject minimums.
  if (rules.minGpaByGrade) {
    const min = grade ? rules.minGpaByGrade[grade] : null;
    if (!has(student.gpa)) unknown.push('high school GPA');
    else if (min == null) unknown.push('grade level (the GPA minimum depends on it)');
    else if (student.gpa >= min) met.push(`GPA ${student.gpa} meets the ${min} minimum for a ${grade}`);
    else missing.push(`A ${min} cumulative GPA for a ${grade} (yours: ${student.gpa})`);

    if (student.subject === 'english' || student.subject === 'math') {
      const sm = rules.subjectMinimums[student.subject];
      const val = student.subject === 'english' ? student.actEnglish : student.actMath;
      if (!has(val)) unknown.push(sm.label);
      else if (val >= sm.act) met.push(sm.label);
      else missing.push(`${sm.label} (yours: ${val})`);
    } else {
      base.notes.push('Subject minimums also apply: ' + rules.subjectMinimums.english.label + '; ' + rules.subjectMinimums.math.label + '.');
    }
    return finish(base, met, missing, unknown);
  }

  // Track based rules (Delgado, LSUNO state floor).
  const trackName = student.track === 'technical' ? 'technical' : 'academic';
  const track = (rules.tracks || {})[trackName];
  if (!track) {
    return { ...base, status: 'cannot-tell', met, missing, unknown: [trackName + ' track rules'],
      reason: `No ${trackName} track rules for ${college} are in the data yet.` };
  }
  if (!has(student.gpa)) {
    unknown.push('high school GPA');
  } else if (student.gpa >= track.minGpa) {
    met.push(`GPA ${student.gpa} meets the ${track.minGpa} minimum`);
  } else if (trackName === 'technical' && track.counselorRecommendationAlternative && student.counselorRecommendation) {
    // Policy 2.22 makes a counselor recommendation its own path
    // for technical courses. For academic courses it never waives
    // the GPA floor: it stands in for the subject test scores, or
    // pairs with a 3.0 subject-area GPA this check does not score.
    met.push('Counselor recommendation on file, a state eligibility path for technical courses');
  } else {
    missing.push(`A GPA of at least ${track.minGpa} (yours: ${student.gpa})`);
    if (trackName === 'academic') {
      base.notes.push('The state also counts a 3.0 subject-area GPA with a counselor recommendation, a 2.5 college GPA from earlier dual enrollment courses, and the thresholds of an approved Early College Academy. This quick check does not score those paths.');
    }
  }

  if (track.act) {
    // On the state floor the Policy 2.22 Figure 1 minimums are
    // subject specific, so when the student named a subject only
    // that subject's score is scored. A college's own published
    // floor (Delgado) is scored on every score it publishes.
    const subjectOnly = rules.stateFloor && (student.subject === 'english' || student.subject === 'math')
      ? student.subject : null;
    const path = scorePath(student, track.act, subjectOnly);
    if (path === 'met') {
      met.push(subjectOnly
        ? `ACT ${subjectOnly === 'english' ? 'English' : 'Math'} minimum met for the subject`
        : 'ACT minimums met (composite, English, and Math as published)');
    } else if (path === 'below') {
      if (track.counselorRecommendationAlternative && student.counselorRecommendation) {
        met.push('Counselor recommendation covers the test score minimums');
      } else {
        const lows = [];
        for (const [key, min] of actParts(track.act, subjectOnly)) {
          if (has(student[key]) && student[key] < min) {
            const label = key === 'actComposite' ? 'ACT composite' : key === 'actEnglish' ? 'ACT English' : 'ACT Math';
            lows.push(`${label} ${min} (yours: ${student[key]})`);
          }
        }
        missing.push(...lows);
      }
    } else if (track.counselorRecommendationAlternative && student.counselorRecommendation) {
      met.push('Counselor recommendation on file (test scores not needed on this path)');
    } else {
      unknown.push('ACT scores, or a counselor recommendation');
    }
  } else if (track.counselorRecommendationAlternative && trackName === 'academic' && rules.stateFloor) {
    // State floor, second element: subject scores or recommendation.
    if (student.counselorRecommendation) met.push('Counselor recommendation on file');
    else unknown.push('subject test scores, or a counselor recommendation');
  }

  return finish(base, met, missing, unknown);
}

function finish(base, met, missing, unknown) {
  const status = missing.length ? 'not-yet' : unknown.length ? 'cannot-tell' : 'eligible';
  return { ...base, status, met, missing, unknown };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { evaluateEligibility };
}
if (typeof window !== 'undefined') {
  window.evaluateEligibility = evaluateEligibility;
}
