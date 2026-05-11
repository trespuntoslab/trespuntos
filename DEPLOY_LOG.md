# Deploy Log — trespuntoscomunicacion.es

Registro cronológico de cada deploy a producción. Una entrada por subida FTP a Nominalia.

**Regla:** cada entrada debe tener un SHA de commit que ya esté en `origin/main`. Si la línea SHA queda vacía o no se corresponde con un push, el deploy es inválido y hay que reconciliar.

**Formato:**
```
## YYYY-MM-DD HH:MM — descripción corta
- **Commit:** <sha-completo> (<rama>)
- **Archivos:** lista de archivos subidos por FTP (o "ZIP completo" si fue masivo)
- **Cloudflare:** Purge Everything | Custom URL: <urls>
- **Verificación:** OK | <issue>
- **Notas:** opcional
```

---

## 2026-05-11 — Fix Turnstile data-size=invisible → hang de 7s en todas las páginas
- **Commit:** d4997fa (main)
- **Archivos (47):** todos los HTMLs con widget `.cf-turnstile` — quitado `data-size="invisible"` (parámetro inválido en versión actual de Turnstile API)
- **Cloudflare:** Purge Everything ✅
- **Verificación:** `data-theme="dark"` sin `data-size` confirmado en producción (CF-Cache: HIT)
- **Notas:** El `data-size="invisible"` causaba TurnstileError al cargarse → bucle de 15+ reintentos durante ~7s → hang percibido por el usuario. El modo invisible lo controla el tipo de widget en CF dashboard, no el atributo HTML.

---

## 2026-05-11 — Revert components.css async (FOUC) + Fix orbit animation + Turnstile defer
- **Commits:** `276f988`, `94578e6`, `e2dfba1` (revertido) (main)
- **Archivos:** `index.html` + 35 HTMLs con Turnstile + `css/design-system.css` + archivos servicios/casos/contacto
- **Cloudflare:** Purge Everything ✅ (x2)
- **Verificación:** OK
- **Notas:** (1) orbitBubbleIn reducido a opacity-only; (2) Turnstile movido a fin de body con defer; (3) components.css async probado y revertido (causaba FOUC). El culpable real era el data-size=invisible del fix siguiente.

---

## 2026-05-11 20:55 — SEO: fix canibalización, meta servicio desarrollo web, consolidación tendencias
- **Commit:** ec58c0c (main)
- **Archivos (5):**
  - `.htaccess` — 4 nuevas reglas 301 tendencias → winner + typo redirect actualizado
  - `blog/desarrollo-web-a-medida-cuando-es-la-decision-correcta/index.html` — 2 CTAs internos → servicio
  - `blog/tendencias-ux-ui-2026-la-consolidacion-del-diseno-predictivo-y-la-eficiencia-tecnica/index.html` — canonical → winner
  - `blog/tendencias-de-desarrollo-web-2026-rentabilidad-velocidad-y-escala-tecnica/index.html` — canonical → winner
  - `servicios/desarrollo-web-a-medida-barcelona/index.html` — nuevo title + meta + OG + JSON-LD
- **Cloudflare:** Purge Everything — PENDIENTE ⚠️
- **Verificación:** 301s OK en producción (curl), title nuevo OK, CTAs blog OK (cf-cache: MISS = recién subido)
- **Notas:** Winner tendencias = tendencias-de-diseno-web-2026-rendimiento-ux-y-conversion (pos.7.7). Solicitar re-crawl en GSC para las 3 URLs afectadas.

---

