# Tres Puntos Web — Normas de desarrollo

## Deploy — Regla crítica
**NUNCA hacer `git push` ni subir archivos al servidor sin permiso EXPLÍCITO de Jordi en el chat.**
- Claude recomienda cuándo hacer push (tras cambios significativos, al final de una sesión de trabajo, etc.)
- Jordi debe confirmar ("sí", "sube", "dale", "push") antes de ejecutar cualquier `git push` o upload
- Esto aplica a git push, FTP, SCP, rsync, o cualquier método de transferencia a producción

### Flujo de deploy actual (desde 2026-03-31)
1. **Git push**: `git push origin main` → sube al repositorio `git@github.com:trespuntoslab/trespuntos.git`
2. **Deploy en Hostinger**: Panel hPanel → Git → botón **Implementar** (o activar Implementación automática)
3. El directorio en servidor: `public_html/trespuntos/` en `trespuntos-lab.com`
4. SSH configurado: clave `~/.ssh/id_ed25519` añadida a GitHub cuenta `trespuntoslab` (2026-03-31)
5. FTP (alternativa): usuario `claude`, directorio base `/public_html/trespuntos/` — puerto 21 puede estar bloqueado según red

### FTP Producción — trespuntoscomunicacion.es (Nominalia)
- **Host**: `trespuntoscomunicacion.es`
- **Usuario**: `claude@trespuntoscomunicacion.es`
- **Password**: `N63aCg5%&9xÑ(Atk5R`
- **Directorio raíz**: `/home/tres/public_html`
- **Protocolo**: FTP con TLS implícito (usar `curl -k` por cert mismatch del hosting)
- **Comando base**: `curl -k "ftp://claude%40trespuntoscomunicacion.es:N63aCg5%25%269xÑ(Atk5R@trespuntoscomunicacion.es/"`
- **Nota**: La Ñ en la password requiere encoding UTF-8 directo (no percent-encode)
- **Elementos a preservar siempre**: `db-clientes/`, `intekmedical-reporte/`, `proyectos/`, `img_firma/`, `phpMyAdmin/`, `.well-known/`, `cgi-bin/`, archivos verificación Google

## Design System
Cuando se modifique cualquier token CSS, componente visual, o se añada un nuevo componente:
- Actualizar `/design-system.html` para reflejar el cambio
- Actualizar la fecha de "Última actualización" en el header y footer del design system
- Si se añade un nuevo color, botón, input o patrón: añadir una sección o ejemplo en el design system

## Formulario CTA (sección cierre)
El formulario es un **componente reutilizable** idéntico en todas las páginas. Alimenta la automatización n8n/Airtable.

### Flujo de automatización
```
Cualquier página → Form CTA → Supabase (web_contactos) + n8n (leads-trespuntos) → Airtable
                             → Redirect a /form-v3/gracias.html
                             → gracias.html da acceso al briefing completo (/form-v3/form-step1.html)
```

### Archivos JS del formulario (3 scripts, siempre en este orden)
1. `/js/supabase-forms.js` (defer) — Conexión Supabase + n8n, honeypot check, rate limiting 30s, Turnstile token, lead scoring
2. `/js/form-validation.js` (defer) — Validación en tiempo real, custom-select, service cards multi-select, shake en errores, tracking UTM
3. Ambos deben cargarse DESPUÉS de `components.js`

### Anti-spam (3 capas)
- **Cloudflare Turnstile** invisible: script `challenges.cloudflare.com/turnstile/v0/api.js` + widget `<div class="cf-turnstile" data-sitekey="0x4AAAAAACv1HyITv5ZdYE50" data-theme="dark" data-size="invisible">` antes del botón submit
- **Honeypot** (`hp_field`): campo oculto, si tiene valor se bloquea el envío
- **Rate limiting**: localStorage bloquea envíos dentro de 30 segundos
- La validación server-side del token Turnstile se hace en n8n (workflow `leads-trespuntos`)

### Estructura HTML del formulario
- Campos visibles: Nombre, Email de empresa, Teléfono, Inversión estimada (custom-select), Servicios (6 service-cards multi-select), Cuéntanos qué está pasando, Privacidad (checkbox)
- Campos ocultos: `hp_field`, `f-servicios`, `f-presupuesto`, `f-pagina-origen`, `f-utm-source`, `f-utm-medium`, `f-utm-campaign`, `f-referrer`, `f-timestamp`
- Error spans: `err-nombre`, `err-email`, `err-tel`, `err-presupuesto`, `err-privacidad`
- Header: `form-card-title` "Inicia el proyecto" + `form-card-sub` subtítulo (con inline styles)
- Botón: "Enviar mensaje" con `btn-primary magnetic-btn btn-disabled` (se activa con JS cuando todo es válido)
- Banner: `.briefing-banner` enlazando a `/form-v3/form-step1.html`

### Wrappers
- En **contacto**: `contact-form-card` > `form-card-header` + `form` + `briefing-banner`
- En **home y casos de estudio**: `cierre-form-inner` > `form-gradient-accent` + `form-card-header` + `form`, luego `briefing-banner` fuera de `cierre-form-inner`
- El `form-card-title` debe llevar style inline: `font-size:1.25rem;font-weight:700;color:var(--mint);margin-bottom:.25rem;`
- El `form-card-sub` debe llevar style inline: `font-size:.85rem;color:var(--text-muted);line-height:1.5;`

### CSS del formulario
- Estilos de `.service-card`, `.services-grid`, `.custom-select`, `.briefing-banner` están en `/css/case-study.css`
- La home carga `case-study.css` además de `design-system.css` y `components.css`
- Contacto y nosotros tienen estilos inline (pendiente de centralizar)

### Validación (form-validation.js)
- Al hacer click en botón disabled: muestra todos los errores + shake animation + focus en primer campo inválido
- Validación en tiempo real al escribir (después del primer intento de envío)
- Custom-select: click abre panel, selección actualiza hidden field + label
- Service cards: click toggle con aria-checked, actualiza hidden `f-servicios`
- Teléfono: solo permite dígitos (9 dígitos España)
- Anti-spam timing: bloquea envío los primeros 3 segundos después de carga

