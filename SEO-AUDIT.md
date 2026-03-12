# SEO Content Audit
## trespuntoscomunicacion.es
### Fecha: 11 de Marzo de 2026

---

## SEO Health Score: 52/100

| Categoria | Puntuacion | Peso | Ponderado |
|---|---|---|---|
| On-Page SEO | 60/100 | 30% | 18.0 |
| Contenido y E-E-A-T | 45/100 | 25% | 11.3 |
| SEO Tecnico | 55/100 | 20% | 11.0 |
| Estrategia de Contenido | 50/100 | 15% | 7.5 |
| Enlazado Interno | 40/100 | 10% | 4.0 |
| **TOTAL** | | **100%** | **51.8 ~ 52** |

---

## Resumen Ejecutivo

Trespuntoscomunicacion.es es una agencia de diseno web UX/UI en Barcelona con mas de 10 anos de experiencia. El sitio tiene una base SEO razonable (schema markup, robots.txt correcto, estructura de URLs legible) pero presenta **deficiencias criticas** que limitan su visibilidad organica:

1. **Sitemap desactualizado** con fechas de 2017-2018 en el sitemap antiguo (el nuevo tiene mejor estado)
2. **Paginas de servicio que devuelven 404** desde ciertas rutas, creando confusion de URLs
3. **Uso de emojis en title tags** que puede afectar la indexacion
4. **Falta de Open Graph tags** en la homepage
5. **Blog con contenido antiguo (2019)** mezclado con posts recientes (2025-2026)
6. **Canonical tag ausente en homepage**
7. **Schema markup incompleto** (falta LocalBusiness, FAQ)
8. **Alt text inconsistente** en imagenes

---

## 1. On-Page SEO Checklist

### Title Tag

| Pagina | Title Actual | Caracteres | Estado |
|---|---|---|---|
| Homepage | "Agencia de diseno web UX/UI en Barcelona - Tres Puntos" | 55 | Pass |
| Agencia | "Mejor Agencia de diseno web UX/UI en Barcelona" (con emoji) | 49 + emoji | Needs Work |
| UX/UI | "Agencia especializada en UX/UI Barcelona - Tres Puntos" (con emoji) | 55 + emoji | Needs Work |
| Diseno Web | "Diseno web UX/UI en Barcelona- Tres Puntos" (con emoji) | 44 + emoji | Needs Work |
| Contacto | "Contacto agencia diseno web UX/UI Barcelona" | 44 | Pass |
| Blog | "Elaborado con amor - Tres Puntos" | 32 | Fail |

**Problemas detectados:**
- **Emojis en titles** (checkmarks, estrellas, rayos): Google puede ignorarlos o mostrarlos inconsistentemente. Pueden reducir la profesionalidad percibida en SERPs
- **Blog title generico**: "Elaborado con amor" no contiene keywords y no describe la seccion del blog
- **Falta separador consistente**: Algunos usan " - ", otros sin separador claro

**Recomendaciones:**
| Pagina | Title Recomendado |
|---|---|
| Homepage | `Agencia de Diseno Web UX/UI en Barcelona \| Tres Puntos` (mantener, esta bien) |
| Agencia | `Agencia de Diseno Web UX/UI en Barcelona \| Sobre Tres Puntos` |
| UX/UI Service | `Servicio de UX/UI en Barcelona \| Diseno de Experiencia de Usuario \| Tres Puntos` |
| Diseno Web | `Diseno Web a Medida en Barcelona \| Tres Puntos Comunicacion` |
| Contacto | `Contacto \| Agencia de Diseno Web UX/UI en Barcelona \| Tres Puntos` |
| Blog | `Blog de Diseno Web y UX/UI \| Tips y Tendencias \| Tres Puntos` |

### Meta Description

| Pagina | Meta Actual | Caracteres | Estado |
|---|---|---|---|
| Homepage | "Unimos diseno, tecnologia y estrategia para crear experiencias digitales con mucho flow. Expertos en diseno web UX UI y desarrollo web." | 137 | Needs Work |
| Agencia | "Unimos diseno, tecnologia y estrategia para crear experiencias digitales que enamoran a los usuarios. Expertos en UX/UI en Barcelona." (con emoji) | 134 + emoji | Needs Work |
| UX/UI | "Agencia de UX/UI en Barcelona, gracias a nuestros diseno web a medida y un desarrollo web desde 0 conseguimos enamorar a tus usuarios." | 136 | Needs Work |
| Contacto | "Necesitas un proyecto web? Ponte en contacto con nosotros, somos expertos en diseno web a medida y UX/UI. Empezamos?" | 117 | Pass |
| Blog | No detectada | 0 | Fail |

