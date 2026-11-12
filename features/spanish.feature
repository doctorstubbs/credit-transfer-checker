Feature: Spanish language results
  A parent who reads Spanish first gets the sentences that matter
  most in Spanish: the summary headline, rebuilt from the same
  totals as the English one so the numbers are the engine's own,
  and the fixed protective steps and questions, translated as
  templates so college names land exactly. Per-course composed
  lines stay in English in this first pass.

  Scenario: The Spanish headline carries the engine's own numbers
    Given a Spanish guidance check with one matched course and one elective course toward the University of New Orleans
    Then the Spanish headline reads "En University of New Orleans: 3 de tus horas de crédito cuentan para el título, 3 cuentan solo como crédito."

  Scenario: The Spanish headline for an uncovered check says the courses cannot be called yet
    Given a Spanish guidance check with one uncovered course toward Delgado Community College
    Then the Spanish headline reads "Aún no hay datos verificados de cursos para Delgado Community College, así que 1 de tus cursos aún no se pueden evaluar."

  Scenario: The protective steps come back in Spanish
    Given a Spanish guidance check with one planned matched course
    Then the Spanish next steps include the choice credit step in Spanish
    And the Spanish advisor questions include the grade protection question in Spanish

  Scenario: The transcript step is translated with the college name in place
    Given a Spanish guidance check with one matched course and one elective course toward the University of New Orleans
    Then the Spanish next steps include the transcript step in Spanish for the University of New Orleans

  Scenario: Status words translate for the checks a family sees
    Then the Spanish label for "eligible" is "Cumple los requisitos publicados"
    And the Spanish label for "not-yet" is "Todavía no"
    And the Spanish label for "complete" is "Completo"
