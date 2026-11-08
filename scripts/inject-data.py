import json, re
data = open('data/courses.json').read()
for path in ['public/index.html']:
    s = open(path).read()
    repl = '/*DATA-START*/\nvar COURSES_DATA = ' + data.strip() + ';\n/*DATA-END*/'
    s = re.sub(r'/\*DATA-START\*/.*?/\*DATA-END\*/', lambda m: repl, s, flags=re.S)
    open(path, 'w').write(s)
print('dataset injected into public/index.html')
