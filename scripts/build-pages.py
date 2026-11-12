#!/usr/bin/env python3
"""Build the checker pages with the Stage 21-33 engines wired in.

Re-runnable. For both public/index.html and docs/index.html:
  1. Refresh the DATA block: COURSES_DATA plus ADMISSION_DATA,
     ELIGIBILITY_DATA, PATHWAYS_DATA, STATEWIDE_DATA, TUITION_DATA,
     APPLICATIONS_DATA, FRAMEWORK_DATA, QUALITY_DATA.
  2. Replace the inlined guidance span with the current
     src/guidance.js (Stage 24/27 rules included).
  3. Insert or replace the marker-delimited sections (coverage
     strip, new tool cards, plan block) from scripts/page/.
  4. Insert or replace the marker-delimited engines script and
     wiring script before </body>.

docs/index.html only:
  5. Replace the inlined checker script block with the current
     src/checker.js (Stage 24 source catalogs included).

public/index.html instead gets the checker inside its engines
block so window.runCheck exists there too; its main check still
runs through the API fetch as before.
"""
import json
import re
import sys

ROOT = __file__.rsplit('/scripts/', 1)[0] + '/'
sys.path.insert(0, ROOT)


def read(p):
    with open(ROOT + p, encoding='utf-8') as f:
        return f.read()


def js_data(name, path):
    data = read(path).strip()
    json.loads(data)  # validate
    return 'var %s = %s;' % (name, data)


def strip_module_exports(src):
    return re.sub(r'^module\.exports.*$', '', src, flags=re.M)


def iife(src, exports):
    """Wrap an engine in an IIFE and export the named functions."""
    body = strip_module_exports(src).rstrip()
    export_lines = '\n'.join(
        '  window.%s = %s;' % (name, name) for name in exports)
    return '(function () {\n%s\n%s\n})();' % (body, export_lines)


def engines_inner(include_checker):
    parts = ['/*CTC-ENGINES-START*/']
    if include_checker:
        parts.append('// src/checker.js')
        parts.append(iife(read('src/checker.js'), ['runCheck']))
    adm = read('src/admission.js').replace(
        "const defaultStandards = require('../data/admission-standards.json');",
        "const defaultStandards = (typeof ADMISSION_DATA !== 'undefined' ? ADMISSION_DATA : null);")
    parts.append('// src/admission.js (data require patched to the page global)')
    parts.append(iife(adm, ['evaluateAdmission', 'institutionTypeOf']))
    parts.append('// src/eligibility.js')
    parts.append(iife(read('src/eligibility.js'), ['evaluateEligibility']))
    parts.append('// src/savings.js')
    parts.append(iife(read('src/savings.js'),
                      ['estimateSavings', 'degreeHoursOf', 'rateFor', 'withSavings']))
    parts.append('// src/planner.js')
    parts.append(iife(read('src/planner.js'), ['buildPlan']))
    parts.append('// src/pathways.js')
    parts.append(iife(read('src/pathways.js'), ['buildPathwayPlan']))
    parts.append('// src/packet.js')
    parts.append(iife(read('src/packet.js'), ['buildPacket']))
    parts.append('// src/i18n.js')
    parts.append(iife(read('src/i18n.js'),
                      ['spanishHeadline', 'translateGuidance', 'statusLabel']))
    parts.append('// src/quality.js')
    parts.append(iife(read('src/quality.js'), ['flagsFor']))
    parts.append('/*CTC-ENGINES-END*/')
    return '\n'.join(parts)


def engines_block(include_checker):
    return '<script>\n' + engines_inner(include_checker) + '\n</script>'


def wiring_inner():
    dict_js = ''
    try:
        es = read('scripts/page/es-dictionary.json').strip()
        json.loads(es)  # validate
        dict_js = 'var CTC_ES_DICT = ' + es + ';\n'
    except FileNotFoundError:
        dict_js = 'var CTC_ES_DICT = {};\n'
    return ('/*CTC-WIRING-START*/\n' + dict_js +
            read('scripts/page/wiring.js').rstrip() +
            '\n/*CTC-WIRING-END*/')


