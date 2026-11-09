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

## Stage 9, Source colleges: many senders, one receiver (Sat Nov 7, 2026)

- Kris's catch while using the live page: it asked for a target
  college and courses, but never asked where the courses were taken,
  and real students hold credits from several colleges at once.
  Research confirms the field's model: transfer is always a sending
  college and a receiving college, articulation agreements are
  between two specific colleges, and registrars evaluate transcript
  by transcript.
- Method followed: scenarios first. Two scenarios were written and
  watched failing (12 passed, 2 failed): credits from Delgado and
  Baton Rouge Community College evaluated in one check and grouped
  by college in the report; a transfer degree from Delgado plus
  loose courses from BRCC, where the block verdict and the course
  by course verdict coexist.
- Engine: the input model is now sources (each with its institution,
  its own transfer degree if any, and its courses) to one target.
  The block guarantee attaches to the degree granting college.
  Course results carry their source college. All 12 earlier
  scenarios still pass unchanged; suite is 14 scenarios, 14 passed,
  70 steps. Log: run-2026-11-07-source-colleges.log.
- Page: a "Where your credits come from" section of repeatable
  college blocks (full Louisiana source list, community colleges
  included, plus out of state and not listed options), each with
  its own degree selector and course rows, and an "Add another
  college" button. Results render grouped under each college's name.
- Verified end to end locally: AALT at Delgado fires the block
  guarantee while a BRCC course in the same check is evaluated on
  its own and tagged to BRCC.

## Stage 10, Planning mode: check before you enroll (Sat Nov 7, 2026)

- Kris's addition: students also need to plan courses they have not
  taken yet, not only verify finished ones. Explained and agreed in
  plain terms: the match answer is firm before enrollment; the grade
  based answers become conditions.
- Scenarios first, watched failing (14 passed, 3 failed): a planned
  course with a direct equivalent (marked planned, counts toward the
  requirement if a C or better is earned); a planned course that
  only counts as an elective (the warning lands before the money is
  spent); a transfer degree still in progress (no completion verdict
  yet; the guarantee applies at completion if every course finishes
  at C or better).
- Engine: courses carry a status (completed or planned); planned
  results keep firm equivalency answers and gain a condition line.
  Sources carry a degree status (completed or in progress); an in
  progress degree yields a guarantee on completion answer instead of
  a block verdict. Suite: 17 scenarios, 17 passed, 85 steps.
  Log: run-2026-11-07-planning-mode.log.
- Page: every course row now starts with Finished it or Planning to
  take it (planned rows ignore the grade box), each college block
  offers the transfer degree as completed or still working on it,
  and results label planned courses with their condition in plain
  words. Verified end to end locally with an in progress AALT and a
  planned ENGL 1010.
- Note: the audience subtitle reached its final wording in this
  stretch (largest population first, no "families"): "A Louisiana
  college credit check: for community college transfers, dual
  enrollment and early college students, and anyone moving credits
  between Louisiana colleges."

## Correction (Sun Nov 8, 2026, about 12:20 AM): Stage 11 data withdrawn

Kris's ruling: no AY 2022-2023 information may be used. The matrix
spreadsheet Stage 11 was built on is the AY 2022-2023 edition, so
every pairing drawn from it has been pulled out of the tool: the
engine lookup, the page course picker and coverage line, the
dataset files, and the four data scenarios are removed, and the
suite is back to the Stage 10 state (17 scenarios, 17 passed).
The downloaded matrix files are deleted, not archived. A check for
a newer posted matrix found none: the Regents' December 2025
Articulation and Transfer Report says the matrix is being moved to
a CollegeSource platform, and the last spreadsheet posted on the
Regents site is the 2022-2023 one. The four data scenarios remain
the specification for the rebuild, recorded in the Stage 11 entry
below, which is kept for the record and marked superseded.

Rebuild path (Stage 11b, not started): current sources only. The
course list, titles, and hours come from the Statewide Common
Course Catalog AY 2025-26 (current edition, September 2026). The
college by college equivalents come from the colleges' own current
catalogs, which print the state common number beside each course
(example format: [LCCN: CENL 1013]), joined on that number. Every
pairing in the rebuilt dataset will trace to two current catalogs,
which makes the dataset verified by construction instead of
verified after the fact.

## Stage 11, Real course matching: the tool finds the match (Sun Nov 8, 2026) [SUPERSEDED, see Correction above]

