Feature: Savings estimate for credits that count toward the degree
  Families deciding on courses need the money picture, stated only
  from published rates. The estimate multiplies the hours that count
  toward the degree at the target college by that college's
  published per-credit tuition and fees. Credit-only hours are not
  counted, because elective hours may not shorten the degree. A
  college with no verified published rate gets no estimate, never
  a guessed one.

  Scenario: A rated college and degree hours produce an estimate
    Given the published tuition rates
    When I estimate savings for "University of Louisiana at Lafayette" with 3 degree hours
    Then the savings estimate is 1210 dollars for 3 hours at 403.27 dollars per credit hour
    And the estimate names its source "University of Louisiana at Lafayette, Current Undergraduate Tuition and Fees (Office of Student Cashier)"

  Scenario: The New Orleans rate comes from its own published schedule
    Given the published tuition rates
    When I estimate savings for "University of New Orleans" with 7 degree hours
    Then the savings estimate is 2454 dollars for 7 hours at 350.58 dollars per credit hour
    And the estimate names its source "University of New Orleans, Undergraduate Fee Schedule (Office of the Bursar)"

  Scenario: A full transfer degree plan at a rated college
    Given the published tuition rates
    When I estimate savings for "University of Louisiana at Lafayette" with 60 degree hours
    Then the savings estimate is 24196 dollars for 60 hours at 403.27 dollars per credit hour

  Scenario: A college with no published rate on file gets no estimate
    Given the published tuition rates
    When I estimate savings for "Delgado Community College" with 30 degree hours
    Then there is no savings estimate

  Scenario: Zero degree hours get no estimate
    Given the published tuition rates
    When I estimate savings for "University of Louisiana at Lafayette" with 0 degree hours
    Then there is no savings estimate

  Scenario: A check at a rated college carries the estimate on its degree hours only
    Given a savings check for target "University of Louisiana at Lafayette" with one matched course and one elective course
    Then the guidance carries a savings estimate of 1210 dollars for 3 hours

  Scenario: A check at an unrated college carries no estimate
    Given a savings check for target "Delgado Community College" with one matched course and one elective course
    Then the guidance carries no savings estimate

  Scenario: A complete transfer degree plan carries its price tag
    Given the published tuition rates
    When I build a transfer degree plan from "Delgado Community College" to "University of New Orleans" with tuition rates
    Then the plan carries a savings estimate of 21035 dollars for 60 hours

  Scenario: A plan to UL Lafayette prices every hour it places
    Given the published tuition rates
    When I build a transfer degree plan from "Delgado Community College" to "University of Louisiana at Lafayette" with tuition rates
    Then the plan carries a savings estimate of 24599 dollars for 61 hours
