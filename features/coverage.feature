Feature: Coverage expansion from the Regents matrix
  Coverage grows college by college from public sources only.
  Baton Rouge Community College publishes no statewide course
  numbers in its own catalog, so its pairings come from the Board
  of Regents Course Articulation Matrix, 2025-26, the state's own
  published table, extracted from the public matrix view. A BRCC
  course now checks against every other covered college, and
  courses from covered colleges check against BRCC.

  Scenario: A BRCC English course counts toward the degree at UL Lafayette
    Given a coverage check of BRCC ENGL 1013 toward UL Lafayette
    Then the result for "ENGL 1013" is matched with 3 degree hours

  Scenario: A Delgado course counts at BRCC under BRCC's own code
    Given a coverage check of Delgado ENGL 101 toward BRCC
    Then the result for "ENGL 101" shows as "ENGL 1013" at BRCC with 3 degree hours

  Scenario: A BRCC psychology course counts toward the degree at UNO
    Given a coverage check of BRCC PSYC 2013 toward the University of New Orleans
    Then the result for "PSYC 2013" is matched with 3 degree hours

  Scenario: A Southeastern English course counts toward the degree at Delgado
    Given a coverage check of Southeastern ENGL 1010 toward Delgado
    Then the result for "ENGL 1010" is matched with 3 degree hours

  Scenario: A Southeastern algebra course counts toward the degree at UNO
    Given a coverage check of Southeastern MATH 1610 toward the University of New Orleans
    Then the result for "MATH 1610" is matched with 3 degree hours

  Scenario: A BRCC psychology course counts toward the degree at LSU
    Given a coverage check of BRCC PSYC 2013 toward LSU
    Then the result for "PSYC 2013" is matched with 3 degree hours

  Scenario: A Southeastern English course counts toward the degree at LSU
    Given a coverage check of Southeastern ENGL 1010 toward LSU
    Then the result for "ENGL 1010" is matched with 3 degree hours

  Scenario: A Northwestern English course counts toward the degree at LSU
    Given a coverage check of Northwestern ENGL 1010 toward LSU
    Then the result for "ENGL 1010" is matched with 3 degree hours

  Scenario: A Northwestern psychology course counts toward the degree at BRCC
    Given a coverage check of Northwestern PSYC 1010 toward BRCC
    Then the result for "PSYC 1010" is matched with 3 degree hours

  Scenario: A Louisiana Tech English course counts toward the degree at LSU
    Given a coverage check of Louisiana Tech ENGL 1013 toward LSU
    Then the result for "ENGL 1013" is matched with 3 degree hours

  Scenario: A Louisiana Tech psychology course counts toward the degree at Southeastern
    Given a coverage check of Louisiana Tech PSYC 1023 toward Southeastern
    Then the result for "PSYC 1023" is matched with 3 degree hours

  Scenario: A Delgado art history course counts toward the degree at UL Lafayette
    Given a coverage check of Delgado FNAR 125 toward UL Lafayette
    Then the result for "FNAR 125" is matched with 3 degree hours

  Scenario: A Delgado music appreciation course counts toward the degree at UL Lafayette
    Given a coverage check of Delgado MUSC 105 toward UL Lafayette
    Then the result for "MUSC 105" is matched with 3 degree hours