- Kris's catch: users cannot know whether a direct match exists;
  that is the problem the tool exists to solve. Data plan written
  first (docs/DATA-PLAN.md), including his growth condition: the
  design must scale to the majority, ideally all, courses offered.
- Data acquired from the source: the Board of Regents Master
  Course Articulation Matrix AY 2022-2023 Excel (the newest posted
  on laregents.edu) and the Statewide Common Course Catalog AY
  2025-26 PDF, both saved under data/sources/. The matrix is one
  row per common course and one column per college, exactly the
  shape the plan called for.
- Extraction script (scripts/build-dataset.py, repeatable) produced
  data/courses.json and src/courses-data.js: 266 common courses
  across 32 institutions, raw matrix cells preserved.
- Scenarios first, watched failing (17 passed, 4 failed): the tool
  finds Delgado ENGL 1010 as ENGL 101 at UL Lafayette by common
  number CENL 1013 on its own; the same course is ENGL 1157 at the
  University of New Orleans; a matrix elective cell (ACCT ***) lands
  as a level elective; a course absent from the data is flagged
  not-in-data instead of guessed.
- Engine: a data lookup runs before the manual rules whenever the
  user did not declare a match. Code matching tolerates college
  renumbering (ENGL 101 vs ENGL 1010). Results carry matchedBy (the
  common course number) and dataStatus (matched, not-in-data,
  manual). Suite: 21 scenarios, 21 passed, 101 steps. Log:
  run-2026-11-08-real-course-matching.log.
- Verification pass (the human checkpoint layer): CENL 1013 and
  CENL 1023 rows are stamped verified in the dataset with notes:
  Delgado's catalog and placement pages tag ENGL 101/110 as
  [LCCN: CENL 1013] and ENGL 102 as [LCCN: CENL 1023]; UL
  Lafayette's transfer FAQs use this exact pairing as their worked
  example; Louisiana DOE Fast Forward pathways list Delgado
  English Composition I as ENGL 1010 under CENL 1013. All other
  rows remain labeled matrix-listed until verified.
- Page: picking a source college fills a course picker from the
  data; choosing a listed course disables the match question (the
  data answers it), results show "Matched by the state course
  data" with the common number, and not-in-data lines are labeled
  estimates. The match options were also renamed into plain words
  after Kris flagged the registrar language. The subtitle now
  states the coverage count in public: 266 courses, 32 colleges.

## Next stages (not started)

- Stage 12: anonymous usage counts plus email capture for the full
  report (direction confirmed by Kris Nov 7, 2026).
- Stage 13 (the paid family audit, was Stage 7 in the first draft): A simple web page where a family enters courses and a
  target college and receives the report. First browser visible stage.
- Stage 7: Package the audit as a fixed price report for families and
  take the first paid orders.

## Stage 11b: real course matching rebuilt from current catalogs only (Nov 8, 2026)

Kris's direction: the course list must be pickable (subject first,
then course), and easy to use. Built the same night, current
sources only, after the Stage 11 withdrawal.

Data, all current editions, all read Nov 8, 2026:
- Louisiana Statewide Common Course Catalog, AY 2025-26 edition
  (Board of Regents): 292 common courses and 41 subject families
  extracted to data/statewide-courses.json.
- Delgado Community College Catalog, 2026-2027: 131 courses with
  printed Louisiana common course numbers, harvested from the
  catalog's own course descriptions (data/harvests/).
- University of Louisiana at Lafayette Catalog, 2026-2027: 96
  courses with printed numbers, harvested the same way.
- data/courses.json joins them on the common number: 72 of the
  131 Delgado courses have a UL Lafayette partner today.
- Why current matters, proven in the harvest: UL Lafayette's
  ENGL 101 is now titled Introduction to Academic Writing, its
  MATH 103 no longer exists (college algebra is MATH 105,
  CMAT 1203), and Delgado's MATH 128 and UL Lafayette's MATH 105
  share CMAT 1203 while sharing no local number at all.

Scenarios first: five new scenarios written from what the current
catalogs actually say (the tool finds the Delgado English match
itself; different numbers at both colleges match on the state
number; a state number the university does not carry becomes a
level elective in a subject it teaches, Delgado FREN 101 against
UL Lafayette's CFRN 1014 French; a subject outside the harvested
data, accounting at UL Lafayette, gets an honest not covered flag
instead of an invented answer; a planned course matched from the
data carries its C or better condition). Watched failing
(run-2026-11-08-catalog-data-red.log), then the engine lookup was
built on the dataset: 22 scenarios, 22 passed; 109 steps, 109
passed (run-2026-11-08-catalog-data.log).

