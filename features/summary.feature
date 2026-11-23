Feature: One page summary of a free check
  The full audit is the paid document. A family that runs the free
  check still leaves with something they can hand to a counselor:
  a one page printable summary with the courses, the verdicts, the
  totals, the data edition the verdicts came from, and the line
  that keeps it honest: this is guidance, not an official ruling.
  It prints on one page from the browser, no new services.

  Scenario: A summary lists the courses, verdicts, and total of a check
    Given a summary of a Delgado ENGL 101 check toward the Louisiana State University of New Orleans
    Then the summary lists "ENGL 101" counting as "ENGL 1157" with 3 degree hours
    And the summary total is 3 degree hours
    And the summary names the Louisiana State University of New Orleans as the target

  Scenario: A summary carries the edition stamp and the guidance line
    Given a summary of a Delgado ENGL 101 check toward the Louisiana State University of New Orleans
    Then the summary edition names the AY 2025-26 statewide common course catalog
    And the summary says it is guidance, not an official ruling

  Scenario: A summary of a private target check shows the verify rows and promises nothing
    Given a summary of a Delgado ENGL 101 check toward Loyola
    Then the summary lists "ENGL 101" as verify with the university
    And the summary total is 0 degree hours
    And the summary notes that the state guarantee does not apply

  Scenario: The rendered summary is a one page print document
    Given a summary of a Delgado ENGL 101 check toward the Louisiana State University of New Orleans
    Then the rendered summary HTML sets a Letter page for printing
    And the rendered summary HTML carries the guidance line
    And the rendered summary HTML shows the course and the total
