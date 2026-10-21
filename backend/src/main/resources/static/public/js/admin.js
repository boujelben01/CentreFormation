/* ==========================================================================
   EduPortal Admin — admin.js  (lot 7)
   Comportements de la coque Thymeleaf, repris de maquettes admin/shared.js
   (EP.theme, bindThemeButton, EP.shell : repli, tiroir, retour en haut) sans
   les données de démonstration ni la palette. Script classique, chargé en
   « defer ». Le thème initial est posé par le script inline du <head>
   (fragments/admin :: head) : clair par défaut, clé « ep-theme ».
   ========================================================================== */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, THEME_KEY = 'ep-theme';

  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ignoré */ } }
  };
  function reduceMotion() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  /* ---------- Thème (clair par défaut, sombre uniquement par data-theme) ---------- */
  var themeCbs = [];
  var theme = {
    isDark: function () { return root.getAttribute('data-theme') === 'dark'; },
    set: function (t) {
      root.setAttribute('data-theme', t);
      root.style.colorScheme = t;
      var m = $('meta[name="color-scheme"]');
      if (m) m.setAttribute('content', t);
      store.set(THEME_KEY, t);
      themeCbs.forEach(function (cb) { cb(t === 'dark'); });
    },
    toggle: function () { theme.set(theme.isDark() ? 'light' : 'dark'); },
    onChange: function (cb) { themeCbs.push(cb); }
  };
  window.EPAdmin = { theme: theme };

  $$('[data-theme-toggle]').forEach(function (btn) {
    var use = $('use', btn);
    function sync() {
      var d = theme.isDark();
      btn.setAttribute('aria-label', d ? 'Passer au thème clair' : 'Passer au thème sombre');
      if (use) use.setAttribute('href', d ? '#i-sun' : '#i-moon');
    }
    btn.addEventListener('click', function () { theme.toggle(); });
    theme.onChange(sync);
    sync();
  });

  /* ---------- Lien d'évitement ---------- */
  var skip = $('.skip-link'), main = $('#main');
  if (skip && main) skip.addEventListener('click', function (e) { e.preventDefault(); main.focus(); });

  /* ---------- Repli de la sidebar (préférence « ep-sidebar », restaurée sans flash dans la page) ---------- */
  var app = $('#app'), collapseBtns = $$('[data-collapse]');
  if (app && collapseBtns.length) {
    var applyCollapsed = function () {
      var c = app.classList.contains('is-collapsed'), l = c ? 'Développer le menu' : 'Réduire le menu';
      collapseBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', String(c));
        b.setAttribute('title', l);
        if (b.classList.contains('collapse-top')) b.setAttribute('aria-label', l);
      });
      var lab = $('#collapse-label');
      if (lab) lab.textContent = l;
    };
    applyCollapsed();
    collapseBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        app.classList.toggle('is-collapsed');
        store.set('ep-sidebar', app.classList.contains('is-collapsed') ? '1' : '0');
        applyCollapsed();
      });
    });
  }

  /* ---------- Groupes du menu repliables (accordéon) ----------
     Chaque titre de groupe (Pilotage, Pédagogie…) devient un bouton [aria-expanded] qui plie / déplie sa liste.
     Le groupe de la page affichée reste ouvert ; l'état des autres est mémorisé (« ep-nav-groups »). Sans JavaScript :
     tous les groupes sont ouverts. Menu réduit (icônes seules) : toutes les listes restent visibles. */
  (function () {
    var saved = {};
    try { saved = JSON.parse(store.get('ep-nav-groups') || '{}') || {}; } catch (e) { saved = {}; }
    $$('#sidebar .nav-group').forEach(function (group, i) {
      var label = $('.nav-label', group), list = $('.nav-list', group);
      if (!label || !list) return;
      var name = label.textContent.trim(), key = name.toLowerCase();
      if (!list.id) list.id = 'nav-list-' + i;
      var btn = doc.createElement('button');
      btn.type = 'button'; btn.className = 'nav-toggle';
      btn.setAttribute('aria-controls', list.id);
      btn.innerHTML = '<span></span><svg class="icon icon-sm" aria-hidden="true" focusable="false"><use href="#i-chevron-down"/></svg>';
      $('span', btn).textContent = name;
      label.textContent = ''; label.appendChild(btn);
      var hasActive = !!$('[aria-current="page"]', list);
      function set(open, persist) {
        group.classList.toggle('is-closed', !open);
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', (open ? 'Replier le groupe ' : 'Déplier le groupe ') + name);
        if (persist) { saved[key] = open ? 1 : 0; store.set('ep-nav-groups', JSON.stringify(saved)); }
      }
      set(hasActive || saved[key] !== 0, false);
      btn.addEventListener('click', function () { set(group.classList.contains('is-closed'), true); });
    });
  })();

  /* ---------- Tiroir mobile : focus piégé, Échap, clic sur le voile ---------- */
  var sidebar = $('#sidebar'), overlay = $('#drawer-overlay'), toggle = $('#menu-toggle'), closeBtn = $('#drawer-close');
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  var drawerOpen = false;
  function focusables(r) { return $$(FOCUSABLE, r).filter(function (el) { return !el.hidden && el.offsetParent !== null; }); }
  function openDrawer() {
    if (!sidebar || drawerOpen) return;
    drawerOpen = true;
    sidebar.classList.add('is-open');
    overlay.hidden = false;
    window.requestAnimationFrame(function () { overlay.classList.add('is-visible'); });
    toggle.setAttribute('aria-expanded', 'true');
    if (closeBtn) closeBtn.focus();
  }
  function closeDrawer(restore) {
    if (!drawerOpen) return;
    drawerOpen = false;
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    setTimeout(function () { if (!drawerOpen) overlay.hidden = true; }, 250);
    toggle.setAttribute('aria-expanded', 'false');
    if (restore) toggle.focus();
  }
  if (sidebar && overlay && toggle) {
    toggle.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', function () { closeDrawer(true); });
    overlay.addEventListener('click', function () { closeDrawer(true); });
    doc.addEventListener('keydown', function (e) {
      if (!drawerOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); closeDrawer(true); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(sidebar);
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1];
      if (!sidebar.contains(doc.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    var wide = window.matchMedia ? window.matchMedia('(min-width: 768px)') : null;
    if (wide && wide.addEventListener) wide.addEventListener('change', function (m) { if (m.matches) closeDrawer(false); });
  }

  /* ---------- Retour en haut ---------- */
  var tt = $('#to-top');
  if (tt) {
    var t0;
    window.addEventListener('scroll', function () {
      clearTimeout(t0);
      t0 = setTimeout(function () { tt.hidden = window.scrollY < 400; }, 50);
    }, { passive: true });
    tt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
      if (main) main.focus({ preventScroll: true });
    });
  }

  /* ---------- Avatars d'initiales : teinte stable 1..8 dérivée du nom ([data-avatar="Prénom Nom"]) ----------
     Même algorithme (djb2) que frontend/src/lib/avatar.ts : même nom, même couleur que l'espace React.
     Sans JavaScript l'avatar garde sa teinte par défaut (data-t absent = teinte 1). */
  function avatarTint(name) {
    var hash = 5381, v = String(name).trim().toLowerCase();
    for (var i = 0; i < v.length; i++) hash = ((hash << 5) + hash + v.charCodeAt(i)) | 0;
    return (Math.abs(hash) % 8) + 1;
  }
  $$('[data-avatar]').forEach(function (el) { el.setAttribute('data-t', String(avatarTint(el.getAttribute('data-avatar') || 'EduPortal'))); });

  /* ---------- Dialogue de confirmation (maquette : EP.confirm) ----------
     EPAdmin.confirm({ title, desc, items, okLabel, cancelLabel, tone: 'danger' | 'warning', onConfirm, onCancel })
     Modal : focus piégé, Échap = annuler, clic sur le fond = annuler, focus rendu à l'élément d'origine.
     Ne supprime rien par lui-même : onConfirm doit soumettre le formulaire POST (jeton CSRF inclus). */
  var dlg = null;
  function buildDialog() {
    var layer = doc.createElement('div');
    layer.className = 'layer'; layer.id = 'confirm'; layer.hidden = true;
    layer.innerHTML =
      '<div class="layer-backdrop"></div>' +
      '<div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc">' +
        '<div class="dialog-ico" id="confirm-ico"><svg class="icon icon-lg" aria-hidden="true" focusable="false"><use href="#i-trash"/></svg></div>' +
        '<h2 id="confirm-title"></h2><p id="confirm-desc"></p><ul id="confirm-list" hidden></ul>' +
        '<div class="dialog-actions"><button type="button" class="btn btn-secondary" id="confirm-cancel">Annuler</button>' +
        '<button type="button" class="btn btn-danger" id="confirm-ok">Supprimer</button></div>' +
      '</div>';
    doc.body.appendChild(layer);
    return {
      layer: layer, box: $('.dialog', layer), ico: $('#confirm-ico', layer), title: $('#confirm-title', layer), desc: $('#confirm-desc', layer),
      list: $('#confirm-list', layer), ok: $('#confirm-ok', layer), cancel: $('#confirm-cancel', layer), open: false, opener: null, o: null
    };
  }
  function closeDialog(confirmed) {
    if (!dlg || !dlg.open) return;
    var o = dlg.o, opener = dlg.opener;
    dlg.open = false; dlg.layer.hidden = true; dlg.o = null;
    doc.body.classList.remove('has-dialog');
    if (app) { app.removeAttribute('inert'); app.removeAttribute('aria-hidden'); }
    /* Focus rendu à l'élément d'origine (ou au contenu principal s'il a disparu). */
    if (opener && doc.contains(opener) && opener.focus) opener.focus();
    else if (main) main.focus({ preventScroll: true });
    if (confirmed) { if (o && o.onConfirm) o.onConfirm(); }
    else if (o && o.onCancel) o.onCancel();
  }
  function openDialog(o) {
    if (!dlg) {
      dlg = buildDialog();
      dlg.cancel.addEventListener('click', function () { closeDialog(false); });
      dlg.ok.addEventListener('click', function () { closeDialog(true); });
      $('.layer-backdrop', dlg.layer).addEventListener('click', function () { closeDialog(false); });
      doc.addEventListener('keydown', function (e) {
        if (!dlg.open) return;
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeDialog(false); return; }
        if (e.key !== 'Tab') return;
        var f = focusables(dlg.box);
        if (!f.length) { e.preventDefault(); return; }
        var first = f[0], last = f[f.length - 1];
        if (!dlg.box.contains(doc.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }, true);
    }
    if (dlg.open) closeDialog(false);
    var warn = o.tone === 'warning';
    dlg.o = o; dlg.opener = o.opener || doc.activeElement; dlg.open = true;
    dlg.title.textContent = o.title || '';
    dlg.desc.textContent = o.desc || '';
    dlg.list.innerHTML = '';
    (o.items || []).forEach(function (t) { var li = doc.createElement('li'); li.textContent = t; dlg.list.appendChild(li); });
    dlg.list.hidden = !(o.items && o.items.length);
    dlg.ok.textContent = o.okLabel || 'Supprimer';
    dlg.ok.className = 'btn ' + (warn ? 'btn-primary' : 'btn-danger');
    dlg.cancel.textContent = o.cancelLabel || 'Annuler';
    dlg.ico.className = 'dialog-ico' + (warn ? ' is-warning' : '');
    $('use', dlg.ico).setAttribute('href', warn ? '#i-alert' : '#i-trash');
    dlg.layer.hidden = false;
    doc.body.classList.add('has-dialog');
    if (app) { app.setAttribute('inert', ''); app.setAttribute('aria-hidden', 'true'); }
    dlg.cancel.focus();   /* focus initial sur l'action sûre */
  }
  window.EPAdmin.confirm = openDialog;
  window.EPAdmin.reduceMotion = reduceMotion;

  /* ---------- Onglets (role="tablist" [data-tabs]) : clic et flèches gauche / droite ---------- */
  $$('[role="tablist"][data-tabs]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var p = doc.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  });

  /* ---------- Afficher / masquer un mot de passe ([data-pwd-toggle] + aria-controls) ---------- */
  $$('[data-pwd-toggle]').forEach(function (btn) {
    var inp = doc.getElementById(btn.getAttribute('aria-controls')), use = $('use', btn);
    if (!inp) return;
    btn.addEventListener('click', function () {
      var show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
      if (use) use.setAttribute('href', show ? '#i-eye-off' : '#i-eye');
    });
  });

  /* ---------- Connexion : champs obligatoires, puis envoi normal du formulaire (POST /login + jeton CSRF) ---------- */
  var login = $('#login-form');
  if (login) {
    var setErr = function (name, msg) {
      var inp = doc.getElementById(name), err = doc.getElementById(name + '-err');
      if (!inp || !err) return;
      if (msg) {
        err.innerHTML = '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-alert-circle"/></svg><span></span>';
        $('span', err).textContent = msg;
        err.hidden = false;
        inp.setAttribute('aria-invalid', 'true');
      } else {
        err.innerHTML = ''; err.hidden = true; inp.removeAttribute('aria-invalid');
      }
    };
    var busy = false;
    login.addEventListener('submit', function (e) {
      if (busy) { e.preventDefault(); return; }
      var u = doc.getElementById('username'), p = doc.getElementById('password');
      setErr('username', u.value.trim() ? '' : 'Saisissez votre nom d’utilisateur.');
      setErr('password', p.value ? '' : 'Saisissez votre mot de passe.');
      if (!u.value.trim()) { e.preventDefault(); u.focus(); return; }
      if (!p.value) { e.preventDefault(); p.focus(); return; }
      busy = true;
      var btn = doc.getElementById('login-submit'), ico = doc.getElementById('login-ico'), lab = doc.getElementById('login-label');
      if (btn) btn.setAttribute('aria-busy', 'true');
      if (ico) { ico.innerHTML = '<use href="#i-loader"/>'; ico.classList.add('spin'); }
      if (lab) lab.textContent = 'Connexion…';
    });
  }
})();
