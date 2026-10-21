/* ==========================================================================
   EduPortal Admin — admin-dashboard.js  (lot 7)
   Graphiques du tableau de bord, repris de maquettes admin/index.html
   (buildCharts / paint) : barres Chart.js aux couleurs des jetons --chart-*,
   repeintes au changement de thème. Données : window.EP_DASH (attributs de
   modèle du contrôleur, inchangés). Sans Chart.js, les tableaux de données
   déjà rendus par le serveur sont affichés à la place des canevas.
   ========================================================================== */
(function () {
  'use strict';
  var D = window.EP_DASH || {}, NB = ' ', chartList = [];

  function entries(m) { return m ? Object.keys(m).map(function (k) { return [k, Number(m[k])]; }) : []; }
  function num(n) { return String(Math.round(Number(n) * 100) / 100).replace('.', ','); }
  function tok(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  /* Effectifs par spécialité : étudiants et formateurs sur les mêmes libellés (union des clés). */
  var etu = D.etudiantsParSpecialite || {}, frm = D.formateursParSpecialite || {};
  var specLabels = Object.keys(etu).concat(Object.keys(frm).filter(function (k) { return !(k in etu); }));
  function single(m) { var e = entries(m); return { labels: e.map(function (x) { return x[0]; }), data: e.map(function (x) { return x[1]; }) }; }
  var grp = single(D.etudiantsParGroupe), crs = single(D.inscriptionsParCours), charge = single(D.chargeHoraireFormateur),
      dist = single(D.distributionNotes), moy = single(D.moyenneParGroupe), rea = single(D.tauxReussiteParCours);

  var defs = [
    { id: 'spec', title: 'Effectifs par spécialité', labels: specLabels, horizontal: true,
      series: [{ name: 'Étudiants', data: specLabels.map(function (k) { return Number(etu[k] || 0); }) },
               { name: 'Formateurs', data: specLabels.map(function (k) { return Number(frm[k] || 0); }) }] },
    { id: 'grp', title: 'Étudiants par groupe', labels: grp.labels, series: [{ name: 'Étudiants', data: grp.data }], horizontal: true },
    { id: 'crs', title: 'Inscriptions par cours', labels: crs.labels, series: [{ name: 'Inscriptions', data: crs.data }] },
    { id: 'charge', title: 'Charge horaire par formateur', labels: charge.labels, series: [{ name: 'Heures', data: charge.data }], horizontal: true, unit: NB + 'h' },
    { id: 'dist', title: 'Distribution des notes', labels: dist.labels, series: [{ name: 'Notes', data: dist.data }], perBar: true },
    { id: 'moyenne', title: 'Moyenne par groupe', labels: moy.labels, series: [{ name: 'Moyenne /20', data: moy.data }], max: 20, unit: '/20' },
    { id: 'reussite', title: 'Réussite par cours (%)', labels: rea.labels, series: [{ name: 'Réussite (%)', data: rea.data }], max: 100, unit: NB + '%', horizontal: true }
  ];

  function alt(c) {
    var sum = c.labels.map(function (l, i) {
      return l + NB + ': ' + c.series.map(function (se) { return num(se.data[i]) + (c.unit || ''); }).join(' / ');
    }).join(' ; ');
    return c.title + (c.series.length > 1 ? ' (' + c.series.map(function (x) { return x.name; }).join(', ') + ')' : '') + '. ' + sum + '. Données détaillées dans le tableau associé.';
  }


  function colorsFor(c, i, data, pal) {
    /* Distribution : les 2 tranches inférieures à 10/20 en --chart-2 (corail), les autres en --chart-1 */
    return c.perBar ? data.map(function (v, k) { return k < 2 ? pal[1] : pal[0]; }) : pal[i % pal.length];
  }

  /* Couleurs lues dans les jetons au moment de la création. Chart.js garde en cache les options
     résolues : modifier les couleurs d'un graphique existant ne repeint pas toujours les barres
     (défaut constaté dans la maquette : barres pâles). Au changement de thème et après le chargement
     des polices (mesure des libellés avec Inter), les graphiques sont donc recréés. */
  function build(animate) {
    var figs = Array.prototype.slice.call(document.querySelectorAll('.chart-fig'));
    if (!window.Chart) { figs.forEach(function (f) { f.classList.add('no-chart'); }); return; }
    chartList.forEach(function (ch) { ch.destroy(); });
    chartList = [];
    var pal = [1, 2, 3, 4, 5, 6].map(function (i) { return tok('--chart-' + i); }), grid = tok('--chart-grid'), axis = tok('--chart-axis');
    Chart.defaults.color = axis;
    Chart.defaults.font.family = tok('--font-body');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    defs.forEach(function (c) {
      var cv = document.getElementById('cv-' + c.id);
      if (!cv || !c.labels.length) return;   /* le serveur a déjà rendu l'état vide */
      cv.setAttribute('aria-label', alt(c));
      var catAxis = { grid: { display: false }, ticks: { color: axis }, border: { color: grid } };
      var valAxis = { beginAtZero: true, grid: { color: grid }, ticks: { color: axis, precision: 0, callback: function (v) { return v + (c.unit && c.max ? c.unit : ''); } }, border: { display: false } };
      if (c.max) valAxis.max = c.max;
      chartList.push(new Chart(cv, {
        type: 'bar',
        data: { labels: c.labels, datasets: c.series.map(function (se, i) {
          var col = colorsFor(c, i, se.data, pal);
          return { label: se.name, data: se.data, backgroundColor: col, borderColor: col, borderRadius: 6, borderWidth: 0, maxBarThickness: 38 };
        }) },
        options: {
          indexAxis: c.horizontal ? 'y' : 'x', responsive: true, maintainAspectRatio: false,
          animation: reduce || !animate ? false : { duration: 600 },
          plugins: {
            colors: { enabled: false },
            legend: { display: c.series.length > 1, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, color: axis } },
            tooltip: { padding: 10, callbacks: { label: function (ctx) { return ctx.dataset.label + NB + ': ' + num(ctx.raw) + (c.unit || ''); } } }
          },
          scales: c.horizontal ? { y: catAxis, x: valAxis } : { x: catAxis, y: valAxis }
        }
      }));
    });
  }

  function start() {
    build(true);
    if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(function () { build(false); });
  }
  if (window.EPAdmin && window.EPAdmin.theme) window.EPAdmin.theme.onChange(function () { build(false); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
