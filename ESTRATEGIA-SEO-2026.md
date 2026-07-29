# Estudio SEO y estrategia — Tres Puntos

**Fecha:** 29 julio 2026 · **Autor:** Claudio · **Validado con:** Jordan (agente VPS) y Curry
**Estado:** estrategia aprobada por Jordi. Ejecución en curso.
**Documentos fuente:** `/root/shared/seo/diagnostico-realidad-jul2026.md` (+3 adendas) ·
`plan-web-ia-jul2026.md` · `ejecucion-web-ia.md` · `keyword-map.md` (VPS `tp-vps`)

---

# PARTE 1 — EL ESTUDIO

## 1.1 El punto de partida: nueve meses planos

Serie completa de Google Search Console, algo que hasta ahora nunca se había mirado entero:

| Mes | Clics | Impresiones | CTR |
|---|---|---|---|
| nov-25 | 53 | 24.093 | 0,22% |
| dic-25 | 39 | 28.399 | 0,14% |
| ene-26 | 52 | 30.799 | 0,17% |
| **feb-26** | **165** | 35.826 | 0,46% |
| **mar-26** | **165** | 31.142 | 0,53% |
| abr-26 | 113 | 29.260 | 0,39% |
| may-26 | 68 | 24.853 | 0,27% |
| jun-26 | 76 | 23.223 | 0,33% |
| jul-26 | 76-80 | 30.836 | 0,25% |

### El pico de feb-mar era estacional

El 55% de los clics de aquel pico (180 de 330) salieron de **tres posts de "tendencias 2026"**:

| Página | Clics feb+mar | Hoy |
|---|---|---|
| `/tendencias-de-diseno-web-2026-...` | 132 | 7 |
| `/endencias-ux-ui-2026-...` | 24 | — |
| `/tendencias-de-desarrollo-web-2026...` | 24 | — |

"Tendencias 2026" se busca de diciembre a febrero y muere en marzo. Antes de que arrancara
(nov-ene) la web hacía 39-53 clics/mes.

### El dato que resume nueve meses de trabajo

Descontando el clúster estacional en ambos periodos:

- **feb-mar: 75 clics/mes**
- **jun-jul: 77 clics/mes**

**Plano.** La migración de abril, la descanibalización, el noindex de 18 doorway pages, los
sitemaps, el sprint de CTR, las páginas de IA y `software-a-medida`: efecto neto agregado sobre
clics **cero**. (El cambio de title de la home del 23-may sí hizo daño real y se revirtió el 1-jun.)

**Consecuencia:** todos los objetivos del plan de recovery estaban anclados a un número irrepetible.
Por eso "fallaba" todo haciendo las cosas bien.

## 1.2 Por qué las buenas posiciones no daban clics

Datos completos a nivel de página (jun+jul): **60.165 impresiones → 154 clics (CTR 0,26%)**.

| Tramo de posición | Impresiones | Clics | CTR real | CTR esperado |
|---|---|---|---|---|
| 4-10 | 34.592 (57%) | 104 | **0,30%** | 1,5-4% |
| 11-20 | 11.712 | 36 | 0,31% | 0,5-1% |
| 21+ | 13.855 | 14 | 0,10% | <0,3% |

La anomalía estaba **solo** en el tramo 4-10. Caso extremo:
`/servicios/desarrollo-web-a-medida-barcelona/` con **15.908 impresiones (26% del sitio),
posición media 8,8 y 17 clics**.

### Verificación en el SERP real (DataForSEO, 29-jul)

| Query | Dispositivo | Orgánico | **Posición ABSOLUTA** | Qué hay encima |
|---|---|---|---|---|
| desarrollo web a medida | desktop | #5 | **#9** | 4 orgánicos + PAA + **3 map pack** |
| desarrollo web a medida | **móvil** | #5 | **#11** | 4 orgánicos + **6 map pack** |
| desarrollo web barcelona | desktop | #6 | **#9** | 5 orgánicos + **3 map pack** |
| desarrollo web barcelona | **móvil** | #8 | **#16** | 7 orgánicos + **6 map pack** + PAA |
| agencia ux ui barcelona | desktop | #3 | **#3** | SERP limpia |

**Hallazgos:**

1. **No hay AI Overview ni anuncios** en las SERPs comerciales core. (Una hipótesis inicial de
   Claudio apuntaba ahí; quedó refutada con dato.)
2. **El map pack es el techo.** En móvil, la "posición 8" de GSC es en realidad la **#16**.
3. **El snippet no es el problema.** En la única SERP limpia somos #3 con el mejor snippet de los
   cinco primeros, y aun así 382 impresiones dan 2 clics: ahí el límite es el volumen del nicho.

