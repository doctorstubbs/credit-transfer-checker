Feature: Transfer degree plan
  A student at a covered two-year college who wants a Louisiana public
  university gets a semester-by-semester plan toward the Louisiana
  Transfer Degree, built only from courses verified at both colleges
  under a shared state course number. A plan is complete only when
  every general education area meets its minimum hours and the plan
  reaches 60 hours. Gaps are named, never padded.

  Scenario: A complete plan from Delgado to UNO
    When I build a transfer degree plan from "Delgado Community College" to "University of New Orleans"
    Then the plan status is "complete"
    And the plan has at least 39 general education hours
    And the plan has at least 60 total hours

  Scenario: The English composition area is the composition pair
    When I build a transfer degree plan from "Delgado Community College" to "University of New Orleans"
    Then the plan's "english-composition" area includes "CENL 1013"
    And the plan's "english-composition" area includes "CENL 1023"
    And the plan's "english-composition" area has 6 hours

  Scenario: Every planned course is verified at both colleges
    When I build a transfer degree plan from "Delgado Community College" to "University of New Orleans"
    Then every planned course is offered at the source college
    And every planned course matches a course at the target college

  Scenario: The natural sciences include both branches
    When I build a transfer degree plan from "Delgado Community College" to "University of New Orleans"
    Then the plan's natural sciences include a biological science course
    And the plan's natural sciences include a physical science course

  Scenario: A complete plan from Delgado to UL Lafayette
    When I build a transfer degree plan from "Delgado Community College" to "University of Louisiana at Lafayette"
    Then the plan status is "complete"
    And the plan has at least 60 total hours

  Scenario: The natural sciences are not padded with a second sequence
    When I build a transfer degree plan from "Delgado Community College" to "University of Louisiana at Lafayette"
    Then the plan's "natural-sciences" area has 10 hours

  Scenario: A gap is named instead of padded over
    Given a tiny course dataset with a 4-hour matched course
    When I build a transfer degree plan from "Delgado Community College" to "University of New Orleans"
    Then the plan status is "partial"
    And the plan names a gap in the "fine-arts" area

  Scenario: An uncovered target cannot be planned
    When I build a transfer degree plan from "Delgado Community College" to "Louisiana State University"
    Then the plan status is "cannot-plan"

  Scenario: Course hours come from the state course number
    Given a tiny course dataset with a 4-hour matched course
    When I build a transfer degree plan from "Delgado Community College" to "University of New Orleans"
    Then the planned course "CBIO 1014" counts 4 hours

  Scenario: A complete plan carries the transfer degree guarantee
    When I build a transfer degree plan from "Delgado Community College" to "University of New Orleans"
    Then the plan states the transfer degree guarantee
    And the plan states the guarantee limits

  Scenario: A partial plan does not claim the guarantee
    Given a tiny course dataset with a 4-hour matched course
    When I build a transfer degree plan from "Delgado Community College" to "University of New Orleans"
    Then the plan does not state the transfer degree guarantee

  Scenario: The plan is laid out in semesters of at most 15 hours
    When I build a transfer degree plan from "Delgado Community College" to "University of New Orleans"
    Then every semester in the plan has at most 15 hours
