# Deploy Log — trespuntoscomunicacion.es

Registro cronológico de cada deploy a producción. Una entrada por subida FTP a Nominalia.

## 2026-05-20 09:48 — Home: nueva sección Servicios bento Stripe-style
- **Commit:** bf401d9 (main, merge de feat/bento-services · b358d1e)
- **Archivos:**
  - `/index.html` (163 KB · sustituye `.servicios-stack` por `.servicios-bento` con 4 cards asimétricas + script mouse-follow)
  - `/css/components.css` (156 KB · +2788 líneas de CSS del bento)
  - `/casos-de-negocio/gibobs/index.html` (73 KB · limpia 2 phone-frames con vídeos 404)
- **Cloudflare:** No necesitó purga manual — cache estaba MISS al subir (probablemente expiró TTL 2h). cf-cache-status pasó MISS → HIT en segunda petición.
- **Verificación:** ✅ OK
  - `index.html` HTTP 200 · `last-modified: 2026-05-20 07:45:43 GMT` · cf-cache HIT
  - `components.css` HTTP 200 · `last-modified: 2026-05-20 07:45:45 GMT` · cf-cache HIT
  - 4 H3 del bento presentes (Diseño UX/UI · Desarrollo Web · Consultoría · IA generativa)
  - 4 links `/servicios/*` correctos
  - 3 `<ul class="sr-only">` indexables presentes
  - Hero v1 intacto (26 referencias a `css-particles` + `orbit-bubble`)
  - 107 reglas CSS del bento en `components.css` servido