### Sobre el map pack y la ficha de Google

Test controlado con coordenadas:

| Buscando desde | Tres Puntos en el map pack |
|---|---|
| Plaza Catalunya | **No.** (DGTALIT tampoco) |
| Santa Coloma | **Sí, posición 9 de 9** (DGTALIT #1) |

El map pack de **Barcelona ciudad es inalcanzable** desde una ficha en Santa Coloma. El del
**área propia sí es accionable**, pero estamos últimos. Lo que nos separa: **reseñas** (13 nuestras
frente a 47 de DGTALIT, 91 de KMA, 128 de Optimoclick, 209 de La Teva Web).

> ⚠️ Varios competidores meten keywords en el nombre de la ficha ("DGTALIT | Desarrollo Web,
> Software Empresarial e Inteligencia Artificial"). **Viola las directrices de Google y expone a
> suspensión.** No se recomienda replicarlo.

## 1.3 El tamaño real del mercado

Un primer cálculo estimó el techo del nicho en 340 clics/mes. **Era erróneo**: se calculó sumando
solo las keywords que ya posicionábamos, lo cual mide nuestro footprint, no el mercado.

| Bloque | KWs comerciales | Búsquedas/mes | En SERP limpia |
|---|---|---|---|
| **WEB** | 490 | **261.740** | 146 kws → 86.210/mes |
| **IA** | 98 | **31.840** | 28 kws → 9.320/mes |

### Lo que revela sobre la estrategia anterior

| Keyword | Vol/mes | CPC | Dificultad | ¿La atacábamos? |
|---|---|---|---|---|
| pagina web | 14.800 | 6,12 € | **95** | no |
| diseño web | 5.400 | 5,52 € | **86** | prohibida |
| crear pagina web | 4.400 | 9,90 € | **69** | prohibida |
| **diseño web barcelona** | **2.400** | 6,45 € | 42 | prohibida |
| desarrollo web a medida | **390** | 18,74 € | 0 | **sí** ← apuesta previa |
| desarrollo web barcelona | **320** | 7,76 € | 0 | **sí** ← apuesta previa |

**"diseño web barcelona" mueve 7,5 veces más que "desarrollo web barcelona"**, sobre la que se
había construido la estrategia entera.

### Contraste de autoridad

| Dominio | Keywords posicionadas | Tráfico orgánico/mes |
|---|---|---|
| **latevaweb.com** | **920** | **17.007** |
| pukkas.com | 249 | 2.194 |
| creactivitat.com | 240 | 800 |
| kmadisseny.es | 122 | 206 |
| **trespuntoscomunicacion.es** | **14** | **117** |
| dgtalit.com | 5 | 2 |

## 1.4 El bloque de IA: mercado abierto, nosotros invisibles

**Dificultad de todo el vocabulario de IA — ninguna pasa de 23:**

| Keyword | Vol/mes | CPC | Dificultad | SERP |
|---|---|---|---|---|
| automatizacion de procesos | 720 | 7,58 € | **0** | AI-OV / limpia |
| agente de voz ia | 140 | **31,67 €** | **0** | AI Overview |
| ia para empresas | 320 | **18,20 €** | **1** | AI Overview |
| chatbot para empresas | 140 | **14,50 €** | **7** | **limpia** |
| empresas inteligencia artificial | 170 | **35,70 €** | **7** | AI Overview |
| agente de ia | 1.300 | 9,78 € | **11** | AI Overview |
| agencia inteligencia artificial | 320 | 5,54 € | **13** | **limpia** |
| agente ia | 1.900 | 10,17 € | **15** | AI Overview |
| agentes de ia | 1.300 | 9,78 € | **23** | AI Overview |

Es el mercado más fácil y mejor pagado medido: **CPC de 15-36 € con dificultad casi nula**.

**Tracción actual: cero.** Tres semanas tras el despliegue del 8-jul:

| URL | Impresiones | Clics | Posición |
|---|---|---|---|
| `/servicios/ia-generativa-empresas/` | 175 | 0 | 18,7 |
| `/servicios/automatizacion-agentes-ia-empresas/` | 33 | 0 | 11,3 |
| `/servicios/ia-empresas-barcelona/` | 2 | 0 | 5,0 |

### Las tres causas, todas nuestras

**1. Páginas asfixiadas de enlaces internos.** Medido en el repositorio:

| Página | Enlaces entrantes | ¿En el hub? | ¿En el menú? |
|---|---|---|---|
| desarrollo-web-a-medida-barcelona | **32** | sí | sí |
| diseno-ux-ui-barcelona | **28** | sí | sí |
| **automatizacion-agentes-ia-empresas** | **5** | **no** | **no** |
| **ia-empresas-barcelona** | **3** | **no** | **no** |
| **software-a-medida** | **1** | **no** | **no** |

La página dueña del clúster "agentes IA" (3.200 búsquedas/mes) tenía cinco enlaces y no aparecía
ni en el hub ni en el menú. Google la trataba como secundaria porque el sitio la trataba así.

**2. Edad.** Tres semanas es poco. Lo normal es ver movimiento a 2-3 meses.

**3. Formato.** El **60% de las SERPs de IA (73 de 121) tienen AI Overview**. Ahí no basta rankear:
hay que ser la fuente citada, y las páginas no están escritas en formato answer-first.

Lo que **no** es la causa: el contenido. Tienen entre 2.579 y 4.503 palabras y FAQPage.

## 1.5 El dato de negocio que lo cambia todo

Los últimos proyectos cerrados —**todos de 10.000 €**— entraron **por la web o por ChatGPT**.

Consecuencias:

1. El SEO **sí es canal de adquisición** para el ticket objetivo, no solo validación social.
2. **ChatGPT ya está trayendo clientes.** La visibilidad en IA no es una apuesta de futuro: ya
   factura. Esto sube el frente de autoridad externa (reseñas, Clutch, listicles) a prioridad 1.
3. Refuerza la sospecha de que la anomalía de "tráfico Direct al 38%" que arrastramos desde mayo
   sea, en parte, tráfico de ChatGPT y Perplexity mal atribuido.

---

# PARTE 2 — LA ESTRATEGIA

## 2.1 Diagnóstico en una frase

> El canal no está limitado por el mercado —hay 86.210 búsquedas/mes comerciales en SERP limpia
> solo en el bloque WEB—, sino por **nuestra presencia**: ausentes del vocabulario donde vive el
> volumen porque lo prohibimos nosotros, y ausentes del vocabulario de IA porque las páginas están
> escondidas del propio sitio.

## 2.2 Bloque WEB — entrar por la puerta cualificada

La puerta principal está cerrada: "diseño web" (dificultad 86) y "pagina web" (95) contra un
competidor con 145× nuestro tráfico es tirar meses.

**La puerta lateral sí está abierta**, y además es la que no contradice el posicionamiento:

| Keyword | Vol/mes | CPC | Dificultad |
|---|---|---|---|
| agencia diseño web | 590 | 7,00 € | **22** |
| diseño web profesional | ~200 | — | **25** |
| diseño web para empresas | ~150 | — | **40** |

**Decisión tomada (29-jul):** levantamiento **parcial** de la prohibición del keyword-map para esas
tres keywords, con dueña única `/servicios/diseno-web-para-empresas/`.

**Sigue prohibido:** "diseño web barato", "web económica", "crear página web gratis", cualquier
variante en la home, y **"diseño de página web" en title/H1** (intención mixta — matiz aportado por
Jordan; sí puede aparecer en el cuerpo).

**Condición de salida:** si a 6 meses más del 50% de los leads procedentes de esas keywords están
por debajo del ticket objetivo, se revierte.

> ⚠️ Para poder evaluar eso hay que arreglar antes el campo **`Página origen` de Airtable**, que
> hoy llega vacío en la mayoría de leads. De H2B (27.327 €, ganado) no consta si vino de Google.

## 2.3 Bloque IA — desenterrar lo que ya existe

El orden importa, y es contraintuitivo: **primero enlazar, luego escribir**. Es absurdo publicar
páginas nuevas mientras las que ya existen están fuera del menú.

| Fase | Acción | Impacto |
|---|---|---|
| **F1** | Enlazado interno: hub, menú global, footer, blog, cruzados | 🔴 alto — es el cuello real |
| **F2** | Formato answer-first en las 3 páginas IA + **arrancar reseñas Clutch en paralelo** | 🟠 medio-alto |
| **F3** | Páginas nuevas de dificultad ~0 y CPC alto | 🟠 medio |

**Por qué answer-first antes que páginas nuevas** (argumento de Jordan): las páginas existentes
llevan tres semanas rastreadas y Google ya las está evaluando para AI Overview. Cada semana sin
formato citable es una señal perdida sobre contenido maduro. Las páginas nuevas arrancan de cero.

**Por qué Clutch en paralelo y no después:** las reseñas tardan 3-4 semanas en verificarse. Si
esperan, bloquean todo lo demás. Y con ChatGPT ya trayendo clientes, la autoridad externa pesa
tanto como el on-page.

## 2.4 Páginas a crear

| Página | Dueña de | Vol/mes | Dificultad | Estado |
|---|---|---|---|---|
| `/servicios/diseno-web-para-empresas/` | agencia diseño web · diseño web profesional · diseño web para empresas | ~940 | 22-40 | ✅ **construida**, pendiente de revisión |
| `/servicios/chatbot-para-empresas/` | chatbot para empresas | 140 | **7** | 🟡 en curso |
| `/servicios/agentes-de-voz-ia/` | agente de voz ia | 140 | **0** | pendiente |
| `/servicios/automatizacion-de-procesos-con-ia/` | automatizacion de procesos | 720 | **0** | pendiente |

**Regla de contenido:** ninguna página menciona precios ni rangos económicos (decisión de Jordi,
29-jul). El filtro de cliente se hace describiendo el perfil —empresas B2B, producto complejo,
ciclo de venta largo— no con cifras.

## 2.5 Seguimiento

**Los clics no se moverán hasta octubre.** Medirlos semanalmente solo genera ruido. Por eso el
seguimiento semanal es de ejecución e indicadores adelantados, y la métrica que decide es mensual.

### Indicadores semanales (dashboard → Web & SEO)

| Indicador | Punto de partida | Objetivo |
|---|---|---|
| Enlaces internos → páginas IA | 9 | 40 |
| Impresiones GSC de páginas IA | 210 | 1.500 |
| Páginas en formato answer-first | 0 | 3 |
| Reseñas verificadas en Clutch | 0 | 4 |
| Posición absoluta móvil «desarrollo web barcelona» | 16 | 10 |

### Checkpoints mensuales de clics (realineados al baseline real)

| Fecha | Mínimo | Objetivo |
|---|---|---|
| 31-ago | 55 | 70 *(suelo estacional: bajar no es fallo)* |
| 30-sep | 70 | 85 ← **primer dato interpretable** |
| 31-oct | 78 | 95 |
| 30-nov | 82 | 100 |
| 31-ene-27 | 110 | 150 *(ventana estacional)* |

### Rank tracking ampliado (29-jul)

Se añadieron **12 keywords** al cron diario: ninguna keyword de IA se estaba midiendo, es decir,
llevábamos tres meses trabajando en IA sin forma de saber si servía. Coste: +0,22 €/mes.

## 2.6 Reglas que salen de este estudio

1. Nunca fijar objetivos contra un periodo sin descontar antes el contenido estacional.
2. La posición de GSC **no** es la que ve el usuario. Antes de concluir sobre CTR, medir posición
   **absoluta** con DataForSEO, y en **móvil**.
3. El map pack de Barcelona ciudad es un techo aceptado. El del área propia es accionable vía reseñas.
4. **CTR agregado del sitio: retirado como KPI** (contaminado por ~13.800 impresiones en pos 21+).
5. **Escalada real:** dos checkpoints consecutivos incumplidos ⇒ se para el plan y se replantea el
   canal. No se sigue ejecutando. *(Esta regla ya existía y se incumplió en junio y julio.)*
6. Ningún cambio de title/H1/meta sin cruzarlo contra `keyword-map.md`.

## 2.7 Expectativa realista

**Suma esperada de ambos bloques a 6-9 meses: +190 a +320 clics/mes** sobre los 80 actuales. Un
×3-×5, con horizonte de dos o tres trimestres.

**Lo que esta estrategia NO promete:** recuperar los 165 clics de feb-mar (eran estacionales),
entrar en el map pack de Barcelona, ni dar señal interpretable antes del 30 de septiembre.

---

## Anexo — errores cometidos durante el análisis

Registrados para que no se repitan y para que ningún agente los herede como verdad:

1. **Objetivos fijados contra un pico estacional** sin haber mirado la serie histórica completa.
   De ahí nace todo el marco de "catástrofe" y los targets de 90/95/105.
2. **Plan continuado tras dos checkpoints fallidos**, incumpliendo su propia regla de escalada.
3. **Hipótesis de AI Overviews comunicada como explicación principal antes de verificarla.**
   La verificación posterior (0,03 $) la refutó.
4. **Techo del mercado calculado sobre nuestro propio footprint** en vez de sobre el mercado:
   error de dos órdenes de magnitud, detectado por Jordi.

El análisis de Curry del 12-jun era correcto en método pero partía del mismo baseline contaminado.
No fue un fallo suyo: fue un fallo de instrumentación del dashboard, que comparaba siempre contra
30 días previos — justo la ventana que oculta la estacionalidad.

**Coste total de la investigación:** 0,69 $ de DataForSEO.