## 2026-05-11 — Fix hang al cargar: orbit animation + Turnstile al fin del body
- **Commit:** 276f988 (main)
- **Archivos (36):**
  - `css/design-system.css`
  - `index.html`
  - `arquitectura-digital-conversion/index.html`
  - `casos-de-negocio/{1csoft,diferentidea,exitbcn,gibobs,naranja,nomade-rent,nomadevans,paradise,penguinaula,tsp,tusolucionhipotecaria,zimconnections}/index.html`
  - `contacto/index.html`, `contacto/index-v2-backup.html`
  - `form-v3/form-step1.html`
  - `iniciar-proyecto/index.html`, `nosotros/index.html`
  - `servicios/{consultoria-digital-barcelona,consultoria-digital-bilbao,consultoria-digital-madrid,consultoria-digital-sevilla,desarrollo-web-a-medida-barcelona,design-engineer-barcelona,design-engineer-bilbao,design-engineer-madrid,design-engineer-sevilla,diseno-ux-ui-barcelona,ia-generativa-empresas,index,tienda-online-barcelona,tienda-online-bilbao,tienda-online-madrid,tienda-online-sevilla}/index.html`
- **Cloudflare:** Purge Everything — PENDIENTE ⚠️
- **Verificación:** Pendiente post-purga
- **Notas:** Fix en dos frentes: (1) orbitBubbleIn reducido a solo opacity (quitado transform con fill-mode:forwards que congelaba orbitCounterRotation) + will-change en orbit-ring/bubble; (2) Turnstile movido de <head async defer> a </body> con defer en 35 HTMLs — el challenge de CF ya no bloquea el primer render.

---

## 2026-05-11 — Caso Naranja Inmobiliaria
- **Commit:** 1ab1379 (main — merge de claude/context-architecture-setup-LNrbb)
- **Archivos:**
  - `casos-de-negocio/naranja/index.html` (nuevo)
  - `casos-de-negocio/index.html` (card naranja añadida)
  - `img/casos/naranja/*.webp` (18 imágenes: 7 desktop + 8 mobile + 3 posters)
  - `img/casos/naranja/*.mp4` (3 vídeos: 2 desktop + 1 mobile)
- **Cloudflare:** Purge Everything ✅ 2026-05-11
- **Verificación:** OK
- **Notas:** Carrusel móvil con RAF + inercia. Video split-phone con play directo (bypass IO). Avatar quote corregido.

---

## 2026-05-03 — Caso Paradise + 2 posts blog + Jordan widget v7.3

- **Commits:**
  - `28d57c4` — feat(casos): caso Paradise Despedidas — marketplace UX/UI + Angular + Laravel
  - `2d88354` — feat(blog+jordan): 2 posts blog + Jordan widget v7.3 test mode
- **Archivos subidos por FTP:**
  - `casos-de-negocio/paradise/index.html`
  - `casos-de-negocio/paradise/config.json`
  - `casos-de-negocio/index.html` (hub actualizado con tarjeta Paradise)
  - `img/casos/paradise/` — 14 imágenes WebP + 2 vídeos MP4
  - `img/casos/paradise.webp` (card hub)
  - `img/og/caso-paradise.png`
  - `blog/agencia-diseno-ux-ui-evaluar-propuestas/index.html`
  - `blog/tiendas-online-barcelona-puntos-friccion-conversion/index.html`
  - `img/og/blog-agencia-diseno-ux-ui-evaluar-propuestas.png`
  - `img/og/blog-tiendas-online-barcelona-puntos-friccion-conversion.png`
  - `assets/jordan/jordan-widget-v7.js` (v7.3 — test mode detection)
- **Cloudflare:** ⚠️ PENDIENTE — Purge Everything (404 cacheado en /casos-de-negocio/paradise/ por error de ruta en primer intento FTP)
- **Verificación:** casos-de-negocio/ → 200 ✓ | blog posts → 200 ✓ | paradise/ → 404 HIT (pendiente purge)
- **Notas:**
  - Primera vez que se usa la ruta FTP correcta (raíz del FTP = web root). CLAUDE.md decía `/home/tres/public_html` que era incorrecto — la raíz del FTP es directamente el web root.
  - Se crearon carpetas fantasma en `/home/tres/public_html/` en el servidor — limpiar en próxima sesión si procede.

