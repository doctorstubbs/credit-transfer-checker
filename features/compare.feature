Feature: Side by side comparison of two target colleges
  A family choosing between two universities should not have to
  run the same check twice. One course list from one college is
  checked against two targets in a single call, and both verdict
  sets come back together, each computed by the same rules engine
  as a single-target check. The single-target check is unchanged.

  Scenario: One course list is checked against two public universities at once
    Given a comparison of Delgado ENGL 101 against the Louisiana State University of New Orleans and Southeastern
    Then the comparison returns 2 result sets
    And the comparison result for the Louisiana State University of New Orleans shows "ENGL 101" as "ENGL 1157" with 3 degree hours
    And the comparison result for Southeastern shows "ENGL 101" as "ENGL 1010" with 3 degree hours

  Scenario: A comparison can pair a public target with a private target
    Given a comparison of Delgado ENGL 101 against the Louisiana State University of New Orleans and Loyola
    Then the comparison result for the Louisiana State University of New Orleans shows "ENGL 101" as "ENGL 1157" with 3 degree hours
    And the comparison result for Loyola marks every course as verify individually
    And the comparison result for Loyola lists "ENGL 101" with the verify individually status

  Scenario: Each side of a comparison matches a single-target check of the same record
    Given a comparison of Delgado ENGL 101 against the Louisiana State University of New Orleans and Southeastern
    Then each comparison side equals the single-target check for that target