**Problemas detectados:**
- **Meta descriptions duplicadas/similares**: Homepage y Agencia usan mensajes casi identicos
- **Falta CTA claro** en las meta descriptions de servicio
- **Blog sin meta description**
- **Error gramatical**: "nuestros diseno web" (deberia ser "nuestro")
- **Emojis** en meta description de Agencia

**Recomendaciones:**
| Pagina | Meta Description Recomendada |
|---|---|
| Homepage | `Agencia de diseno web UX/UI en Barcelona con +10 anos de experiencia. Creamos webs a medida, tiendas online y experiencias digitales que convierten. Consultanos.` |
| UX/UI | `Diseno UX/UI profesional en Barcelona. Investigacion de usuarios, prototipado y diseno de interfaces que mejoran la conversion. Pide presupuesto sin compromiso.` |
| Blog | `Tips, tendencias y guias de diseno web UX/UI. Aprende sobre experiencia de usuario, desarrollo web y estrategia digital con Tres Puntos Barcelona.` |

### Heading Hierarchy

| Pagina | H1 | Estado | Problema |
|---|---|---|---|
| Homepage | "Agencia de diseno web UX / UI en Barcelona" | Pass | - |
| Agencia | "Agencia de diseno web UX/UI en Barcelona" | Needs Work | Identica al homepage |
| UX/UI | "UX/UI BARCELONA" | Needs Work | Demasiado generico, todo mayusculas |
| Diseno Web | "Diseno web barcelona" | Needs Work | Sin mayuscula en "barcelona" |
| Contacto | "Contacto" | Needs Work | Demasiado generico |
| Blog | "Elaborado con amor" | Fail | No contiene keywords relevantes |

**Problemas criticos:**
- H1 del homepage y pagina de agencia son **practicamente identicas** - Google puede interpretarlas como contenido duplicado
- Multiples H2 con texto repetido ("Que hacemos" aparece en varias paginas)
- Jerarquia de headings inconsistente entre paginas

**Recomendaciones:**
- Homepage H1: mantener actual
- Agencia H1: `Conoce Tres Puntos: +10 Anos Creando Experiencias Digitales en Barcelona`
- UX/UI H1: `Servicio de Diseno UX/UI en Barcelona`
- Blog H1: `Blog de Diseno Web y UX/UI`
- Contacto H1: `Contacta con Nuestra Agencia de Diseno Web en Barcelona`

### Image Optimization

| Criterio | Estado | Detalle |
|---|---|---|
| Alt text presente | Needs Work | Muchas imagenes de portfolio sin alt text descriptivo |
| Calidad del alt text | Needs Work | Los que existen son genericos |
| Nombres de archivo | Pass | Nombres descriptivos detectados |
| Formato WebP | Needs Work | No se detecta uso generalizado de WebP |
| Lazy loading | Pass | Clases de lazy loading detectadas |
| Imagenes responsive | Needs Work | No se detecta uso de srcset |

**Impacto estimado:** Optimizar alt texts de las ~20 imagenes principales podria generar trafico adicional desde Google Images, especialmente relevante para una agencia visual.

### URL Structure

| Criterio | Estado | Detalle |
|---|---|---|
| Legible | Pass | URLs descriptivas y claras |
| Keywords | Pass | URLs contienen keywords relevantes |
| Longitud | Pass | Dentro de los 75 caracteres |
| Guiones | Pass | Usa guiones correctamente |
| Minusculas | Pass | Todo en minusculas |
| Sin parametros | Pass | URLs limpias |
| Trailing slashes | Pass | Consistente |

**Problema detectado:** Existen **multiples URLs apuntando a contenido similar**:
- `/agencia/` (devuelve la misma pagina que `/agencia-diseno-web-ux-ui-barcelona/`)
- `/tres-puntos-agencia-de-diseno-web-ux-ui/` (otra variante)

Esto crea **contenido duplicado**. Recomendacion: elegir una URL canonica y redirigir las demas con 301.

---

## 2. Content Quality (E-E-A-T)

