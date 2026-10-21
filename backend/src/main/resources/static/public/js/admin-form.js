/* ==========================================================================
   EduPortal Admin — admin-form.js  (lot 7, étape 2)
   Composants réutilisables des formulaires d'ajout / édition de l'administration Thymeleaf.
   Activés par attributs data-* ; ils ne changent ni les champs, ni l'action, ni la méthode :
   le formulaire reste un POST classique (jeton CSRF inclus) et le SERVEUR reste l'autorité.
     form[data-form]            validation côté client (messages de la maquette, résumé d'erreurs, focus)
     form[data-form-guard]      garde « modifications non enregistrées »
     input[data-password-meter] jauge de mot de passe (conseils uniquement, aucune règle bloquante)
     fieldset[data-checkgroup]  groupe de cases à cocher ; data-required = au moins une case (message : data-msg-required)
     [data-show-if="idSelect:v1|v2"]  zone affichée selon la valeur d'une liste ; masquée = champs désactivés (non envoyés, non validés) ;
                                data-req sur un champ = obligatoire seulement quand la zone est affichée
     select[data-source]        liste dépendante : options chargées en JSON depuis data-source + valeur de data-depends-on
                                (état de chargement et d'erreur avec « Réessayer » dans #<id>-status)
   Sans JavaScript : les attributs HTML (required, type…) assurent la validation native du navigateur.
   Contrat complet : GUIDE-ADMIN-MODULE.md. Dépend de admin.js (EPAdmin.confirm), chargé avant.
   ========================================================================== */
