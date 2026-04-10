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