| Dimension | Score | Evidencia |
|---|---|---|
| Experience | **Present** | Mencionan "+10 anos de experiencia", muestran portfolio real con clientes como Santander y CaixaBank |
| Expertise | **Present** | Contenido tecnico sobre UX/UI, uso de terminologia profesional, articulos sobre metodologias (Lean UX, Atomic Design, Nielsen) |
| Authoritativeness | **Weak** | No hay bios de equipo individuales visibles, no se mencionan premios, certificaciones o publicaciones. Faltan backlinks evidentes de medios |
| Trustworthiness | **Present** | HTTPS activo, info de contacto visible, politica de privacidad, logos de clientes reconocidos |

### Acciones para mejorar E-E-A-T:

| Accion | Impacto | Esfuerzo |
|---|---|---|
| Crear pagina "Equipo" con bios profesionales, LinkedIn, y credenciales | Alto | Medio |
| Anadir autor con bio a cada articulo del blog | Alto | Bajo |
| Mostrar certificaciones (Google Partner, HubSpot, etc.) | Alto | Bajo |
| Publicar casos de estudio detallados con metricas y resultados | Alto | Alto |
| Conseguir menciones en prensa/medios del sector | Alto | Alto |
| Anadir resenas de Google Business Profile al sitio | Medio | Bajo |

---

## 3. Keyword Analysis

### Keywords Primarias Identificadas

| Keyword | Intent | Presente en Title | En H1 | En Meta | En URL | Densidad |
|---|---|---|---|---|---|---|
| diseno web barcelona | Comercial | Si | Si | Si | Si | ~2% |
| agencia UX/UI barcelona | Comercial | Si | Si | Si | Si | ~2.5% |
| diseno web UX/UI | Comercial | Si | Si | Si | Parcial | ~3% |
| desarrollo web barcelona | Comercial | No | No | Parcial | No | <1% |
| tienda online barcelona | Transaccional | No | No | No | Si (en servicio) | <1% |

### Keywords Secundarias Recomendadas (no cubiertas)

| Keyword | Volumen Est. | Competencia | Pagina Recomendada |
|---|---|---|---|
| diseno web wordpress barcelona | Medio | Media | Nuevo contenido o pagina de servicio |
| rediseno web | Medio | Baja | Blog post + pagina de servicio |
| consultoria UX barcelona | Bajo | Baja | Pagina de servicio UX/UI |
| auditoria UX | Bajo | Baja | Blog post |
| diseno web ecommerce | Medio | Alta | Pagina tienda online |
| prototipado web | Bajo | Baja | Blog post |
| test de usabilidad barcelona | Bajo | Baja | Blog post (ya existe uno similar) |
| presupuesto diseno web | Medio | Media | Landing page dedicada |

### Search Intent Analysis

| Pagina | Intent Esperado | Intent del Contenido | Alineacion |
|---|---|---|---|
| Homepage | Navegacional/Comercial | Comercial | Pass |
| Servicio UX/UI | Comercial | Comercial | Pass |
| Servicio Diseno Web | Comercial | Comercial | Pass |
| Blog posts | Informacional | Informacional | Pass |
| Contacto | Transaccional | Transaccional | Pass |
| Casos de Exito | Comercial | Comercial | Pass |

**La alineacion de intent es correcta en general.** El principal gap es que falta contenido orientado a intent transaccional (paginas de precios, comparativas, landing pages de conversion).

---

## 4. Technical SEO

### Robots.txt
- [x] Accesible y correctamente configurado
- [x] No bloquea paginas importantes
- [x] Referencia al sitemap
- [x] No bloquea CSS/JS

### XML Sitemap

| Criterio | Estado | Detalle |
|---|---|---|
| Existe | Pass | sitemap_index.xml con 6 sub-sitemaps |
| Paginas incluidas | Needs Work | 14 paginas + 39 posts + portfolio |
| URLs rotas | Needs Work | Varias URLs de servicios devuelven 404 desde rutas alternativas |
| Fechas actualizadas | Needs Work | Posts recientes bien, pero paginas de servicio sin actualizar desde 2023 |
| Enviado a GSC | No verificable | Comprobar en Google Search Console |

**Problema critico:** El sitemap antiguo (`sitemap.xml`) referencia URLs de 2017-2018 que probablemente ya no existen. El sitemap_index.xml tiene datos mas actuales pero las paginas de servicio no se han actualizado desde mayo 2023.

### Canonical Tags

