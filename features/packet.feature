Feature: Apply-ready packet
  A plan a family cannot act on is only half a plan. The packet
  turns a transfer degree plan into the steps, in order: apply for
  dual enrollment where the state is sending families (ApplyDE,
  the common application), take these exact courses semester by
  semester, send the official college transcript (the step
  families most often get wrong), and apply for admission at the
  target college by its published deadlines. Routes and dates come
  only from the colleges' own published pages. A college with no
  application data yields an honest partial packet.

  Scenario: A Delgado to UNO packet routes dual enrollment through ApplyDE
    Given an apply packet for a plan from "Delgado Community College" to "University of New Orleans"
    Then the packet status is "ready"
    And the first step sends the family to ApplyDE
    And the packet lists ENGL 101 in semester 1
    And the packet carries the UNO Spring final deadline of January 2
    And the packet includes the official transcript step

  Scenario: A Delgado to UL Lafayette packet carries the published freshman deadlines
    Given an apply packet for a plan from "Delgado Community College" to "University of Louisiana at Lafayette"
    Then the packet status is "ready"
    And the packet carries the UL Lafayette Spring deadline of November 30
    And the admission step names the $25 application fee

  Scenario: A target with no application data yields an honest partial packet
    Given an apply packet for a plan to "Example University"
    Then the packet status is "partial-data"
    And the packet prints no deadlines
    And the admission step prints no application link