## CSS
- Tokens en `/css/design-system.css`
- Componentes en `/css/components.css`
- Case studies en `/css/case-study.css`
- No añadir librerías CSS externas sin justificación
- Reutilizar variables CSS existentes antes de crear valores hardcodeados
- `@keyframes` solo en `design-system.css` (no duplicar en components o case-study)
- Colores: usar `var(--bg-base)`, `var(--mint)`, `rgba(var(--mint-rgb),...)` — nunca hardcodear `#0e0e0e` o `rgba(93,255,191,...)`

## JavaScript
- `/js/components.js` — Navbar, footer, carousel, IntersectionObserver (cargar con `defer`)
- `/js/main.js` (defer) — Hero canvas particles, counters, scroll progress, animaciones de servicio
- `/js/form-validation.js` (defer) — Validación formulario CTA, custom-select, service cards
- `/js/supabase-forms.js` (defer) — Submit handlers, Supabase + n8n + Turnstile
- `/js/service-page.js` (defer) — Animaciones específicas de páginas de servicio

### Performance (home)
- Critical CSS inlineado en `<style>` tag en el `<head>` de `index.html` — incluye hero, partículas, orbit, phone, aura y todas las keyframes
- CSS externo cargado async: `media="print" onload="this.media='all'"` con `<noscript>` fallback
- Google Fonts optimizados: Inter 400,500 · Plus Jakarta Sans 700 · JetBrains Mono 400
- **Hero particles**: 35 puntos CSS puro (2-4px, opacidad 0.12-0.3), glow sutil con box-shadow doble, animación `particleWander` (5 keyframes orgánicos) + `particleGlow`. Sin JavaScript, sin RAF — todo GPU
- **Orbit SVGs preloaded**: 10 `<link rel="preload">` en el `<head>` + `loading="eager"` + `fetchpriority="high"` + `width/height` explícitos
- **Phone mockup responsive**: `transform:scale()` por viewport width (≤1400px: .78, ≤1200px: .68, ≤1024px: .58) para evitar corte de callouts
- **Menú móvil canvas**: 20 partículas con glow triple (antes 80 con líneas de conexión = ~3000 cálculos/frame eliminados)
- `components.js` con `defer` + `DOMContentLoaded` para `TP.navbar()` y `TP.initJS()`

### SEO — Schemas JSON-LD (2026-03-27)
- **WebSite + SearchAction**: en `index.html` — habilita sitelinks search box en Google
- **BreadcrumbList**: en 77 páginas — home, servicios hub + 22 servicios detalle, casos hub + 9 casos individuales, blog + todos los posts, contacto, nosotros, arquitectura-digital-conversion
- Formato: `Inicio > Sección > Página actual` (último item sin `item` property per spec)

### Menú móvil (2026-03-27)
- Orden links: Diseño UX/UI primero, luego Desarrollo Web, E-commerce, etc.
- Animación apertura: stagger blur con alternancia izq/der (`menuLinkSlide` + `menuLinkSlideRight`), CTA final con `menuCtaPop`
- Animación cierre: clase `.closing` con blur + fade out suave (0.5s), clip-path contrae al botón hamburger
- Botones hero mobile: full-width apilados verticalmente

## Casos de estudio — Sistema modular

### Estructura
Cada caso vive en `/casos-de-negocio/{slug}/`:
- `config.json` — Fuente de verdad (textos, imágenes, bloques, SEO)
- `index.html` — Generado por la skill `/case-study`
- `assets/` — Imágenes/videos originales subidos por el usuario
- Imágenes procesadas en `/img/casos/{slug}/` (WebP, videos MP4 comprimidos)

### Casos activos (9)
| Slug | Cliente | Estado |
|------|---------|--------|
| `exitbcn` | ExitBCN | Completo |
| `gibobs` | Gibobs | Completo |
| `diferentidea` | Diferent Idea | Completo |
| `tusolucionhipotecaria` | Tu Solución Hipotecaria | Completo |
| `penguinaula` | Penguin Aula | Completo |
| `nomadevans` | Nomade Vans | Completo (revisar spacing hero) |
| `nomade-rent` | Nomade Rent | Completo |
| `tsp` | Talent Search People | Plantilla básica (sin assets nuevos) |
| `zimconnections` | Zim Connections | Plantilla básica (sin assets nuevos) |

### Skills disponibles
- `/case-study crear {slug}` — Crear nuevo caso desde briefing + assets en la carpeta
- `/case-study regenerar {slug}` — Regenerar HTML desde config.json existente
- `/regenerar-casos` — Regenerar TODOS los casos desde sus config.json

### Flujo para crear un nuevo caso
1. El usuario deja textos (`.md`) + imágenes + videos en `/casos-de-negocio/{slug}/assets/`
2. Ejecutar `/case-study crear {slug}`
3. La skill: clasifica imágenes, convierte a WebP, comprime videos, genera config.json + index.html
4. Actualizar `/casos-de-negocio/index.html` (página general) añadiendo la tarjeta del nuevo caso
5. **IMPORTANTE**: Después de generar, eliminar la carpeta `assets/` (los archivos procesados están en `/img/casos/{slug}/`). Las carpetas assets/ son temporales y NO deben quedar en el repo.

