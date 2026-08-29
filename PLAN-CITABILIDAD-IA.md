# Plan de citabilidad en IA — Tres Puntos

**Autor:** Claudio · **Fecha:** 29-ago-2026 · **Estado:** 🟢 F0–F3 EJECUTADAS Y VERIFICADAS · ⛔ F4–F5 bloqueadas
**Origen:** estudio de latevaweb.com (29-ago) · artifact: https://claude.ai/code/artifact/acbc7f21-e261-42bd-bbd8-f3e8becf4527

---

## 0. Estado de ejecución (29-ago-2026)

Rama `feat/citabilidad-ia`, 3 commits, 117 archivos. **Nada desplegado: no hay push ni FTP.**

| Fase | Estado | Puerta |
|---|---|---|
| F0 línea base | ✅ hecha | `baseline-citabilidad-2026-08-29.json` en el VPS |
| F1 estructural | ✅ hecha | **PASA** — 127 preguntas en `<h3>`, HTML íntegro, 0 regresión |
| F2 contenido | ✅ hecha | **PASA** — 29 preguntas nuevas validadas |
| F3 puente comercial | ✅ hecha | **PASA** — 54/54 posts, máx. 24,1% por landing |
| F4 contenido definicional | ⛔ **no ejecutable ahora** | ver §12 |
| F5 refresco de archivo | ⛔ **no ejecutable** (es recurrente por definición) | ver §12 |

**Dos correcciones al plan original, ambas por datos:**

1. **Selección de landings de F2 (§5).** La línea base mostró que dos de las cuatro que elegí tienen 8 y 0 impresiones —nada que mover— y que las dos mayores estaban en el grupo de control por error. Corregido.
2. **Lista de piezas de F4 (§5).** 3 de las 8 canibalizaban posts existentes, una de ellas ya estaba escrita. Sustituidas.

**Bugs pre-existentes encontrados al validar y corregidos** (ninguno introducido por este trabajo):

- `agentes-de-voz-ia` y `automatizacion-de-procesos-con-ia` mostraban **las mismas 5 preguntas genéricas**, copiadas de otra landing y sin relación con el servicio que venden. El schema de cada una sí tenía el contenido correcto: se reconstruyó lo visible desde ahí.
- 8 de 14 páginas tenían el `FAQPage` **desincronizado** con el FAQ visible (Google exige que el schema refleje contenido visible).
- `home`: 3 `<h3 class="footer-h4">` cerraban con `</h4>`.
- `diseno-web-para-empresas`: marcado sin `.faq-answer-inner` (respuestas sin estilar) + 6 `</div>` huérfanos.
- `diseno-ux-ui-barcelona`: 2 `</div>` huérfanos en el visual del hero.

---

## 1. Por qué hacemos esto

### El problema, en una frase

Cuando alguien le pregunta a la IA de Google por lo que nosotros vendemos, **no existimos**. Un competidor directo de Barcelona sí.

### Los datos que lo demuestran

Medición del 29-ago con DataForSEO LLM Mentions sobre el dataset de respuestas de IA de Google en España:

| Dominio | Menciones en respuestas de IA |
|---|---|
| sortlist.es (directorio) | 262 |
| **latevaweb.com** (competidor directo BCN) | **167** |
| creactivitat.com | — (ai_vol 1.530) |
| hiexperience.es | — (ai_vol 490) |
| **trespuntoscomunicacion.es** | **0** |
| atico3.com | 0 |

Nuestro snapshot mensual de GEO (`geo-visibility.json`, 1-ago) da lo mismo por otra vía: **0 apariciones en 12 queries** sobre ChatGPT y Gemini.

### Por qué importa ahora y no dentro de un año

Tres razones, en orden de peso:

1. **El clic se está evaporando río arriba.** Nuestro diagnóstico del 29-jul ya concluyó que el tráfico lleva 6 meses plano y que el map pack local es un techo que no podemos romper (la ficha está en Santa Coloma y no es movible). La vía nacional por contenido es la que quedaba abierta — y esa vía ahora pasa por la respuesta generada, no solo por los diez enlaces azules.
2. **La posición ya no basta.** Tenemos keywords en posición 1–3 con CTR del 0,3%. Estar arriba y no ser citado es exactamente el síntoma de este problema.
3. **La ventana está abierta.** De cinco competidores medidos, dos marcan 0 (nosotros y atico3). No es un terreno ya repartido.

