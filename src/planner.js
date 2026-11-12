'use strict';

let estimateSavings = null;
if (typeof module !== 'undefined' && module.exports) {
  estimateSavings = require('./savings').estimateSavings;
}

// Louisiana Transfer Degree planner.
//
// Builds a semester-by-semester plan toward the AALT/ASLT from courses
// verified at BOTH the source and the target college under a shared
// statewide common course number (LCCN). The planner never pads: an
// area with no verified matched course is reported as a named gap.
//
// Accuracy rules baked in:
// - hours come from the LCCN itself (the fourth digit of the course
//   number is the credit value, per the Statewide Common Course
//   Catalog naming rubric);
// - a course is only planned when the source college offers it and
//   the target college lists a course under the same LCCN;
// - the transfer degree guarantee is stated only on a complete plan.

function rubricOf(lccn) {
  return lccn.split(' ')[0];
}

function hoursOf(lccn) {
  const digits = (lccn.split(' ')[1] || '').trim();
  const hours = parseInt(digits.charAt(3), 10);
  return Number.isFinite(hours) ? hours : 0;
}

// First course (by code) a college lists under each LCCN.
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

function areaCandidates(area, matched) {
  return matched.filter((candidate) => {
    if (area.lccns) return area.lccns.includes(candidate.lccn);
    if (!(area.rubrics || []).includes(rubricOf(candidate.lccn))) return false;
    if ((area.excludeLccns || []).includes(candidate.lccn)) return false;
    return true;
  });
}

function branchOf(area, lccn) {
  if (!area.branches) return undefined;
  if (area.branches.biological.includes(rubricOf(lccn))) return 'biological';
  if (area.branches.physical.includes(rubricOf(lccn))) return 'physical';
  return undefined;
}

function naturalSciencesMet(area, picks) {
  const total = picks.reduce((sum, p) => sum + p.hours, 0);
  if (total < area.minHours) return false;
  const biological = picks
    .filter((p) => p.branch === 'biological')
    .reduce((sum, p) => sum + p.hours, 0);
  const physical = picks
    .filter((p) => p.branch === 'physical')
    .reduce((sum, p) => sum + p.hours, 0);
  if (biological === 0 || physical === 0) return false;
  const byRubric = {};
  for (const p of picks) byRubric[rubricOf(p.lccn)] = (byRubric[rubricOf(p.lccn)] || 0) + p.hours;
  return Math.max(...Object.values(byRubric)) >= (area.sameScienceMinHours || 0);
}

// After the greedy fill, keep adding science courses (deterministic
// order) until the branch and same-science rules hold, or the pool runs
// out and the area stays unmet.
function repairNaturalSciences(area, picks, pool) {
  const rest = () => pool.filter((c) => !picks.some((p) => p.lccn === c.lccn));
  let guard = 0;
  while (!naturalSciencesMet(area, picks) && rest().length > 0 && guard < 50) {
    guard += 1;
    const biological = picks
      .filter((p) => p.branch === 'biological')
      .reduce((sum, p) => sum + p.hours, 0);
    const physical = picks
      .filter((p) => p.branch === 'physical')
      .reduce((sum, p) => sum + p.hours, 0);
    let next;
    if (biological === 0) next = rest().find((c) => c.branch === 'biological');
    else if (physical === 0) next = rest().find((c) => c.branch === 'physical');
    else {
      const byRubric = {};
      for (const p of picks) byRubric[rubricOf(p.lccn)] = (byRubric[rubricOf(p.lccn)] || 0) + p.hours;
      const topRubric = Object.entries(byRubric).sort((a, b) => b[1] - a[1])[0][0];
      next = rest().find((c) => rubricOf(c.lccn) === topRubric) || rest()[0];
    }
    if (!next) break;
    picks.push(next);
  }
}

