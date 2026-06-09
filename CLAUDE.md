# Tres Puntos Web — Normas de desarrollo

---

## 🔐 Sanitización de credenciales en n8n (completada 2026-05-03 noche)

**Estado:** ✅ COMPLETADO. Los 9 workflows n8n están limpios + 4 env vars inyectadas en el contenedor + workflows leen tokens vía `$env.X`.

### Setup técnico final
- **Tokens NO viven en código** de los workflows. Cada nodo HTTP usa:
  - Airtable: credencial nativa `airtableApiKey` (id `zQer745cZNd0kQyb`)
  - Telegram: URL con `{{ $env.TELEGRAM_BOT_TOKEN }}`
  - OpenAI: header `=Bearer {{ $env.OPENAI_API_KEY }}`
  - Anthropic: header `={{ $env.ANTHROPIC_API_KEY }}`
  - Serper: header `={{ $env.SERPER_API_KEY }}`
- **4 env vars inyectadas en el contenedor n8n vía Dokploy** (`/etc/dokploy/compose/n8n-n8nwithpostgres-cqx34s/code/docker-compose.yml`):
  - `TELEGRAM_BOT_TOKEN`, `OPENAI_API_KEY`, `SERPER_API_KEY`, `ANTHROPIC_API_KEY`
- **Backup compose** en `docker-compose.yml.bak.<timestamp>` por si Dokploy las sobrescribe.

### 11 workflows sanitizados (total)
| Workflow | ID | Activo |
|---|---|---|
| WF3-test Gmail | `ICoeXKSd5NQoVsZS` | ❌ |
| WF3 Partner Envío | `ofNEs2v9y3angTDz` | ✅ |
| Research Agencias | `krNI9bFxAhAAjQi1` | ✅ |
| WF-Research-Daily | `AaghmTTXD5Kd4ODe` | ✅ |
| WF6 Discovery Partners | `SRai7Mly38uCOVO7` | ✅ |
| WF4 Partner Detección | `0EMRAOvITiVjlw8y` | ❌ |
| WF4 Sectores Detección | `4DeHrw1yL4kVMsCZ` | ✅ |
| WF3 Sectores Envío | `s7rw3nSvqKyujlBQ` | ❌ |
| WF5 Partner Tracking | `brFpHdEdYYOQ00q8` | ✅ |
| Sectores Tracking — WF5 Landing Engagement | `bSJnIPaz172bivWY` | ✅ |
| Sectores Tracking — /s/ Click E1 | `qWTpFhTaHUscC6Z0` | ✅ |

### ⚠️ Avisos importantes para el futuro

1. **Persistencia Dokploy:** las 4 env vars se editaron a mano en el compose. Si en algún momento se hace "Save" sobre el servicio n8n desde la UI de Dokploy, las 4 líneas pueden perderse. Mejor moverlas al panel "Environment" del servicio en la UI de Dokploy (sobrevive redeploys). Si se pierden → workflows fallan con `$env` vacío → repetir el flujo: pegar las 4 vars al compose (ver backup `.bak.*`) + recreate del contenedor.

2. **Credenciales NO rotadas:** decisión de Jordi 2026-05-03. Los tokens siguen siendo válidos. Si en el futuro se rotan:
   - **Airtable PAT** → Airtable Account → Personal access tokens → Revoke + crear nuevo + actualizar valor de credencial `airtableApiKey` (id `zQer745cZNd0kQyb`) en n8n
   - **Telegram bot** → @BotFather → `/revoke` → `/token` → actualizar env var `TELEGRAM_BOT_TOKEN` en Dokploy
   - **OpenAI key** → platform.openai.com → API keys → Revoke + nueva → actualizar env var `OPENAI_API_KEY`
   - **Anthropic key** → console.anthropic.com → API Keys → Revoke + nueva → actualizar env var `ANTHROPIC_API_KEY`
   - **Serper key** → serper.dev → Dashboard → Reset API key → actualizar env var `SERPER_API_KEY`

3. **Workflows restantes por auditar:** 71 workflows aún sin auditar al cierre del 2026-05-03 (paneles exitbcn, share drive, calendly, healthcheck, LinkedIn sync, dashboard, Curry SEO, etc.). Probablemente están limpios pero conviene confirmar con un grep masivo desde el MCP n8n. Al confirmar limpios o sanitizar, actualizar este número.

4. **⚠️ DISCREPANCIAS DETECTADAS 2026-05-17:** revisando workflows que la tabla de arriba marca como "✅ sanitizado", se descubrió que **al menos 2 mienten**:
   - **`BLcLAnrGcwUYyDJf` (Kobe)** — sigue con PAT Airtable hardcoded en "Leer Datos Agencia Airtable" (`patN5OZQ...`), Anthropic API key hardcoded en "Haiku Kobe Emails", y Telegram token hardcoded en "Notificar Jordan". La sección de cambios 2026-04-07 dice que se migró pero **NO** se hizo en producción (o se revirtió). Tabla `✅` errónea.
   - **`ofNEs2v9y3angTDz` (WF3 Partner Envío)** — tiene credencial Airtable adjunta PERO `authentication: "none"` Y header `Authorization: Bearer pat...` hardcoded. La credencial es **inerte** — n8n envía el PAT hardcoded. La migración se quedó a medias.

   **Acción pendiente:** auditar uno por uno los 11 workflows de la tabla para confirmar cuáles están realmente migrados vs cuáles fingen estarlo. El patrón correcto verificado funcionando (de `SRai7Mly38uCOVO7` WF6, nodos "Leer Agencias AT" + "Crear en Airtable"):
   ```json
   "parameters": { "authentication": "predefinedCredentialType", "nodeCredentialType": "airtableApi", ... },
   "credentials": { "airtableApi": { "id": "zQer745cZNd0kQyb", "name": "airtableApiKey" } }
   ```
   Sin `Authorization` header. `sendHeaders: false` en GET, `sendHeaders: true` con SOLO `Content-Type` en POST/PATCH.

5. **`8XoipUHvtokIaiw5` (Playwright Auditor) sanitizado 2026-05-17** — añadido a la lista limpia. Antes tenía PAT Airtable hardcoded en 4 nodos HTTP + cron `*/5 * * * *` que consumía ~288 calls/día de Airtable (causa raíz del `PUBLIC_API_BILLING_LIMIT_EXCEEDED` que reventó la cuota a mitad de mayo). Cambios: cron → `0 9 * * 1-5` (Madrid), 4 nodos migrados a credencial nativa. **Pendiente** (no crítico): runner token (3 nodos) y Telegram bot token (2 nodos, bot distinto del principal `8706170609:...`) siguen hardcoded — requieren env var nueva en Dokploy.

### Origen del incidente
Sesión 2026-04-30: GitHub Secret Scanning bloqueó push de `partners/campana/sectores-workflows-backup/wf3-sectores-completo.json` detectando 2 secretos. Auditoría 2026-05-03: 9 workflows infectados + 5 credenciales filtradas (Airtable, Telegram, OpenAI, Anthropic, Serper). Tarde 2026-05-03: 68 updateNode + 24 más vía MCP n8n para migrar a `$env`. Configuración final: env vars en Dokploy + recreate del contenedor.

---

## Logos y assets de marca — REGLA OBLIGATORIA

**Antes de usar el logo de Tres Puntos en cualquier sitio (imagen OG, email, PDF, landing, propuesta), leer `/BRAND.md` en la raíz del repo.**

### Resumen rápido — el error más recurrente y cómo no cometerlo
El sufijo `-dark` / `-light` se refiere al **FONDO** sobre el que se coloca el logo, NO al color del logo. Léelo dos veces.

| Si el fondo es... | Usar este archivo | Por qué |
|---|---|---|
| **Oscuro** (negro, `#0e0e0e`, web Tres Puntos) | `img/logo-trespuntos-dark.svg` | Centros blancos `#F8F8F8` → contrastan |
| **Claro** (blanco, gris claro, papel) | `img/logo-trespuntos-light.svg` | Centros negros `#1A1A1A` → contrastan |
| **Email** (cliente Outlook/Gmail) | `img/logo-trespuntos-email.png` | PNG con transparencia, compatibilidad raster |

Mnemotécnica: **"Logo dark va sobre dark. Logo light va sobre light."**

### Errores que NO se permiten
- Usar `logo-trespuntos-light.svg` sobre la web (centros negros invisibles sobre fondo oscuro)
- Usar `logo-trespuntos-dark.svg` en un PDF blanco (centros blancos invisibles sobre fondo claro)
- Generar un SVG nuevo "parecido al logo" — siempre usar el archivo del repo
- Mezclar versiones distintas en el mismo documento

### URLs canónicas para uso externo
- Producción (sirve el del repo vía Nominalia + Cloudflare): `https://www.trespuntoscomunicacion.es/img/logo-trespuntos-dark.svg`
- Raw GitHub (para skills que fetchean): `https://raw.githubusercontent.com/trespuntoslab/trespuntos/main/img/logo-trespuntos-dark.svg`
- Sustituir `dark` por `light` o `email.png` según el caso

Documento completo (con tokens, checklist y guía para agentes externos): `/BRAND.md`

---

## Cerebro Digital — Fuente de verdad de identidad y estrategia

**Repo:** `trespuntoslab/trespuntos-context` (privado) · acceso vía GitHub MCP

Antes de cualquier tarea que implique contenido, copy, SEO o diseño, consultar el cerebro digital. No usar reglas hardcodeadas — la fuente de verdad vive ahí.

| Tarea | Archivo en trespuntos-context |
|---|---|
| Tono, voz, brand persona | `identity/tono-de-voz.md` |
| Reglas de escritura con IA | `identity/reglas-contenido-ia.md` |
| Blog: categorías, enfoque | `content/blog-strategy.md` |
| Keywords y SEO | `architecture/keywords.md` + `architecture/seo-master-map.md` |
| Design tokens (colores, tipografía) | `design-system/tokens.md` + `design-system/colors.md` |
| Metodología de trabajo | `identity/metodologia.md` |
| Copy de páginas de servicio | `content/copy/` |

**Clon local (Dropbox):** `/Users/jordi/Library/CloudStorage/Dropbox/backupok/TRESPUNTOS-LAB/Cerebro-digital-trespuntos/`

---

## Rol de Claudio — Responsable del ecosistema Tres Puntos

Claudio (el asistente IA) es el **responsable del ecosistema técnico y de sistemas de Tres Puntos Comunicación**. No es un ejecutor pasivo: es el arquitecto que vela por la coherencia, la deuda técnica, la seguridad, la performance y la evolución del stack.

### Responsabilidades
- **Proactividad**: detectar desincronizaciones (ej. FTP ≠ git), deuda técnica, pendientes olvidados, riesgos de seguridad, regresiones de performance — y proponerlos aunque Jordi no los pida.
- **Propuesta de mejoras**: sugerir sistemas, agentes, automatizaciones, refactors o skills que encajen con la visión de Tres Puntos (agencia UX/UI + dev + automatización IA).
- **Diseño de agentes y rutinas**: proponer subagentes Claude Code, scheduled-tasks, workflows n8n, skills nuevas cuando aporten valor medible.
- **Documentación viva**: mantener este CLAUDE.md actualizado con cada cambio estructural. Es la memoria del proyecto.
- **Criterio de ingeniería**: decir "no" a lo que no tenga sentido técnico o suba deuda sin valor claro.

### Alcance del ecosistema
- Web pública `trespuntoscomunicacion.es` (repo `Trespuntos-web-cloude`, deploy FTP a Nominalia + Cloudflare)
- Dashboard `dash.trespuntos-lab.com` (VPS, vanilla JS + Supabase)
- n8n `n8n.trespuntos-lab.com` (workflows críticos: leads, partners, Jordan, Kobe, Bird, sync)
- Airtable (fuente de verdad de leads, CRM, auditorías partners)
- Supabase (schema `trespuntos`, tabla `web_metrics`, auth)
- Jordan widget v7 (42 páginas, persistencia 3 stages)
- Documentos funcionales (`doc.trespuntos-lab.com`)
- Sistema de casos de estudio (9 casos activos)
- Agentes: Jordan, Magic, Kobe, Bird, Curry, Luka, Rodman (coordinados desde Claudio)

### Autonomía operativa
- **Puede** proponer ramas git con nombres descriptivos (`feat/`, `fix/`, `chore/`, `seo/`, `perf/`)
- **Puede** proponer cambios estructurales, nuevas skills, scheduled-tasks, workflows n8n
- **Puede** sugerir refactors, limpieza de código muerto, actualizaciones de dependencias
- **Puede** crear issues o PRs en GitHub con propuestas
- **Debe** esperar autorización explícita de Jordi para: `git push`, FTP upload, purga Cloudflare, ejecución de workflows destructivos, borrado de datos

### Principio operativo
> "Si hay algo desincronizado, sin documentar, con riesgo o con mejor forma de resolverse — dilo antes de que Jordi tenga que preguntarlo."

## Deploy — Regla crítica
**NUNCA hacer `git push` ni subir archivos al servidor sin permiso EXPLÍCITO de Jordi en el chat.**
- Claude recomienda cuándo hacer push (tras cambios significativos, al final de una sesión de trabajo, etc.)
- Jordi debe confirmar ("sí", "sube", "dale", "push") antes de ejecutar cualquier `git push` o upload
- Esto aplica a git push, FTP, SCP, rsync, o cualquier método de transferencia a producción

## ⚠️ Regla crítica de versionado — git es la única fuente de verdad

**Producción NUNCA debe contener archivos que no estén en git.** Cualquier divergencia entre git y producción es un bug y debe corregirse en el momento.

### Por qué (incidente 2026-04-30)
Durante meses se subieron archivos por FTP sin commitearlos en git: el sistema OG completo (102 imágenes + 6 scripts + 87 HTMLs con meta tags), 16 páginas de `/sectores/`, 3 posts de blog, el logo dark y otros assets. Resultado: 212 cambios pendientes acumulados en local y un post (`blog/desarrollo-web-a-medida-cuando-es-la-decision-correcta/`) que existía en producción pero **no en el repo** — cualquier deploy futuro que sincronizara repo→producción lo habría borrado. Riesgo real de pérdida de trabajo.

### Flujo de deploy obligatorio (orden estricto)
1. **Editar** archivos en local
2. **Verificar** (preview server, Lighthouse, links, etc.)
3. **`git add` + `git commit`** — agrupar cambios por feature/fix, mensajes con prefijo (`feat:`, `fix:`, `chore:`, `docs:`, `seo:`, `perf:`)
4. **`git push origin main`** — pedir autorización explícita a Jordi (regla "Deploy" de abajo)
5. **`git status` debe estar LIMPIO** antes del paso siguiente. Si no lo está → STOP. No se sube nada.
6. **FTP** los archivos modificados a Nominalia (origen)
7. **Anotar el SHA en `DEPLOY_LOG.md`** con fecha, archivos subidos y purga de Cloudflare aplicada
8. **Purgar Cloudflare** (Custom URL si <5 archivos, Purge Everything si más)
9. **Verificar en producción** (curl + browser)

### Reglas inviolables
- **NUNCA hacer FTP con `git status` sucio** — si hay cambios sin commitear, primero commit, después FTP. No al revés.
- **NUNCA editar archivos directamente en el servidor** (vía panel Nominalia, SSH, etc.) sin replicar el cambio en git acto seguido.
- **Cada FTP debe corresponderse con un commit existente** — el SHA del commit queda en `DEPLOY_LOG.md`.
- **Si detectas drift** (un archivo en producción que no está en git, o viceversa): para todo, descarga el archivo de producción, commitealo (o bórralo), y solo entonces continúa.

### Detección de drift (ejecutar mensualmente o ante sospecha)
```bash
# Comparar lista de HTMLs en repo vs producción (FTP listing)
git ls-files '*.html' | sort > /tmp/git-htmls.txt
curl -s -k --ftp-pasv -l "ftp://claude%40trespuntoscomunicacion.es:Y20pC%267L%214z%28%24%256g@ftp.trespuntoscomunicacion.es/" \
  | grep "\.html$" | sort > /tmp/prod-htmls.txt
diff /tmp/git-htmls.txt /tmp/prod-htmls.txt
```
Si hay diferencias → investigar y reconciliar antes de cualquier deploy.

### Flujo de deploy actual (desde 2026-04-17)
1. **Git push**: `git push origin main` → sube al repositorio `git@github.com:trespuntoslab/trespuntos.git`
2. **FTP a producción**: Subir archivos modificados por FTP a `www.trespuntoscomunicacion.es` (Nominalia) — solo si `git status` está limpio
3. **Anotar deploy** en `DEPLOY_LOG.md` (SHA, fecha, archivos, purga aplicada)
4. **⚠️ Purgar caché de Cloudflare** — PASO OBLIGATORIO tras cada FTP. Si no se hace, los usuarios verán la versión antigua hasta 2h (TTL del edge cache)

### ⚠️ Purga de caché Cloudflare — OBLIGATORIO tras cada deploy FTP
Desde 2026-04-17 la web pasa por Cloudflare con **Cache Rule de 2h** (HTML cacheado en edge). Tras CUALQUIER subida FTP a Nominalia:

1. Entrar en Cloudflare → dominio `trespuntoscomunicacion.es`
2. Menú izquierdo → **Caching → Configuration**
3. Opciones:
   - **Purge Everything** → si se han subido muchos archivos o no se sabe cuáles exactamente
   - **Custom Purge → Purge by URL** → si solo cambiaron 1-5 archivos concretos (más eficiente, no tira toda la caché)