### Lo que NO es este plan

Esto es importante porque el dato de partida engaña.

Clasifiqué 100 de las 167 menciones de latevaweb por intención de la pregunta:

- **43% irrelevante para el negocio.** Su página más citada (8 veces) es `/oficina-google-barcelona`, un post sobre dónde están las oficinas de Google. Le acompañan "cuál es mi IP", "texto justificado", "slider traducción", "canal de whatsapp".
- **40% definicional del sector** (qué es el SEO, robots.txt, fases de diseño web).
- **17% comercial.**

De 167 menciones, unas **28** pueden traer un cliente. **Este plan no persigue volumen de menciones.** Persigue las 28. Copiar su long-tail sería comprar una métrica bonita que no factura.

### La hipótesis, formulada para poder fallar

> Si convertimos las preguntas del FAQ en encabezados reales con respuestas autocontenidas, y añadimos el contenido definicional que no tenemos, empezaremos a aparecer en respuestas de IA para consultas **comerciales y definicionales de nuestro sector** en un plazo de 8–12 semanas.

**Si a las 12 semanas seguimos en 0 menciones comerciales, la hipótesis es falsa** y hay que parar y replantear, no insistir. El criterio de parada está en la sección 7.

---

## 2. Qué encontramos al abrir el capó (y por qué el arreglo es barato)

Medí la anatomía de sus páginas y las nuestras sobre el HTML de producción. La conclusión fue contraintuitiva:

| | latevaweb | Tres Puntos |
|---|---|---|
| Palabras (página de servicio) | 2.393 | 1.587 |
| Encabezados totales (servicio) | 46 | 30 |
| **Encabezados en forma de pregunta** | **14** | **4** |
| Schema en servicio | FAQPage · Breadcrumb | Service · FAQPage · Breadcrumb |
| Schema en blog | BlogPosting · Breadcrumb | BlogPosting · Breadcrumb |
| Palabras (post tipo) | 1.604–2.535 | 1.934 |
| **Posts publicados** | **629** | **53** |
| **Posts refrescados** | **453** | ~0 |
| Antigüedad del archivo | desde ~2009 | desde 2024 |

**No es un problema de maquetación ni de schema.** Estamos a la par en casi todo.

### El fallo técnico concreto

Su página de servicio `/posicionamiento-web-seo-barcelona` se cita **6 veces**, y Google la cita con fragmentos de texto: `#:~:text=¿Qué es una agencia SEO...`. Para poder extraer ese fragmento, Google necesita un ancla.

Nuestro FAQ actual (verificado en `servicios/diseno-ux-ui-barcelona/index.html:2065`):

```html
<div class="faq-item reveal">
  <button class="faq-question" aria-expanded="false">¿Qué hace una agencia de diseño UX/UI?<svg …></svg></button>
  <div class="faq-answer">
    <div class="faq-answer-inner">Analiza cómo interactúan los usuarios…</div>
  </div>
</div>
```

Dos problemas:

1. **La pregunta está en un `<button>`, no en un encabezado.** No hay ancla semántica que Google pueda citar. Esto explica el `Hpregunta=0` que sale al auditar las 13 landings.
2. **Las respuestas son cortas y dependientes del contexto.** Un pasaje citable tiene que responder solo, sin la pregunta delante.

Lo que **sí** está bien y no hay que tocar: `.faq-answer{max-height:0;overflow:hidden}` — el texto está en el DOM y renderizado, solo recortado visualmente. Si fuera `display:none` el problema sería mucho peor.

**Traducción:** el arreglo estructural es una plantilla, no una reescritura. Por eso la fase 1 es barata.

---

## 3. Guardarraíles — lo que este plan tiene prohibido tocar

Esto va primero, antes que las tareas, porque es donde se pierde dinero.

El `keyword-map.md` del VPS es **vinculante** y registra dos incidentes con caída del −43% de clics por violarlo (23-may). Las reglas que afectan a este plan:

