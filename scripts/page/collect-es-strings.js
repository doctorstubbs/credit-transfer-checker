'use strict';
// Collect every user-facing English string the Spanish toggle must
// cover: static page text, eligibility/admission engine outputs
// across an input grid, pathway labels and careers, packet step
// text for every covered college pair, and checker warnings.
// Output: /tmp/es-strings.json (unique, sorted).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const load = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const out = new Set();
const add = (s) => { if (typeof s === 'string' && s.trim().length > 1) out.add(s.trim()); };

// 1. Static body text from the built docs page (scripts stripped).
const html = fs.readFileSync(path.join(ROOT, 'docs/index.html'), 'utf8');
const body = html.split('<body>')[1].split('<script>')[0];
for (const m of body.matchAll(/>([^<>]+)</g)) add(m[1]);

// 2. Eligibility grid.
const { evaluateEligibility } = require(path.join(ROOT, 'src/eligibility'));
const ELIG = load('data/eligibility.json');
for (const college of Object.keys(ELIG.colleges)) {
  for (const gradeLevel of ['freshman', 'sophomore', 'junior', 'senior', undefined]) {
    for (const track of ['academic', 'technical']) {
      for (const gpa of [undefined, 1.5, 2.0, 2.5, 2.75, 3.5]) {
        for (const rec of [false, true]) {
          for (const subj of [undefined, 'english', 'math']) {
            const r = evaluateEligibility(college, {
              gradeLevel, track, gpa, counselorRecommendation: rec, subject: subj,
              actComposite: 19, actEnglish: 18, actMath: 19,
            }, ELIG);
            (r.met || []).forEach(add); (r.missing || []).forEach(add);
            (r.unknown || []).forEach(add); (r.notes || []).forEach(add);
            const r2 = evaluateEligibility(college, {
              gradeLevel, track, gpa, counselorRecommendation: rec, subject: subj,
            }, ELIG);
            (r2.met || []).forEach(add); (r2.missing || []).forEach(add);
            (r2.unknown || []).forEach(add); (r2.notes || []).forEach(add);
            const r3 = evaluateEligibility(college, {
              gradeLevel, track, gpa, counselorRecommendation: rec, subject: subj,
              actComposite: 10, actEnglish: 10, actMath: 10,
            }, ELIG);
            (r3.met || []).forEach(add); (r3.missing || []).forEach(add);
            (r3.unknown || []).forEach(add); (r3.notes || []).forEach(add);
          }
        }
      }
    }
  }
}

// 3. Admission grid.
const { evaluateAdmission } = require(path.join(ROOT, 'src/admission'));
const ADM = load('data/admission-standards.json');
const colleges36 = Object.keys(ADM.institutionTypes || {});
for (const targetCollege of colleges36) {
  for (const earnedHours of [null, 0, 12, 18, 24, 30]) {
    for (const gpa of [null, 1.5, 2.0, 2.25, 2.5, 3.0]) {
      for (const combo of [0, 1, 2, 3]) {
        const r = evaluateAdmission({
          targetCollege, earnedHours, gpa,
          englishCompleted: combo % 2 === 1, mathCompleted: combo >= 2,
          hasAssociateDegree: combo === 3, inBridgeProgram: combo === 2,
          age25OrOver: false, placementMathOrEnglish: combo === 1,
        }, ADM);
        (r.notes || []).forEach(add);
        (r.paths || []).forEach((p) => { (p.missing || []).forEach(add); add(p.id); });
      }
    }
  }
}

// 4. Pathways labels and careers.
const PW = load('data/pathways.json');
for (const p of PW.pathways) {
  (p.careers || []).forEach(add);
  for (const req of p.requirements || []) add(req.label);
}

// 5. Packet steps for every covered pair.
const { buildPlan } = require(path.join(ROOT, 'src/planner'));
const { buildPacket } = require(path.join(ROOT, 'src/packet'));
const COURSES = load('data/courses.json');
const FRAMEWORK = load('data/transfer-degree.json');
const APPS = load('data/applications.json');
const covered = Object.keys(COURSES.colleges);
for (const s of covered) {
  for (const t of covered) {
    if (s === t) continue;
    const plan = buildPlan({ sourceCollege: s, targetCollege: t }, { courses: COURSES, framework: FRAMEWORK });
    if (plan.status === 'cannot-plan') continue;
    const pkt = buildPacket(plan, APPS);
    (pkt.steps || []).forEach((st) => { add(st.title); add(st.detail); });
  }
}

// 6. Subjects map (dropdown labels).
Object.values(COURSES.subjects || {}).forEach(add);

fs.writeFileSync('/tmp/es-strings.json', JSON.stringify([...out].sort(), null, 1));
console.log('unique strings:', out.size);
