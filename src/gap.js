'use strict';

// Stage 66 (Nov 17, 2026): what-to-take-next gap analysis.
//
// A check that only looks backward is half the product. Given the
// courses a student has already taken at one college and the
// university they aim for, this engine computes what is still owed
// and lists courses at the student's own college whose credits are
// guaranteed to count at the target. Guaranteed has the same
// meaning it has everywhere in this product: the target college
// lists a course under the same statewide common course number
// (LCCN) in the verified data, and the target is a Louisiana
// public institution the state guarantee binds. At a private
// target nothing is marked as counting; the university decides.
//
// Two bases:
// - With a transcribed Universal Transfer Pathway, the work is
//   requirement by requirement, delegated to the pathways engine
//   (src/pathways.js) with the taken courses resolved to LCCNs at
//   the source college.
// - Without one, the fallback is the 39 hour general education
//   block of the Louisiana Transfer Degree (data/transfer-degree
//   .json), area by area, with the natural sciences branch rule
//   the planner uses.
//
// A requirement or area with no satisfying course in the verified
// data is a named gap with unfilled hours, never a guess. A target
// outside the course data cannot be verified, and the engine says
// so instead of marking courses as counting there.

let buildPathwayPlan = null;
if (typeof module !== 'undefined' && module.exports) {
  buildPathwayPlan = require('./pathways').buildPathwayPlan;
}

function resolveInCollege(college, code) {
  const norm = String(code || '').toUpperCase().replace(/\s+/g, ' ').trim();
  let hit = college.courses.find((c) => c.code === norm);
  if (!hit) {
    const m = norm.match(/^([A-Z]+) (\d{4})$/);
    if (m && m[2].endsWith('0')) {
      hit = college.courses.find((c) => c.code === m[1] + ' ' + m[2].slice(0, 3));
    }
  }
  return hit || null;
}

function courseByLccn(college) {
  const byLccn = new Map();
  const sorted = [...college.courses].sort((a, b) => a.code.localeCompare(b.code));
  for (const course of sorted) {
    for (const lccn of course.lccns || []) {
      if (!byLccn.has(lccn)) byLccn.set(lccn, course);
    }
  }
  return byLccn;
}

function hoursOf(lccn, statewideByLccn) {
  const entry = statewideByLccn && statewideByLccn[lccn];
  if (entry && entry.hours) return entry.hours;
  const digits = (String(lccn).split(' ')[1] || '').trim();
  const hours = parseInt(digits.charAt(3), 10);
  return Number.isFinite(hours) ? hours : 0;
}

function rubricOf(lccn) {
  return String(lccn).split(' ')[0];
}

function branchOf(area, lccn) {
  if (!area.branches) return undefined;
  if (area.branches.biological.includes(rubricOf(lccn))) return 'biological';
  if (area.branches.physical.includes(rubricOf(lccn))) return 'physical';
  return undefined;
}

function sciencesMet(area, entries) {
  const total = entries.reduce((s, e) => s + e.hours, 0);
  if (total < area.minHours) return false;
  const biological = entries.filter((e) => e.branch === 'biological').reduce((s, e) => s + e.hours, 0);
  const physical = entries.filter((e) => e.branch === 'physical').reduce((s, e) => s + e.hours, 0);
  if (biological === 0 || physical === 0) return false;
  const byRubric = {};
  for (const e of entries) byRubric[rubricOf(e.lccn)] = (byRubric[rubricOf(e.lccn)] || 0) + e.hours;
  return Math.max(...Object.values(byRubric)) >= (area.sameScienceMinHours || 0);
}

