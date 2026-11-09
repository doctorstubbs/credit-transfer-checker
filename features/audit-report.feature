Feature: The full audit report
  The full audit is the printable document a family takes to an
  advising meeting. It is built from the same check, shows
  everything the check found, and states its own limits.

  Scenario: The audit groups courses by the college they come from
    Given a check of Delgado ENGL 101 and UNO BIOS 1083 toward UL Lafayette
    When the audit is built from that check
    Then the audit has a group for Delgado Community College
    And the audit has a group for University of New Orleans
    And the Delgado group shows ENGL 101 counting as ENGL 101 with 3 degree credits
    And the New Orleans group shows BIOS 1083 counting as BIOL 110

  Scenario: The audit totals the degree credits that count
    Given a check of Delgado ENGL 101 and Delgado MATH 128 toward UL Lafayette
    When the audit is built from that check
    Then the audit total degree credits are 6

  Scenario: AP exams appear in their own section of the audit
    Given a check with AP English Language and Composition scored 3 with the report sent toward UL Lafayette
    When the audit is built from that check
    Then the audit AP section shows AP English Language and Composition earning ENGL 101 for 3 credits
    And the audit total degree credits are 3

  Scenario: A planned course carries its condition into the audit
    Given a check with Delgado ENGL 101 declared as planned toward UL Lafayette
    When the audit is built from that check
    Then the audit entry for ENGL 101 carries the C or better condition

  Scenario: A course outside the data is listed as not covered in the audit
    Given a check with ENGL 1010 typed in from Baton Rouge Community College toward UL Lafayette
    When the audit is built from that check
    Then the audit lists ENGL 1010 as not covered yet
    And the audit total degree credits are 0

  Scenario: The audit states its limits
    Given a check of Delgado ENGL 101 toward UL Lafayette
    When the audit is built from that check
    Then the audit limits say it is not an official evaluation
    And the audit limits say the receiving university makes the final call

  Scenario: The printed audit is a clean document of its own
    Given a check of Delgado ENGL 101 and Delgado MATH 128 toward UL Lafayette
    When the audit is built from that check
    And the audit is rendered for printing
    Then the printed document names University of Louisiana at Lafayette and the total of 6
    And the printed document contains no form elements