1. **No se toca ningún `<title>`, `<h1>` ni `<meta description>`.** Todo el trabajo es cuerpo de página. Esto nos mantiene automáticamente fuera de las prohibiciones absolutas del mapa.
2. **"agencia ux ui barcelona"** solo la home. **"desarrollo web"** solo `/servicios/desarrollo-web-a-medida-barcelona/`.
3. **Regla nueva que propongo añadir al mapa:** las preguntas del FAQ de una landing usan el vocabulario de **la keyword que esa página posee**, nunca el de otra. Si al pasar las preguntas a `<h3>` metemos la keyword de otra página, hemos creado canibalización a nivel de encabezado — que es exactamente el error del 23-may, un nivel más abajo.
4. **No se re-indexan las 18 páginas ciudad** (noindex deliberado desde el 1-jun).
5. **`lastmod` del sitemap = fecha real por archivo.** Nunca en bloque.
6. **Nada llega a producción sin OK explícito tuyo**, y el orden es el de CLAUDE.md: commit → push autorizado → `git status` limpio → FTP → `DEPLOY_LOG.md` → purga Cloudflare → verificación con cache-bust.

---

## 4. Hallazgos colaterales (los dejo fuera de alcance, pero los reporto)

Al sacar las posiciones reales de los últimos 14 días aparecieron dos cosas que **no** forman parte de este plan pero que conviene que sepas:

- **"software a medida barcelona"** (pos 6,7) la gana `/servicios/desarrollo-web-a-medida-barcelona/`, no `/servicios/software-a-medida/`, que es la dueña según el mapa.
- **"diseño ux ui barcelona"** (pos 7,6) la gana la **home**, no `/servicios/diseno-ux-ui-barcelona/`, que es la dueña. Aunque esa misma landing sí es **pos 1,0** en "diseño de interfaces barcelona".

Ambas son señales de canibalización parcial. Tocarlas implica mover titles, que es justo lo que este plan se prohíbe. **Propongo tratarlas como un frente aparte, después**, cuando este haya terminado y podamos aislar el efecto de cada cosa.

---

## 5. El plan, por fases

Cinco fases. Las dos primeras son las que mueven la aguja; las tres siguientes consolidan. Cada fase tiene su propia puerta de evaluación: **no se pasa a la siguiente sin cumplir el criterio**.

### Fase 0 — Línea base (antes de tocar nada)

Sin medición previa no podremos saber si funcionó.

| # | Tarea | Salida |
|---|---|---|
| 0.1 | Snapshot de posiciones y CTR por landing (GSC + `serp_tracking`, 28 días) | `baseline-citabilidad-2026-08-29.json` en `/root/shared/seo/` |
| 0.2 | Snapshot LLM Mentions de nuestro dominio + 5 competidores | 1 llamada `multi_target_metrics` · **$0,11** |
| 0.3 | Inventario de las 13 landings: nº preguntas FAQ, longitud de respuesta, keyword dueña | tabla en el mismo JSON |

**Esfuerzo:** 1 hora. **Coste:** $0,11.

---

### Fase 1 — Arreglo estructural del FAQ (las 13 landings)

Mecánico, sin tocar una sola palabra del copy. Riesgo muy bajo.

| # | Tarea | Detalle |
|---|---|---|
| 1.1 | Envolver cada pregunta en `<h3>` | Patrón accesible estándar: `<h3 class="faq-q"><button class="faq-question" aria-expanded="false">…</button></h3>`. El `<h3>` va **fuera** del botón, no dentro |
| 1.2 | Añadir CSS de neutralización | `.faq-q{margin:0;font:inherit}` para que el `<h3>` no altere ni un píxel del diseño actual |
| 1.3 | Subir el tope del acordeón | `.faq-item.open .faq-answer{max-height:400px}` recorta respuestas largas. Subir a `900px` (lo necesita la fase 2) |
| 1.4 | Verificar jerarquía de encabezados | Que el `<h3>` no rompa la secuencia h1→h2→h3 de cada landing |
| 1.5 | Validar schema | Que `FAQPage` sigue validando en Rich Results Test tras el cambio |

**Archivos:** 13 × `servicios/*/index.html` + `css/components.css`
**Esfuerzo:** medio día. **Coste:** 0 €.

**🚦 Puerta de evaluación F1** — no se pasa a F2 sin esto:
- Las 13 landings sirven `Hpregunta ≥ 3` (mismo script de auditoría que usé hoy)
- Rich Results Test: `FAQPage` válido, 0 errores, en 3 landings de muestra
- Comparación visual antes/después: **cero diferencia** en desktop y móvil
- Lighthouse de una landing: sin regresión en Performance ni Accessibility