- **Notas:** Mantiene SEO intacto (H3, descs, bullets en sr-only indexables, links a /servicios/* sin cambios). Hover Stripe-fiel (clip-path expansion + mouse spotlight + parallax 3D). Loops sutiles infinitos CSS-only. Mobile simplificado. Hero v1 sin tocar.



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

## Reglas FTP — cómo funciona el deploy

> Documentado 2026-05-17 tras auditoría del filesystem.

El FTP a Nominalia es **manual y selectivo** (via `curl --ftp-pasv`). No existe sincronización automática de directorio, por lo que:

- Los archivos en `.gitignore` (`.bak`, `.zip`, `.backup`, `supabase-schema.sql`, etc.) **nunca** llegan a producción por FTP accidental.
- Cada entrada en este log lista exactamente los archivos subidos.
- El servidor FTP es `ftp.trespuntoscomunicacion.es` (port 21, pasv). Nunca usar el dominio raíz como host FTP.

**Exclusiones que el operador debe respetar en cualquier upload masivo:**
```
_archive/   master/   _preview/   *.zip   *.bak   *.backup
supabase-schema.sql   dashboard-leads.jsx   generate-blogs.sh
audit-trespuntos*.html   AUDITORIA-WEB-*.md   Informe-SEO-*.docx
CLAUDE.md   DEPLOY_LOG.md   BRAND.md   HANDOFF.md
```

**Comando base para un archivo:**
```bash
curl -sk --ftp-pasv --ftp-create-dirs -T "ruta/local" \
  "ftp://claude%40trespuntoscomunicacion.es:Y20pC%267L%214z%28%24%256g@ftp.trespuntoscomunicacion.es/ruta/destino"
```

---

## 2026-05-19 — Casos de Negocio: fix responsive mobile

- **Commit:** `d86fda3` (main)
- **Archivos:**
  - `casos-de-negocio/index.html` — rediseño mobile @media 768px
- **Cambios:** Hero H1 sin overflow (clamp 1.6-2.4rem + letter-spacing), padding-top 8.5rem (no choca con navbar), eyebrow/sub/meta escala mobile. Bento: `min-height: 0 !important` + `aspect-ratio: 4/5` unificado (cards ya no son vacías de 500px), gradient overlay más fuerte, line-clamp 2 en desc, CTA siempre visible
- **Cloudflare:** Custom Purge — 2 URLs (`/casos-de-negocio/` × 2 variants)
- **Verificación:** HTTP 200 + cf-cache-status: MISS ✅ + grep `aspect-ratio: 4/5` = 5 matches en HTML servido
- **Notas:** Las cards Nomade Vans / ZIM / TSP / 1CSoft aparecen oscuras porque sus imágenes cover originales son negras — la estructura del card funciona correctamente (TODO posterior: regenerar covers más vivos)

---

## 2026-05-19 — Clarity Smart Events: Hotjar → Clarity + embudos + eventos API

- **Commits:** `1511fe9` + `257666b` (main)
- **Archivos:**
  - `assets/cookieconsent/cookieconsent-init.js` — Hotjar reemplazado por Clarity, listeners cta_navbar_click / form_submit_click / scroll_75_pct
  - `assets/jordan/jordan-widget-v7.js` — clarity('event','jordan_open') en open()
- **Cloudflare:** Custom Purge — 2 URLs
- **Verificación:** FTP 226 OK × 2, Cloudflare purge OK
- **Notas:** Clarity (wt7lglwv95) instalado, 2 embudos en panel, 4 eventos API pendientes de primeras visitas (24-48h)

---

## 2026-05-19 — Blog: publicación "El verdadero coste de no responder rápido a un lead B2B"

- **Commit:** `6fd65bf` (main)
- **Archivos:**
  - `blog/tiempo-respuesta-leads-b2b/index.html` — nuevo post (1.573 palabras, categoría: IA y Automatización)
  - `img/og/blog-tiempo-respuesta-leads-b2b.png` — imagen OG 1200×630
  - `blog/index.html` — nueva tarjeta añadida al inicio del grid
  - `sitemap.xml` — añadidas 3 URLs pendientes (tiempo-respuesta-leads-b2b, agencia-ecommerce-plantillas-vs-medida, tracking-formulario-contacto-ga4-agente-ia)
- **Cloudflare:** Custom Purge — 4 URLs (`/blog/tiempo-respuesta-leads-b2b/`, `/img/og/blog-tiempo-respuesta-leads-b2b.png`, `/blog/`, `/sitemap.xml`)
- **Verificación:** HTTP 200 + cf-cache-status: MISS ✅
- **Notas:** Sitemap actualizado con 2 posts anteriores que faltaban (agencia-ecommerce 2026-05-15, tracking-formulario 2026-05-17)

---

## 2026-05-17 23:00 — Auditoría web completa: SEO canonical, tokens CSS, sectores assets

### Commits desplegados (3)
- **`cb5d86b`** — `seo(sectores): canonical + JSON-LD + meta description partners/audit`
- **`8513c1f`** — `refactor(css): backfill 68 tokens design-system + colores hardcoded → tokens`
- **`a4de60c`** — `chore(infra): documentar reglas FTP + gitignore + CLAUDE.md + migration ref`

### Archivos subidos por FTP (20)
**SEO — canonicals + JSON-LD:**
- `sectores/index.html` — canonical + schema CollectionPage con ItemList de 4 verticales
- `sectores/fintech/index.html` — canonical
- `sectores/saas-b2b/index.html` — canonical
- `sectores/salud/index.html` — canonical
- `sectores/inmobiliaria/index.html` — canonical
- `partners/index.html` — canonical
- `partners/audit/index.html` — meta description añadida

**CSS — tokens design system:**
- `css/design-system.css` — 68 tokens nuevos en `:root` + 24× `rgba(93,255,191,` → `rgba(var(--mint-rgb),` + `#f87171` → `var(--color-error)`
- `css/components.css` — 79× `rgba(93,255,191,` → `rgba(var(--mint-rgb),` + 3× `#f87171` → `var(--color-error)`
- `css/case-study.css` — 1× `rgba(93,255,191,` → `rgba(var(--mint-rgb),` + 1× `#f87171` → `var(--color-error)`

**Assets sectores (ausentes en producción — causa raíz de 404 CSS):**
- `sectores/css/sectores.css` — archivo nunca había sido subido al servidor FTP
- `sectores/img/capilclinic-desktop.webp`
- `sectores/img/capilclinic-mobile.webp`
- `sectores/img/gibobs-desktop.webp`
- `sectores/img/gibobs-mobile.webp`
- `sectores/img/naranja-desktop.webp`
- `sectores/img/naranja-mobile.webp`
- `sectores/img/tsp-desktop.webp`
- `sectores/img/tsp-mobile.webp`

- **Cloudflare:** purge_everything + purge by URL (`sectores/css/sectores.css` + 5 URLs sectores)
- **Verificación:** ✅ CF MISS tras purga · `sectores/css/sectores.css` → 200 text/css · Playwright sectores/ sin errores consola · Screenshot OK (tema oscuro, mint, grid cards)
- **Notas:** `sectores/css/sectores.css` y las 8 imágenes webp llevaban meses ausentes del servidor FTP (drift git→producción). La auditoría lo detectó. También corregidos: 2 falsos positivos del audit (alt attrs + loading attrs usan multiline — grep line-by-line fallaba). Cerebro Digital actualizado vía GitHub MCP (`architecture/tech-stack.md`).

---

## 2026-05-17 17:50 — Nuevo post blog: tracking formulario contacto GA4 + agente IA
- **Commit:** 20613863b2c621dadd6a9beb517e95923f7ab1dc (main)
- **Archivos (3):**
  - `blog/tracking-formulario-contacto-ga4-agente-ia/index.html` (nuevo, 26.517 b)
  - `img/og/blog-tracking-formulario-contacto-ga4-agente-ia.png` (1200×630, 234.519 b)
  - `blog/index.html` (card en primera posición, +7 líneas)
- **Cloudflare:** Custom URL — PENDIENTE ⚠️ (purgar `/blog/tracking-formulario-contacto-ga4-agente-ia/`, `/blog/`, `/img/og/blog-tracking-formulario-contacto-ga4-agente-ia.png`)
- **Verificación:** OK · 200 vía origen Nominalia (post + OG) · 200 vía CF · card visible en `/blog/`
- **Notas:** Artículo "Tu formulario de contacto es una caja negra": instrumentación 5 eventos GA4 + demo en `recursos/formulario-instrumentado/` + revisión diaria con agente IA. Datos Zuko 2024 (81% abandono).

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

## Deploy 2026-05-14 00:44

- **SHA**: 4eb9ebb (+ 622aaf6)
- **Commits**: feat(blog): nuevo post agencia ecommerce plantillas vs medida + feat(analytics): integrar Hotjar bajo consentimiento GDPR
- **Archivos FTP (2)**:
  - `assets/cookieconsent/cookieconsent-init.js` (Hotjar bajo consent)
  - `blog/agencia-ecommerce-plantillas-vs-medida/index.html` (nuevo post)
- **Cloudflare**: purge by URL — 2 URLs ✅ `{"success":true}`
- **Verificación**: HTTP 200 · CF MISS ✅ · Playwright screenshot OK ✅ · 0 errores consola

## Deploy 2026-05-15 — Blog index + OG post ecommerce

- **SHA**: e692e78 + b9cc32d (main)
- **Commits**: feat(blog): añadir 7 posts nuevos al índice + fix(blog): corregir fechas posts ecommerce
- **Archivos FTP (2)**:
  - `blog/index.html` (7 posts nuevos añadidos, 44 total)
  - `img/og/blog-agencia-ecommerce-plantillas-vs-medida.png` (imagen OG nuevo post)
- **Cloudflare**: Purge by URL — /blog/ + /img/og/blog-agencia-ecommerce-plantillas-vs-medida.png — PENDIENTE ⚠️
- **Verificación**: pendiente

---

## Deploy 2026-05-15 — /iniciar-proyecto/ nueva página + fix email + fix briefing pipeline

- **SHA**: 087eec6 (feat/iniciar-proyecto-form → main)
- **Commits**: feat(iniciar-proyecto), fix(iniciar-proyecto): logo real + redirect circular + n8n pipeline, chore(og): imagen OG iniciar-proyecto
- **Archivos FTP (3)**:
  - `iniciar-proyecto/index.html` (nueva página: héroe conversión + formulario CTA completo)
  - `.htaccess` (eliminado redirect circular form-step1 → iniciar-proyecto)
  - `img/og/iniciar-proyecto.png` (imagen OG 1200×630)
- **n8n (sin FTP)**: Email bienvenida botón oscuro (fix dark mode Gmail), `¿Es Briefing?` condition → form_type=completo, Airtable typecast + continueOnFail
- **Cloudflare**: Purge by URL — /iniciar-proyecto/ + /.htaccess + /img/og/iniciar-proyecto.png — PENDIENTE ⚠️
- **Verificación**: Playwright E2E ✅ — form simple (leads-trespuntos 200) + briefing completo (leads-trespuntos 200 + briefing-v3 200)

---

## Deploy 2026-05-15 — SEO: Links internos a páginas ciudad + collapse dobles barras

- **SHA**: d833030 (main)
- **Commit**: seo: añadir links internos a páginas ciudad desde servicios BCN + fix dobles barras
- **Archivos FTP (7)**:
  - `.htaccess` (regla collapse `//` → 301 antes de llegar a Cloudflare)
  - `servicios/desarrollo-web-a-medida-barcelona/index.html` (links "También disponible en" → madrid/sevilla/bilbao)
  - `servicios/diseno-ux-ui-barcelona/index.html` (idem)
  - `servicios/tienda-online-barcelona/index.html` (idem)
  - `servicios/consultoria-digital-barcelona/index.html` (idem)
  - `servicios/design-engineer-barcelona/index.html` (idem)
  - `servicios/ia-generativa-empresas/index.html` (links a 4 ciudades + automatizacion-agentes-ia)
- **Cloudflare**: purge_everything ✅ `{"success":true}`
- **Verificación**: CF MISS ✅ · Playwright screenshot OK ✅ (desarrollo-web-a-medida-barcelona carga correctamente)

---

## Deploy 2026-05-17 — Form unificado en 47 páginas + tracking dual-bucket

- **SHA**: `c7e4438` (main)
- **Commit**: feat(forms): unificar form CTA + tracking dual-bucket por variant
- **Archivos FTP (5)**:
  - `css/components.css` — estilos scopeados `#tp-cta-form` (chips 3-col, counter, section labels, botón outline mint)
  - `js/components.js` — TP.ctaForm() refactorizado con HTML idéntico al de iniciar-proyecto (sin modal)
  - `js/form-validation.js` — lee `data-form-variant` y lo envía en todos los eventos GA4
  - `js/supabase-forms.js` — envía `form_variant` en payload del webhook n8n
  - `iniciar-proyecto/index.html` — `data-form-variant="iniciar-proyecto"` en `<form>`
- **Cloudflare**: purge_everything ✅
- **Verificación**: components.js 2 matches · components.css 12 matches · ambos servidos OK
- **Sistemas relacionados (ya en producción VPS antes del deploy)**:
  - n8n Mapear datos lead v7: fuente dinámica (Inicio Proyecto / Footer CTA / Exit Intent / CTA Briefing / CTA Simple)
  - server.py `/api/form-funnel?variant=iniciar-proyecto|footer-cta|all&range=N`
  - Dashboard sub-sección "Forms Footer" con toggle 7d/30d/90d (verificada: 171 sess · 0.6% conv)
  - Workflow Optimizer dual-bucket (`VQZZ1StJhimlrkP3`) lunes 9am con propuestas IA por bucket

---

## Deploy 2026-05-17 — Funnel tracking + modal exit-intent + UI refactor /iniciar-proyecto/

- **SHA**: `0476756` (main)
- **Commit**: feat(iniciar-proyecto): funnel tracking GA4 + modal exit-intent + UI refactor
- **Archivos FTP (3)**:
  - `iniciar-proyecto/index.html` — UI refactor Refactoring UI (chips 3-col, inputs 44px touch target, counter dinámico, section labels) + modal exit-intent HTML/CSS/JS con 6 eventos GA4
  - `js/form-validation.js` — eventos `form_50pct_complete`, `form_ready`, `form_submit_attempt` (one-shot per session)
  - `js/supabase-forms.js` — `n8nSend` retorna Promise, dispara `form_submit_success` / `form_submit_error` post-fetch
- **Cloudflare**: Purge by URL — 3 URLs ✅ `{"success":true}`
- **Verificación**: HTTP 200 · CF MISS ✅ · Eventos nuevos confirmados en HTML servido (form_50pct_complete, form_ready, form_submit_attempt, form_submit_success/error, ip-exit-overlay, exit_intent_shown, exit_intent_converted)
- **Sistemas relacionados activos**:
  - n8n workflow `📊 Conversion Form Optimizer` (ID `VQZZ1StJhimlrkP3`) — diario 9am Madrid, modo fallback sin IA, avisa solo si anomalías o lunes
  - Dashboard `dash.trespuntos-lab.com → Marketing → Iniciar Proyecto` con toggle 7d/30d/90d
  - Endpoint `/api/iniciar-proyecto?range=N` activo en server.py del VPS
  - Skill `/conversion-form` para audits ondemand
  - n8n branch exit-intent: `¿Es Exit Intent?` con Telegram urgente