def wiring_block():
    return '<script>\n' + wiring_inner() + '\n</script>'


def replace_block(html, start_marker, end_marker, new_block):
    pat = re.compile(re.escape(start_marker) + r'.*?' + re.escape(end_marker),
                     re.S)
    if pat.search(html):
        return pat.sub(lambda m: new_block, html, count=1)
    # Fallback (Nov 12, 2026): a later insertion can glue content
    # directly onto the end marker with no trailing newline, which
    # made the strict pattern miss and the caller insert a second
    # copy of the block. Match the end marker without its newline.
    if end_marker.endswith('\n'):
        pat2 = re.compile(re.escape(start_marker) + r'.*?' +
                          re.escape(end_marker.rstrip('\n')), re.S)
        if pat2.search(html):
            return pat2.sub(lambda m: new_block, html, count=1)
    return None


def insert_before_body_end(html, block):
    """Insert block before the real </body> (the LAST occurrence;
    the audit script's printable template contains the literal
    string '</body>' earlier in the file)."""
    idx = html.rfind('</body>')
    assert idx > 0, 'no </body> found'
    return html[:idx] + block + '\n' + html[idx:]


STYLE_BLOCK = ('<style>\n/*CTC-STYLE-START*/\n'
               '.secgroup { border: 3px solid #1d3fae; border-radius: 12px; '
               'background: #e8ecfd; padding: 16px 16px 4px; margin-bottom: 16px; }\n'
               '.secgroup > .secband { background: #1d3fae; color: #fff; '
               'font-size: 22px; font-weight: bold; margin: -16px -16px 14px; '
               'padding: 12px 16px; border-radius: 9px 9px 0 0; }\n'
               '.toolcard { border: 2px solid #1d3fae; }\n'
               '.toolcard > h2:first-child { background: #1d3fae; color: #fff; '
               'margin: -18px -18px 14px; padding: 10px 18px; '
               'border-radius: 8px 8px 0 0; }\n'
               '/*CTC-STYLE-END*/\n</style>')

GROUP_OPEN = ('<!--CTC-GROUP-OPEN-->\n'
              '  <div class="secgroup">\n'
              '    <div class="secband">Match your credits</div>\n'
              '<!--/CTC-GROUP-OPEN-->\n')
GROUP_CLOSE = ('<!--CTC-GROUP-CLOSE-->\n'
               '  </div>\n'
               '<!--/CTC-GROUP-CLOSE-->\n')