4. Esperar ~10 segundos y verificar con: `curl -I https://www.trespuntoscomunicacion.es/ruta/` → debe aparecer `cf-cache-status: MISS` en la primera request post-purga, luego `HIT` en las siguientes

**Regla para Claude**: Cada vez que se suba cualquier archivo por FTP a producción, recordar a Jordi al final del deploy: *"⚠️ Recuerda purgar el cache de Cloudflare (Caching → Configuration → Purge Everything) o los cambios no se verán hasta 2h"*.

### Stack frontal (desde 2026-04-17) — Cloudflare + Nominalia
- **DNS + Proxy**: Cloudflare (nameservers `ruben.ns.cloudflare.com` + `surina.ns.cloudflare.com`)
- **SSL mode**: Full (no Flexible — Flexible causa bucle de redirects)
- **Always Use HTTPS**: ON
- **Automatic HTTPS Rewrites**: ON
- **Cache Rule activa**: "Cache HTML estático" → All incoming requests → Eligible for cache → Edge TTL 2h (Ignore cache-control header)
- **TTFB medido**: 65-80ms (antes 6.000ms sin Cloudflare)
- **Origen**: Nominalia (FTP) — Cloudflare hace de proxy/cache delante

### Producción — www.trespuntoscomunicacion.es (Nominalia)
- **URL**: `https://www.trespuntoscomunicacion.es`
- **Host FTP**: `trespuntoscomunicacion.es`
- **Usuario**: `claude@trespuntoscomunicacion.es`
- **Password**: `Y20pC&7L!4z($%6g`
- **Directorio raíz**: raíz del FTP (`/`) = web root directamente. **NO usar `/home/tres/public_html`** — ese path crearía subdirectorios fantasma dentro del web root.
- **Protocolo**: FTP — usar `curl -k --ftp-pasv` (sin --ftp-ssl, causa error 451 en algunos archivos)
- **Comando base**: `curl -k --ftp-pasv "ftp://claude%40trespuntoscomunicacion.es:Y20pC%267L%214z%28%24%256g@ftp.trespuntoscomunicacion.es/"` (usar `ftp.` en el host, no el dominio raíz)
- **Subir un archivo**: `curl -sk --ftp-pasv --ftp-create-dirs -T local/path "ftp://claude%40trespuntoscomunicacion.es:Y20pC%267L%214z%28%24%256g@ftp.trespuntoscomunicacion.es/ruta/en/servidor"`
- **Elementos a preservar siempre**: `db-clientes/`, `intekmedical-reporte/`, `proyectos/`, `img_firma/`, `phpMyAdmin/`, `.well-known/`, `cgi-bin/`, archivos verificación Google

### ⚠️ Deprecado — tres.trespuntos-lab.com (Hostinger)
- **Ya NO es producción** (deprecado 2026-04-07)
- Era entorno beta/staging en Hostinger con deploy vía Git (hPanel → Implementar)
- El dominio `trespuntos-lab.com` puede seguir existiendo pero NO es donde se sirve la web real
- No subir cambios a Hostinger — toda la producción va por FTP a Nominalia

## Design System
Cuando se modifique cualquier token CSS, componente visual, o se añada un nuevo componente:
- Actualizar `/design-system.html` para reflejar el cambio
- Actualizar la fecha de "Última actualización" en el header y footer del design system
- Si se añade un nuevo color, botón, input o patrón: añadir una sección o ejemplo en el design system

## Formulario CTA (sección cierre)
El formulario es un **componente reutilizable** idéntico en todas las páginas. Alimenta la automatización n8n/Airtable.

### Flujo de automatización
```
Cualquier página → Form CTA → n8n (webhook leads-trespuntos) → Airtable (tabla "Formulario")
                             → Redirect a /form-v3/gracias.html
                             → gracias.html da acceso al briefing completo (/form-v3/form-step1.html)
```

**Fuente única de verdad: Airtable** (base `appR9SHmsc6CZ7VJj`, tabla `tblqbhaPtZlsPbsYs`). El dashboard lee de ahí vía `/api/form-leads`. No hay insert a Supabase desde el form (histórico: antes se intentaba en paralelo pero fallaba silenciosamente por schema `trespuntos` no expuesto en Kong — código muerto eliminado el 2026-04-21).

### Archivos JS del formulario (3 scripts, siempre en este orden)
1. `/js/supabase-forms.js` (defer) — Submit handlers, n8n webhook, honeypot, rate limiting 30s, Turnstile token, lead scoring (nombre conservado por histórico — NO inserta en Supabase)
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
- `/js/supabase-forms.js` (defer) — Submit handlers, n8n + Turnstile (envía solo a n8n, no a Supabase directo — ver sección "Formulario CTA")
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

### Cambios aplicados (2026-04-08) — Páginas legales + Cookiebot
- **Páginas legales del WordPress recuperadas**: Contenido legal real extraído de la base de datos WP (`tres_wp907`, tabla `wpqt_posts`) del backup en `_wordpress-backup/` en FTP Nominalia
- **4 páginas legales creadas/actualizadas** con contenido real (CIF B66018490, Tres Puntos Comunicación S.L., dirección, LOPD):
  - `/aviso-legal/index.html` — Aviso legal completo (protección datos, contenidos, jurisdicción)
  - `/politica-privacidad/index.html` — Política de privacidad (derechos ARCO, propiedad intelectual, seguridad, confidencialidad)
  - `/politica-cookies/index.html` — Política de cookies + script CookieDeclaration de Cookiebot (genera tabla automática)
  - `/politica-redes-sociales/index.html` — **NUEVA** página de privacidad en redes sociales (Facebook, Twitter, YouTube, LinkedIn)
- **SEO**: Todas las legales con `<meta name="robots" content="noindex, follow" />`
- **Cookiebot** (ID: `b7dc2b5e-2d86-47c4-9650-a68520004f23`): Script de consentimiento añadido en **89 páginas HTML** del sitio. El banner solo aparece en dominios configurados en Cookiebot (producción)
- **Footer actualizado**: `components.js` + `index.html` (inline) con 4 links legales: Legal, Privacidad, Cookies, Redes Sociales
- **Subido a producción por FTP**: 89+ archivos subidos y verificados en www.trespuntoscomunicacion.es
- **WordPress backup**: La DB del WP antiguo sigue accesible en `_wordpress-backup/` con credenciales en `wp-config.php` (DB: `tres_wp907`, user: `tres_wp907`, tabla prefix: `wpqt_`)

### Cambios aplicados (2026-04-10) — Migración Cookiebot → CookieConsent v3 + Fix FOUC crítico

