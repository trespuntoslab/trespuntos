/* blog-article.js — Animaciones de entrada para componentes del blog
   Activa la clase .visible en componentes con opacity:0 al entrar al viewport.
   Soporta stagger en grupos (signal-cards, pain-blocks, icon-grid, timeline-mini).
   También anima counters de .stat-callout-number y barras de .mini-chart-bar-fill. */

(function () {
  'use strict';

  // Selectores que reciben .visible al entrar al viewport
  var SIMPLE = [
    '.question-block',
    '.stat-callout',
    '.quote-pull',
    '.before-after-side',
    '.signal-card',
    '.pain-block',
    '.icon-grid-item',
    '.timeline-mini-step'
  ].join(',');

  // Selectores con stagger interno (los hijos aparecen escalonados)
  var STAGGER_GROUPS = {
    '.signal-cards': '.signal-card',
    '.pain-blocks': '.pain-block',
    '.icon-grid': '.icon-grid-item',
    '.timeline-mini': '.timeline-mini-step',
    '.before-after': '.before-after-side'
  };

  // Fallback sin IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll(SIMPLE).forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  // Observador genérico (elementos sueltos)
  var simpleObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      simpleObs.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(SIMPLE).forEach(function (el) { simpleObs.observe(el); });

  // Observador con stagger por grupo
  Object.keys(STAGGER_GROUPS).forEach(function (parentSel) {
    var childSel = STAGGER_GROUPS[parentSel];
    var groupObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var children = e.target.querySelectorAll(childSel);
        children.forEach(function (child, i) {
          setTimeout(function () { child.classList.add('visible'); }, i * 90);
        });
        groupObs.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll(parentSel).forEach(function (el) { groupObs.observe(el); });
  });

  // Counter animado en .stat-callout-number con data-target
  var counterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.stat-callout-number[data-target]').forEach(function (el) {
    counterObs.observe(el);
  });

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var duration = parseInt(el.getAttribute('data-duration') || '1400', 10);
    var start = 0;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = start + (target - start) * eased;
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }

  // mini-chart-bar: rellenar la barra al entrar
  var barObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var bars = e.target.querySelectorAll('.mini-chart-bar-fill[data-pct]');
      bars.forEach(function (bar, i) {
        var pct = parseFloat(bar.getAttribute('data-pct'));
        if (isNaN(pct)) return;
        setTimeout(function () { bar.style.width = pct + '%'; }, i * 120);
      });
      barObs.unobserve(e.target);
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.mini-chart').forEach(function (el) { barObs.observe(el); });

})();
