Feature: Career pathways (Stage 30)
  A visitor names a career interest, the college they attend now,
  and the university they aim for. The pathway engine lays out the
  published Universal Transfer Pathway requirement by requirement:
  which course at their college satisfies it, whether it counts at
  the target, what is already done, and what to take next semester.
  Nothing is shown that the published pathway document, the
  statewide catalog, and the verified college data do not support.

  Scenario: The Psychology pathway carries its published shape
    Given a pathway plan for Psychology at BRCC toward Southeastern
    Then the plan totals 60 hours across 14 requirements
    And the plan lists careers from the published document

  Scenario: College Algebra resolves to a BRCC course that counts at Southeastern
    Given a pathway plan for Psychology at BRCC toward Southeastern
    Then the "College Algebra" requirement is available with statewide number "CMAT 1213" counting at the target

  Scenario: Earned courses show as taken and leave the next semester list
    Given a pathway plan for Psychology at BRCC toward Southeastern with "CMAT 1213, CPSY 2013" already earned
    Then the "College Algebra" requirement is taken
    And the "Intro to Psychology" requirement is taken
    And the next semester does not include "CMAT 1213"

  Scenario: The next semester stays within a full time load
    Given a pathway plan for Psychology at BRCC toward Southeastern
    Then the next semester totals between 12 and 15 hours
    And the next semester starts with "CMAT 1213"

  Scenario: College selected credits fill with courses that count at the target
    Given a pathway plan for Psychology at BRCC toward Southeastern
    Then the "Twelve college-selected credits" requirement is filled with 12 hours that count at the target

  Scenario: An uncovered target is reported honestly, not invented
    Given a pathway plan for Psychology at BRCC toward Tulane
    Then the plan reports the target as not covered
    And the "College Algebra" requirement has no target verdict

  Scenario: An unknown pathway is named, never guessed
    Given a pathway plan for a pathway that does not exist
    Then the pathway plan status is "unknown-pathway"

  Scenario: The Criminal Justice pathway resolves in full at BRCC toward Southeastern
    Given a pathway plan for Criminal Justice at BRCC toward Southeastern
    Then the plan totals 60 hours across 18 requirements
    And the "Intro to Criminal Justice" requirement is available with statewide number "CCRJ 1013" counting at the target
    And the "Courts" requirement is available with statewide number "CCRJ 2613" counting at the target

  Scenario: A real gap is named: the Biology majors sequence is not in BRCC's matrix data
    Given a pathway plan for Biology at BRCC toward LSU
    Then the plan totals 60 hours across 12 requirements
    And the "Intro to Biology I and II" requirement is a gap
    And the plan has 8 gap hours

  Scenario: Accounting at BRCC toward Southeastern resolves except Business Calculus
    Given a pathway plan for Accounting at BRCC toward Southeastern
    Then the plan totals 60 hours across 18 requirements
    And the "Intro to Financial Accounting" requirement is available with statewide number "CACC 2113" counting at the target
    And the "Business Calculus" requirement is a gap
    And the plan has 3 gap hours

  Scenario: Finance at BRCC toward Louisiana Tech resolves except Business Calculus
    Given a pathway plan for Finance at BRCC toward Louisiana Tech
    Then the plan totals 60 hours across 16 requirements
    And the "Business Calculus" requirement is a gap
    And the plan has 3 gap hours

  Scenario: Management at BRCC toward Louisiana Tech resolves except Business Calculus
    Given a pathway plan for Management at BRCC toward Louisiana Tech
    Then the plan totals 60 hours across 16 requirements
    And the "Business Calculus" requirement is a gap
    And the plan has 3 gap hours

  Scenario: Marketing at BRCC toward Southeastern resolves except Business Calculus
    Given a pathway plan for Marketing at BRCC toward Southeastern
    Then the plan totals 60 hours across 16 requirements
    And the "Business Calculus" requirement is a gap
    And the plan has 3 gap hours

  Scenario: Social Work at BRCC toward Southeastern leaves only its two structural gaps
    Given a pathway plan for Social Work at BRCC toward Southeastern
    Then the plan totals 60 hours across 19 requirements
    And the "Three credits of BSW program-specific" requirement is a gap
    And the "Intro to Social Work" requirement is a gap
    And the plan has 6 gap hours

  Scenario: Political Science at BRCC toward UNO runs short on political science courses themselves
    Given a pathway plan for Political Science at BRCC toward UNO
    Then the plan totals 60 hours across 14 requirements
    And the "American Government" requirement is available with statewide number "CPOL 2013" counting at the target
    And the plan has 6 gap hours

  Scenario: Art at Northwestern toward Louisiana Tech lacks only the western art survey
    Given a pathway plan for Art at Northwestern toward Louisiana Tech
    Then the plan totals 60 hours across 16 requirements
    And the "Survey of Western Art 1 and 2" requirement is a gap
    And the plan has 6 gap hours

  Scenario: Computer Science cannot start at BRCC: its matrix record has no computer science courses
    Given a pathway plan for Computer Science at BRCC toward LSU
    Then the plan totals 60 hours across 14 requirements
    And the "Computer Science I" requirement is a gap
    And the plan has 18 gap hours

  Scenario: Kinesiology Sport Management at Delgado toward Southeastern lacks the gateway course
    Given a pathway plan for Kinesiology Sport Management at Delgado toward Southeastern
    Then the plan totals 60 hours across 11 requirements
    And the "Intro to Kinesiology" requirement is a gap
    And the plan has 9 gap hours

  Scenario: Kinesiology Pre-Allied Health at Delgado toward LSU lacks only the gateway course
    Given a pathway plan for Kinesiology Pre-Allied Health at Delgado toward LSU
    Then the plan totals 60 hours across 13 requirements
    And the "Intro to Kinesiology" requirement is a gap
    And the plan has 3 gap hours