---

## 2026-04-30 — Fix redirects 404 + sistema OG versionado en git

- **Commits:**
  - `1802689` — fix(seo): redirects 301 para 404s detectados en GSC
  - `3205a1b` — feat(og): sistema OG completo (102 imágenes + plantilla + scripts)
  - `f8d033c` — feat(blog): 3 posts nuevos + grid actualizado + assets blog-article
  - `86f75ef` — feat(sectores): nueva sección /sectores/ + workflows backup + firma email
  - `29ef196` — docs(claude): documentar sistema OG en CLAUDE.md
- **Archivos subidos por FTP en esta sesión:**
  - `.htaccess` (2 veces — segunda para fix de regex `/portfolio/1csoft/`)
- **Archivos ya presentes en producción (no resubidos):**
  - 87 HTMLs con meta tags OG (subidos en sesiones anteriores entre 2026-04-22 y 2026-04-29)
  - 108 imágenes en `/img/og/*.png` (subidas el 2026-04-29)
  - Scripts `/scripts/og/*` — solo locales, no se sirven desde el dominio
  - 16 páginas en `/sectores/*` (subidas en sesiones anteriores)
  - 3 posts de blog (subidos en sesiones anteriores)
  - `img/logo-trespuntos-dark.svg` (subido en sesiones anteriores)
- **Cloudflare:** Purge Everything (después del primer FTP de `.htaccess`) + Custom URL para `/portfolio/1csoft/` (después del segundo FTP)
- **Verificación:** 11/12 redirects OK tras la primera purga, 12/12 OK tras la segunda
- **Notas:**
  - Esta es la primera entrada del log. Todo lo previo a este punto NO está registrado y constituye deuda histórica de versionado (ver "Regla crítica de versionado" en CLAUDE.md).
  - A partir de aquí, cada deploy debe entrar aquí.
  - **INCIDENTE durante este deploy**: GitHub Secret Scanning bloqueó el primer push detectando 2 secretos en `partners/campana/sectores-workflows-backup/wf3-sectores-completo.json` (Airtable PAT + Telegram bot token, hardcoded en el JSON exportado del workflow). Sanitizados con `sed` (placeholders `<AIRTABLE_PAT_REDACTED>` y `<TELEGRAM_BOT_TOKEN_REDACTED>`), commits reescritos vía `git reset --mixed origin/main` + reaplicación, push aceptado (`5322865..1be0afe`). **Pendiente: rotar las 2 credenciales** (siguen activas en producción n8n). Ver bloque "🚨 LEER PRIMERO" en CLAUDE.md.
  - `.gitignore` actualizado con reglas `**/workflows-backup/*.json`, `**/n8n-export/*.json`, `*.workflow.json`, `*.n8n.json` para evitar repetir el incidente.

---

## 2026-05-03 noche (cierre + extra audit) — 11 workflows sanitizados + verificación funcional

- **Verificación funcional WF6 Discovery:**
  - Disparado vía webhook manual (`curl -X POST .../webhook/discovery-manual`)
  - Respuesta: HTTP 200 `{"message":"Workflow was started"}` ✓
  - El workflow arrancó correctamente con las nuevas env vars
- **Auditoría adicional de 3 workflows no cubiertos antes:**
  - `Jt7ZmqaUXd7kEhQS` SEO Audit Tres Puntos → LIMPIO (usa credencial OpenAI nativa `OpenAi account` id `oSSG3CLxOxL6YQAt` + Google Drive cred)
  - `bSJnIPaz172bivWY` Sectores Tracking — WF5 Landing Engagement → INFECTADO (Airtable PAT ×3 + Telegram ×2). **Sanitizado** vía MCP (4 ops).
  - `qWTpFhTaHUscC6Z0` Sectores Tracking — /s/ Click E1 → INFECTADO (Airtable PAT ×3 + Telegram ×1). **Sanitizado** vía MCP (4 ops).