### Bloques disponibles del catálogo
| Bloque | Descripción |
|--------|-------------|
| `hero-split` | Hero con video/imagen + texto (gibobs, diferentidea) |
| `hero-simple` | Hero centrado + browser debajo (nomadevans, TSH) |
| `statement` | Frase de impacto con particles + badge-dot |
| `overview` | Narrativa + meta info (cliente/sector/servicios) |
| `challenge` | Problema + señales de fricción con iconos |
| `browser-fullwidth` | Screenshot desktop en browser frame |
| `browser-duo` | 2 browsers lado a lado |
| `browser-scroll` | Screenshot largo con auto-scroll CSS |
| `phone-carousel` | Carrusel infinito de móviles |
| `phone-grid` | Grid de móviles con labels |
| `video-phones` | Screen recordings en phone frames |
| `video-browser` | Screen recording desktop en browser frame |
| `approach-cards` | 3-4 columnas con la solución |
| `impact-grid` | Resultados con iconos |
| `stats-grid` | Números/métricas grandes |
| `platform-gallery` | Grid de screenshots desktop |
| `combo-layout` | Desktop + mobile lado a lado |
| `step-map` | Pasos del proceso conectados (TSH) |
| `configurator-grid` | Browsers con labels (Nomade Vans) |
| `marquee` | Texto animado scroll horizontal |
| `quote` | Cita de Jordi con avatar |
| `services` | Links a servicios aplicados |
| `faq` | Accordion de preguntas |
| `next-project` | Link al siguiente caso |
| `cta-form` | Formulario de cierre (siempre último, usar form de contacto) |

### Reglas importantes
- NUNCA repetir el mismo orden de bloques entre casos
- Siempre `<span class="badge-dot"></span>` dentro de cada `section-badge`
- Siempre particles (6 divs) en secciones statement
- Variar animaciones: `cs-reveal`, `cs-reveal-left`, `cs-reveal-right`, `cs-reveal-blur`, `cs-reveal-scale`, `cs-stagger`
- Videos mobile: escalar a 660px ancho, CRF 28
- Videos desktop: escalar a 1280px ancho, CRF 23
- Imágenes: WebP quality 82
- Recortar cookies si se detectan en screenshots

### Cambios aplicados (2026-03-27)
- **Schemas JSON-LD**: WebSite+SearchAction en home + BreadcrumbList en 77 páginas (servicios, casos, blog, contacto, nosotros)
- **LCP hero**: Orbit SVGs preloaded (10 `<link rel="preload">`) + `loading="eager"` + `fetchpriority="high"` + `width/height` explícitos
- **Partículas hero CSS**: 35 puntos con animación orgánica `particleWander` + `particleGlow`, glow sutil doble box-shadow. Sin JS, solo GPU
- **Menú móvil optimizado**: 80→20 partículas canvas con glow triple (sin líneas de conexión), stagger blur en links, cierre suave con clase `.closing`
- **Formulario CTA inline en contacto**: El formulario está directamente en el HTML de `/contacto/index.html` (no depende de `TP.ctaForm()`). Checkboxes de servicios con estilo limpio (sin chip/card), solo checkbox + texto. Botón disabled con estilo mint outline. Servicios en grid 3 columnas (2 en mobile)
- **Try/catch defensivo**: Todas las llamadas `TP.xxx()` en ~80 HTMLs envueltas en try/catch para evitar que un error rompa `initJS()` y deje los `.reveal` invisibles
- **Phone mockup responsive**: `transform:scale()` por viewport (≤1400px: .78, ≤1200px: .68, ≤1024px: .58)
- **Botones hero mobile**: full-width apilados verticalmente en `<768px`

### Cambios aplicados (2026-04-01)
- **Contacto v3 → producción**: Nueva página `/contacto/index.html` con chat IA embebido (Jordan), border gradiente animado (conic-gradient 12 stops, 16s), placeholder animado con avatar Jordan + frases rotativas, canvas particles de fondo, custom cursor. Backup en `/contacto/index-v2-backup.html`
- **Nueva página `/iniciar-proyecto/`**: Página standalone solo con hero + chat Jordan, sin footer ni formulario. Es el destino del CTA "Cuéntanos tu proyecto" en la navbar
- **CTA navbar → `/iniciar-proyecto/`**: Todos los botones CTA de la navbar, menú móvil, footer y briefing-banners (~42 HTMLs + components.js) apuntan ahora a `/iniciar-proyecto/` en lugar de `/form-v3/form-step1.html`
- **Privacidad en chats**: Aviso de privacidad añadido al chat embebido de contacto y al widget Jordan v4 (footer del Shadow DOM)
- **`.htaccess` actualizado**: Eliminado redirect `iniciar-proyecto → form-v3/form-step1.html`. Añadido redirect inverso `form-v3/form-step1.html → /iniciar-proyecto/`
- **Sitemap actualizado**: Nueva entrada `/iniciar-proyecto/` con priority 0.9

### Cambios aplicados (2026-04-02)
- **Fix formularios servicios**: `ctaForm()` en `components.js` sobrescribía el form hardcoded de las 27 páginas de servicios, destruyendo las referencias DOM de `form-validation.js` y `supabase-forms.js`. Fix: `if(el.querySelector('form'))return;` — si ya existe un `<form>`, no sobrescribe

### Estado actual del deploy (2026-04-02)
- **Git push realizado**: Commit `b405bc5` pusheado a `origin/main` (2026-04-02)
- **Contenido subido**: Contacto v3, /iniciar-proyecto/, CTAs actualizados en ~55 archivos, privacidad en chats, .htaccess, sitemap, fix formularios servicios
- **🟡 Pendiente en Hostinger**: Hacer **Implementar** en hPanel → Git para que los cambios se reflejen en producción
- **🟡 Verificar post-deploy**:
  - `/contacto/` → Debe mostrar el chat Jordan embebido con border gradiente animado
  - `/iniciar-proyecto/` → Debe cargar la página standalone con hero + chat Jordan
  - Navbar CTA "Cuéntanos tu proyecto" → Debe ir a `/iniciar-proyecto/`
  - `/form-v3/form-step1.html` → Debe redirigir 301 a `/iniciar-proyecto/`
  - Jordan widget bubble → Aviso de privacidad visible en el footer
- **🟡 Purgar caché**: Después de implementar, purgar LiteSpeed en Hostinger (Advanced → Cache Manager → Purge All)

