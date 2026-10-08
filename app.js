/* ==========================================================
   ESTÈTICA LÍDIA FORNÉS · prototipo B — interacciones
   Gota de entrada, ritual que avanza con el scroll, diagnóstico
   de piel, índice de tratamientos, láser por zonas, calendario
   de promos y cita por WhatsApp.
   ========================================================== */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const motion = hasGSAP && !reduced;
if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const watchdog = (tl, ms) => { setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, ms); return tl; };
const eur = (n) => (Number.isInteger(n) ? n : n.toFixed(2).replace('.', ',')) + ' €';
const WA = '34601926591';
const waLink = (txt) => `https://wa.me/${WA}?text=${encodeURIComponent(txt)}`;

/* ----------------------------------------------------------
   DATOS (los mismos precios que la web actual del centro)
   ---------------------------------------------------------- */
const CARTA = [
  { name: 'Faciales', img: 'cabina_2.jpg', items: [['Higiene completa', 45], ['Regenerador celular (peeling)', 60], ['Oxigenante con ácido hialurónico', 55], ['Antiacné y piel grasa', 50], ['Antiedad redensificante', 80], ['Despigmentante iluminador', 55], ['Antioxidante vitamina C', 65], ['Radiofrecuencia + concentrado específico', 50]] },
  { name: 'Corporales', img: 'cabina_96.jpg', items: [['Exfoliante + hidratación', 50], ['Reductor con aparatología', 50], ['Remodelante lipolítico', 60], ['Masaje relajante 30′', 30], ['Masaje relajante 60′', 50]] },
  { name: 'Manicura', img: 'cabina_30.jpg', items: [['Cortar + limar + cutícula', 12], ['Básica + esmaltado tradicional', 15], ['Semipermanente', 22], ['Refuerzo con gel', 25], ['Extensión con gel', 30], ['Parafina (manos)', 10]] },
  { name: 'Pedicura', img: 'cabina_36.jpg', items: [['Cortar + limar + cutícula', 12], ['Básica + esmaltado tradicional', 15], ['Básica + esmaltado + durezas', 30], ['Esmaltado semipermanente', 22], ['Completa + semipermanente', 32], ['Parafina (pies)', 12]] },
  { name: 'Cejas y pestañas', img: 'cabina_76.jpg', items: [['Lifting de pestañas', 40], ['Tinte de pestañas', 16], ['Laminado de cejas + diseño', 30], ['Tinte de cejas + diseño', 16]] },
  { name: 'Depilación con cera', img: 'cabina_51.jpg', items: [['Labio superior', 5], ['Cejas', 9], ['Labio superior + cejas', 12], ['Medias piernas', 15], ['Piernas completas', 24], ['Brazos', 15], ['Axilas', 10], ['Ingles brasileñas', 12], ['Pubis completo + perianal', 18]] }
];
// tramos en segundos del vídeo original (el clip del ritual va a 3×)
const STEPS = [
  [0, 23, 'Limpieza y masaje para preparar la piel', 'Retiramos el maquillaje y la suciedad del día con un limpiador suave. Un masaje ligero relaja la piel.'],
  [23, 35, 'Sérum aplicado gota a gota', 'Unas gotas de un concentrado que hidrata y nutre, extendido con las yemas hasta que la piel lo absorbe.'],
  [35, 47, 'Drenaje suave de cuello y escote', 'Movimientos lentos para soltar tensión: la cara se ve más descansada.'],
  [47, 58, 'Mascarilla a pincel', 'Elegida según lo que pida tu piel —hidratar, calmar o purificar— y aplicada con pincel.'],
  [58, 68, 'Retirada con toallas húmedas', 'Con cuidado y sin frotar. La piel queda limpia y lista para el siguiente paso.'],
  [68, 82, 'Extracción cuidadosa de impurezas', 'Con guantes y mucho cuidado limpiamos los poros para que la piel respire mejor.'],
  [82, 114, 'Masaje final: efecto buena cara', 'La crema adecuada para tu piel y un último masaje. Sales luminosa, hidratada y descansada.']
];
const SPEED = 3;

