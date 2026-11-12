'use strict';

// Stage 30 (Nov 11, 2026): career pathways. A pathway is one of the
// Louisiana Board of Regents Universal Transfer Pathways: 60 hours
// that transfer and apply toward the named bachelor's degree at any
// Louisiana public university offering it (Act 308 of 2022). This
// engine takes a pathway, the college the student attends now, the
// university they aim for, and the statewide numbers they have
// already earned, and answers, requirement by requirement: what
// satisfies it at your college, does it count at your target, what
// is already done, and what to take next semester. Every fact comes
// from the published pathway document, the statewide common course
// catalog, and the colleges' verified course data. A requirement
// with no satisfying course in the source college's data is a named
// gap, never a guess. When the target university is not covered in
// the data yet, countsAtTarget is null rather than invented.

function hoursOf(lccn, statewideByLccn) {
  const entry = statewideByLccn[lccn];
  if (entry && entry.hours) return entry.hours;
  const last = parseInt(lccn.slice(-1), 10);
  return Number.isNaN(last) ? 0 : last;
}

function buildPathwayPlan(request, data) {
  const pathway = (data.pathways.pathways || []).find((p) => p.id === request.pathwayId);
  if (!pathway) return { status: 'unknown-pathway', pathwayId: request.pathwayId };

  const colleges = data.courses.colleges || {};
  const source = colleges[request.sourceCollege];
  if (!source) return { status: 'unknown-source-college', pathwayId: pathway.id };
  const target = colleges[request.targetCollege] || null;
  const targetCovered = Boolean(target);
  const targetLccns = new Set();
  if (target) for (const c of target.courses) for (const l of c.lccns) targetLccns.add(l);

  const statewideByLccn = {};
  for (const c of data.statewide.courses || []) statewideByLccn[c.lccn] = c;
  const allStatewide = Object.keys(statewideByLccn).sort();

  const taken = new Set(request.takenLccns || []);
  const usedTaken = new Set();
  const usedSourceLccns = new Set();

  const sourceByLccn = {};
  for (const course of source.courses) {
    for (const l of course.lccns) {
      if (!sourceByLccn[l]) sourceByLccn[l] = [];
      sourceByLccn[l].push(course);
    }
  }

  // Choice candidates come from the statewide catalog AND from the
  // source college's own matrix record: the matrix carries real
  // statewide numbers the common course catalog's 292 do not list
  // (for example CART 1123, 3-D Design), and a course the college
  // actually offers must be pickable.
  const choicePool = Array.from(new Set([...allStatewide, ...Object.keys(sourceByLccn)])).sort();

  function candidatesFor(req) {
    if (req.lccns) return req.lccns.slice();
    if (req.collegeSelected) return allStatewide.slice();
    if (req.choice && req.choice.lccns) {
      const excludes = new Set(req.choice.excludeLccns || []);
      const listed = req.choice.lccns.filter((l) => !excludes.has(l));
      if (req.choice.rubrics) {
        const extra = choicePool.filter((l) => req.choice.rubrics.includes(l.split(' ')[0]) && !excludes.has(l) && !listed.includes(l));
        return listed.concat(extra);
      }
      return listed;
    }
    const rubrics = (req.choice && req.choice.rubrics) || [];
    const excludes = new Set((req.choice && req.choice.excludeLccns) || []);
    return choicePool.filter((l) => rubrics.includes(l.split(' ')[0]) && !excludes.has(l));
  }

  const requirements = pathway.requirements.map((req) => {
    const candidates = candidatesFor(req);
    let takenHours = 0;
    const takenMatches = [];
    for (const l of candidates) {
      if (takenHours >= req.hours) break;
      if (taken.has(l) && !usedTaken.has(l)) {
        usedTaken.add(l);
        takenMatches.push(l);
        takenHours += hoursOf(l, statewideByLccn);
      }
    }
    let remaining = req.hours - takenHours;
    const picks = [];
    if (remaining > 0) {
      const options = [];
      for (const l of candidates) {
        if (usedSourceLccns.has(l) || usedTaken.has(l)) continue;
        const courses = sourceByLccn[l];
        if (!courses) continue;
        for (const course of courses) {
          options.push({ lccn: l, code: course.code, title: course.title, hours: hoursOf(l, statewideByLccn) });
        }
      }
      if (req.collegeSelected && targetCovered) {
        options.sort((a, b) => {
          const ca = targetLccns.has(a.lccn) ? 0 : 1;
          const cb = targetLccns.has(b.lccn) ? 0 : 1;
          if (ca !== cb) return ca - cb;
          return a.lccn === b.lccn ? (a.code < b.code ? -1 : 1) : (a.lccn < b.lccn ? -1 : 1);
        });
      } else {
        options.sort((a, b) => (a.lccn === b.lccn ? (a.code < b.code ? -1 : 1) : (a.lccn < b.lccn ? -1 : 1)));
      }
      const seenCodes = new Set();
      for (const opt of options) {
        if (remaining <= 0) break;
        if (seenCodes.has(opt.code)) continue;
        seenCodes.add(opt.code);
        usedSourceLccns.add(opt.lccn);
        picks.push({
          lccn: opt.lccn,
          sourceCode: opt.code,
          sourceTitle: opt.title,
          hours: opt.hours,
          countsAtTarget: targetCovered ? targetLccns.has(opt.lccn) : null,
        });
        remaining -= opt.hours;
      }
    }
    const coveredByPicks = req.hours - takenHours - Math.max(remaining, 0);
    let status;
    if (remaining <= 0 && takenHours >= req.hours) status = 'taken';
    else if (remaining <= 0) status = 'available';
    else if (coveredByPicks > takenHours) status = 'partial';
    else status = 'gap';
    if (takenHours > 0 && remaining > 0 && coveredByPicks > takenHours) status = 'partial';
    if (takenHours > 0 && remaining > 0 && coveredByPicks === takenHours) status = 'gap';
    return {
      label: req.label,
      area: req.area,
      hours: req.hours,
      takenHours,
      takenLccns: takenMatches,
      picks,
      status,
    };
  });

  let totalHours = 0;
  let takenHoursTotal = 0;
  let gapHours = 0;
  for (const r of requirements) {
    totalHours += r.hours;
    takenHoursTotal += r.takenHours;
    if (r.status === 'gap' || r.status === 'partial') {
      const pickHours = r.picks.reduce((s, p) => s + p.hours, 0);
      gapHours += Math.max(r.hours - r.takenHours - pickHours, 0);
    }
  }

  const nextSemester = [];
  let semesterHours = 0;
  let semesterFull = false;
  for (const r of requirements) {
    if (semesterFull) break;
    for (const pick of r.picks) {
      if (semesterHours + pick.hours > 15) { semesterFull = true; break; }
      nextSemester.push({ label: r.label, ...pick });
      semesterHours += pick.hours;
    }
  }

  return {
    status: takenHoursTotal >= totalHours ? 'pathway-complete' : gapHours === 0 ? 'on-pathway' : 'pathway-has-gaps',
    pathwayId: pathway.id,
    pathwayName: pathway.name,
    careers: pathway.careers,
    sourceCollege: request.sourceCollege,
    targetCollege: request.targetCollege,
    targetCovered,
    totalHours,
    takenHours: takenHoursTotal,
    gapHours,
    requirements,
    nextSemester,
    nextSemesterHours: semesterHours,
  };
}

module.exports = { buildPathwayPlan };
