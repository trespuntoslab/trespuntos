(function () {
  'use strict';

  var btn = document.getElementById('form-submit-btn');
  if (!btn) return;

  var fields = {
    nombre: { el: document.getElementById('f-nombre'), err: document.getElementById('err-nombre') },
    email:  { el: document.getElementById('f-email'),  err: document.getElementById('err-email') },
    tel:    { el: document.getElementById('f-tel'),     err: document.getElementById('err-tel') },
    privacidad: { el: document.getElementById('f-privacidad'), err: document.getElementById('err-privacidad') }
  };

  var privacyRow = document.getElementById('privacy-row');
  var userTriedSubmit = false;

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
    if (v.length < 9) return 'El teléfono debe tener mínimo 9 dígitos';
    if (!/^\d+$/.test(v)) return 'Solo dígitos, sin letras';
    return '';
  }

  function validatePrivacidad() {
    if (!fields.privacidad.el.checked) return 'Debes aceptar la política de privacidad';
    return '';
  }

  var validators = {
    nombre: validateNombre,
    email: validateEmail,
    tel: validateTel,
    privacidad: validatePrivacidad
  };

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

  ['nombre', 'email', 'tel'].forEach(function (key) {
    if (!fields[key].el) return;
    fields[key].el.addEventListener('input', function () {
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

  if (fields.tel.el) {
    fields.tel.el.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9\s\-\(\)\+]/g, '');
    });
  }

  if (fields.privacidad.el) {
    fields.privacidad.el.addEventListener('change', function () {
      if (userTriedSubmit) {
        showError('privacidad', validators.privacidad());
      }
      updateBtn();
    });
  }

  btn.addEventListener('click', function (e) {
    if (btn.classList.contains('btn-disabled')) {
      e.preventDefault();
      e.stopPropagation();
      userTriedSubmit = true;

      var result = checkAll(true);

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
    userTriedSubmit = true;
  });

  // Populate tracking fields
  (function () {
    var params = new URLSearchParams(window.location.search);
    var set = function (id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
    set('f-pagina-origen', window.location.pathname);
    set('f-utm-source', params.get('utm_source'));
    set('f-utm-medium', params.get('utm_medium'));
    set('f-utm-campaign', params.get('utm_campaign'));
    set('f-referrer', document.referrer);
    set('f-timestamp', String(Date.now()));
  })();

  updateBtn();
})();
