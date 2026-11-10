Feature: Actionable results: what counts where, next steps, advisor questions
  Kris's direction, Nov 10, 2026: a check result must separate the
  courses that count toward the degree from the ones that count as
  credit only, end with a concrete next step, and hand the family a
  list of questions to ask the advisor, built from the flagged
  courses. These scenarios pin the guidance layer that turns an
  engine report into those three things.

  Scenario: A direct match counts toward the degree
    Given a checked course "ENGL 101" with data status "matched" and 3 degree credits
    Then the course is grouped as counting toward the degree

  Scenario: A subject elective counts as credit only
    Given a checked course "MATH 120" with data status "subject-elective" and 3 degree credits
    Then the course is grouped as counting as credit only

  Scenario: A course with no match in the data is not counted
    Given a checked course "ARTS 105" with data status "no-match-in-data" and 0 degree credits
    Then the course is grouped as not counted

  Scenario: The transcript next step names the target college
    Given a check for target "University of Louisiana at Lafayette" with one matched course
    Then the next steps include sending the official transcript to "University of Louisiana at Lafayette"

  Scenario: An elective course produces a registrar next step naming the course
    Given a check for target "University of Louisiana at Lafayette" with one elective course "MATH 120"
    Then the next steps include asking the registrar about "MATH 120" as an elective, not a direct match

  Scenario: Advisor questions are built from the flagged courses
    Given a check for target "University of Louisiana at Lafayette" with one elective course "MATH 120" and one uncovered course "ARTS 105"
    Then the advisor questions ask whether "MATH 120" counts toward the degree plan or only as elective hours
    And the advisor questions ask what "ARTS 105" counts as at the target

  Scenario: A clean all-direct check produces no advisor questions
    Given a check for target "University of Louisiana at Lafayette" with one matched course
    Then there are no advisor questions

  Scenario: AP results group by outcome
    Given a check with an AP exact-equivalent result and an AP subject-elective result
    Then the AP exact-equivalent result is grouped as counting toward the degree
    And the AP subject-elective result is grouped as counting as credit only

  Scenario: An AP credit produces a score report next step naming the target
    Given a check for target "University of Louisiana at Lafayette" with an AP exact-equivalent result
    Then the next steps include having the official AP score report sent to "University of Louisiana at Lafayette"

  Scenario: An uncovered source college is named for the coverage request
    Given the covered colleges are "Delgado Community College" and "University of Louisiana at Lafayette"
    And a check from "Baton Rouge Community College" to "University of Louisiana at Lafayette"
    Then the uncovered colleges are "Baton Rouge Community College"

  Scenario: An uncovered target college is named for the coverage request
    Given the covered colleges are "Delgado Community College" and "University of Louisiana at Lafayette"
    And a check from "Delgado Community College" to "Louisiana State University and A&M College"
    Then the uncovered colleges are "Louisiana State University and A&M College"

  Scenario: A fully covered check names no uncovered colleges
    Given the covered colleges are "Delgado Community College" and "University of Louisiana at Lafayette"
    And a check from "Delgado Community College" to "University of Louisiana at Lafayette"
    Then there are no uncovered colleges
