/*!
 * Tres Puntos — CookieConsent v3 config
 * Self-hosted, GDPR compliant, LCP friendly
 * Carga diferida con consent mode v2 para Google Analytics
 */
(function () {
  'use strict';

  // --- Google Consent Mode v2 (default: denied hasta consent) ---
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  // --- Tres Puntos Tracking Helpers (siempre disponibles, fail-safe) ---
  // tpTrack: dispara evento GA4. Consent Mode v2 lo bloquea automáticamente
  // si el usuario rechaza analytics_storage (no enviamos PII en params).
  window.tpTrack = function (eventName, params) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params || {});
      }
    } catch (e) { /* fail-safe */ }
  };

  // tpClientId: devuelve el client_id de GA4 (cookie _ga) o un fallback
  // persistente en localStorage. Sirve para correlacionar leads en
  // Airtable/Supabase con sesiones GA4 vía Measurement Protocol.
  window.tpClientId = function () {
    try {
      var m = document.cookie.match(/_ga=GA\d\.\d\.(\d+\.\d+)/);
      if (m) return m[1];
      var id = localStorage.getItem('tp_client_id');
      if (!id) {
        id = Math.floor(Math.random() * 2147483647) + '.' + Math.floor(Date.now() / 1000);
        localStorage.setItem('tp_client_id', id);
      }
      return id;
    } catch (e) { return ''; }
  };

  // tpPresupuestoToValue: mapea labels de presupuesto a valor numérico
  // estimado en EUR. Permite usar el campo "value" de GA4 para conversion
  // value reporting y futuras integraciones con Ads.
  window.tpPresupuestoToValue = function (p) {
    switch ((p || '').toLowerCase()) {
      case 'mas-50000': return 50000;
      case '25000-50000': return 37500;
      case 'mas-20k': return 25000;
      case '15k-20k':
      case '15000-25000': return 17500;
      case '10k-15k': return 12500;
      case '5k-10k': return 7500;
      default: return 3000;
    }
  };

  // --- Inicializar CookieConsent cuando esté cargado ---
  function initCC() {
    if (!window.CookieConsent) return setTimeout(initCC, 50);

    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: 'bar inline',
          position: 'bottom',
          equalWeightButtons: true,
          flipButtons: false
        },
        preferencesModal: {
          layout: 'box',
          position: 'right',
          equalWeightButtons: true,
          flipButtons: false
        }
      },

      categories: {
        necessary: {
          readOnly: true,
          enabled: true
        },
        functionality: {
          enabled: false
        },
        analytics: {
          enabled: false,
          services: {
            ga4: {
              label: 'Google Analytics 4',
              onAccept: function () {
                // Carga GA4 tras consent
                if (!document.getElementById('ga4-script')) {
                  var s = document.createElement('script');
                  s.id = 'ga4-script';
                  s.async = true;
                  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-ERX855WTHN';
                  document.head.appendChild(s);
                  gtag('js', new Date());
                  gtag('config', 'G-ERX855WTHN');
                }
                gtag('consent', 'update', { analytics_storage: 'granted' });
              },
              onReject: function () {
                gtag('consent', 'update', { analytics_storage: 'denied' });
              }
            }
          }
        },
        marketing: {
          enabled: false,
          services: {
            ads: {
              label: 'Publicidad',
              onAccept: function () {
                gtag('consent', 'update', {
                  ad_storage: 'granted',
                  ad_user_data: 'granted',
                  ad_personalization: 'granted'
                });
              },
              onReject: function () {
                gtag('consent', 'update', {
                  ad_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied'
                });
              }
            }
          }
        }
      },

      language: {
        default: 'es',
        translations: {
          es: {
            consentModal: {
              title: 'Usamos cookies',
              description: 'Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y personalizar contenido. Puedes aceptarlas todas o configurar tus preferencias.',
              acceptAllBtn: 'Aceptar todas',
              acceptNecessaryBtn: 'Rechazar',
              showPreferencesBtn: 'Preferencias',
              footer: '<a href="/politica-privacidad/">Privacidad</a> · <a href="/politica-cookies/">Cookies</a>'
            },
            preferencesModal: {
              title: 'Preferencias de cookies',
              acceptAllBtn: 'Aceptar todas',
              acceptNecessaryBtn: 'Rechazar todas',
              savePreferencesBtn: 'Guardar preferencias',
              closeIconLabel: 'Cerrar',
              sections: [
                {
                  title: 'Uso de cookies',
                  description: 'Las cookies nos ayudan a mejorar tu experiencia en el sitio, analizar el uso y personalizar contenido. Puedes activar o desactivar cada categoría según tus preferencias.'
                },
                {
                  title: 'Estrictamente necesarias',
                  description: 'Estas cookies son imprescindibles para el funcionamiento del sitio y no se pueden desactivar.',
                  linkedCategory: 'necessary'
                },
                {
                  title: 'Funcionalidad',
                  description: 'Permiten recordar tus preferencias (idioma, región) para mejorar la experiencia.',
                  linkedCategory: 'functionality'
                },
                {
                  title: 'Analíticas',
                  description: 'Nos ayudan a entender cómo usas el sitio (Google Analytics 4) de forma anónima.',
                  linkedCategory: 'analytics'
                },
                {
                  title: 'Marketing',
                  description: 'Usadas para mostrar publicidad relevante en función de tus intereses.',
                  linkedCategory: 'marketing'
                },
                {
                  title: 'Más información',
                  description: 'Para cualquier consulta sobre nuestra política de cookies y tus opciones, <a href="/contacto/">contáctanos</a> o consulta nuestra <a href="/politica-cookies/">política de cookies</a>.'
                }
              ]
            }
          }
        }
      }
    });
  }

  // Iniciar tras DOMContentLoaded (el script ya es defer, esto es seguro)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCC);
  } else {
    initCC();
  }
})();