### Cambios aplicados (2026-04-07) — Revisión campaña partners
- **Auditoría completa de la campaña partners**: Revisión de todos los workflows n8n, Airtable, landing de auditoría y documentación antes de activación
- **Seguridad Kobe workflow (BLcLAnrGcwUYyDJf)**: Migración de API keys hardcodeadas a n8n Credentials:
  - Nodo "Leer Datos Agencia Airtable": `Authorization: Bearer patN5OZQ...` → credencial `airtableApiKey` (Predefined → Airtable API). Header eliminado.
  - Nodo "GPT-4.1-mini Kobe": `Authorization: Bearer sk-proj-fWYIB...` → credencial `OpenAi account 2` (Predefined → OpenAi). Header eliminado.
  - Nodo "Notificar Jordan": Token Telegram en URL — no migrable en nodo HTTP Request (API requiere token en path `/bot<token>/`). Pendiente: reemplazar por nodo nativo Telegram.
- **Verificación workflows en producción**:
  - WF3 (Envío Secuencial): Filtro correcto `Pipeline = "✅ Aprobado"`, Gmail OAuth2, firma HTML — OK
  - WF5 (Tracking Auditoría): Última ejecución exitosa 7 abril — OK
  - WF0 (Jordan Chat Proxy): CORS correcto para trespuntoscomunicacion.es — OK
  - Pipeline v2.5 (Leads): Email bienvenida con colores mint, URL correcta — OK
- **Verificación Airtable (base appdeN48esyCb1v7H)**:
  - Sin duplicados (RODANET, V3rtice: 1 registro por tabla)
  - Datos completos en las 3 tablas (Agencias, Secuencia Emails, Auditorías)
- **Verificación landing auditoría** (`/partners/audit/index.html`):
  - Webhook base URL correcta: `https://n8n.trespuntos-lab.com/webhook`
  - Tracking events (visit, calendly, dismiss) apuntan a WF5 — OK
- **Documentación actualizada**: `/partners/campana/WORKFLOWS.md` — Problemas de WF3, WF5 y Kobe marcados como resueltos/migrados
- **Cloudflare Turnstile**: Configurado por Jordi en la landing de auditoría partners

### Pendientes globales — Próximas tareas
- ✅ ~~Crear 4 páginas de servicios por ciudad~~ COMPLETADO (2026-03-27)
- ✅ ~~Formulario CTA inline en contacto~~ COMPLETADO (2026-03-27)
- ✅ ~~Contacto v3 con chat Jordan embebido~~ COMPLETADO (2026-04-01)
- ✅ ~~Página /iniciar-proyecto/ standalone~~ COMPLETADO (2026-04-01)
- ✅ ~~CTAs navbar/footer → /iniciar-proyecto/~~ COMPLETADO (2026-04-01)
- ✅ ~~Privacidad en chats (contacto + Jordan widget)~~ COMPLETADO (2026-04-01)
- ✅ ~~Seguridad Kobe workflow: migrar API keys a credenciales~~ COMPLETADO (2026-04-07): Airtable + OpenAI migrados. Telegram pendiente (requiere nodo nativo)
- Replicar formulario inline de contacto en el resto de páginas (home, casos, servicios) — actualmente dependen de `TP.ctaForm()` que puede fallar
- Validar token Turnstile server-side en n8n (workflow leads-trespuntos)
- Añadir puntos verdes animados (como contacto) en secciones statement de TODOS los casos
- Mejorar animaciones de entrada en todos los templates (más "wow")
- Revisar spacing del hero centrado en TSH y Nomade Vans (título en 3 líneas, texto pegado)
- Kobe workflow: reemplazar nodo HTTP "Notificar Jordan" por nodo nativo Telegram (para eliminar token del URL)

## Documentación de automatización
**IMPORTANTE: Antes de tocar CUALQUIER cosa relacionada con formularios, webhooks, o el flujo de envío, leer OBLIGATORIAMENTE:**
- `/master/Automatizacion/FLUJO-COMPLETO-REVISION.md` — Estado real verificado de todos los flujos, webhooks, nodos n8n, y bugs corregidos
- `/master/Automatizacion/SISTEMA-AUTOMATIZACION-COMPLETO.md` — Documento histórico y técnico del sistema completo
- `/master/Automatizacion/PIPELINE-LEADS-RESUMEN.md` — Resumen de mejoras implementadas en el pipeline

### Reglas críticas
- **NUNCA cambiar** los webhooks (`leads-trespuntos`, `briefing-doc-funcional`) sin verificar contra la documentación
- **NUNCA cambiar** nombres de campos en `supabase-forms.js` sin verificar que coinciden con "Mapear datos lead" en n8n
- **SIEMPRE** usar `continueOnFail: true` en nodos de Google Drive en n8n
- **SIEMPRE** verificar con un test real después de cualquier cambio (enviar form + comprobar Airtable + Telegram)
- El campo `integraciones` en Airtable es `singleLineText` — enviar como string con `.join(', ')`, NUNCA como array
- El campo `presupuesto` necesita mapeo: "15k-20k" → "15K-20K€" (ver `presMap` en nodo "Upsert AT Briefing")

### Formularios eliminados (no recrear)
- `/iniciar-proyecto.html` — REEMPLAZADO (2026-04-01). Ahora `/iniciar-proyecto/index.html` es una página real con chat Jordan embebido (no formulario clásico)
- `/gracias/index.html` — ELIMINADO. Tenía bucle circular. Redirect 301 → `/form-v3/gracias.html`

## Jordan — Widget Chat IA (v4.0 — 2026-03-27)

### Arquitectura
```
Widget (jordan-widget-v5.js) → n8n Proxy (jordan-chat-proxy) → Anthropic API (claude-haiku-4-5)
                             → n8n Webhook (jordan-chat-leads) → Scoring IA → Airtable + Telegram + Emails
```

### Archivos
- `/assets/jordan/jordan-widget-v5.js` — Widget v5.0, Shadow DOM cerrado (`mode: 'closed'`), ~2180 líneas. Incluye modo flotante + modo embed
- `/assets/jordan/jordan-avatar.png` — Avatar de Jordan (526KB)
- System prompt v10.0 embebido en el widget (~148 líneas)
- Documento maestro: `/TRESPUNTOS-LAB/jordan/tres-puntos-agent/system-prompt-v10.0-master.md` — fuente única de verdad expandida
- Instrucciones de actualización: `/TRESPUNTOS-LAB/jordan/tres-puntos-agent/instrucciones-claude-code-v9.X.md`
- Source de referencia: `/TRESPUNTOS-LAB/jordan/tres-puntos-agent/` — sincronizar cambios en ambos sitios
- Archivos obsoletos en servidor: eliminar `jordan-widget.js`, `jordan-widget-v2.js`, `jordan-widget-v3.js`, `jordan-widget-v4.js` si existen

