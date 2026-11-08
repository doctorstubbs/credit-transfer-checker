# Credit Transfer Checker, Test First

**The question this product answers for a dual enrollment family:**
will this credit count, and what will it count as, at the college my
teen actually plans to attend, answered before the money is spent.

Built by Kristofer J. M. Stubbs, Ed.D. (15 years in higher education,
admissions, and enrollment leadership) using test driven development:
the business rules are written first as plain English scenarios, the
domain owner approves them, and software is built only to make the
tests pass.

- Full stage by stage record: docs/BUILD-LOG.md
- The rules: features/credit-transfer.feature
- The test harness: features/steps/credit-transfer.steps.js
- The checker contract: src/checker.js

Run the tests yourself (Node.js 24):

```
npm install
npm test
```

Expected today: 10 scenarios, 10 failing with "Not implemented,"
which is the recorded red state (see red-run-2026-11-07.log). The
build to green is Stage 5 in the build log.

Started Nov 7, 2026, the night of Black Tech NOLA, using the method from
D. Gaspard's "Beyond Vibe Coding" workshop: write the business rules as
executable Gherkin scenarios first, get the domain owner to approve them,
then build only what makes the tests pass.

## The wedge problem

Credit transfer uncertainty. Families pay for dual enrollment courses, then
learn at enrollment time that credits landed as electives and do not move
the degree forward. The checker answers, before the money is spent:
will this credit count, and what will it count as, at the target college?

## Status

- v1 scenarios: 10 rules in features/credit-transfer.feature
- DOMAIN OWNER APPROVED: Kris reviewed all 10 scenarios on Nov 7, 2026 and approved them as written ("These all look good to me"). The three soft spots in the checklist below stand as the approved wording.
- RED RUN RECORDED Nov 7, 2026: harness stood up (Cucumber, Node 24). First run caught one undefined step (scenario 5 degree phrasing), fixed, rerun: 10 scenarios, 10 failed, 0 undefined, every failure is the intentional 'Not implemented: credit transfer rules engine' in src/checker.js. Log: red-run-2026-11-07.log. The tests are proven to bite. Next: build the rules engine to green, one scenario group at a time.

## Sources each scenario stands on (verified Nov 7, 2026)

1. Transfer degree block and junior standing: Louisiana Transfer Associate
   Degree (AALT/ASLT), 60 hours (39 general education + 21 additional),
   grade of C or better in each course, guarantees all 60 hours transfer,
   general education met in full, junior status at any Louisiana public
   university. Sources: LSU Eunice transfer degrees page; Baton Rouge
   Community College Louisiana Transfer Degree page; La. R.S. 17:3163
   (statewide articulation and transfer agreement).
2. Limited access exception and separate program requirements:
   La. R.S. 17:3163(B)(3); Southeastern Louisiana University AALT/ASLT
   page (major, department, and school requirements are not automatically
   satisfied by the transfer degree).
3. Direct equivalent, elective equivalent, general elective: University
   of Louisiana at Lafayette Transfer FAQs (their example: ENGL 1010
   transfers as ENGL 101; no direct match in a taught subject becomes a
   level elective such as ENGL 2XX; no matching subject becomes ELEC 1XX).
4. Course numbering floor: Delgado Community College catalog, only
   courses numbered 100 and above may fulfill degree requirements.
5. State framework: Louisiana Board of Regents Master Course Articulation
   Matrix and Louisiana Common Course Numbers (LCCN), Act 356 of 2009.

## Domain owner review checklist (Kris)

The presenter rule: a human approves the domain model before any build.
Before v2, Kris reviews each scenario and marks it right, wrong, or
oversimplified. Known soft spots to judge:

- Scenario 3 (grade of D): the guarantee requires C or better per course,
  but a receiving university may still accept a D course individually in
  some cases. The scenario says the university decides, which is the safe
  wording. Confirm or sharpen.
- Scenario 9 (private university): the guarantee covers public
  institutions. Private schools evaluate individually. Confirm the
  "verify individually" wording matches how you would counsel a family.
- Scenario 5 (major prerequisite): the trap families hit most. Confirm
  this is the report behavior you want, flag and never auto substitute.

## Next steps after approval

1. Add grade and GPA scenarios, AP credit scenarios, and a second
   receiving university to prove the model stretches.
2. Stand the scenarios up in the presenter's harness (Cucumber, Node)
   and watch all 10 fail. That red run is the starting line.
3. Build the smallest checker that turns them green.
4. Sell the finished credit audit as a fixed price report to families
   first, software second (see strategy note in chat, Nov 7, 2026).