#### 1. Cookiebot → CookieConsent v3 (self-hosted, GDPR, Consent Mode v2)
- **Motivo**: Cookiebot cargaba sincrónicamente y se convertía en el elemento LCP en mobile. Además dependía de un SaaS externo.
- **Solución**: Migración a [CookieConsent v3](https://github.com/orestbida/cookieconsent) (MIT, ~11KB, self-hosted)
- **4 archivos nuevos en `/assets/cookieconsent/`**:
  - `cookieconsent.css` — CSS base de la librería
  - `cookieconsent.umd.js` — Librería (11KB)
  - `cookieconsent-init.js` — Config: 4 categorías (necessary, functionality, analytics, marketing), Consent Mode v2 con defaults denied, callback `onAccept` que carga GA4 condicionalmente
  - `cookieconsent-theme.css` — Theme dark + mint coherente con design-system (override CSS vars `--cc-bg`, `--cc-btn-primary-bg` mint, botones pill con glow)
- **Loader post-LCP**: El bloque se carga con `window.load` + `setTimeout(800)` — no bloquea el LCP. CSS con `media="print" onload="this.media='all'"` + fallback `<noscript>`
- **GA4 condicional**: El tag `gtag('config', 'G-ERX855WTHN')` solo se ejecuta tras aceptar analytics — antes estaba inline en el `<head>` siempre
- **Script batch aplicado a 88 HTMLs** (`/tmp/replace_cookiebot.py`): Reemplaza el bloque Cookiebot + GA4 inline por el loader CookieConsent. index.html se migró manualmente antes
- **Total**: 89 páginas con el nuevo banner

#### 2. Fix FOUC crítico — CSS síncrono (causa raíz del CLS 0.49)
- **Bug descubierto**: `design-system.css`, `components.css` y `case-study.css` se cargaban con el patrón async `media="print" onload="this.media='all'"` en todas las páginas. El critical CSS inline del `<head>` solo cubría el hero → el resto de la página se renderizaba SIN estilos y después saltaba al aplicar el CSS real → CLS 0.49, FOUC visible
- **Fix**: Script batch (`/tmp/fix_fouc_css.py`) convierte `design-system.css` y `components.css` a **carga síncrona (render-blocking)** en 88 HTMLs. `case-study.css` se deja async porque no siempre es above-the-fold
- **Resultado Lighthouse local (throttled)**:
  - Score: 76 → **95**
  - CLS: **0.49 → 0.005** (99% mejora)
  - LCP: ~2.8s
  - FCP: ~1.3s
- **REGLA CRÍTICA derivada**: El patrón `media="print" onload="this.media='all'"` SOLO es válido si el critical CSS inline cubre el 100% del above-the-fold. Si no, causa FOUC + CLS masivo. En este proyecto el critical CSS solo cubre el hero de la home, así que components.css y design-system.css deben ser síncronos en todas las páginas que no tengan critical CSS completo

#### 3. Deploy
- **FTP a Nominalia**: 89 HTMLs + 4 archivos de `/assets/cookieconsent/` subidos a producción
- **Verificación**: /nosotros/ carga con background oscuro correcto, navbar inyectado, banner CookieConsent aparece, no hay referencias a Cookiebot, no hay FOUC visible

#### 4. Bugs conocidos / sin resolver
- **Botón "Rechazar" del banner sigue en mint**: El selector `#cc-main .cm__btn[data-role="necessary"]` con `!important` no sobrescribe el background mint. El selector coincide pero el estilo no se aplica (posible cache CSS o transition interna de CookieConsent). Pendiente: investigar especificidad o pasar a inline styles via JS en `cookieconsent-init.js`
- **PSI public vs Lighthouse local**: Local (throttled) muestra score 95, pero PSI público (Moto G emulado) sigue en 67-69. Discrepancia no resuelta — posible causa: PSI mide desde EEUU con red 4G real, local usa throttling simulado
- **`.htaccess` — loop en /servicios/**: Línea `RewriteRule ^servicios/?$ /servicios/ [R=301,L]` crea un no-op loop 301 entre http/https. **PREEXISTENTE** (no introducido hoy). `curl` a https://www.trespuntoscomunicacion.es/servicios/ hace timeout. Pendiente de decisión de Jordi
- **`politica-cookies/index.html`**: Sigue cargando el script `CookieDeclaration` de Cookiebot (es la tabla legal automática, no el banner). Aceptable mientras no haya alternativa — o reemplazar por tabla estática manual

### Cambios aplicados (2026-04-16) — Tracking GA4 (Paso 1 estrategia analytics)

#### Decisión arquitectónica
- **Ubicación dashboard**: el dashboard de control central es `https://dash.trespuntos-lab.com/dashboard.html` (vanilla JS + Supabase auth + tabs Equipo/Captación/Keywords/Leads/Reuniones/Finanzas/Sistema). NO se usa Looker Studio externo. La estrategia analytics añade una pestaña "Web" en este dashboard, alimentada por una tabla `web_metrics` en Supabase que un workflow n8n actualiza desde GA4 Data API + GSC + Airtable + logs de bots IA
- **Stack final**: GA4 + Search Console + Microsoft Clarity ✅ + tabla Supabase + workflow n8n. Sin Plausible, sin PostHog, sin Looker Studio

#### Helpers globales (assets/cookieconsent/cookieconsent-init.js)
Tres funciones añadidas al inicio del IIFE, disponibles en las 89 páginas:
- **`window.tpTrack(eventName, params)`**: dispara `gtag('event', ...)` con fail-safe try/catch. Consent Mode v2 lo bloquea automáticamente si analytics_storage está denied
- **`window.tpClientId()`**: devuelve el client_id de GA4 (cookie `_ga`) o un fallback persistente en localStorage `tp_client_id`. Permite correlacionar leads en Airtable/Supabase con sesiones GA4 vía Measurement Protocol (Paso 2)
- **`window.tpPresupuestoToValue(p)`**: mapea labels de presupuesto a valor EUR estimado (mas-50000→50000, 25000-50000→37500, mas-20k→25000, 15k-20k/15000-25000→17500, 10k-15k→12500, 5k-10k→7500, default→3000)

#### 13 eventos GA4 implementados

**Formularios** (`js/supabase-forms.js` — 4 handlers + ga_client_id en payload n8n):
- `generate_lead` × 4 form_type: `cta`, `caso`, `email`, `briefing`. Params: lead_score, lead_quality, value (EUR), currency, servicio, pagina_origen, presupuesto/timeline/tipo_proyecto en briefing
- Todos los handlers ahora envían `ga_client_id` al webhook n8n para Measurement Protocol futuro

**Validación** (`js/form-validation.js`):
- `form_start` al primer focus o input en cualquier campo del form CTA. Se dispara una sola vez con flag `formStarted`. Params: form_type, pagina_origen

**Widget Jordan v6** (`assets/jordan/jordan-widget-v6.js` — 8 eventos via método helper `_track()`):
- `jordan_open` — solo en modo flotante (filtrado por `!this._isEmbedded`). Params: messages_count
- `jordan_close` — solo flotante. Params: messages_count, user_messages_count, duration_seconds, lead_captured
- `jordan_first_message` — primer mensaje del usuario (señal real de engagement, vale flotante y embed). Params: message_length, via
- `jordan_email_captured` — primera vez que `_extractData` captura email. Params: is_corporate, messages_at_capture
- `jordan_phone_captured` — primera vez que `_extractData` captura teléfono. Params: messages_at_capture
- `jordan_calendly_shown` — al renderizar quick replies con slots reales. Params: slots_count, source, has_email, has_phone
- `jordan_calendly_click` — click en slot Calendly (conversión clave). Params: slot_label, messages_count, has_email, has_phone
- `jordan_lead_captured` — tras `_leadSent = true` en `_sendLeadWebhook`. Params: has_email, has_phone, has_name, tipo_proyecto, presupuesto, rol, user_messages_count, duration_seconds
- Payload del widget al webhook n8n ahora incluye `ga_client_id`

**Todos los eventos Jordan incluyen automáticamente** (vía `_track()`): session_id, pagina_origen, embed_mode

**Privacidad**: ningún evento envía PII (nunca email/teléfono/nombre como param, solo flags booleanos `has_email`/`has_phone`/`has_name`)

#### Migración v5 → v6 del widget Jordan
- `assets/jordan/jordan-widget-v5.js` borrado
- `assets/jordan/jordan-widget-v6.js` nuevo (instrumentado)
- 42 HTMLs actualizados con `<script async src="/assets/jordan/jordan-widget-v6.js">` (script batch sed)
- Cache-bust automático: usuarios con v5 cacheada cargan v6 inmediatamente al volver a visitar

#### Conversiones marcadas como evento clave en GA4 admin (2026-04-16)
1. `generate_lead` — todos los form submits (cualquier form_type) ✅
2. `jordan_lead_captured` — leads del chat IA con datos de contacto ✅
3. `jordan_calendly_click` — la conversión "premium" (intent de reunión) ✅
- Propiedad: `TresPuntos.es - GA4` (a56947166p392606096), cuenta "Tres Puntos comunicac..."
- Datos de conversiones cuentan desde 2026-04-16 (no retroactivo)

#### QA local realizado (preview server)
- Helpers cargados en 100% de páginas (verificado en `/` y `/contacto/`)
- `tpClientId()` genera client_id válido formato GA4 (ej: `1833890661.1773422535`)
- `tpPresupuestoToValue('15k-20k')` → 17500 ✓
- 13 eventos validados llegando al dataLayer con forma correcta
- Modo embed filtra correctamente: `JordanAPI.open()` en `/contacto/` NO dispara `jordan_open` (evita ruido)
- Sin errores de consola

### Cambios aplicados (2026-04-16) — Analytics Paso 2 (dashboard + sync + Measurement Protocol)

#### 1. Tabla `trespuntos.web_metrics` en Supabase
- Esquema: `id` (bigserial), `metric_date` (date), `metric_hour` (smallint), `source` (ga4|gsc|airtable|jordan|clarity|system), `metric_key` (text), `dimension_1` (text), `dimension_2` (text), `value` (numeric), `meta` (jsonb), `created_at` (timestamptz)
- 3 índices: (date, source), metric_key, (date, key)
- Permisos: anon + authenticated con SELECT + INSERT
- Owner: `supabase_admin` (schema `trespuntos`)

#### 2. Endpoint `/api/web` en server.py (VPS)
- 6 queries GA4 Data API por llamada: events, daily, pages (top 20), sources (channels), devices, countries
- Eventos rastreados: `generate_lead`, `form_start`, `jordan_open`, `jordan_close`, `jordan_first_message`, `jordan_email_captured`, `jordan_phone_captured`, `jordan_calendly_shown`, `jordan_calendly_click`, `jordan_lead_captured`, `page_view`, `session_start`
- Cache 60s automático (sistema existente del dashboard)
- Error handling con detección de reauth

#### 3. Endpoint `/api/web-sync` en server.py (VPS)
- Llama a `/api/web` + `/api/gsc` internamente (datos cacheados)
- Transforma los datos en ~38 filas INSERT para `web_metrics`
- Inserta via `docker exec psql` directo a Supabase
- Devuelve `{ ok, rows, hour, date }`
- Nota: PostgREST no expone el schema `trespuntos` vía Kong (solo public, jordi, agentes). Se usa psql directo como workaround.

#### 4. Workflow n8n `📊 Web Metrics Sync — Hourly` (ID: `2hSkRO4tBO4VZwdx`)
- Cron: cada hora al minuto :05
- Nodos: Schedule Trigger → HTTP GET `/api/web-sync` → IF ok → (error) Telegram alert
- Telegram notifica errores al chat `7313439878`
- **Activo** en producción desde 2026-04-16

#### 5. Pestaña "Web" en dashboard.html (VPS)
- Nuevo tab button "Web" con badge dinámico (total sessions)
- 6 sub-secciones con sub-nav (`switchWeb()`): Resumen / Funnel / Páginas / SEO / Jordan / GEO
- **Resumen**: 6 KPIs (sessions, users, new, engaged, bounce, duration) + sparkline sessions 30d + canales tráfico + dispositivos
- **Funnel**: Embudo visual Sessions → Form starts → Generate lead → Jordan opens → Jordan 1er msg → Jordan leads → Calendly clicks. Con barras proporcionales y % conversión entre pasos
- **Páginas**: Tabla top 20 con sessions, views, duration, bounce, engagement rate (color-coded)
- **SEO**: KPIs GSC (clicks, impressions, CTR, position) + tabla queries + tabla páginas SEO
- **Jordan**: 5 KPIs (opens, 1er msg, emails, leads, calendly) + funnel Jordan detallado (7 pasos)
- **GEO**: Barras horizontales por país + placeholder GEO/AEO para tracking IA (futuro)
- `renderWeb(webData, ga4Data, gscData)` integrado en `initDashboard()` con `Promise.allSettled`

#### 6. Measurement Protocol en `Pipeline v2.5 — Leads Trespuntos` (ID: `fxiAWMB3S0eWc1aM`)
- Nodo `Mapear datos lead` actualizado a v5: ahora pasa `ga_client_id` del payload del formulario
- Nuevo nodo `GA4 Qualified Lead` (Code, continueOnFail): conectado desde `Preparar Airtable`
  - Condición: `lead_score >= 60` AND `ga_client_id` presente AND API secret configurado
  - Evento: `qualified_lead` con params: lead_score, lead_quality, value (EUR), servicio, pagina_origen, form_type
  - Value mapeado desde presupuesto: +20K€→25000, 15K-20K€→17500, 10K-15K€→12500, 5K-10K€→7500, default→3000
  - **⚠️ PENDIENTE**: Crear API secret en GA4 Admin → Data Streams → `G-ERX855WTHN` → Measurement Protocol API secrets → Create. Luego reemplazar `SET_YOUR_API_SECRET_HERE` en el nodo.

#### Pendiente Paso 3
- Crear el GA4 Measurement Protocol API secret y configurarlo en el nodo `GA4 Qualified Lead`
- Marcar `qualified_lead` como evento clave en GA4 admin
- Exponer schema `trespuntos` en Kong/PostgREST (actualmente usa psql directo como workaround)
- ✅ Microsoft Clarity integration (heatmaps, session recordings) — COMPLETADO 2026-05-19 (ver sección "Clarity")
- GEO/AEO: tracking de menciones en ChatGPT, Perplexity, Gemini, Claude
- Pestaña "Web" en dashboard: añadir gráficos históricos desde `web_metrics` (tendencias 7d/30d/90d)

### Cambios aplicados (2026-04-17) — SEO: Fix canibalización + redirects 301

#### 1. Redirects 301 absolutos (.htaccess)
- **109 reglas** convertidas de rutas relativas (`/blog/slug/`) a absolutas (`https://www.trespuntoscomunicacion.es/blog/slug/`)
- **Motivo**: Nominalia termina SSL en nginx → Apache veía HTTP → construía redirects con `http://` → cadena doble HTTPS→HTTP→HTTPS que penalizaba SEO
- Afectaba a: blog posts WP, servicios antiguos, páginas WP, categorías, tags, feeds, formularios

#### 2. Fix URL "endencias" rota (404 → 301)
- `/endencias-ux-ui-2026*` (5ª página más visitada, 63 sesiones/mes, devolvía 404) ahora redirige a `/blog/tendencias-ux-ui-2026-...`
- Era un typo indexado por Google (faltaba la "t" en "tendencias")

#### 3. Redirects servicios cortos
- `/servicios/desarrollo-web/` → `/servicios/desarrollo-web-a-medida-barcelona/`
- `/servicios/consultoria-ux/` → `/servicios/consultoria-digital-barcelona/`
- `/servicios/design-engineer/` → `/servicios/design-engineer-barcelona/`
- `/servicios/tienda-online/` → `/servicios/tienda-online-barcelona/`

#### 4. Meta description en contacto
- Añadida: "Habla con Jordan, nuestro asistente IA, o envíanos un mensaje..."

#### 5. Descanibalización SEO — "agencia ux ui barcelona"
- **Problema**: 6 páginas competían por el mismo keyword (home, UX/UI BCN, servicios hub, nosotros, contacto, blog). Google alternaba entre home (pos 3) y servicio UX/UI (pos 12), promediando ~9.8 en herramientas de tracking
- **Verificación SERP real (17 abril)**: Home en posición 3, servicio UX/UI en posición ~12 (pág 2). "Desarrollo web a medida barcelona" en posición 1 (servicio desarrollo web)
- **Solución**: Cada keyword tiene un solo dueño:

| Keyword | Página dueña | Cambio |
|---------|-------------|--------|
| "agencia ux ui barcelona" | Home (`/`) | Sin cambio — es la URL que rankea |
| "desarrollo web a medida barcelona" | `/servicios/desarrollo-web-a-medida-barcelona/` | Sin cambio — posición 1 |
| "diseño interfaces barcelona" | `/servicios/diseno-ux-ui-barcelona/` | Title/H1/meta desc diferenciados |
| "arquitectura digital" | `/nosotros/` | Title/H1/meta desc diferenciados |
| (transaccional) | `/contacto/` | Title genérico sin keywords competitivos |
| (hub) | `/servicios/` | Title sin "UX/UI" ni "desarrollo web" |

- **Titles cambiados**:
  - Servicios hub: "Servicios de Arquitectura Digital y Tecnología Web · Tres Puntos Barcelona"
  - UX/UI BCN: "Diseño de Interfaces y Experiencia de Usuario en Barcelona · Tres Puntos"
  - Nosotros: "Nosotros | Tres Puntos — Estudio de Arquitectura Digital en Barcelona"
  - Contacto: "Contacto | Tres Puntos — Hablemos de tu Proyecto Digital"
- **H1 cambiados**: UX/UI BCN ("Diseño de interfaces para plataformas..."), Nosotros ("Arquitectura digital de conversión en Barcelona")
- **REGLA CRÍTICA**: NUNCA poner "agencia UX/UI Barcelona" en el title de ninguna página que no sea la home. NUNCA poner "desarrollo web" en titles de páginas que no sean la de servicio de desarrollo web.
- **Deploy**: 5 archivos subidos por FTP a producción (2026-04-17)

### Cambios aplicados (2026-04-21) — Fix UTM tracking + limpieza Supabase muerto

#### Contexto
Jordan detectó que el KPI "UTMs no capturados = 0%" del dashboard estaba hardcodeado y que, aunque el JS del form leía UTMs de la URL, no los pasaba al destino final. Investigación reveló dos problemas distintos: (1) JS no incluía UTMs en el payload Supabase, (2) el insert a Supabase **nunca había funcionado** porque el schema `trespuntos` no está expuesto en Kong/PostgREST y el error se tragaba con `.catch(()=>{})` silencioso.

#### Decisión
**Airtable queda como fuente única de verdad para leads del formulario.** No se expone el schema `trespuntos` en Kong (opción A descartada por riesgo de exponer tablas sensibles como `cerebro_documents`, `token_usage`, `client_instructions` sin auditar RLS). Se elimina el código muerto del JS (opción C).

#### Cambios realizados
1. **`js/supabase-forms.js` limpiado** — eliminadas constantes `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SCHEMA`, función `supabaseInsert()` y sus 4 llamadas (cta, caso, email, briefing). Solo queda n8n webhook + Turnstile + tracking GA4. Archivo 18KB → 17KB.
2. **Revertidas las columnas UTM añadidas durante la investigación** en `trespuntos.web_contactos` (utm_source, utm_medium, utm_campaign, pagina_referrer) y `trespuntos.leads` (las 4 anteriores + pagina_origen). Dropped via `supabase_admin`.
3. **Dashboard `/root/dashboard.html`**: sustituido el KPI `0%` hardcodeado por cálculo dinámico que lee de Airtable. IDs añadidos: `kpi-utm-pct`, `kpi-utm-sub`, `kpi-utm-badge`, `utm-alert-box`, `utm-alert-title`, `utm-alert-msg`. Lógica en `renderLeads()`: `% = leads con UTM Source/Medium/Campaign != '' / total leads form`. Colores: verde ≥50%, amber ≥20%, rojo <20%. Copy del alert banner adapta al tramo.
4. **Test end-to-end real** hecho en producción desde Chrome: form enviado con UTMs sintéticos → Airtable recibió registro con `UTM Source=claude-test`, `UTM Medium=verificacion`, `UTM Campaign=fix-utm-20260421`. Record de test borrado tras verificación.
5. **n8n NO tocado** — los 4 campos UTM ya estaban correctamente mapeados en los nodos "Mapear datos lead", "Preparar Airtable" y "Upsert AT Briefing" desde hace meses. Los campos también existían en Airtable (`fldMEBQ9tgkpUx7br`, `fld9la2hMHFAxWksz`, `fldJWTwMbc2LF70Ht`, `fldwtbiGLdWUFIwO0`). Todo el backend ya estaba preparado, solo fallaba el JS del front.

#### Hallazgos importantes
- **El schema `trespuntos` de Supabase NO está expuesto en PostgREST/Kong** (solo `public`, `jordi`, `agentes`). Cualquier intento del frontend de escribir con `Content-Profile: trespuntos` falla con `PGRST106`. Las tablas `web_contactos` y `leads` de ese schema están vacías o desactualizadas.
- **El `.catch(function(){})` vacío que había en el JS es un patrón peligroso** — tragó errores reales durante 6+ meses. Lección: siempre loguear a consola al menos, aunque sea silencioso para el usuario.
- **Dashboard en `/root/dashboard.html` del VPS** (n8n.trespuntos-lab.com) sirve `dash.trespuntos-lab.com` — no está en Hostinger como decía una referencia antigua. Backups en `/root/dashboard.html.bak-*`.

### Cambios aplicados (2026-04-24) — Jordan widget v7: persistencia en 3 stages + fix Calendly + system prompt v10.2

#### Contexto (bug crítico descubierto)
Jordi testeó el chat de Jordan desde móvil, reservó en Calendly, y no llegó nada: ni Telegram, ni email, ni Airtable. Causa raíz: el widget v6 solo enviaba el lead al cerrar chat / beforeunload / 30min inactividad. Al clicar slot Calendly, `window.open(fullUrl, '_blank')` abría nueva pestaña → la original quedaba abierta → nunca se disparaba `beforeunload` → lead perdido en localStorage. Desde el 16 abril, **8 días sin ninguna ejecución real** en el workflow `jordan-chat-leads`. Toda conversación que terminaba en Calendly sin cerrar pestaña se perdió.

#### Arquitectura nueva — 3 stages de envío
```
Widget Jordan v7
├─ msg 4: usuario da email
│  └─ _sendPartialLead('initial')
│     └─ n8n: Airtable Upsert (Session ID) + Telegram 🟡 "Hablando con alguien"
├─ Cada nuevo dato capturado (debounce 10s)
│  └─ _sendPartialLead('update')
│     └─ n8n: Airtable Upsert (mismo Session ID, sin IA, sin Telegram)
└─ Final (cierre chat / beforeunload / 30min / click Calendly)
   └─ _sendLeadWebhook('final')
      └─ n8n: Scoring IA + Airtable Upsert + Email Jordi + Email Lead + Telegram 💬 scoring
```

**Ventaja clave**: en cuanto Jordan captura el email, el lead queda server-side. Aunque el móvil se apague, aunque nunca cierre el chat, **el contacto ya no se pierde**.

#### Cambios técnicos

**Widget `/assets/jordan/jordan-widget-v7.js` (100 KB, ~2400 líneas)**
- Nuevo flag global `__jordanWidgetV7` + host id `jordan-widget-v7`
- Nuevos estados: `_partialSent` (flag initial ya enviado), `_updateTimer` (debounce 10s), `emailJustCaptured` (trigger diferido)
- Nuevo método `_sendPartialLead(stage)` + `_scheduleUpdateSync()` (debounce)
- `_extractData()`: el trigger de `initial` se mueve al FINAL de la función (tras intentar extraer nombre/empresa/rol) — evita Telegrams sin nombre
- `_saveExtracted()`: si ya se hizo `initial`, programa `update` debounced
- `_sendLeadWebhook()`: payload con `stage='final'`, cancela updates pendientes
- **Fix bug Calendly**: `_sendLeadWebhook()` se llama ANTES de `window.open(fullUrl)` — así no se pierde aunque el usuario no cierre la pestaña
- `_buildPayload()`: acepta `stage`, incluye `ultima_pregunta_jordan` (contexto del Telegram inicial)
- `_loadSession()`: recupera `_partialSent` del localStorage si el usuario recarga página

**System prompt v10.2 (embebido en widget)**
- Fase 1 msg 1: bienvenida igual
- Fase 2 msg 2: reformular + 1 pregunta de proyecto
- **Fase 3 msg 3: reformular + observación de valor (stack/equipo/caso) + 1 pregunta más** — objetivo: que el usuario piense "este bot responde bien"
- **Fase 4 msg 4: pedir nombre + email con excusa de la copia** — *"Antes de seguir, para que te llegue una copia de esta conversación y que el equipo pueda contactarte si no terminamos, ¿me dejas tu nombre y un email? Así no se pierde nada."*
- Teléfono movido al final (opcional, no bloqueante)
- NUNCA #4: no pedir datos antes de msg 4
- NUNCA #5 nuevo: no pedir teléfono en Fase 4
- NUNCA #21 nuevo: no bloquear cierre por falta de teléfono

**Inyecciones dinámicas al prompt (por cada request al proxy)**
El widget calcula en cada llamada qué datos hay y qué faltan, e inyecta al system prompt un **checklist dinámico** + **reglas activas**:
```
## CHECKLIST DEL LEAD (estado actual)
Mensaje nº: 5 · Mensajes del usuario: 3
- Nombre: [OK] ("Juan")
- Email: [FALTA]
- Tipo proyecto: [OK]
- Presupuesto: [FALTA]
- Timeline: [FALTA]
- Rol: [OK]
- Telefono: [FALTA]

REGLAS ACTIVAS:
- PRIORIDAD MAXIMA: ...pedir email ahora con excusa de la copia
- El presupuesto es OBLIGATORIO antes de cerrar o ofrecer reunion
- NO OFREZCAS REUNION hasta tener email Y presupuesto
```
Haiku ve esto en cada request → sigue la lógica de captura sin depender solo del prompt estático.

**Marcador `[CALENDLY_SLOTS]`**
- Jordan solo dispara tarjetas Calendly escribiendo literal `[CALENDLY_SLOTS]` al final del mensaje
- El widget lo detecta (`lower.includes('[calendly_slots]')`) → llama API Calendly → muestra slots reales
- Se oculta del mensaje visible (`_addMessage` reemplaza por `''`)
- Prohibido mezclar oferta de reunión con otra pregunta en el mismo mensaje (causaba cards Calendly mientras Jordan preguntaba timeline)

**Placeholders literales sustituidos en `_addMessage`**
Haiku a veces deja sin rellenar `[CALENDLY_URL]` o `[Nombre]`. El widget ahora los reemplaza automáticamente:
- `[CALENDLY_URL]` → `CONFIG.calendlyUrl` (`https://calendly.com/trespuntos/jordi-exposito`)
- `[Nombre]` → `this.extracted.nombre` o vacío
- `[CALENDLY_SLOTS]` → vacío (solo el widget lo usa)

**Quick replies automáticas DESACTIVADAS (salvo welcome inicial)**
Motivo: Haiku mezcla intents en un mismo mensaje (ej. "merece hablarlo en directo" + "¿en cuánto tiempo necesitas?") y el detector `_checkForQuickReplies` matcheaba mal:
- "portafolio" contenía "rol" → cards de CEO/Marketing en pregunta de tipo de web
- "en directo" → cards Calendly mientras Jordan preguntaba timeline
La welcome inicial sí mantiene cards (onboarding). El resto lo lleva Jordan en conversación libre, disparando Calendly solo con `[CALENDLY_SLOTS]`.

**Workflow n8n `jordan-chat-leads` (ID: `2a6ZaK3pw9j7LPEc`) — 12 nodos → 16 nodos**
- `Procesar Datos Chat`: lee `stage` y `session_id` del body
- Nuevo IF **`Es Final?`** (condición `$json.stage === 'final'`):
  - TRUE → Scoring IA → Procesar Respuesta IA → [Telegram 💬 final, Airtable Upsert, Email Jordi, Email Lead]
  - FALSE → flow parcial
- Nuevo HTTP PATCH **`Upsert Airtable Parcial`**:
  - `performUpsert: {"fieldsToMergeOn": ["fld8Gkqh8tKlJqCK7"]}` — por Session ID
  - Solo 10 campos básicos (nombre, email, tel, empresa, rol, tipo, presupuesto, conversación, fuente + Session ID)
  - Sin IA, sin email, sin scoring
- Nuevo IF **`Es Initial?`** (tras upsert parcial):
  - TRUE → Preparar Telegram Initial → Enviar Telegram
  - FALSE → fin (era un `update`, no notificación)
- Nuevo Code **`Preparar Telegram Initial`**:
  - Mensaje 🟡 "Hablando con alguien" con nombre, email, URL origen, última pregunta de Jordan, 2 primeros mensajes del usuario
  - "La conversación sigue abierta. Te aviso con el resumen completo cuando termine."
- **`Guardar en Airtable`** modificado de POST → PATCH con `performUpsert fieldsToMergeOn Session ID` — ya no crea duplicados, actualiza el mismo registro que el initial

**Airtable tabla `Jordan — Chat Leads` (base `appR9SHmsc6CZ7VJj`, `tblU72kaxQq7222Do`)**
- Campo nuevo **Session ID** (`fld8Gkqh8tKlJqCK7`, singleLineText) — clave de upsert

#### Tests end-to-end realizados (2026-04-24)
- **Workflow aislado con curl**: stage `initial` creó `recVAwhcM7OUjrBvh` + Telegram 🟡 llegó. Stage `final` (mismo SID) hizo UPDATE del mismo record (`updatedRecords`) + Telegram 💬 con score 8/10. Sin duplicados. ✅
- **Test real desde móvil de Jordi**: el Telegram 🟡 llegó correctamente tras dar email (bug identificado: llegó con "Sin nombre" aunque el usuario dio "Juan" — causa: `_sendPartialLead` se disparaba ANTES de la extracción de nombre. Fix aplicado en iteración 2).

#### Iteración de bugs tras test real

**v7.1 — 4 fixes** (aplicados + subidos por FTP)
1. **Bug rol/portafolio**: `_checkForQuickReplies` hacía `lower.includes('rol')` → "portafolio" matcheaba → cards de CEO en pregunta de tipo de web. Fix: `/\brol\b/` con word boundary.
2. **Telegram sin nombre**: `_sendPartialLead('initial')` se disparaba dentro del bloque de email, antes de que corriera la extracción de nombre. Fix: flag `emailJustCaptured` + mover el send al FINAL de `_extractData`.
3. **Jordan no pedía datos en msg 4**: Haiku rebelde ante el prompt estático. Fix: inyección dinámica en system prompt si `userMsgCount >= 3 && !email`.
4. **`[CALENDLY_URL]` literal + miércoles inventado**: Jordan escribía "[CALENDLY_URL]" sin sustituir y proponía fechas inventadas. Fix widget: `_addMessage` reemplaza el placeholder por el URL real. Fix prompt: nueva sección `## CALENDLY — REGLA ESTRICTA` prohibiendo inventar fechas.

**v7.2 — 3 fixes más** (aplicados + subidos)
1. **Quick replies automáticas desactivadas post-welcome**: evitaba mismatches por intents mezclados.
2. **Marcador `[CALENDLY_SLOTS]`**: Jordan debe escribirlo explícitamente al final del mensaje para que el widget muestre slots. Sin marcador, sin cards fantasma. En el mismo mensaje con Calendly NO se hacen otras preguntas.
3. **Checklist dinámico con presupuesto obligatorio**: Haiku no pedía presupuesto antes de ofrecer Calendly. Fix: inyección de checklist `[OK]/[FALTA]` con reglas condicionales:
   - Si email sin presupuesto → pregunta presupuesto contextualizado
   - Si no presupuesto → NO OFREZCAS REUNION (bloqueo explícito)

#### Deploy realizado (2026-04-24)
- ✅ Airtable field `Session ID` creado
- ✅ Workflow n8n modificado (16 nodos) — activo en producción
- ✅ `jordan-widget-v7.js` subido por FTP a Nominalia (3 iteraciones: v7, v7.1 patched, v7.2 patched)
- ✅ 42 HTMLs actualizados con `jordan-widget-v7.js`
- ⚠️ **FTP via `ftp.trespuntoscomunicacion.es` (185.2.4.34) bypassing Cloudflare** — el dominio principal `trespuntoscomunicacion.es` resuelve a Cloudflare (104.21.x.x, 172.67.x.x) que no proxia FTP port 21. Usar siempre `ftp.trespuntoscomunicacion.es` para futuros FTP.
- ⚠️ **Cloudflare purge necesario tras CADA iteración** — el JS se cachea con `cache-control: max-age=31536000` (1 año). Sin purge, los usuarios siguen cargando la versión anterior.

#### Pendientes Jordan v7 (futuras iteraciones)
- Validar test 3ª ronda tras deploy v7.2
- Si Haiku sigue sin respetar orden de preguntas → migrar parte de la lógica a Kobe o añadir un paso intermedio de "validador" entre Haiku y el widget
- Reactivar quick replies post-welcome cuando el detector sea más robusto (ahora mismo solo welcome + Calendly explícito via marcador)
- Eliminar `jordan-widget-v6.js` del servidor tras confirmar que nadie lo usa (~1 semana)

#### Archivos tocados
- `/assets/jordan/jordan-widget-v7.js` (nuevo, derivado de v6)
- 42 HTMLs (home, servicios/*, casos/*, blog, contacto, iniciar-proyecto, nosotros)
- Workflow n8n `2a6ZaK3pw9j7LPEc`
- Airtable tabla `tblU72kaxQq7222Do` (campo Session ID)

## LinkedIn Analytics — Importador semi-automático (2026-05-03)

### Qué es
Sistema para guardar las métricas de la **Company Page de LinkedIn** de Tres Puntos en Airtable, accesibles para todos los agentes IA. Reutiliza el patrón existente de la base **Analytics** (`app2vjuhe4kJkrH5u`) que ya alimenta el dashboard SEO multi-cliente.

### Por qué semi-automático
LinkedIn no expone analytics privados sin aprobación al **Marketing Developer Platform** (4-8 semanas). Scrapear con Playwright + cookie sería técnicamente viable pero supone riesgo alto de baneo de la cuenta admin de la página. Decisión: **export manual semanal del XLSX** + parser automatizado. Cuando llegue MDP (si Jordi decide aplicar), añadir un workflow n8n con OAuth y mantener la misma tabla destino.

### Arquitectura
```
LinkedIn admin → Export XLSX (3 min/semana)
   ↓
~/Dropbox/Tres Puntos/LinkedIn Analytics/inbox/
   ↓
python3 scripts/linkedin/import-xlsx.py
   ↓ (parsea 5 hojas, hace upsert por snapshot_id)
Airtable Analytics → tabla LinkedIn_Snapshots → 1 fila por día
   ↓
Agentes IA (Claudio/Curry/Bird/Magic/Jordan) consultan vía MCP Airtable
```

### Estructura de datos
- **Base**: `Analytics` (`app2vjuhe4kJkrH5u`)
- **Tabla**: `LinkedIn_Snapshots` (`tbl7JxNjtOj4s3FYL`)
- **Cliente**: `Tres Puntos` en `Clients` (slug `trespuntos`, recId `rec9UH6rTgxHykknV`) — añadido como cliente interno
- **Convención**: `snapshot_id = YYYY-MM-DD_trespuntos` (mismo patrón que SEO_Snapshots, GA4_Snapshots, etc.)
- **Campos diarios**: impressions, interactions, new_followers, engagement_rate
- **Campos del rango (solo en `is_period_end=true`)**: members_reached, followers_total, top_posts_by_interactions_json (50 posts), top_posts_by_impressions_json, demo_jobtitles_json, demo_locations_json, demo_industries_json, demo_seniority_json, demo_company_size_json, demo_top_companies_json
- **Filtrado de filas**: el parser solo inserta días con actividad (impresiones/interacciones/nuevos seguidores > 0) o el último día del rango. Días sin actividad se omiten para no inundar la tabla.

### Carga inicial completada (2026-05-03)
- 91 registros insertados (período 2025-09-02 → 2026-05-03)
- Total seguidores actuales: **316**
- Miembros alcanzados año: **1.363**
- Top post del año por impresiones: 23-feb-2026 con **895 impresiones**
- Top post por interacciones: 23-feb-2026 con **11 interacciones**
- Demografía top: Barcelona (44.6%), Servicios de publicidad (15.8%), Sin experiencia (31.3%), Empresas 1-10 empleados (17.4%)
- URL Airtable: https://airtable.com/app2vjuhe4kJkrH5u/tbl7JxNjtOj4s3FYL

### Scripts y archivos
- `/scripts/linkedin/import-xlsx.py` — parser principal. Soporta `--dry-run`, `--keep`, `--export-json out.json`
- `~/Dropbox/Tres Puntos/LinkedIn Analytics/inbox/` — drop zone para XLSX nuevos
- `~/Dropbox/Tres Puntos/LinkedIn Analytics/processed/` — XLSX ya procesados (con timestamp)
- `~/Dropbox/Tres Puntos/LinkedIn Analytics/README.md` — instrucciones de export

### Cómo usar (semanal) — recomendado: skill `/linkedin-import`

**Opción 1 — Skill automatizada (recomendado, NO requiere PAT)**
Desde cualquier sesión Claude Code:
- `/linkedin-import semana` → Claudio descarga el export de los últimos 7 días desde LinkedIn (vía Claude_in_Chrome con tu sesión real), parsea, upsert en Airtable, mueve a processed
- `/linkedin-import mes` → últimos 28 días
- `/linkedin-import año` → último año (export rico con 50 top posts + demografía completa)
- `/linkedin-import` → solo procesa lo que ya esté en inbox (sin descargar nada)
- `/linkedin-import status` → resumen rápido (qué hay en inbox + últimos snapshots en Airtable)

La skill está definida en `.claude/commands/linkedin-import.md`. Usa MCP `Claude_in_Chrome` con el browser "Work" (deviceId `23e0a04f-35b1-43bf-bd75-fa5388f8dede`). NO usar Control_Chrome (está en otro profile sin sesión LinkedIn).

URL del Creator Analytics que la skill usa para descargar:
```
https://www.linkedin.com/analytics/creator/content?timeRange={past_7_days|past_28_days|past_year}&dimension=INDUSTRY&metricType=IMPRESSIONS
```

El click en el botón "Exportar" descarga directamente sin modal. Filename auto-generado: `Contenido_{period_start}_{period_end}_TresPuntos.xlsxIDvoyager-api-premium...report.xlsx`. La skill renombra a algo limpio antes de moverlo a inbox.

**Opción 2 — Manual sin Claude Code**
1. Lunes: entrar en `linkedin.com/analytics/creator/content?timeRange=past_7_days&dimension=INDUSTRY&metricType=IMPRESSIONS`
2. Click botón "Exportar" arriba a la derecha → descarga directa sin modal
3. Arrastrar el archivo de `~/Downloads/` a `~/Dropbox/Tres Puntos/LinkedIn Analytics/inbox/`
4. Ejecutar: `python3 scripts/linkedin/import-xlsx.py` (requiere PAT configurado, ver abajo)
5. El script hace upsert por snapshot_id (no duplica) y mueve el XLSX a `processed/`

### Edge case crítico: rango pequeño vs grande

Si procesas un XLSX de rango pequeño (semanal) **después** de uno grande (anual), la fila `is_period_end=true` del último día del rango pequeño tiene datos POBRES (members_reached limitado, menos top posts, demografía solo de esa semana). Si se sobrescribe la fila existente, **se pierden los datos ricos del anual**.

Comparativa real (mismo día 2026-05-03):
| Campo | XLSX anual (rico) | XLSX semanal (pobre) |
|---|---|---|
| members_reached | 1.363 | 142 |
| top_posts_by_impressions | 50 posts | 30 posts |
| top_posts_by_interactions | 25 posts | 4 posts |
| Demografía | acumulada año | solo última semana |

**Cómo lo maneja la skill `/linkedin-import`**: antes de hacer upsert de una fila `is_period_end`, lee la fila existente en Airtable. Si ya existe Y tiene un rango MAYOR → modifica el JSON entrante: elimina los campos "del rango" (members_reached, followers_total, top_posts_*, demo_*) y cambia `is_period_end` a `false`. Solo se actualizan las métricas diarias (impressions, interactions, new_followers, engagement_rate). Esto preserva los datos ricos.

**El script `import-xlsx.py` standalone NO tiene esta protección** — si ejecutas directamente con PAT, ten en cuenta el orden de procesamiento (procesar primero el rango grande, luego pequeños).

### Configuración del PAT (pendiente Jordi)
El script necesita un Airtable PAT con permisos `data.records:read|write` sobre la base Analytics. Configurar de UNA de estas dos formas:

**Opción 1 (recomendada)** — env var en tu shell profile (`~/.zshrc` o `~/.bashrc`):
```bash
export AIRTABLE_PAT='patXXXXXXXX...'
```

**Opción 2** — archivo de config:
```bash
mkdir -p ~/.config/tres-puntos
echo 'AIRTABLE_PAT=patXXXXXXXX...' > ~/.config/tres-puntos/airtable.env
chmod 600 ~/.config/tres-puntos/airtable.env
```

Mientras no haya PAT configurado, el script funciona en modo `--dry-run` y `--export-json`. La carga inicial del 2026-05-03 se hizo vía MCP Airtable (que tiene auth propia), no vía script.

### Validación end-to-end realizada (2026-05-03)

Hallazgos técnicos del test manual con el Chrome real de Jordi:

**Browser correcto**: `Claude_in_Chrome` con browser "Work" (deviceId `23e0a04f-35b1-43bf-bd75-fa5388f8dede`). El otro MCP `Control_Chrome` resultó estar en otro profile sin sesión LinkedIn — daba authwall continuamente. La skill `/linkedin-import` siempre debe usar Claude_in_Chrome.

**Flujo de export manual confirmado**:
1. Navegar a `https://www.linkedin.com/analytics/creator/content?timeRange={X}&dimension=INDUSTRY&metricType=IMPRESSIONS`
2. `find` busca "botón Exportar o Export" → devuelve un `ref_NN` (ej. `ref_87`)
3. `computer left_click` con ese ref → **descarga directa sin modal** (no se abre ningún diálogo)
4. Esperar ~2-3s → archivo aparece en `~/Downloads/` con filename auto-generado tipo:
   ```
   Contenido_{period_start}_{period_end}_TresPuntos.xlsxIDvoyager-api-premium premium.edge.insights.analytics.dash.impl.powercreator.content_analytics.report.xlsx
   ```
   (con sufijo `(1)`, `(2)`... si ya existe). La skill renombra a `Contenido_{period_start}_{period_end}_TresPuntos.xlsx` antes de mover a inbox.
5. `python3 scripts/linkedin/import-xlsx.py --export-json /tmp/...json` parsea las 5 hojas
6. Filtrar a útiles (días con actividad O is_period_end)
7. Para cada is_period_end: comprobar Airtable y aplicar protección de "rango grande gana"
8. Batches de 25 → MCP Airtable `update_records_for_table` con `performUpsert`
9. Mover XLSX a `processed/` con prefijo timestamp

**Validación numérica**: el export semanal del 27/4-3/5 que descargué con `Claude_in_Chrome` coincidió EXACTAMENTE con los números que ya teníamos del export anual para esos mismos días (35, 90, 77, 49, 17, 9, 13/15 impresiones), confirmando que el flujo es fiable.

### Decisión pendiente: nivel de automatización

Tras la sesión 2026-05-03, hay 4 caminos posibles para automatizar más allá del flujo manual `/linkedin-import semana`:

| Camino | Setup | Coste | Automatización | Riesgo |
|---|---|---|---|---|
| **A. Routines remotas tipo recordatorio** | 10 min | 0€ | 95% (tú escribes el comando) | 🟢 Nulo |
| **B. launchd local + Playwright Python** | 1-2 días | 0€ | 100% si tu Mac está encendido | 🟡 Cookies LinkedIn invalidan cada 2-3 meses |
| **C. Browserless + n8n cron** | 4-6h | ~$50/mes | 100% server-side | 🟡 Mismo problema cookies + dependencia tercero |
| **D. LinkedIn Marketing Developer Platform (oficial)** | 2 min hoy + 4-8 sem espera | 0€ | 100% sin riesgo | 🟢 Nulo (vía oficial) |

**Recomendación combo A + D (en paralelo)**:
- Crear 3 routines remotas vía `/schedule`:
  1. **Lunes 09:00** — Telegram al grupo Mesa 3P recordando ejecutar `/linkedin-import semana`
  2. **Lunes 13:00** — verifica vía Airtable si hay snapshot del lunes; si no, insiste
  3. **Día 1 mes 09:00** — recordatorio mensual + resumen del mes anterior leyendo de Airtable
- En paralelo: aplicar al **MDP de LinkedIn** (formulario en `developer.linkedin.com`). Si aprueban en 4-8 semanas → workflow n8n diario con OAuth oficial reemplaza la skill. Si rechazan → seguimos con A indefinidamente.

**No recomendado** B y C por ahora: el riesgo de invalidación de cookies + posible baneo de cuenta admin no compensa el ahorro de 30 segundos semanales que da A.

### Pendientes
- ✅ ~~Crear skill `/linkedin-import` con descarga automatizada vía Claude_in_Chrome~~ COMPLETADO (2026-05-03)
- ✅ ~~Validar flujo end-to-end con export real~~ COMPLETADO (2026-05-03)
- ✅ ~~Edge case rango pequeño vs grande protegido en la skill~~ COMPLETADO (2026-05-03)
- Decidir camino de automatización (A+D recomendado) y crear las 3 routines de recordatorio
- Aplicar al MDP de LinkedIn (paralelo, 2 min de formulario)
- Jordi configura PAT (Opción 1 de arriba) — solo necesario si quieres ejecutar `import-xlsx.py` desde terminal SIN Claude Code
- Considerar añadir pestaña "LinkedIn" en `dash.trespuntos-lab.com` que lea de Airtable (no prioritario, los datos ya están accesibles desde Airtable)

---

## Sistema OG (Open Graph) — Imágenes para redes sociales (2026-04-29)

### Qué es
Sistema unificado para generar **imágenes Open Graph** (1200×630 PNG) automáticamente para todas las páginas del sitio. Cuando alguien comparte cualquier URL en LinkedIn, X, WhatsApp, Telegram, Facebook, Slack, etc., aparece una tarjeta visual coherente con la marca: **logo Tres Puntos (dark) + badge categoría + título + descripción**.

Cobertura actual: **102 páginas** (home, blog hub + 38 posts, casos hub + 9 casos, servicios hub + 22 servicios, sectores hub + 16 sectores/análisis, contacto, nosotros, iniciar-proyecto, arquitectura-digital-conversion, 4 legales).

### Arquitectura
```
scripts/og/og-template.html        ← Plantilla universal (HTML+CSS+JS, lee params via URL hash)
scripts/og/generate-og.py          ← Recorre todos los index.html, extrae meta, renderiza con Chrome headless
scripts/og/update-html.py          ← Reemplaza og:image, twitter:image, JSON-LD image en todos los HTMLs
scripts/og/ftp-upload.sh           ← Sube imágenes + HTMLs por FTP a Nominalia
scripts/og/manifest.json           ← Mapping rel_path → slug → category → title → output
img/og/{slug}.png                  ← 102 imágenes generadas (~225-250 KB cada una)
img/blog/og-default.jpg            ← Fallback genérico (JPG, copia de home.png convertida)
```

### Convención de slugs
| Sección | Slug pattern | Ejemplo |
|---|---|---|
| Home (`/`) | `home` | `home.png` |
| Blog hub | `blog` | `blog.png` |
| Blog post | `blog-{slug}` | `blog-arquitectura-frontend-2026-...png` |
| Casos hub | `casos` | `casos.png` |
| Caso | `caso-{slug}` | `caso-gibobs.png` |
| Servicios hub | `servicios` | `servicios.png` |
| Servicio | `servicio-{slug}` | `servicio-desarrollo-web-a-medida-barcelona.png` |
| Sectores hub | `sectores` | `sectores.png` |
| Sector vertical | `sector-{vertical}` | `sector-fintech.png` |
| Análisis sector | `analisis-{client}` | `analisis-circulantis.png` |
| Páginas singulares | `{path}` | `nosotros.png`, `contacto.png`, `aviso-legal.png` |

### Categorización del badge (top-left de la tarjeta)
La función `categorize()` en `generate-og.py` decide el badge según el path:
- Home → `AGENCIA UX/UI · BARCELONA`
- Blog post → `BLOG · {data-category extraído de blog/index.html}` (ej. `BLOG · DESARROLLO WEB`)
- Caso → `CASO DE ÉXITO · {CLIENTE}` (mapping cliente: gibobs→GIBOBS, exitbcn→EXITBCN, etc.)
- Servicio con ciudad → `SERVICIO · {CIUDAD}` (BARCELONA/MADRID/BILBAO/SEVILLA)
- Sector vertical → `SECTOR · {NOMBRE}` (FINTECH, INMOBILIARIA, SAAS B2B, SALUD)
- Análisis sector → `ANÁLISIS · {CLIENTE}`
- Legales → `LEGAL · {TIPO}`
- Nosotros → `AGENCIA · NOSOTROS`
- Contacto → `CONTACTO · TRES PUNTOS`

### Limpieza de títulos (función `clean_title`)
Estrategia universal: extraer la **value prop** del title del HTML, eliminando ruido como `| Tres Puntos`, `| Blog`, `| Caso XYZ`:

| Patrón title | Resultado en OG |
|---|---|
| `Agencia UX/UI Barcelona \| Arquitectura Digital de Conversión · Tres Puntos` | `Arquitectura Digital de Conversión` (tras `\|`, antes de Tres Puntos) |
| `Desarrollo de Tiendas Online: UX en E-commerce \| Blog \| Tres Puntos` | `Desarrollo de Tiendas Online: UX en E-commerce` (chunk 1) |
| `Desarrollo plataforma fintech \| Caso Gibobs · Tres Puntos` | `Desarrollo plataforma fintech` (chunk 1) |
| `Nosotros \| Tres Puntos — Estudio de Arquitectura Digital en Barcelona` | `Estudio de Arquitectura Digital en Barcelona` (después de `Tres Puntos —`) |
| `Blog \| Tres Puntos — UX/UI, Arquitectura Digital y Desarrollo Web` | `UX/UI, Arquitectura Digital y Desarrollo Web` (después de `Tres Puntos —`) |

**Regla universal**: si el title contiene `Tres Puntos —` (o `Tres Puntos –`), el contenido **después del em-dash** se prefiere como title (es la value prop). Si no, se eliminan sufijos `| Tres Puntos`, `| Blog`, `| Caso XYZ` y se toma el primer chunk antes del primer `|`.

### Plantilla visual (`og-template.html`)
- Fondo: gradiente radial `#1a2520` (mint subtle) → `#0e0e0e`
- Grid sutil de líneas mint con máscara radial
- Glow mint a la derecha
- Logo Tres Puntos dark (`logo-trespuntos-dark.svg`) arriba-izquierda + dominio `trespuntoscomunicacion.es`
- Badge mint pill con punto luminoso: categoría
- Title Plus Jakarta Sans 700, 64px (auto-shrink a 56px si >55 chars, 50px si >80 chars)
- Subtitle Inter regular 22px, color `rgba(255,255,255,.72)`, max 2 líneas
- Footer: autor Jordi Expósito + Tres Puntos + barra mint accent

Parámetros vía URL hash: `og-template.html#cat=...&title=...&sub=...` (URL-encoded). El JS dentro del template los lee y los inyecta antes de renderizar.

### Cómo generar OG para una página NUEVA (1 sola)
Cuando crees un blog post / servicio / caso nuevo:

1. Asegúrate que el `index.html` está en su carpeta local + tiene `<title>` y `<meta name="description">` correctos
2. Ejecutar el generador (regenera todas, pero es rápido — 4-5 min para 100+ páginas):
   ```bash
   python3 /Users/jordi/.../scripts/og/generate-og.py
   ```
   O para una sola página, llamada directa a Chrome headless:
   ```bash
   python3 -c "
   import urllib.parse, subprocess
   params = urllib.parse.urlencode({
     'cat': 'BLOG · DESARROLLO WEB',
     'title': 'Tu título limpio',
     'sub': 'Tu meta description'
   })
   url = 'file:///path/to/scripts/og/og-template.html#' + params
   subprocess.run(['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
     '--headless=new','--disable-gpu','--hide-scrollbars','--window-size=1200,630',
     '--virtual-time-budget=3000','--screenshot=/path/to/img/og/SLUG.png',
     '--default-background-color=00000000', url], check=True)
   "
   ```
3. Actualizar el HTML del post con las 4 etiquetas:
   ```html
   <meta property="og:image" content="https://www.trespuntoscomunicacion.es/img/og/SLUG.png" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   <meta name="twitter:image" content="https://www.trespuntoscomunicacion.es/img/og/SLUG.png" />
   ```
   (más `twitter:card` debe ser `summary_large_image`)
4. FTP del PNG a `/img/og/` + del HTML
5. **Purgar Cloudflare** (URL del HTML, NO la imagen — las imágenes nuevas no estaban cacheadas)

### Cómo regenerar TODAS de una vez
```bash
# 1. Generar todas las imágenes (~5 min, 102 páginas)
python3 scripts/og/generate-og.py

# 2. Actualizar las etiquetas en los 102 HTMLs
python3 scripts/og/update-html.py

# 3. Subir todo por FTP (102 PNG + 102 HTML, ~6 min)
bash scripts/og/ftp-upload.sh

# 4. Purgar Cloudflare (Purge Everything)
```

### Validar OG en producción
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/ (forzar Re-fetch si cachea vieja, ~7 días TTL)
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/ (también para WhatsApp y Telegram)
- **X/Twitter Card Validator**: https://cards-dev.twitter.com/validator (deprecado pero útil)

### Reglas críticas
- **NUNCA** acortar precisión decimal de los paths SVG del logo — usar SIEMPRE el SVG completo de `/img/logo-trespuntos-dark.svg`
- **NUNCA** apuntar `og:image` a un archivo que no exista en producción (rompe previews en redes)
- **SIEMPRE** dimensiones declaradas (`og:image:width=1200`, `og:image:height=630`) — ayuda a render rápido
- **SIEMPRE** `twitter:card=summary_large_image` (no `summary` que da tarjeta pequeña)
- **SIEMPRE** URL absoluta en `og:image` (con `https://www.trespuntoscomunicacion.es/...`)
- **NUNCA** modificar la plantilla `og-template.html` sin regenerar TODAS las imágenes (deuda visual entre páginas)
- Si añades una página nueva fuera del local repo (FTP directo): descargar el HTML, generar OG, parchearlo, re-subir
- El logo correcto es `logo-trespuntos-dark.svg` (3 anillos mint con centros blancos `#f8f8f8`) — NO el `logo-trespuntos-light.svg` (centros oscuros, para fondos claros)

### Estado actual (2026-04-29)
- ✅ 102 imágenes OG generadas y subidas a `/img/og/`
- ✅ 102 HTMLs actualizados con `og:image`, `twitter:image`, `og:image:width/height`, `twitter:card=summary_large_image`
- ✅ `og-default.jpg` reemplazado con versión correcta (logo dark)
- ✅ Cloudflare purgado, todo verificado en producción
- ✅ Scripts en `/scripts/og/` (no en `/tmp`, persistentes en repo)

### Pendientes Sistema OG
- Crear skill `/og-generate {ruta}` que ejecute el flujo completo para una página nueva (generar + actualizar HTML + FTP + recordatorio purga). Reduciría el setup futuro a 1 comando
- Añadir hook `PostToolUse` que detecte cuando se crea un nuevo `blog/{slug}/index.html` o `casos-de-negocio/{slug}/index.html` y sugiera regenerar OG
- Convertir PNG a JPG (~50% más pequeño) si Lighthouse o PSI detectan los OG como problema de bytes (poco probable, no se cargan en página, solo al compartir)
- Variantes A/B: probar otra disposición (logo abajo en lugar de arriba, título más grande sin subtítulo) para ver si mejora CTR en redes

---

### Cambios aplicados (2026-05-17) — Crisis Airtable API + diagnóstico real + sanitización Playwright Auditor

#### Contexto del incidente
El formulario CTA dejó de guardar leads en Airtable. Email de Airtable confirmando `PUBLIC_API_BILLING_LIMIT_EXCEEDED` para el workspace "Leads" — la cuota free de 1.000 calls/mes se agotó a mitad de mayo. Telegram + email backup seguían funcionando, pero los leads no se persistían en Airtable.

#### Fix inmediato (estabilización en 5 min)
Pipeline v2.5 (`fxiAWMB3S0eWc1aM`) → ambos nodos Airtable (`Guardar en Airtable` + `Guardar AT Briefing`) ahora tienen `continueOnFail: true`. Esto garantiza que aunque Airtable devuelva 429:
- Telegram a Jordi se dispara siempre
- Email backup se dispara siempre
- Nada se pierde de cara al equipo, solo no queda en Airtable hasta que se resetee la cuota el 1 de junio

#### Investigación: por qué se agotaron 1.000 calls a mitad de mes
Tras descartar las opciones obvias (upgrade Airtable Team = $80/mes por 4 workspaces, migración a NocoDB = 16-24h, migración a Supabase = 8-12h, CRM open-source = mucho trabajo), se hizo auditoría forense del consumo real:

**🚨 Smoking gun identificado:** Workflow `8XoipUHvtokIaiw5` "🔍 Playwright Auditor — Lead Audit + Drive" — creado 2026-05-03, activo.
- Cron: `*/5 * * * *` (cada 5 min, 24/7)
- Hacía `GET filterByFormula` a `tblqbhaPtZlsPbsYs` **incondicionalmente** en cada tick
- = **288 calls/día = ~8.640 calls/mes** él solo
- Agotaba el plan free en 3-4 días sin que nadie se diera cuenta

**Conclusión clave:** NO había que migrar nada. El sistema funcionaba bien; un workflow loco quemaba la cuota innecesariamente. Documento `MIGRATION-AIRTABLE-NOCODB.md` queda en el repo como referencia para futuro, pero **NO ejecutar** hasta que de verdad se necesite (cuando se llegue al límite real de Airtable Team plan, lo cual no pasará en años).

#### Sanitización aplicada al Playwright Auditor (2026-05-17)
Vía MCP n8n, 5 operaciones atómicas:

1. **Cron** `*/5 * * * *` → `0 9 * * 1-5` (1x/día lun-vie 9:00 Madrid) = 99,7% reducción de calls
2. **PAT Airtable hardcoded eliminado** de los 4 nodos HTTP Request (`Listar pendientes`, `Marcar 'En curso'`, `Update OK`, `Update Error`). Ahora usan credencial nativa:
   ```json
   "parameters": { "authentication": "predefinedCredentialType", "nodeCredentialType": "airtableApi" }
   "credentials": { "airtableApi": { "id": "zQer745cZNd0kQyb", "name": "airtableApiKey" } }
   ```
3. Workflow reactivado tras los cambios. Primera ejecución: lunes 2026-05-18 a las 9:00 Madrid.

#### Funcionalidad del Playwright Auditor (preservada)
Cuando Jordi marca `Auditar=true` en un lead de Airtable con URL Web válida, este workflow:
- Llama al runner Playwright (`172.17.0.1:8090/audit`)
- Extrae: Core Web Vitals (LCP/FCP/TTFB/CLS), CMS, stack tecnológico, sector, hero copy (H1/sub/CTA), UX checks (h1 count, forms, CTAs above-fold, imágenes sin alt), screenshots desktop+mobile
- Sube screenshots a Google Drive (folder `1LB5JXB7uj_hPwDgnTDDfxwV8fLfWJw0n`)
- Rellena Airtable con CMS, Stack, Hero, Sector, Notas estructuradas, status=Hecha
- Notifica por Telegram al chat `7313439878`

Antes: poll cada 5 min buscando leads pendientes (la mayoría de polls no encontraban nada). Ahora: 1 poll/día. La auditoría real funciona igual.

#### Hallazgos críticos de sanitización (discrepancias con la tabla de la sección "Sanitización n8n")
Durante la búsqueda del patrón correcto de credencial Airtable, se descubrió que **al menos 2 workflows marcados ✅ NO están realmente sanitizados**:
- **`BLcLAnrGcwUYyDJf` (Kobe)** — sigue con PAT Airtable + Anthropic + Telegram hardcoded
- **`ofNEs2v9y3angTDz` (WF3 Partner Envío)** — credencial adjunta pero `authentication: "none"` + Bearer hardcoded simultáneamente (credencial inerte)

Documentado en la sección "Sanitización n8n" del propio CLAUDE.md (avisos 4 y 5).

**El patrón verificado funcionando** (de `SRai7Mly38uCOVO7` WF6, nodos "Leer Agencias AT" + "Crear en Airtable"):
- `authentication: "predefinedCredentialType"`
- `nodeCredentialType: "airtableApi"` (no `airtableTokenApi`)
- Key en `credentials` block es `airtableApi`, value: `{ id: "zQer745cZNd0kQyb", name: "airtableApiKey" }`
- **Sin** header `Authorization`. GET: `sendHeaders: false`. POST/PATCH: `sendHeaders: true` con solo `Content-Type`

#### Otros cómplices menores detectados (no fixados aún)
- **Dashboard frontend auto-refresh**: `setInterval(initDashboard, 5 * 60 * 1000)` cada 5 min. Si Jordi deja el dashboard abierto = ~96 refreshes/día × 9 endpoints Airtable. Cache TTL default 60s no es suficiente.
- **TTLs faltantes** en `CACHE_TTL_BY_PATH` (`/root/server.py`): `/api/leads`, `/api/pipeline`, `/api/form-leads`, `/api/auditorias`, `/api/revision` usan default 60s. Deberían ser 600-900s.
- **`_pipeline()` con `maxRecords=500`** = paginación de 5 calls Airtable por refresh.
- **Reporte Diario Partners (`HriQqHjDRZWxxSMo`)** — hace 3 GETs secuenciales donde 1 bastaría.

#### Documentos generados/actualizados
- `MIGRATION-AIRTABLE-NOCODB.md` (raíz del repo) — plan completo de migración por si en el futuro se necesita. Incluye evaluación de 3 alternativas (Supabase, NocoDB, Airtable Team), apéndices con scripts de extracción de schema y backup, estrategia dual-write. **Estado: archivado como referencia, NO ejecutar**.

#### Estado final del consumo Airtable
- Antes: ~350-450 calls/día (~10.500-13.500/mes)
- Después: ~50 calls/día (~1.500/mes) si no se aplican optimizaciones adicionales
- Tras aplicar TTLs en server.py + reducir auto-refresh: <30 calls/día (~900/mes) → **dentro del plan free**

#### Pendientes derivados (para próximas sesiones, no urgentes)
1. **Aplicar TTLs en `server.py`** del VPS:
   ```python
   '/api/leads': 600, '/api/pipeline': 600, '/api/form-leads': 600,
   '/api/auditorias': 900, '/api/revision': 900
   ```
2. **Subir auto-refresh frontend** en dashboard.html de `5 * 60 * 1000` a `15 * 60 * 1000`
3. **Re-sanitizar Kobe + WF3** (PAT hardcoded confirmado, mienten en la tabla ✅)
4. **Auditar el resto de los 11 "✅ sanitizados"** — la metodología del 2026-05-03 no fue 100% fiable
5. **Crear env var `TELEGRAM_AUDITOR_BOT_TOKEN`** en Dokploy si se quiere migrar también el bot del Auditor (`8706170609:...`, distinto del principal `8749982652:...`)
6. **Optimizar `_pipeline()`** para no paginar 500 records si no es necesario (probablemente `maxRecords=100` basta para el KPI mostrado)

---

### Cambios aplicados (2026-05-19) — Microsoft Clarity: instalación, embudos y Smart Events

#### Sustitución Hotjar → Microsoft Clarity
- **Motivo**: Hotjar no tiene API útil (solo lookup/deletion y survey responses). Clarity es gratuito, ilimitado en grabaciones y tiene integración nativa con GA4.
- **Tracking ID**: `wt7lglwv95`
- **Instalación**: self-hosted vía CookieConsent v3, cargado en `onAccept` de la categoría `analytics` (igual que GA4). Hotjar eliminado del código.
- **`assets/cookieconsent/cookieconsent-init.js`**: reemplazado bloque `hotjar` por `clarity` en `services`. Descripción en preferencias actualizada.

#### Configuración en el panel de Clarity
- **Bloqueo de IP**: `85.51.255.66` (IP de Jordi) — excluida del tracking
- **Enmascaramiento**: Equilibrado (oculta inputs sensibles, respeta GDPR)
- **GA4 integrado**: propiedad `G-ERX855WTHN` ya conectada (marcada en onboarding)

#### Embudos configurados (2)
| Nombre | Pasos |
|---|---|
| Conversion Principal - Formulario | Home → Iniciar Proyecto → Gracias - Conversión |
| Blog hacia Conversión | Blog → Iniciar Proyecto → Gracias - Conversión |

#### Smart Events instrumentados (aparecen en Clarity → Eventos de API tras 24-48h)
Los eventos se disparan con `window.clarity('event', nombre)` **solo si el usuario aceptó cookies analíticas**:

| Evento Clarity | Trigger | Archivo |
|---|---|---|
| `cta_navbar_click` | Click en `.nav-cta` ("Cuéntanos tu proyecto") | `cookieconsent-init.js` (listener delegado) |
| `form_submit_click` | Click en `#form-submit-btn` ("Enviar mensaje") | `cookieconsent-init.js` (listener delegado) |
| `scroll_75_pct` | Scroll ≥ 75% de la página | `cookieconsent-init.js` (scroll listener pasivo) |
| `jordan_open` | Apertura del widget Jordan (modo flotante) | `jordan-widget-v7.js` — método `open()` |

**Pendiente**: cuando los eventos aparezcan en el panel (tras primeras visitas reales), crear los Smart Events desde Clarity → Configuración → Eventos inteligentes → Eventos de API seleccionando cada nombre.

---

### Cambios aplicados (2026-05-23) — Recuperación post-migración SEO + sanitización n8n + optimización Airtable

#### 1. Diagnóstico de la caída de clicks (-23.8% GSC)
Investigación profunda con 5 agentes paralelos (datos GA4/GSC, auditoría técnica, Semrush, Airtable quota, -73% generate_lead real). Conclusión clave: **NO es un problema de UX, performance ni off-page. Es upstream — menos tráfico orgánico llegando al funnel**. Cuadra con −24% GSC clicks y `form_start` estable + `generate_lead` -73% (los pocos que llegan, convierten igual; simplemente llegan menos). Performance Lighthouse 100/100/100 mobile, LCP 1.6s, CLS 0. Backlinks +15% MoM, Authority Score estable, Site Health Semrush 84% (+6%).

**Causas concurrentes identificadas:**
- 16 URLs `/sectores/*` con `noindex,nofollow` listadas en `sitemap.xml` — Google recibía señales contradictorias y malgastaba crawl budget (correcto que tengan noindex, son campaña outreach, pero NO debían estar en sitemap)
- `sitemap.xml` con 108 URLs vs 229 `index.html` locales — desfase ~52%
- 2 URLs 301 listadas en sitemap (consolidación tendencias-de-desarrollo → tendencias-de-diseño)
- Title home y meta desc poco transaccionales (post fix canibalización 17-abr) → CTR cayó pese a que position MEJORÓ (15,0 → 13,2)
- Query "desarrollo web a medida" (1.868 imp/mes, pos 11.2, 1 click) sin ataque específico
- `lastmod` del sitemap desactualizado (Google no detecta cambios rápido)
- Workflow `Pipeline v2.5` con nodos Airtable sin `retryOnFail` + cuota Airtable 429 desde 17-may

#### 2. Cambios SEO aplicados (commit `bdca9c0`)
| Archivo | Cambio |
|---|---|
| `index.html` (home) | Title → `Agencia UX/UI Barcelona — Diseño y Desarrollo Web a Medida · Tres Puntos` + meta desc más transaccional. Reconciliación FTP→git de cambios que se habían aplicado por FTP el 23-may sin commit. **⚠️ REVERTIDO el 1-jun (commit `e8cbb05`): este cambio violaba la regla de descanibalización del 17-abr y fue smoking gun de la caída -43% clicks GSC. Ver sección "Cambios aplicados (2026-06-01)".** |
| `blog/el-efecto-einstellung/index.html` | Title → `El Efecto Einstellung: Qué es y cómo afecta al diseño UX | Tres Puntos`. Idem reconciliación. |
| `sitemap.xml` | 108 → 95 URLs. Excluidos 16 sectores + 2 URLs 301. Añadidos 4 casos faltantes (`1csoft`, `capilclinic`, `naranja`, `paradise`) + 1 legal (`politica-redes-sociales`). `lastmod` regenerado desde `git log` por archivo. |
| `servicios/desarrollo-web-a-medida-barcelona/index.html` | +123 líneas. Nueva sección "Alcance del servicio" (~350 palabras) entre `sp-fit` y `sp-marquee` con copy específico para query nacional "desarrollo web a medida" (sin mencionar Barcelona en el copy nuevo). Schema FAQPage extendido de 5 → 8 preguntas, incluyendo "¿Trabajáis fuera de Barcelona?". Título y H1 sin tocar (preservar ranking pos 6 para query Barcelona). |
| `blog/desarrollo-web-a-medida-cuando-es-la-decision-correcta/index.html` | Enlace contextual con anchor "construir una plataforma a medida" (variado, no repite anchors existentes). |

#### 3. Deploy
- `git push origin main` ✅
- FTP a Nominalia (5 archivos) ✅
- Purga Cloudflare API (5 URLs específicas) ✅ — token `cfut_ExV6qS...` zone `86def687c657b92ed6ce30b0a2d16b66`
- robots.txt referencia sitemap correctamente
- **Pendiente Jordi:** re-submit manual en GSC https://search.google.com/search-console/sitemaps (Google ya no acepta `ping?sitemap=...` desde 2023)

#### 4. Hallazgo crítico de Airtable — cuota mensual agotada (mismo problema que 17-may)
- HTTP 429 desde 17-may en el nodo `Guardar en Airtable` del Pipeline v2.5
- Consecuencia: leads del form NO se guardan en Airtable. Pero Telegram + email SÍ llegan (`continueOnFail: true` ya estaba)
- Esto explica los 3 leads Airtable en 30d post vs 11 pre. NO es bug del form ni del tracking.
- **Diagnóstico de consumo (agente Airtable):** ~24.000 calls/mes (cuota free 3.000 en 3 workspaces) = 8x sobre cuota
- Top consumidores: `/api/sectores` (4.300/mes), `/api/sequences` (3.600/mes), 2 crons cada 1h (~5.800/mes combinados)

#### 5. Optimizaciones Airtable aplicadas (1h trabajo, $0 vs $480/año upgrade)
**A) `server.py` del VPS (`/root/server.py`):**
- TTL `/api/sectores` 180 → **1800s**
- TTL `/api/agencies` 180 → **1800s**
- TTL `/api/sequences` 180 → **1800s**
- TTL `/api/leads` 180 → **600s**
- TTL `/api/linkedin` 180 → **600s**
- Añadidos endpoints faltantes: `/api/form-leads: 600`, `/api/pipeline: 600`, `/api/revision: 900`, `/api/auditorias: 900`
- Backup en `/root/server.py.bak-2026-05-23`
- Servidor reiniciado (PID nuevo: 2828082)

