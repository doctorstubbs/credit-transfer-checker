# Build Log

A running record of every stage, in order, with dates. This log is the
showcase trail: anyone can read it top to bottom and see how the product
was built, test first.

## Stage 0, The problem and the method (Sat Nov 7, 2026)

- Kris attended the Black Tech NOLA Creator and AI Summit in New Orleans
  and had a long working conversation with presenter D. Gaspard
  (GitHub: dgaspard) about building with AI agents.
- His core points: domain expertise is what gets hired, agency beats
  waiting for requirements, and layered tests (domain tests, API
  contract tests, workflow tests) are how AI built software stays
  trustworthy. The Gherkin scenarios are the domain model, and a human
  approves them before builds proceed.
- His workshop repo, Beyond Vibe Coding, was cloned for reference:
  https://github.com/dgaspard/Black-Tech-NOLA-Vibecoding-Test-Driven-Development
- Decision (Kris, with Muse's analysis): the wedge problem is credit
  transfer uncertainty for dual enrollment families. Product direction:
  a Louisiana first credit transfer checker, sold first as a fixed price
  audit report to families, software second, pilots with schools and
  college access nonprofits after proof.

## Stage 1, Research before rules (Sat Nov 7, 2026)

Verified the Louisiana framework from official sources before writing
any rule (full citations in README.md):

- Louisiana Board of Regents Master Course Articulation Matrix and
  Louisiana Common Course Numbers (LCCN), Act 356 of 2009.
- Louisiana Transfer Associate Degree (AALT/ASLT): 60 hours, C or
  better in every course, guarantees block transfer of general
  education, all 60 hours, and junior standing at Louisiana public
  universities. La. R.S. 17:3163.
- The three transfer outcomes at UL Lafayette (direct equivalent,
  level elective, general elective).
- Delgado catalog floor: only courses numbered 100 and above count
  toward a degree.

## Stage 2, Scenarios v1 (Sat Nov 7, 2026)

- Wrote features/credit-transfer.feature: 10 scenarios covering the
  transfer degree block, junior standing, the C or better condition,
  limited access programs, major prerequisites, the three course level
  outcomes, private universities, and below 100 level courses.

## Stage 3, Domain owner approval (Sat Nov 7, 2026)

- Kris reviewed all 10 scenarios and approved them as written:
  "These all look good to me."
- The three soft spots flagged in README.md (D grade handling, private
  university wording, prerequisite behavior) stand as the approved
  behavior. This is the human in the loop gate the method requires.

## Stage 4, Harness and red run (Sat Nov 7, 2026)

- Stood the scenarios up with Cucumber on Node 24, step definitions in
  features/steps/credit-transfer.steps.js, and the API contract for
  the checker in src/checker.js (input student record, output report).
- First run: 9 failed, 1 undefined (a step wording mismatch in
  scenario 5). Fixed the step definition. An undefined step means the
  test is not real, so it had to be fixed before the run counted.
- Second run, the official red run: 10 scenarios, 10 failed,
  0 undefined. Every failure is the intentional error
  "Not implemented: credit transfer rules engine."
  Log saved at red-run-2026-11-07.log.
- Meaning: the tests bite, and they fail only because the behavior
  does not exist yet. That is the correct starting line.
- Published the same night to GitHub (Kris's direction: everything
  documented and showcase ready): https://github.com/doctorstubbs/credit-transfer-checker
  All files verified live, feature file shows exactly 10 scenarios.

## Stage 5, Build to green (Sat Nov 7, 2026)

- Implemented the rules engine in src/checker.js against the approved
  scenarios: transfer degree block guarantee (gen ed complete, 60
  hours, junior standing), the C or better condition with flagged
  courses decided by the receiving university, limited access programs
  as a separate admission decision, prerequisites never satisfied by
  electives, the three course level outcomes (direct equivalent,
  level elective, general elective), the private university boundary,
  and the below 100 level floor.
- Result on the first full implementation run: 10 scenarios,
  10 passed; 46 steps, 46 passed. Log: green-run-2026-11-07.log.
- Honest scope note: v1 covers the ten approved Louisiana rules with
  the course data the scenarios name. Real articulation data (the
  full Board of Regents matrix), more receiving universities, AP
  credit, and grade point requirements are later stages, added the
  same way: scenarios first, domain owner approval, then code.

## Stage 6, First version a family can touch (Sat Nov 7, 2026)

- Added a zero dependency web layer: src/server.js (Node http server)
  serves public/index.html and a POST /api/check endpoint backed by
  the same src/checker.js the Cucumber scenarios test. No second copy
  of the rules exists in the web layer.
- The page asks for the transfer degree (if any), the C or better
  confirmation, the target college (Louisiana public, UL Lafayette,
  or Tulane as the private example), limited access and missing
  prerequisite flags, and course rows (code, grade, and the matrix
  match type a counselor would look up).
- Verified locally before commit: the page serves (HTTP 200), the
  endpoint answers the degree case (gen ed complete, 60 hours,
  junior standing), the UL Lafayette ENGL 1010 case (counts as
  ENGL 101 toward English composition), and the private university
  case (no guarantee, verify individually). The Cucumber suite still
  passes 10 of 10 after the web layer was added.
- Run it with: npm start, then open http://localhost:3000
- The canonical version runs on the small Node server. A preview
  copy also lives at docs/index.html (the same page with the same
  checker code inlined, generated mechanically from public/index.html
  and src/checker.js) so GitHub Pages can serve it as a public demo:
  https://doctorstubbs.github.io/credit-transfer-checker/

## Stage 7, Full Louisiana target list (Sat Nov 7, 2026)

- Kris's correction while viewing the live page: the target list
  carried only UL Lafayette and Tulane. He directed the full state
  list so the tool is fully outfitted for Louisiana.
- Target list now carries all 14 bachelor granting Louisiana public
  universities (LSU A&M, LSU Alexandria, LSU Shreveport, Grambling,
  Louisiana Tech, McNeese, Nicholls, Northwestern State, Southeastern,
  Southern A&M Baton Rouge, Southern at New Orleans, UL Lafayette,
  UL Monroe, University of New Orleans) grouped under "the state
  transfer guarantee applies," and 8 private universities (Centenary,
  Dillard, Franciscan Missionaries of Our Lady, Louisiana Christian,
  Loyola New Orleans, Tulane, University of Holy Cross, Xavier)
  grouped under "the state guarantee does not apply." Lists verified
  against Louisiana system and LAICU sources Nov 7, 2026. Two year
  colleges (for example LSU Eunice, Southern Shreveport) are sources
  of dual enrollment credit, not transfer targets, so they are not in
  the target list; graduate only seminaries are also excluded.
