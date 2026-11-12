'use strict';

// Spanish results (Stage 27, access theme).
//
// A parent who reads Spanish first should get the sentences that
// matter most in Spanish: the summary headline, rebuilt from the
// guidance totals so the numbers are the engine's own, and the
// fixed protective steps and questions (choice credit, the grade
// rule, the transcript step, the AP report step), translated as
// templates so college names slot in exactly. Per-course composed
// lines (the registrar question naming one course code) stay in
// English in this first pass and are passed through unchanged;
// the build log records that limit plainly.

const FIXED = {
  'If any of these courses is a dual enrollment course you are taking now, ask your school counselor about choice credit before the course ends: you can choose whether the grade goes on your college transcript.':
    'Si alguna de estas clases es de doble inscripción y la estás tomando ahora, pregunta a tu consejero escolar sobre el crédito por elección (choice credit) antes de que termine el curso: tú decides si la calificación aparece en tu transcripción universitaria.',
  'Does a grade below a C in any of these courses change what counts? The transfer degree guarantee requires a C or better in each course.':
    '¿Una calificación menor que C en alguna de estas clases cambia lo que cuenta? La garantía del título de transferencia exige una C o mejor en cada clase.',
  'A required major prerequisite is still missing. Which course fills it, and where can it be taken so the credit transfers?':
    'Todavía falta un prerrequisito obligatorio de la especialidad. ¿Qué clase lo cubre y dónde se puede tomar para que el crédito se transfiera?',
};

const TEMPLATES = [
  {
    re: /^Send your official transcript to (.+) so the credits that count can be posted to your record there\.$/,
    make: (m) => `Envía tu transcripción oficial a ${m[1]} para que los créditos que cuentan queden registrados en tu expediente allí.`,
  },
  {
    re: /^Send your official AP score report to (.+)\. AP credit counts only once the university has the official report\.$/,
    make: (m) => `Envía tu informe oficial de puntajes AP a ${m[1]}. El crédito AP solo cuenta cuando la universidad recibe el informe oficial.`,
  },
];

function translateLine(line) {
  if (FIXED[line]) return FIXED[line];
  for (const t of TEMPLATES) {
    const m = line.match(t.re);
    if (m) return t.make(m);
  }
  return line;
}

function spanishHeadline(guidance, target) {
  const t = (guidance && guidance.totals) || { degreeHours: 0, creditOnlyHours: 0, notCountedCourses: 0 };
  if (!t.degreeHours && !t.creditOnlyHours && t.notCountedCourses > 0) {
    return `Aún no hay datos verificados de cursos para ${target}, así que ${t.notCountedCourses} de tus cursos aún no se pueden evaluar.`;
  }
  let out = `En ${target}: ${t.degreeHours} de tus horas de crédito cuentan para el título`;
  if (t.creditOnlyHours) out += `, ${t.creditOnlyHours} cuentan solo como crédito`;
  if (t.notCountedCourses) {
    out += `, ${t.notCountedCourses} ${t.notCountedCourses === 1 ? 'curso aún no cuenta' : 'cursos aún no cuentan'}`;
  }
  return out + '.';
}

function translateGuidance(guidance) {
  if (!guidance) return guidance;
  return {
    ...guidance,
    nextSteps: (guidance.nextSteps || []).map(translateLine),
    advisorQuestions: (guidance.advisorQuestions || []).map(translateLine),
  };
}

const STATUS_ES = {
  'eligible': 'Cumple los requisitos publicados',
  'not-yet': 'Todavía no',
  'cannot-tell': 'No se puede determinar todavía',
  'complete': 'Completo',
  'partial': 'Parcial',
  'meets-state-minimum': 'Cumple el mínimo estatal',
  'does-not-meet-state-minimum': 'No cumple el mínimo estatal',
  'open-admission': 'Admisión abierta',
};

function statusLabel(status, lang) {
  if (lang === 'es') return STATUS_ES[status] || status;
  return status;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { spanishHeadline, translateGuidance, translateLine, statusLabel };
}
if (typeof window !== 'undefined') {
  window.spanishHeadline = spanishHeadline;
  window.translateGuidance = translateGuidance;
  window.statusLabel = statusLabel;
}
