(function () {
  'use strict';

  var btn = document.getElementById('form-submit-btn');
  if (!btn) return;

  var fields = {
    nombre:      { el: document.getElementById('f-nombre'),      err: document.getElementById('err-nombre') },
    email:       { el: document.getElementById('f-email'),       err: document.getElementById('err-email') },
    tel:         { el: document.getElementById('f-tel'),         err: document.getElementById('err-tel') },
    presupuesto: { el: document.getElementById('f-presupuesto'), err: document.getElementById('err-presupuesto') },
    privacidad:  { el: document.getElementById('f-privacidad'),  err: document.getElementById('err-privacidad') }
  };

  var privacyRow = document.getElementById('privacy-row');
  var userTriedSubmit = false;
  var formLoadTime = Date.now();

  // ── Validators ──
  function validateNombre() {
    var v = (fields.nombre.el.value || '').trim();
    if (!v) return 'Introduce tu nombre';
    if (v.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    return '';
  }

  function validateEmail() {
    var v = (fields.email.el.value || '').trim();
    if (!v) return 'Introduce tu email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Introduce un email válido';
    return '';
  }

  function validateTel() {
    var v = (fields.tel.el.value || '').replace(/[\s\-\(\)\+]/g, '');
    if (!v) return 'Introduce tu teléfono';
    if (!/^\d+$/.test(v)) return 'Solo dígitos, sin letras';
    if (v.length !== 9) return 'El teléfono debe tener 9 dígitos';
    return '';
  }

  function validatePrivacidad() {
    if (!fields.privacidad.el.checked) return 'Debes aceptar la política de privacidad';
    return '';
  }

  function validatePresupuesto() {
    var v = document.getElementById('f-presupuesto') ? document.getElementById('f-presupuesto').value : '';
    if (!v) return 'Selecciona un rango de presupuesto';
    return '';
  }

  var validators = {
    nombre:      validateNombre,
    email:       validateEmail,
    tel:         validateTel,
    presupuesto: validatePresupuesto,
    privacidad:  validatePrivacidad
  };

  // ── Show/hide errors ──
  function showError(key, msg) {
    var f = fields[key];
    if (f.err) {
      f.err.textContent = msg;
      f.err.classList.toggle('visible', !!msg);
    }
    if (key === 'privacidad') {
      if (privacyRow) privacyRow.classList.toggle('checkbox-error', !!msg);
    } else {
      if (f.el) {
        f.el.classList.toggle('input-error', !!msg);
        f.el.classList.toggle('input-valid', !msg && (f.el.value || '').trim().length > 0);
      }
    }
  }

  // ── Check all fields ──
  function checkAll(showErrors) {
    var allValid = true;
    var firstInvalid = null;
    Object.keys(validators).forEach(function (key) {
      var msg = validators[key]();
      if (showErrors) showError(key, msg);
      if (msg) {
        allValid = false;
        if (!firstInvalid) firstInvalid = key;
      }
    });
    return { valid: allValid, firstInvalid: firstInvalid };
  }

  // ── Update button state ──
  function updateBtn() {
    var result = checkAll(false);
    if (result.valid) {
      btn.classList.remove('btn-disabled');
      btn.classList.add('btn-enabled');
      btn.dataset.formReady = 'true';
    } else {
      btn.classList.add('btn-disabled');
      btn.classList.remove('btn-enabled');
      btn.dataset.formReady = 'false';
    }
  }

  // ── form_start: dispara la primera vez que el usuario interactúa con el form ──
  var formStarted = false;
  function fireFormStart() {
    if (formStarted) return;
    formStarted = true;
    try {
      if (window.tpTrack) {
        window.tpTrack('form_start', {
          form_type: 'cta',
          pagina_origen: window.location.pathname
        });
      }
    } catch (e) { /* fail-safe */ }
  }

  // ── Real-time validation on input ──
  ['nombre', 'email', 'tel'].forEach(function (key) {
    if (!fields[key].el) return;
    fields[key].el.addEventListener('focus', fireFormStart, { once: true });
    fields[key].el.addEventListener('input', function () {
      fireFormStart();
      if (userTriedSubmit) {
        var msg = validators[key]();
        showError(key, msg);
      }
      updateBtn();
    });

    fields[key].el.addEventListener('blur', function () {
      var v = (fields[key].el.value || '').trim();
      if (v) {
        var msg = validators[key]();
        showError(key, msg);
      }
      updateBtn();
    });
  });

  // Phone: only allow digits, spaces, dashes, parens, plus
  if (fields.tel.el) {
    fields.tel.el.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9\s\-\(\)\+]/g, '');
    });
  }

  // ── Custom Select: Presupuesto ──
  (function() {
    var cs = document.getElementById('cs-presupuesto');
    var hidden = document.getElementById('f-presupuesto');
    if (!cs || !hidden) return;
    var trigger = cs.querySelector('.custom-select-trigger');
    var valueEl = cs.querySelector('.custom-select-value');
    var panel = cs.querySelector('.custom-select-panel');
    var options = cs.querySelectorAll('.custom-select-option');

    function openSelect() { cs.classList.add('open'); cs.setAttribute('aria-expanded','true'); }
    function closeSelect() { cs.classList.remove('open'); cs.setAttribute('aria-expanded','false'); }

    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      cs.classList.contains('open') ? closeSelect() : openSelect();
    });

    options.forEach(function(opt) {
      opt.addEventListener('click', function() {
        options.forEach(function(o) { o.classList.remove('selected'); });
        opt.classList.add('selected');
        var val = opt.getAttribute('data-value');
        hidden.value = val;
        valueEl.textContent = opt.textContent.trim();
        trigger.classList.add('has-value');
        closeSelect();
        if (userTriedSubmit) showError('presupuesto', validators.presupuesto());
        updateBtn();
      });
    });

    document.addEventListener('click', function(e) {
      if (!cs.contains(e.target)) closeSelect();
    });

    // Keyboard navigation
    trigger.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        openSelect();
        var first = panel.querySelector('.custom-select-option');
        if (first) first.focus();
      }
    });
    options.forEach(function(opt, idx) {
      opt.setAttribute('tabindex', '-1');
      opt.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opt.click(); trigger.focus(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); var next = options[idx + 1]; if (next) next.focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); var prev = options[idx - 1]; if (prev) prev.focus(); else trigger.focus(); }
        if (e.key === 'Escape') { closeSelect(); trigger.focus(); }
      });
    });
  })();

  // ── Services multi-select (click + keyboard) ──
  (function() {
    var cards = document.querySelectorAll('#services-grid .service-card');
    var hidden = document.getElementById('f-servicios');
    if (!cards.length || !hidden) return;
    function toggleCard(card) {
      card.classList.toggle('selected');
      card.setAttribute('aria-checked', card.classList.contains('selected') ? 'true' : 'false');
      var selected = [];
      cards.forEach(function(c) {
        if (c.classList.contains('selected')) selected.push(c.getAttribute('data-value'));
      });
      hidden.value = selected.join(', ');
    }
    cards.forEach(function(card) {
      card.addEventListener('click', function() { toggleCard(card); });
      card.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleCard(card); }
      });
    });
  })();

  // Privacy checkbox
  if (fields.privacidad.el) {
    fields.privacidad.el.addEventListener('change', function () {
      if (userTriedSubmit) {
        showError('privacidad', validators.privacidad());
      }
      updateBtn();
    });
  }

  // ── Click on disabled button → show all errors + shake ──
  btn.addEventListener('click', function (e) {
    if (btn.classList.contains('btn-disabled')) {
      e.preventDefault();
      e.stopPropagation();
      userTriedSubmit = true;

      var result = checkAll(true);

      // Shake invalid fields
      Object.keys(validators).forEach(function (key) {
        var msg = validators[key]();
        if (msg) {
          var target;
          if (key === 'privacidad') {
            target = privacyRow;
          } else {
            target = fields[key].el;
          }
          if (target) {
            target.classList.remove('shake');
            void target.offsetWidth;
            target.classList.add('shake');
            setTimeout(function () { target.classList.remove('shake'); }, 500);
          }
        }
      });

      // Focus first invalid
      if (result.firstInvalid) {
        var fk = result.firstInvalid;
        if (fk === 'privacidad') {
          fields.privacidad.el.focus();
        } else {
          fields[fk].el.focus();
        }
      }
      return;
    }
    // If enabled, mark as tried and let supabase-forms.js handle the actual submit
    userTriedSubmit = true;
  });

  // ── Anti-spam: timestamp check ──
  btn.addEventListener('click', function (e) {
    if (Date.now() - formLoadTime < 3000) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }, true);

  // ── Populate hidden tracking fields ──
  var params = new URLSearchParams(window.location.search);
  var pOrigen = document.getElementById('f-pagina-origen');
  if (pOrigen) pOrigen.value = window.location.pathname;
  var utmS = document.getElementById('f-utm-source');
  if (utmS) utmS.value = params.get('utm_source') || '';
  var utmM = document.getElementById('f-utm-medium');
  if (utmM) utmM.value = params.get('utm_medium') || '';
  var utmC = document.getElementById('f-utm-campaign');
  if (utmC) utmC.value = params.get('utm_campaign') || '';
  var ref = document.getElementById('f-referrer');
  if (ref) ref.value = document.referrer || '';
  var ts = document.getElementById('f-timestamp');
  if (ts) ts.value = new Date().toISOString();

  // Initial state
  updateBtn();

})();