**B) `dashboard.html` del VPS (`/root/dashboard.html`):**
- `setInterval(initDashboard, 5 * 60 * 1000)` → `15 * 60 * 1000` (línea 6356)
- Backup en `/root/dashboard.html.bak-2026-05-23-ttl`

**C) Crons de workflows n8n:**
- `4DeHrw1yL4kVMsCZ` (Sectores Detección Respuestas): cron 1h → `0 9-19/2 * * 1-5` (cada 2h L-V horario laboral, nodo renombrado "Cada 2h L-V 9-19")
- `JoeLRJRwoV9HCDnX` (Email Recordatorio): cron 1h → `0 9,16 * * 1-5` (2x/día L-V, nodo renombrado "2x/día L-V (9 + 16)")

**Estimación ahorro total:** 24.000 → <3.000 calls/mes (dentro de cuota free).

#### 6. Workflow `Pipeline v2.5` — resiliencia añadida
3 nodos HTTP Airtable (`guardar-airtable`, `guardar-at-briefing`, `guardar-estado`):
- **Añadido `retryOnFail: true` + `maxTries: 3` + `waitBetweenTries: 5000ms`** — para que próximos 429 no rompan el flujo en 1 intento
- `continueOnFail: true` ya estaba
- **PAT sigue hardcoded** — intenté migrar a credencial nativa `airtableApi` (id `zQer745cZNd0kQyb`) pero ese tipo solo aplica al nodo nativo `n8n-nodes-base.airtable`, NO al `n8n-nodes-base.httpRequest`. Para sanitización real hay que crear una credencial `httpHeaderAuth` separada — pendiente.