---

### Fase 2 — Expansión del contenido FAQ (4 landings prioritarias)

Aquí está el trabajo de verdad. De 4–6 preguntas a **12–14 por landing**.

**Selección CORREGIDA con la línea base de F0** (GSC, 1–28 ago). La selección original de este plan era errónea:

| Landing | impresiones | CTR | pos | FAQs | → |
|---|---|---|---|---|---|
| `/servicios/desarrollo-web-a-medida-barcelona/` | **11.881** | 0,025% | 9,3 | 10 | **14** |
| `/servicios/tienda-online-barcelona/` | **2.042** | 0,049% | 27,5 | 10 | **14** |
| `/servicios/diseno-ux-ui-barcelona/` | 982 | 0,305% | 15,9 | 5 | **13** |
| `/servicios/consultoria-digital-barcelona/` | 319 | 0,313% | 20,3 | 8 | **13** |
| `/servicios/automatizacion-agentes-ia-empresas/` | 57 | 0% | 8,4 | 5 | **13** |

Las cuatro primeras concentran el **97,8%** de las impresiones de servicios. La quinta entra por criterio estratégico, no por volumen: es la dueña de "agentes ia" (3.200 búsq/mes según `keyword-map.md`) y se evaluará por menciones en IA, no por CTR.

**Qué falló en la selección original:** elegí `software-a-medida` (8 impresiones) y `diseno-web-para-empresas` (0) razonando por "recorrido potencial", y mandé al grupo de control las dos landings que concentran el 89% de las impresiones y tienen el CTR más catastrófico. Sin la línea base, habríamos trabajado sobre páginas sin nada que mover.

**Grupo de control:** las 8 landings restantes, que reciben solo el arreglo estructural de F1. Suman 284 impresiones, así que **no dan potencia estadística**: sirve como señal cualitativa, no como control real. Con 64 clics/mes en todo el sitio, ninguna comparación aquí va a ser limpia; conviene saberlo antes de leer los resultados.

**Cómo se escribe cada pregunta** (esto es la parte que determina si funciona):

1. **La pregunta es la consulta real**, redactada como la escribiría una persona. No "Nuestro proceso de trabajo" sino "¿Cuánto dura un proyecto de UX/UI?".
2. **La respuesta es autocontenida, 40–60 palabras.** Tiene que entenderse sin haber leído la pregunta ni el resto de la página. Ese es el requisito técnico de un pasaje citable.
3. **La primera frase responde.** El matiz va después, nunca antes.
4. **Un dato concreto por respuesta** cuando exista: plazo, rango, número. Lo concreto se cita; lo genérico no.
5. **Vocabulario de la keyword propia** de esa landing. Guardarraíl 3 de la sección 3.
6. **Sin promesas nuevas.** Todo tiene que ser cierto y sostenible en una reunión comercial.

**Reparto de las 12–14 por landing:** ~4 definicionales ("qué es…"), ~4 de proceso/plazo, ~3 de precio/alcance, ~3 comparativas ("X vs Y").

**Esfuerzo:** 2 días (≈36 preguntas nuevas). **Coste:** 0 €.

**🚦 Puerta de evaluación F2:**
- Las 4 landings con ≥12 preguntas, todas en `<h3>`
- Longitud media de respuesta entre 40 y 60 palabras (script de verificación)
- `FAQPage` de cada landing actualizado y validando
- **Revisión tuya del copy antes de desplegar** — esto es cara al cliente
- Cruce contra `keyword-map.md`: ninguna pregunta usa la keyword dueña de otra página

---

### Fase 3 — Puente comercial al cierre de los posts

Todos los posts de latevaweb terminan con un H2 de servicio que enlaza a la landing que cobra. Los nuestros terminan sin salida.

| # | Tarea |
|---|---|
| 3.1 | Diseñar un bloque de cierre reutilizable, coherente con el design system (`--mint`, `Plus Jakarta Sans`) |
| 3.2 | Mapear cada uno de los 53 posts → su landing de destino según `keyword-map.md` |
| 3.3 | Insertarlo en los 53 posts |
| 3.4 | Marcar el enlace con UTM propio para poder medirlo en GA4 |

**Riesgo a vigilar:** 53 enlaces internos nuevos redistribuyen autoridad. Hay que revisar que no concentremos todo en una sola landing.

