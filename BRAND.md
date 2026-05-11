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