const QUIZ = [
  { k: 'piel', t: '¿Cómo notas tu piel estos días?', o: [
    ['apagada', 'ph-sun-dim', 'Apagada', 'Sin luz, con cara de cansancio'], ['deshidratada', 'ph-drop', 'Tirante', 'Le falta agua, se nota seca'],
    ['grasa', 'ph-circles-three', 'Con brillos o granitos', 'Grasa, poros visibles'], ['manchas', 'ph-circle-half', 'Con manchas', 'Tono poco uniforme'],
    ['firmeza', 'ph-wave-sine', 'Menos firme', 'Líneas o falta de densidad'], ['normal', 'ph-flower-lotus', 'Bien', 'Solo quiero cuidarla'] ] },
  { k: 'objetivo', t: '¿Qué te gustaría sentir al salir?', o: [
    ['resultado', 'ph-sparkle', 'Que se note', 'Ese efecto buena cara'], ['relax', 'ph-flower', 'Desconectar', 'Un rato solo para mí'],
    ['mantener', 'ph-calendar-check', 'Cuidarla en el tiempo', 'Una rutina de mantenimiento'] ] },
  { k: 'cuando', t: '¿Cuándo te viene mejor venir?', o: [
    ['mañana', 'ph-sun-horizon', 'Por la mañana', 'De 9:00 a 13:00'], ['tarde', 'ph-moon-stars', 'Por la tarde', 'De 15:00 a 19:00, de lunes a jueves'],
    ['viernes', 'ph-calendar-blank', 'El viernes', 'Horario seguido, de 9:00 a 19:00'] ] }
];
const REC = {
  apagada: ['Despigmentante iluminador', 55, 'cabina_96.jpg', 'Pensado para devolver luz y uniformidad a una piel cansada.'],
  deshidratada: ['Oxigenante con ácido hialurónico', 55, 'cabina_30.jpg', 'Hidratación profunda para la piel que tira.'],
  grasa: ['Antiacné y piel grasa', 50, 'cabina_76.jpg', 'Limpia en profundidad y ayuda a equilibrar los brillos.'],
  manchas: ['Despigmentante iluminador', 55, 'cabina_46.jpg', 'Trabaja el tono para que se vea más uniforme.'],
  firmeza: ['Antiedad redensificante', 80, 'cabina_41.jpg', 'Para pieles que buscan densidad y firmeza.'],
  normal: ['Higiene completa', 45, 'cabina_2.jpg', 'El básico que toda piel agradece: limpia, hidrata y relaja.']
};

const ZG = [
  { t: 'Rostro', z: [['entrecejo', 'Entrecejo', 5], ['labio', 'Labio superior', 9], ['menton', 'Mentón', 10], ['pomulos', 'Pómulos', 10], ['patillas', 'Patillas', 10], ['facial', 'Facial completo', 13], ['barba', 'Barba', 15]] },
  { t: 'Cuerpo', z: [['axilas', 'Axilas', 14], ['pecho', 'Pecho', 18], ['abdomen', 'Abdomen', 18], ['lineaalba', 'Línea alba', 6], ['nuca', 'Nuca', 12], ['dorsal', 'Dorsal', 15], ['lumbar', 'Lumbar', 15], ['gluteos', 'Glúteos', 20], ['perianal', 'Perianal', 10]] },
  { t: 'Brazos, piernas e ingles', pairs: [['brazos', 'Brazos', ['Medios', 15, 'Medios brazos'], ['Completos', 18, 'Brazos completos']], ['piernas', 'Piernas', ['Medias', 20, 'Medias piernas'], ['Completas', 40, 'Piernas completas']], ['ingles', 'Ingles', ['Brasileñas', 15, 'Ingles brasileñas'], ['Pubis completo', 20, 'Pubis completo']]] }
];
const PACKS = [
  { n: 'Pecho + abdomen', p: 28, sel: { pecho: 1, abdomen: 1 } }, { n: 'Piernas + ingles + axilas', p: 65, sel: { piernas: 2, ingles: 1, axilas: 1 } },
  { n: 'Axilas + pubis + perianal', p: 35, sel: { axilas: 1, ingles: 2, perianal: 1 } }, { n: 'Cuerpo completo mujer', p: 85, fixed: true }, { n: 'Cuerpo completo hombre', p: 100, fixed: true }
];
const TIERS = [[90, .20], [80, .14], [70, .10], [60, .05]];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const PROMOS = {
  1: [['DUQtpjYjNts_0.jpg', 'DUQtpjYjNts_1.jpg'], [['Belleza esencial', 'Manicura semipermanente + higiene facial completa · 59,90 €'], ['Combo estrella', 'Tratamiento facial iluminador intensivo + una sesión de dermajet corporal · 64,50 €']]],
  2: [['DVYQGoLFyph_0.jpg', 'DVYQGoLFyph_1.jpg'], [['Hydra Glow', 'Tratamiento facial completo con ácido hialurónico · 48 €'], ['Pies de primavera', 'Pedicura completa y parafina · 38 €']]],
  3: [['DWmSH3yDuI9_0.jpg'], [['Depilación láser', 'En packs de más de 60 €, una mini zona de regalo a elegir'], ['Ritual beauty', 'Escoge tu combo · 55 €']]],
  4: [['DX8xKnaun8d_0.jpg'], [['Masaje relajante 30′ + radiofrecuencia facial', '65 € (antes 80 €)'], ['Pack de 6 u 8 sesiones de radiofrecuencia facial', 'Con una higiene facial de regalo']]],
  5: [['DZCev7FOLhl_0.jpg'], [['Tratamiento vitamina C', '55 €']]],
  7: [['DbnDiDKOIC2_0.jpg', 'DbSkNfPO9kl_0.jpg'], [['Promo de agosto', 'Con cualquier tratamiento en cabina, una depilación facial de regalo'], ['Aviso', 'Desde agosto, los sábados cerrado']]],
  8: [['Dcvcu5Eu2U1_0.jpg'], [['Ritual piernas radiantes', 'Exfoliación, hidratación profunda y masaje revitalizante · 29 € (parafina +5 €)']]],
  9: [['Dd8eJA5OG4C_0.jpg'], [['Tratamiento facial iluminador y regenerador', '55 € (antes 115 €)']]]
};