#### 7. Guard `is_test: true` añadido al Pipeline v2.5
Replicado el patrón del workflow Jordan v7.3 para evitar que tests futuros spammeen Telegram/email a Jordi:
- `Mapear datos lead` (Code): añadido `is_test: !!body.is_test, test_triggers: Array.isArray(body.test_triggers) ? body.test_triggers : []` al output
- `Preparar Telegram` (Code): prepend `if ($('Mapear datos lead').first().json.is_test === true) return [];`
- `Preparar Email Bienvenida` (Code): idem
- `Preparar Telegram Research` (Code): idem
- `Preparar TG Briefing` (Code): idem
- `Preparar Telegram Exit Intent` (Code): idem
- **Test confirmado:** un `POST` con `is_test: true` ejecuta el workflow, pero los 5 nodos Code de notification devuelven `[]` y NO se mandan ni Telegram ni email
- **Pendiente:** añadir un nodo IF antes de `Email Backup Jordi` (emailSend) — actualmente sigue mandando 1 email/test. Es nodo no-Code, requiere cambio estructural

#### 8. Playwright Auditor (`8XoipUHvtokIaiw5`) — diagnosticado, no fix
- 8+ ejecuciones consecutivas en error desde 17-may
- Causa: mismo `PUBLIC_API_BILLING_LIMIT_EXCEEDED` (Airtable 429) en el nodo `Airtable — Listar pendientes`
- Se resolverá automáticamente el 1-jun con reset de cuota
- Nombre histórico del nodo "Schedule cada 5 min" pero cron real ya optimizado a `0 9 * * 1-5` (1x/día L-V 9:00 Madrid) según CLAUDE.md sanitización 2026-05-17

