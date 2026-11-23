Feature: Coverage data carries a last verified date per college
  Accuracy is the product, so coverage is dated. Every covered
  college record carries the date its course data was last
  verified against the published source it was built from: the
  extraction dates recorded in the dataset's own source list, and
  the stage sync date where the source list records no date. The
  three Louisiana colleges with no verified data are absent from
  the dataset and stay on the coverage request path.

  Scenario: Every covered college carries a last verified date
    Given the coverage data for all covered colleges
    Then all 33 covered colleges carry a last verified date

  Scenario: The dates match the recorded source evidence
    Given the coverage data for all covered colleges
    Then Delgado Community College was last verified on 2026-11-08
    And the Louisiana State University of New Orleans was last verified on 2026-11-08
    And Baton Rouge Community College was last verified on 2026-11-11
    And the University of Louisiana at Lafayette was last verified on 2026-11-12
    And South Louisiana Community College was last verified on 2026-11-16
    And the University of Holy Cross was last verified on 2026-11-17

  Scenario: The uncovered colleges are absent from the dataset
    Given the coverage data for all covered colleges
    Then Dillard University is not in the course data
    And Tulane University is not in the course data
    And Xavier University of Louisiana is not in the course data