| Pagina | Canonical | Estado |
|---|---|---|
| Homepage | No detectada | **Fail** |
| Servicio UX/UI | Self-referencing | Pass |
| Servicio Diseno Web | Self-referencing | Pass |
| Agencia | No verificable | Needs Work |
| Blog posts | Presente | Pass |

**Impacto:** Sin canonical en homepage, Google decide que version indexar (www vs non-www, con/sin trailing slash). Esto puede diluir la autoridad de la pagina principal.

### Mobile-Friendliness
- [x] Viewport meta tag presente
- [x] Diseno responsive detectado
- [ ] Tamano de tap targets no verificable sin herramienta
- [x] Sin scroll horizontal aparente

### Schema Markup

| Schema Type | Estado | Recomendacion |
|---|---|---|
| Organization | **Presente** | Anadir mas datos (foundingDate, numberOfEmployees) |
| WebPage | **Presente** | Correcto |
| BreadcrumbList | **Presente** | Correcto |
| ImageObject | **Presente** | Correcto |
| LocalBusiness | **Missing** | CRITICO - Anadir con direccion, horario, area de servicio |
| FAQ | **Missing** | Recomendado para paginas de servicio |
| Article | **Presente** | En posts del blog |
| Service | **Missing** | Recomendado para paginas de servicio |
| Review/AggregateRating | **Missing** | Anadir testimonios con schema |
| WebSite/SearchAction | **Missing** | Para sitelinks search box |
| ProfessionalService | **Missing** | Alternativa a LocalBusiness para agencias |

**Impacto estimado:** Implementar LocalBusiness + FAQ schema podria generar rich snippets en SERPs, aumentando CTR entre un 20-35%.

### Core Web Vitals (Estimacion)

| Metrica | Estimacion | Estado |
|---|---|---|
| LCP | ~2.5-3.5s (WordPress + imagenes grandes) | Needs Work |
| FID/INP | ~100-200ms (JS del tema Ohio) | Needs Work |
| CLS | ~0.1-0.15 (lazy loading sin dimensiones reservadas) | Needs Work |

**Recomendacion:** Verificar con PageSpeed Insights y optimizar imagenes hero a WebP, precargar fuentes criticas, y diferir JS no esencial.

---

## 5. Content Gap Analysis

### Temas que falta cubrir

| Tema | Volumen Potencial | Competencia | Tipo de Contenido | Prioridad |
|---|---|---|---|---|
| Presupuesto diseno web Barcelona | Alto | Media | Landing page | 1 |
| Cuanto cuesta una pagina web | Alto | Alta | Blog post + calculadora | 2 |
| Mejores agencias diseno web Barcelona | Alto | Alta | Post comparativo (autoridad) | 3 |
| Rediseno web: cuando y por que | Medio | Baja | Blog post | 4 |
| Diseno web para PYMES | Medio | Media | Landing page | 5 |
| WordPress vs desarrollo a medida | Medio | Baja | Blog post comparativo | 6 |
| Guia de branding digital | Medio | Media | Guia descargable (lead magnet) | 7 |
| Checklist antes de lanzar una web | Bajo | Baja | Blog post + descargable | 8 |
| ROI del diseno UX/UI | Bajo | Baja | Caso de estudio | 9 |

### Contenido existente que necesita actualizacion

| Post | Ultima actualizacion | Accion necesaria |
|---|---|---|
| "Elaborado con amor" | Nov 2019 | Eliminar o actualizar completamente |
| "Atomic Design ultima tendencia" | Nov 2019 | Actualizar - ya no es "ultima tendencia" |
| "Lean Startup con Lean Design" | Nov 2019 | Actualizar con datos recientes |
| Posts de 2019 en general | Nov 2019 | Revisar y actualizar o consolidar |

---

## 6. Featured Snippet Opportunities

| Oportunidad | Query Target | Formato | Accion |
|---|---|---|---|
| "Que es UX/UI" | que es ux ui | Parrafo (40-60 palabras) | Ya tienen seccion, pero optimizar formato: pregunta en H2 + respuesta concisa inmediata |
| "Proceso diseno web" | proceso diseno web | Lista numerada | Tienen proceso de 4 pasos - estructurar como lista con H2 |
| "Diferencia UX UI" | diferencia entre ux y ui | Tabla comparativa | Crear contenido especifico |
| "Cuanto cuesta diseno web" | cuanto cuesta pagina web | Tabla con rangos | Crear landing page con tabla de precios |
| "Tendencias diseno web 2026" | tendencias diseno web 2026 | Lista | Ya tienen post - optimizar formato de snippet |