- **Total workflows sanitizados ahora: 11** (los 9 originales + 2 sectores tracking)
- **Pendiente:** auditar los 71 workflows restantes con grep masivo (paneles exitbcn, share drive, LinkedIn sync, Curry SEO, etc.). Probabilidad baja de tener secretos pero conviene confirmar.

---

## 2026-05-03 noche (cierre) — Sistema n8n totalmente funcional con env vars

- **Setup final aplicado:**
  - 4 env vars (`TELEGRAM_BOT_TOKEN`, `OPENAI_API_KEY`, `SERPER_API_KEY`, `ANTHROPIC_API_KEY`) inyectadas en el contenedor n8n vía Dokploy
  - Compose path: `/etc/dokploy/compose/n8n-n8nwithpostgres-cqx34s/code/docker-compose.yml`
  - Backup compose: `docker-compose.yml.bak.<timestamp>` (en VPS)
  - Container `n8n-n8nwithpostgres-cqx34s-n8n-1` recreado con las env vars
  - 9 workflows actualizados de `{{ $vars.X }}` → `{{ $env.X }}` vía MCP n8n (24 updateNode operations adicionales)
- **Verificación:**
  - `docker exec n8n-... env | grep -E "TELEGRAM_BOT_TOKEN|OPENAI_API_KEY|SERPER_API_KEY|ANTHROPIC_API_KEY"` → las 4 SET ✓
  - n8n.trespuntos-lab.com accesible ✓
  - Workflows reactivados sin errores ✓
- **Avisos:**
  - Las 4 env vars están en el compose editado a mano. Si Dokploy regenera el compose desde su UI, podrían perderse. Recomendado moverlas al panel "Environment" del servicio en la UI de Dokploy.
  - Decisión de Jordi: NO rotar las 5 credenciales por ahora.
- **Pendientes futuros (no urgentes):**
  - Auditar los 73 workflows n8n no cubiertos en la auditoría anterior
  - Sitemap.xml — añadir las 16 páginas de `/sectores/`
  - Validar correcciones 404 desde Search Console

---

## 2026-05-03 noche — Sanitización completa de los 9 workflows n8n (código limpio)

- **Commits:** `chore(security)` pendiente de generar tras esta entrada
- **Acción:** Los 9 workflows infectados sanitizados vía MCP n8n. 68 updateNode operations aplicadas.
- **Patrón aplicado por credencial:**
  - Airtable PAT → credencial `airtableApiKey` (id `zQer745cZNd0kQyb`, tipo `airtableApi`)
  - Telegram bot → variable n8n `{{ $vars.TELEGRAM_BOT_TOKEN }}` en la URL
  - OpenAI key → variable n8n `={{ $vars.OPENAI_API_KEY }}` en header Authorization
  - Anthropic key → variable n8n `={{ $vars.ANTHROPIC_API_KEY }}` en header x-api-key
  - Serper key → variable n8n `={{ $vars.SERPER_API_KEY }}` en header X-API-KEY (también disponible la credencial Header Auth `Serper API Key` creada hoy)
- **Workflows sanitizados:**
  - `ICoeXKSd5NQoVsZS` WF3-test Gmail (9 ops, inactivo)
  - `ofNEs2v9y3angTDz` WF3 Partner Envío (9 ops, activo)
  - `krNI9bFxAhAAjQi1` Research Agencias (6 ops, activo)
  - `AaghmTTXD5Kd4ODe` WF-Research-Daily (11 ops, activo)
  - `SRai7Mly38uCOVO7` WF6 Discovery Partners (6 ops, activo)
  - `0EMRAOvITiVjlw8y` WF4 Partner Detección (4 ops, inactivo)
  - `4DeHrw1yL4kVMsCZ` WF4 Sectores Detección (5 ops, activo)
  - `s7rw3nSvqKyujlBQ` WF3 Sectores Envío (5 ops, inactivo)
  - `brFpHdEdYYOQ00q8` WF5 Partner Tracking (13 ops, activo)