/* ----------------------------------------------------------
   SCROLL SUAVE + NAVEGACIÓN
   ---------------------------------------------------------- */
let lenis = null;
if (motion && window.Lenis) {
  lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const lock = (on) => { document.body.classList.toggle('is-locked', on); if (lenis) on ? lenis.stop() : lenis.start(); };
const goTo = (target, offset = -70) => { if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 }); else (typeof target === 'number' ? scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' }) : target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })); };
const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
const onScroll = () => nav.classList.toggle('is-solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
burger.addEventListener('click', () => { const o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', o); links.classList.toggle('is-open', o); });
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'), t = id.length > 1 ? $(id) : null;
  if (!t && id !== '#top') return;
  e.preventDefault(); burger.setAttribute('aria-expanded', 'false'); links.classList.remove('is-open');
  goTo(id === '#top' ? 0 : t);
}));

/* ----------------------------------------------------------
   HORARIO (hora de Lloret)
   ---------------------------------------------------------- */
const OPEN = { 0: [], 1: [[540, 780], [900, 1140]], 2: [[540, 780], [900, 1140]], 3: [[540, 780], [900, 1140]], 4: [[540, 780], [900, 1140]], 5: [[540, 1140]], 6: [] };
const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const hhmm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
const madrid = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', month: 'numeric', year: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: +p.hour * 60 + +p.minute, mo: +p.month - 1, y: +p.year };
};
const paintLive = () => {
  const { d, m } = madrid();
  const slot = OPEN[d].find(([a, b]) => m >= a && m < b);
  let txt, open = !!slot;
  if (slot) txt = `Abierto · hasta las ${hhmm(slot[1])}`;
  else {
    const later = OPEN[d].find(([a]) => a > m);
    if (later) txt = `Cerrado · abrimos a las ${hhmm(later[0])}`;
    else { for (let i = 1; i <= 7; i++) { const nd = (d + i) % 7; if (OPEN[nd].length) { txt = `Cerrado · abrimos ${i === 1 ? 'mañana' : 'el ' + DAYS[nd]} a las ${hhmm(OPEN[nd][0][0])}`; break; } } }
  }
  $$('[data-live]').forEach((el) => { el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open); $('[data-live-text]', el).textContent = txt; });
  $$('#hours li').forEach((li) => li.classList.toggle('is-today', +li.dataset.day === d));
};
paintLive(); setInterval(paintLive, 60000);

/* ----------------------------------------------------------
   INTRO · cae una gota de sérum
   ---------------------------------------------------------- */