### Widget v5 — Features
- **Borde gradiente animado**: mint → blue → purple con `@keyframes` rotate, 3px border con `conic-gradient`
- **Teaser messages**: Bocadillos contextuales por página (6 categorías: home, servicios, casos, contacto, nosotros, default). Timing: aparece a 5s, desaparece a 8s, siguiente a 15s
- **Quick reply buttons**: 6 categorías (tipo proyecto, rol/perfil, presupuesto, timeline, confirmación datos, calendly/cierre). Estilo assistant-ui con hover mint. Detección contextual: solo aparecen cuando Jordan pregunta directamente (requiere `?` + keywords específicos para evitar falsos positivos)
- **Mobile keyboard UX**: `visualViewport` API para adaptar el chat cuando sube el teclado. Focus/blur handlers en textarea, auto-scroll a último mensaje, body scroll lock cuando chat abierto
- **Mobile**: Overlay al 90dvh (no fullscreen), safe-area-inset respetados, textarea con auto-resize
- **Markdown en mensajes**: Links `[texto](url)` → clicable, `**negrita**`, `*cursiva*` renderizados como HTML
- **Filtro nombre rol**: Evita capturar descriptores ("el CEO", "director", "fundadora") como nombre propio
- **Bubble**: Avatar circular con borde gradiente + label "Habla con Jordan" debajo. Se oculta al abrir chat, reaparece al cerrar
- **Expand/collapse**: Botón en header para expandir a 95vw×95vh en desktop
- **Animaciones**: fadeIn/slideUp al abrir, scaleDown al cerrar, typing indicator con 3 dots

### Persistencia de datos (localStorage)
- **localStorage** con expiración 24h (antes era sessionStorage — se perdían datos al cerrar pestaña)
- Cada mensaje se guarda en tiempo real en `jordan_session`
- Sesiones expiradas se envían automáticamente al volver a cargar la página
- Campos persistidos: sessionId, startedAt, lastActivity, messages[], extracted{}, sent flag

### Extracción inteligente de datos
- **Quick replies**: Captura directa de tipo_proyecto, rol, presupuesto, timeline sin depender de regex
- **Regex mejorado**: Teléfonos españoles (+34, guiones, espacios, 9 dígitos)
- **Detección contextual de nombre**: Si Jordan pregunta "¿cómo te llamo?" y el usuario responde 1-3 palabras capitalizadas
- **Email y empresa**: Regex estándar

### Envío de datos — Reglas
- **SOLO se envía al final**: cerrar chat, cerrar pestaña (beforeunload), o inactividad 30min
- **NUNCA a mitad de conversación** — no hay envío por número de mensajes
- **Guard de contacto**: Solo envía si tiene al menos nombre, email o teléfono. Sin datos de contacto → no se envía nada
- **Timer inactividad**: Aviso a 25 min ("¿Seguimos?"), auto-envío a 30 min con mensaje de despedida
- **Mínimo 3 mensajes** para enviar (evita envíos vacíos)
- Método: `fetch()` cuando la página está visible, `sendBeacon()` cuando está oculta/cerrándose
- Flag `_leadSent` evita envíos duplicados

### Payload del widget → WF2 (campos alineados)
```json
{
  "nombre": "",
  "email": "",
  "telefono": "",
  "empresa": "",
  "tipo_proyecto": "",
  "presupuesto": "",
  "urgencia": "",
  "rol": "",
  "conversacion_completa": "[Jordan] ... \\n[Usuario] ...",
  "score": 0,
  "sessionId": "j_timestamp_random",
  "url_origen": "/ruta",
  "mensajes_totales": 0,
  "duracion_segundos": 0,
  "timestamp": "ISO string"
}
```

### Carga en HTMLs
- Script async en 42 páginas: `<script async src="/assets/jordan/jordan-widget-v5.js"></script>`
- Cache-busting: renombrar a `jordan-widget-v6.js` etc. para futuras versiones (y actualizar las 42 páginas)
- **Modo flotante** (40 páginas — home, servicios, casos, blog, nosotros):
```html
<script>
window.JordanConfig = {
  webhookUrl: 'https://n8n.trespuntos-lab.com/webhook/jordan-chat-leads',
  calendlyUrl: 'https://calendly.com/trespuntos/jordi-exposito',
  avatar: '/assets/jordan/jordan-avatar.png',
  position: 'right',
  rules: [...]
};
</script>
```
- **Modo embed** (2 páginas — contacto, iniciar-proyecto):
```html
<script>
window.JordanConfig = {
  webhookUrl: 'https://n8n.trespuntos-lab.com/webhook/jordan-chat-leads',
  calendlyUrl: 'https://calendly.com/trespuntos/jordi-exposito',
  avatar: '/assets/jordan/jordan-avatar.png',
  embedTarget: '#jordan-embed'
};
</script>
```

### n8n Workflows

#### WF0 — Jordan Chat Proxy (ID: `TI3Sh1AOVzJnMYFF`)
- Webhook POST `/jordan-chat-proxy`
- Llama a Anthropic API con API key server-side
- Modelo: `claude-haiku-4-5-20251001` — **SIEMPRE Haiku, nunca Sonnet ni Opus**
- `max_tokens`: dinámico desde body (`$json.body.max_tokens || 512`). Widget usa 512, scoring usa 1500
- CORS: trespuntoscomunicacion.es, tres.trespuntos-lab.com, localhost:8080

