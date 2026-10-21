/* ==========================================================================
   EduPortal Admin — admin-list.js  (lot 7, étape 2)
   Composants réutilisables des pages « liste » de l'administration Thymeleaf.
   Activés par attributs data-* sur le balisage ; le serveur envoie TOUTES les lignes,
   le script ne fait qu'améliorer la page déjà rendue (sans JavaScript : liste complète).
     1. [data-list]            recherche, tri par colonne, filtres à puces, pagination, compteur, « aucun résultat »
     2. form[data-confirm-delete]  dialogue de confirmation avant la soumission du formulaire POST
   Contrat complet : GUIDE-ADMIN-MODULE.md. Dépend de admin.js (EPAdmin.confirm), chargé avant.
   ========================================================================== */
(function () {
  'use strict';
  var doc = document, NB = ' ';

  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  /* Minuscules sans accents : « Élodie » est trouvée par « elodie ». */
  function norm(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
  function results(n) { return n === 0 ? 'Aucun résultat' : n + NB + (n === 1 ? 'résultat' : 'résultats'); }
  var ICON = function (name, cls) { return '<svg class="icon ' + (cls || 'icon-sm') + '" aria-hidden="true" focusable="false"><use href="#i-' + name + '"/></svg>'; };

  /* ---------- 1. Liste : recherche, tri, pagination ---------- */
  function initList(root) {
    var table = $('table[data-list-table]', root);
    if (!table || !table.tBodies[0]) return;
    var body = table.tBodies[0];
    var id = root.getAttribute('data-list-id') || 'list';
    var sizes = [10, 15, 25];
    var size = parseInt(root.getAttribute('data-list-page-size'), 10);
    if (sizes.indexOf(size) < 0) size = 10;

    var wrap = $('[data-list-wrap]', root) || table.parentNode;
    var toolbar = $('[data-list-toolbar]', root), search = $('[data-list-search]', root);
    var count = $('[data-list-count]', root), emptyBox = $('[data-list-empty]', root), pager = $('[data-list-pagination]', root);
    var resets = $$('[data-list-reset]', root);

    /* Une zone « live » à part pour annoncer le tri sans écraser le compteur. */
    var live = doc.createElement('p');
    live.className = 'sr-only'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite');
    root.appendChild(live);

    /* Lignes : texte de recherche (hors avatars décoratifs et colonne d'actions) calculé une fois. */
    var heads = $$('thead th', table);
    var rows = $$('tr', body).map(function (tr, i) {
      var text = $$('td', tr).filter(function (td) { return !td.classList.contains('col-actions'); }).map(function (td) {
        var c = td.cloneNode(true);
        $$('[aria-hidden="true"]', c).forEach(function (n) { n.parentNode.removeChild(n); });
        return c.textContent;
      }).join(' ');
      return { tr: tr, index: i, text: norm(text + ' ' + (tr.getAttribute('data-search') || '')) };
    });

    function cellValue(tr, col) {
      var td = tr.cells[col];
      if (!td) return '';
      var v = td.getAttribute('data-value');
      v = (v != null ? v : td.textContent).trim();
      return v === '—' ? '' : v;      /* « — » (valeur absente) compte comme vide : toujours en fin de tri */
    }

    var state = { q: '', col: -1, dir: 1, page: 1, size: size, filters: {} };

    /* Filtres à puces : [data-list-filter="<clé de colonne>"] (clé = data-sort-key ou data-key du th).
       Puces construites sur les valeurs RÉELLEMENT présentes dans la colonne rendue : « Tous » + une puce par valeur
       distincte (compteur calculé sur les lignes rendues). Cellules vides (ou « — ») : puce « Sans … » si
       data-filter-empty est renseigné. Combinable avec la recherche et avec les autres filtres. */
    var EMPTY = '\u0000vide';
    var filterDefs = [];
    $$('[data-list-filter]', root).forEach(function (box, fi) {
      var key = box.getAttribute('data-list-filter'), col = -1;
      heads.forEach(function (th, i) { if (th.getAttribute('data-sort-key') === key || th.getAttribute('data-key') === key) col = i; });
      if (col < 0) return;
      /* Cellule à plusieurs valeurs (ex. rôles) : data-filter-split="|" sur le conteneur, valeurs séparées par « | » dans data-value. */
      var split = box.getAttribute('data-filter-split'), counts = {}, empties = 0;
      rows.forEach(function (r) {
        var v = cellValue(r.tr, col);
        var vs = v === '' ? [] : (split ? v.split(split).map(function (x) { return x.trim(); }).filter(Boolean) : [v]);
        r['f' + col] = vs;
        if (!vs.length) empties++;
        vs.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
      });
      var values = Object.keys(counts).sort(function (a, b) { return a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' }); });
      var emptyLabel = box.getAttribute('data-filter-empty');
      var opts = values.map(function (v) { return { value: v, label: v, n: counts[v] }; });
      if (empties && emptyLabel) opts.push({ value: EMPTY, label: emptyLabel, n: empties });
      if (opts.length < 2) return;                       /* une seule valeur : un filtre n'apporte rien */
      var lid = id + '-filter-' + fi;
      box.className = (box.className + ' chips-row').trim();
      box.innerHTML = '<span class="chips-label" id="' + lid + '"></span><div class="chips" role="group" aria-labelledby="' + lid + '"></div>';
      $('.chips-label', box).textContent = box.getAttribute('data-filter-label') || key;
      var chips = $('.chips', box);
      [{ value: '', label: 'Tous', n: rows.length }].concat(opts).forEach(function (o) {
        var b = doc.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.setAttribute('data-v', o.value);
        b.setAttribute('aria-pressed', String(o.value === ''));
        b.appendChild(doc.createTextNode(o.label + ' '));
        var c = doc.createElement('span'); c.className = 'chip-count tnum'; c.textContent = o.n; b.appendChild(c);
        chips.appendChild(b);
      });
      chips.addEventListener('click', function (e) {
        var b = e.target.closest('.chip'); if (!b) return;
        state.filters[col] = b.getAttribute('data-v'); state.page = 1;
        $$('.chip', chips).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        render();
      });
      box.hidden = false;
      filterDefs.push({ col: col, box: box });
    });
    function filtersActive() { return filterDefs.some(function (f) { var v = state.filters[f.col]; return v != null && v !== ''; }); }
    function passFilters(r) {
      return filterDefs.every(function (f) {
        var v = state.filters[f.col];
        if (v == null || v === '') return true;
        return v === EMPTY ? r['f' + f.col].length === 0 : r['f' + f.col].indexOf(v) > -1;
      });
    }

    /* En-têtes triables : le texte devient un bouton (accessible au clavier), aria-sort sur la cellule. */
    heads.forEach(function (th, col) {
      if (!th.hasAttribute('data-sort')) return;
      var label = th.textContent.trim(), btn = doc.createElement('button');
      btn.type = 'button'; btn.className = 'th-sort';
      btn.appendChild(doc.createTextNode(label));
      btn.insertAdjacentHTML('beforeend', ICON('arrow-up-down'));
      th.textContent = ''; th.appendChild(btn);
      th.setAttribute('aria-sort', 'none');
      th.__col = col; th.__label = label;
      btn.addEventListener('click', function () {
        state.dir = state.col === col ? -state.dir : 1;
        state.col = col; state.page = 1;
        render();
        live.textContent = 'Tri par ' + label.toLowerCase() + ', ordre ' + (state.dir === 1 ? 'croissant' : 'décroissant') + '.';
      });
    });
    var initial = root.getAttribute('data-list-sort');
    if (initial) heads.forEach(function (th, col) {
      if (th.getAttribute('data-sort-key') === initial) { state.col = col; state.dir = root.getAttribute('data-list-sort-dir') === 'desc' ? -1 : 1; }
    });

    function compare(a, b) {
      var type = heads[state.col].getAttribute('data-sort'), x = cellValue(a.tr, state.col), y = cellValue(b.tr, state.col);
      if (x === '' || y === '') {                       /* valeurs vides toujours en fin de liste */
        if (x === y) return a.index - b.index;
        return x === '' ? 1 : -1;
      }
      var r;
      if (type === 'num' && isFinite(parseFloat(x)) && isFinite(parseFloat(y))) r = parseFloat(x) - parseFloat(y);
      else r = x.localeCompare(y, 'fr', { numeric: true, sensitivity: 'base' });
      return r * state.dir || a.index - b.index;
    }

    function render(focusKey) {
      var q = norm(state.q.trim());
      var ordered = rows.slice();
      if (state.col > -1) ordered.sort(compare);
      ordered.forEach(function (r) { body.appendChild(r.tr); });   /* réordonne les lignes existantes (rien n'est recréé) */
      var matches = ordered.filter(function (r) { return passFilters(r) && (!q || r.text.indexOf(q) > -1); });
      var total = matches.length, pages = Math.max(1, Math.ceil(total / state.size));
      if (state.page > pages) state.page = pages;
      var from = (state.page - 1) * state.size, to = Math.min(from + state.size, total);
      var visible = {};
      matches.slice(from, to).forEach(function (r) { visible[r.index] = true; });
      rows.forEach(function (r) { r.tr.hidden = !visible[r.index]; });

      heads.forEach(function (th, col) {
        if (!th.hasAttribute('data-sort')) return;
        var on = col === state.col, use = $('use', th);
        th.setAttribute('aria-sort', on ? (state.dir === 1 ? 'ascending' : 'descending') : 'none');
        if (use) use.setAttribute('href', on ? (state.dir === 1 ? '#i-chevron-up' : '#i-chevron-down') : '#i-arrow-up-down');
      });

      var filtered = !!q || filtersActive();
      resets.forEach(function (b) { if (b.closest('[data-list-empty]') === null) b.hidden = !filtered; });
      if (count) count.textContent = results(total) + (filtered && total ? ' sur' + NB + rows.length : '');
      wrap.hidden = total === 0;
      if (emptyBox) emptyBox.hidden = total !== 0;
      if (pager) {
        pager.hidden = total === 0;
        if (total) paginate(total, pages, from, to, focusKey);
      }
    }

    function paginate(total, pages, from, to, focusKey) {
      var nums = [];
      if (pages <= 7) { for (var i = 1; i <= pages; i++) nums.push(i); }
      else {
        var set = {};
        [1, pages, state.page - 1, state.page, state.page + 1].forEach(function (p) { if (p >= 1 && p <= pages) set[p] = 1; });
        var keys = Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
        keys.forEach(function (p, idx) { if (idx && p - keys[idx - 1] > 1) nums.push('…'); nums.push(p); });
      }
      var h = '<p class="tnum">' + (from + 1) + '–' + to + NB + 'sur' + NB + total + '</p>' +
        '<div class="pg-size"><label for="' + id + '-size">Lignes par page</label><select class="select select-inline" id="' + id + '-size">' +
        sizes.map(function (n) { return '<option value="' + n + '"' + (n === state.size ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></div>' +
        '<ul class="pg-list"><li><button type="button" class="pg-btn" data-pg="prev" aria-label="Page précédente"' + (state.page === 1 ? ' aria-disabled="true"' : '') + '>' + ICON('chevron-left') + '</button></li>';
      nums.forEach(function (p) {
        if (p === '…') h += '<li class="pg-gap" aria-hidden="true">…</li>';
        else h += '<li><button type="button" class="pg-btn tnum" data-pg="' + p + '" aria-label="Page ' + p + '"' + (p === state.page ? ' aria-current="page"' : '') + '>' + p + '</button></li>';
      });
      h += '<li><button type="button" class="pg-btn" data-pg="next" aria-label="Page suivante"' + (state.page === pages ? ' aria-disabled="true"' : '') + '>' + ICON('chevron-right') + '</button></li></ul>';
      pager.innerHTML = h;
      if (focusKey) {
        var t = $('[data-pg="' + focusKey + '"]', pager);
        if (!t || t.getAttribute('aria-disabled') === 'true') t = $('[aria-current="page"]', pager) || $('#' + id + '-size');
        if (t) t.focus();
      }
    }

    if (search) search.addEventListener('input', debounce(function () { state.q = search.value; state.page = 1; render(); }, 150));
    resets.forEach(function (b) {
      b.addEventListener('click', function () {
        state.q = ''; state.page = 1; state.filters = {};
        filterDefs.forEach(function (f) { $$('.chip', f.box).forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-v') === '')); }); });
        if (search) { search.value = ''; search.focus(); }
        render();
      });
    });
    if (pager) {
      pager.addEventListener('click', function (e) {
        var b = e.target.closest('[data-pg]');
        if (!b || b.getAttribute('aria-disabled') === 'true') return;
        var v = b.getAttribute('data-pg');
        state.page = v === 'prev' ? state.page - 1 : v === 'next' ? state.page + 1 : Number(v);
        render(v);
      });
      pager.addEventListener('change', function (e) {
        if (e.target.id !== id + '-size') return;
        state.size = Number(e.target.value); state.page = 1;
        render();
        var s = $('#' + id + '-size', pager);
        if (s) s.focus();
      });
    }

    if (toolbar) toolbar.hidden = false;       /* la recherche n'a de sens qu'avec JavaScript */
    root.setAttribute('data-list-ready', '');
    render();
  }

  /* ---------- 2. Confirmation de suppression ----------
     <form data-confirm-delete data-confirm-label="Alice Martin" method="post" th:action="…">
       <ul hidden data-confirm-items><li>…</li></ul>        (conséquences affichées, facultatif)
       <button type="submit">…</button>
     </form>
     Le formulaire POST (jeton CSRF inclus) reste la SEULE action : « Supprimer » appelle form.submit(),
     « Annuler », Échap ou le fond ne soumettent rien. */
  function initConfirmDelete() {
    doc.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form || !form.hasAttribute || !form.hasAttribute('data-confirm-delete')) return;
      e.preventDefault();
      if (!window.EPAdmin || !window.EPAdmin.confirm) { form.submit(); return; }   /* sans dialogue disponible : comportement d'origine */
      var label = form.getAttribute('data-confirm-label') || 'cet élément';
      var items = $$('[data-confirm-items] li', form).map(function (li) { return li.textContent.trim(); }).filter(Boolean);
      window.EPAdmin.confirm({
        title: form.getAttribute('data-confirm-title') || 'Supprimer ' + label + NB + '?',
        desc: form.getAttribute('data-confirm-desc') || 'Cette action est définitive et ne peut pas être annulée.',
        items: items,
        okLabel: form.getAttribute('data-confirm-ok') || 'Supprimer',
        tone: 'danger',
        opener: e.submitter || doc.activeElement,
        onConfirm: function () { form.submit(); }
      });
    });
  }

  initConfirmDelete();
  function boot() { $$('[data-list]').forEach(initList); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})();