function buildGapPlan(request, data) {
  const colleges = (data.courses && data.courses.colleges) || {};
  const source = colleges[request.sourceCollege];
  if (!source) {
    return {
      status: 'unknown-source-college',
      sourceCollege: request.sourceCollege,
      targetCollege: request.targetCollege,
    };
  }
  const target = colleges[request.targetCollege] || null;
  const targetCovered = Boolean(target);
  const targetTypes = data.targetTypes || {};
  const guaranteeApplies = targetTypes[request.targetCollege] !== 'private';

  const statewideByLccn = {};
  for (const c of (data.statewide && data.statewide.courses) || []) statewideByLccn[c.lccn] = c;

  const takenLccns = new Set();
  const unresolvedTaken = [];
  for (const code of request.takenCourses || []) {
    const hit = resolveInCollege(source, code);
    if (!hit) { unresolvedTaken.push(code); continue; }
    for (const l of hit.lccns || []) takenLccns.add(l);
  }

  const targetByLccn = target ? courseByLccn(target) : new Map();
  const base = {
    sourceCollege: request.sourceCollege,
    targetCollege: request.targetCollege,
    targetCovered,
    guaranteeApplies,
    unresolvedTaken,
  };

  if (request.pathwayId) {
    if (!buildPathwayPlan) return { ...base, status: 'pathway-unavailable', basis: 'pathway', pathwayId: request.pathwayId };
    const plan = buildPathwayPlan(
      {
        pathwayId: request.pathwayId,
        sourceCollege: request.sourceCollege,
        targetCollege: request.targetCollege,
        takenLccns: [...takenLccns],
      },
      data
    );
    if (plan.status === 'unknown-pathway') {
      return { ...base, status: 'unknown-pathway', basis: 'pathway', pathwayId: request.pathwayId };
    }
    const requirements = plan.requirements.map((r) => ({
      label: r.label,
      area: r.area,
      hours: r.hours,
      takenHours: r.takenHours,
      remainingHours: Math.max(r.hours - r.takenHours, 0),
      status: r.status,
      coursesToTake: (r.picks || []).map((p) => ({
        lccn: p.lccn,
        sourceCode: p.sourceCode,
        sourceTitle: p.sourceTitle,
        targetCode: targetByLccn.has(p.lccn) ? targetByLccn.get(p.lccn).code : null,
        hours: p.hours,
        countsAtTarget: guaranteeApplies ? p.countsAtTarget : null,
      })),
    }));
    return {
      ...base,
      status: 'ok',
      basis: 'pathway',
      pathwayId: plan.pathwayId,
      pathwayName: plan.pathwayName,
      document: plan.document,
      documentUrl: plan.documentUrl,
      totalHours: plan.totalHours,
      takenHours: plan.takenHours,
      remainingHours: plan.totalHours - plan.takenHours,
      requirements,
      nextSemester: (plan.nextSemester || []).map((p) => ({
        label: p.label,
        lccn: p.lccn,
        sourceCode: p.sourceCode,
        sourceTitle: p.sourceTitle,
        targetCode: targetByLccn.has(p.lccn) ? targetByLccn.get(p.lccn).code : null,
        hours: p.hours,
        countsAtTarget: guaranteeApplies ? p.countsAtTarget : null,
      })),
      nextSemesterHours: plan.nextSemesterHours,
    };
  }

  // General education fallback: the 39 hour block, area by area.
  const framework = data.framework;
  if (!framework) return { ...base, status: 'no-framework-data', basis: 'general-education' };
  if (!targetCovered) return { ...base, status: 'target-not-covered', basis: 'general-education' };

  const sourceByLccn = courseByLccn(source);
  const matched = [...sourceByLccn.keys()]
    .filter((lccn) => targetByLccn.has(lccn))
    .sort()
    .map((lccn) => ({
      lccn,
      hours: hoursOf(lccn, statewideByLccn),
      sourceCourse: sourceByLccn.get(lccn),
      targetCourse: targetByLccn.get(lccn),
    }));

  const usedTaken = new Set();
  const usedPicks = new Set();
  const requirements = [];
  let totalHours = 0;
  let takenHoursTotal = 0;

  for (const area of framework.areas) {
    const pool = matched
      .filter((c) => {
        if (area.lccns) return area.lccns.includes(c.lccn);
        if (!(area.rubrics || []).includes(rubricOf(c.lccn))) return false;
        if ((area.excludeLccns || []).includes(c.lccn)) return false;
        return true;
      })
      .map((c) => {
        const entry = { ...c };
        const branch = branchOf(area, c.lccn);
        if (branch) entry.branch = branch;
        return entry;
      });

    const takenMatches = [];
    for (const c of pool) {
      if (takenLccns.has(c.lccn) && !usedTaken.has(c.lccn)) {
        usedTaken.add(c.lccn);
        takenMatches.push(c);
      }
    }
    const takenHours = takenMatches.reduce((s, c) => s + c.hours, 0);
    const takenMet = area.branches ? sciencesMet(area, takenMatches) : takenHours >= area.minHours;

    const picks = [];
    if (!takenMet) {
      const rest = () => pool.filter((c) => !takenLccns.has(c.lccn) && !usedPicks.has(c.lccn) && !picks.includes(c));
      const pickHours = () => picks.reduce((s, c) => s + c.hours, 0);
      const metWithPicks = () => (area.branches
        ? sciencesMet(area, [...takenMatches, ...picks])
        : takenHours + pickHours() >= area.minHours);
      // Fill to the area minimum first.
      for (const c of rest()) {
        if (takenHours + pickHours() >= area.minHours) break;
        picks.push(c);
      }
      // Then repair the branch rule (both sciences, one sequence),
      // the same repair the transfer degree planner runs.
      let guard = 0;
      while (area.branches && !metWithPicks() && rest().length > 0 && guard < 50) {
        guard += 1;
        const combined = [...takenMatches, ...picks];
        const biological = combined.filter((e) => e.branch === 'biological').reduce((s, e) => s + e.hours, 0);
        const physical = combined.filter((e) => e.branch === 'physical').reduce((s, e) => s + e.hours, 0);
        let next;
        if (biological === 0) next = rest().find((c) => c.branch === 'biological');
        else if (physical === 0) next = rest().find((c) => c.branch === 'physical');
        else {
          const byRubric = {};
          for (const e of combined) byRubric[rubricOf(e.lccn)] = (byRubric[rubricOf(e.lccn)] || 0) + e.hours;
          const topRubric = Object.entries(byRubric).sort((a, b) => b[1] - a[1])[0][0];
          next = rest().find((c) => rubricOf(c.lccn) === topRubric) || rest()[0];
        }
        if (!next) break;
        picks.push(next);
      }
      for (const c of picks) usedPicks.add(c.lccn);
    }

    const pickHoursTotal = picks.reduce((s, c) => s + c.hours, 0);
    const metWithPicks = area.branches
      ? sciencesMet(area, [...takenMatches, ...picks])
      : takenHours + pickHoursTotal >= area.minHours;
    let status;
    if (takenMet) status = 'met';
    else if (metWithPicks) status = 'available';
    else if (picks.length) status = 'partial';
    else status = 'gap';

    totalHours += area.minHours;
    takenHoursTotal += Math.min(takenHours, area.minHours);
    requirements.push({
      id: area.id,
      label: area.name,
      area: area.name,
      hours: area.minHours,
      takenHours,
      remainingHours: Math.max(area.minHours - takenHours, 0),
      unfilledHours: metWithPicks ? 0 : Math.max(area.minHours - takenHours - pickHoursTotal, 0),
      status,
      coursesToTake: picks.map((c) => ({
        lccn: c.lccn,
        sourceCode: c.sourceCourse.code,
        sourceTitle: c.sourceCourse.title,
        targetCode: c.targetCourse.code,
        hours: c.hours,
        countsAtTarget: guaranteeApplies ? true : null,
      })),
    });
  }

  const nextSemester = [];
  let semesterHours = 0;
  for (const r of requirements) {
    for (const pick of r.coursesToTake) {
      if (semesterHours + pick.hours > 15) break;
      nextSemester.push({ label: r.label, ...pick });
      semesterHours += pick.hours;
    }
    if (semesterHours >= 15) break;
  }

  return {
    ...base,
    status: 'ok',
    basis: 'general-education',
    totalHours,
    takenHours: takenHoursTotal,
    remainingHours: totalHours - takenHoursTotal,
    requirements,
    nextSemester,
    nextSemesterHours: semesterHours,
  };
}

module.exports = { buildGapPlan };