def build(path, is_docs):
    html = read(path)

    # 1. DATA block
    data_vars = '\n'.join([
        js_data('COURSES_DATA', 'data/courses.json'),
        js_data('ADMISSION_DATA', 'data/admission-standards.json'),
        js_data('ELIGIBILITY_DATA', 'data/eligibility.json'),
        js_data('PATHWAYS_DATA', 'data/pathways.json'),
        js_data('STATEWIDE_DATA', 'data/statewide-courses.json'),
        js_data('TUITION_DATA', 'data/tuition.json'),
        js_data('APPLICATIONS_DATA', 'data/applications.json'),
        js_data('FRAMEWORK_DATA', 'data/transfer-degree.json'),
        js_data('QUALITY_DATA', 'data/quality.json'),
    ])
    new_data = '/*DATA-START*/\n' + data_vars + '\n/*DATA-END*/'
    html2, n_data = re.subn(r'/\*DATA-START\*/.*?/\*DATA-END\*/',
                            lambda m: new_data, html, flags=re.S)
    assert n_data == 1, 'DATA block not replaced in ' + path
    html = html2

    # 2. Guidance span: from the Stage 16 comment to just before
    # the suggest functions.
    guidance = read('src/guidance.js').rstrip()
    pat = re.compile(r'// Guidance layer.*?(?=\nfunction suggestionPool)',
                     re.S)
    html2, n_sub = pat.subn(lambda m: guidance, html, count=1)
    assert n_sub == 1, 'guidance span not found in ' + path
    html = html2

    # 3a. Coverage strip before the first keycard.
    strip = ('<!--CTC-STRIP-START-->\n' + read('scripts/page/sections-strip.html') +
             '<!--CTC-STRIP-END-->\n')
    html2 = replace_block(html, '<!--CTC-STRIP-START-->', '<!--CTC-STRIP-END-->\n',
                          strip.rstrip('\n'))
    if html2 is None:
        anchor = '  <div class="card keycard">'
        assert anchor in html, 'keycard anchor missing in ' + path
        html2 = html.replace(anchor, strip + anchor, 1)
    html = html2

    # 3b. Main sections before the About card.
    main = ('<!--CTC-SECTIONS-START-->\n' + read('scripts/page/sections-main.html') +
            '<!--CTC-SECTIONS-END-->\n')
    html2 = replace_block(html, '<!--CTC-SECTIONS-START-->', '<!--CTC-SECTIONS-END-->\n',
                          main.rstrip('\n'))
    if html2 is None:
        anchor = ('  <div class="card">\n'
                  '    <h2 style="margin-top:0;font-size:20px;">About this check</h2>')
        assert anchor in html, 'About anchor missing in ' + path
        html2 = html.replace(anchor, main + anchor, 1)
    html = html2

    # 3c. Section clarity (Kris, Nov 12, 2026): the whole course
    # checker (sources, AP, target, Match button, results) sits in
    # one banded group so it reads as a single section, and every
    # tool card carries the same banded heading style.
    html2 = replace_block(html, '/*CTC-STYLE-START*/', '/*CTC-STYLE-END*/',
                          STYLE_BLOCK[len('<style>\n'):-len('\n</style>')])
    if html2 is None:
        assert '</head>' in html
        html2 = html.replace('</head>', STYLE_BLOCK + '\n</head>', 1)
    html = html2
    html2 = replace_block(html, '<!--CTC-GROUP-OPEN-->', '<!--/CTC-GROUP-OPEN-->\n',
                          GROUP_OPEN.rstrip('\n'))
    if html2 is None:
        anchor = '  <div class="card keycard">'
        assert anchor in html, 'keycard anchor missing for group in ' + path
        html2 = html.replace(anchor, GROUP_OPEN + anchor, 1)
    html = html2
    html2 = replace_block(html, '<!--CTC-GROUP-CLOSE-->', '<!--/CTC-GROUP-CLOSE-->\n',
                          GROUP_CLOSE.rstrip('\n'))
    if html2 is None:
        anchor = '<!--CTC-SECTIONS-START-->'
        assert anchor in html, 'sections anchor missing for group close in ' + path
        html2 = html.replace(anchor, GROUP_CLOSE + anchor, 1)
    html = html2

    # 4/5. Checker refresh (docs) and engines + wiring before </body>.
    if is_docs:
        checker = strip_module_exports(read('src/checker.js')).rstrip() + \
            '\n\nwindow.runCheck = runCheck;\n'
        pat = re.compile(r'<script>\n// Credit transfer rules engine.*?</script>',
                         re.S)
        html2, n_sub = pat.subn(lambda m: '<script>\n' + checker + '</script>', html, count=1)
        assert n_sub == 1, 'checker block not found in ' + path
        html = html2

    engines = engines_block(include_checker=not is_docs)
    html2 = replace_block(html, '/*CTC-ENGINES-START*/', '/*CTC-ENGINES-END*/',
                          engines_inner(include_checker=not is_docs))
    if html2 is None:
        html2 = insert_before_body_end(html, engines + '\n' + wiring_block())
        html = html2
    else:
        html = html2
        html2 = replace_block(html, '/*CTC-WIRING-START*/', '/*CTC-WIRING-END*/',
                              wiring_inner())
        if html2 is None:
            html2 = insert_before_body_end(html, wiring_block())
            assert html2 != html, 'wiring insertion failed in ' + path
        html = html2

    with open(ROOT + path, 'w', encoding='utf-8') as f:
        f.write(html)
    print('built', path, len(html), 'bytes')


if __name__ == '__main__':
    build('public/index.html', is_docs=False)
    build('docs/index.html', is_docs=True)