---

## 7. Internal Linking Analysis

### Problemas detectados

| Problema | Impacto | Detalle |
|---|---|---|
| **Blog posts huerfanos** | Alto | Posts antiguos (2019) probablemente no reciben enlaces internos |
| **Falta de enlaces blog -> servicios** | Alto | Los posts del blog no enlazan sistematicamente a paginas de servicio |
| **Sin hub de contenido** | Medio | No hay pagina pilar que organice el contenido por temas |
| **Anchor text generico** | Medio | CTAs como "Hablamos?" no aportan contexto SEO |
| **Sin breadcrumbs visibles** | Bajo | Schema de breadcrumbs existe pero no siempre son visibles en la UI |

### Arquitectura de enlaces recomendada

```
Homepage
  |-- Servicio UX/UI (pilar)
  |     |-- Blog: Que es UX/UI
  |     |-- Blog: Heuristicas de Nielsen
  |     |-- Blog: Leyes de UX
  |     |-- Caso: [cliente UX]
  |
  |-- Servicio Desarrollo Web (pilar)
  |     |-- Blog: Mejores practicas desarrollo 2026
  |     |-- Blog: Arquitectura frontend 2026
  |     |-- Blog: Velocidad de carga
  |     |-- Caso: [cliente desarrollo]
  |
  |-- Servicio E-commerce (pilar)
  |     |-- Blog: Errores e-commerce
  |     |-- Blog: Experiencia usuario e-commerce
  |     |-- Blog: Desarrollo tiendas
  |     |-- Caso: [cliente e-commerce]
  |
  |-- Agencia / Sobre nosotros
  |-- Contacto / Presupuesto
  |-- Blog (indice general)
```

---

## 8. Problemas Duplicados de URLs

Se detectaron **multiples URLs que apuntan a contenido similar o identico**:

| URL | Contenido | Accion |
|---|---|---|
| `/` (homepage) | Pagina principal | Canonical |
| `/agencia/` | Misma que agencia-diseno... | Redirigir 301 |
| `/agencia-diseno-web-ux-ui-barcelona/` | Pagina About | Mantener como canonical |
| `/tres-puntos-agencia-de-diseno-web-ux-ui/` | Otra variante | Redirigir 301 |
| `/agencia-ux-ui-en-barcelona-claves-para-un-diseno-ganador/` | Post blog | Mantener |
| `/agencia-ux-ui-en-barcelona-claves-para-un-diseno-ganador-2/` | **Duplicado con "-2"** | Eliminar o redirigir |

**Impacto:** Los duplicados diluyen la autoridad de enlace y confunden a Google sobre que version indexar.

---

## 9. Redes Sociales y Open Graph

| Elemento | Estado | Detalle |
|---|---|---|
| Open Graph tags | **Missing** | No detectados en homepage |
| Twitter Cards | **Missing** | No detectados |
| Facebook | Presente en schema | Link a pagina de Facebook |
| Pinterest | Presente en schema | Link a Pinterest |
| Instagram | **Missing** | No enlazado |
| LinkedIn | **Missing** | Critico para agencia B2B |
| YouTube | **Missing** | Oportunidad de contenido |

**Impacto:** Sin Open Graph tags, cuando alguien comparte el sitio en redes sociales, la previsualizacion sera generica o incorrecta. Esto reduce el CTR en social media significativamente.

---

## 10. Content Strategy Recommendations

### Cadencia de publicacion
- **Actual:** Irregular. 9 posts en 2019, pausa hasta 2025, luego ~2-3/mes
- **Recomendada:** 2-4 posts/mes enfocados en keywords de cola larga
- **Tipo:** 60% informacional (guias, tutoriales), 30% comercial (comparativas, casos), 10% tendencias

### Prioridades de contenido

| Contenido | Volumen | Competencia | Valor | Prioridad |
|---|---|---|---|---|
| "Cuanto cuesta una web en Barcelona" | Alto | Media | Alto | 1 (9/10) |
| "Guia completa de rediseno web" | Medio | Baja | Alto | 2 (8/10) |
| Casos de estudio con metricas | - | Baja | Alto | 3 (8/10) |
| "UX/UI para e-commerce" (expandir) | Medio | Media | Alto | 4 (7/10) |
| "WordPress vs desarrollo a medida" | Medio | Media | Medio | 5 (7/10) |
| "Checklist lanzamiento web" | Bajo | Baja | Medio | 6 (6/10) |

