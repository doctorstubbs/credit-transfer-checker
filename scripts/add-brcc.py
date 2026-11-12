#!/usr/bin/env python3
"""Stage 28 (Nov 11, 2026): BRCC coverage from the Board of Regents
Articulation Matrix, Home Courses page, MatrixYear 2025-26, extracted
from the public Power BI view discipline by discipline (171 rows,
33 disciplines). BRCC's own 2026-2027 catalog publishes no LCCN tags,
so the Regents matrix is the public source for BRCC pairings.

Transforms rows into data/courses.json records: one record per home
course code, lccns merged across rows, asterisks stripped from LCCNs
(matrix footnote markers; other colleges carry the plain code, and
matching is on the plain code). Titles are the matrix's Common Course
Titles, because the report shows no home title column.
"""
import json
import re
import sys

ROWS = """
CACC 2113 | ACCT 2113 | Intro to Financial Accounting | Accounting
CACC 2213 | ACCT 2213 | Intro to Managerial Accounting | Accounting
CACC 2313 | ACCT 2313 | Principles of Accounting Part I | Accounting
CACC 2323 | ACCT 2323 | Principles of Accounting Part II | Accounting
CACC 2413 | ACCT 2413 | Computerized Accounting | Accounting
CACC 2513 | ACCT 2513 | Payroll Accounting | Accounting
CACC 2613 | ACCT 2613 | Tax Accounting - Individuals | Accounting
CATR 1013 | ANTH 1013 | Intro to Anthropology | Anthropology
CATR 2013 | ANTH 2013 | Cultural Anthroplogy | Anthropology
CART 1023 | ARTS 1023 | Intro to Visual Arts | Art
CART 1113 | ARTS 1113 | Art Structure/2-D Design | Art
CART 1123 | ARTS 1123 | Art Structure/3-D Design | Art
CART 2103 | ARTS 2103 | Art History I | Art
CART 2113 | ARTS 2113 | Art History II | Art
CART 2203 | ARTS 2203 | Beginning Drawing | Art
CART 2213 | ARTS 2213 | Figure Drawing | Art
CAST 1103 | ASTR 1103 | Astronomy/The Solar System | Astronomy
CAST 1113 | ASTR 1103 | Astronomy/Stars & Galaxies | Astronomy
CBIO 1011 | BIOL 1011 | General Biology I (Science Majors) Lecture | Biological Sciences
CBIO 1013 | BIOL 1013 | General Biology I (Science Majors) | Biological Sciences
CBIO 1021 | BIOL 1021 | General Biology II (Science Majors) Lecture | Biological Sciences
CBIO 1023 | BIOL 1023 | General Biology II (Science Majors) | Biological Sciences
CBIO 1103 | BIOL 1103 | General Biology I (Non-Science Majors) | Biological Sciences
CBIO 1113 | BIOL 2043 | General Microbiology | Biological Sciences
CBIO 1203 | BIOL 1203 | Human Biology | Biological Sciences
CBIO 2211 | BIOL 2211 | Human Anatomy & Physiology I Lab | Biological Sciences
CBIO 2213 | BIOL 2213 | Human Anatomy & Physiology I | Biological Sciences
CBIO 2221 | BIOL 2221 | Human Anatomy & Physiology II Lab | Biological Sciences
CBIO 2223 | BIOL 2223 | Human Anatomy & Physiology II | Biological Sciences
CBIO 2313 | BIOL 2313 | General Biology I (Science Majors) | Biological Sciences
CBIO 2611 | BIOL 2611 | Principles of Microbiology Lab | Biological Sciences
CBIO 2613 | BIOL 2613 | Principles of Microbiology | Biological Sciences
CBIO 2903 | BIOL 2903 | Marine Biology | Biological Sciences
CBIO 3103 | BIOL 3103 | Genetics | Biological Sciences
CBIO 3113 | BIOL 3113 | Ecology | Biological Sciences
CBIO 3333 | BIOL 3333 | Botany | Biological Sciences
CBUS 1003 | BUSN 1003 | General/Intro to Business Administration | Business
CBUS 2103 | BUSN 2103 | Business Law | Business
CBUS 2203 | CSCI 2203 | Computer Applications | Business
CBUS 2213 | CSCI 1933 | Intro to Programming | Business
CBUS 2303 | MATH 2303 | Business Statistical Methods I | Business
CBUS 2313 | MATH 2313 | Business Statistical Methods II | Business
CCEM 1003 | CHEM 1003 | General, Organic & Biochemistry | Chemistry
CCEM 1121 | CHEM 1121 | Chemistry I (Science Majors) Lab | Chemistry
CCEM 1123 | CHEM 1123 | Chemistry I (Science Majors) | Chemistry
CCEM 1131 | CHEM 1131 | Chemistry II (Science Majors) Lab | Chemistry
CCEM 1133 | CHEM 1133 | Chemistry II (Science Majors) | Chemistry
CCEM 2211 | CHEM 2211 | Organic Chemistry I Lab | Chemistry
CCEM 2213 | CHEM 2213 | Organic Chemistry I | Chemistry
CCEM 2221 | CHEM 2221 | Organic Chemistry II Lab | Chemistry
CCEM 2223 | CHEM 2223 | Organic Chemistry II | Chemistry
CCOM 1013 | SPCH 1013 | Fundamentals of Communication | Communication
CCOM 2013 | SPCH 2013 | Public Speaking | Communication
CCOM 2113 | SPCH 2113 | Argumentation and Debate | Communication
CCOM 2213 | SPCH 2213 | Interpersonal Communication | Communication
CCOM 2313 | SPCH 2313 | Business & Professional Communication | Communication
CCRJ 1013 | CJUS 1013 | Intro to Criminal Justice | Criminal Justice
CCRJ 2013 | CJUS 2013 | Intro to Corrections | Criminal Justice
CCRJ 2113 | CJUS 2513 | Criminology | Criminal Justice
CCRJ 2213 | CJUS 2213 | Criminal Law | Criminal Justice
CCRJ 2313 | CJUS 2313 | Intro to Policing | Criminal Justice
CCRJ 2413 | CJUS 2413 | Juvenile Justice | Criminal Justice
CCRJ 2613 | CJUS 2613 | Judicial Process | Criminal Justice
CULA 1013 | CULN 1143 | Introduction to Culinary Arts | Culinary Arts
CULA 2053 | CULN 1133 | Food Service Layout, Equipment, Safety and Sanitation | Culinary Arts
CECN 2113 | ECON 2113 | Economic Principles | Economics
CECN 2213 | ECON 2213 | Macroeconomics | Economics
CECN 2223 | ECON 2223 | Microeconomics | Economics
CECN 2313 | ECON 2313 | Money, Banking & the Economy (Lower Level) | Economics
CEDU 1013 | TEAC 2033 | Foundations in Multicultural Education | Education
CENL 1013* | ENGL 1013 | English Composition I | English
CENL 1023 | ENGL 1023 | English Composition II | English
CENL 2123 | ENGL 2123 | Major British Writers | English
CENL 2173 | ENGL 2173 | Major American Writers | English
CENL 2223 | ENGL 2223 | Major World Writers | English
CENL 2303 | ENGL 2303 | Intro to Fiction | English
CENL 2313 | ENGL 2313 | Intro to Poetry and/or Drama | English
CENL 2323 | ENGL 2323 | Intro to Literature | English
CENL 2403 | ENGL 2403 | Intro to African American Literature | English
CENL 2503 | ENGL 2503 | Mythology or Folklore | English
CENL 2503 | HUMN 2103 | Mythology or Folklore | English
CENL 2513 | ENGL 2513 | Foundations of Professional Writing (Lower Level) | English
CENL 2523 | ENGL 2023 | Creative Writing (Various Genres) | English
CENL 2523 | ENGL 2033 | Creative Writing (Various Genres) | English
CENL 2523 | ENGL 2053 | Creative Writing (Various Genres) | English
CENL 2523 | ENGL 2093 | Creative Writing (Various Genres) | English
CEVS 1103 | ENSC 1103 | Environmental Science | Environmental Sciences
CFRN 1013 | FREN 1013 | Elementary French I (3 credit hours) | French
CFRN 1014 | FREN 1013 | Elementary French I (4 credit hours) | French
CFRN 1023 | FREN 1023 | Elementary French II (3 credit hours) | French
CFRN 1024 | FREN 1023 | Elementary French II (4 credit hours) | French
CFRN 2013 | FREN 2013 | Intermediate French I (3 credit hours) | French
CFRN 2014 | FREN 2013 | Intermediate French I (4 credit hours) | French
CFRN 2023 | FREN 2023 | Intermediate French II (3 credit hours) | French
CGRG 2113 | GEOG 2113 | World Regional Geography | Geography
CGEO 1103 | GEOL 1103 | Physical Geology | Geology and Earth Sciences
CHLT 1103 | HLSC 1103 | Medical Terminology | Health Studies
CHIS 1113 | HIST 1113 | World Civilizations I | History
CHIS 1123 | HIST 1123 | World Civilizations II | History
CHIS 2013 | HIST 2013 | American History I | History
CHIS 2023 | HIST 2023 | American History II | History
CHIS 2033 | HIST 2033 | Louisiana History | History
CHIS 2103 | HIST 2103 | African-American History | History
CHTM 1003 | CULN 1123 | Survey of Hospitality and Tourism | Hospitality and Tourism Management
CHTM 2053 | CULN 1133 | Food Safety and Sanitation | Hospitality and Tourism Management
CHUM 2013 | HUMN 2013 | Africa and the Middle East | Humanities
CHUM 2213 | HUMN 2213 | Humanities I | Humanities
CHUM 2223 | HUMN 2223 | Humanities II | Humanities
CMGM 2013 | MANG 2103 | Principles of Management (Lower Level) | Management
CMGM 2213 | MANG 2213 | Human Resource Mgt (Lower Level) | Management
CMGM 2313 | MANG 2313 | Small Business Mgt (Lower Level) | Management
CMGM 2413 | MANG 2413 | Intro to Entrepreneurship (Lower Level) | Management
CMKT 2003 | BUSN 2003 | Foundations of Marketing (Lower Level) | Marketing
CMAT 1103* | MATH 1103 | Contemporary Mathematics | Mathematics
CMAT 1203* | MATH 1203 | Applied Algebra | Mathematics
CMAT 1204* | MATH 1003 | Nature of Mathematics | Mathematics
CMAT 1213* | MATH 1213 | College Algebra | Mathematics
CMAT 1223 | MATH 1223 | Trigonometry | Mathematics
CMAT 1235 | MATH 1235 | College Algebra and Trigonometry (5 credit hours) | Mathematics
CMAT 1236 | MATH 1235 | College Algebra and Trigonometry (6 credit hours) | Mathematics
CMAT 1303* | MATH 1303 | Intro to Statistics | Mathematics
CMAT 1313* | MATH 1313 | Finite Mathematics | Mathematics
CMAT 1413 | MATH 1673 | Mathematics for Elementary Teachers | Mathematics
CMAT 1423 | MATH 1683 | Geometry for Elementary Teachers | Mathematics
CMAT 2103 | MATH 2103 | Applied Calculus | Mathematics
CMAT 2115 | MATH 2115 | Calculus I (5 credit hours) | Mathematics
CMAT 2116 | MATH 2115 | Calculus I (6 credit hours) | Mathematics
CMAT 2125 | MATH 2125 | Calculus II (5 credit hours) | Mathematics
CMAT 2133 | MATH 2134 | Calculus III | Mathematics
CMUS 1013 | MUSC 1013 | Music Appreciation | Music
CMUS 1023 | MUSC 1023 | Jazz Appreciation | Music
CPHL 1013 | PHIL 1013 | Intro to Philosophy | Philosophy
CPHL 2013 | PHIL 2013 | Intro to Ethics | Philosophy
CPHL 2113 | PHIL 2113 | Intro to Logic | Philosophy
CPHY 1013 | PHYS 1013 | Intro to the Concepts in Physics | Physics
CPHY 1023 | PHSC 1023 | Physical Science I | Physics
CPHY 1033 | PHSC 1033 | Physical Science II | Physics
CPHY 2111 | PHYS 2111 | Physics I Lab (Algebra/Trigonometry) | Physics
CPHY 2113 | PHYS 2113 | Physics I (Algebra/Trigonometry) | Physics
CPHY 2121 | PHYS 2121 | Physics II Lab (Algebra/Trigonometry) | Physics
CPHY 2123 | PHYS 2123 | Physics II (Algebra/Trigonometry) | Physics
CPHY 2131 | PHYS 2111 | Physics I Lab (Calculus) | Physics
CPHY 2133 | PHYS 2133 | Physics I (Calculus) | Physics
CPHY 2141 | PHYS 2121 | Physics II Lab (Calculus) | Physics
CPHY 2143 | PHYS 2143 | Physics II (Calculus) | Physics
CPHY 2153 | PHYS 2153 | Physics III (Calculus) | Physics
CPOL 2013 | POLI 2013 | Intro to American Government | Political Science
CPOL 2213 | POLI 2213 | Intro to Comparative Government | Political Science
CPSY 2013 | PSYC 2013 | Intro to Psychology | Psychology
CPSY 2113 | PSYC 2113 | Developmental Psychology | Psychology
CPSY 2213 | PSYC 2083 | Adolescent Psychology | Psychology
CPSY 2313 | PSYC 2313 | Child Psychology | Psychology
CPSY 2413 | PSYC 2413 | Social Psychology | Psychology
CPSY 2613 | PSYC 2613 | Educational Psychology | Psychology
CREL 2213 | PHIL 2283 | World Religions | Religion
CSOC 2013 | SOCL 2013 | Intro to Sociology | Sociology
CSOC 2113 | SOCL 2113 | Social Problems | Sociology
CSOC 2213 | SOCL 2213 | Marriage and Family | Sociology
CSOC 2413 | SOCL 2413 | Race, Class & Ethnicity | Sociology
CSPN 1013 | SPAN 1013 | Elementary Spanish I (3 credit hours) | Spanish
CSPN 1014 | SPAN 1013 | Elementary Spanish I (4 credit hours) | Spanish
CSPN 1023 | SPAN 1023 | Elementary Spanish II (3 credit hours) | Spanish
CSPN 1024 | SPAN 1023 | Elementary Spanish II (4 credit hours) | Spanish
CSPN 2013 | SPAN 2013 | Intermediate Spanish I (3 credit hours) | Spanish
CSPN 2014 | SPAN 2013 | Intermediate Spanish I (4 credit hours) | Spanish
CSPN 2023 | SPAN 2023 | Intermediate Spanish II (3 credit hours) | Spanish
CTHE 1013 | THTR 1013 | Intro to Theatre | Theatre
CTHE 2103 | THTR 2103 | Acting I | Theatre
CTHE 2113 | THTR 2113 | Acting II | Theatre
CTHE 2203 | THTR 2203 | Voice for the Stage | Theatre
CTHE 2303 | THTR 1023 | Stagecraft | Theatre
""".strip()