#### WF2 — Jordan Leads Chat Web (ID: `2a6ZaK3pw9j7LPEc`)
- Webhook POST `/jordan-chat-leads`
- Pipeline: Webhook → Responder OK → Procesar Datos → Scoring IA (Haiku, 1500 tokens) → Procesar Respuesta IA → [Telegram + Airtable + Email Jordi + Email Lead] en paralelo
- **Scoring IA**: Envía TODA la conversación a Haiku para análisis. Devuelve JSON con score 0-10, resumen_detallado (mín 150 palabras), problema_principal, objetivo_principal, pain_points, servicios_detectados, tipo_cliente, siguiente_accion
- **Parser robusto**: 3 niveles de fallback (1. limpiar backticks + JSON.parse, 2. regex `{...}`, 3. mensaje limpio sin volcado de error)
- **Airtable**: Base `appR9SHmsc6CZ7VJj`, tabla `tblU72kaxQq7222Do` (Jordan — Chat Leads). Typecast habilitado para singleSelect
- **Telegram**: Chat ID `7313439878`, formato limpio con score/estado (HOT/WARM/COLD), resumen truncado a 500 chars
- **Email a Jordi**: HTML con tabla de datos + resumen IA
- **Email al Lead**: Solo si tiene email. Mensaje personalizado con resumen + siguiente paso según score

#### WF3 — Jordan Calendly Slots (ID: `BUXdIwaHugIQ0ITK`)
- Webhook POST `/jordan-calendly-slots`
- Llama a Calendly API v2 (`GET /event_type_available_times`) con PAT
- Event type: `jordi-exposito` (30 min, Google Meet), URI: `3485d81f-322f-4759-b962-17c2594c56fb`
- User URI: `FFDBQB3V7EUSUMI3`, Org: `DAHATHYU4RIAXKND`
- Busca slots en los próximos 3 días laborables, agrupa por día (máx 2 por día, máx 6 total)
- Devuelve: `{ success, slots: [{ label, start_time, scheduling_url }], host, duration, location }`
- Fallback si no hay slots: devuelve `fallback_url` para abrir el calendario completo
- **Cuándo se activa**: Cuando Jordan detecta que el lead es bueno (score ≥7, presupuesto ≥5K) y ofrece reunión, o cuando el usuario pide una reunión
- **Flujo widget**: Muestra slots como botones → usuario clicka → abre `scheduling_url?name=X&email=Y` en nueva pestaña → usuario solo confirma (1 click)
- **NUNCA** ofrecer Calendly si presupuesto < 5.000€ o score < 7

### System prompt v10.0 (actualizado 2026-04-03)
- **7 fases**: Escuchar proyecto → Nombre y email → Identificar perfil → Propuesta de valor → Discovery por tipo → Presupuesto y urgencia → Scoring + Cierre
- **Sistema dos velocidades**: Velocidad 1 (cualificación rápida) vs Velocidad 2 (discovery funcional, activado con 2+ señales: ERP/CRM, B2B, portal privado, +10K, urgencia, contexto técnico, IA/automatización)
- **Equipo actualizado**: Jordi (Digital Project Lead + UX/UI Senior), Dani (PM), Alberto (Full Stack Dev), Cooper (Chief Happiness Officer). Agentes: Jordan, Magic, Kobe, Bird, Curry, Luka, Rodman
- **Regla de engagement**: Entre preguntas aportar valor, mencionar equipo (Luka → n8n, Bird → propuestas, Curry → SEO), casos de éxito naturales (máx 1/conversación)
- **White-label**: Nuevo tipo de proyecto con preguntas específicas
- **Filtro < 6.000€**: Cierre educado sin negociar alcance: "nuestros proyectos arrancan a partir de 6.000€"
- **Nunca inventar slots Calendly**: Si no consultó API, usar siempre fallback [CALENDLY_URL]
- **20 puntos NUNCA** (antes 13): nuevos items para slots inventados, negociar < 6K, improvisar bienvenida, link estático Calendly, preguntar cookies/legales, guión rígido
- **Scoring**: Base 3. Discovery completo(+2), parcial(+1). Rechazo(-1), <5K(-2). TOPE: Nivel 1 no cubierto = score MAX 5
- **Bienvenida fija**: "Hola. Soy Jordan. Sin formularios ni rollos. ¿Qué proyecto tienes en mente?" — nunca improvisar
- **Email y teléfono OBLIGATORIOS** antes de resumen, Calendly o cierre (v9.5)
- **Modelo**: Claude Haiku 4.5 — nunca Sonnet, nunca Opus
- **Documento maestro**: `/TRESPUNTOS-LAB/jordan/tres-puntos-agent/system-prompt-v10.0-master.md` — fuente única de verdad
- **Proceso de actualización**: Jordi actualiza `system-prompt.md` en carpeta Jordan → Claude Code comprime e incorpora al widget → sincroniza → documenta en CLAUDE.md
- **Límite prompt compacto**: ~148 líneas

### Reglas críticas
- **NUNCA** exponer la API key de Anthropic en el frontend — va server-side en n8n
- **NUNCA** usar `@import url(...)` dentro del Shadow DOM CSS — causa freeze del navegador
- **NUNCA** usar Sonnet ni Opus para Jordan — siempre Haiku
- **NUNCA** enviar email al usuario a mitad de conversación — solo al cerrar
- **SIEMPRE** renombrar el archivo (incrementar versión) al actualizar el widget para evitar cache
- **SIEMPRE** sincronizar cambios entre `/assets/jordan/jordan-widget-v5.js` y `/jordan/tres-puntos-agent/`
- Al generar ZIPs para subir, **NO excluir** `assets/jordan/` — contiene el widget y avatar

