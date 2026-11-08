# Credit Transfer Rules, Louisiana
# Draft v1, Nov 7, 2026. Written test first, in the Beyond Vibe Coding method:
# these scenarios are the domain model. No software gets built until the
# domain owner (Kris) approves each rule. Every scenario is grounded in a
# published source listed in README.md, or it does not ship.
#
# The checker answers one family question for a dual enrollment student:
# "Will this credit count, and what will it count as, at my target college?"

Feature: Louisiana dual enrollment credit transfer check

  Scenario: Transfer degree completes the general education block at a public university
    Given a student completes an Associate of Arts Louisiana Transfer degree at Delgado Community College
    And every course in the degree was passed with a grade of C or better
    When the student enrolls at a Louisiana public university
    Then the report says the general education requirements are met in full
    And the report says no additional general education courses are required

  Scenario: Transfer degree grants junior standing and transfers all 60 hours
    Given a student completes an Associate of Science Louisiana Transfer degree
    And every course in the degree was passed with a grade of C or better
    When the student enrolls at a Louisiana public university
    Then the report shows all 60 credit hours transferring
    And the report shows the student entering with junior standing

  Scenario: A grade below C breaks the transfer degree guarantee for that course
    Given a student completes a Louisiana Transfer degree
    But one course in the degree was passed with a grade of D
    When the credit check runs against a Louisiana public university
    Then the report flags that course as outside the transfer guarantee
    And the report tells the family the receiving university decides that course on its own

  Scenario: The transfer degree does not guarantee a seat in a limited access program
    Given a student completes a Louisiana Transfer degree with junior standing
    When the student applies to a limited access program at a public university
    Then the report says general education is complete
    But the report warns that admission to that program is a separate decision
    And the report lists the program's own admission requirements as still to be met

  Scenario: A major prerequisite is not satisfied just because the transfer degree is complete
    Given a student completes an Associate of Arts Louisiana Transfer degree
    And the student's target major requires a specific prerequisite course the student never took
    When the credit check runs for that major
    Then the report marks that prerequisite as still required
    And the report does not count any elective credit as a substitute for it

  Scenario: A course with a direct equivalent counts as that exact course
    Given a student passed ENGL 1010 at a Louisiana community college
    When the credit check runs against the University of Louisiana at Lafayette
    Then the report shows the credit as ENGL 101, English Composition
    And the report counts it toward the English composition requirement

  Scenario: A course with no direct equivalent becomes a level elective in the same subject
    Given a student passed a course that the receiving university offers no direct match for
    And the receiving university does teach that subject area
    When the credit check runs
    Then the report shows the credit as an elective in that subject at the matching level
    And the report warns that elective credit does not satisfy a named course requirement

  Scenario: A course with no matching subject becomes a general elective
    Given a student passed a course in a subject the receiving university does not offer
    When the credit check runs
    Then the report shows the credit as a general elective
    And the report warns that general elective hours do not shorten the degree plan by themselves

  Scenario: The state guarantee does not bind a private university
    Given a student completed dual enrollment credits in Louisiana
    When the credit check runs against a private university such as Tulane
    Then the report does not promise transfer under the Louisiana public guarantee
    And the report marks every course as verify with the university individually

  Scenario: A below college level course earns no degree credit
    Given a student passed a course numbered below 100 at Delgado Community College
    When the credit check runs
    Then the report shows zero degree credit for that course
    And the report explains that only courses numbered 100 and above fulfill degree requirements

  Scenario: The block guarantee holds at any Louisiana public university, not just one
    Given a student completes an Associate of Arts Louisiana Transfer degree
    And every course in the degree was passed with a grade of C or better
    When the student enrolls at McNeese State University
    Then the report says the general education requirements are met in full
    And the report shows the student entering with junior standing

  Scenario: The state guarantee does not bind other private universities either
    Given a student completed dual enrollment credits in Louisiana
    When the credit check runs against a private university such as Loyola University New Orleans
    Then the report does not promise transfer under the Louisiana public guarantee
    And the report marks every course as verify with the university individually

  Scenario: Credits from two colleges are evaluated in one check, grouped by college
    Given a student earned dual enrollment credits at Delgado Community College
    And at Delgado Community College, the student passed ENGL 1010
    And the student also earned credits at Baton Rouge Community College
    And at Baton Rouge Community College, the student passed a course in a subject the receiving university does not offer
    When the credit check runs against the University of Louisiana at Lafayette
    Then the report lists the ENGL 1010 result under Delgado Community College
    And the report lists the general elective result under Baton Rouge Community College

  Scenario: A transfer degree from one college plus loose courses from another
    Given a student completes an Associate of Arts Louisiana Transfer degree at Delgado Community College
    And every course in the degree was passed with a grade of C or better
    And the student also earned credits at Baton Rouge Community College
    And at Baton Rouge Community College, the student passed a course that the receiving university offers no direct match for
    And the receiving university does teach that subject area
    When the credit check runs against the University of Louisiana at Lafayette
    Then the report says the general education requirements are met in full
    And the report shows the Baton Rouge Community College course as an elective in that subject at the matching level

  Scenario: A planned course with a direct equivalent counts if the grade is earned
    Given a student is planning to take ENGL 1010 at a Louisiana community college, and has not taken it yet
    When the credit check runs against the University of Louisiana at Lafayette
    Then the report marks the course as planned
    And the report shows the planned credit as ENGL 101, English Composition
    And the report says it counts toward the English composition requirement if the student earns a grade of C or better

  Scenario: A planned course that only counts as an elective warns before the money is spent
    Given a student is planning to take a course that the receiving university offers no direct match for
    And the receiving university does teach that subject area
    When the credit check runs
    Then the report marks the course as planned
    And the report shows the credit as an elective in that subject at the matching level
    And the report warns that elective credit does not satisfy a named course requirement

  Scenario: A transfer degree still in progress earns the guarantee only when finished
    Given a student is working on an Associate of Arts Louisiana Transfer degree and has not finished it yet
    When the student enrolls at a Louisiana public university
    Then the report does not say general education is complete yet
    And the report says the transfer guarantee applies when the degree is finished, if every course is passed with a grade of C or better

  Scenario: The tool finds the Delgado English match at UL Lafayette by itself
    Given a student plans to attend "University of Louisiana at Lafayette"
    And the student completed "ENGL 1010" at "Delgado Community College" with a grade of "B"
    When the credit check runs
    Then the course counts as "ENGL 101"
    And the match comes from the current catalog data

  Scenario: Different course numbers at both colleges still match on the state number
    Given a student plans to attend "University of Louisiana at Lafayette"
    And the student completed "MATH 128" at "Delgado Community College" with a grade of "A"
    When the credit check runs
    Then the course counts as "MATH 105"
    And the match comes from the current catalog data

  Scenario: A state number the university does not carry becomes a level elective in a subject it teaches
    Given a student plans to attend "University of Louisiana at Lafayette"
    And the student completed "FREN 101" at "Delgado Community College" with a grade of "B"
    When the credit check runs
    Then the course counts as a level elective at the 100 level
    And the student is warned the credit fills no named course requirement

  Scenario: A subject outside the course data gets an honest not covered answer
    Given a student plans to attend "University of Louisiana at Lafayette"
    And the student completed "ACCT 201" at "Delgado Community College" with a grade of "B"
    When the credit check runs
    Then the course is flagged as not covered by the current course data yet

  Scenario: A planned course matched from the data carries its grade condition
    Given a student plans to attend "University of Louisiana at Lafayette"
    And the student plans to take "MATH 130" at "Delgado Community College"
    When the credit check runs
    Then the course counts as "MATH 109"
    And the course counts only if the student earns a grade of C or better

  Scenario: A course entered with no grade gets the same match with the condition stated
    Given a student plans to attend "University of Louisiana at Lafayette"
    And the student entered "MATH 130" at "Delgado Community College" with no grade yet
    When the credit check runs
    Then the course counts as "MATH 109"
    And the course counts only if the student earns a grade of C or better

  Scenario: A course entered with a grade carries no condition
    Given a student plans to attend "University of Louisiana at Lafayette"
    And the student completed "ENGL 1010" at "Delgado Community College" with a grade of "B"
    When the credit check runs
    Then the course carries no grade condition