#### 9. Lecciones aprendidas
1. **NUNCA hacer curl sin cache-bust al verificar deploys.** Durante 30 minutos di al usuario información incorrecta porque Cloudflare cachea HTML 4h. Solución obligatoria: `curl "URL?v=$(date +%s)" -H "Cache-Control: no-cache"` cuando se verifica producción.
2. **Webhook responde 200 != lead guardado.** Pipeline v2.5 responde 200 OK aunque Airtable 429. El frontend dispara `generate_lead` en GA4 de igual modo. Los números GA4 no mienten — la caída es real, no de instrumentación.
3. **Patrón verificado funcionando para credencial Airtable** (de CLAUDE.md sanitización 2026-05-17) aplica al nodo nativo `n8n-nodes-base.airtable`, NO al `n8n-nodes-base.httpRequest`. Para HTTP se necesita credencial `httpHeaderAuth` o `airtableTokenApi` con id distinto al `airtableApi`.
4. **Curry (otro agente IA)** editó archivos por FTP directo sin commit en git el 23-may. Riesgo de pérdida de cambios en deploys futuros desde local. Patrón a evitar: toda edición en producción debe pasar por git primero.

#### 10. Pendientes derivados (no urgentes)
- Re-submit manual del sitemap en GSC (1 min)
- Borrar manualmente los 14 mensajes Telegram + 7 emails de test del 23-may (todos contienen "BORRAR" en subject)
- Migrar 3 nodos HTTP Airtable del Pipeline v2.5 a credencial `httpHeaderAuth` para eliminar PAT hardcoded
- Añadir nodo IF antes de `Email Backup Jordi` para que `is_test:true` también lo silencie
- Auditar el resto de los workflows "✅ sanitizados" según pendiente del 17-may
- Re-validar `Pipeline v2.5` con tráfico real tras 1-jun (cuota Airtable reset) y verificar que retries funcionan

---

### Cambios aplicados (2026-05-27) — Cloudflare Web Analytics (analytics cookieless complementario a GA4)

#### Contexto del diagnóstico (con Jordi)
Jordan (agente) reportó que "GA4 está completamente ausente del sitio" y propuso añadir snippet `gtag` a `components.js`. **Diagnóstico falso**. Verificado:
- GA4 SÍ está instalado vía `assets/cookieconsent/cookieconsent-init.js` (línea 106, ID `G-ERX855WTHN`)
- Carga condicional en `onAccept` de categoría analytics (Consent Mode v2)
- Test E2E con Playwright: GET `gtag/js?id=G-ERX855WTHN` + POSTs a `region1.google-analytics.com/g/collect` confirmados tras aceptar cookies
- Snippet propuesto por Jordan habría provocado: doble carga GA4 (eventos contados 2x) + violación GDPR (carga sin consent)

**Causa real de los "66 usuarios"** (auditoría en GA4 con Claude_in_Chrome):
- Propiedad: `TresPuntos.es - GA4` (392606096), cuenta `Tres Puntos comunicac...`
- **Curva 90 días**: escalón vertical claro alrededor del 10-abril (de ~125 a ~50 usuarios/día) que coincide EXACTAMENTE con la migración Cookiebot → CookieConsent v3 (2026-04-10, ver sección de ese día)
- **Firma matemática del consent**: `first_visit = 1.080 ≈ usuarios totales 1.092 (98,9%)`. Imposible en un sitio normal — significa que la cookie `_ga` no persiste para casi nadie (no aceptan analytics)
- **Discrepancia GA4 vs GSC**: GSC 67 clicks/28d vs GA4 18 Organic Search/28d → factor 3,7x perdido por consent
- **Anomalía secundaria**: Direct = 789 (66%) vs Organic Search = 247 (21%) en 90d — sugerir investigar `Referrer-Policy` en Cloudflare o tracking de UTMs en próximas iteraciones

#### Decisión: Cloudflare Web Analytics como complemento gratuito
Tras descartar (todas evaluadas con Jordi):
- ❌ Volver a Cookiebot con GA4 inline (ILEGAL, multas AEPD €20K-50K)
- ❌ Cambiar a otro plugin (Iubenda/Termly/Borlabs) — mismo problema, distinto plugin
- ❌ Plausible cloud (€9/mes — Jordi prefiere 0€)
- ❌ Matomo self-hosted (overkill, 4GB+ RAM)
- ❌ Umami self-hosted (más complejo, requeriría 1-2h setup VPS)
- ❌ Behavioral Modeling GA4 (requiere ≥1000 usuarios/día con denied + ≥1000 granted — Tres Puntos no llega ni de lejos)
- ✅ **Cloudflare Web Analytics**: gratis, sin límite tráfico, sin cookies, legal sin consent (Recital 30 GDPR), nativo en CF ya activo

#### Implementación realizada
**Activación CF Web Analytics**:
- Account ID: `8a58fd1f69f97772a5143d9d58313c56`
- Hostname: `www.trespuntoscomunicacion.es`
- Modo: **Manual** (CF no ofreció Automatic Setup, posiblemente por las Cache Rules existentes)
- **Token CF Web Analytics**: `35d1d72046854c3fb1c6a1781afc7203`