function buildPlan(input, data) {
  const { sourceCollege, targetCollege } = input;
  const { courses, framework, tuition } = data;
  const colleges = (courses && courses.colleges) || {};

  const source = colleges[sourceCollege];
  if (!source) {
    return {
      status: 'cannot-plan',
      sourceCollege,
      targetCollege,
      reason: `No verified course data for ${sourceCollege}.`,
    };
  }
  const target = colleges[targetCollege];
  if (!target) {
    return {
      status: 'cannot-plan',
      sourceCollege,
      targetCollege,
      reason: `No verified course data for ${targetCollege}.`,
    };
  }

  const sourceByLccn = courseByLccn(source);
  const targetByLccn = courseByLccn(target);

  const matched = [...sourceByLccn.keys()]
    .filter((lccn) => targetByLccn.has(lccn))
    .sort()
    .map((lccn) => ({
      lccn,
      hours: hoursOf(lccn),
      sourceCourse: sourceByLccn.get(lccn),
      targetCourse: targetByLccn.get(lccn),
    }));

  const used = new Set();
  const areas = [];
  const gaps = [];
  let generalEducationHours = 0;

  for (const area of framework.areas) {
    const pool = areaCandidates(area, matched)
      .filter((c) => !used.has(c.lccn))
      .map((c) => {
        const entry = { ...c, area: area.id };
        const branch = branchOf(area, c.lccn);
        if (branch) entry.branch = branch;
        return entry;
      });

    const picks = [];
    let areaHours = 0;
    if (area.branches) {
      // Branch-aware fill (Nov 12, 2026): the old in-order fill
      // filled the whole area minimum from the first branch, then
      // the repair pass added the second branch on top, padding
      // natural sciences to 14 hours (two full biology sequences)
      // once UL Lafayette's matrix supplement widened the matched
      // pool. Fill the first branch to its same-science sequence
      // minimum, then the other branch only until the area minimum
      // is met, then anything left. The repair pass still runs.
      const firstBranch = pool.length ? pool[0].branch : null;
      const sameMin = area.sameScienceMinHours || 0;
      const pickedHours = () => picks.reduce((s, p) => s + p.hours, 0);
      const branchHours = (b) => picks
        .filter((p) => p.branch === b).reduce((s, p) => s + p.hours, 0);
      for (const candidate of pool) {
        if (branchHours(firstBranch) >= sameMin) break;
        if (candidate.branch !== firstBranch) continue;
        picks.push(candidate);
      }
      for (const candidate of pool) {
        if (pickedHours() >= area.minHours) break;
        if (candidate.branch === firstBranch || picks.includes(candidate)) continue;
        picks.push(candidate);
      }
      for (const candidate of pool) {
        if (pickedHours() >= area.minHours) break;
        if (picks.includes(candidate)) continue;
        picks.push(candidate);
      }
      areaHours = pickedHours();
    } else {
      for (const candidate of pool) {
        if (areaHours >= area.minHours) break;
        picks.push(candidate);
        areaHours += candidate.hours;
      }
    }
    if (area.branches) repairNaturalSciences(area, picks, pool);

    for (const pick of picks) used.add(pick.lccn);
    areaHours = picks.reduce((sum, p) => sum + p.hours, 0);
    const met = area.branches
      ? naturalSciencesMet(area, picks)
      : areaHours >= area.minHours;
    if (!met) gaps.push({ area: area.id, needed: area.minHours, have: areaHours });
    generalEducationHours += areaHours;
    areas.push({
      id: area.id,
      name: area.name,
      minHours: area.minHours,
      hours: areaHours,
      met,
      courses: picks.map(toPlanEntry),
    });
  }

  const disciplineNeeded = framework.degree.totalHours - generalEducationHours;
  const disciplinePool = matched.filter((c) => !used.has(c.lccn));
  const disciplinePicks = [];
  let disciplineHours = 0;
  for (const candidate of disciplinePool) {
    if (disciplineHours >= disciplineNeeded) break;
    disciplinePicks.push({ ...candidate, area: 'discipline-electives' });
    disciplineHours += candidate.hours;
  }
  const disciplineCourses = disciplinePicks.map(toPlanEntry);

  const totalHours = generalEducationHours + disciplineHours;
  if (totalHours < framework.degree.totalHours) {
    gaps.push({ area: 'discipline-electives', needed: disciplineNeeded, have: disciplineHours });
  }

  const ordered = areas.flatMap((a) => a.courses).concat(disciplineCourses);
  const semesters = [];
  let current = { number: 1, hours: 0, courses: [] };
  for (const entry of ordered) {
    if (current.hours > 0 && current.hours + entry.hours > 15) {
      semesters.push(current);
      current = { number: semesters.length + 1, hours: 0, courses: [] };
    }
    current.courses.push(entry);
    current.hours += entry.hours;
  }
  if (current.courses.length > 0) semesters.push(current);

  const complete = gaps.length === 0;
  return {
    status: complete ? 'complete' : 'partial',
    sourceCollege,
    targetCollege,
    degree: framework.degree.name,
    areas,
    disciplineCourses,
    generalEducationHours,
    disciplineHours,
    totalHours,
    semesters,
    gaps,
    guarantee: complete ? framework.degree.guarantee : null,
    guaranteeLimits: framework.degree.guaranteeLimits,
    sources: framework.sources,
    savings: tuition && estimateSavings ? estimateSavings(targetCollege, totalHours, tuition) : null,
  };
}

function toPlanEntry(candidate) {
  const entry = {
    lccn: candidate.lccn,
    hours: candidate.hours,
    area: candidate.area,
    sourceCode: candidate.sourceCourse.code,
    sourceTitle: candidate.sourceCourse.title,
    targetCode: candidate.targetCourse.code,
    targetTitle: candidate.targetCourse.title,
  };
  if (candidate.branch) entry.branch = candidate.branch;
  return entry;
}

module.exports = { buildPlan, hoursOf };