- Two scenarios added under his direction, extending the existing
  patterns: the block guarantee at McNeese State (any public, not
  just one), and the private boundary at Loyola (not just Tulane).
- Suite now: 12 scenarios, 12 passed; 55 steps, 55 passed.
  Log: run-2026-11-07-full-louisiana.log. The Pages demo was
  regenerated from the updated page and engine and redeployed.

## Stage 8, Cleanup: broader framing and rights protection (Sat Nov 7, 2026)

- Kris's framing correction: this is not only a dual enrollment tool.
  The transfer degree guarantee and articulation matrix serve anyone
  moving credits between Louisiana colleges, community college
  transfers most of all. Page subtitle and README now read
  "Louisiana college credit check for families," with dual enrollment
  named as one audience, not the product definition.
- Tracking direction confirmed by Kris and held on standby: anonymous
  usage counts plus optional email capture for the full report
  (value first, email for extras, never an email wall). Build is a
  later stage; it needs a form backend because the Pages demo is
  static.
- Rights: LICENSE added (all rights reserved, viewing only, no reuse
  without written permission). Verified Nov 7, 2026: the repo
  contains no secrets, keys, or credentials of any kind, so there is
  nothing to purge. Repo stays public as the showcase on Muse's
  recommendation, with the commercial build (accounts, payments,
  full articulation data) planned for a private repo at the selling
  stage. Decision recorded in chat Nov 7, 2026.

## Next stages (not started)

- Stage 9 (the paid family audit, was Stage 7 in the first draft): A simple web page where a family enters courses and a
  target college and receives the report. First browser visible stage.
- Stage 7: Package the audit as a fixed price report for families and
  take the first paid orders.
