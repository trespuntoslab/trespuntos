# Deploy Log — trespuntoscomunicacion.es

Registro cronológico de cada deploy a producción. Una entrada por subida FTP a Nominalia.

## 2026-07-01 (2) — Cookies: rediseño banner de consentimiento (modal centrado)
- **Commit:** `6a09bcb` (main · `feat(cookies): rediseño banner consentimiento — modal centrado + copy claro`)
- **Contexto:** Cruzando GA4 contra Cloudflare Web Analytics (dataset RUM, cookieless) se confirmó que solo ~8% de las visitas reales aceptan la categoría analítica (junio: 1.640 page loads reales en Cloudflare vs 128 pageviews en GA4). GA4 va casi ciego — no es un problema de tráfico perdido, es de consentimiento.
- **Cambios en `assets/cookieconsent/`:**
  - `cookieconsent-init.js`: layout del consentModal de `bar inline`/`bottom` → `box`/`middle center` (modal centrado con overlay, más atención que una barra que se scrollea sin leer). Copy reescrito: honesto, explica qué cookies se usan y por qué, sin venta de datos a terceros. Botones renombrados ("Rechazar" → "Solo necesarias", "Preferencias" → "Personalizar") para mayor claridad. `equalWeightButtons: true` sin tocar (obligatorio RGPD — aceptar y rechazar deben pesar visualmente igual).
  - `cookieconsent-theme.css`: 2 fixes — (1) el overlay oscuro del modal centrado no se pintaba por un conflicto de especificidad con el reset `all:unset` de la librería base (ID gana a clase) — restaurado con `html.show--consent #cc-main .cm-wrapper:before`; (2) el botón "Rechazar todas" del modal de Preferencias salía en mint sólido, indistinguible de "Aceptar todas" — el fix previo de esta sección solo cubría `.cm__btn` (modal de consentimiento), no `.pm__btn` (modal de preferencias). Ahora ambos modales son consistentes.
- **Cache-busting:** bump `?v=20260416` → `?v=20260701` en el script loader de las 105 páginas que cargan `cookieconsent-init.js`, para que el test de la semana arranque limpio también en visitantes recurrentes con el JS cacheado (1 año de `max-age`).
- **Verificado en local** con preview server antes de subir: modal centrado + overlay + botones correctos en desktop y mobile (375px), clic en "Personalizar" abre preferencias con "Rechazar todas" ya en outline.
- **Archivos FTP (107):** 2 assets (`cookieconsent-init.js`, `cookieconsent-theme.css`) + 105 HTMLs (bump de versión).
- **Cloudflare:** `purge_everything` (demasiados archivos para purga por URL) → `{"success": true}`.
- **Verificación (cache-bust) en producción:** `layout: 'box'` confirmado en el JS servido, fix del overlay (`cm-wrapper:before`) presente en el CSS servido, HTML de home sirve `cookieconsent-init.js?v=20260701` ✅.
- **Plan:** test A/B informal de 1 semana — comparar tasa de consentimiento (GA4 pageviews / Cloudflare Web Analytics pageloads) antes vs después. Checkpoint: 2026-07-08.

## 2026-07-01 — SEO: meta description answer-first en diseño UX/UI Barcelona
- **Commit:** `0666d21` (main · `seo: reescribir meta description diseno-ux-ui-barcelona (answer-first)`)
- **Contexto:** Alerta SEO de Jordan (01-jul, sesión bridge `743f00cb`): query "agencia ux ui barcelona" en pos 6.5 con 192 impresiones/30d pero solo 1 click (CTR 0.5%) desde `/servicios/diseno-ux-ui-barcelona/`. Diagnóstico: no era problema de posición, era snippet poco atractivo (no answer-first). Antes de tocar nada se verificaron los otros 3 puntos que planteó Jordan y resultaron ya resueltos: 12 doorway pages a noindex ya desplegadas (commit `16feb94`, confirmado en producción), title de home intacto, internal link home→desarrollo-web-a-medida-barcelona ya existente (bento card + footer, 6 clicks/30d confirmados por GSC — no era problema de indexación).
- **Meta description revisada con Jordan vía bridge** cruzando `keyword-map.md`: mi primera propuesta abría con "Agencia de diseño UX/UI en Barcelona" (tokens de la keyword dueña de home). Jordan propuso alternativa que evita el solape abriendo con la keyword dueña de esta página. Versión final: "Diseño UX/UI en Barcelona para negocios digitales. Interfaces que mejoran conversión, claridad y rendimiento — 13 años." (121 caracteres). Solo meta description — title y H1 intactos.
- **Archivos FTP (1):**
  - `servicios/diseno-ux-ui-barcelona/index.html` (solo `<meta name="description">`)
- **Cloudflare:** purge by URL (2 variantes: con y sin `/index.html`) → `{"success": true}`.
- **Verificación (cache-bust):** `cf-cache-status: MISS` tras purga + meta description confirmada en producción ✅.

## 2026-06-30 — SEO: answer-first en DWM-barcelona + enlace contextual desde software-a-medida
- **Commit:** `83798c2` (main · `seo(dwm): párrafo answer-first en DWM-barcelona + enlace contextual desde software-a-medida`)
- **Contexto:** Respuesta a alerta SEO de Curry (29-jun): `desarrollo-web-a-medida-barcelona` en pos 9.6 con CTR 0.16% (1 clic / 614 impr). Cruzado contra historial antes de actuar — se descartaron 2 falsos positivos del reporte (PageSpeed home 0/100 = artefacto de medición, verificado real LCP 2.7s/CLS 0 con Lighthouse; "agencia ux ui barcelona cae a 6.4" = artefacto de agregación, el propio Curry reconoce home real pos 3). NO se tocó la home ni ningún title/H1 (regla descanibalización).
- **Archivos FTP (2):**
  - `servicios/desarrollo-web-a-medida-barcelona/index.html` (sección answer-first "Qué es" tras el hero, ~58 palabras: qué es / para quién / por qué TP + "Barcelona y toda España". Aditivo, sin tocar title/H1/hero. Clases del design system + estilos inline mínimos.)
  - `servicios/software-a-medida/index.html` (enlace contextual en prosa, anchor EXACTO "desarrollo web a medida" → `/servicios/desarrollo-web-a-medida-barcelona`, dentro del párrafo del espectro de proyectos. Refuerza la query nacional; complementa la card de relacionados ya existente. La home NO se tocó: ya enlaza fuerte con bento-card dedicada + link de texto.)