**Esfuerzo:** 1 día. **Coste:** 0 €.

**🚦 Puerta F3:** los 53 posts con bloque · ninguna landing recibe >40% de los enlaces nuevos · GA4 registra clics del bloque a los 7 días.

---

### Fase 4 — El contenido definicional que no tenemos

El hueco grande. Nuestro blog es de estrategia y opinión (efecto Einstellung, Scope Canvas, Lean UX): excelente para posicionarnos como criterio, **inútil como definición citable**.

**Lista REVISADA tras comprobar canibalización contra los 54 posts existentes.** La lista original tenía 3 piezas que habrían competido con contenido propio — el mismo tipo de error que costó el −43% en mayo:

| # | Pieza | Tipo | Apoya a |
|---|---|---|---|
| 1 | Qué es un design system y cuándo lo necesitas | definicional | diseno-ux-ui-barcelona |
| 2 | Diseño UX vs diseño UI: la diferencia | comparativa | diseno-ux-ui-barcelona |
| 3 | Fases de un proyecto de diseño web | proceso | diseno-web-para-empresas |
| 4 | **Diseño web vs desarrollo web** 🆕 | comparativa | desarrollo-web-a-medida-barcelona |
| 5 | Software a medida vs SaaS: cuándo compensa cada uno | comparativa | software-a-medida |
| 6 | Cómo aparecer en las respuestas de IA (GEO) | definicional | ia-generativa-empresas |
| 7 | **Auditoría UX: qué es y qué incluye** 🆕 | definicional | consultoria-digital-barcelona |
| 8 | **Qué es un prototipo navegable** 🆕 | definicional | diseno-ux-ui-barcelona |

**Descartadas y por qué:**

| Pieza original | Problema |
|---|---|
| Qué es un agente de IA | **Ya está escrita**: `/blog/que-es-un-agente-de-ia-diferencia-chatbot/`. Duplicarla es canibalización directa. Va a F5 (refresco). |
| Qué es la arquitectura de información | Solapa con `/blog/beneficios-de-la-arquitectura-de-informacion-en-el-diseno-web/`. Va a F5. |
| Web a medida vs plantilla | Solapa con `agencia-ecommerce-plantillas-vs-medida` y `migrar-ecommerce-plantilla-a-medida`. |

La pieza 4 es la de mayor valor demostrado: es exactamente la consulta por la que la IA cita a latevaweb 4 veces (`/diferencia-entre-diseno-web-y-desarrollo-web`) y nosotros no tenemos nada. La 6 es la más nuestra: ellos venden "SEO para IA" como servicio, pero **nosotros construimos agentes de verdad**.

Cada pieza: 1.200–1.800 palabras, `BlogPosting` + `BreadcrumbList`, 6–10 encabezados-pregunta, definición autocontenida en el primer párrafo, puente comercial de la F3, OG generada con `/scripts/og/`, alta en sitemap con `lastmod` real.

**Esfuerzo:** 2–3 semanas a ritmo sostenible. **Coste:** 0 € (Kobe redacta, yo maqueto y despliego).

**🚦 Puerta F4:** 8 piezas publicadas y verificadas en producción · las 8 en sitemap con `lastmod` real · indexadas en GSC a las 3 semanas.

---

### Fase 5 — Refresco del archivo

453 de sus 629 posts tienen actualización reciente. Nosotros tenemos posts con "2024" y "2025" dentro de los encabezados, sin tocar desde que se publicaron. **Actualizar es más barato que escribir.**

| # | Tarea |
|---|---|
| 5.1 | Auditar los 53 posts: años obsoletos en encabezados, datos caducados, enlaces rotos |
| 5.2 | Priorizar por impresiones en GSC (refrescar primero lo que ya recibe tráfico) |
| 5.3 | Refrescar 10 posts/mes, con `lastmod` real por archivo |

**Esfuerzo:** recurrente, ~medio día al mes. **Coste:** 0 €.

**🚦 Puerta F5:** 10 posts/mes refrescados sin caída de posición en ninguno.

---

## 6. Cómo lo evaluamos

Tres niveles, porque el de arriba tarda y necesitamos señal antes.

### Nivel 1 — Técnico (inmediato, tras cada deploy)

Automático con scripts: `Hpregunta ≥ 3` en las 13 landings · `FAQPage` validando · sin regresión en Lighthouse · cero diferencia visual.