const intro = $('#intro');
const heroIn = () => {
  if (!motion) return;
  gsap.from('.hero__title .line > span', { yPercent: 105, duration: 1.3, ease: 'expo.out', stagger: .1 });
  gsap.from('.kicker, .hero__lead, .hero__cta', { y: 24, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: .08, delay: .3 });
  gsap.from('.pill', { clipPath: 'inset(100% 0 0 0 round 999px)', duration: 1.5, ease: 'expo.inOut' });
  gsap.from('.badge, .promo-chip', { scale: .6, opacity: 0, duration: 1, ease: 'back.out(1.6)', stagger: .15, delay: .8 });
};
if (!motion) intro.remove();
else {
  lock(true); scrollTo(0, 0);
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    gsap.to(intro, { clipPath: 'circle(0% at 50% 50%)', duration: 1.1, ease: 'expo.inOut', onComplete: () => { intro.remove(); lock(false); ScrollTrigger.refresh(); } });
    setTimeout(heroIn, 350);
  };
  gsap.set(intro, { clipPath: 'circle(150% at 50% 50%)' });
  const tl = gsap.timeline({ delay: .25, onComplete: finish });
  tl.from('.intro__drop', { y: -innerHeight * .55, duration: .85, ease: 'power2.in' })
    .to('.intro__drop', { scaleY: .3, scaleX: 1.6, opacity: 0, duration: .18, ease: 'power1.out', transformOrigin: '50% 100%' })
    .fromTo('.intro__ring', { scale: 0, opacity: .9 }, { scale: 14, opacity: 0, duration: 1.6, ease: 'power2.out', stagger: .22 }, '<')
    .from('.intro__name span, .intro__name em', { y: 30, opacity: 0, duration: .9, ease: 'expo.out', stagger: .12 }, '<.1')
    .from('.intro__sub', { opacity: 0, duration: .6 }, '<.3')
    .to({}, { duration: .25 });
  watchdog(tl, 6000);
  intro.addEventListener('click', () => { tl.kill(); finish(); });
}
const heroVid = $('.pill video');
new IntersectionObserver(([en]) => (en.isIntersecting ? heroVid.play().catch(() => {}) : heroVid.pause()), { threshold: .1 }).observe(heroVid);

/* ----------------------------------------------------------
   RITUAL · el vídeo avanza con el scroll
   ---------------------------------------------------------- */
const rv = $('#ritualVideo'), rSteps = $('#ritualSteps'), rBar = $('#ritualBar'), rTime = $('#ritualTime');
rSteps.innerHTML = STEPS.map(([, , h, d], i) => `<li class="rstep${i ? '' : ' is-on'}" data-i="${i}"><b>${String(i + 1).padStart(2, '0')}</b><div><h3>${h}</h3><p>${d}</p></div></li>`).join('');
const dur = () => rv.duration || 38;
let curStep = 0;
const paintStep = (t) => {
  const orig = t * SPEED;
  let k = STEPS.findIndex(([a, b]) => orig >= a && orig < b); if (k < 0) k = STEPS.length - 1;
  if (k !== curStep) { curStep = k; $$('.rstep', rSteps).forEach((li, i) => li.classList.toggle('is-on', i === k)); }
  rTime.textContent = `${String(k + 1).padStart(2, '0')} / ${String(STEPS.length).padStart(2, '0')}`;
  rBar.style.width = (t / dur() * 100).toFixed(2) + '%';
};
let scrubST = null, targetT = 0, seeking = false;
const seek = () => { if (seeking) return; seeking = true; requestAnimationFrame(() => { seeking = false; if (Math.abs(rv.currentTime - targetT) > .04) rv.currentTime = targetT; }); };
let primed = false;
const prime = () => { if (primed) return; primed = true; const p = rv.play(); if (p && p.then) p.then(() => rv.pause()).catch(() => {}); };
if (motion) {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    rv.loop = false;
    scrubST = ScrollTrigger.create({ trigger: '.ritual__pin', start: 'top top', end: '+=260%', pin: true, scrub: true,
      onEnter: prime, onUpdate: (s) => { targetT = s.progress * (dur() - .05); seek(); paintStep(targetT); } });
    return () => { scrubST = null; };
  });
  mm.add('(max-width: 900px)', () => {
    rv.loop = true;
    $('#ritualHint').textContent = 'El vídeo avanza solo; toca un paso para saltar a él.';
    const io = new IntersectionObserver(([en]) => (en.isIntersecting ? rv.play().catch(() => {}) : rv.pause()), { threshold: .3 });
    io.observe(rv);
    return () => io.disconnect();
  });
} else { rv.loop = true; rv.controls = true; }
rv.addEventListener('timeupdate', () => { if (!scrubST) paintStep(rv.currentTime); });
rSteps.addEventListener('click', (e) => {
  const li = e.target.closest('.rstep'); if (!li) return;
  const t = (STEPS[+li.dataset.i][0] + 1) / SPEED;
  if (scrubST) goTo(scrubST.start + (t / dur()) * (scrubST.end - scrubST.start), 0);
  else { rv.currentTime = t; paintStep(t); }
});

/* ----------------------------------------------------------
   DIAGNÓSTICO
   ---------------------------------------------------------- */
