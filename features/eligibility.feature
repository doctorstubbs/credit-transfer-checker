Feature: Dual enrollment eligibility check
  Before a family plans courses, they need to know whether the
  student can take dual enrollment at this college yet. The check
  reads the college's own published criteria where we have them
  and the Board of Regents Policy 2.22 statewide floor where we
  do not. Eligible means the published minimums are met, never a
  promise of admission. Not yet names the exact requirement that
  is missing. Cannot tell names the information still needed.

  Scenario: A Delgado student who clears the published minimums is eligible
    Given an eligibility check at "Delgado Community College" for a junior with GPA 2.8 and ACT composite 20 English 19 Math 20
    Then the eligibility status is "eligible"

  Scenario: A Delgado student below the GPA floor is not yet eligible
    Given an eligibility check at "Delgado Community College" for a junior with GPA 2.3 and ACT composite 20 English 19 Math 20
    Then the eligibility status is "not-yet"
    And the missing list names the 2.5 GPA

  Scenario: A counselor recommendation covers low scores at Delgado
    Given an eligibility check at "Delgado Community College" for a junior with GPA 2.6 and ACT composite 18 English 16 Math 19 and a counselor recommendation
    Then the eligibility status is "eligible"

  Scenario: Delgado without scores or a recommendation cannot be called
    Given an eligibility check at "Delgado Community College" for a senior with GPA 2.6 and no scores and no recommendation
    Then the eligibility status is "cannot-tell"

  Scenario: The Delgado technical track uses its own lower floor
    Given a technical eligibility check at "Delgado Community College" for a junior with GPA 2.1
    Then the eligibility status is "eligible"

  Scenario: A UL Lafayette senior clears the senior GPA minimum
    Given an eligibility check at "University of Louisiana at Lafayette" for a senior with GPA 2.6 in subject "math" with ACT Math 19
    Then the eligibility status is "eligible"

  Scenario: A UL Lafayette junior is held to the junior GPA minimum
    Given an eligibility check at "University of Louisiana at Lafayette" for a junior with GPA 2.6 in subject "math" with ACT Math 19
    Then the eligibility status is "not-yet"
    And the missing list names the 2.75 GPA

  Scenario: A UL Lafayette senior below the English minimum is not yet eligible
    Given an eligibility check at "University of Louisiana at Lafayette" for a senior with GPA 2.6 in subject "english" with ACT English 17
    Then the eligibility status is "not-yet"
    And the missing list names the English minimum

  Scenario: UNO is read against the state floor, labeled as such
    Given an eligibility check at "University of New Orleans" for a junior with GPA 2.7 and a counselor recommendation
    Then the eligibility status is "eligible"
    And the basis names Policy 2.22

  Scenario: A college with no published rules in the data cannot be called
    Given an eligibility check at "Example College" for a junior with GPA 3.0
    Then the eligibility status is "cannot-tell"
