# Handoff sesión Claude Code — 2026-05-10

> Documento de continuación. Léelo entero antes de seguir trabajando en el tema "Arquitectura de Contexto + modo light".

## TL;DR (lo mínimo que necesitas saber)

1. Hay **1 commit local sin push** en la branch `claude/context-architecture-setup-LNrbb`: `9099bc0`. Hay que subirlo.
2. Se descartó el plan grande de "Arquitectura de Contexto Tres Puntos v1.0" — se hizo solo el mínimo necesario (BRAND.md + regla logos en CLAUDE.md).
3. Queda pendiente verificar el **modo light en el proyecto de documentos funcionales** (los archivos viven en tu Mac, este sandbox no tenía acceso).
4. El modo light de la web (`css/design-system.css`) está **incompleto** — decisión pendiente sobre si se arregla o se documenta como "solo showcase".

---

## Lo que se hizo en esta sesión

### 1. Revisión del documento "Arquitectura de Contexto Tres Puntos — Git + Notion v1.0"

Decisión tras revisión: **NO ejecutar el plan completo hoy.**

Razón corta: 6-8h de implementación + 1h/mes de mantenimiento sin retorno medible. Hay deuda más impactante en el CLAUDE.md (PSI 67 vs 95, 71 workflows n8n sin auditar, MDP LinkedIn, redirect loop en `/servicios/`, skill `/og-generate`, etc.).

Triggers documentados para retomar el plan completo:
- Contratación de alguien que no sea Jordi (necesidad real de onboarding)
- Un agente IA genera contenido con voz desactualizada y un cliente lo recibe
- GEMA/Jordan/Kobe rompen producción por leer una versión vieja de identidad

### 2. Los 30 minutos mínimos sí ejecutados

**Commit `9099bc0` contiene:**

- **`BRAND.md`** nuevo en la raíz del repo. Es la fuente canónica de:
  - Regla logos `dark` vs `light` (sufijo se refiere al fondo, no al color del logo)
  - Tabla de uso (qué archivo va sobre qué fondo)
  - Errores típicos a evitar
  - URLs absolutas para uso externo
  - Tokens de color resumen
  - Guía de acceso para agentes IA (raw GitHub, producción, filesystem)
  - Checklist de 4 puntos antes de usar el logo

- **`CLAUDE.md`** actualizado con:
  - Sección "Logos y assets de marca — REGLA OBLIGATORIA" insertada antes de "Rol de Claudio". Resumen + tabla + mnemotécnica + errores + URLs canónicas + referencia a `/BRAND.md`.
  - Plan "Sync Notion ↔ Archivos locales (Cerebro Digital)" marcado como **SUPERSEDED** con rationale, triggers y nota de que el contenido sigue siendo válido como base para una futura implementación.

### 3. Auditoría del modo light en el design system web

Estado real (verificado leyendo `css/design-system.css` y `design-system.html`):

| Capa | Modo dark | Modo light | Notas |
|---|---|---|---|
| Tokens en `css/design-system.css` (lo que cargan TODAS las páginas reales) | OK | **NO existe** | Crítico si se quiere usar light en producción |
| Tokens en `design-system.html` (showcase) | OK | OK | Toggle visual funciona |
| Componentes con override `[data-theme="light"]` dentro del HTML showcase | n/a | Limitado | btn-primary/secondary/ghost, input, label, badge, mint, text-gradient |
| Componentes sin override (hueco) | n/a | Faltan | Cards (testimonio, cierre-form, faq, caso, servicio), custom-select, footer, browser-mock, form-gradient-accent |
| Hardcoded `rgba(93,255,191,...)` literal sin usar `var(--mint-rgb)` | n/a | Roto | 11+ ocurrencias en design-system.css, 5 en components.css. En light esos rgba siguen siendo el mint dark `#5DFFBF` aunque el token cambie a `#059669` |

**Conclusión web:** el modo light vive solo en el showcase del propio design-system.html, no en el CSS que cargan las páginas reales. Si pones `data-theme="light"` en home, casos, contacto, etc., no pasa nada.

### 4. Auditoría del modo light en documentos funcionales — NO REALIZADA

Imposible desde este sandbox. Los archivos están en tu Mac (`/documentos_funcionales_trespuntos/master/doc-library.css`, `design-tokens.json`, `05-design-tokens.md`). No hay repo público en `trespuntoslab/` con ese nombre, y `doc.trespuntos-lab.com` está protegido (403).

**Esta es la primera tarea cuando arranques Claude Code en el Mac.**

---

## Lo que tienes que hacer ahora (en orden)

### Paso 1 — Push del commit pendiente

Estás en la branch `claude/context-architecture-setup-LNrbb`. Hay 1 commit local sin pushear.

```bash
git status                              # debe decir "Your branch is ahead of 'origin/...' by 1 commit"
git log -1 --oneline                    # debe mostrar 9099bc0
git push -u origin claude/context-architecture-setup-LNrbb
```

(Razón por la que no se pusheó automáticamente: tu CLAUDE.md tiene regla "NUNCA hacer git push sin permiso EXPLÍCITO de Jordi en el chat". Esta sesión no recibió el OK.)

### Paso 2 — Auditar modo light en el proyecto de documentos funcionales

Desde Claude Code en tu Mac, navegar a `/documentos_funcionales_trespuntos/` (o donde lo tengas) y pedir esta auditoría:

```
Audita el modo light en este proyecto. Concretamente:

1. Lee master/doc-library.css y dime:
   - ¿Hay tokens light definidos a nivel de :root, [data-theme="light"], o equivalente?
   - ¿Qué tokens existen en cada modo (bg, text, border, mint, shadow, gradient)?
   - ¿Hay overrides de componentes para light, o solo cambian los tokens?

2. Lee design-tokens.json y dime:
   - ¿Hay un set "light" y otro "dark", o solo un set?
   - ¿Qué consume este JSON (skills, scripts, generadores)?

3. Lee master/05-design-tokens.md y dime:
   - ¿Documenta cuándo usar cada modo?
   - ¿Hay reglas claras de uso (ej. "PDFs imprimibles en light, web en dark")?

4. Compara contra BRAND.md de trespuntoslab/trespuntos:
   https://raw.githubusercontent.com/trespuntoslab/trespuntos/main/BRAND.md
   ¿Hay incoherencias entre los tokens del web y los tokens de docs?
   ¿La regla de logo dark/light es la misma?

5. Reporte final:
   - Estado del modo light (completo / parcial / inexistente)
   - Gaps concretos
   - Recomendación corta (mantener / completar / unificar con web)

NO modifiques nada. Solo audita y reporta.
```

### Paso 3 — Decidir qué hacer con el modo light de la web

Cuando tengas la auditoría del Paso 2, vuelve y decide entre estas opciones (las propuse en la sesión de hoy):

| Opción | Esfuerzo | Cuándo |
|---|---|---|
| **A. Dejar como está** | 0 | Si solo necesitas logo light + showcase del DS |
| **B. Mover tokens light a `css/design-system.css` + reemplazar `rgba(93,255,191,...)` por `rgba(var(--mint-rgb),...)`** | 1-2h | Si una skill/PDF/documento web necesita tema light coherente |
| **C. B + override light de cards, custom-select, footer, browser, form decorativo** | 4-6h | Si vas a publicar versión light de la web (improbable) |
| **D. Documentar que "modo light de componentes web es solo showcase, no producción"** en `BRAND.md` y `CLAUDE.md` | 15 min | Si decides B/C no merece la pena |

Mi recomendación de la sesión: **D ahora + B cuando aparezca el caso de uso real**.

Pero esa decisión depende de lo que descubras en el Paso 2:
- Si el proyecto de docs funcionales **sí tiene modo light bien implementado** → la skill `trespuntos-documentos` probablemente ya consume tokens light propios y no necesita los del web. Opción D es segura.
- Si el proyecto de docs funcionales **NO tiene modo light o lo tiene a medias** → unificarlo con el web (opción B) tiene más sentido, porque arreglas dos sistemas a la vez.

### Paso 4 — Si decides arreglar (opción B)

Trabajo concreto, ~1-2h:

1. Mover el bloque `[data-theme="light"]{...}` de `design-system.html` (líneas 449-468) a `css/design-system.css` justo después del `:root{...}` actual.
2. Reemplazar todas las apariciones de `rgba(93,255,191,...)` por `rgba(var(--mint-rgb),...)` en:
   - `css/design-system.css` (~11 sitios)
   - `css/components.css` (~5 sitios)
   - `css/case-study.css` (revisar)
3. Mover overrides de componentes (`[data-theme="light"] .btn-primary`, `.input`, `.label`, `.section-badge`, etc.) de `design-system.html` a `design-system.css`.
4. Actualizar `design-system.html` para que la fecha de "Última actualización" refleje el cambio.
5. Test visual: cargar `data-theme="light"` en home en local, verificar que botones/inputs/badges se ven coherentes.

---

## Estado del repo al cierre de la sesión

```
Branch: claude/context-architecture-setup-LNrbb
Último commit local: 9099bc0 (sin push)
Commit message: docs: add BRAND.md + logo rule at top of CLAUDE.md, supersede Notion sync plan
Archivos:
  BRAND.md         (nuevo, 91 líneas)
  CLAUDE.md        (modificado, +49 líneas, -3 líneas)
  HANDOFF.md       (este documento, sin commitear todavía)
```

---

## Pendientes mayores del CLAUDE.md (no tocados hoy, mayor impacto)

Por si después del modo light tienes tiempo, estos rinden más que ordenar contexto:

1. **Discrepancia PSI público (67-69) vs Lighthouse local (95)** — afecta SEO/conversión, no resuelto hace semanas
2. **Botón "Rechazar" del banner CookieConsent en mint** — debería ser outline, GDPR
3. **71 workflows n8n sin auditar** — riesgo de credenciales filtradas residuales tras la sanitización del 2026-05-03
4. **Aplicar al MDP de LinkedIn** — 2 min de formulario, automatización oficial gratuita
5. **Loop redirect en `/servicios/`** preexistente en `.htaccess` — pierde tráfico
6. **Skill `/og-generate {ruta}`** — productividad real cada vez que creas blog/caso/servicio nuevo
7. **Reactivar quick replies post-welcome del widget Jordan v7** cuando el detector sea más robusto

---

## Reglas que NO debes saltarte (recordatorio)

Las que apliquen tras este handoff:

- `git push` solo con OK explícito tuyo en el chat
- Antes de tocar el logo en cualquier sitio, leer `/BRAND.md` (no inventar SVG nuevos)
- Producción NUNCA debe contener archivos que no estén en git (`git status` limpio antes de FTP)
- Cualquier cambio CSS de tokens implica actualizar `/design-system.html` con la fecha
- `media="print" onload="this.media='all'"` solo si el critical CSS cubre el 100% del above-the-fold (lección del fix FOUC del 2026-04-10)

---

**Última actualización del handoff:** 2026-05-10
**Próxima revisión:** después de Paso 2 (auditoría docs funcionales)
