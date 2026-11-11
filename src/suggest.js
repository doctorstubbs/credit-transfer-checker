'use strict';

// Course suggestions while typing (Kris, Nov 10, 2026).
//
// The suggestion pool depends on coverage:
// - A college with verified course data suggests its own courses
//   (code, title, and the course's state number where it has one).
// - A college that is not covered yet suggests the statewide
//   common courses from the Board of Regents common course
//   catalog already carried in the dataset, identified by their
//   state number (LCCN). A statewide pick fills the box with the
//   state number and stores it on the row, which is exactly the
//   identifier the articulation matrix is keyed on, so a coverage
//   request carries the right course identity.
//
// Picking a suggestion never changes a verdict by itself. The
// checker still only calls courses from verified data.

function suggestionPool(data, collegeName) {
  if (!data) return [];
  const colleges = data.colleges || {};
  const college = colleges[collegeName];
  if (college && Array.isArray(college.courses)) {
    return college.courses.map((c) => ({
      code: c.code,
      title: c.title || '',
      lccn: (c.lccns && c.lccns[0]) || null,
      statewide: false,
    }));
  }
  const statewide = data.statewide || {};
  return Object.keys(statewide).map((lccn) => ({
    code: lccn,
    title: (statewide[lccn] && statewide[lccn].title) || '',
    lccn,
    statewide: true,
  }));
}

function normalize(text) {
  return String(text || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function matchSuggestions(pool, typed, limit) {
  const q = normalize(typed);
  if (q.length < 2) return [];
  const cap = limit || 8;
  const titleQuery = String(typed || '').trim().toLowerCase();
  const codeMatches = [];
  const titleMatches = [];
  (pool || []).forEach((entry) => {
    const codeN = normalize(entry.code);
    const lccnN = normalize(entry.lccn || '');
    if (codeN.includes(q) || (lccnN && lccnN.includes(q))) {
      codeMatches.push(entry);
    } else if (titleQuery.length >= 2 && entry.title.toLowerCase().includes(titleQuery)) {
      titleMatches.push(entry);
    }
  });
  codeMatches.sort((a, b) => {
    const ai = normalize(a.code).indexOf(q);
    const bi = normalize(b.code).indexOf(q);
    return ai - bi;
  });
  return codeMatches.concat(titleMatches).slice(0, cap);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { suggestionPool, matchSuggestions };
}