- **Cloudflare:** purge by URL (2 URLs) → `{"success": true}`.
- **Verificación (cache-bust):** answer-first presente en DWM ✅ · enlace contextual con href+anchor correctos en software ✅ · ambas 200 ✅.

## 2026-06-26 — Blog: post "Qué es un agente de IA y en qué se diferencia de un chatbot" (apoyo bloque IA)
- **Commit:** `a8f889e` (main · `feat(blog): post "Qué es un agente de IA y en qué se diferencia de un chatbot"`)
- **Contexto:** Post informacional de APOYO a la página de agentes desplegada hoy. Brief de Claudio → Jordan → Kobe (redacción) + Curry (validación KW) vía bridge (sesión `15ccdbbe`). Focus KW "qué es un agente de ia" (informacional, sin dueño en keyword-map, SERP virgen, canibalización 0 con las 3 páginas IA). Revisado por Claudio (skill blog-review): aprobado + 2 fixes (IA generativa capitalizado, métrica "cae a la mitad" → cualitativo). 1528 palabras, E-E-A-T (caso propio del sistema multiagente).
- **Archivos FTP (4):**
  - `blog/que-es-un-agente-de-ia-diferencia-chatbot/index.html` (maquetado con skill blog-post-html sobre gold pattern: TOC 7 H2, comparison-table agente vs chatbot, icon-grid percibe/razona/actúa, 5 pain-blocks casos de uso, 2 quote-pull, stat-callout, 2 CTA → /iniciar-proyecto/, 3 relacionados. Enlace interno → /servicios/automatizacion-agentes-ia-empresas/ anchor "lo implementamos en Tres Puntos")
  - `blog/index.html` (card nueva al top del grid, data-category "IA y Automatización")
  - `img/og/blog-que-es-un-agente-de-ia-diferencia-chatbot.png` (OG generada con script del skill)
  - `sitemap.xml` (81 URLs — +post, lastmod 2026-06-26, priority 0.6)
- **Cloudflare:** purge by URL (post + /blog/ + sitemap + OG) → `{"success": true}`.
- **Verificación (cache-bust):** post 200 + title OK ✅ · OG 200 image/png ✅ · card en hub ✅ · sitemap ✅ · 4 enlaces internos 200 ✅.
- **Notion:** Estado → Publicado. **Pendiente Jordi (opcional):** solicitar indexación en GSC.

## 2026-06-26 — SEO Bloque IA: reposicionar página de agentes ("Agentes de IA para empresas") + enlazado blog→hub
- **Commit:** `f05fc75` (main · `seo(ia): reposicionar página de agentes para liderar "Agentes de IA para empresas" + enlazado blog→hub`)
- **Contexto:** Arranque del Bloque SEO IA (research DataForSEO 26-jun, validado por Jordan vía bridge sesión `20baa50f`). Target primario "agentes ia / agentes de ia" ≈ 3.200 búsq/mes, CPC 8-20€, on-brand (Tres Puntos opera un sistema multiagente real). Cruzado contra `keyword-map.md`: la página es la dueña asignada del clúster; sin infringir prohibiciones. Reposicionamiento ADITIVO (no reescritura). Memoria: `project_seo_ia_block`.
- **Archivos FTP (4):**
  - `servicios/automatizacion-agentes-ia-empresas/index.html` (title/H1/meta/OG/Service schema/breadcrumb → "Agentes de IA para empresas"; nueva sección "Caso propio" mostrando el sistema multiagente real como prueba; +2 FAQ chatbots/implementación IA como long-tail). 3 JSON-LD válidos.
  - `img/og/servicio-automatizacion-agentes-ia-empresas.png` (OG regenerada con el nuevo title; manifest actualizado en repo)
  - `blog/desarrollo-web-a-medida-cuando-es-la-decision-correcta/index.html` (anchor EXACTO "desarrollo web a medida" → hub, antes del otro enlace = first-link-counts, para fijar jerarquía hub-dueño. Recomendación de Jordan, hilo captación `7a923189`)
  - `sitemap.xml` (lastmod real 2026-06-26 SOLO en las 2 URLs tocadas — regla anti-uniformidad)
- **Cloudflare:** purge by URL (página agentes + post blog + OG + sitemap) → `{"success": true}`.
- **Verificación post-purga (cache-bust + no-cache):** página agentes → title nuevo ✅ + H1 "Agentes de IA para empresas" ✅ · blog → anchor exacto presente ✅ · sitemap → lastmod 2026-06-26 ✅.
- **Pendiente:** llevar la página al `keyword-map.md` como dueña de "agentes ia" (cierra parte de B1). Re-submit sitemap GSC (opcional).

## 2026-06-25 — SEO Captación: página nueva software a medida + refuerzo hub/tienda (clientes >10k)
- **Commit:** `64ecc25` (main · `feat(seo): captación nacional — página software a medida + refuerzo hub/tienda`)
- **Contexto:** Arranque del Plan Captación Web (línea SEO ofensiva NACIONAL para clientes >10k). Tesis: las queries de Barcelona están en pos 3-4 con 0 clicks (map pack se come el clic, no estamos en él); las nacionales no tienen map pack → ganables con contenido. Keyword research con DataForSEO confirmó el clúster (desarrollo de aplicaciones web 1.300/mes, desarrollo web empresas 880, software a medida 390 con CPC hasta 48€). Panel "Captación Web" en dashboard (live, `/api/keyword-plan`). Doc: `/root/shared/seo/plan-captacion-web-jul2026.md`.
- **Archivos FTP (5):**
  - `servicios/software-a-medida/index.html` (PÁGINA NUEVA nacional, ~2.300 palabras, schema Service+FAQPage+BreadcrumbList)
  - `img/og/servicio-software-a-medida.png` (OG generada con plantilla del repo)
  - `servicios/desarrollo-web-a-medida-barcelona/index.html` (hub: +97 líneas ADITIVAS — sección aplicaciones web/empresas + 2 FAQ. **title/H1/meta/canonical byte-a-byte intactos**, verificado git diff)
  - `servicios/tienda-online-barcelona/index.html` (+71 líneas aditivas — sección agencia ecommerce + 1 FAQ. title/H1/meta intactos)
  - `sitemap.xml` (80 URLs — +software-a-medida, lastmod real 2026-06-25 en las 3 páginas tocadas)
