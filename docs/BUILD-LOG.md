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

## Next stages (not started)

- Stage 5: Build the rules engine to green, one scenario group at a
  time (transfer degree block first, then course level outcomes).
- Stage 6: A simple web page where a family enters courses and a
  target college and receives the report. First browser visible stage.
- Stage 7: Package the audit as a fixed price report for families and
  take the first paid orders.