### Regla de actualización Jordan — OBLIGATORIA
**Cuando se modifique CUALQUIER cosa del widget Jordan (`jordan-widget-v5.js`), se DEBEN actualizar TODAS las referencias:**
1. **Un solo archivo fuente**: `/assets/jordan/jordan-widget-v5.js` — es la ÚNICA fuente de verdad
2. **42 páginas lo cargan**: Todas con `<script async src="/assets/jordan/jordan-widget-v5.js"></script>`
3. **Contacto e iniciar-proyecto** usan embed mode (`embedTarget: '#jordan-embed'`) — verificar que sigue funcionando tras cambios
4. **Si se cambia el system prompt**: Actualizar el prompt dentro del widget Y el documento maestro en `/TRESPUNTOS-LAB/jordan/tres-puntos-agent/`
5. **Si se incrementa versión** (ej. v5→v6): Buscar y reemplazar en las 42 páginas HTML + actualizar esta sección de CLAUDE.md
6. **Después de cualquier cambio**: Hacer test básico en al menos 1 página flotante (home) y 1 página embed (contacto o iniciar-proyecto)

### Bugs resueltos (2026-03-27)
- **API Key prompt**: El `window.prompt()` en tres.trespuntos-lab.com era por versión vieja cacheada (`jordan-widget.js`). Solucionado con v4 + eliminar archivos viejos del servidor
- **JSON truncado en scoring**: `max_tokens: 512` cortaba la respuesta de Haiku → parser fallaba → campos vacíos en Airtable + JSON basura en Telegram. Fix: max_tokens dinámico (1500 para scoring)
- **Borde gradiente roto**: Se perdió en v3. Recuperado en v4 con `conic-gradient` + `@keyframes jordanBorderSpin`
- **Mobile input**: El input ocupaba toda la pantalla y el botón enviar quedaba debajo del botón cerrar. Fix: overlay al 90dvh, layout flex correcto

### Upload de archivos + Análisis IA (implementado 2026-03-27)
- **Arquitectura completa**:
  ```
  Widget (📎 max 3MB) → base64 → POST /jordan-file-upload → WF4 n8n
    → Validar (tipo, tamaño 3MB) → Subir a Google Drive (carpeta Jordan)
    → Si PDF/imagen: Analizar con Haiku → devolver driveUrl + document_analysis
    → Si DOCX/XLSX: devolver driveUrl sin análisis (el equipo lo revisa)
    → Widget guarda analysis en _documentContext
    → _documentContext se inyecta en system prompt en cada mensaje al proxy
    → Jordan puede hablar sobre el contenido del documento
  ```
- **WF4** (`jordan-file-upload`, ID: `n143KAW44OP70ysY`): 11 nodos
  - Webhook → Validar (3MB) → IF válido → Drive upload → Preparar Análisis → IF analizable → Haiku analysis → Formato → Respond
  - Archivos analizables: PDF (document block) + PNG/JPG (image block) — soporte nativo Anthropic
  - Archivos no analizables: DOCX, XLSX — se suben a Drive pero no se analizan
  - Haiku recibe el base64 como content block + prompt de extracción estructurada
  - Análisis truncado a 4000 chars
  - continueOnFail en Drive upload y HTTP Request
  - Headers: `anthropic-beta: pdfs-2024-09-25` para soporte PDF
- **Widget**: Botón 📎, preview con status (Leyendo → Subiendo y analizando → Analizado), max 1 archivo por conversación
- **Tipos aceptados**: PDF, DOCX, XLSX, PNG, JPG (max 3MB)
- **Carpeta Drive**: `Jordan` (ID: `1K4JnB6v2BSL7k-_6IpKEGZkVjzK9ckAf`), filename: `{Nombre}_{Fecha}_{archivo}`
- **Persistencia**: `_documentContext` se guarda en localStorage (campo `documentContext` en session), sobrevive recargas
- **Airtable**: Campos `Documento` (url), `Documento_Nombre` (text), `Carpeta_Drive` (url)
- **UX**: Si análisis OK → "He recibido y analizado tu archivo. Ya tengo contexto." Si no → "El equipo lo revisará."

### Test end-to-end completado (2026-03-27)
- ✅ **Proxy Claude**: Haiku responde correctamente (HTTP 200)
- ✅ **Quick reply buttons**: Tipo proyecto, presupuesto (4 rangos con €), timeline, cierre — aparecen en contexto correcto
- ✅ **Detección de perfil**: Reconoce "responsable de marketing" y adapta preguntas
- ✅ **Extracción datos**: Nombre (regex "Soy X"), email, teléfono (formato español con espacios), empresa — todo capturado
- ✅ **Quick reply capture**: tipo_proyecto, presupuesto, timeline extraídos de botones
- ✅ **Calendly proactivo**: Muestra slots reales del calendario (Lunes 30 marzo — 11:30/12:00) con botones
- ✅ **Flujo discovery correcto**: proyecto → problema → plataforma → contenidos → presupuesto → timeline → decisor → cierre
- ✅ **Envío a WF2**: Lead enviado, Airtable actualizado, Telegram enviado
- ✅ **localStorage 24h**: Sesión persiste entre recargas, expiración funciona
- ⚠️ **Bug encontrado**: `beforeunload` re-guarda sesión enviada, dificulta limpiar localStorage para tests. No afecta a usuarios reales

### Calendly API (verificado 2026-03-27)
- **PAT**: Configurado y funcionando
- **Event type**: `jordi-exposito` (30 min, Google Meet)
- **URI**: `https://api.calendly.com/event_types/3485d81f-322f-4759-b962-17c2594c56fb`
- **User URI**: `FFDBQB3V7EUSUMI3`, Org: `DAHATHYU4RIAXKND`
- **Scheduling URL**: `https://calendly.com/trespuntos/jordi-exposito`
- **Segundo event type**: `tres-puntos` (60 min, Google Meet) — no usar para Jordan

### Sincronización de archivos
- Widget v5: `/assets/jordan/jordan-widget-v5.js` — prompt v10.0 + embed mode (2026-04-06)
- 42 páginas cargan v5 (flotante en 40, embed en contacto + iniciar-proyecto)
- Contacto: `/contacto/index.html` — usa embed mode con `embedTarget: '#jordan-embed'`
- Iniciar proyecto: `/iniciar-proyecto/index.html` — usa embed mode con `embedTarget: '#jordan-embed'`
- System prompt maestro (v10.0): `/TRESPUNTOS-LAB/jordan/tres-puntos-agent/system-prompt-v10.0-master.md` — fuente única expandida
- System prompt maestro anterior (v9.3): `/TRESPUNTOS-LAB/jordan/tres-puntos-agent/system-prompt-v9.3-master.md` — referencia histórica
- System prompt completo (v6.2): `/TRESPUNTOS-LAB/jordan/tres-puntos-agent/system-prompt-v6.2.md` (~680 líneas, referencia histórica)

