Feature: What to take next, the gap analysis
  A check that only looks backward is half the product. Given the
  courses a student has already taken at one college and the
  university they aim for, the gap analysis computes what is still
  owed and lists courses at the student's own college whose credits
  are guaranteed to count at the target, drawn from the same
  verified matrix and statewide common course data as the check.
  With a transcribed major pathway it works requirement by
  requirement; without one it falls back to the 39 hour general
  education block of the Louisiana Transfer Degree.

  Scenario: A pathway gap analysis carries the link to its published document
    Given a gap analysis for Psychology at Delgado toward the Louisiana State University of New Orleans with "ENGL 101" taken
    Then the gap plan links the source document "https://www.laregents.edu/wp-content/uploads/2024/09/Psychology-Pathway.pdf"

  Scenario: A pathway gap analysis credits what was taken and lists what is left
    Given a gap analysis for Psychology at Delgado toward the Louisiana State University of New Orleans with "ENGL 101" taken
    Then the gap analysis basis is the pathway
    And the gap analysis shows 3 hours taken and 45 hours remaining
    And the gap requirement "Composition 1" is fully taken
    And the gap requirement "College Algebra" offers a Delgado course that counts at the target

  Scenario: Without a pathway the gap analysis falls back to the general education block
    Given a gap analysis at Delgado toward the Louisiana State University of New Orleans with "ENGL 101, ENGL 102" taken and no pathway
    Then the gap analysis basis is the general education block
    And the gap analysis totals 39 hours with 6 hours taken
    And the gap area "English Composition" is met
    And the gap area "Mathematics/Analytical Reasoning" still needs 6 hours with courses that count at the target

  Scenario: A gap analysis with nothing taken leaves the whole block remaining
    Given a gap analysis at Delgado toward the Louisiana State University of New Orleans with nothing taken and no pathway
    Then the gap analysis totals 39 hours with 0 hours taken
    And the gap analysis shows 39 hours remaining

  Scenario: A private target gets no guarantee in the gap analysis
    Given a gap analysis for Psychology at Delgado toward Loyola with nothing taken
    Then the gap analysis does not apply the state guarantee
    And no gap course is marked as counting at the target

  Scenario: An uncovered source college is named, not guessed
    Given a gap analysis at Tulane toward the Louisiana State University of New Orleans with nothing taken and no pathway
    Then the gap analysis reports the source college as unknown