def main():
    rows = []
    for line in ROWS.splitlines():
        parts = [p.strip() for p in line.split("|")]
        assert len(parts) == 4, line
        rows.append(parts)
    print("rows:", len(rows))

    by_code = {}
    for lccn_raw, code, title, _disc in rows:
        lccn = lccn_raw.rstrip("*")
        rec = by_code.setdefault(code, {"code": code, "title": title, "lccns": []})
        if lccn not in rec["lccns"]:
            rec["lccns"].append(lccn)
    courses = sorted(by_code.values(), key=lambda r: r["code"])
    print("unique home courses:", len(courses))
    multi = [c for c in courses if len(c["lccns"]) > 1]
    print("courses with multiple LCCNs:", len(multi))

    with open("data/courses.json") as f:
        data = json.load(f)
    statewide = set(data.get("statewide", {}).keys())
    brcc_lccns = {l for c in courses for l in c["lccns"]}
    print("BRCC LCCNs:", len(brcc_lccns), "| in statewide 292 set:", len(brcc_lccns & statewide))
    for name, col in data["colleges"].items():
        theirs = {l for c in col["courses"] for l in c["lccns"]}
        print(f"overlap with {name}: {len(brcc_lccns & theirs)}")

    data["colleges"]["Baton Rouge Community College"] = {
        "catalog": "Board of Regents Articulation Matrix, 2025-26",
        "courses": courses,
    }
    note = ("Baton Rouge Community College: Louisiana Board of Regents Course "
            "Articulation Matrix, 2025-26 edition (public Power BI view, Home "
            "Courses page, extracted Nov 11, 2026; BRCC's own catalog publishes "
            "no LCCN tags, so the Regents matrix is the public source; titles "
            "are the matrix Common Course Titles)")
    if note not in data["meta"]["builtFrom"]:
        data["meta"]["builtFrom"].append(note)
    with open("data/courses.json", "w") as f:
        json.dump(data, f, indent=1)
    print("courses.json updated")


if __name__ == "__main__":
    sys.exit(main())