const qBody = $('#quizBody'), qDots = $('#quizDots');
const ans = {};
let qi = 0;
qDots.innerHTML = '<span></span>'.repeat(QUIZ.length + 1);
const label = (k, v) => QUIZ.find((q) => q.k === k).o.find((o) => o[0] === v);
const swap = (html) => {
  if (!motion) { qBody.innerHTML = html; return; }
  gsap.to(qBody, { opacity: 0, x: -24, duration: .25, ease: 'power2.in', onComplete: () => { qBody.innerHTML = html; gsap.fromTo(qBody, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: .5, ease: 'power3.out' }); gsap.from($$('.opt, .res__extra div', qBody), { y: 14, opacity: 0, duration: .5, stagger: .04, ease: 'power2.out', delay: .1 }); } });
};
const renderQ = () => {
  $$('span', qDots).forEach((s, i) => s.classList.toggle('is-on', i <= qi));
  if (qi >= QUIZ.length) return renderResult();
  const q = QUIZ[qi];
  swap(`<p class="q__n">Pregunta ${qi + 1} de ${QUIZ.length}</p><h3 class="q__t">${q.t}</h3>
    <div class="q__opts">${q.o.map(([v, ic, b, s]) => `<button class="opt${ans[q.k] === v ? ' is-on' : ''}" type="button" data-v="${v}"><i class="ph-light ${ic}"></i><span><b>${b}</b><small>${s}</small></span></button>`).join('')}</div>
    ${qi ? '<button class="q__back" type="button" data-back><i class="ph-light ph-arrow-left"></i> Volver</button>' : ''}`);
};
const recommendation = () => {
  const [t, p, img, why] = REC[ans.piel];
  const extras = [];
  if (ans.objetivo === 'relax') extras.push(['Para sumar al facial: masaje relajante 30′', eur(30)]);
  if (ans.objetivo === 'resultado') extras.push(ans.piel === 'firmeza' ? ['Un paso más: radiofrecuencia + concentrado específico', eur(50)] : ['Un paso más: regenerador celular (peeling)', eur(60)]);
  if (ans.objetivo === 'mantener') extras.push(['Pregúntanos por los packs personalizados', '']);
  const { mo, y } = madrid();
  const promo = y === 2026 && mo === 9 && ['apagada', 'manchas', 'normal'].includes(ans.piel);
  return { t, p, img, why, extras, promo };
};
const whenTxt = { mañana: 'por la mañana', tarde: 'por la tarde', viernes: 'el viernes' };
function renderResult() {
  const r = recommendation();
  const msg = `Hola Lídia y Silvia. He hecho el diagnóstico de vuestra web: mi piel está ${label('piel', ans.piel)[2].toLowerCase()} y busco ${label('objetivo', ans.objetivo)[2].toLowerCase()}. Me gustaría pedir cita para «${r.t}» (${eur(r.p)})${r.extras[0] && r.extras[0][1] ? ` y quizá ${r.extras[0][0].split(': ')[1]}` : ''}. Me iría mejor ${whenTxt[ans.cuando]}. ¡Gracias!`;
  swap(`<div class="res__img"><img src="assets/img/${r.img}" alt=""></div>
    <p class="res__k">Tu ritual recomendado</p>
    <h3 class="res__t">${r.t}</h3>
    <p class="res__p">${eur(r.p)}</p>
    <p class="res__why">${r.why}</p>
    <div class="res__extra">${r.extras.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('')}${r.promo ? '<div class="is-promo"><span>Promo de octubre: facial iluminador y regenerador</span><b><s>115 €</s> 55 €</b></div>' : ''}</div>
    <div class="res__cta"><a class="btn btn--sage" href="${waLink(msg)}" target="_blank" rel="noopener"><i class="ph-light ph-whatsapp-logo"></i><span>Reservar por WhatsApp</span></a><button class="btn btn--line btn--sm" type="button" data-toform>Apuntar en el formulario</button><button class="btn btn--line btn--sm" type="button" data-restart>Empezar de nuevo</button></div>
    <p class="res__note">Orientativo: en cabina valoramos tu piel antes de empezar cualquier tratamiento.</p>`);
}
qBody.addEventListener('click', (e) => {
  const o = e.target.closest('.opt');
  if (o) { ans[QUIZ[qi].k] = o.dataset.v; o.classList.add('is-on'); setTimeout(() => { qi++; renderQ(); }, motion ? 220 : 0); return; }
  if (e.target.closest('[data-back]')) { qi = Math.max(0, qi - 1); renderQ(); }
  if (e.target.closest('[data-restart]')) { qi = 0; Object.keys(ans).forEach((k) => delete ans[k]); renderQ(); }
  if (e.target.closest('[data-toform]')) {
    const r = recommendation();
    setService(`Faciales · ${r.t}`);
    const d = ans.cuando === 'viernes' ? 'viernes' : 'cualquier día';
    const f = ans.cuando === 'mañana' ? 'por la mañana (9:00–13:00)' : ans.cuando === 'tarde' ? 'por la tarde (15:00–19:00)' : 'a cualquier hora';
    const form = $('#bookForm');
    $(`input[name="dia"][value="${d}"]`, form).checked = true;
    $(`input[name="franja"][value="${f}"]`, form).checked = true;
    updatePreview(); goTo($('#cita'));
  }
});
renderQ();