- **Cloudflare:** purge by URL (página nueva + hub + tienda + sitemap + OG) → `{"success": true}`.
- **Verificación post-purga (cache-bust + no-cache):**
  - Página nueva → HTTP 200 ✅ · title correcto ✅
  - Hub → 200 ✅ · title INTACTO ✅ · sección nueva presente (10× "aplicaciones web") ✅
  - Tienda → 200 ✅ · OG → 200 image/png ✅ · sitemap incluye la URL ✅
- **Pendiente Jordi:** (1) re-submit sitemap en GSC; (2) solicitar indexación de `/servicios/software-a-medida/` (Inspección de URL → Solicitar indexación).

## 2026-06-17 — Blog post #07: Ecommerce en Barcelona — el coste real de una tienda online que convierte
- **Commits:** `e13ff4c` (artículo + OG + sitemap) + `fd9b881` (card en hub `/blog/`).
- **Contexto:** Art. 07 del [Plan Blog Mayo–Agosto 2026](https://www.notion.so/3501b33b8b2181cfae1af3636df522a5). Adelantado (fecha objetivo 24-jun). Borrador de Kobe (vía Jordan/bridge) revisado por Claudio: 3 fixes (enlace a artículo relacionado, CTA a `/iniciar-proyecto/`, slug unificado) + opcionales (mini-tabla de precios citable, meta title <60, fuente Baymard). Keyword: "ecommerce barcelona" (5.652 imp/mes, pos 9.7 — el de mayor ROI del plan). Refuerza `/servicios/tienda-online-barcelona/`. Maquetado con skill `blog-post-html`.
- **Artículo:** ~1.600 palabras · 7 min · 5 H2 · 10 componentes (stat-grid, comparison-table, quote-pull, pain-blocks, stat-callout, signal-cards, icon-grid, article-cta-inline, checklist-box, article-cta final).
- **Archivos FTP (4):**
  - `blog/ecommerce-barcelona-coste-real-tienda-convierte/index.html` (32.443 B)
  - `img/og/blog-ecommerce-barcelona-coste-real-tienda-convierte.png` (40.993 B, skill `blog-post-html`)
  - `sitemap.xml` (17.174 B — nueva entrada, lastmod 2026-06-17, 79 URLs)
  - `blog/index.html` (54.498 B — card en primera posición del grid)
- **Cloudflare:** purge by URL (artículo + OG + sitemap + /blog/) → `{"success": true}`.
- **Verificación post-purga (cache-bust + no-cache):**
  - Artículo → HTTP 200 ✅ · OG → 200 ✅ · sitemap incluye la URL ✅
  - 7/7 enlaces internos → 200 ✅ · card visible en hub `/blog/` ✅
  - title producción: "Ecommerce en Barcelona: el coste real de una tienda | Tres Puntos" ✅
- **Notion:** art. 07 → estado **Publicado**.
- **Pendiente Jordi:** solicitar indexación en GSC (Inspección de URL → `https://www.trespuntoscomunicacion.es/blog/ecommerce-barcelona-coste-real-tienda-convierte/` → Solicitar indexación).

## 2026-06-09 — SEO: noindex 12 ciudades restantes (completa recovery 1-jun)
- **Commit:** `16feb94` (main · `seo(servicios): noindex 12 ciudades restantes — completa recovery 1-jun`)
- **Contexto:** Informe SEO de Jordan (9-jun) detectó 12 doorway pages thin aún indexables que el recovery del 1-jun no había tapado: `consultoria-digital`, `design-engineer`, `ia-empresas`, `tienda-online` × {madrid, bilbao, sevilla}. ~79% de vocabulario compartido con la versión Barcelona → duplicate content que diluye autoridad del dominio. El 1-jun solo se noindexaron las 6 de desarrollo-web + diseno-ux-ui.
- **Archivos FTP (13):**
  - 12 × `servicios/{consultoria-digital,design-engineer,ia-empresas,tienda-online}-{madrid,bilbao,sevilla}/index.html` → `+ <meta name="robots" content="noindex, follow">` tras el viewport
  - `sitemap.xml` (90 → 78 URLs · eliminadas las 12 · conservadas las 4 versiones `-barcelona` master)
- **Cloudflare:** purge by URL de las 12 + sitemap.xml → `{"success": true}`.
- **Verificación post-purga (cache-bust + no-cache):**
  - 12/12 sirven `noindex, follow` en producción ✅
  - `/sitemap.xml` → 78 `<loc>`, 0 coincidencias de las 12 ciudades, 4 masters Barcelona presentes ✅
- **Pendiente Jordi:** re-submit del sitemap en GSC (https://search.google.com/search-console/sitemaps).
- **Nota:** el title de la home NO se tocó pese a que Jordan lo recomendaba — sería re-introducir el error revertido el 1-jun (viola la regla de descanibalización del 17-abr).

## 2026-06-03 — Blog post #06: Diseño web a medida — en qué se gasta realmente el presupuesto
- **Commit:** `9d1459b` (main · `feat(blog): nuevo post #06 — diseño web a medida: en qué se gasta el presupuesto`)
- **Contexto:** Post #06 del [Plan Blog Mayo–Agosto 2026](https://www.notion.so/3501b33b8b2181cfae1af3636df522a5). Adelantado (fecha programada 17-jun). Estado Notion: Pendiente → Maquetado. Slug: `diseno-web-a-medida-en-que-se-gasta-el-presupuesto`. Keyword objetivo: "diseño web a medida" (13.744 imp/mes, pos 67.96). Refuerza `/servicios/desarrollo-web-a-medida-barcelona/`. Maquetado con skill `blog-post-html`.
- **Artículo:** 2.095 palabras · 10 min lectura · 5 secciones (4 H2 del brief + nueva sección "Cómo lo trabajamos en Tres Puntos") · 10 componentes (pain-blocks, stat-grid, mini-chart con 5 partidas, quote-pull, article-cta-inline, signal-cards de costes ocultos, stat-callout, checklist-box de 5 preguntas, timeline-mini del proceso TP, article-cta final).
- **Diferenciador añadido por Jordi:** sección documentando cómo Tres Puntos trabaja — documento funcional interactivo (no PDF), presupuesto desglosado por work packages cerrados + bolsa de horas estimadas, sistema de feedback inline en el propio documento, contrato comercial vinculado al alcance versionado.
- **Archivos FTP (4):**
  - `blog/diseno-web-a-medida-en-que-se-gasta-el-presupuesto/index.html` (34.790 B)
  - `img/og/blog-diseno-web-a-medida-en-que-se-gasta-el-presupuesto.png` (46.074 B, generada con skill `blog-post-html`)
  - `blog/index.html` (53.975 B — nuevo card en primera posición del grid)
  - `sitemap.xml` (19.396 B — nueva entrada con lastmod 2026-06-03)
- **Cloudflare:** purge by URL de las 4 URLs → `{"success": true}`.
- **Verificación post-purga:**
  - `/blog/diseno-web-a-medida-en-que-se-gasta-el-presupuesto/` → HTTP 200, cf-cache MISS ✅
  - OG image → HTTP 200, 46.074 B ✅
  - `/blog/` → card del nuevo post presente ✅
  - `/sitemap.xml` → entrada con lastmod 2026-06-03 ✅
- **Notion:** Estado=Maquetado + URL real rellenada en [el registro](https://www.notion.so/35f1b33b8b2181db9fead454f2b66378).
- **Enlaces internos verificados:** `/servicios/desarrollo-web-a-medida-barcelona/` 200 · `/blog/desarrollo-web-a-medida-vs-wordpress/` 200 · `/arquitectura-digital-conversion/` 200 (reemplaza a `/metodologia/` que redirige 301) · `/iniciar-proyecto/` 200.
- **Pendiente Jordi:** indexación manual en GSC + revisión OG en LinkedIn Post Inspector tras 24-48h cache LinkedIn.

## 2026-06-01 — SEO: revert title home + noindex MAD/BIL/SEV (post diagnóstico profundo)
- **Commits:** pendiente.
- **Contexto:** Diagnóstico profundo 1-jun reveló 2 errores propios del 23-may como causa raíz de la caída -43% clicks GSC:
  - Title de la home reintrodujo "Desarrollo Web a Medida" (regla del 17-abr decía explícitamente "NUNCA poner desarrollo web en titles que no sean el servicio"). Consecuencia: `desarrollo web a medida barcelona` pos 1 → 10.1, `agencia ux ui barcelona` ~3 → 6.2.
  - 6 páginas de servicio por ciudad (desarrollo-web-{mad,bil,sev} + diseno-ux-ui-{mad,bil,sev}) son clones del 90%+ del HTML de la versión Barcelona pero con canonical propio → duplicate content que diluye autoridad. Sin tráfico real en GA4 últimos 30d.
- **Archivos FTP (8):**
  - `index.html` (title + meta + og:title + twitter:title revertidos a versión pre-23-may)
  - `servicios/desarrollo-web-{madrid,bilbao,sevilla}/index.html` (+ `<meta robots="noindex, follow">`)
  - `servicios/diseno-ux-ui-{madrid,bilbao,sevilla}/index.html` (+ `<meta robots="noindex, follow">`)
  - `sitemap.xml` (95 → 89 URLs, eliminadas las 6 noindex)
- **Cambios title HOME:**
  - Antes (23-may): `Agencia UX/UI Barcelona — Diseño y Desarrollo Web a Medida · Tres Puntos`
  - Ahora (revert): `Agencia UX/UI Barcelona | Arquitectura Digital de Conversión · Tres Puntos`
- **Expectativa de recovery:** 2-3 semanas para que Google reindexe y rerankee. KPIs a vigilar: pos de "desarrollo web a medida barcelona" (objetivo 1-3), pos de "agencia ux ui barcelona" (objetivo 3).
- **Próximos pasos sugeridos:** revert sitemap lastmod uniforme → reales por archivo · canonical bug post `tendencias-ux-ui-2026-...predictivo` · cache HTML CF 4h → 1h · re-submit sitemap GSC manual.

## 2026-06-01 — SEO: mejora title + meta del post de velocidad web (Curry acción 3)
- **Commit:** pendiente — `seo(blog): mejorar title/meta post velocidad web — CTR booster`
- **Contexto:** Reporte semanal Curry 2026-06-01. Post `/blog/como-mejorar-la-velocidad-de-carga-de-tu-sitio-web/` con 1.643 imp/28d y CTR 0.1%. Meta description truncada en SERP (`...optimiza tu rendimi...`). Acción 1 (servicio desarrollo web) y 2 (home) descartadas por canibalización con keyword owner `/servicios/desarrollo-web-a-medida-barcelona/`.
- **Archivos FTP (1):**
  - `blog/como-mejorar-la-velocidad-de-carga-de-tu-sitio-web/index.html`
- **Cambios:**
  - `<title>`: `Cómo mejorar la velocidad de carga de tu sitio web | Blog | Tres Puntos` → `Cómo Mejorar Velocidad Web: Guía Completa SEO 2026 | Tres Puntos`
  - `<meta description>`: nueva con números (5 pasos) + beneficios (bounce rate, Core Web Vitals, SEO) y sin truncar (147 chars).
  - `og:title`, `og:description`, `twitter:title`, `twitter:description` actualizados en paralelo.

## 2026-05-27 — Blog post #03: Agencia de diseño UX/UI: cómo evaluar propuestas y entregables
- **Commit:** `f975d05` (main · `seo(sitemap): actualizar lastmod post #03 UX/UI evaluar propuestas`). HTML del post y OG ya estaban en commit `2d88354` (pendiente FTP); el card del hub en `c983ed6`.
- **Contexto:** Post #03 del [Plan Blog Mayo–Agosto 2026](https://www.notion.so/3501b33b8b2181cfae1af3636df522a5). Estado Notion: Aprobado → Publicado. Slug: `agencia-diseno-ux-ui-evaluar-propuestas`. Keyword objetivo: "agencia diseño ux ui" (371 imp/mes, pos 11.34). Refuerza `/servicios/diseno-ux-ui-barcelona/`.
- **Archivos FTP (4):**
  - `blog/agencia-diseno-ux-ui-evaluar-propuestas/index.html` (34.049 B)
  - `img/og/blog-agencia-diseno-ux-ui-evaluar-propuestas.png` (249.098 B)
  - `blog/index.html` (53.450 B — card del nuevo post)
  - `sitemap.xml` (20.383 B — lastmod del post y del hub `/blog/` actualizados a 2026-05-27)
- **Cloudflare:** purge by URL de las 4 URLs → `{"success": true}`.
- **Verificación post-purga:**
  - `/blog/agencia-diseno-ux-ui-evaluar-propuestas/` → HTTP 200, cf-cache MISS ✅
  - OG image → HTTP 200, 249.098 B ✅
  - `/blog/` → card del nuevo post presente ✅
  - `/sitemap.xml` → lastmod 2026-05-27 ✅
- **Notion:** Estado=Publicado + URL real rellenada en [el registro](https://www.notion.so/3561b33b8b2181369892ca53d5ac6e0d).
- **Pendiente:** indexación manual en GSC (Jordi) + revisión de OG en LinkedIn Post Inspector tras 24-48h cache LinkedIn.

## 2026-05-22 11:30 — Diseño UX/UI: rediseño hero + metodología en 4 ciudades
- **Commit:** `1106301` (main · `feat(servicios/diseno-ux-ui): rediseñar hero + metodología en 4 ciudades`)
- **Archivos (4):** `servicios/diseno-ux-ui-{barcelona,madrid,bilbao,sevilla}/index.html` (+1444 / -109 cada una)
- **Cambios principales** (aplica skill `/tp-anim` v1.3+v1.4 con antipatrón #12 documentado · "animar sobre placeholders abstractos nunca se siente premium"):
  - **Hero rediseñado (.dux-scene)** — Sustituye el mockup con sp-hotspot (3 fricciones rojas sobre dashboard skeleton) por un design system showcase: browser frame con 2 cols (Components: 4 buttons reales con texto + spec rows; Tokens: 6 swatches con hex visible + 2 type swatches), Phone overlay 200×380 con dashboard real (KPI €4.832 ▲+12% + sparkline + 2 mini-stats con count-up + CTA mint), Comment Dani peach con feedback de review, Cursor "Jordi · designer" mint. Animaciones encadenadas via `.visible` con frame scale-in, URL typewriter (steps 32), buttons pop bounce stagger, tokens stagger 60ms, phone slide, count-up ease-out cubic, idle loops sutiles.
  - **Metodología rediseñada (.dux-evo-canvas)** — Sustituye la animación con 4 layers abstractos por un único mockup (AcmeOS landing) que evoluciona por 5 fases via classes `.is-phase-1` a `.is-phase-5`: 01 Wireframe (grayscale 85% + placeholders dashed), 02 Prototipo Figma (+ sidebar capas + comment + glow azul), 03 Interfaz final (contenido real revelado), 04 Interacción (+ flow nodes Home → Producto → Acción con dot viajando + cursor sobre CTA), 05 Conversión (+ KPI badge ▲+43% + counter 1.247 leads/mes + glow mint). Auto-cycle 3s + chips clickables.
- **Cloudflare:** `purge_everything` → `{"success":true}`.
- **Verificación post-purga (sleep 8s):** las 4 URLs sirven HTTP 200 con last-modified `2026-05-22 11:30:47-53 GMT`, cf-cache HIT tras la primera request post-purge, 76 referencias a `dux-scene|dux-evo-canvas` en cada HTML ✅.
- **Notas:** El antipatrón #12 documentado en la skill costó 3 iteraciones aprender (audit→optimized con grises → no premium; pivot a design system showcase con contenido real → premium logrado). La skill ahora tiene el TEST DE CONTENIDO REAL en §10 paso 0 y la galería §11 de valores reusables para no recaer.

## 2026-05-21 07:24 — Sectores: cache-bust sectores.css en 15 análisis
- **Commit:** `8288bb5` (main · `fix(sectores): añadir ?v=2026-05-21 a sectores.css link en 15 análisis`)
- **Motivo:** Tras el deploy de 07:07 (layout horizontal), navegadores con caché HTTP de la versión previa de `sectores.css` seguían parseando el rule viejo de `.caso-card` (sin `display:flex`) incluso tras Cmd+Shift+R en algunos casos. Verificado con `document.styleSheets` (rule cacheado sin flex) vs `fetch(url, {cache:'no-store'})` (rule nuevo con flex). El navegador no revalidaba.
- **Fix:** Añadido query string `?v=2026-05-21` al `<link rel="stylesheet" href="../../css/sectores.css">` en los 15 análisis (11 existentes + 4 nuevos). Cambia la URL → fuerza fetch fresco en todos los browsers, incluso los que tenían cache de larga duración.
- **Archivos (15):** todos `sectores/analisis/{circulantis,clinica-birbe,clinica-frontela,colectual,coverfy,dorsia,face-clinic,factorial-hr,fincas-blanco,finques-feliu,hospital-capilar,kronos-homes,novicap,okticket,saludonnet}/index.html`
- **Cloudflare:** `purge_everything` → `{"success":true}`.
- **Verificación (browser real, post-purge + reload):**
  - `/sectores/analisis/hospital-capilar/`: `cardDisplay: flex`, `cardFlexDir: row`, `imgWidthPct: 38%`, `bodyWidth: 500px` (62% de 808px de card) ✅
  - CSS link href: `sectores.css?v=2026-05-21` ✅
- **Lección aprendida (añadir a CLAUDE.md `tp-anim` antipatrones):** Cuando cambias REGLAS en un CSS file (no solo añades) y el sitio tiene cache-control agresivo, **el sed-replace del CSS no basta**. Hay que cache-bustear el `<link>` desde el HTML (`?v=YYYY-MM-DD`) o el navegador del usuario seguirá usando la versión vieja parseada en CSSOM hasta que expire su cache local. Cloudflare purge solo limpia el edge, no el cliente.

## 2026-05-21 07:07 — Sectores: 4 análisis nuevos + layout horizontal + fix paths
- **Commit:** `f0ab068` (main · `feat(sectores): 4 análisis nuevos + layout horizontal + fix paths`)
- **Archivos (17):**
  - **4 análisis nuevos** (`sectores/analisis/`): `colectual/`, `face-clinic/`, `hospital-capilar/`, `saludonnet/` — cada uno ~12-13 KB
  - **11 análisis existentes** con fix de paths rotos de imágenes (`../../img/SLUG-desktop.webp` → `../../../img/casos/SLUG.webp`): circulantis, clinica-birbe, clinica-frontela, coverfy, dorsia, factorial-hr, fincas-blanco, finques-feliu, kronos-homes (también limpia cifras inventadas), novicap, okticket
  - `sectores/css/sectores.css`: layout `.caso-card` de vertical → horizontal (imagen 38% izquierda · texto 62% derecha) en desktop, vertical en ≤599px
  - `img/casos/naranja.webp` (97 KB) — cover Naranja Inmobiliaria
- **Cloudflare:** `purge_everything` (17 archivos > umbral 5) → `{"success":true}`.
- **Verificación post-purga (sleep 8s):**
  - `/sectores/analisis/colectual/`: HTTP 200 · `last-modified: 07:06:41 GMT` ✅
  - `/sectores/analisis/face-clinic/`: HTTP 200 · `07:06:47 GMT` ✅
  - `/sectores/analisis/hospital-capilar/`: HTTP 200 · `07:06:55 GMT` ✅
  - `/sectores/analisis/saludonnet/`: HTTP 200 · `07:07:03 GMT` ✅
  - `/sectores/analisis/circulantis/`: contiene `img/casos/gibobs` (path nuevo correcto), 0 ocurrencias del path roto antiguo ✅
  - `/sectores/css/sectores.css`: HTTP 200 · `07:07:05 GMT` · MISS ✅
  - `/img/casos/naranja.webp`: HTTP 200 · `content-length: 97234` · MISS ✅
- **Notas:** Antes del deploy las 11 cards "Casos relacionados" en los análisis de sector mostraban imagen rota (404) por path equivocado. Ahora resuelven contra `/img/casos/SLUG.webp` que es el path real de los covers de casos. La imagen `naranja.webp` se añadió porque no existía (referenciada desde análisis de kronos-homes). Pendiente reseñar: si hay más imágenes "casos relacionados" sin cover en `/img/casos/` para evitar más 404 silenciosos.

## 2026-05-21 06:59 — Servicios: fix container width + dashboard hero en 4 desarrollo-web
- **Commit:** `81490ea` (main · `feat(servicios): fix container width + dashboard hero en 4 desarrollo-web`)
- **Archivos (27):**
  - **23 páginas con container fix puntual** (1 línea -, 1 línea +): elimina la regla `.container-main{max-width:1280px;...}` duplicada en critical CSS inline que sobrescribía los breakpoints anchos (1440px@1600px y 1600px@1920px) definidos en components.css. Cobertura completa de `/servicios/` (hub + 22 servicios sin hero animado).
  - **4 páginas desarrollo-web con dashboard completo**: `/servicios/desarrollo-web-a-medida-barcelona/` + `desarrollo-web-madrid` + `desarrollo-web-bilbao` + `desarrollo-web-sevilla`. Cambio +397 líneas / -34 cada una. Sustituye el preview skeleton del hero por un dashboard tipo audit-monitor con 3 pills DB/API/CDN, 3 KPI tiles con count-up animado (Lighthouse 98 / LCP 0.8s / Modules 124), bar chart de 7 días con stagger 80ms, live counter wandering ±2 cada 2.2s. Browser frame con float idle, URL typewriter, BUILD badge mint pulse, status bar al pie con info de build. Tags Frontend/API/Database/Responsive con bounce drop + halo frPing infinito. Anim one-shot (no loop infinito). Reutiliza keyframes frFloat/frLivePulse/frPinDrop/frPing de components.css.
- **Cloudflare:** `purge_everything` (27 archivos > umbral de 5 para custom URL) → `{"success":true}`.
- **Verificación post-purga (sleep 8s):**
  - `/servicios/desarrollo-web-a-medida-barcelona/`: HTTP 200 · `last-modified: 06:59:30 GMT` · MISS · 15 referencias a `dash-root|dash-kpi-num|animateCounter` ✅
  - `/servicios/desarrollo-web-sevilla/`: HTTP 200 · `last-modified: 06:59:36 GMT` · MISS · 6 referencias a `dash-root` ✅
  - `/servicios/diseno-ux-ui-barcelona/` (container fix only): HTTP 200 · `last-modified: 06:59:46 GMT` · MISS · 0 ocurrencias del bug `max-width:1200px` ✅
- **Skill aplicada:** `/tp-anim` v1.2 (CHANGELOG local en `.claude/commands/tp-anim.md`). Anti-patrón #10 documentado en v1.1 era exactamente este caso (critical CSS inline override breakpoints) — esta vez se descubrió que la regla inline no solo era stale sino que TAMBIÉN bloqueaba los breakpoints anchos por orden de cascada. Solución correcta: ELIMINAR del inline, no actualizar valor.
- **Notas:** El hero de las 22 páginas no-desarrollo-web (UX/UI, e-commerce, IA, consultoría, design-engineer, tienda-online…) NO se ha tocado — usan otros heroes propios. Solo recibieron el fix de container. Pendiente: revisar uno por uno si necesitan también upgrade visual al lenguaje tp-anim (futuras iteraciones).



## 2026-05-20 23:52 — Briefing-banner → Jordan (resto del sitio)
- **Commit:** `c983ed6` (main · `copy(briefing-banner): redirigir CTA secundario al chat de Jordan`)
- **Contexto:** El deploy de 23:47 (Fricciones) solo arrastró `/index.html` de este commit. Faltaba propagar el cambio del banner al resto del sitio (44 HTMLs + `js/components.js`) — el banner secundario seguía apuntando a `/iniciar-proyecto/` con copy viejo "¿Tu proyecto es urgente?".
- **Archivos (45):**
  - `js/components.js` (banner inyectado dinámicamente en home + casos vía `ctaForm()`)
  - 44 HTMLs con `.briefing-banner` hardcoded:
    - Hubs: `/servicios/`, `/blog/`, `/casos-de-negocio/`, `/nosotros/`, `/arquitectura-digital-conversion/`
    - 22 páginas servicio (`/servicios/{slug}/` — UX/UI, desarrollo web, e-commerce, design engineer, IA, consultoría × Barcelona/Madrid/Bilbao/Sevilla + 2 generales)
    - 13 casos (`/casos-de-negocio/{slug}/` — 1csoft, capilclinic, diferentidea, exitbcn, gibobs, naranja, nomade-rent, nomadevans, paradise, penguinaula, tsp, tusolucionhipotecaria, zimconnections)
- **Cambios en cada banner:**
  - `href`: `/iniciar-proyecto/` → `/contacto/`
  - Título: `¿Tu proyecto es urgente?` → `¿Prefieres hablarlo?`
  - Descripción: `Cuéntanos más detalles y te enviamos una propuesta completa en 48h.` → `Chatea con Jordan, nuestro asistente IA, y resolvemos al momento.`
  - Icono SVG: reloj → bocadillo de chat
- **Motivo:** El banner mandaba al mismo formulario en el que ya estaba el usuario (acción duplicada). Ahora ofrece ruta alternativa real (chat IA inmediato vs form asíncrono).
- **FTP:** 45/45 OK (curl `--ftp-pasv --ftp-create-dirs`, código 226 en todos).
- **Cloudflare:** `purge_everything` (>5 archivos) → `{"success":true}`.
- **Verificación post-purga (sleep 6s):**
  - `/servicios/`: HTTP 200 · `last-modified: 21:52:10 GMT` · `cf-cache-status: MISS` · contiene `href="/contacto/"` + título + desc nuevos ✅
  - `/blog/`: HTTP 200 · MISS · título "¿Prefieres hablarlo?" servido ✅
  - `/casos-de-negocio/gibobs/`: título nuevo servido ✅
  - `js/components.js`: HTTP 200 · `last-modified: 21:51:16 GMT` · MISS · contiene `Prefieres hablarlo` ✅ (sin matches de "Tu proyecto es urgente")
- **Notas:** Backup `contacto/index-v2-backup.html` deliberadamente intacto. El cambio no afecta a `/contacto/` ni `/iniciar-proyecto/` (ninguno tenía banner). Test E2E DOM hecho en local pre-deploy via preview server (preview_eval confirmó href + título + desc + iconD nuevos en ambos paths: HTML hardcoded `/servicios/` y banner dinámico `/` desde components.js). Console sin errores.

## 2026-05-20 23:47 — Home: rediseñar bloque Fricciones como diagnóstico anotado
- **Commits:**
  - `c983ed6` (main · `copy(briefing-banner): redirigir CTA secundario al chat de Jordan`) — incluye por arrastre el HTML del nuevo `.friction-visual`
  - `db81b77` (main · `feat(home/fricciones): rediseñar visual derecho como diagnóstico anotado`) — 611 líneas CSS del nuevo bloque
- **Archivos (2):**
  - `/index.html` (sustituye lista estática `.friction-item` por escena audit-en-vivo: browser frame + 4 pins anotados + comment Jordi)
  - `/css/components.css` (+611 líneas: `.fr-frame`, `.fr-pin`, `.fr-pin-card`, `.fr-comment`, `.fr-bc`, `.fr-hero`, animaciones `frPinDrop`/`frShimmer`/`frLivePulse`/`frTagBlink`/`frFloat` + responsive ≤768/480px)
- **Cloudflare:** Custom URL purge → `/`, `/index.html`, `/css/components.css` (api success).
- **Verificación:** ✅ OK
  - Home: HTTP 200 · `last-modified: 2026-05-20 21:47:21 GMT` · MISS
  - components.css: HTTP 200 · `last-modified: 2026-05-20 21:47:23 GMT` · `content-length: 174106` · MISS
  - HTML contiene 4 ocurrencias de `fr-frame|friction-visual` (estructura completa)
- **Notas:** Iteración tras feedback de Jordi sobre primer mock — eliminados barrido láser verde, cursor flotante y heading `sr-only` huérfano; cards reposicionadas en zig-zag (3 LEFT · 1 RIGHT) para evitar solape. Animaciones encadenadas vía `.visible` del `IntersectionObserver` (rootMargin existente), idle loops para frame float / shimmer / FAIL blink.

## 2026-05-20 21:42 — Capilclinic: hero — sustituir video por imagen retrato
- **Commit:** 13f010b (main · `feat(casos/capilclinic): hero — sustituir video por imagen retrato`)
- **Archivos (2):**
  - `/casos-de-negocio/capilclinic/index.html` (sustituye `<video>` por `<img>` con `loading="eager"` + `fetchpriority="high"`)
  - `/img/casos/capilclinic/hero-portrait.webp` (116 KB · 1200×1801, q82 · venía de JPG de 16.7 MB)
- **Cloudflare:** Custom URL purge → caso + nueva imagen (api success).
- **Verificación:** ✅ OK
  - Caso: HTTP 200 · `last-modified: 2026-05-20 19:42:20 GMT`
  - hero-portrait.webp: HTTP 200 · `content-length: 116470` · MISS
  - HTML solo referencia `hero-portrait.webp`, ninguna mención al MP4 anterior
- **Notas:** El MP4 `desktop-recording-01.mp4` queda huérfano en FTP (73 KB sin referenciar). No se elimina por ahora (decisión: low priority cleanup). El overlay mint sigue aplicándose por encima de la imagen (mix-blend-mode overlay).

## 2026-05-20 21:30 — Nuevo caso de éxito: Capilclinic (rediseño web + identidad)
- **Commit:** 3b976c7 (main · `feat(casos): nuevo caso de éxito Capilclinic — rediseño web + identidad`)
- **Archivos (22):**
  - `/casos-de-negocio/capilclinic/index.html` (69 KB · página del caso, 18 bloques)
  - `/casos-de-negocio/index.html` (hub, +17 líneas: bento card #13 con `data-sector="salud"`)
  - `/img/casos/capilclinic.webp` (84 KB · cover bento 1024×1536, glow mint)
  - `/img/casos/capilclinic/desktop-01..08.webp` (8 desktop screenshots, q82)
  - `/img/casos/capilclinic/mobile-01..10.webp` (10 mobile screenshots, 660px ancho)
  - `/img/casos/capilclinic/desktop-recording-01.mp4` (73 KB · video hero, 1280×, 8s, CRF 23)
- **Cloudflare:** Custom URL purge → `/casos-de-negocio/`, `/casos-de-negocio/capilclinic/`, `/img/casos/capilclinic.webp` (api success). Resto del path `/img/casos/capilclinic/*` no estaba cacheado todavía (assets nuevos).
- **Verificación:** ✅ OK
  - Hub: HTTP 200 · cf-cache MISS · 2 referencias a "capilclinic" en HTML
  - Caso: HTTP 200 · `last-modified: 2026-05-20 19:28:37 GMT` · contiene "Capilclinic" y "capilclinic.es"
  - Cover: HTTP 200 · `content-length: 84050` · cf-cache MISS
  - MP4: HTTP 200 · `content-length: 73330`
- **Notas:** Estructura de bloques distinta a casos anteriores para no repetir patrón. FAQ schema + BreadcrumbList + Article JSON-LD. `data-sector="salud"` no tiene regla CSS específica — cae al accent mint por defecto (intencional, pega con el glow mint de la cover). Pendiente: generar OG image (`/og-generate casos-de-negocio/capilclinic`) en próxima sesión.

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

---

## Deploy 2026-06-12 — SEO Fase 1: sprint CTR (plan recovery conjunto Claudio+Jordan)

- **SHA**: `ab4075b` (main)
- **Commit**: seo(fase1): sprint CTR — metas orientadas a click + FAQ schema + anchors internos
- **Archivos FTP (15)**: index.html · robots.txt · nosotros/ · servicios/ · servicios/desarrollo-web-a-medida-barcelona/ · servicios/ia-empresas-barcelona/ · blog/el-efecto-einstellung/ · blog/metodologias-para-el-diseno-de-productos-digitales/ · blog/scope-canvas-el-punto-de-partida-de-lean-ux/ · 6 PNG en img/og/
- **Cambios**: metas de 6 páginas reescritas orientadas a click (home con "UI y UX" separados, 151c; dwm añade "programación"; einstellung estaba ROTA a mitad de frase; metodologias typo; scope sin gancho; ia-bcn 187c→154c) + FAQPage 4 preguntas y párrafo puente UX en einstellung + anchors internos /servicios/ y /nosotros/ → home + crawl-delay eliminado de robots.txt + 6 OG regeneradas. **Titles y H1 NO tocados** (regla recovery 1-jun).
- **Base de la decisión**: A0 (inspección SERP real 12-jun): sin AI Overviews en las 6 queries; map pack roba en 4/6 (GBP pendiente decisión Jordi); SERPs limpias en "agencia ux ui barcelona" y "programacion web a medida".
- **Cloudflare**: Purge by URL — 15 URLs ✅ `{"success":true}`
- **Verificación**: 9/9 cambios confirmados en producción con cache-bust (metas nuevas servidas, FAQPage presente, crawl-delay fuera, anchors visibles)
- **Control**: checkpoints 15/22/30-jun y 15/31-jul en dash.trespuntos-lab.com → Web & SEO → Plan SEO · watcher Telegram lunes 9:00 · plan en /root/shared/seo/

---

## Deploy 2026-06-15 — SEO Fase 2: B4 de-optimizar posts + B1 descanibalizar IA + B2 trailing-slash

- **SHA**: `4ed3a4a` (main)
- **Archivos FTP (7)**: .htaccess · 3 posts blog/agencia-ux-ui-en-barcelona-* · 3 servicios IA (ia-empresas-barcelona, ia-generativa-empresas, automatizacion-agentes-ia-empresas)
- **B4**: title+H1 de los 3 posts reorientados a su tema (IA en diseño / claves UX/UI) — dejan de competir con la home por "agencia ux ui barcelona". Slugs intactos.
- **B1**: descanibalización IA, 1 keyword dueña por página: ia-empresas-barcelona ("IA para Empresas en Barcelona"), ia-generativa-empresas ("IA Generativa para Empresas", sin Barcelona), automatizacion-agentes ("Automatización de Procesos y Agentes IA").
- **B2**: `.htaccess` trailing-slash → https absoluto (RewriteRule línea 46). Verificado: redirect 301 directo a https con barra, sin salto http.
- **Cruzado con keyword-map** (regla de oro). **Verificado en producción**: home HTTP 200 (sitio vivo tras htaccess), redirect OK, 4 titles nuevos servidos con cache-bust.
- **Cloudflare**: purga 7 URLs OK.
- **Pendiente menor**: regenerar OG de las 5 páginas con title cambiado (imagen social aún con title viejo — no afecta SEO).