- **Pendientes:**
  - **CRÍTICO:** Jordi debe crear 4 variables n8n en Settings → Variables: `TELEGRAM_BOT_TOKEN`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `SERPER_API_KEY`. Hasta que se creen, los nodos fallan en runtime (excepto Airtable que ya usa credencial nativa).
  - **DECISIÓN POR JORDI:** No rotar las 5 credenciales por ahora. Si en el futuro se rotan, basta con actualizar el valor de las 4 variables n8n + el valor de la credencial `airtableApiKey`.
- **Notas:**
  - El bloque "🚨 LEER PRIMERO" de CLAUDE.md actualizado para reflejar el estado real (código limpio, variables n8n pendientes).
  - Memoria del proyecto actualizada igual.

---

## 2026-05-03 — Auditoría de credenciales hardcoded en workflows n8n (sin deploy a producción)

- **Commits:** ninguno (solo actualización de docs locales: CLAUDE.md, memoria, DEPLOY_LOG)
- **Acción:** auditoría completa vía MCP n8n de los 88 workflows en `n8n.trespuntos-lab.com`
- **Cobertura:** 15 workflows descargados completos + extracción de metadatos. Cobertura priorizada en familia partners + sectores + research (los más sospechosos).
- **Hallazgo:** El problema es 4-5x más grande de lo reportado el 2026-04-30:
  - **No son 2 credenciales filtradas, son 5**: Airtable PAT + Telegram bot + OpenAI key + Anthropic key + Serper key
  - **No es 1 workflow afectado, son 9** workflows (7 activos + 2 inactivos):
    - WF6 Discovery Partners (`SRai7Mly38uCOVO7`)
    - WF-Research-Daily (`AaghmTTXD5Kd4ODe`)
    - WF3 Partner Envío (`ofNEs2v9y3angTDz`)
    - WF4 Partner Detección (`0EMRAOvITiVjlw8y`)
    - WF5 Partner Tracking (`brFpHdEdYYOQ00q8`)
    - WF4 Sectores Detección (`4DeHrw1yL4kVMsCZ`)
    - Research Agencias (`krNI9bFxAhAAjQi1`)
    - WF3 Sectores Envío (`s7rw3nSvqKyujlBQ`) — inactivo
    - WF3-test Gmail (`ICoeXKSd5NQoVsZS`) — inactivo
- **Workflows ya correctos:** `o8dV7unLeUuOrqXo` (Partner WF5 antiguo, archived) usa `{{$credentials.xxx}}` correctamente — modelo a seguir
- **Workflows verificados sin secretos:** Briefing→Doc Funcional, Pipeline Briefing v1, SEO Audit Multi-Agent, SEO Audit Semanal, Email Recordatorio, Jordan Leads Chat Web
- **No auditados:** 73 workflows restantes (paneles exitbcn, share drive, sync mensual, calendly, healthcheck, etc.). Probabilidad baja de tener secretos pero conviene auditar tras rotar.
- **Notas:**
  - Bloque "🚨 LEER PRIMERO" de CLAUDE.md actualizado con las 5 credenciales (no 2) + tabla de 9 workflows + plan de sanitización por workflow
  - Memoria del proyecto (`project_credentials_to_rotate.md`) actualizada igual
  - Producción n8n NO modificada — la auditoría fue solo lectura

---

## 2026-05-06 22:35 · Fix 404 SEO + 4 huérfanos sitemap