**Edit `js/components.js` línea 1** (prepend antes del IIFE `var TP=...`):
```js
/* Cloudflare Web Analytics — cookieless, sin consent (RGPD-compliant). Token activado 2026-05-27 */
(function(){var s=document.createElement('script');s.defer=true;s.src='https://static.cloudflareinsights.com/beacon.min.js';s.setAttribute('data-cf-beacon','{"token": "35d1d72046854c3fb1c6a1781afc7203"}');document.head.appendChild(s);})();
```

**Características técnicas**:
- Inyección dinámica del beacon al `<head>` cuando carga `components.js`
- `defer=true` → no bloquea render
- Sin cookies persistentes → sin banner consent (legal en UE)
- Sin payload añadido al HTML (no toca los 89 HTMLs)
- Hash diario de IP del lado server-side de CF — anonimizado
- Métricas: page views, visitantes únicos, top pages, sources, devices, countries, Core Web Vitals
- Retención plan free: 30 días en dashboard

**Deploy**:
- Commit `4d897b5` con mensaje `feat(analytics): añadir Cloudflare Web Analytics (cookieless, sin consent)`
- Push a `origin/main` ✓
- FTP a Nominalia (`/js/components.js`, 48.011 bytes, HTTP 226) ✓
- **Cloudflare purge crítico — lección aprendida**: el HTML carga `components.js?v=27` (con query string). CF cachea URLs con query como entradas separadas. La primera purga de `/js/components.js` sin query NO funcionó. Hay que purgar **ambas**: `?v=27` Y sin query. Fix aplicado.
- Verificación E2E Playwright en `/contacto/`:
  - Script en DOM ✓
  - GET `static.cloudflareinsights.com/beacon.min.js` → 200 ✓
  - POST `cloudflareinsights.com/cdn-cgi/rum` → 204 ✓ (hit real registrado)

#### Filosofía: por qué GA4 + CF Web Analytics y no solo uno

**GA4** (cuando usuario acepta cookies analytics):
- ✅ Eventos custom complejos (generate_lead, jordan_open, calendly_click, etc.)
- ✅ Funnels y conversiones con value EUR
- ✅ Atribución cross-device
- ✅ Measurement Protocol server-side
- ❌ Solo mide ~50% del tráfico real (consent rate baja)

**CF Web Analytics** (siempre, sin consent):
- ✅ 100% del tráfico real
- ✅ Métricas básicas (pageviews, sources, countries, devices, CWV)
- ✅ Gratis ilimitado
- ✅ Privacy-first nativo
- ❌ Sin eventos custom complejos
- ❌ Sin atribución avanzada
- ❌ Retención 30 días en plan free

**Combinación**: GA4 da profundidad de quien consintió; CF da volumen total real. Para ver "cuánto tráfico tengo de verdad" → CF. Para "cómo convierte ese tráfico" → GA4.

#### Dashboard CF Web Analytics
`https://dash.cloudflare.com/8a58fd1f69f97772a5143d9d58313c56/web-analytics`

Primeros datos visibles: 30 min - 2h tras activación. Datos completos del día a 24h.

#### Lecciones aprendidas
1. **Cloudflare Dashboard NO carga con la extensión Claude_in_Chrome**. El SPA detecta browser controlado y se queda en loader infinito (probado con Chrome MCP y waits de 60s). Para configurar CF Web Analytics u otras secciones del dashboard: pedir a Jordi que abra en su Chrome real, o usar API de CF cuando exista endpoint y el token tenga permisos suficientes. El token actual (cache purge only) NO sirve para activar Web Analytics — requiere `Account → Web Analytics: Edit`.
2. **Cache Cloudflare con query strings**: una purga de `https://www.trespuntoscomunicacion.es/js/components.js` NO purga `https://www.trespuntoscomunicacion.es/js/components.js?v=27`. Son entradas separadas en el cache edge. Cuando se actualice un asset versionado, purgar TODAS las URLs posibles (con y sin query) o usar `purge_everything`.
3. **Diagnóstico antes de fix**: Jordan propuso un fix de 10 líneas basado en una premisa falsa ("GA4 ausente") que habría empeorado la situación (doble tracking + ilegalidad). 2 minutos de verificación con `grep -r "G-ERX855WTHN"` + test E2E hubieran bastado para descartarlo. Patrón a evitar en agentes: nunca proponer fixes sin verificar la premisa contra código real.

#### Pendientes derivados
- Aplicar mismo snippet a `dash.trespuntos-lab.com` y `doc.trespuntos-lab.com` si se quieren métricas unificadas
- Investigar anomalía **Direct = 66%** en GA4: revisar `Referrer-Policy` header (CF Rules + meta), verificar UTMs en campañas activas (link tracking partners outreach)
- Activar Behavioral Modeling en GA4 (Admin → Configuración de datos → Consent) — cuando el tráfico crezca, GA4 estimará usuarios cookieless con ML
- Actualizar política de cookies (`/politica-cookies/`) si se quiere mencionar CF Web Analytics como "estadística agregada sin identificación" — no es estrictamente requerido (es cookieless) pero da transparencia
- A los 30 días: comparar números CF vs GA4 vs GSC para validar el factor multiplicador real

---

### Cambios aplicados (2026-06-01) — SEO recovery: revert errores propios del 23-may + diagnóstico profundo

#### Contexto del diagnóstico
Curry (agente SEO) reportó el 1-jun caída -43% clicks GSC (114→65) y caída de keywords clave: `desarrollo web a medida barcelona` pos 1 → 10.1, `agencia ux ui barcelona` pos ~3 → 6.2, CTR colapsado 0.4 → 0.3. Jordi pidió análisis profundo: por qué desde el cambio de web todas las métricas van mal.

Investigación coordinada con 2 agentes paralelos (Lighthouse + on-page audit top 10 URLs) + API VPS (`/api/gsc` y `/api/web` desde `dash.trespuntos-lab.com`). Diagnóstico:

**Caída GA4 real más severa que la GSC:**
- Sessions 30d: 355 → 184 (**-48%**)
- Users: 224 → 67 (**-70%**)
- Pageviews: 672 → 479 (-29%)
- `generate_lead`: 11 → 3 (-73%)
- `jordan_lead_captured`: 34 → 1 (-97%, descartado bug del widget tras confirmar lead entrante el 31-may → caída es proporcional al tráfico upstream)

**5 causas raíz identificadas + impacto:**
1. 🚨 **Title HOME violó la regla de descanibalización del 17-abr** (sec "Cambios aplicados 2026-04-17"). El 23-may yo cambié el title de la home a `Agencia UX/UI Barcelona — Diseño y Desarrollo Web a Medida · Tres Puntos`, reintroduciendo "Desarrollo Web a Medida" donde el propio CLAUDE.md decía explícitamente: *"NUNCA poner 'desarrollo web' en titles de páginas que no sean la de servicio de desarrollo web"*. Smoking gun de la caída de "desarrollo web a medida barcelona" pos 1 → 10.1.
2. 🚨 **Sitemap con lastmod uniforme** (también error mío del 23-may): regeneré las 89 URLs con `lastmod: 2026-05-21` masivamente desde `git log`. Google penaliza patrones de lastmod idéntico = señal de manipulación. Afectaba a TODA la web simultáneamente.
3. 🟠 **Canonical bug en post `/blog/tendencias-ux-ui-2026-...-predictivo-y-la-eficiencia-tecnica/`**: apunta a OTRO post (`/blog/tendencias-de-diseno-web-2026-rendimiento-ux-y-conversion/`). Posible consolidación intencional sin 301 en `.htaccess` o bug. **Pendiente decisión Jordi.**
4. 🟡 **6 páginas ciudad clonadas (90%+ HTML idéntico)**: `/servicios/desarrollo-web-{mad,bil,sev}/` + `/servicios/diseno-ux-ui-{mad,bil,sev}/`. Sin tráfico en GA4 (0 sessions/30d en top 20). Diluían autoridad de las versiones Barcelona.
5. 🟡 **Cache HTML Cloudflare 14400s (4h)** sobre HTML: retrasa que Googlebot vea cambios de title/meta durante recovery. **Pendiente bajar a 1h en CF panel (Jordi).**

**Auditoría Lighthouse en paralelo confirmó:**
- Performance OK en 3 URLs críticas (LCP 0.4-1.5s mobile, CLS 0-0.039, SEO score 100/100/100). El problema NO es técnico.
- Hallazgos extra: sitemap incompleto (89 vs 229 HTMLs locales — investigar), `crawl-delay: 1` innecesario en robots.txt.

#### Acciones desplegadas en producción (4 commits)
| Commit | Acción |
|---|---|
| `d9bc03f` | Title + meta `/blog/como-mejorar-la-velocidad-de-carga-de-tu-sitio-web/` mejorados (CTR booster, acción 3 del reporte Curry) |
| `e8cbb05` | Revert title HOME → `Agencia UX/UI Barcelona \| Arquitectura Digital de Conversión · Tres Puntos` (versión pre-23-may) |
| `9bec812` | noindex en 6 páginas ciudad MAD/BIL/SEV + sitemap 95 → 89 URLs |
| `ce5e022` | Sitemap regenerado con lastmod real por archivo desde `git log -1 --format=%cI`: 1 fecha → 11 fechas únicas |

**FTP a Nominalia + purga Cloudflare URL-específica** tras cada commit. Verificación con `curl ?cb=$(date +%s) -H "Cache-Control: no-cache"` confirmó cambios en producción.

#### Acciones de Jordi en GSC (1-jun tras deploy)
- ✅ Sitemap re-submit en https://search.google.com/search-console/sitemaps (mostraba 95 páginas porque Google leyó la versión vieja antes de la purga; el primer re-submit pidió relectura)
- ✅ Reindex forzado de 3 URLs vía "Inspección de URLs" + "Solicitar indexación": home, `/servicios/desarrollo-web-a-medida-barcelona/`, `/blog/como-mejorar-la-velocidad-de-carga-de-tu-sitio-web/`

#### Acciones pendientes Jordi (no urgentes)
- Bajar Cache Rule HTML en Cloudflare panel: 2-4h → **1h** (Caching → Configuration → Cache Rules → "Cache HTML estático" → Edge TTL 1 hour)
- Decidir canonical post `tendencias-ux-ui-2026-...predictivo`: ¿consolidación intencional (→ 301 en `.htaccess`) o bug (→ auto-canonical)?
- Confirmar qué cuenta GSC tiene verificada la propiedad. La sesión del Chrome "Work" (`hola@trespuntoscomunicacion.es`) NO tiene acceso. Probablemente verificada con `jordi@trespuntoscomunicacion.es` o `jordiexp@gmail.com`.

#### Tier 2 (para después del 15-jun si recovery confirmada)
- Reescribir meta `/blog/el-efecto-einstellung/` (hoy: extracto del artículo truncado con "...a la...")
- Acortar metas >160c en `/servicios/diseno-ux-ui-barcelona/` (183c) y `/servicios/` (178c)
- Title `/servicios/diseno-ux-ui-barcelona/`: añadir "UX/UI" literal (KW principal)
- Inventario canibalización blog tendencias 2026 (4 posts con keyword cercano)
- Investigar **Direct = 38% sessions** (70/184) — anomalía persistente desde mayo. Posibles causas: `Referrer-Policy` CF, UTMs perdidos en campañas, tráfico interno
- Investigar query "desarrollo web a medida" SIN ciudad: 1.791 imp/mes, pos 10.1, 1 click → mayor oportunidad nacional sin atacar
- Auditar **sitemap incompleto** (89 vs 229 HTMLs locales): `git ls-files '*.html'` vs sitemap, decidir indexar/410

#### KPIs a vigilar 2026-06-15 (validar recovery)
| Métrica | 1-jun | Objetivo 15-jun | Cómo medir |
|---|---|---|---|
| `desarrollo web a medida barcelona` pos | 10.1 | 1-3 | GSC > Rendimiento > Consultas |
| `agencia ux ui barcelona` pos | 6.2 | 3 | idem |
| GSC clicks 30d | 65 | ≥90 | `curl -sk https://dash.trespuntos-lab.com/api/gsc` |
| GSC CTR | 0.3% | ≥0.4% | idem |
| GA4 sessions 30d | 184 | ≥250 | `curl -sk https://dash.trespuntos-lab.com/api/web` |
| `jordan_lead_captured` | 1/30d | ≥10 | idem (subirá con tráfico upstream) |

Si en 15-jun no recupera al menos el 50% de lo perdido → escalada: URL inspection masiva en GSC + reescritura de contenido más agresiva.

#### Lecciones aprendidas
1. **NO modificar titles de la home sin re-verificar la regla de descanibalización del 17-abr**. El cambio "supuestamente correctivo" del 23-may rompió una optimización previa. Antes de cualquier cambio de title/H1 en home o en servicios, releer la tabla del bloque "Cambios aplicados (2026-04-17)" donde se documentó qué keyword es dueña de qué página.
2. **NO regenerar lastmod del sitemap en bloque masivamente**. Si se hace mass-update, mantener fechas reales por archivo (último commit que tocó CADA index.html, no la fecha del último update del sitemap). Patrón uniforme = señal de spam para Google.
3. **Análisis "todo va mal" ≠ todo va mal**. Cuando una métrica cae, hay que diferenciar entre causas estructurales (consent rate post CookieConsent v3) y eventos concretos (mis cambios mayo). El segundo es lo que hay que arreglar; el primero se asume como contexto.
4. **GA4 con consent rate 50% sub-reporta**. Comparar siempre CF Web Analytics (cookieless, 100% del tráfico) contra GA4 para tener el número real. La caída -48% sessions GA4 puede ser -25% en CF Web Analytics — esto va a poder medirse a los 30 días del activate CF Web Analytics (27-may → datos completos disponibles 27-jun).
5. **El token Cloudflare vivo NO está en este CLAUDE.md**. Si hay un token literal `cfut_...` en una sección histórica de esta misma doc (sec 23-may), ya está caducado. Usar siempre el de `~/.config/tres-puntos/cloudflare.env` (campo `CF_API_TOKEN`) o el de `reference_cloudflare.md` en memoria — esos son la fuente de verdad.

---

### Cambios aplicados (2026-06-09) — SEO: noindex 12 ciudades restantes (cierre del recovery 1-jun)

#### Contexto
Informe SEO de **Jordan** (agente VPS, 9-jun) sobre GSC: clicks 30d 110→73 (−33,6%), impresiones 31.036→22.063 (−28,9%), posición media 14,2→13,0 (mejora leve). Lectura clave de Jordan: la caída no para tras la migración y siguen indexadas **doorway pages thin**.

#### Hallazgo real (validado contra repo)
El recovery del 1-jun solo noindexó 6 ciudades (desarrollo-web + diseno-ux-ui × MAD/BIL/SEV). Quedaron **12 clones sin tapar**, indexables y en sitemap: `consultoria-digital`, `design-engineer`, `ia-empresas`, `tienda-online` × {madrid, bilbao, sevilla}. ~79% de vocabulario compartido con la versión Barcelona → Google las lee como doorway pages que diluyen autoridad del dominio.

#### Acción desplegada (commit `16feb94`)
- 12 HTML: `+ <meta name="robots" content="noindex, follow">` tras el viewport (mismo patrón que el 1-jun).
- `sitemap.xml`: 90 → 78 URLs (eliminadas las 12; conservadas las 4 `-barcelona` como master indexable).
- FTP 13 archivos + purga Cloudflare by-URL (12 + sitemap) → `{"success": true}`.
- Verificación producción (cache-bust + no-cache): 12/12 sirven `noindex, follow` ✅; sitemap 78 `<loc>` sin las 12, 4 masters presentes ✅.
- **Pendiente Jordi:** re-submit del sitemap en GSC.

#### Lo que NO se hizo (y por qué) — corrección a Jordan
Jordan recomendaba cambiar el title de la home (`Arquitectura Digital de Conversión` por algo "más buscado"). **Descartado.** Ese title es justo el que se revirtió el 1-jun (commit `e8cbb05`): meter "Desarrollo Web a Medida" ahí fue el smoking gun de la caída −43% y viola la regla de descanibalización del 17-abr (la home es dueña de "agencia ux ui barcelona", no de "desarrollo web"). Tocarlo ahora reabriría la canibalización y reiniciaría el reloj del recovery (KPIs a medir 15-jun). Mismo patrón que el 27-may (Jordan y el falso "GA4 ausente"): **Jordan aporta buenos datos GSC pero no conoce el historial de decisiones SEO** — cruzar siempre con CLAUDE.md/memoria antes de aplicar sus propuestas de title/meta.

#### Otros puntos del informe Jordan (verificados)
- 404 `/servicios/diseno-ux-ui/` → **ya tiene 301** en `.htaccess` (línea 59 → `diseno-ux-ui-barcelona`). No es 404.
- Blog `...-ganador-2` → es la Parte II, artículo distinto con self-canonical correcto. No es duplicado real.
- "desarrollo web a medida" nacional (1.467 imp, pos 10.6, 1 click) → oportunidad real, queda Tier 2 tras confirmar recovery el 15-jun.
- ⚠️ Detectada de paso posible canibalización propia entre 3 páginas IA (`ia-empresas-barcelona`, `automatizacion-agentes-ia-empresas`, `ia-generativa-empresas`) — revisar aparte.

---

