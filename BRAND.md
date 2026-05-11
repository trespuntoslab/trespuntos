# BRAND.md — Assets canónicos de marca Tres Puntos

> **Regla obligatoria para humanos y agentes IA.**
> Si vas a usar el logo de Tres Puntos (en una imagen OG, un email, un PDF, una landing, lo que sea), lee esto **antes**.

Última actualización: 2026-05-11

---

## Logos — Cuál usar y cuándo

**El sufijo `-dark` / `-light` se refiere al FONDO sobre el que se coloca el logo, NO al color del logo.**
Esta es la confusión más recurrente. Léelo dos veces.

| Archivo | Color anillos | Color centros/texto | Usar SOBRE fondo... | Ejemplos |
|---|---|---|---|---|
| `img/logo-trespuntos-dark.svg` | Mint `#5DFFBF` | Blanco `#F8F8F8` | **OSCURO** (negro, `#0e0e0e`, mint dark) | Web Tres Puntos (tema dark), imágenes OG, footer oscuro, email dark |
| `img/logo-trespuntos-light.svg` | Mint `#5DFFBF` | Negro `#1A1A1A` | **CLARO** (blanco, gris claro, beige) | Dashboards modo light, documentos sin restricción de contraste AA |
| `img/logo-trespuntos-email.png` | (PNG raster) | — | Email clientes (compatible Outlook/Gmail) | Solo emails. PNG con transparencia. |

### Regla mnemotécnica
> *"Logo dark va sobre dark. Logo light va sobre light."*
> Si el fondo es `#0e0e0e` (la web) → `logo-trespuntos-dark.svg`. Punto.

### Errores típicos a EVITAR
- ❌ Usar `logo-trespuntos-light.svg` sobre la web (fondo oscuro) → centros negros invisibles
- ❌ Usar `logo-trespuntos-dark.svg` en un PDF blanco → centros blancos invisibles
- ❌ Mezclar versiones distintas en el mismo documento
- ❌ Reescribir el SVG a mano "para ahorrar bytes" → siempre usar el archivo original
- ❌ Usar el PNG email en pantalla (es raster, se ve borroso)

### Variante para impresión / PDF

Para documentos que se imprimen o generan como PDF (propuestas, contratos), el mint brillante `#5DFFBF` **no cumple WCAG AA sobre fondo blanco** (ratio de contraste insuficiente). Se usa una variante con mint oscurecido:

| Asset | Ubicación | Cuándo usar |
|---|---|---|
| `logo-print.svg` | `documentos-funcionales-trespuntos/master/brand/` | PDFs, contratos, mPDF, papel impreso |

Este logo se genera aplicando `sed 's/#5dffbf/#0FA36C/gi'` sobre `logo-light.svg`. El mint `#0FA36C` cumple contraste AA sobre blanco. No está en este repo — vive en el proyecto de documentos funcionales.

---

## URLs absolutas (para usar fuera del repo)

Cuando necesites linkar al logo desde un email, una imagen OG, un agente externo o una integración:

```
https://www.trespuntoscomunicacion.es/img/logo-trespuntos-dark.svg
https://www.trespuntoscomunicacion.es/img/logo-trespuntos-light.svg
https://www.trespuntoscomunicacion.es/img/logo-trespuntos-email.png
```

Estas URLs sirven la versión que está en producción (Nominalia, vía Cloudflare). Se actualiza al subir el repo por FTP.

---

## Tokens de color (resumen)

| Token | Hex | Uso |
|---|---|---|
| `--mint` | `#5DFFBF` | Color principal de marca, anillos del logo, web dark |
| `--bg-base` | `#0e0e0e` | Fondo oscuro (web) |
| `--text-light` | `#F8F8F8` | Texto sobre fondo oscuro / centros logo dark |
| `--text-dark` | `#1A1A1A` | Texto sobre fondo claro / centros logo light |
| *(sin token web)* | `#0FA36C` | **Mint oscurecido — solo docs/PDF/impresión.** Cumple AA sobre blanco; `#5DFFBF` no. |

Para el set completo de tokens CSS ver `/css/design-system.css`.  
Para la paleta del modo light/print (documentos funcionales) ver `doc-library.css` en el proyecto de docs.

---

## Para agentes IA — cómo acceder a los assets

Si eres un agente IA (Claude Code, n8n, skill custom, GEMA, Jordan, etc.) y necesitas el logo:

**Opción 1 — fetch al raw de GitHub** (recomendado para skills):
```
https://raw.githubusercontent.com/trespuntoslab/trespuntos/main/img/logo-trespuntos-dark.svg
```

**Opción 2 — descargar de producción** (recomendado para imágenes OG):
```
https://www.trespuntoscomunicacion.es/img/logo-trespuntos-dark.svg
```

**Opción 3 — leer del filesystem** (Claude Code Mac/VPS con repo clonado):
```
img/logo-trespuntos-dark.svg
```

**NUNCA** generar SVGs nuevos "que parezcan el logo". Si por algún motivo el archivo no está disponible, paras y avisas.

---

## Checklist rápido antes de usar el logo

