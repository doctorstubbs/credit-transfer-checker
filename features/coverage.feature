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
    Given a coverage check of BRCC PSYC 2013 toward the Louisiana State University of New Orleans
    Then the result for "PSYC 2013" is matched with 3 degree hours

  Scenario: A Southeastern English course counts toward the degree at Delgado
    Given a coverage check of Southeastern ENGL 1010 toward Delgado
    Then the result for "ENGL 1010" is matched with 3 degree hours

  Scenario: A Southeastern algebra course counts toward the degree at UNO
    Given a coverage check of Southeastern MATH 1610 toward the Louisiana State University of New Orleans
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

  Scenario: An SLCC English course counts toward the degree at UNO
    Given a coverage check of SLCC ENGL 1010 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 1010" is matched with 3 degree hours

  Scenario: A Delgado course counts at SLCC under SLCC's own code
    Given a coverage check of Delgado ENGL 101 toward SLCC
    Then the result for "ENGL 101" shows as "ENGL 1010" at SLCC with 3 degree hours

  Scenario: An SLCC psychology course counts toward the degree at LSU
    Given a coverage check of SLCC PSYC 2010 toward LSU
    Then the result for "PSYC 2010" is matched with 3 degree hours

  Scenario: A Nunez English course counts toward the degree at UNO
    Given a coverage check of Nunez ENGL 1010 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 1010" is matched with 3 degree hours

  Scenario: A Delgado course counts at Nunez under one of Nunez's Composition I codes
    Given a coverage check of Delgado ENGL 101 toward Nunez
    Then the result for "ENGL 101" shows as "ENGL 1009" at Nunez with 3 degree hours

  Scenario: A Nunez psychology course counts toward the degree at LSU
    Given a coverage check of Nunez PSYC 1100 toward LSU
    Then the result for "PSYC 1100" is matched with 3 degree hours

  Scenario: A River Parishes English course counts toward the degree at UNO
    Given a coverage check of RPCC ENGL 1013 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 1013" is matched with 3 degree hours

  Scenario: A Delgado course counts at River Parishes under RPCC's own code
    Given a coverage check of Delgado ENGL 101 toward RPCC
    Then the result for "ENGL 101" shows as "ENGL 1013" at RPCC with 3 degree hours

  Scenario: A River Parishes psychology course counts toward the degree at LSU
    Given a coverage check of RPCC PSYC 2013 toward LSU
    Then the result for "PSYC 2013" is matched with 3 degree hours

  Scenario: A Bossier Parish English course counts toward the degree at UNO
    Given a coverage check of BPCC ENGL 101 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 101" is matched with 3 degree hours

  Scenario: A Delgado course counts at Bossier Parish under BPCC's own code
    Given a coverage check of Delgado ENGL 101 toward BPCC
    Then the result for "ENGL 101" shows as "ENGL 101" at BPCC with 3 degree hours

  Scenario: A Bossier Parish psychology course counts toward the degree at LSU
    Given a coverage check of BPCC PSYC 201 toward LSU
    Then the result for "PSYC 201" is matched with 3 degree hours

  Scenario: A SOWELA English course counts toward the degree at UNO
    Given a coverage check of SOWELA ENGL 1010 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 1010" is matched with 3 degree hours

  Scenario: A Delgado course counts at SOWELA under SOWELA's own code
    Given a coverage check of Delgado ENGL 101 toward SOWELA
    Then the result for "ENGL 101" shows as "ENGL 1010" at SOWELA with 3 degree hours

  Scenario: A SOWELA psychology course counts toward the degree at LSU
    Given a coverage check of SOWELA PSYC 2010 toward LSU
    Then the result for "PSYC 2010" is matched with 3 degree hours

  Scenario: A Fletcher English course counts toward the degree at UNO
    Given a coverage check of Fletcher ENGL 1010 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 1010" is matched with 3 degree hours

  Scenario: A Delgado course counts at Fletcher under Fletcher's own code
    Given a coverage check of Delgado ENGL 101 toward Fletcher
    Then the result for "ENGL 101" shows as "ENGL 1006" at Fletcher with 3 degree hours

  Scenario: A Fletcher psychology course counts toward the degree at LSU
    Given a coverage check of Fletcher PSYC 2010 toward LSU
    Then the result for "PSYC 2010" is matched with 3 degree hours

  Scenario: A Louisiana Delta English course counts toward the degree at UNO
    Given a coverage check of Louisiana Delta ENGL 101 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 101" is matched with 3 degree hours

  Scenario: A Delgado course counts at Louisiana Delta under Louisiana Delta's own code
    Given a coverage check of Delgado ENGL 101 toward Louisiana Delta
    Then the result for "ENGL 101" shows as "ENGL 101" at Louisiana Delta with 3 degree hours

  Scenario: A Louisiana Delta psychology course counts toward the degree at LSU
    Given a coverage check of Louisiana Delta PSYC 201 toward LSU
    Then the result for "PSYC 201" is matched with 3 degree hours

  Scenario: A Central Louisiana Tech English course counts toward the degree at UNO
    Given a coverage check of Central Louisiana Tech ENGL 1010 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 1010" is matched with 3 degree hours

  Scenario: A Delgado course counts at Central Louisiana Tech under its own code
    Given a coverage check of Delgado ENGL 101 toward Central Louisiana Tech
    Then the result for "ENGL 101" shows as "ENGL 1010" at Central Louisiana Tech with 3 degree hours

  Scenario: A Central Louisiana Tech psychology course counts toward the degree at LSU
    Given a coverage check of Central Louisiana Tech PSYC 2010 toward LSU
    Then the result for "PSYC 2010" is matched with 3 degree hours

  Scenario: A Northshore English course counts toward the degree at UNO
    Given a coverage check of Northshore ENGL 1015 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 1015" is matched with 3 degree hours

  Scenario: A Delgado course counts at Northshore under its own code
    Given a coverage check of Delgado ENGL 101 toward Northshore
    Then the result for "ENGL 101" shows as "ENGL 1015" at Northshore with 3 degree hours

  Scenario: A Northshore psychology course counts toward the degree at LSU
    Given a coverage check of Northshore PSYC 2015 toward LSU
    Then the result for "PSYC 2015" is matched with 3 degree hours

  Scenario: An LSU Eunice English course counts toward the degree at UNO
    Given a coverage check of LSU Eunice ENGL 1001 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 1001" is matched with 3 degree hours

  Scenario: A Delgado course counts at LSU Eunice under its own code
    Given a coverage check of Delgado ENGL 101 toward LSU Eunice
    Then the result for "ENGL 101" shows as "ENGL 1001" at LSU Eunice with 3 degree hours

  Scenario: An LSU Eunice psychology course lands as a subject elective at LSU
    Given a coverage check of LSU Eunice PSYC 2015 toward LSU
    Then the result for "PSYC 2015" is a subject elective with 3 degree hours

  Scenario: A Northwest Louisiana Tech English course counts toward the degree at UNO
    Given a coverage check of Northwest Louisiana Tech ENGL 1015 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 1015" is matched with 3 degree hours

  Scenario: A Delgado course counts at Northwest Louisiana Tech under its own code
    Given a coverage check of Delgado ENGL 101 toward Northwest Louisiana Tech
    Then the result for "ENGL 101" shows as "ENGL 1015" at Northwest Louisiana Tech with 3 degree hours

  Scenario: A Northwest Louisiana Tech psychology course counts toward the degree at LSU
    Given a coverage check of Northwest Louisiana Tech PSYC 2015 toward LSU
    Then the result for "PSYC 2015" is matched with 3 degree hours

  Scenario: A Southern Shreveport English course counts toward the degree at UNO
    Given a coverage check of Southern Shreveport SENL 101S toward the Louisiana State University of New Orleans
    Then the result for "SENL 101S" is matched with 3 degree hours

  Scenario: A Delgado course counts at Southern Shreveport under its own code
    Given a coverage check of Delgado ENGL 101 toward Southern Shreveport
    Then the result for "ENGL 101" shows as "ENGL 100S" at Southern Shreveport with 3 degree hours

  Scenario: A Southern Shreveport psychology course counts toward the degree at LSU
    Given a coverage check of Southern Shreveport SPSY 201S toward LSU
    Then the result for "SPSY 201S" is matched with 3 degree hours

  Scenario: A Grambling English course counts toward the degree at UNO
    Given a coverage check of Grambling ENG 101 toward the Louisiana State University of New Orleans
    Then the result for "ENG 101" is matched with 3 degree hours

  Scenario: A Delgado course counts at Grambling under its own code
    Given a coverage check of Delgado ENGL 101 toward Grambling
    Then the result for "ENGL 101" shows as "ENG 101" at Grambling with 3 degree hours

  Scenario: A Grambling psychology course counts toward the degree at LSU
    Given a coverage check of Grambling PSY 200 toward LSU
    Then the result for "PSY 200" is matched with 3 degree hours

  Scenario: An LSU Alexandria English course counts toward the degree at UNO
    Given a coverage check of LSUA ENGL 1001 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 1001" is matched with 3 degree hours

  Scenario: A Delgado course counts at LSU Alexandria under its own code
    Given a coverage check of Delgado ENGL 101 toward LSUA
    Then the result for "ENGL 101" shows as "ENGL 1001" at LSUA with 3 degree hours

  Scenario: An LSU Alexandria psychology course counts toward the degree at LSU
    Given a coverage check of LSUA PSYC 2000 toward LSU
    Then the result for "PSYC 2000" is matched with 3 degree hours

  Scenario: An LSU Shreveport English course counts toward the degree at UNO
    Given a coverage check of LSUS ENGL 105 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 105" is matched with 3 degree hours

  Scenario: A Delgado course counts at LSU Shreveport under its own code
    Given a coverage check of Delgado ENGL 101 toward LSUS
    Then the result for "ENGL 101" shows as "ENGL 105" at LSUS with 3 degree hours

  Scenario: An LSU Shreveport psychology course counts toward the degree at LSU
    Given a coverage check of LSUS PSYC 152 toward LSU
    Then the result for "PSYC 152" is matched with 3 degree hours

  Scenario: A McNeese English course counts toward the degree at UNO
    Given a coverage check of McNeese ENGL 101 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 101" is matched with 3 degree hours

  Scenario: A Delgado course counts at McNeese under its own code
    Given a coverage check of Delgado ENGL 101 toward McNeese
    Then the result for "ENGL 101" shows as "ENGL 101" at McNeese with 3 degree hours

  Scenario: A McNeese psychology course counts toward the degree at LSU
    Given a coverage check of McNeese PSYC 101 toward LSU
    Then the result for "PSYC 101" is matched with 3 degree hours

  Scenario: A Nicholls English course counts toward the degree at UNO
    Given a coverage check of Nicholls ENGL 101 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 101" is matched with 3 degree hours

  Scenario: A Delgado course counts at Nicholls under its own code
    Given a coverage check of Delgado ENGL 101 toward Nicholls
    Then the result for "ENGL 101" shows as "ENGL 100" at Nicholls with 3 degree hours

  Scenario: A Nicholls psychology course counts toward the degree at LSU
    Given a coverage check of Nicholls PSYC 101 toward LSU
    Then the result for "PSYC 101" is matched with 3 degree hours

  Scenario: A Southern English course counts toward the degree at UNO
    Given a coverage check of Southern SENL 101B toward the Louisiana State University of New Orleans
    Then the result for "SENL 101B" is matched with 3 degree hours

  Scenario: A Delgado course counts at Southern under its own code
    Given a coverage check of Delgado ENGL 101 toward Southern
    Then the result for "ENGL 101" shows as "ENGL 100" at Southern with 3 degree hours

  Scenario: A Southern psychology course counts toward the degree at LSU
    Given a coverage check of Southern SPSY 201B toward LSU
    Then the result for "SPSY 201B" is matched with 3 degree hours

  Scenario: A SUNO English course counts toward the degree at UNO
    Given a coverage check of SUNO SENL 101N toward the Louisiana State University of New Orleans
    Then the result for "SENL 101N" is matched with 3 degree hours

  Scenario: A Delgado course counts at SUNO under its own code
    Given a coverage check of Delgado ENGL 101 toward SUNO
    Then the result for "ENGL 101" shows as "ENGL 100" at SUNO with 3 degree hours

  Scenario: A SUNO psychology course counts toward the degree at LSU
    Given a coverage check of SUNO SPSY 201N toward LSU
    Then the result for "SPSY 201N" is matched with 3 degree hours

  Scenario: A UL Monroe English course counts toward the degree at UNO
    Given a coverage check of UL Monroe ENGL 1001 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 1001" is matched with 3 degree hours

  Scenario: A Delgado course counts at UL Monroe under its own code
    Given a coverage check of Delgado ENGL 101 toward UL Monroe
    Then the result for "ENGL 101" shows as "ENGL 1001" at UL Monroe with 3 degree hours

  Scenario: A UL Monroe psychology course counts toward the degree at LSU
    Given a coverage check of UL Monroe PSYC 2001 toward LSU
    Then the result for "PSYC 2001" is matched with 3 degree hours

  Scenario: A Centenary English course counts toward the degree at UNO
    Given a coverage check of Centenary ENGL 101 toward the Louisiana State University of New Orleans
    Then the result for "ENGL 101" is matched with 3 degree hours

  Scenario: A Centenary psychology course counts toward the degree at LSU
    Given a coverage check of Centenary PSY 101 toward LSU
    Then the result for "PSY 101" is matched with 3 degree hours

  Scenario: Credits toward Centenary are verified individually because it is private
    Given a coverage check of Delgado ENGL 101 toward Centenary
    Then the report marks every course as verify individually

  Scenario: A Franciscan Missionaries English course counts toward the degree at UNO
    Given a coverage check of FranU WRIT 1310 toward the Louisiana State University of New Orleans
    Then the result for "WRIT 1310" is matched with 3 degree hours

  Scenario: A Franciscan Missionaries psychology course counts toward the degree at LSU
    Given a coverage check of FranU PSYC 1310 toward LSU
    Then the result for "PSYC 1310" is matched with 3 degree hours

  Scenario: Credits toward Franciscan Missionaries are verified individually because it is private
    Given a coverage check of Delgado ENGL 101 toward Franciscan Missionaries
    Then the report marks every course as verify individually

  Scenario: A Louisiana Christian English course counts toward the degree at UNO
    Given a coverage check of Louisiana Christian EN 101 toward the Louisiana State University of New Orleans
    Then the result for "EN 101" is matched with 3 degree hours

  Scenario: A Louisiana Christian psychology course counts toward the degree at LSU
    Given a coverage check of Louisiana Christian PY 220 toward LSU
    Then the result for "PY 220" is matched with 3 degree hours

  Scenario: Credits toward Louisiana Christian are verified individually because it is private
    Given a coverage check of Delgado ENGL 101 toward Louisiana Christian
    Then the report marks every course as verify individually

  Scenario: A Loyola English course counts toward the degree at UNO
    Given a coverage check of Loyola ENGL A100 toward the Louisiana State University of New Orleans
    Then the result for "ENGL A100" is matched with 3 degree hours

  Scenario: A Loyola psychology course counts toward the degree at LSU
    Given a coverage check of Loyola PSYC A100 toward LSU
    Then the result for "PSYC A100" is matched with 3 degree hours

  Scenario: Credits toward Loyola are verified individually because it is private
    Given a coverage check of Delgado ENGL 101 toward Loyola
    Then the report marks every course as verify individually

  Scenario: A private target lists each submitted course as verify individually
    Given a coverage check of Delgado ENGL 101 and ENGL 102 toward Loyola
    Then the report marks every course as verify individually
    And the report lists 2 course results
    And the result for "ENGL 101" carries the verify individually status
    And the result for "ENGL 102" carries the verify individually status

  Scenario: A Holy Cross English course counts toward the degree at UNO
    Given a coverage check of Holy Cross ENG 101 toward the Louisiana State University of New Orleans
    Then the result for "ENG 101" is matched with 3 degree hours

  Scenario: A Holy Cross psychology course counts toward the degree at LSU
    Given a coverage check of Holy Cross PSY 101 toward LSU
    Then the result for "PSY 101" is matched with 3 degree hours

  Scenario: Credits toward Holy Cross are verified individually because it is private
    Given a coverage check of Delgado ENGL 101 toward Holy Cross
    Then the report marks every course as verify individually