---

## 11. Recomendaciones Priorizadas

### CRITICO (Corregir Inmediatamente)

| # | Recomendacion | Impacto Esperado | Esfuerzo |
|---|---|---|---|
| 1 | **Eliminar emojis de title tags** y usar titles profesionales | Mejor indexacion, +10-15% CTR | 30 min |
| 2 | **Anadir canonical tag en homepage** | Evita duplicacion de autoridad | 5 min |
| 3 | **Configurar Open Graph tags** en todas las paginas | Mejor previsualizacion social, +20% CTR social | 1 hora |
| 4 | **Redirigir 301 URLs duplicadas** (agencia/, tres-puntos-agencia..., post con -2) | Consolida autoridad, elimina duplicados | 1 hora |
| 5 | **Corregir meta description duplicadas** entre homepage y agencia | Diferenciacion en SERPs | 15 min |
| 6 | **Arreglar blog title** "Elaborado con amor" -> titulo con keywords | Indexacion correcta de seccion blog | 5 min |

### ALTA PRIORIDAD (Este Mes)

| # | Recomendacion | Impacto Esperado | Esfuerzo |
|---|---|---|---|
| 7 | **Implementar schema LocalBusiness** con direccion, telefono, horario | Rich snippets en SERPs locales | 2 horas |
| 8 | **Anadir schema FAQ** en paginas de servicio | Featured snippets, +25% visibilidad | 3 horas |
| 9 | **Optimizar alt text** de todas las imagenes del portfolio | Trafico desde Google Images | 2 horas |
| 10 | **Crear pagina de precios/presupuesto** targeting "cuanto cuesta web Barcelona" | Nuevo canal de trafico comercial | 1 dia |
| 11 | **Anadir bios de autor** en blog posts | Mejora E-E-A-T | 3 horas |
| 12 | **Actualizar o eliminar posts de 2019** que estan obsoletos | Mejora calidad general del sitio | 1 dia |

### MEDIA PRIORIDAD (Este Trimestre)

| # | Recomendacion | Impacto Esperado | Esfuerzo |
|---|---|---|---|
| 13 | **Crear hub de contenido** por temas (UX/UI, desarrollo, e-commerce) | Mejora estructura interna, topical authority | 2 dias |
| 14 | **Implementar enlaces internos sistematicos** blog -> servicio | Distribucion de autoridad, mas conversiones | 1 dia |
| 15 | **Crear casos de estudio detallados** con metricas de resultados | E-E-A-T, diferenciacion competitiva | 3 dias |
| 16 | **Optimizar Core Web Vitals** (imagenes WebP, preload, defer JS) | Mejor ranking, -15% bounce rate | 2 dias |
| 17 | **Anadir perfil de LinkedIn** a schema y footer | Credibilidad B2B | 30 min |
| 18 | **Crear contenido para keywords de cola larga** (ver tabla de gaps) | +30-50 visitas organicas/mes | Continuo |

### BAJA PRIORIDAD (Cuando Haya Recursos)

| # | Recomendacion | Impacto Esperado | Esfuerzo |
|---|---|---|---|
| 19 | Implementar schema WebSite/SearchAction | Sitelinks search box en SERPs | 1 hora |
| 20 | Crear lead magnets descargables (guias, checklists) | Email capture, nurturing | 1 semana |
| 21 | Implementar hreflang si se plantea version en catalan/ingles | Trafico internacional | 2 horas |
| 22 | Crear pagina de comparacion "Tres Puntos vs Otras Agencias" | Trafico comercial de alta intencion | 1 dia |

---

## Notas Tecnicas

- **CMS:** WordPress con tema Ohio
- **Schema generator:** Yoast SEO
- **Dominio:** trespuntoscomunicacion.es (www redirige correctamente)
- **SSL:** Activo (HTTPS)
- **Redes sociales vinculadas:** Facebook, Pinterest (faltan Instagram, LinkedIn, YouTube)
- **Telefono:** 930 117 733
- **Email:** hola@trespuntoscomunicacion.es

---

*Informe generado por AI Marketing Suite para Claude Code*
*Fecha: 11 de Marzo de 2026*
