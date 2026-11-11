Feature: Course suggestions while typing
  Kris's rule (Nov 10, 2026): when a student types in the course
  code box, course options appear. For a college with verified
  data the options are that college's own courses. For a college
  that is not covered yet the options are the statewide common
  courses (the Board of Regents common course catalog already in
  the dataset), identified by their state number (LCCN). Picking
  a suggestion never changes a verdict by itself; it only helps
  the student enter the right course.

  Scenario: A covered college suggests its own verified courses
    Given the suggestion data has a covered college "Delgado Community College" with course "ENGL 101" titled "English Composition I" with state number "CENL 1013"
    When the suggestion pool is built for "Delgado Community College"
    Then the pool has 1 entry with code "ENGL 101" and state number "CENL 1013"

  Scenario: An uncovered college suggests the statewide common courses
    Given the suggestion data has a covered college "Delgado Community College" with course "ENGL 101" titled "English Composition I" with state number "CENL 1013"
    And the statewide catalog has "CENL 1013" titled "English Composition I"
    And the statewide catalog has "CMAT 1213" titled "College Algebra"
    When the suggestion pool is built for "Baton Rouge Community College"
    Then the pool has 2 entries from the statewide catalog

  Scenario: Typing a code finds the course with or without spaces
    Given the suggestion data has a covered college "Delgado Community College" with course "ENGL 101" titled "English Composition I" with state number "CENL 1013"
    When the suggestion pool is built for "Delgado Community College"
    And suggestions are matched for the typed text "engl101"
    Then the first suggestion is "ENGL 101"

  Scenario: Typing part of a title finds the course
    Given the suggestion data has a covered college "Delgado Community College" with course "ENGL 101" titled "English Composition I" with state number "CENL 1013"
    When the suggestion pool is built for "Delgado Community College"
    And suggestions are matched for the typed text "composition"
    Then the first suggestion is "ENGL 101"

  Scenario: One character is not enough to suggest
    Given the suggestion data has a covered college "Delgado Community College" with course "ENGL 101" titled "English Composition I" with state number "CENL 1013"
    When the suggestion pool is built for "Delgado Community College"
    And suggestions are matched for the typed text "e"
    Then there are no suggestions