(function () {
  'use strict';
  var doc = document, NB = ' ';

  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
  function icon(name, cls) { return '<svg class="icon ' + (cls || '') + '" aria-hidden="true" focusable="false"><use href="#i-' + name + '"/></svg>'; }
  function plural(n, one, many) { return n + NB + (n === 1 ? one : many); }

  /* État partagé par la garde : au plus un formulaire gardé par page. */
  var guard = { form: null, dirty: false, leaving: false };

  function initForm(form) {
    form.noValidate = true;                      /* les messages natifs cèdent la place à ceux de la maquette */
    var summary = $('[data-form-summary]', form), dirtyBox = $('[data-form-dirty]', form);
    var submitBtn = $('button[type="submit"]', form);
    var controls = $$('input, select, textarea', form).filter(function (c) {
      return c.name && c.name !== '_csrf' && c.type !== 'hidden' && c.type !== 'submit' && c.type !== 'button';
    });
    var touched = {}, submitting = false, submitHTML = submitBtn ? submitBtn.innerHTML : '';

    /* ---------- validation ---------- */
    function labelOf(c) {
      var l = c.id ? $('label[for="' + c.id + '"]', form) : null;
      if (!l) return c.getAttribute('aria-label') || c.name;
      var clone = l.cloneNode(true);
      $$('.req, .sr-only', clone).forEach(function (n) { n.parentNode.removeChild(n); });
      return clone.textContent.trim();
    }
    function errBox(c) { return c.id ? doc.getElementById(c.id + '-err') : null; }
    function message(c) {
      if (c.disabled) return '';
      var v = c.type === 'password' ? c.value : c.value.trim(), label = labelOf(c);
      var custom = function (k, d) { return c.getAttribute('data-msg-' + k) || d; };
      if (c.required && v === '') {
        return custom('required', c.tagName === 'SELECT' ? 'Choisissez une valeur pour «' + NB + label + NB + '».' : 'Renseignez le champ «' + NB + label + NB + '».');
      }
      if (v === '') return '';
      if (c.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return custom('invalid', 'Adresse e-mail invalide. Exemple' + NB + ': prenom.nom@exemple.fr.');
      if (c.type === 'tel' && !/^(\+|00)?\d{8,14}$/.test(v.replace(/[\s.\-()]/g, ''))) return custom('invalid', 'Numéro invalide. Exemples' + NB + ': 06 12 34 56 78 ou +212 6 12 34 56 78.');
      if (c.type === 'date' && (c.validity.badInput || isNaN(new Date(v).getTime()))) return custom('invalid', 'Cette date n’est pas valide.');
      if (c.type === 'number') {
        var n = Number(v);
        if (isNaN(n)) return custom('invalid', 'Saisissez un nombre.');
        if (c.min !== '' && n < Number(c.min)) return 'La valeur doit être supérieure ou égale à ' + c.min + '.';
        if (c.max !== '' && n > Number(c.max)) return 'La valeur doit être inférieure ou égale à ' + c.max + '.';
      }
      var min = parseInt(c.getAttribute('minlength'), 10);
      if (min > 0 && v.length < min) return 'Ce champ doit contenir au moins ' + min + NB + 'caractères (' + v.length + ' saisis).';
      var pat = c.getAttribute('pattern');
      if (pat && !new RegExp('^(?:' + pat + ')$').test(v)) return custom('pattern', 'Le format de ce champ n’est pas valide.');
      return '';
    }
    function showError(c, msg) {
      var box = errBox(c);
      if (box) { box.innerHTML = icon('alert-circle') + '<span></span>'; $('span', box).textContent = msg; box.hidden = false; }
      c.setAttribute('aria-invalid', 'true');
    }
    function clearError(c) {
      var box = errBox(c);
      if (box) { box.innerHTML = ''; box.hidden = true; }
      c.removeAttribute('aria-invalid');
    }
    function check(c) { var m = message(c); if (m) showError(c, m); else clearError(c); return !m; }

    /* ---------- zones conditionnelles [data-show-if="idSelect:v1|v2"] ---------- */
    $$('[data-show-if]', form).forEach(function (panel) {
      var spec = panel.getAttribute('data-show-if'), i = spec.indexOf(':');
      var sel = doc.getElementById(spec.slice(0, i)), vals = spec.slice(i + 1).split('|');
      if (!sel) return;
      function sync() {
        var show = vals.indexOf(sel.value) > -1;
        panel.hidden = !show;
        $$('input, select, textarea', panel).forEach(function (c) {
          c.disabled = !show;
          if (c.hasAttribute('data-req')) { c.required = show; if (show) c.setAttribute('aria-required', 'true'); else c.removeAttribute('aria-required'); }
          if (!show) clearError(c);
        });
      }
      sel.addEventListener('change', sync);
      sync();
    });

    /* ---------- listes dépendantes select[data-source] ---------- */
    $$('select[data-source]', form).forEach(initDependent);

    /* Appui sur la barre d'actions : le champ perd le focus, son message d'erreur ferait descendre le bouton et l'appui serait perdu.
       On laisse donc la soumission valider tout le formulaire. */
    var pressingActions = false;
    form.addEventListener('pointerdown', function (e) { pressingActions = !!(e.target.closest && e.target.closest('.form-actions')); });
    doc.addEventListener('pointerup', function () { setTimeout(function () { pressingActions = false; }, 0); });
    controls.forEach(function (c) {
      if (c.required) c.setAttribute('aria-required', 'true');
      c.addEventListener('blur', function () { if (pressingActions) return; touched[c.name] = true; check(c); });
      ['input', 'change'].forEach(function (evt) { c.addEventListener(evt, function () { if (touched[c.name]) check(c); }); });
    });

    if (summary) summary.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-focus]');
      if (!a) return;
      e.preventDefault();
      var c = doc.getElementById(a.getAttribute('data-focus'));
      if (c) c.focus();
    });

    /* ---------- groupes de cases à cocher (« au moins un ») ---------- */
    var groups = $$('fieldset[data-checkgroup]', form);
    function groupLabel(g) { var l = $('legend', g); if (!l) return g.id; var c = l.cloneNode(true); $$('.req', c).forEach(function (n) { n.parentNode.removeChild(n); }); return c.textContent.trim(); }
    function groupMsg(g) {
      if (!g.hasAttribute('data-required')) return '';
      return $('input:checked', g) ? '' : (g.getAttribute('data-msg-required') || 'Choisissez au moins une valeur pour «' + NB + groupLabel(g) + NB + '».');
    }
    function checkGroup(g) {
      var m = groupMsg(g), box = doc.getElementById(g.id + '-err'), cb = $('.cbx-group', g);
      if (box) { if (m) { box.innerHTML = icon('alert-circle') + '<span></span>'; $('span', box).textContent = m; box.hidden = false; } else { box.innerHTML = ''; box.hidden = true; } }
      if (cb) { if (m) cb.setAttribute('aria-invalid', 'true'); else cb.removeAttribute('aria-invalid'); }
      return !m;
    }
    groups.forEach(function (g) {
      g.addEventListener('change', function () { if (g.__touched) checkGroup(g); });
      g.addEventListener('focusout', function (e) { if (!pressingActions && !g.contains(e.relatedTarget)) { g.__touched = true; checkGroup(g); } });
    });

    function validateAll() {
      var bad = [];
      controls.forEach(function (c) { touched[c.name] = true; if (!check(c)) bad.push({ id: c.id, label: labelOf(c), el: c }); });
      groups.forEach(function (g) { g.__touched = true; if (!checkGroup(g)) bad.push({ id: $('input', g).id, label: groupLabel(g), el: $('input', g), pos: g }); });
      bad.sort(function (a, b) { return (a.pos || a.el).compareDocumentPosition(b.pos || b.el) & 4 ? -1 : 1; });
      if (summary) {
        if (bad.length) {
          summary.innerHTML = icon('alert-circle') + '<div><strong>' + plural(bad.length, 'champ à corriger', 'champs à corriger') + '</strong> avant l’enregistrement' + NB + ':<ul>' +
            bad.map(function (c) { return '<li><a href="#' + c.id + '" data-no-guard data-focus="' + c.id + '"></a></li>'; }).join('') + '</ul></div>';
          $$('a[data-focus]', summary).forEach(function (a, i) { a.textContent = bad[i].label; });
          summary.hidden = false;
        } else { summary.hidden = true; summary.innerHTML = ''; }
      }
      if (bad.length) bad[0].el.focus();          /* focus sur le premier champ en erreur */
      return bad.length === 0;
    }

    form.addEventListener('submit', function (e) {
      if (submitting) { e.preventDefault(); return; }
      if (!validateAll()) { e.preventDefault(); return; }
      submitting = true; guard.leaving = true;
      if (submitBtn) {
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.innerHTML = icon('loader', 'icon-sm spin') + '<span>Enregistrement…</span>';
      }
    });
    /* Retour arrière (cache de navigation) : le formulaire redevient utilisable. */
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      submitting = false; guard.leaving = false;
      if (submitBtn) { submitBtn.removeAttribute('aria-busy'); submitBtn.innerHTML = submitHTML; }
    });

    /* ---------- garde « modifications non enregistrées » ---------- */
    if (form.hasAttribute('data-form-guard')) {
      var snapshot = serialize(form);
      guard.form = form;
      var refresh = function () {
        guard.dirty = serialize(form) !== snapshot;    /* comparé à l'état initial : annuler ses changements = propre */
        if (dirtyBox) dirtyBox.hidden = !guard.dirty;
      };
      form.addEventListener('input', refresh);
      form.addEventListener('change', refresh);
    }

    /* ---------- jauge de mot de passe ---------- */
    $$('input[data-password-meter]', form).forEach(initMeter);
  }

  /* Liste dépendante : les options viennent d'un JSON existant (data-source + valeur du parent). Sans JavaScript, la liste rendue
     par le serveur (toutes les options) reste utilisable. */
  function initDependent(sel) {
    var parent = doc.getElementById(sel.getAttribute('data-depends-on'));
    var status = doc.getElementById(sel.id + '-status');
    if (!parent) return;
    var src = sel.getAttribute('data-source'), vk = sel.getAttribute('data-value-key') || 'id', lk = sel.getAttribute('data-label-key') || 'nom';
    var noun = sel.getAttribute('data-noun') || 'éléments', token = 0;
    function options(items, first) {
      sel.innerHTML = '';
      var o = doc.createElement('option'); o.value = ''; o.textContent = first; sel.appendChild(o);
      items.forEach(function (it) { var x = doc.createElement('option'); x.value = String(it[vk]); x.textContent = String(it[lk]); sel.appendChild(x); });
    }
    function say(html, role) { if (!status) return; status.innerHTML = html; status.setAttribute('role', role || 'status'); status.hidden = !html; }
    function idle() { token++; sel.removeAttribute('aria-busy'); sel.disabled = true; options([], sel.getAttribute('data-placeholder-empty') || 'Sélectionner d’abord une valeur'); say(''); }
    function load() {
      var v = parent.value;
      if (!v) { idle(); return; }
      var t = ++token;
      sel.disabled = true; sel.setAttribute('aria-busy', 'true');
      options([], 'Chargement…');
      say(icon('loader', 'icon-sm spin') + '<span>Chargement des ' + noun + '…</span>');
      fetch(src + encodeURIComponent(v), { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (items) {
          if (t !== token) return;
          if (!Array.isArray(items)) throw new Error('format');
          sel.removeAttribute('aria-busy');
          options(items, items.length ? (sel.getAttribute('data-placeholder') || 'Sélectionner…') : (sel.getAttribute('data-placeholder-none') || 'Aucune valeur disponible'));
          sel.disabled = !items.length;
          say(items.length ? '' : '<span>' + (sel.getAttribute('data-placeholder-none') || 'Aucune valeur disponible') + '.</span>');
        })
        .catch(function () {
          if (t !== token) return;
          sel.removeAttribute('aria-busy'); sel.disabled = true;
          options([], 'Erreur de chargement');
          say(icon('alert-circle', 'icon-sm') + '<span>Impossible de charger les ' + noun + '.</span> <button type="button" class="btn btn-link" data-retry>Réessayer</button>', 'alert');
          var b = $('[data-retry]', status); if (b) b.addEventListener('click', load);
        });
    }
    parent.addEventListener('change', load);
    if (parent.value) load(); else idle();
  }

  /* Valeurs envoyées, hors jeton CSRF : sert à savoir si le formulaire a réellement changé. */
  function serialize(form) {
    var out = [];
    new FormData(form).forEach(function (v, k) { if (k !== '_csrf' && typeof v === 'string') out.push(k + '=' + v); });
    return out.join('&');
  }

  /* ---------- jauge : conseils seulement ---------- */
  function strength(v) {
    if (!v) return 0;
    var s = 0;
    if (v.length >= 8) s++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v) && v.length >= 10) s++;
    else if (/[^A-Za-z0-9]/.test(v) && s < 4 && v.length >= 8) s = Math.min(4, s + 1);
    return Math.max(1, Math.min(4, s));
  }
  function tips(v) {
    var t = [];
    if (v.length < 8) t.push('au moins 8 caractères');
    if (!(/[a-z]/.test(v) && /[A-Z]/.test(v))) t.push('des majuscules et des minuscules');
    if (!/\d/.test(v)) t.push('un chiffre');
    if (!/[^A-Za-z0-9]/.test(v)) t.push('un symbole (par exemple ! ou ?)');
    return t;
  }
  function initMeter(input) {
    var field = input.closest('.field') || input.parentNode;
    var bar = $('[data-meter]', field), text = $('[data-meter-text]', field), tipsEl = $('[data-meter-tips]', field);
    if (!bar || !text) return;
    var words = ['non renseigné', 'faible', 'moyenne', 'bonne', 'forte'];
    [bar, text, tipsEl].forEach(function (n) { if (n) n.hidden = false; });   /* masqués sans JavaScript : inutiles sans la jauge */
    text.textContent = 'Force' + NB + ': ' + words[0] + '.';
    var speak = debounce(function (sc) { text.textContent = 'Force' + NB + ': ' + words[sc] + '.'; }, 400);   /* annonce lissée pour les lecteurs d'écran */
    function update() {
      var v = input.value, sc = strength(v), t = tips(v);
      bar.setAttribute('data-score', String(sc));
      speak(sc);
      if (tipsEl) {
        tipsEl.textContent = !v ? 'Conseil' + NB + ': mêlez majuscules, minuscules, chiffres et symboles, sur 8 caractères ou plus.'
          : t.length ? 'Pour la renforcer' + NB + ': ajoutez ' + t.join(', ') + '.' : 'Ce mot de passe respecte tous les conseils.';
      }
    }
    input.addEventListener('input', update);
    update();
  }

  /* ---------- garde : sorties de page ---------- */
  function leave(go) {
    if (!window.EPAdmin || !window.EPAdmin.confirm) { guard.leaving = true; go(); return; }
    window.EPAdmin.confirm({
      title: 'Quitter sans enregistrer' + NB + '?', tone: 'warning',
      desc: 'Les informations saisies dans le formulaire seront perdues si vous quittez cette page.',
      okLabel: 'Quitter sans enregistrer', cancelLabel: 'Rester sur le formulaire',
      onConfirm: function () { guard.leaving = true; go(); }
    });
  }
  window.addEventListener('beforeunload', function (e) {
    if (guard.dirty && !guard.leaving) { e.preventDefault(); e.returnValue = ''; }
  });
  doc.addEventListener('click', function (e) {
    if (!guard.dirty || guard.leaving || e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.hasAttribute('data-no-guard') || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
    var h = a.getAttribute('href');
    if (!h || h.charAt(0) === '#' || /^javascript:/i.test(h)) return;
    e.preventDefault();
    e.stopPropagation();
    leave(function () { window.location.href = a.href; });
  }, true);
  /* Autres formulaires de la page (déconnexion de la coque) : même confirmation avant d'envoyer. */
  doc.addEventListener('submit', function (e) {
    var f = e.target;
    if (!guard.dirty || guard.leaving || f === guard.form || !f.hasAttribute || f.hasAttribute('data-confirm-delete')) return;
    e.preventDefault();
    e.stopPropagation();
    leave(function () { f.submit(); });
  }, true);

  function boot() { $$('form[data-form]').forEach(initForm); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})();