- **SHA:** `8824898` (rama `main` en GitHub)
- **Archivos:** `.htaccess`, `sitemap.xml`
- **Origen:** detección durante auditoría SEO Semrush 2026-05-06. 2 URLs en top GSC daban 404 (slugs renombrados sin redirect). 4 posts ausentes del sitemap.
- **Cambio .htaccess:** 2 reglas 301 nuevas tras línea 106:
  - `/blog/tendencias-de-diseno-web-2026-rendimiento-velocidad-y-conversiones-que-realmente-importan/` → `/blog/tendencias-de-diseno-web-2026-rendimiento-ux-y-conversion/`
  - `/blog/tendencias-de-desarrollo-web-2026-rentabilidad-rendimiento-y-arquitectura-real/` → `/blog/tendencias-de-desarrollo-web-2026-rentabilidad-velocidad-y-escala-tecnica/`
- **Cambio sitemap.xml:** añadidas 4 entradas blog (vivas en producción, ausentes del sitemap):
  - `/blog/agencia-diseno-ux-ui-evaluar-propuestas/`
  - `/blog/como-elegir-agencia-ecommerce-barcelona/`
  - `/blog/desarrollo-web-a-medida-vs-wordpress/`
  - `/blog/tiendas-online-barcelona-puntos-friccion-conversion/`
- **FTP:** `.htaccess` (226 OK) + `sitemap.xml` (226 OK) → ftp.trespuntoscomunicacion.es
- **Verificación bypass cache:** ambas URLs antiguas devuelven 301 → URL correcta ✅ (con `?cb=${date}`)
- **Pendiente Jordi:** Purgar Cloudflare las 3 URLs específicas (Cache → Configuration → Custom Purge → Purge by URL):
  ```
  https://www.trespuntoscomunicacion.es/blog/tendencias-de-diseno-web-2026-rendimiento-velocidad-y-conversiones-que-realmente-importan/
  https://www.trespuntoscomunicacion.es/blog/tendencias-de-desarrollo-web-2026-rentabilidad-rendimiento-y-arquitectura-real/
  https://www.trespuntoscomunicacion.es/sitemap.xml
  ```
- **Impacto esperado:** recuperar ~30 clicks/mes orgánicos perdidos + Google indexa 4 posts huérfanos.
- **Acción siguiente recomendada:** tras purga, "Solicitar reindexación" en Search Console para las 4 URLs huérfanas (acelera detección).

---

## 2026-05-06 23:00 · GSC URL prefix property + Disavow inicial

- **SHA archivo verificación GSC:** `ed987b8` (`googlef48129b76dca5bb5.html` en raíz)
- **SHA fix htaccess (excepción strip .html para google verification):** `d6d159f`
- **Acción:** Crear URL prefix property `https://www.trespuntoscomunicacion.es/` en Search Console (Domain property no permite Disavow tool — limitación legacy de Google).
- **Verificación:** Método "Archivo HTML" via `googlef48129b76dca5bb5.html` (método "Google Analytics" falla porque Consent Mode v2 no carga GA hasta aceptar cookies).
- **Hallazgo importante:** **GA verification de GSC no funcionará nunca con Consent Mode v2 activo**. Para futuras propiedades usar siempre método HTML file o GTM.
- **Disavow upload:** 5 dominios rechazados, archivo `disavow-trespuntoscomunicacion-2026-05-06.txt`:
  - `trespuntoscomunicacion.com` (dominio fantasma de Angel Garcia, riesgo Penguin alto)
  - `practicalprivacyjj.blogspot.com`
  - `lnksasunmjkl.blogspot.com`
  - `metalinkas.blogspot.com`
  - `relyfeasunml.blogspot.com`
- **Archivos en producción a NO BORRAR:**
  - `/googlef48129b76dca5bb5.html` (Google revalida periódicamente la URL prefix property)
- **Fechas clave futuras:**
  - **~2026-07-06**: 60 días — posible reversión si el disavow causa problemas
  - **~2026-08-06**: 90 días — empezar a evaluar impacto en posiciones (`hiexperience.es` vs `trespuntos.es` en rankings)
  - **Tarea pendiente**: cuando reset Semrush quota mañana, revisar los ~165 refdomains restantes y ampliar disavow si procede

---