- [ ] ¿Sé de qué color es el fondo donde va?
- [ ] ¿He elegido el archivo correcto (`-dark` para fondos oscuros, `-light` para fondos claros, `logo-print.svg` para PDFs impresos)?
- [ ] ¿Estoy usando el SVG (no una versión rasterizada borrosa)?
- [ ] ¿El logo tiene espacio de respiro alrededor (mínimo igual a la altura de un anillo)?

Si los cuatro son sí, adelante.

---

## Modo light — Estado y guía de implementación

> Esta sección es para cuando decidas activar el modo light en la web, un cliente, o cualquier nuevo proyecto.  
> La referencia "done right" ya existe: `doc-library.css` del proyecto de documentos funcionales tiene el modo light completo en producción desde abril 2026.

### Tokens completos para `[data-theme="light"]` (copia-pega ready)

Paleta derivada de `doc-library.css`, adaptada a los nombres de token del web (sin prefijo `--tp-`).

```css
[data-theme="light"] {
  /* Mint oscurecido: #5DFFBF no cumple WCAG AA sobre blanco, #0FA36C sí */
  --mint:        #0FA36C;
  --mint-hover:  #0C8A5B;
  --mint-rgb:    15, 163, 108;  /* CRÍTICO: actualizar siempre junto a --mint */

  /* Fondos: warm off-white, evita el blanco clínico */
  --bg-base:     #F7F6F3;
  --bg-surface:  #FFFFFF;
  --bg-subtle:   #F0EFEB;
  --bg-muted:    #E8E6E0;

  /* Texto */
  --text-primary:   #141414;
  --text-secondary: #4A4A4A;
  --text-muted:     #6E6E6E;

  /* Bordes */
  --border-base:    #E4E2DC;
  --border-subtle:  #EEECE6;
  --border-strong:  #D0CEC6;

  /* Sombras (reemplaza las dark que usan rgba(0,0,0,...)) */
  --shadow-elevation: 0 8px 32px rgba(24,24,20,.12), 0 2px 8px rgba(24,24,20,.08);
  --shadow-brand:     0 0 24px rgba(15,163,108,.15);
}
```

### Estado actual en la web (`css/design-system.css`) — auditado 2026-05-10

| Capa | Estado | Notas |
|---|---|---|
| Bloque `[data-theme="light"]` en `css/design-system.css` | ❌ No existe | Solo en `design-system.html` (showcase), no en el CSS que cargan las páginas |
| `--mint-rgb` actualizado en light | ❌ Sin bloque, no aplica | Si no se actualiza, todos los `rgba(var(--mint-rgb),...)` siguen en mint dark |
| Overrides de componentes light en CSS principal | ❌ No existe | Solo parcialmente en el showcase |
| `rgba(93,255,191,...)` hardcoded en `design-system.css` | ⚠️ ~11 ocurrencias | No se adaptan al cambiar `--mint-rgb`; necesitan reemplazarse |
| `rgba(93,255,191,...)` hardcoded en `components.css` | ⚠️ ~5 ocurrencias | Ídem |
| `rgba(255,255,255,...)` glassmorphism dark | ⚠️ ~28 ocurrencias | Invisibles en light (blanco sobre blanco); los críticos necesitan override |
| Componentes sin override light en showcase | ⚠️ Parcial | Faltan: cards testimonio, cierre-form, faq, caso, servicio; custom-select; footer; browser-mock; form-gradient-accent |

**Referencia**: `doc-library.css` resuelve todos estos problemas — revisar su sección `[data-theme="light"]` (líneas ~37-54) y los overrides de componente (líneas ~1155-1253) antes de implementar en la web.

### Checklist de activación para la web (est. 1-2h)

Orden estricto — cada paso depende del anterior:

- [ ] **Paso 1** — Copiar los tokens de arriba como bloque `[data-theme="light"]` en `css/design-system.css`, justo después del bloque `:root {}` existente.
- [ ] **Paso 2** — Reemplazar `rgba(93,255,191,X)` por `rgba(var(--mint-rgb),X)` en:
  - `css/design-system.css` (~11 ocurrencias — buscar con `grep -n "rgba(93"`)
  - `css/components.css` (~5 ocurrencias)
  - `css/case-study.css` (revisar)
- [ ] **Paso 3** — Añadir overrides de componentes para light en `css/design-system.css`. Prioridad: cards, custom-select, footer, browser-mock, form-gradient-accent. Copiar el patrón de `doc-library.css` líneas 1155-1253.
- [ ] **Paso 4** — Actualizar la fecha en `design-system.html` (header y footer del showcase).
- [ ] **Paso 5** — Test visual local: poner `data-theme="light"` en el `<html>` de `index.html` y verificar: botones, inputs, badges, cards, footer, navbar. Quitar antes del commit.
- [ ] **Paso 6** — Commit en rama propia (`feat/light-mode`) y test en staging antes de FTP a producción.

### Cuándo implementar

No hay urgencia — el modo dark funciona bien y es la identidad visual de Tres Puntos. Implementar cuando:
- Un cliente necesite una versión light de su producto (basado en este design system)
- Se decida ofrecer toggle dark/light en la propia web de Tres Puntos
- Un nuevo proyecto con esta base requiera fondo claro por defecto
