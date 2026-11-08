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

state = json.load(open('data/statewide-courses.json'))
dataset = {
 'meta': {'builtFrom': ['Louisiana Statewide Common Course Catalog, AY 2025-26 edition (Board of Regents)',
   'Delgado Community College Catalog, 2026-2027 (catalog.dcc.edu)',
   'University of Louisiana at Lafayette Undergraduate and Graduate Catalog, 2026-2027 (catalog.louisiana.edu)'],
   'note': 'Every pairing traces to two current catalogs joined on the Louisiana common course number each college prints beside its own course. No AY 2022-2023 matrix data is used.'},
 'subjects': state['subjects'],
 'statewide': {c['lccn']: {'title': c['title'], 'hours': c['hours']} for c in state['courses']},
 'colleges': {
   'Delgado Community College': {'catalog': '2026-2027 catalog', 'courses': parse('data/harvests/delgado-2026-27.txt')},
   'University of Louisiana at Lafayette': {'catalog': '2026-2027 catalog', 'courses': parse('data/harvests/ul-lafayette-2026-27.txt')},
 }
}
json.dump(dataset, open('data/courses.json', 'w'), indent=1)
for name, col in dataset['colleges'].items():
    print(name, len(col['courses']), 'courses')