### Pendientes globales — Próximas tareas
- ✅ ~~Crear 4 páginas de servicios por ciudad~~ COMPLETADO (2026-03-27)
- ✅ ~~Formulario CTA inline en contacto~~ COMPLETADO (2026-03-27)
- ✅ ~~Contacto v3 con chat Jordan embebido~~ COMPLETADO (2026-04-01)
- ✅ ~~Página /iniciar-proyecto/ standalone~~ COMPLETADO (2026-04-01)
- ✅ ~~CTAs navbar/footer → /iniciar-proyecto/~~ COMPLETADO (2026-04-01)
- ✅ ~~Privacidad en chats (contacto + Jordan widget)~~ COMPLETADO (2026-04-01)
- ✅ ~~Seguridad Kobe workflow: migrar API keys a credenciales~~ COMPLETADO (2026-04-07): Airtable + OpenAI migrados. Telegram pendiente (requiere nodo nativo)
- ✅ ~~Páginas legales con contenido real del WP~~ COMPLETADO (2026-04-08): 4 páginas legales + Cookiebot en 89 páginas
- ✅ ~~Migrar Cookiebot → CookieConsent v3 self-hosted~~ COMPLETADO (2026-04-10): 89 HTMLs, Consent Mode v2, GA4 condicional
- ✅ ~~Fix FOUC + CLS 0.49~~ COMPLETADO (2026-04-10): CSS síncrono en 88 HTMLs, CLS 0.49 → 0.005
- ✅ ~~Tracking GA4 Paso 1 (13 eventos + helpers + conversiones)~~ COMPLETADO (2026-04-16): 13 eventos, 3 helpers, ga_client_id en payloads, 3 conversiones marcadas en GA4 admin
- ✅ ~~Analytics Paso 2 (dashboard + sync + Measurement Protocol)~~ COMPLETADO (2026-04-16): tabla web_metrics, endpoints /api/web + /api/web-sync, pestaña Web con 6 sub-secciones, workflow n8n hourly sync, nodo Measurement Protocol en leads-trespuntos
- ✅ ~~SEO: Fix canibalización "agencia ux ui barcelona" + redirects 301~~ COMPLETADO (2026-04-17): Ver sección "Cambios aplicados (2026-04-17)"
- ✅ ~~Fix UTM tracking end-to-end + limpieza código Supabase muerto~~ COMPLETADO (2026-04-21): Ver sección "Cambios aplicados (2026-04-21)"
- ✅ ~~Jordan widget v7: persistencia en 3 stages + fix Calendly bug + system prompt v10.2~~ COMPLETADO (2026-04-24): Ver sección "Cambios aplicados (2026-04-24)". Stages initial/update/final con upsert por Session ID. Fix del bug que perdía leads cuando el usuario clicaba Calendly. Iteraciones v7 → v7.1 → v7.2 tras feedback de tests reales.
- ✅ ~~Sistema OG (Open Graph) — imágenes para redes sociales en TODAS las páginas~~ COMPLETADO (2026-04-29): 102 imágenes 1200×630 PNG generadas con plantilla universal (logo dark + badge categoría + título + descripción), 102 HTMLs actualizados con `og:image`, `twitter:image`, dimensiones declaradas y `summary_large_image`. Ver sección "Sistema OG (Open Graph)". Scripts en `/scripts/og/`.
- ✅ ~~Microsoft Clarity: instalación + embudos + Smart Events instrumentados~~ COMPLETADO (2026-05-19): Hotjar reemplazado, 2 embudos creados, 4 eventos API instrumentados (cta_navbar_click, form_submit_click, scroll_75_pct, jordan_open). Ver sección "Cambios aplicados (2026-05-19)".
- ✅ ~~Recuperación SEO post-migración + sanitización n8n + optimización Airtable~~ COMPLETADO (2026-05-23): 5 archivos SEO (commit bdca9c0), guard is_test en Pipeline v2.5, TTLs server.py + dashboard auto-refresh + crons de 2 workflows reducidos. Ver sección "Cambios aplicados (2026-05-23)".
- ✅ ~~Cloudflare Web Analytics activado (cookieless, sin consent, complementario a GA4)~~ COMPLETADO (2026-05-27): snippet beacon en `components.js` línea 1, token `35d1d72046854c3fb1c6a1781afc7203`, deploy commit `4d897b5`, verificación E2E OK. Resuelve el "tráfico fantasma" perdido por consent rate baja desde la migración a CookieConsent v3 del 10-abr. Ver sección "Cambios aplicados (2026-05-27)".
- ✅ ~~SEO recovery: revert errores propios del 23-may + diagnóstico profundo~~ COMPLETADO (2026-06-01): 4 commits (`d9bc03f`, `e8cbb05`, `9bec812`, `ce5e022`). Title HOME revertido (smoking gun caída -43%), 6 páginas ciudad MAD/BIL/SEV con noindex, sitemap depurado (95→89) + lastmod real por archivo (1→11 fechas únicas), meta blog velocidad web mejorada. Sitemap re-submit + reindex 3 URLs forzado en GSC. Ver sección "Cambios aplicados (2026-06-01)" y memoria `project_seo_recovery_jun2026.md`. KPIs a vigilar 15-jun para validar recovery.
- ✅ ~~SEO: noindex 12 ciudades restantes (cierre recovery)~~ COMPLETADO (2026-06-09): commit `16feb94`. Detectado por informe de Jordan — 12 doorway pages (`consultoria-digital`, `design-engineer`, `ia-empresas`, `tienda-online` × MAD/BIL/SEV) seguían indexables tras el 1-jun. noindex + sitemap 90→78 + FTP + purga + verificado en producción. Title home NO tocado (Jordan lo recomendaba pero era re-introducir el error revertido el 1-jun). Ver sección "Cambios aplicados (2026-06-09)". Pendiente Jordi: re-submit sitemap GSC.
- Fix botón "Rechazar" del banner (sigue en mint, debería ser outline)
- Investigar discrepancia PSI público (67-69) vs Lighthouse local (95)
- Decidir qué hacer con loop `.htaccess` en `/servicios/` (preexistente)
- Replicar formulario inline de contacto en el resto de páginas (home, casos, servicios) — actualmente dependen de `TP.ctaForm()` que puede fallar
- Validar token Turnstile server-side en n8n (workflow leads-trespuntos)
- Añadir puntos verdes animados (como contacto) en secciones statement de TODOS los casos
- Mejorar animaciones de entrada en todos los templates (más "wow")
- Revisar spacing del hero centrado en TSH y Nomade Vans (título en 3 líneas, texto pegado)
- Kobe workflow: reemplazar nodo HTTP "Notificar Jordan" por nodo nativo Telegram (para eliminar token del URL)
- Configurar dominio en Cookiebot panel para que el banner aparezca en producción (trespuntoscomunicacion.es)
- Actualizar textos legales a RGPD/LOPDGDD (actualmente referencian LOPD 15/1999 del WP antiguo)
- **Sync Notion ↔ archivos locales (Cerebro Digital)** — SUPERSEDED. Ver nota abajo.

## Plan pendiente · Sync Notion ↔ Archivos locales (Cerebro Digital) — SUPERSEDED 2026-05-10

> **Estado: archivado como referencia.** Este plan fue absorbido por el doc *"Arquitectura de Contexto Tres Puntos — Git + Notion v1.0"* (2026-05-10), que propone una solución más completa.
>
> **Decisión 2026-05-10:** Tras revisar el doc nuevo, Jordi y Claudio acordaron NO ejecutarlo todavía — el coste (6-8h + mantenimiento) supera al beneficio actual (no hay ningún agente roto por contexto desactualizado, ni cliente afectado). En su lugar se hicieron los **30 min mínimos**:
> 1. Crear `BRAND.md` en la raíz como fuente canónica de logos + tokens (resuelve el bug recurrente del logo dark/light)
> 2. Añadir sección "Logos y assets de marca — REGLA OBLIGATORIA" al principio de este CLAUDE.md
> 3. Marcar este plan como SUPERSEDED
>
> **Cuándo retomar el plan completo:** cuando ocurra UNO de estos triggers:
> - Contratación de alguien que no sea Jordi (necesidad real de onboarding)
> - Un agente IA genere contenido con voz desactualizada y un cliente lo reciba
> - GEMA/Jordan/Kobe rompan producción por leer una versión vieja de identidad
>
> Hasta entonces, los registros de Notion del Cerebro Digital y los page IDs de abajo se mantienen como referencia. El contenido del plan sigue siendo válido como base para una futura implementación.

---

**Contexto histórico (2026-04-22):** Creada la DB `🧠 Identidad & Cerebro Digital` en Notion dentro de la página Cerebro (`https://www.notion.so/64a93adb48314c908fed3fe74715a1f4`). 8 registros iniciales: Design System Web (Dark), Design System Docs (Light+Dark), Tono de voz, Brand Voice Exit BCN, Logos & Marca, Stack técnico, Automatización Pipeline de Leads, Cerebro Digital repo. Schema con campos: Nombre, Tipo, Tema, Estado, Proyecto, Audiencia, URL/Recurso, Ruta local, Tags, Responsable, Descripción, Última actualización.

**Objetivo:** Mantener los registros de Notion sincronizados automáticamente con los archivos fuente locales (CSS, JSON, SVG, MD) para que todos los agentes IA (Claudio, Jordan, Magic, Kobe, Bird, Curry, Luka, Rodman) consulten siempre la versión vigente.

### Fase 1 · Hook local Claude Code (10 min) — HACER PRIMERO
Hook `PostToolUse` en `~/.claude/settings.json` que detecta ediciones a archivos mapeados y me sugiere actualizar Notion en el mismo turno.

**Archivos a vigilar** (mapeo archivo → registro Notion):
| Path local | Registro Notion (ID) |
|---|---|
| `/Trespuntos-web-cloude/css/design-system.css` | Design System Web Dark (`34a1b33b-8b21-8150-a8d0-f451246ef31b`) |
| `/Trespuntos-web-cloude/css/components.css` | Design System Web Dark |
| `/Trespuntos-web-cloude/css/case-study.css` | Design System Web Dark |
| `/documentos_funcionales_trespuntos/master/doc-library.css` | Design System Docs (`34a1b33b-8b21-81bb-ac3a-d88b5fa73d3c`) |
| `/documentos_funcionales_trespuntos/design-tokens.json` | Design System Docs |
| `/documentos_funcionales_trespuntos/master/05-design-tokens.md` | Design System Docs |
| `/TRESPUNTOS-LAB/jordan/tres-puntos-agent/system-prompt-v10.0-master.md` | Tono de voz (`34a1b33b-8b21-810e-b45d-dceaf0d5dc0b`) |
| `/Desktop/Tres Puntos/logo-*.svg` | Logos & Marca Oficial (`34a1b33b-8b21-8163-bffb-efe6ba550de2`) |

**Pasos:**
1. Añadir hook `PostToolUse` al `settings.json` global que corra un script bash con el path editado
2. Script bash: compara el path contra la lista mapeada; si coincide, inyecta un reminder al siguiente turno de Claudio con el ID del registro Notion a actualizar
3. Claudio, al ver el reminder, lee el archivo, resume el cambio y llama a MCP Notion para actualizar la Descripción + timestamp

**Pros:** Setup mínimo, aprovecha MCP Notion ya conectado, cubre el 80% de los cambios (los que hago desde Claude Code).
**Contras:** Solo se dispara si editamos vía Claude Code. Ediciones directas en VS Code sin Claudio no se capturan.

### Fase 2 · Workflow n8n + GitHub webhook (~2 h) — HACER DESPUÉS
Automatización completa para archivos del repo `trespuntoslab/trespuntos`.

**Arquitectura:**
```
git push origin main
  └→ GitHub webhook (repo trespuntoslab/trespuntos, evento push)
     └→ n8n workflow "Notion Sync — Cerebro Digital"
        ├─ Webhook trigger
        ├─ Filter: ¿algún archivo cambiado está en lista vigilada? (/css/*.css, design-system.html)
        ├─ GitHub API: descargar contenido nuevo del archivo
        ├─ Code node: extraer tokens CSS (regex sobre --tp-mint, --bg-base, etc.)
        ├─ Anthropic Haiku (claude-haiku-4-5): "resume en 3 frases qué cambió vs versión anterior"
        ├─ Notion API: buscar registro por URL/Ruta local (filter query)
        └─ Notion API: actualizar campos:
             · Descripción (resumen nuevo)
             · Última actualización (auto)
             · Comentario con diff resumido
  └→ Telegram grupo Mesa 3P (-4999298972): "✅ Notion actualizado: Design System Web. 3 tokens nuevos, 1 componente."
```

**Pasos:**
1. Crear Notion integration token + añadir integración a la DB `🧠 Identidad & Cerebro Digital`
2. Crear workflow n8n "Notion Sync — Cerebro Digital" (usar webhook público)
3. Configurar GitHub webhook en repo `trespuntoslab/trespuntos` → URL del webhook n8n, evento `push`, secret para validar
4. Mapear paths locales a page IDs de Notion en un nodo Code del workflow
5. Testear con un commit dummy que toque `/css/design-system.css`

### Fase 3 · Repos fuera de git + Dropbox cron (opcional)
`/documentos_funcionales_trespuntos/` vive en Dropbox, no en GitHub. Dos opciones:

**Opción A (recomendada):** Crear repo privado `trespuntoslab/docs-funcionales` → el workflow n8n de Fase 2 lo vigila igual. Ganas versionado.
**Opción B:** n8n cron cada hora → Dropbox API → detecta cambios por hash → actualiza Notion. Más frágil.

### Otros candidatos a sincronizar (ampliar DB Notion en Fase 2-3)
- Copywriting por servicio (22 páginas de servicio)
- Plantillas email (pipeline leads, partners, Jordan)
- Voz por marca (Nextica, Intek Medical, etc.)
- SEO keywords core + descanibalización
- Brand voice por cliente
- n8n workflows documentados (cada workflow activo → un registro)

### Registros Notion creados (referencia rápida)
| Registro | Page ID |
|---|---|
| Design System — Web (Dark) | `34a1b33b-8b21-8150-a8d0-f451246ef31b` |
| Design System — Docs (Light+Dark) | `34a1b33b-8b21-81bb-ac3a-d88b5fa73d3c` |
| Tono de Voz — Tres Puntos | `34a1b33b-8b21-810e-b45d-dceaf0d5dc0b` |
| Brand Voice — Exit BCN (cross-link) | `34a1b33b-8b21-811f-b626-c3fab49a3a6e` |
| Logos & Marca Oficial | `34a1b33b-8b21-8163-bffb-efe6ba550de2` |
| Stack Técnico | `34a1b33b-8b21-81b7-9203-dd5a20c3a066` |
| Automatización — Pipeline Leads | `34a1b33b-8b21-81bf-a58f-ee5bfc08587b` |
| Cerebro Digital — Repo Contexto | `34a1b33b-8b21-8177-bd26-c49192b689a0` |

**DB data source ID:** `71eabba2-dff7-485d-9a4b-00c0e8006173`
**DB URL:** `https://www.notion.so/64a93adb48314c908fed3fe74715a1f4`

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
Widget (jordan-widget-v6.js) → n8n Proxy (jordan-chat-proxy) → Anthropic API (claude-haiku-4-5)
                             → n8n Webhook (jordan-chat-leads) → Scoring IA → Airtable + Telegram + Emails
```

### Archivos
- `/assets/jordan/jordan-widget-v6.js` — Widget v6.0, Shadow DOM cerrado (`mode: 'closed'`), ~2200 líneas. Incluye modo flotante + modo embed + 8 eventos GA4
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
- Script async en 42 páginas: `<script async src="/assets/jordan/jordan-widget-v6.js"></script>`
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
- **SIEMPRE** sincronizar cambios entre `/assets/jordan/jordan-widget-v6.js` y `/jordan/tres-puntos-agent/`
- Al generar ZIPs para subir, **NO excluir** `assets/jordan/` — contiene el widget y avatar

### Regla de actualización Jordan — OBLIGATORIA
**Cuando se modifique CUALQUIER cosa del widget Jordan (`jordan-widget-v6.js`), se DEBEN actualizar TODAS las referencias:**
1. **Un solo archivo fuente**: `/assets/jordan/jordan-widget-v6.js` — es la ÚNICA fuente de verdad
2. **42 páginas lo cargan**: Todas con `<script async src="/assets/jordan/jordan-widget-v6.js"></script>`
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
- **Widget v7 (actual)**: `/assets/jordan/jordan-widget-v7.js` — persistencia en 3 stages (initial/update/final), fix bug Calendly, prompt v10.2, checklist dinámico, marcador [CALENDLY_SLOTS] (2026-04-24)
- Widget v6 (obsoleto): `/assets/jordan/jordan-widget-v6.js` — prompt v10.0 + embed mode + 8 eventos GA4 (2026-04-16)
- 42 páginas cargan v7 (flotante en 40, embed en contacto + iniciar-proyecto)
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
| v10.2 | 2026-04-24 | Bug leads perdidos + captura temprana | 9 fases (era 7). Fase 3 msg 3: valor + 1 pregunta (demuestra criterio). Fase 4 msg 4: pedir nombre + email con excusa de la copia. Teléfono movido al final opcional. Sección `## CALENDLY — REGLA ESTRICTA` (prohibido inventar fechas, marcador [CALENDLY_SLOTS] obligatorio, no mezclar con otra pregunta). Checklist dinámico inyectado en cada request con `[OK]/[FALTA]` + reglas condicionales (email→presupuesto→timeline→teléfono). NUNCA #4, #5, #21 nuevos. |

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