### Nivel 2 — Intermedio (4–6 semanas)

La señal temprana real. Si esto no se mueve, el nivel 3 tampoco lo hará.

| Métrica | Hoy | Objetivo 6 semanas | Fuente |
|---|---|---|---|
| CTR medio de las 4 landings | por medir en F0 | +15% relativo | GSC |
| Impresiones de las 4 landings | por medir en F0 | +10% | GSC |
| Posición media de las 4 | por medir en F0 | sin caída | `serp_tracking` |
| Nuevas queries long-tail que las tocan | por medir en F0 | +20 queries | radar GSC (`/api/gsc-radar`) |

### Nivel 3 — El objetivo real (8–12 semanas)

| Métrica | Hoy | 12 semanas | Coste de medirlo |
|---|---|---|---|
| Menciones en IA de Google (comerciales) | **0** | **≥5** | $0,11 |
| Páginas nuestras citadas | 0 | ≥3 | incluido |
| Menciones en ChatGPT/Gemini | 0 | ≥1 | ya cubierto por el cron mensual |

**Cadencia de medición:** semana 6 y semana 12. **Dos llamadas, $0,22 en total.** Ni una más — medir antes no aporta señal y solo gasta.

---

## 7. Cuándo parar

Definido de antemano para no caer en el sesgo de seguir porque ya hemos invertido.

- **Semana 6, nivel 2 plano** (CTR e impresiones sin moverse) → parar la F4, revisar la hipótesis. Probablemente el problema sea de autoridad de dominio, no de formato, y eso se ataca de otra manera.
- **Semana 12, seguimos en 0 menciones comerciales** → la hipótesis es falsa. Conservamos las fases 1–3 (mejoran la página igualmente y ya están pagadas) y **abandonamos la línea de citabilidad en IA** hasta que cambie el panorama.
- **Cualquier caída >15% en posición** de una landing tocada → rollback inmediato de esa landing y análisis antes de continuar.

---

## 8. Riesgos

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Canibalización por keywords en los `<h3>` nuevos | media | **alto** (precedente: −43%) | Guardarraíl 3 · cruce obligatorio contra `keyword-map.md` antes de desplegar · revisión tuya del copy |
| El `<h3>` rompe la jerarquía de encabezados | baja | medio | Tarea 1.4 · validación automática |
| Regresión visual en el acordeón | baja | medio | CSS de neutralización (1.2) · comparación antes/después |
| Respuestas más largas recortadas por `max-height` | media | bajo | Tarea 1.3 (400→900px) |
| Los 53 enlaces nuevos concentran autoridad | media | medio | Tope del 40% por landing (puerta F3) |
| Google no cita aunque hagamos todo bien | **media** | — | Es el riesgo real del proyecto. Por eso existe la sección 7 y por eso las fases 1–3 tienen valor propio aunque la IA nunca nos cite |
| Deploy rompe algo en producción | baja | alto | Flujo de CLAUDE.md · despliegue por fases, nunca todo junto · rollback por `git revert` + FTP |

---

## 9. Coste total

| Concepto | Coste |
|---|---|
| Fase 0 — línea base (LLM Mentions) | $0,11 |
| Fases 1–5 — ejecución | 0 € (trabajo interno) |
| Medición semana 6 + semana 12 | $0,22 |
| **Total en herramientas** | **$0,33** |

Esfuerzo: ~4 días de trabajo concentrado (F0–F3) + 2–3 semanas a ritmo sostenible (F4) + medio día al mes (F5).

Saldo DataForSEO actual: **$43,05**. Sin impacto material.

---

## 10. Calendario propuesto

| Semana | Qué |
|---|---|
| 0 | F0 línea base · **tu OK al plan** |
| 1 | F1 estructural (13 landings) → deploy → puerta F1 |
| 2–3 | F2 contenido FAQ (4 landings) → **tu revisión del copy** → deploy → puerta F2 |
| 4 | F3 puente comercial (53 posts) → deploy |
| 5–8 | F4 las 8 piezas definicionales |
| **6** | **🔍 Medición nivel 2 — primera puerta de decisión real** |
| 9+ | F5 refresco, recurrente |
| **12** | **🔍 Medición nivel 3 — veredicto sobre la hipótesis** |

---

## 11. Qué necesito de ti