Page: subject first course picking per Kris's choice. For a
college in the data, each course row offers a subject dropdown,
then a course dropdown for that subject at that college (code and
title). Picking a course fills the code and the state number and
removes the match question. Colleges outside the data keep the
type-the-code path. The page states its coverage plainly: which
catalogs, which editions, how many courses.

Growth path unchanged and now proven: run the same harvest on
the next college's current catalog, add its harvest file, rebuild
the dataset (scripts/build-dataset.py), re-inject the page data
(scripts/inject-data.py). Nothing about the page or engine
changes.

## Stage 12 (next): usage tracking and the email full report offer

## Stage 11c: one path, the grade decides (Nov 8, 2026)

Kris's call: planned and finished courses were always going to
get the same equivalency answer, so the separate planning path
was extra work for the user and the tool. Simplified the same
night:

- The Finished it / Planning to take it picker is gone from every
  course row. Enter the grade if you know it; leave it blank if
  you do not.
- The engine derives status from the grade: a grade on record
  makes the answer final (including the below C flag on transfer
  degree courses, which is exactly where a known grade changes
  the answer); no grade yet attaches the plain condition, "Counts
  if the student earns a grade of C or better."
- Two new scenarios pin it: a course entered with no grade gets
  the same data match with the condition stated (watched failing
  first, run-2026-11-08-one-path-red.log), and a course entered
  with a grade carries no condition. The degree in progress
  verdict is unchanged: a degree still being earned is a real
  difference, not a display choice.
- Suite: 24 scenarios, 24 passed; 118 steps, 118 passed
  (run-2026-11-08-one-path.log).

## Stage 11d: the match question comes off the page (Nov 8, 2026)

