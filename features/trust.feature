Feature: Trust layer on every result
  A family should be able to see where every answer came from and
  the rules that protect them, in the result itself, not only in a
  disclosure at the bottom of the page. Every result traced from
  catalog data names the two catalogs it was joined from and the
  statewide common course number. A student with a course still in
  progress is told about Louisiana's choice credit option while
  there is still time to use it. A student with a course still in
  progress also gets the grade question that protects those hours,
  because the transfer degree guarantee requires a C or better in
  each course.

  Scenario: A matched result names the catalogs it was traced from
    Given a trust check of Delgado ENGL 101 toward UL Lafayette
    Then the result for "ENGL 101" names "2026-2027 catalog" at the source and "2026-2027 catalog and Board of Regents Articulation Matrix, 2025-26" at the target
    And the result for "ENGL 101" carries the common course number "CENL 1013"

  Scenario: An elective result names its catalogs too
    Given a trust check of Delgado HIST 103 toward the University of New Orleans
    Then the result for "HIST 103" names the "2026-2027 catalog" at both colleges

  Scenario: A planned course brings the choice credit step
    Given a trust guidance check with one planned matched course
    Then the next steps include the choice credit step

  Scenario: A finished course does not bring the choice credit step
    Given a trust guidance check with one completed matched course
    Then the next steps do not include the choice credit step

  Scenario: A planned course brings the grade protection question
    Given a trust guidance check with one planned matched course
    Then the advisor questions include the grade protection question

  Scenario: A clean finished check stays free of extra questions
    Given a trust guidance check with one completed matched course
    Then the advisor questions do not include the grade protection question

  Scenario: No degree hours, no grade protection question
    Given a trust guidance check with one uncovered course
    Then the advisor questions do not include the grade protection question

  Scenario: Covered colleges carry no quality flag until a public source lists one
    Given the quality flags data
    Then "Delgado Community College" has no quality flags
    And "University of New Orleans" has no quality flags
    And "University of Louisiana at Lafayette" has no quality flags

  Scenario: A flag recorded in the data is surfaced for its college
    Given a quality dataset recording a NACEP flag for "Example College"
    Then "Example College" has the quality flag "NACEP accredited concurrent enrollment program"
