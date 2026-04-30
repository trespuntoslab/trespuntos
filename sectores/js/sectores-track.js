// Sectores landing tracking — manda eventos a WF5 (n8n /webhook/s-track)
// Eventos: landing_visit · calendly_open · whatsapp_open · cta_click · engagement · declined
(function () {
  var TRACK_URL = 'https://n8n.trespuntos-lab.com/webhook/s-track';
  var EXCLUDED_IPS = ['85.51.255.66']; // Jordi — no contaminar datos
  var SLUG = (location.pathname || '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .split('/')
    .pop()
    .toLowerCase();

  var _ip = null;
  try {
    fetch('https://api.ipify.org?format=json')
      .then(function (r) { return r.json(); })
      .then(function (d) { _ip = d.ip; })
      .catch(function () {});
  } catch (e) {}

  function tpTrack(event, extra) {
    if (!SLUG) return;
    if (_ip && EXCLUDED_IPS.indexOf(_ip) !== -1) return;
    var payload = { id: SLUG, ts: new Date().toISOString(), event: event };
    if (extra) for (var k in extra) payload[k] = extra[k];
    try {
      if (navigator.sendBeacon && (event === 'engagement' || event === 'declined')) {
        navigator.sendBeacon(
          TRACK_URL,
          new Blob([JSON.stringify(payload)], { type: 'application/json' })
        );
      } else {
        fetch(TRACK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(function () {});
      }
    } catch (e) {}
  }
  window.tpTrack = tpTrack;

  // Landing visit
  tpTrack('landing_visit', {
    referrer: document.referrer || '',
    utm: location.search || ''
  });

  // Wrap openCal / openWA si existen, con un pequeño delay para garantizar que están definidas
  function wrapCTAs() {
    if (typeof window.openCal === 'function' && !window.openCal.__tpWrapped) {
      var _orig = window.openCal;
      window.openCal = function () {
        tpTrack('calendly_open');
        return _orig.apply(this, arguments);
      };
      window.openCal.__tpWrapped = true;
    }
    if (typeof window.openWA === 'function' && !window.openWA.__tpWrapped) {
      var _origWA = window.openWA;
      window.openWA = function () {
        tpTrack('whatsapp_open');
        return _origWA.apply(this, arguments);
      };
      window.openWA.__tpWrapped = true;
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wrapCTAs);
  } else {
    wrapCTAs();
  }
  setTimeout(wrapCTAs, 500);

  // Genérico: cualquier botón con data-cta="sectores" dispara cta_click
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    while (t && t !== document) {
      if (t.getAttribute && t.getAttribute('data-cta') === 'sectores') {
        tpTrack('cta_click', { label: t.textContent ? t.textContent.trim().slice(0, 60) : '' });
        break;
      }
      t = t.parentNode;
    }
  });

  // Engagement
  var _start = Date.now();
  var _maxScroll = 0;
  var _sent = false;
  window.addEventListener('scroll', function () {
    var pct = Math.round(
      ((window.scrollY || window.pageYOffset) + window.innerHeight) /
        document.documentElement.scrollHeight *
        100
    );
    if (pct > _maxScroll) _maxScroll = pct;
  }, { passive: true });

  function sendEngage() {
    if (_sent) return;
    var dur = Math.round((Date.now() - _start) / 1000);
    if (dur < 3) return;
    _sent = true;
    tpTrack('engagement', { duration_seconds: dur, scroll_depth: _maxScroll });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') sendEngage();
  });
  window.addEventListener('pagehide', sendEngage);
  window.addEventListener('beforeunload', sendEngage);
})();