/* ----------------------------------------------------------
   ÍNDICE DE TRATAMIENTOS
   ---------------------------------------------------------- */
const idx = $('#index'), peek = $('#peek');
idx.innerHTML = CARTA.map((c, i) => `<li class="ix" data-i="${i}">
  <button class="ix__head" type="button" aria-expanded="false"><span class="ix__n">${String(i + 1).padStart(2, '0')}</span><span class="ix__t">${c.name}</span><span class="ix__m">${c.items.length} tratamientos · desde ${eur(Math.min(...c.items.map((x) => x[1])))}</span><span class="ix__pm"><i class="ph-light ph-plus"></i></span></button>
  <div class="ix__body"><div class="ix__inner"><ul class="ix__list">${c.items.map(([n, p]) => `<li><b>${n}</b><span>${eur(p)}</span><button type="button" data-serv="${c.name} · ${n}">Reservar</button></li>`).join('')}</ul></div></div>
</li>`).join('');
idx.addEventListener('click', (e) => {
  const b = e.target.closest('[data-serv]');
  if (b) { setService(b.dataset.serv); b.textContent = 'Apuntado ✓'; b.classList.add('is-done'); setTimeout(() => goTo($('#cita')), 350); return; }
  const h = e.target.closest('.ix__head'); if (!h) return;
  const li = h.parentElement, open = !li.classList.contains('is-open');
  $$('.ix', idx).forEach((x) => { x.classList.remove('is-open'); $('.ix__head', x).setAttribute('aria-expanded', 'false'); });
  if (open) { li.classList.add('is-open'); h.setAttribute('aria-expanded', 'true'); }
  setTimeout(() => hasGSAP && ScrollTrigger.refresh(), 650);
});
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const pImg = $('img', peek);
  let px = 0, py = 0, cx = 0, cy = 0, raf = 0;
  const follow = () => { cx += (px - cx) * .15; cy += (py - cy) * .15; peek.style.left = cx + 'px'; peek.style.top = cy + 'px'; raf = requestAnimationFrame(follow); };
  $$('.ix__head', idx).forEach((h) => {
    h.addEventListener('mouseenter', (e) => { pImg.src = 'assets/img/' + CARTA[+h.parentElement.dataset.i].img; cx = px = e.clientX; cy = py = e.clientY; peek.classList.add('is-on'); cancelAnimationFrame(raf); follow(); });
    h.addEventListener('mousemove', (e) => { px = e.clientX + 150; py = e.clientY; });
    h.addEventListener('mouseleave', () => { peek.classList.remove('is-on'); setTimeout(() => cancelAnimationFrame(raf), 400); });
  });
}

/* ----------------------------------------------------------
   LÁSER · zonas, tramos de descuento y packs
   ---------------------------------------------------------- */
