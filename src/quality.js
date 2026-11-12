'use strict';

// Quality flags (Stage 24, accreditation theme).
//
// A flag is a quality mark a family can verify in a public
// source: today that means NACEP accreditation of a college's
// concurrent enrollment program, read from NACEP's own directory
// into data/quality.json. The rule is the same as everywhere else
// in this product: a flag exists only when the public source
// lists it. As of the November 2026 check, no covered college
// carries one, so this returns an empty list for them; the
// mechanism is what ships, ready for the first verified listing.

function flagsFor(college, qualityData) {
  if (!college || !qualityData || !qualityData.flags) return [];
  const flags = qualityData.flags[college];
  return Array.isArray(flags) ? flags : [];
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { flagsFor };
}
if (typeof window !== 'undefined') {
  window.flagsFor = flagsFor;
}
