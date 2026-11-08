# Data Plan: Real Course Matching (Stage 11)

Goal: the tool finds the match itself. The user picks a college, picks
a course from that college's real list, picks a target college, and
the tool answers. Nobody is asked a registrar question again.

## Source currency rule (Kris, Nov 8, 2026)

Only current editions may be used. The AY 2022-2023 matrix
spreadsheet is banned as a source for this project, in whole or in
part. Equivalents are built from the colleges' current catalogs
(2025-26), joined on the state common course numbers defined in
the current Common Course Catalog. See the Correction entry in
docs/BUILD-LOG.md.

## The two state sources (both public, both official)

1. Louisiana Statewide Common Course Catalog (Board of Regents,
   updated September 2026 for AY 2025-26). Defines every statewide
   common course: a four letter rubric beginning with C plus four
   digits (example: CENL 1013, English Composition I; CMAT 1213,
   College Algebra). The digits carry meaning: level, sequence, and
   the last digit is the credit hours. This is the list of courses
   the state guarantees are the same everywhere.
2. Master Course Articulation Matrix (Board of Regents). Rows are
   the common courses; columns are the institutions; each cell is
   that college's own course code for the common course. This is
   the answer key: one row tells us how a course appears at every
   public college in Louisiana at once.

Supporting check: college catalogs print the common number beside
their own courses (example format: [LCCN: CENL1013]), which lets us
verify any single pairing against the college's own catalog.

## Data model

One record per common course:

- lccn (CENL 1013), statewide title, credit hours
- equivalents: a map from institution to that college's local code
  and title (Delgado: ENGL 1010; UL Lafayette: ENGL 101)
- source stamp: which matrix/catalog edition the row came from

Stored as one JSON file in the repo (data/courses.json), so the
dataset itself is versioned, reviewable, and part of the showcase.

## How matching works once the data exists

1. The user picks a source college and a course from its list.
2. The tool reads the course's common number.
3. Same common number at the target college: direct match, and the
   tool names the target course itself ("counts as ENGL 101").
4. No common number match, but the target teaches that subject
   family: elective in that subject at the matching level.
5. Target does not teach the subject: general elective.
6. Course not in the dataset yet: honest fallback. The page says the
   course is not in our list yet and keeps tonight's manual choices,
   clearly labeled as an estimate. The tool never invents a match.

Rules already in the engine (below 100 level, C or better conditions,
transfer degree block, private college boundary) do not change; the
dataset only replaces the question the user could not answer.

## Starter scope (version 1 of the dataset)

The general education core, the courses students transfer most:
English composition I and II, college algebra and the common math
sequence, general biology and chemistry with labs, US history I and
II, world history, introduction to psychology, introduction to
sociology, public speaking, introduction to philosophy, art and
music appreciation, introduction to criminal justice, micro and
macro economics, American government, and the rest of the roughly
40 common courses that make up the 39 hour general education block
behind the transfer degree. Because matrix rows cover every public
institution at once, version 1 serves all 14 public universities
and all public two year colleges as both senders and targets from
the same file.

## Build steps

1. Extract the matrix and catalog tables into the JSON dataset,
   with a script kept in the repo so the extraction is repeatable.
2. Data scenarios first: new Gherkin scenarios pin known pairings
   (Delgado ENGL 1010 to UL Lafayette ENGL 101 by common number,
   plus at least one pairing per subject family), watched failing.
3. Engine gains a lookup step in front of the existing rules.
4. Page swaps the free text course box for a course picker fed by
   the dataset once a source college is chosen; the manual match
   question disappears for covered courses.
5. Verify three pairings against the colleges' own catalogs before
   publishing, and say in the build log which ones were checked.

## Course picking: subject first (Kris's choice, Nov 8, 2026)

When the dataset lands (Stage 11b), nobody types a course code
from memory and nobody faces one giant course dropdown. The flow
is subject first:

1. A short subject dropdown (English, Mathematics, Biology,
   History, Psychology, and the other families in the data; the
   families come straight from the state rubric groups, named in
   plain words).
2. A course dropdown listing only that college's courses in the
   chosen subject, each line showing the local code and the title
   ("ENGL 1010, English Composition I").
3. Picking a course carries its state common number with it, so
   the match question never appears for a listed course.

A plain dropdown of every course at a college was rejected on
purpose: at a thousand plus courses it is unusable on a phone.
Subject first keeps every list short at any dataset size, which
is what lets the data grow to the full catalog without the page
changing.

## Keeping it true

- The catalog is reissued yearly (September) and the matrix is
  updated on a rolling basis. The dataset carries its edition date;
  a refresh is a documented stage, not a rewrite.
- The Regents note that a few university cells sit blank while
  campuses finalize updated numbers. Blank cells are stored as
  "verify with the college," never filled by guesswork.

## Built to grow to the full catalog (Kris's condition, Nov 7, 2026)

Kris's requirement: version 1 being the core is acceptable only if
the design can grow to the majority, ideally all, of the courses
offered. The design meets it four ways:

1. Courses are data, not code. The engine holds zero course
   knowledge; it performs one generic lookup by common number.
   Adding 50 courses or 5,000 changes only rows in the dataset,
   never the rules, the scenarios' engine, or the page logic.
2. The extraction is whole-matrix from day one. The starter scope
   is a verification scope (rows checked by hand against college
   catalogs before being labeled verified), not an ingestion
   limit. Every other matrix row can sit in the dataset labeled
   matrix-listed until it is verified, so coverage can jump to the
   full matrix in one refresh, then verification catches up family
   by family.
3. The same record shape absorbs the two later sources without
   redesign: per college equivalency tables published by receiving
   universities (for courses with no common number, stored as
   direct pairings in the same equivalents map), and private
   college data if it is ever published in usable form.
4. The page picker is type to search over the dataset, which
   behaves the same at 40 courses and at 4,000; and the annual
   refresh re-runs the extraction and diffs editions, so new state
   courses enter as new rows instead of a rebuild.

Success measure for the growth path: dataset coverage is reported
on the page as a count of courses and colleges covered, so the gap
between core and complete is always visible and shrinking in
public.

## Honest limits

- The matrix is general education heavy and still growing; upper
  level major courses are sparse. Version 1 is a core, not the
  whole catalog, and the page will say how many courses it covers.
- Private colleges sit outside the state system, so their courses
  stay on the manual path (the engine's private boundary already
  handles the answer wording).
- A match in the matrix means the state counts the courses as
  equivalent; whether it satisfies a specific major requirement at
  the target stays a separate question, which the engine already
  treats separately.