const zonesEl = $('#zones');
const sel = {}; let pack = null;
zonesEl.innerHTML = ZG.map((g) => `<div class="zgroup"><h3>${g.t}<small>${g.z ? 'precio por sesión' : 'elige medio o completo'}</small></h3><div class="zchips">${
  g.z ? g.z.map(([k, n, p]) => `<button class="zchip" type="button" data-z="${k}" aria-pressed="false">${n}<small>${eur(p)}</small></button>`).join('')
      : g.pairs.map(([k, lbl, a, b]) => `<div class="zpair"><span class="zpair__lbl">${lbl}</span><button class="zchip" type="button" data-z="${k}" data-lv="1" aria-pressed="false">${a[0]}<small>${eur(a[1])}</small></button><button class="zchip" type="button" data-z="${k}" data-lv="2" aria-pressed="false">${b[0]}<small>${eur(b[1])}</small></button></div>`).join('')
}</div></div>`).join('');
const zoneInfo = (k, lv) => {
  for (const g of ZG) {
    if (g.z) { const z = g.z.find((x) => x[0] === k); if (z) return { n: z[1], p: z[2] }; }
    else { const pr = g.pairs.find((x) => x[0] === k); if (pr) { const v = pr[1 + lv]; return { n: v[2], p: v[1] }; } }
  }
};
$('#packs').innerHTML = PACKS.map((p, i) => `<button class="pack" type="button" data-p="${i}" aria-pressed="false">${p.n}<b>${eur(p.p)}</b></button>`).join('');
const paintLaser = () => {
  $$('.zchip', zonesEl).forEach((c) => c.setAttribute('aria-pressed', c.dataset.lv ? sel[c.dataset.z] === +c.dataset.lv : !!sel[c.dataset.z]));
  $$('.pack').forEach((b, i) => b.setAttribute('aria-pressed', pack === i));
  const items = Object.entries(sel).map(([k, lv]) => zoneInfo(k, lv));
  const list = $('#calcList');
  let sub, total, discTxt = '—', lbl = 'Descuento';
  if (pack != null && PACKS[pack].fixed) {
    list.innerHTML = `<li><span>${PACKS[pack].n}</span><span>${eur(PACKS[pack].p)}</span></li>`;
    sub = total = PACKS[pack].p; lbl = 'Pack cerrado'; discTxt = 'precio fijo';
  } else {
    list.innerHTML = items.length ? items.map((z) => `<li><span>${z.n}</span><span>${eur(z.p)}</span></li>`).join('') : '<li class="is-empty">Aún no has elegido zonas.</li>';
    sub = items.reduce((s, z) => s + z.p, 0);
    if (pack != null) { total = PACKS[pack].p; lbl = `Pack «${PACKS[pack].n}»`; discTxt = '−' + eur(sub - total); }
    else {
      const t = TIERS.find(([min]) => sub >= min);
      total = t ? Math.round(sub * (1 - t[1]) * 100) / 100 : sub;
      if (t) { lbl = `Descuento −${Math.round(t[1] * 100)} %`; discTxt = '−' + eur(Math.round((sub - total) * 100) / 100); }
    }
  }
  $('#sub').textContent = eur(sub); $('#disc').textContent = discTxt; $('#discLbl').textContent = lbl; $('#total').textContent = eur(total);
  $('#tierFill').style.width = Math.min(100, sub / 90 * 100) + '%';
  const next = TIERS.slice().reverse().find(([min]) => sub < min);
  $('#tierMsg').textContent = pack != null ? 'Precio de pack aplicado.' : !sub ? 'Suma 60 € y empieza el descuento.' : next ? `Te faltan ${eur(Math.round((next[0] - sub) * 100) / 100)} para un −${Math.round(next[1] * 100)} %.` : '¡Tienes el descuento máximo, −20 %!';
  $('#laserBook').disabled = !sub;
  $('#laserBook').dataset.msg = `Hola Lídia y Silvia. Me gustaría pedir cita para depilación láser: ${pack != null && PACKS[pack].fixed ? PACKS[pack].n : items.map((z) => z.n.toLowerCase()).join(', ')}. Total por sesión según la web: ${eur(total)}. ¡Gracias!`;
  if (motion) gsap.fromTo('#total', { scale: 1.12 }, { scale: 1, duration: .45, ease: 'back.out(3)' });
};
zonesEl.addEventListener('click', (e) => {
  const c = e.target.closest('.zchip'); if (!c) return;
  if (pack != null) { pack = null; }
  const k = c.dataset.z;
  if (c.dataset.lv) { const lv = +c.dataset.lv; if (sel[k] === lv) delete sel[k]; else sel[k] = lv; }
  else if (sel[k]) delete sel[k]; else sel[k] = 1;
  paintLaser();
});
$('#packs').addEventListener('click', (e) => {
  const b = e.target.closest('.pack'); if (!b) return;
  const i = +b.dataset.p;
  Object.keys(sel).forEach((k) => delete sel[k]);
  if (pack === i) pack = null; else { pack = i; Object.assign(sel, PACKS[i].sel || {}); }
  paintLaser();
});
$('#laserClear').addEventListener('click', () => { Object.keys(sel).forEach((k) => delete sel[k]); pack = null; paintLaser(); });
$('#laserBook').addEventListener('click', (e) => { window.open(waLink(e.currentTarget.dataset.msg), '_blank', 'noopener'); });
paintLaser();

/* ----------------------------------------------------------
   CALENDARIO DE PROMOS
   ---------------------------------------------------------- */