### Historial de versiones del prompt
| Versión | Fecha | Origen | Cambios clave |
|---------|-------|--------|---------------|
| v9.2 | 2026-03-27 | Incorporación v6.2 al widget v4 | Primera versión completa en producción |
| v9.3 | 2026-03-27 | Análisis Carlos (B2B TechVentures) | 10 cambios: "Perfecto" prohibido, presupuesto "encaja" prohibido, perfil obligatorio, reuniones=Jordi, propuesta discovery, e-commerce ampliado, nombre antes presupuesto, presupuesto contextualizado, scoring tope, Calendly slots |
| v9.4 | 2026-03-29 | Problema Calendly no se activa | 2 cambios: Calendly dentro de Fase 4 como paso obligatorio, trigger explícito en scoring |
| v9.5 | 2026-03-30 | Contacto sin email/teléfono | 3 cambios: email+tel obligatorios antes de cierre/Calendly, verificación en Fase 4, nuevo punto NUNCA |
| v10.0 | 2026-04-03 | Reescritura completa master | 7 fases, dos velocidades, equipo actualizado, engagement rules, white-label, filtro <6K€, 20 NUNCA, no inventar slots Calendly |

### Test end-to-end v9.4 (2026-03-29)
- ✅ **Proxy Claude**: Haiku responde con prompt v9.4 completo (145 líneas)
- ✅ **Discovery correcto**: Proyecto → problema → integraciones → identidad → contenidos → presupuesto contextualizado → timeline → cierre
- ✅ **Observaciones de valor**: "eso tiene su complejidad en catálogo", "Alberto ha montado dashboards con WebSockets"
- ✅ **Mensajes de progreso**: "Son 4-5 preguntas", "Ya casi lo tenemos", "Última cosa"
- ✅ **Presupuesto contextualizado**: "según el presupuesto podemos incluir migración del design system..."
- ✅ **No comenta si encaja**: Solo toma nota y sigue
- ✅ **Calendly proactivo (v9.4)**: Jordan ofrece reunión con Jordi al detectar +20K + decisor, sin esperar al cierre
- ✅ **Calendly en cierre**: Tras confirmación de datos, ofrece slots de Calendly
- ✅ **Lead completo en Airtable**: Scoring IA (9/10), resumen detallado, pain points, servicios detectados, siguiente acción
- ✅ **Telegram**: Notificación completa con score HOT
- ✅ **Email a Jordi**: Tabla de datos + resumen IA + siguiente acción
- ✅ **Email al lead**: Resumen personalizado del proyecto

### Pendientes Jordan
- Subir widget v4 actualizado a Hostinger y purgar cache
- Eliminar archivos viejos del servidor: `jordan-widget.js`, `jordan-widget-v2.js`, `jordan-widget-v3.js`
- ✅ ~~Implementar upload de archivos~~ COMPLETADO (2026-03-27): Upload + análisis IA con Haiku
- Añadir soporte análisis DOCX (requiere Extract from File node en n8n o conversión server-side)
- Limpiar registros de test en Airtable (tabla Jordan — Chat Leads)

## Mobile UI — Optimización (2026-03-26)

### Cambios aplicados en `/css/components.css`
Bloque `@media(max-width:768px)` añadido al final del archivo:
- **Hero**: `min-height:auto`, `padding-top:6rem`, `padding-bottom:2rem`. `.hero-phone-wrapper{display:none !important}` (sobreescribe el `display:flex` del CSS principal)
- **Secciones**: `padding-top:3.5rem; padding-bottom:3.5rem` (era 112px → 56px, reducción del 50%)
- **Hero internos**: márgenes reducidos en `.hero-subtitle`, `.hero-ctas`, `.hero-tag`, `.hero-h1`, `.hero-metrics`
- **Caso cards**: `.casos-grid>.caso-card{min-width:0;width:80vw;max-width:80vw}` — corrige overflow horizontal (antes 1202px, ahora 300px)
- **Marquee**: padding reducido a 1.25rem
- **Componentes internos**: gap y padding reducidos en servicios-stack, proceso, FAQ, cierre, trinchera, funnel, uxui
- **Breakpoint 420px**: padding secciones 2.5rem, hero padding-top 6.5rem

### Cambios en `/index.html` (critical CSS inline)
- Añadido `#hero{min-height:auto;padding:5rem 0 2.5rem}` y reducción de márgenes en el media query 768px

### Métricas antes/después
| Métrica | Antes | Después |
|---------|-------|---------|
| Página total (mobile) | 18,869px | 16,417px (-13%) |
| Hero | 1,828px | 931px (-49%) |
| Section padding | 112px | 40px (-64%) |
| Caso cards width | 1,202px | 300px (sin overflow) |
| Badge/navbar overlap | Sí | Corregido |

## Favicon
- `favicon.ico` — 32x32, logo nuevo (tres círculos verdes fondo oscuro)
- `favicon.png` — Source PNG del favicon
- `apple-touch-icon.png` — 180x180 para iOS
- `favicon.svg` — Versión anterior SVG (mantener como fallback)
- Actualizado: 2026-03-26

## Generación de ZIPs para deploy
Al generar ZIPs para subir a Hostinger, usar estas exclusiones:
```
-x ".git/*" -x "node_modules/*" -x ".claude/*" -x "master/*" -x "partners/*"
-x "audit-trespuntos.html" -x "*.DS_Store" -x "CLAUDE.md" -x "design-system.html"
-x "casos-de-negocio/*/assets/*" -x "casos-de-negocio/*/config.json"
```
**IMPORTANTE**: NO excluir `assets/*` — contiene `/assets/jordan/` que es necesario para el widget.
