// Credit Crosswalk page wiring v2 (Nov 12, 2026): coverage strip,
// results additions (savings line, source line), eligibility
// check, career pathways, transfer degree planner with apply
// ready packet, admission check, and the FULL Spanish toggle:
// when Spanish is on, the whole page renders in Spanish (static
// text through the walker and CTC_ES_DICT, wiring-built sections
// through bilingual templates, engine item strings through the
// dictionary and patterns in T()). All verdicts come from the
// tested engines inlined on this page; nothing here invents an
// outcome.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }
  function moneyInt(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function moneyRate(n) {
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  var COLLEGES36 = (typeof LA_COLLEGES !== 'undefined') ? LA_COLLEGES : [];
  var COVERED = (typeof DATA_COLLEGES !== 'undefined') ? DATA_COLLEGES : [];
  var DICT = (typeof CTC_ES_DICT !== 'undefined') ? CTC_ES_DICT : {};
  function fillSelect(el, names, firstLabel) {
    if (!el) return;
    el.innerHTML = '<option value="">' + esc(firstLabel) + '</option>' +
      names.map(function (n) { return '<option>' + esc(n) + '</option>'; }).join('');
  }
  function num(id) {
    var v = parseFloat(($(id) || {}).value);
    return isNaN(v) ? null : v;
  }
  function intOrNull(id) {
    var v = parseInt(($(id) || {}).value, 10);
    return isNaN(v) ? null : v;
  }

  // ---- Language state, dictionary, patterns ----
  var spanish = false;
  function L(en, es) { return spanish ? es : en; }
  function T(s) {
    if (!spanish || typeof s !== 'string') return s;
    if (Object.prototype.hasOwnProperty.call(DICT, s)) return DICT[s];
    var m;
    if ((m = s.match(/^(\d+) credit hours in the order listed, semester by semester\. Each one is matched to (.+) in the statewide course data\.$/))) {
      return m[1] + ' horas de crédito en el orden indicado, semestre por semestre. Cada una está vinculada con ' + m[2] + ' en los datos estatales de cursos.';
    }
    if ((m = s.match(/^Send your official (.+) transcript to (.+)$/))) {
      return 'Envíe su expediente académico oficial de ' + m[1] + ' a ' + m[2];
    }
    if ((m = s.match(/^Take these (\d+) courses at (.+)$/))) {
      return 'Tome estos ' + m[1] + ' cursos en ' + m[2];
    }
    if ((m = s.match(/^Apply for admission at (.+)$/))) return 'Solicite la admisión en ' + m[1];
    if ((m = s.match(/^Apply for dual enrollment at (.+)$/))) return 'Solicite la inscripción dual en ' + m[1];
    if ((m = s.match(/^A ([\d.]+) cumulative GPA for a (senior|junior) \(yours: ([\d.]+)\)$/))) {
      return 'Un GPA acumulado de ' + m[1] + ' para ' + (m[2] === 'senior' ? '12.º grado' : '11.º grado') + ' (el suyo: ' + m[3] + ')';
    }
    if ((m = s.match(/^A GPA of at least ([\d.]+) \(yours: ([\d.]+)\)$/))) {
      return 'Un GPA de al menos ' + m[1] + ' (el suyo: ' + m[2] + ')';
    }
    if ((m = s.match(/^GPA ([\d.]+) meets the ([\d.]+) minimum( for a (senior|junior))?$/))) {
      return 'El GPA ' + m[1] + ' cumple el mínimo de ' + m[2] +
        (m[4] ? ' para ' + (m[4] === 'senior' ? '12.º grado' : '11.º grado') : '');
    }
    if ((m = s.match(/^ACT (English|Math) (\d+) \(for (.+?) courses\) \(yours: (\d+)\)$/))) {
      return 'ACT de ' + (m[1] === 'English' ? 'inglés' : 'matemáticas') + ' ' + m[2] +
        ' (para cursos de ' + (m[3] === 'humanities and social sciences' ? 'humanidades y ciencias sociales' : 'matemáticas y ciencias') +
        ') (el suyo: ' + m[4] + ')';
    }
    if ((m = s.match(/^ACT (English|Math) (\d+) \(yours: (\d+)\)$/))) {
      return 'ACT de ' + (m[1] === 'English' ? 'inglés' : 'matemáticas') + ' ' + m[2] + ' (el suyo: ' + m[3] + ')';
    }
    if ((m = s.match(/^ACT composite (\d+) \(yours: (\d+)\)$/))) {
      return 'ACT compuesto ' + m[1] + ' (el suyo: ' + m[2] + ')';
    }
    if ((m = s.match(/^Not covered yet: (.+)$/))) return 'Aún no cubierto: ' + m[1];
    if ((m = s.match(/^All (\d+) credit hours of the transfer degree move, with junior standing\.$/))) {
      return 'Las ' + m[1] + ' horas de crédito del título de transferencia se mueven todas, con nivel junior.';
    }
    if ((m = s.match(/^Transfer degree still in progress: the guarantee is not in hand yet\. (.+)\.$/))) {
      return 'Título de transferencia aún en curso: la garantía aún no está en mano. ' + m[1] + '.';
    }
    if ((m = s.match(/^Flagged: (.+) falls outside the transfer guarantee\. The receiving university decides that course on its own\.$/))) {
      return 'Marcado: ' + m[1] + ' queda fuera de la garantía de transferencia. La universidad receptora decide sobre ese curso por su cuenta.';
    }
    if ((m = s.match(/^The full report for this check lists every course, what it counts as at (.+), and the conditions on it\. Enter your email and it will be sent to you\.$/))) {
      return 'El informe completo de esta verificación enumera cada curso, como qué cuenta en ' + m[1] + ', y las condiciones que tiene. Ingrese su correo electrónico y se le enviará.';
    }
    if ((m = s.match(/^Credit awarded: counts toward (.+)\.$/))) {
      return 'Crédito otorgado: cuenta para ' + T(m[1]) + '.';
    }
    if ((m = s.match(/^Credit awarded: (.+)\.$/))) return 'Crédito otorgado: ' + m[1] + '.';
    if ((m = s.match(/^Credit awarded as an elective in the subject\. ?(.*)$/))) {
      return 'Crédito otorgado como electiva en la materia. ' + m[1];
    }
    if ((m = s.match(/^No credit\. (.+)$/))) return 'Sin crédito. ' + m[1];
    if ((m = s.match(/^College (\d+)$/))) return 'Universidad ' + m[1];
    if ((m = s.match(/^Same requirement as (.+)$/))) return 'El mismo requisito que ' + m[1];
    if ((m = s.match(/^Course data built from current catalogs: (.+), joined on the Louisiana common course numbers in the AY 2025-26 statewide catalog\. For these colleges, pick the subject, then the course, and the tool finds the match itself\. More colleges are being added the same way\.$/))) {
      var mid = m[1]
        .replace(/(\d+) courses with state numbers/g, '$1 cursos con números estatales')
        .replace(/2026-2027 catalog and Board of Regents Articulation Matrix, 2025-26/g, 'catálogo 2026-2027 y Matriz de Articulación del Board of Regents, 2025-26')
        .replace(/2026-2027 catalog/g, 'catálogo 2026-2027')
        .replace(/Board of Regents Articulation Matrix, 2025-26/g, 'Matriz de Articulación del Board of Regents, 2025-26')
        .replace(/\) and /g, ') y ');
      return 'Datos de cursos construidos a partir de los catálogos actuales: ' + mid +
        ', unidos por los números comunes de curso de Luisiana en el catálogo estatal AY 2025-26. Para estas universidades, elija la materia, luego el curso, y la herramienta encuentra la coincidencia por sí misma. Se están agregando más universidades de la misma manera.';
    }
    return s;
  }

  // ---- Text walker: translate static and page-rendered text ----
  var origText = new Map();
  var origPlaceholder = new Map();
  var origAria = new Map();
  var origTitle = document.title;
  function walkTranslate(root) {
    if (!root || !document.createTreeWalker) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = node.parentNode;
        if (!p || p.nodeName === 'SCRIPT' || p.nodeName === 'STYLE') return NodeFilter.FILTER_REJECT;
        if (p.id === 'spanishToggle') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      if (!origText.has(node)) origText.set(node, node.nodeValue);
      var parts = node.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
      if (parts && DICT[parts[2]]) {
        node.nodeValue = parts[1] + DICT[parts[2]] + parts[3];
      } else if (parts) {
        var t = T(parts[2]);
        if (t !== parts[2]) node.nodeValue = parts[1] + t + parts[3];
      }
    });
    if (root.querySelectorAll) {
      root.querySelectorAll('[placeholder]').forEach(function (el) {
        if (!origPlaceholder.has(el)) origPlaceholder.set(el, el.getAttribute('placeholder'));
        var ph = el.getAttribute('placeholder');
        if (ph && DICT[ph]) el.setAttribute('placeholder', DICT[ph]);
      });
      root.querySelectorAll('[aria-label]').forEach(function (el) {
        if (!origAria.has(el)) origAria.set(el, el.getAttribute('aria-label'));
        var al = el.getAttribute('aria-label');
        if (al && DICT[al]) el.setAttribute('aria-label', DICT[al]);
      });
    }
  }
  function walkRestore(root) {
    origText.forEach(function (orig, node) {
      if (node.isConnected) node.nodeValue = orig;
    });
    origPlaceholder.forEach(function (orig, el) {
      if (el.isConnected && orig != null) el.setAttribute('placeholder', orig);
    });
    origAria.forEach(function (orig, el) {
      if (el.isConnected && orig != null) el.setAttribute('aria-label', orig);
    });
  }

  // ---- Coverage strip ----
  function renderStrip() {
    var strip = $('coverageStrip');
    if (!strip || !COVERED.length) return;
    var short = {
      'Delgado Community College': 'Delgado',
      'University of Louisiana at Lafayette': 'UL Lafayette',
      'University of New Orleans': 'UNO',
      'Baton Rouge Community College': 'BRCC',
      'Southeastern Louisiana University': 'Southeastern',
      'Louisiana State University and A&M College': 'LSU',
      'Northwestern State University of Louisiana': 'Northwestern State',
      'Louisiana Tech University': 'Louisiana Tech'
    };
    var names = COVERED.map(function (n2) { return esc(short[n2] || n2); }).join(', ');
    strip.innerHTML = spanish
      ? 'Ahora verificamos <strong>' + COVERED.length + ' universidades de Luisiana</strong>, incluidas las cinco mayores proveedoras de inscripción dual: ' + names + '.'
      : 'Now checking <strong>' + COVERED.length + ' Louisiana colleges</strong>, including the five biggest dual enrollment providers: ' + names + '.';
  }
  renderStrip();

  // ---- Results additions: savings line, source line, Spanish guidance ----
  function savingsSentence(sv, target, hours) {
    if (spanish) {
      return 'Estas ' + (hours ? hours + ' ' : '') + 'horas para el título valen aproximadamente ' +
        moneyInt(sv.amount) + ' en ' + esc(target) +
        ', calculado según su matrícula y tarifas publicadas de ' + moneyRate(sv.perCreditHour) +
        ' por hora de crédito (' + esc(T(sv.schedule)) + ').';
    }
    return 'These ' + (hours ? hours + ' ' : '') + 'degree hours are worth about ' +
      moneyInt(sv.amount) + ' at ' + esc(target) +
      ', priced from its published tuition and fees of ' + moneyRate(sv.perCreditHour) +
      ' per credit hour (' + esc(sv.schedule) + ').';
  }
  function renderAdditions() {
    if (!window._lastStudent || !window._lastReport) return;
    if (typeof buildGuidance !== 'function') return;
    var g = buildGuidance(window._lastStudent, window._lastReport);
    var target = (window._lastStudent.target && window._lastStudent.target.name) || '';
    var verdicts = $('verdicts');
    if (verdicts && typeof withSavings === 'function') {
      var withS = withSavings(g, target, TUITION_DATA);
      var sEl = $('savingsLine');
      if (!sEl) {
        sEl = document.createElement('div');
        sEl.id = 'savingsLine';
        verdicts.appendChild(sEl);
      }
      sEl.innerHTML = withS.savings
        ? '<p class="verdict good">' + savingsSentence(withS.savings, target, null) + '</p>'
        : '';
    }
    var tableBox = $('courseTable');
    if (tableBox) {
      var srcEl = $('sourceLine');
      if (!srcEl) {
        srcEl = document.createElement('div');
        srcEl.id = 'sourceLine';
        tableBox.appendChild(srcEl);
      }
      var seen = {};
      var lines = [];
      (window._lastReport.courseResults || []).forEach(function (r) {
        if (r.sourceCatalog && !seen[r.sourceInstitution]) {
          seen[r.sourceInstitution] = true;
          if (spanish) {
            lines.push('Fuentes: ' + T(r.sourceCatalog) + ' y ' + T(r.targetCatalog || 'the target catalog') + '.');
          } else {
            lines.push('Traced from ' + r.sourceCatalog + ' and ' + (r.targetCatalog || 'the target catalog') + '.');
          }
        }
      });
      srcEl.innerHTML = lines.length
        ? '<p class="fine">' + esc(lines.join(' ')) + ' ' +
          L('Statewide course numbers are shown with each match.',
            'Los números estatales de curso se muestran con cada coincidencia.') + '</p>'
        : '';
    }
    if (spanish && typeof translateGuidance === 'function') {
      var t = translateGuidance(g);
      var ns = $('nextSteps');
      if (ns && t.nextSteps && t.nextSteps.length) {
        ns.innerHTML = '<p><strong>Próximos pasos</strong></p><ul>' +
          t.nextSteps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
      }
      var adv = $('advisorBox');
      if (adv && t.advisorQuestions && t.advisorQuestions.length) {
        adv.innerHTML = '<div class="keycard" style="border:2px solid #1d3fae;background:#f2f4fd;border-radius:10px;padding:14px;margin-top:12px;">' +
          '<p style="margin-top:0;"><strong>Preguntas para su asesor</strong></p><ul>' +
          t.advisorQuestions.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ul></div>';
      }
    }
  }
  var runBtn = $('run');
  if (runBtn) {
    runBtn.addEventListener('click', function () {
      setTimeout(function () {
        renderAdditions();
        if (spanish) walkTranslate(document.body);
      }, 0);
    });
  }

  // ---- Eligibility ----
  var lastElig = null;
  function renderEligibility() {
    if (!lastElig) return;
    var out = $('eligResult');
    var r = lastElig.result;
    var college = lastElig.college;
    var h = '';
    if (r.status === 'eligible') {
      h += '<p class="verdict good">' + (spanish
        ? 'Elegible según los mínimos publicados en ' + esc(college) + '.'
        : 'Eligible on the published minimums at ' + esc(college) + '.') + '</p>';
    } else if (r.status === 'not-yet') {
      h += '<p class="verdict bad">' + (spanish ? 'Todavía no. Aún falta: ' : 'Not yet. Still missing: ') + '</p><ul>' +
        (r.missing || []).map(function (x) { return '<li>' + esc(T(x)) + '</li>'; }).join('') + '</ul>';
    } else {
      h += '<p class="verdict warn">' + (spanish ? 'Todavía no se puede saber. Esta verificación aún necesita: ' : 'Cannot tell yet. This check still needs: ') + '</p><ul>' +
        (r.unknown || []).map(function (x) { return '<li>' + esc(T(x)) + '</li>'; }).join('') + '</ul>';
    }
    if (r.met && r.met.length) {
      h += '<p><strong>' + L('Met:', 'Cumplido:') + '</strong></p><ul>' +
        r.met.map(function (x) { return '<li>' + esc(T(x)) + '</li>'; }).join('') + '</ul>';
    }
    out.innerHTML = h;
  }
  if ($('eligCollege') && typeof evaluateEligibility === 'function') {
    fillSelect($('eligCollege'), Object.keys(ELIGIBILITY_DATA.colleges || {}), 'Pick the college');
    $('eligRun').addEventListener('click', function () {
      var out = $('eligResult');
      var college = $('eligCollege').value;
      if (!college) {
        out.innerHTML = '<p class="verdict warn">' + L('Pick a college first.', 'Primero elija una universidad.') + '</p>';
        lastElig = null;
        return;
      }
      var student = {
        gradeLevel: $('eligGrade').value,
        track: $('eligTrack').value,
        gpa: num('eligGpa'),
        actComposite: intOrNull('eligComp'),
        actEnglish: intOrNull('eligEng'),
        actMath: intOrNull('eligMath'),
        counselorRecommendation: $('eligRec').checked,
        subject: $('eligSubject').value || undefined
      };
      lastElig = { college: college, result: evaluateEligibility(college, student, ELIGIBILITY_DATA) };
      renderEligibility();
    });
  }

  // ---- Career pathways ----
  var lastPathway = null;
  function renderPathway() {
    if (!lastPathway) return;
    var out = $('pwResult');
    var plan = lastPathway.plan;
    var source = lastPathway.source;
    var target = lastPathway.target;
    if (plan.status === 'unknown-pathway') {
      out.innerHTML = '<p class="verdict warn">' + L('That pathway is not verified yet.', 'Esa ruta aún no está verificada.') + '</p>';
      return;
    }
    var h = '';
    h += '<h3>' + esc(T(plan.pathwayName)) + ': ' + esc(source) + ' <span aria-hidden="true">→</span> ' + esc(target) + '</h3>';
    if (plan.careers && plan.careers.length) {
      h += '<p class="fine">' + L('Careers this pathway feeds: ', 'Carreras a las que lleva esta ruta: ') +
        plan.careers.map(function (c) { return esc(T(c)); }).join(', ') + '.</p>';
    }
    if (plan.status === 'on-pathway') {
      h += '<p class="verdict good">' + (spanish
        ? 'Cada una de las ' + plan.totalHours + ' horas puede tomarse en ' + esc(source) + ' según sus datos de cursos publicados.'
        : 'Every one of the ' + plan.totalHours + ' hours can be taken at ' + esc(source) + ' from its published course data.') + '</p>';
    } else {
      h += '<p class="verdict warn">' + (spanish
        ? plan.gapHours + ' de las ' + plan.totalHours + ' horas son vacíos en ' + esc(source) + ': no están en sus datos de cursos publicados. Un vacío se nombra, nunca se rellena con una suposición.'
        : plan.gapHours + ' of the ' + plan.totalHours + ' hours are gaps at ' + esc(source) + ': not in its published course data. A gap is named, never filled with a guess.') + '</p>';
    }
    if (plan.targetCovered === false) {
      h += '<p class="verdict warn">' + (spanish
        ? esc(target) + ' aún no está en los datos de cursos, así que todavía no se puede verificar aquí si cada curso cuenta allí.'
        : esc(target) + ' is not in the course data yet, so whether each course counts there cannot be verified here yet.') + '</p>';
    }
    if (plan.nextSemester && plan.nextSemester.length) {
      h += '<p><strong>' + (spanish
        ? 'Próximo semestre (' + plan.nextSemesterHours + ' horas):'
        : 'Next semester (' + plan.nextSemesterHours + ' hours):') + '</strong></p><ul>' +
        plan.nextSemester.map(function (p) {
          return '<li>' + esc(p.sourceCode) + ' ' + esc(p.sourceTitle) + ' (' + p.hours + 'h)</li>';
        }).join('') + '</ul>';
    }
    var statusLabel = spanish
      ? { taken: 'Ya obtenido', available: 'Disponible en su universidad', partial: 'Parcialmente disponible', gap: 'Vacío' }
      : { taken: 'Already earned', available: 'Available at your college', partial: 'Partly available', gap: 'Gap' };
    h += '<table class="results"><colgroup><col style="width:30%"><col style="width:12%"><col style="width:38%"><col style="width:20%"></colgroup>' +
      '<tr><th>' + L('Requirement', 'Requisito') + '</th><th class="num">' + L('Hours', 'Horas') + '</th><th>' +
      (spanish ? 'Cursos en ' : 'Courses at ') + esc(source) + '</th><th>' + L('Status', 'Estado') + '</th></tr>';
    h += plan.requirements.map(function (r, i) {
      var picks = (r.picks || []).map(function (p) {
        var note = p.countsAtTarget === false
          ? L(' (not verified at the target)', ' (no verificado en la universidad de destino)') : '';
        return esc(p.sourceCode) + ' ' + esc(p.sourceTitle) + esc(note);
      }).join('<br>');
      return '<tr class="crow' + (i % 2 ? ' alt' : '') + '"><td>' + esc(T(r.label)) + '</td>' +
        '<td class="num">' + r.hours + '</td><td>' + (picks || ' ') + '</td>' +
        '<td>' + esc(statusLabel[r.status] || r.status) + '</td></tr>';
    }).join('');
    h += '</table>';
    out.innerHTML = h;
  }
  if ($('pwPathway') && typeof buildPathwayPlan === 'function') {
    $('pwPathway').innerHTML = '<option value="">Pick a career goal</option>' +
      (PATHWAYS_DATA.pathways || []).map(function (p) {
        return '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>';
      }).join('');
    fillSelect($('pwSource'), COLLEGES36, 'Pick your college');
    fillSelect($('pwTarget'), COLLEGES36, 'Pick the university');
    $('pwRun').addEventListener('click', function () {
      var out = $('pwResult');
      var pathwayId = $('pwPathway').value;
      var source = $('pwSource').value;
      var target = $('pwTarget').value;
      if (!pathwayId || !source || !target) {
        out.innerHTML = '<p class="verdict warn">' + L('Pick a career goal, your college, and the university.', 'Elija una meta profesional, su universidad y la universidad de destino.') + '</p>';
        lastPathway = null;
        return;
      }
      lastPathway = {
        source: source, target: target,
        plan: buildPathwayPlan(
          { pathwayId: pathwayId, sourceCollege: source, targetCollege: target, takenLccns: [] },
          { courses: COURSES_DATA, pathways: PATHWAYS_DATA, statewide: STATEWIDE_DATA }
        )
      };
      renderPathway();
    });
  }

  // ---- Transfer degree planner + apply ready packet ----
  var lastPlan = null;
  var AREA_ES = {
    'english-composition': 'composición en inglés',
    'mathematics': 'matemáticas',
    'natural-sciences': 'ciencias naturales',
    'humanities': 'humanidades',
    'fine-arts': 'bellas artes',
    'behavioral-sciences': 'ciencias sociales y del comportamiento',
    'discipline-electives': 'electivas de la disciplina'
  };
  function renderPlan() {
    if (!lastPlan) return;
    var out = $('planResult');
    var pkt = $('packetResult');
    var plan = lastPlan.plan;
    var target = lastPlan.target;
    if (plan.status === 'cannot-plan') {
      out.innerHTML = '<p class="verdict warn">' + L('A plan cannot be built between these two colleges from the verified data yet.', 'Aún no se puede construir un plan entre estas dos universidades con los datos verificados.') + '</p>';
      pkt.innerHTML = '';
      return;
    }
    var h = '';
    if (plan.status === 'complete') {
      h += '<p class="verdict good">' + (spanish
        ? 'Plan completo: ' + plan.totalHours + ' horas, cada curso verificado en ambas universidades.'
        : 'Complete plan: ' + plan.totalHours + ' hours, every course verified at both colleges.') + '</p>';
    } else {
      var gapText = (plan.gaps || []).map(function (gp) {
        return spanish
          ? (AREA_ES[gp.area] || gp.area) + ' necesita ' + gp.needed + ' horas, ' + gp.have + ' en los datos vinculados'
          : gp.area + ' needs ' + gp.needed + ' hours, ' + gp.have + ' in the matched data';
      }).join('; ');
      h += '<p class="verdict warn">' + (spanish
        ? 'Plan parcial: ' + plan.totalHours + ' horas verificadas. Vacíos: '
        : 'Partial plan: ' + plan.totalHours + ' hours verified. Gaps: ') + gapText + '.</p>';
    }
    var sv = (typeof estimateSavings === 'function')
      ? estimateSavings(target, plan.totalHours, TUITION_DATA) : null;
    if (sv) {
      h += '<p class="verdict good">' + savingsSentence(sv, target, sv.hours) + '</p>';
    }
    (plan.semesters || []).forEach(function (sem) {
      h += '<p><strong>' + (spanish
        ? 'Semestre ' + sem.number + ' (' + sem.hours + ' horas)'
        : 'Semester ' + sem.number + ' (' + sem.hours + ' hours)') + '</strong></p><ul>' +
        sem.courses.map(function (c) {
          return '<li>' + esc(c.sourceCode) + ' ' + esc(c.sourceTitle) +
            ' <span aria-hidden="true">→</span> ' + esc(c.targetCode) + ' (' + c.hours + 'h)</li>';
        }).join('') + '</ul>';
    });
    out.innerHTML = h;
    if (typeof buildPacket === 'function') {
      var packet = buildPacket(plan, APPLICATIONS_DATA);
      pkt.innerHTML = '<h3>' + T('Your apply ready packet') + '</h3><ol>' +
        (packet.steps || []).map(function (s) {
          var link = s.url ? ' <a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + T('Open') + '</a>' : '';
          return '<li><strong>' + esc(T(s.title)) + '</strong>' +
            (s.detail ? '<br>' + esc(T(s.detail)) : '') + link + '</li>';
        }).join('') + '</ol>';
    }
  }
  if ($('planSource') && typeof buildPlan === 'function') {
    fillSelect($('planSource'), COVERED, 'Pick your college');
    fillSelect($('planTarget'), COVERED, 'Pick the university');
    $('planRun').addEventListener('click', function () {
      var source = $('planSource').value;
      var target = $('planTarget').value;
      if (!source || !target) {
        $('planResult').innerHTML = '<p class="verdict warn">' + L('Pick your college and the university.', 'Elija su universidad y la universidad de destino.') + '</p>';
        $('packetResult').innerHTML = '';
        lastPlan = null;
        return;
      }
      lastPlan = {
        source: source, target: target,
        plan: buildPlan(
          { sourceCollege: source, targetCollege: target },
          { courses: COURSES_DATA, framework: FRAMEWORK_DATA, tuition: TUITION_DATA }
        )
      };
      renderPlan();
    });
  }

  // ---- Admission check ----
  var lastAdmission = null;
  var PATH_ES = {
    'earned-credits': 'créditos obtenidos',
    'bridge': 'programa puente',
    'associate-degree': 'título asociado',
    'adult': 'adulto'
  };
  function renderAdmission() {
    if (!lastAdmission) return;
    var out = $('admResult');
    var r = lastAdmission.result;
    var target = lastAdmission.target;
    var h = '';
    if (r.verdict === 'meets-state-minimum') {
      h += '<p class="verdict good">' + (spanish
        ? 'Cumple el mínimo estatal para la admisión por transferencia en ' + esc(target) + '. La universidad toma la decisión final de admisión.'
        : 'Meets the state minimum for transfer admission at ' + esc(target) + '. The university makes the final admission call.') + '</p>';
    } else if (r.verdict === 'open-admission') {
      h += '<p class="verdict good">' + (spanish
        ? esc(target) + ' es una universidad de admisión abierta: los mínimos de transferencia anteriores no limitan el ingreso.'
        : esc(target) + ' is an open admission college: the transfer minimums above do not gate entry.') + '</p>';
    } else if (r.verdict === 'not-applicable-private') {
      h += '<p class="verdict warn">' + (spanish
        ? esc(target) + ' es una universidad privada y establece sus propios estándares de admisión; los mínimos estatales no aplican. Verifíquelo directamente con la universidad.'
        : esc(target) + ' is a private university and sets its own admission standards; the state minimums do not apply. Verify with the university directly.') + '</p>';
    } else if (r.verdict === 'cannot-tell') {
      h += '<p class="verdict warn">' + L('Cannot tell from the state minimums alone. One of the paths below depends on standards the university sets itself.', 'No se puede saber solo con los mínimos estatales. Una de las rutas siguientes depende de estándares que la propia universidad establece.') + '</p>';
    } else if (r.verdict === 'unknown-college') {
      h += '<p class="verdict warn">' + L('That university is not in the admission standards data yet.', 'Esa universidad aún no está en los datos de estándares de admisión.') + '</p>';
    } else {
      h += '<p class="verdict bad">' + (spanish
        ? 'Aún no cumple el mínimo estatal para ' + esc(target) + '.'
        : 'Does not meet the state minimum yet for ' + esc(target) + '.') + '</p>';
    }
    var missingLines = [];
    (r.paths || []).forEach(function (p) {
      if (p.status !== 'meets' && p.missing && p.missing.length) {
        var label = spanish ? (PATH_ES[p.id] || p.id) : p.id;
        missingLines.push('<li>' + esc(label) + (spanish ? ': falta ' : ' path: missing ') +
          p.missing.map(function (x) { return esc(T(x)); }).join('; ') + '</li>');
      }
    });
    if (missingLines.length && r.verdict !== 'meets-state-minimum') {
      h += '<p><strong>' + L('What each path still needs:', 'Lo que aún necesita cada ruta:') + '</strong></p><ul>' + missingLines.join('') + '</ul>';
    }
    out.innerHTML = h;
  }
  if ($('admTarget') && typeof evaluateAdmission === 'function') {
    fillSelect($('admTarget'), COLLEGES36, 'Pick the university');
    $('admRun').addEventListener('click', function () {
      var out = $('admResult');
      var target = $('admTarget').value;
      if (!target) {
        out.innerHTML = '<p class="verdict warn">' + L('Pick the university first.', 'Primero elija la universidad.') + '</p>';
        lastAdmission = null;
        return;
      }
      var input = {
        targetCollege: target,
        earnedHours: intOrNull('admHours'),
        gpa: num('admGpa'),
        englishCompleted: $('admEng').checked,
        mathCompleted: $('admMath').checked,
        hasAssociateDegree: $('admDegree').checked,
        inBridgeProgram: $('admBridge').checked,
        age25OrOver: $('admAge').checked,
        placementMathOrEnglish: $('admPlacement').checked
      };
      lastAdmission = { target: target, result: evaluateAdmission(input, ADMISSION_DATA) };
      renderAdmission();
    });
  }

  // ---- Spanish toggle: the whole page changes language ----
  var tog = $('spanishToggle');
  function setSpanish(on) {
    spanish = on;
    document.title = on
      ? '¿Contará este crédito? Verificador de transferencia de créditos de Luisiana'
      : origTitle;
    if (tog) tog.textContent = on ? 'View in English' : 'Ver en español';
    renderStrip();
    if (window._lastReport && typeof render === 'function') {
      render(window._lastReport);
      renderAdditions();
    }
    renderEligibility();
    renderPathway();
    renderPlan();
    renderAdmission();
    if (on) {
      walkTranslate(document.body);
    } else {
      walkRestore(document.body);
      // Dynamic areas were rebuilt in English above; static text
      // is restored from the walker map. Re-run additions so the
      // savings and source lines are English even without a check.
      renderAdditions();
    }
  }
  if (tog) {
    tog.addEventListener('click', function () { setSpanish(!spanish); });
  }
  // Dynamically added rows (Add a college, Add an AP exam,
  // typeahead picks) arrive after the toggle: re-walk after clicks
  // and changes while Spanish is on.
  var rewalkTimer = null;
  function scheduleRewalk() {
    if (!spanish) return;
    clearTimeout(rewalkTimer);
    rewalkTimer = setTimeout(function () { walkTranslate(document.body); }, 60);
  }
  document.addEventListener('click', scheduleRewalk);
  document.addEventListener('change', scheduleRewalk);
})();