const cal = $('#cal'), { mo: nowMo, y: nowY } = madrid();
cal.innerHTML = MONTHS.map((m, i) => {
  const pr = PROMOS[i];
  if (!pr) return `<div class="mo mo--empty"><b>${m}</b><span>${i > nowMo ? 'Próximamente' : 'Sin promo publicada'}</span></div>`;
  const now = nowY === 2026 && i === nowMo;
  return `<button class="mo${now ? ' mo--now' : ''}" type="button" data-m="${i}"><img src="assets/img/${pr[0][0]}" alt="Cartel de la promo de ${m.toLowerCase()}" loading="lazy">${now ? '<span class="mo__now">Este mes</span>' : ''}<span class="mo__lbl"><b>${m}</b><span>${pr[1][0][0]}</span></span></button>`;
}).join('');
const lb = $('#lb');
cal.addEventListener('click', (e) => {
  const b = e.target.closest('.mo[data-m]'); if (!b) return;
  const i = +b.dataset.m, [imgs, items] = PROMOS[i];
  $('#lbImgs').innerHTML = imgs.map((s) => `<img src="assets/img/${s}" alt="Cartel de ${MONTHS[i].toLowerCase()}">`).join('');
  $('#lbMonth').textContent = MONTHS[i];
  $('#lbText').innerHTML = items.map(([h, d]) => `<h3>${h}</h3><p>${d}</p>`).join('');
  lb.hidden = false; lock(true);
  if (motion) gsap.from('.lb__body', { y: 30, opacity: 0, duration: .6, ease: 'power3.out' });
  $('.lb__close', lb).focus();
});
const closeLB = () => { lb.hidden = true; lock(false); };
lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.lb__close')) closeLB(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLB(); });

/* ----------------------------------------------------------
   OPINIONES · cinta continua
   ---------------------------------------------------------- */
const rt = $('#revTrack'); rt.innerHTML += rt.innerHTML; $$('.rv', rt).slice(rt.children.length / 2).forEach((r) => r.setAttribute('aria-hidden', 'true'));

/* ----------------------------------------------------------
   CITA · formulario → WhatsApp
   ---------------------------------------------------------- */
const form = $('#bookForm'), select = $('#servSelect');
select.innerHTML = '<option value="">No lo tengo claro, aconsejadme</option>' +
  CARTA.map((c) => `<optgroup label="${c.name}">${c.items.map(([n, p]) => `<option value="${c.name} · ${n}">${n} · ${eur(p)}</option>`).join('')}</optgroup>`).join('') +
  '<optgroup label="Láser"><option value="Depilación láser">Depilación láser</option></optgroup>';
function setService(v) {
  if (![...select.options].some((o) => o.value === v)) select.insertAdjacentHTML('afterbegin', `<option value="${v}">${v}</option>`);
  select.value = v; updatePreview();
}
const buildMsg = () => {
  const f = new FormData(form);
  const nombre = (f.get('nombre') || '').trim(), serv = f.get('servicio'), nota = (f.get('nota') || '').trim();
  return `Hola Lídia y Silvia${nombre ? `, soy ${nombre}` : ''}. ${serv ? `Me gustaría pedir cita para ${serv.split(' · ').pop().toLowerCase()}` : 'Me gustaría pedir cita y que me aconsejéis un tratamiento'}. Me iría mejor ${f.get('dia') === 'cualquier día' ? 'cualquier día' : 'el ' + f.get('dia')}, ${f.get('franja')}.${nota ? ' ' + nota : ''} ¡Gracias!`;
};
function updatePreview() { $('#formPrev').textContent = '«' + buildMsg() + '»'; }
form.addEventListener('input', updatePreview); form.addEventListener('change', updatePreview);
form.addEventListener('submit', (e) => { e.preventDefault(); window.open(waLink(buildMsg()), '_blank', 'noopener'); });
updatePreview();

/* ----------------------------------------------------------
   APARICIONES
   ---------------------------------------------------------- */
if (motion) {
  ScrollTrigger.batch('.about__text > *, .ritual__head > *, .quiz__intro > *, .quiz__card, .treat__head > *, .ix, .laser__head > *, .zgroup, .calc, .promos__head > *, .mo, .reviews__score, .form > *, .visit > *', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.from(els, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .05, overwrite: true })
  });
  gsap.from('.about__img', { clipPath: 'inset(100% 0 0 0 round 300px 300px 18px 18px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.about', start: 'top 75%' } });
  gsap.to('.about__img img', { yPercent: 8, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.foot__big', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.foot', start: 'top 85%' } });
  $$('.nav__links a').forEach((a) => { const s = $(a.getAttribute('href')); if (s) ScrollTrigger.create({ trigger: s, start: 'top 50%', end: 'bottom 50%', onToggle: (st) => a.classList.toggle('is-active', st.isActive) }); });
  addEventListener('load', () => ScrollTrigger.refresh());
}
})();