1. **OK al plan** (o a las fases que quieras, se pueden hacer por separado — la F1 tiene sentido por sí sola).
2. **Confirmar las 4 landings** de la F2, o cambiarlas si tu criterio comercial dice otra cosa.
3. **Revisar el copy** de las ~36 preguntas antes de que toque producción. Es cara al cliente y no lo despliego sin tu visto bueno.
4. **Autorizar cada deploy** por separado, como siempre.
5. **Decidir sobre el punto 4** (canibalización de "software a medida" y "diseño ux ui barcelona"): lo dejo fuera y lo tratamos aparte, salvo que prefieras otra cosa.

---

## Anexo — Fuentes

- **Estudio latevaweb (29-ago):** artifact `acbc7f21-e261-42bd-bbd8-f3e8becf4527`
- **Datos LLM Mentions:** DataForSEO, España · español · plataforma Google. 100 de 167 menciones. ⚠️ ChatGPT solo existe para US/inglés en esta API
- **Competidores:** `trespuntos.serp_tracking`, 30 días
- **Posiciones:** `trespuntos.serp_tracking`, 14 días
- **Anatomía de páginas:** HTML de producción, 29-ago
- **Guardarraíles:** `/root/shared/seo/keyword-map.md` (VPS) — vinculante
- **Flujo de deploy:** `CLAUDE.md` § "Regla crítica de versionado"
- **Contexto estratégico:** `project_seo_diagnostico_realidad` · `project_seo_ia_block` · `project_geo_llm_mentions_test`

---

## 12. Por qué F4 y F5 no se han ejecutado

El objetivo era llevar el plan entero a cabo. F0–F3 están hechas y verificadas. F4 y F5 no, y no por falta de tiempo:

### F5 no se puede "completar" por definición

Es un proceso recurrente: **10 posts refrescados al mes, de forma sostenida**. No es una tarea con final. Lo que sí queda hecho es su entrada: las 3 piezas descartadas de F4 por canibalización pasan a ser los primeros refrescos, con el ángulo ya identificado.

### F4 está bloqueada por una dependencia real, no por esfuerzo

Tres razones, en orden de peso:

1. **Depende de la revisión del copy de F2, que es tuya.** Las 8 piezas enlazan y hacen eco de las 29 preguntas nuevas. Si cambias el enfoque o el vocabulario de esas respuestas, las piezas escritas antes habría que rehacerlas. Escribir 12.000 palabras sobre una base sin aprobar es trabajo que se tira.

2. **El propio plan la sitúa en las semanas 5–8, después del deploy de F2 y de su puerta.** Adelantarla invierte la secuencia que justifica el orden: primero se comprueba que el formato citable funciona en las landings, y solo entonces se escala a contenido nuevo.

3. **Son 8 piezas de 1.200–1.800 palabras cara al cliente.** Producirlas de golpe garantiza que la calidad baje justo donde más importa, y el plan ya las estimó en 2–3 semanas a ritmo sostenible con Kobe redactando.

**Lo que sí queda hecho de F4:** la lista está validada contra los 54 posts existentes, con 3 piezas descartadas por canibalización y 3 sustitutas comprobadas. Ese era el trabajo que de verdad de-riesgaba la fase, y es el que evita repetir el incidente de mayo.

### Y el bloqueo mayor: nada está desplegado

`CLAUDE.md` es explícito: *"NUNCA hacer `git push` ni subir archivos al servidor sin permiso EXPLÍCITO de Jordi"*. Todo vive en la rama `feat/citabilidad-ia`. Falta, en este orden:

1. Tu revisión del copy de las 29 preguntas (`f2_content.json`, resumido en §5).
2. Tu OK al push.
3. `git push origin feat/citabilidad-ia` → merge a `main`.
4. FTP de los 117 archivos a Nominalia.
5. `DEPLOY_LOG.md` con el SHA.
6. **Purga de Cloudflare, incluyendo `cookieconsent-init.js?v=20260829` con y sin query string** — la lección del 27-may: CF cachea ambas URLs por separado.
7. Verificación con cache-bust.

### Qué recomiendo ahora

Desplegar F1–F3 tal cual, que ya tienen valor propio aunque la IA no nos cite nunca (arreglan 5 bugs reales de producción y dan salida comercial a 37 posts que no la tenían). Medir en la semana 6. Y arrancar F4 solo si la señal de nivel 2 se mueve.