Kris asked what the match type dropdown was even for, and on the
answer (it existed only because the tool once had no course data
and had to ask the user the registrar's question) he directed its
removal.

- The match dropdown is gone from every course row. The page
  never asks anyone whether a course matches.
- Engine: a course with no catalog data behind it and no declared
  fact now returns the honest not covered result ("not in the
  course data yet", with the university decides warning) instead
  of an unclassified blank. Declared facts still work for a
  counselor who has the receiving college's answer in hand.
- One legacy rule was caught by the new scenario: the Stage 5
  hardcoded ENGL 1010 to ENGL 101 rule ignored the sending
  college entirely. It now fires only when the sender is Delgado
  or unnamed; a named college outside the data (the scenario uses
  Baton Rouge Community College) gets the honest answer.
- Suite: 25 scenarios, 25 passed; 122 steps, 122 passed
  (run-2026-11-08-no-match-question.log; red run saved alongside).

## Stage 11e: assume C or better (Nov 8, 2026)

Kris's call: particular courses are being assessed one by one,
not only inside transfer degrees, so the tool should simply
assume a grade of C or better instead of asking. He is right
that the rules never read the letter itself.

- The grade dropdown is gone from every course row. A course row
  is now: subject, course, code. Nothing else.
- The engine assumes a course entered with no grade was passed
  with a C or better, and says so: the rules text on the page
  states the assumption plainly, with the honest edge (a course
  below a C is decided by the receiving university on its own).
- What grades still do where they legally matter: the transfer
  degree block keeps its C or better attestation, and when a
  real grade is supplied (a transcript, an audit) a below C
  course inside a degree is still flagged by name, pinned by the
  original degree scenarios. A course declared planned sight
  unseen still carries its condition line.
- The Stage 11c no grade scenario was rewritten to the new rule
  (assumed C or better, final answer, no condition) and watched
  failing before the engine change.
- Suite: 25 scenarios, 25 passed; 122 steps, 122 passed
  (run-2026-11-08-assume-c.log; red run saved alongside).

## Stage 11f: courses only on the page (Nov 8, 2026)

Kris's call, and the reasoning is his: people who finished a
degree will have a transcript, and degree assessment belongs to
the transcript audit down the road, not to a self declared
dropdown most users cannot answer correctly anyway (plenty hold
an associate degree without knowing whether it is the transfer
degree, and applied associate degrees carry no guarantee).

- The transfer degree dropdown and its C or better checkbox are
  removed from every source block. In their place, one plain
  sentence: a finished Louisiana Transfer Degree carries a state
  guarantee this quick check does not apply, and that guarantee
  is read from the transcript in the full audit.
- The rules text and subtitle were corrected to match: the page
  no longer claims to apply the block guarantee.
- The engine is untouched. The degree machinery stays, proven by
  the original scenarios, ready for the transcript audit product.
  A new scenario pins the page's contract at the engine level: a
  courses only check never claims the transfer degree guarantee.
  (This scenario pins existing behavior rather than driving new
  behavior; the change was page scope, recorded honestly.)
- Suite: 26 scenarios, 26 passed; 126 steps, 126 passed
  (run-2026-11-08-courses-only.log).

## Stage 11g: clear the top of the page (Nov 8, 2026)

Kris's call: the top of the page carried a wall of explanation
nobody reads, including the full data provenance paragraph. All
of it moved into a disclosure at the bottom of the page ("Where
this data comes from, and what this check assumes"), one tap to
open, closed by default. The coverage paragraph and the full
rules text now live there.

Kept up top, deliberately, as a single line: the assumption that
every course was passed with a grade of C or better. That one
changes how a reader should take the answers, so it stays where
eyes land; everything that merely describes the machinery went
to the bottom. The subtitle's stale "Version 1" tail was
rewritten to point at the disclosure.

Suite unchanged and green: 26 scenarios, 126 steps.

## Stage 11h: strip the page to the work (Nov 8, 2026)

Kris, looking at the live page on his phone: still way too much
text. Directives applied:

- The transfer degree sentence inside every college block is
  removed entirely. The transfer degree piece can be added back
  later, with the transcript audit it belongs to.
- The long subtitle leaves the top of the page. The top is now
  the title and the form, nothing between.
- The C or better assumption line leaves the top too; the
  assumption already lives in the rules text inside the bottom
  disclosure.
- The sources card intro is trimmed to one line. A stale
  sentence telling users to declare a transfer degree on the
  block (a control removed in Stage 11f) is gone.
- The subtitle text returns at the bottom as an "About this
  check" section, placed directly above the "Where this data
  comes from" disclosure, so all explanation sits together at
  the foot of the page where Kris wanted it.

Suite unchanged and green: 26 scenarios, 126 steps.

## Stage 11i: the last two checkboxes come off (Nov 8, 2026)

Kris, on the limited access and missing prerequisite checkboxes:
"What does this have to do with anything." He is right about the
page. Both boxes were self declared hypotheticals; neither
changed a course outcome, each only added a caution note, and
the facts they carried are already stated in the bottom
disclosure. Same weakness as the degree dropdown: the tool
cannot know a student's major or its requirement list.

- Both checkboxes are removed from the target card, which now
  holds only the college picker and the Run button.
- The engine is untouched, as with the degree machinery in Stage
  11f: the limited access and prerequisite verdicts stay proven
  by their scenarios and available to the audit, where a real
  major and program are known from documents, not guessed.
- The page now asks exactly three things: where the credits
  came from, which courses, and where they are headed.

Suite unchanged and green: 26 scenarios, 126 steps.

## Stage 11j: words for both audiences (Nov 8, 2026)

Kris's language rule for the page: nothing may assume the
courses are already taken. The tool serves people checking
credits they have AND people planning courses they have not
taken yet, and the wording has to read true for both.

- "Where your credits come from" is now "Where your courses
  come from"; the intro reads "Add every college you took
  courses at, or plan to."
- "Courses taken at this college" is now "Courses taken or
  planned at this college."
- The target picker reads "Target college (where you want the
  courses to count)."
- Results group under "Courses from (college)", not "Credits
  from", and the leftover "No grade entered yet" tag on planned
  course notes is removed; the condition line stands alone.
- Disclosure text made tense neutral to match ("ends below a
  C", "is passed with a grade of C or better").

Suite unchanged and green: 26 scenarios, 126 steps.

## Stage 11k: AP credit scenarios go green in the engine (Nov 8, 2026)

Kris picked AP credit as the first expansion set and approved
five scenarios as domain owner before anything was built:

1. A score of 3 or higher earns credit at a public university.
2. A score below 3 earns no credit.
3. AP credit is never automatic: no official score report sent,
   no credit, and the report says why.
4. Where a college's AP table requires a 4 for the exact course
   match, a 3 earns a subject elective instead, and the report
   shows what the higher score would have earned.
5. The state AP rule does not bind a private university; AP
   credit there is flagged verify individually.

Grounding: Louisiana's statewide AP policy requires public
institutions to award credit for scores of 3 or higher, aligned
to campus course equivalents (College Board state policy
summary; Board of Regents AA 2.22 FAQ: credit is awarded only
if the student scores 3 or higher and submits the score report
when enrolling).

Method, same as always: the scenarios went into the feature
file first and were watched in their red state (26 passed, 5
undefined; run-2026-11-08-ap-scenarios-red.log). The engine
then grew an apExams input and an apResults section:

- Private targets are now also recognized by name against the
  Stage 7 private list, so a named private university gets the
  verify individually flag for AP just as it does for transfer.
- Each AP exam returns one outcome: exact-equivalent,
  subject-elective (with a note naming what the higher score
  would have earned), none (below the line, or the score report
  was never sent, each with its reason in plain words), or
  verify-individually at a private university.

The page does not collect AP exams yet, by design: the courses
only page stays as Kris simplified it in Stages 11c to 11j.
The AP verdicts live in the engine for the family audit, where
a real student's scores are read from documents. Wiring AP
into the public page is a separate stage if Kris calls for it.

Suite: 31 scenarios, 154 steps, all passing.
Log: run-2026-11-08-ap-green.log. The standalone Pages copy
was regenerated so it carries the same engine, and its AP
path was exercised directly as a smoke check.

## Stage 11l: AP exams on the main page (Nov 8, 2026)

Kris's call: AP belongs on the main page, not only in the
engine. Built the same evening, on top of Stage 11k:

- A new AP exams card sits between the courses card and the
  target card. Each row is three picks: the exam (20 common AP
  exams listed), the score (1 to 5), and whether the official
  score report was sent. An "Add an AP exam" button adds rows.
  No new explanatory text at the top; the AP rule lives in the
  bottom disclosure, where the other rules live, in one added
  sentence stating the statewide policy exactly as the check
  applies it.
- Results render as their own table under the course results:
  exam, score, the outcome in plain words, and degree credit.
- One engine fix rode along: the exact equivalent outcome no
  longer names the English composition equivalent for every
  exam; it now reads "the university's equivalent course for
  this exam", which is true for Biology as much as English.
- Honest limit, same as the audit note in 11k: the page does
  not yet carry any college's own AP table, so the page never
  shows the subject elective outcome from scenario 4. That
  outcome fires when a college's exact match requirement is on
  record, which today is the audit path. Harvesting college AP
  tables is a data stage of its own if Kris calls for it.

Verification: suite still 31 scenarios, 154 steps, all
passing; both page scripts pass a syntax check; the standalone
Pages copy was regenerated and exercised directly (Delgado
MATH 128 still counts as MATH 105 at UL Lafayette; an AP 4
with the report sent returns credit awarded; an AP 2 returns
no credit; a Tulane target returns verify individually).
Log: run-2026-11-08-ap-page-green.log.

## Stage 11m: University of New Orleans joins the dataset (Nov 8, 2026)

Third college in the data, first one added since the Stage 11b
method settled. Source: UNO's own 2026-2027 University Catalog
(catalog.uno.edu, served from catalog.lsuneworleans.edu,
Acalog catoid 13). Current edition only; no AY 2022-2023 data.

The wrinkle: this edition does not print the Louisiana common
course number beside its courses, the way Delgado's and UL
Lafayette's catalogs do. The numbers live in the catalog's own
search index instead. The harvest recovered them through the
catalog's Advanced Search, and because part of the first pass
rested on pattern inference (bucket searches plus the rule
that the number's last digit equals the course's credit
hours), a dedicated verification pass then exact-verified
every pairing one by one: all 73 confirmed, 0 wrong,
0 unresolved. Nothing inferred reached the dataset unverified.

Verified quirk, recorded as printed: PHYS 1001 and PHYS 1002
both carry CPHY 1013 in this catalog, and no CPHY 1023 exists.
Course titles are the catalog's search listing titles; a few
are abbreviated there (for example "Found'n of Developmental
Psyc"), a cosmetic limit of the source, noted rather than
rewritten.

Dataset now: Delgado 131, UL Lafayette 96, UNO 73. A student
can pick courses at any of the three and check them against
any of the three. Smoke checks on the live page copy: Delgado
ENGL 101 counts as ENGL 1157 at UNO; UNO ENGL 1157 counts as
ENGL 101 at UL Lafayette; Delgado MATH 128 counts as MATH
1115 at UNO (the state number matches where the local numbers
do not, the same pattern as Stage 11b).

Suite unchanged and green: 31 scenarios, 154 steps.
Log: run-2026-11-08-uno-green.log.

## Stage 11n: UL Lafayette's AP table wired in (Nov 8, 2026)

The AP harvest from Stage 11k's follow-up turned out to hold a
finding: UL Lafayette's table (2026-2027 catalog, Credit for
Prior Learning, Advanced Placement Program) has NO elective
tier. Every exam starts at 3, and higher scores earn more
courses and more hours. Kris approved a new scenario written
from the real table, watched it fail (run-2026-11-08-ap-table
-red.log), and the wiring below made it pass:

- The dataset now carries apTables, built from the harvested
  table: 23 exams, each a list of score bands (minimum score,
  courses awarded, hours). When the target university has a
  table on record and the exam is in it, the table decides the
  AP result: exact courses, exact hours, and a note naming
  what the next score band would have earned. When no table
  is on record, or the exam is not in it, the statewide
  policy default from Stage 11k still applies.
- Exam names: the catalog prints its own style ("History,
  American", "Mathematics: Calculus AB"). An alias map in the
  dataset builder ties each printed name to the College Board
  name the page lists. Two deliberate non-aliases, recorded so
  nobody has to re-derive them: the catalog's single
  "Economics" line is NOT split between AP Macroeconomics and
  AP Microeconomics by guesswork, and the retired "Physics B"
  is NOT treated as AP Physics 1. "Computer Science" (the
  catalog names no course for it, hours only) is aliased to AP
  Computer Science A, and the engine says plainly that the
  table awards the hours without naming a course.
- One scenario correction driven by the data, flagged to Kris:
  the Stage 11k scenario "A score of 3 earns an elective where
  the exact course requires a 4" named UL Lafayette as its
  example. UL Lafayette's real table contradicts that premise
  (a 3 there earns ENGL 101 outright), so the scenario's
  example university is now McNeese State University, a public
  university with no AP table on record, where the declared
  requirement path the scenario pins is the one that governs.
  The rule itself is unchanged.
- The catalog marks its AP section "under review, changes
  forthcoming"; the harvest is dated Nov 8, 2026 and the table
  joins the re-check list with the catalogs.

Page effect: for a UL Lafayette target, 14 of the 20 listed AP
exams now return the university's real courses and hours
instead of the generic statewide answer.

Suite: 32 scenarios, 160 steps, all passing.
Log: run-2026-11-08-ap-table-green.log.

## Stage 11o: BRCC checked, no publishable data (Nov 8, 2026)

Baton Rouge Community College was the last college on Kris's
list. It was checked the same way as the others and the
result is a documented zero, recorded here so nobody has to
re-run it to learn why BRCC is not in the dataset.

BRCC's current catalog is the 2026-2027 Academic Catalog on
the same Acalog / Modern Campus system as the other colleges
(catalog.mybrcc.edu, catoid=4). All 72 prefixes across all 7
course description pages were expanded and searched: the
Louisiana common course number appears only in the catalog's
introductory paragraph explaining the system, and in no
course entry. Rubric searches across the whole catalog
returned no matches in Courses. Because UNO's numbers had
hidden in its catalog's search index, the same probe was run
here (quoted exact-phrase searches for seven certain tags,
CENL 1013 first): all seven returned no matches. The hidden
route is closed at BRCC too.

The single tag visible anywhere in the catalog, CMAT 1213 in
an explanatory figure, belongs to a course with no listing
in this edition. It was not counted, and it was not moved
onto the living course of a similar name, which prints no
tag of its own.

Conclusion: BRCC does not publish its common course numbers
with its courses, so it cannot join the dataset from public
sources. A BRCC course in the checker keeps the honest not
covered answer. If a future BRCC edition publishes the
numbers, the harvest reruns exactly as the others did.
Harvest record: data/harvests/brcc-2026-27.txt.

No dataset, page, or engine change. Suite unchanged and
green: 32 scenarios, 160 steps.
