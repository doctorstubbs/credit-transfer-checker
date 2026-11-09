# Build data/courses.json from current sources only:
# - statewide list extracted from the AY 2025-26 Common Course Catalog
#   (data/statewide-courses.json, from the Regents PDF)
# - per-college harvests read from the colleges' own current catalogs
#   (data/harvests/*.txt, lines: CODE | TITLE | LCCN tags)
# No AY 2022-2023 matrix data is used. See docs/DATA-PLAN.md.
import re, json

def norm(tag):
    t = tag.strip().upper().replace('-', ' ')
    t = re.sub(r'\s+', ' ', t)
    m = re.match(r'^([A-Z]{3,4})(\d{4})$', t.replace(' ', ''))
    if m: t = m.group(1) + ' ' + m.group(2)
    return t

def parse(path):
    out = []
    for line in open(path):
        if '|' not in line: continue
        code, title, tags = [p.strip() for p in line.split('|')]
        lccns = []
        for t in re.split(r' / | OR ', tags):
            n = norm(t)
            if n not in lccns: lccns.append(n)
        out.append({'code': code, 'title': title, 'lccns': lccns})
    return out

# AP credit tables harvested from a college's own current catalog
# (lines: EXAM | MIN SCORE | COURSES AWARDED | HOURS). Exam names in
# the catalog are printed in the college's own style; this alias map
# ties each printed name to the College Board exam name the page and
# the scenarios use. Two printed names are deliberately NOT aliased
# to a page exam: the catalog's single "Economics" line is not split
# between AP Macroeconomics and AP Microeconomics by guesswork, and
# the retired "Physics B" is not the same exam as AP Physics 1.
AP_EXAM_ALIASES = {
 'Art History': 'AP Art History',
 'Biology': 'AP Biology',
 'Chemistry': 'AP Chemistry',
 'Computer Science': 'AP Computer Science A',
 'English Language and Composition': 'AP English Language and Composition',
 'English Literature and Composition': 'AP English Literature and Composition',
 'French Language': 'AP French Language and Culture',
 'German Language': 'AP German Language',
 'Government-Politics': 'AP United States Government and Politics',
 'History, American': 'AP United States History',
 'History, European': 'AP European History',
 'Human Geography': 'AP Human Geography',
 'Latin': 'AP Latin',
 'Mathematics: Calculus AB': 'AP Calculus AB',
 'Mathematics: Calculus BC': 'AP Calculus BC',
 'Mathematics: Statistics': 'AP Statistics',
 'Music': 'AP Music Theory',
 'Physics C Mechanics': 'AP Physics C: Mechanics',
 'Physics C Elect-Mag': 'AP Physics C: Electricity and Magnetism',
 'Psychology': 'AP Psychology',
 'Spanish Language': 'AP Spanish Language and Culture',
}

def parse_ap(path):
    table = {}
    for line in open(path):
        if '|' not in line: continue
        parts = [p.strip() for p in line.split('|')]
        if len(parts) != 4: continue
        exam, min_score, courses, hours = parts
        if not min_score.isdigit() or not hours.isdigit(): continue
        canonical = AP_EXAM_ALIASES.get(exam, 'AP ' + exam)
        band = {'minScore': int(min_score),
                'courses': '' if courses.startswith('(') else courses,
                'hours': int(hours)}
        table.setdefault(canonical, []).append(band)
    for bands in table.values():
        bands.sort(key=lambda b: b['minScore'])
    return table

state = json.load(open('data/statewide-courses.json'))
dataset = {
 'meta': {'builtFrom': ['Louisiana Statewide Common Course Catalog, AY 2025-26 edition (Board of Regents)',
   'Delgado Community College Catalog, 2026-2027 (catalog.dcc.edu)',
   'University of Louisiana at Lafayette Undergraduate and Graduate Catalog, 2026-2027 (catalog.louisiana.edu)',
   'University of New Orleans University Catalog, 2026-2027 (catalog.uno.edu; LCCN tags carried in the catalog search index, each pairing exact-verified Nov 8, 2026)'],
   'note': 'Every pairing traces to two current catalogs joined on the Louisiana common course number from each college\'s own current catalog. No AY 2022-2023 matrix data is used.'},
 'subjects': state['subjects'],
 'statewide': {c['lccn']: {'title': c['title'], 'hours': c['hours']} for c in state['courses']},
 'colleges': {
   'Delgado Community College': {'catalog': '2026-2027 catalog', 'courses': parse('data/harvests/delgado-2026-27.txt')},
   'University of Louisiana at Lafayette': {'catalog': '2026-2027 catalog', 'courses': parse('data/harvests/ul-lafayette-2026-27.txt')},
   'University of New Orleans': {'catalog': '2026-2027 catalog', 'courses': parse('data/harvests/uno-2026-27.txt')},
 },
 'apTables': {
   'University of Louisiana at Lafayette': parse_ap('data/harvests/ul-lafayette-ap-2026-27.txt'),
 }
}
json.dump(dataset, open('data/courses.json', 'w'), indent=1)
for name, col in dataset['colleges'].items():
    print(name, len(col['courses']), 'courses')
