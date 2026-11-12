Feature: Transfer admission check against the state minimum standards
  Kris's direction, Nov 11, 2026: alongside "will my credits
  count", the checker should answer "will I be admitted", using
  the Louisiana Board of Regents minimum admission standards for
  transfer students (Fall 2024 edition, policy updates March 21,
  2025 and February 3, 2026). A transfer student meets the state
  minimum by satisfying ONE of the published paths. These are
  state minimums only: a college may set higher requirements, so
  a "meets" verdict is never worded as a guarantee of admission.
  Placement of this check in the product (own check, or inside
  the full report) is a later decision; these scenarios pin the
  rules engine only.

  Scenario: A two-year target is open admission
    Given an admission check for target "Delgado Community College"
    Then the institution type is "two-year"
    And the admission verdict is "open-admission"

  Scenario: A private target is outside the state minimum standards
    Given an admission check for target "Tulane University"
    Then the institution type is "private"
    And the admission verdict is "not-applicable-private"

  Scenario: Institution types follow the Regents categories
    Given an admission check for target "Louisiana State University and A&M College"
    Then the institution type is "flagship"
    Given an admission check for target "University of New Orleans"
    Then the institution type is "statewide"
    Given an admission check for target "Grambling State University"
    Then the institution type is "hbcu"
    Given an admission check for target "Southern University Shreveport"
    Then the institution type is "two-year"

  Scenario: The flagship earned-credits path is met at 30 hours and a 2.5 GPA
    Given an admission check for target "Louisiana State University and A&M College" with 30 earned hours and a 2.5 GPA
    And English and math are completed with a C or better
    Then the "earned-credits" path status is "meets"
    And the admission verdict is "meets-state-minimum"

  Scenario: The flagship earned-credits path fails on GPA alone
    Given an admission check for target "Louisiana State University and A&M College" with 30 earned hours and a 2.4 GPA
    And English and math are completed with a C or better
    Then the "earned-credits" path status is "does-not-meet"
    And the missing requirements include "a GPA of at least 2.5"
    And the admission verdict is "does-not-meet-state-minimum"

  Scenario: The statewide earned-credits path is met at 24 hours and a 2.25 GPA
    Given an admission check for target "University of Louisiana at Lafayette" with 24 earned hours and a 2.25 GPA
    And English and math are completed with a C or better
    Then the "earned-credits" path status is "meets"
    And the admission verdict is "meets-state-minimum"

  Scenario: The regional earned-credits path fails without the English course
    Given an admission check for target "McNeese State University" with 18 earned hours and a 2.0 GPA
    And math is completed with a C or better
    Then the "earned-credits" path status is "does-not-meet"
    And the missing requirements include "college-level English with a C or better"

  Scenario: An associate degree meets the minimum at any four-year type
    Given an admission check for target "University of New Orleans" with 10 earned hours and a 2.0 GPA
    And the student holds an associate degree
    Then the "associate-degree" path status is "meets"
    And the admission verdict is "meets-state-minimum"

  Scenario: The bridge path is met at 12 hours with English and math
    Given an admission check for target "Southeastern Louisiana University" with 12 earned hours and a 2.0 GPA
    And the student is in a partnership bridge program
    And English and math are completed with a C or better
    Then the "bridge" path status is "meets"
    And the admission verdict is "meets-state-minimum"

  Scenario: The adult path cannot be decided from the state minimums alone
    Given an admission check for target "University of Louisiana at Monroe" with 20 earned hours and a 2.1 GPA
    And the student is 25 or older and meets placement for standalone math or English
    Then the "adult" path status is "cannot-tell"
    And the admission verdict is "cannot-tell"

  Scenario: A missing GPA makes the earned-credits path undecidable
    Given an admission check for target "Nicholls State University" with 20 earned hours and no GPA
    And English and math are completed with a C or better
    Then the "earned-credits" path status is "cannot-tell"
    And the admission verdict is "cannot-tell"
