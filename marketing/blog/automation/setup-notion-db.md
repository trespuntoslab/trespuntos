# Setup Plan Blog Notion → Database

Conviértete la página actual del **Plan Blog** Notion en una **database** para que el workflow `Curry Blog Publisher` pueda filtrarla por fecha + estado.

**Tiempo estimado: 15 minutos**

---

## Paso 1 — Crear la database desde la página actual

1. Abre la página del Plan Blog en Notion: `Mesa Partners → 📝 Plan Blog — trespuntoscomunicacion.es | Mayo–Agosto 2026`
2. Encima de la tabla actual de los 16 artículos, escribe `/database` y selecciona **"Database — Inline"**
3. Nombra la nueva database: **`📝 Blog Posts`**

> **Importante:** crea una database nueva, no conviertas la tabla actual. La tabla actual la podemos dejar como referencia visual.

---

## Paso 2 — Definir las propiedades

En la database `📝 Blog Posts`, configura estas 8 propiedades:

| Propiedad | Tipo | Valores / formato |
|---|---|---|
| **Título** | `Title` (default) | Ej. "Desarrollo web a medida vs WordPress: cuándo elegir cada uno" |
| **Slug** | `Text` | Ej. `desarrollo-web-a-medida-vs-wordpress` |
| **Fecha publicación** | `Date` | Ej. `2026-05-20` (sin hora, solo fecha) |
| **Estado** | `Status` | Opciones: `Pendiente`, `Maquetado`, `Aprobado`, `Publicado`, `Rechazado` |
| **Categoría** | `Select` | Opciones: `Ecommerce`, `Desarrollo Web`, `UX / UI`, `Arquitectura Digital`, `Performance`, `IA y Automatización` |
| **Servicio refuerza** | `URL` | Ej. `https://www.trespuntoscomunicacion.es/servicios/desarrollo-web-a-medida-barcelona/` |
| **URL real** | `URL` | Se rellena automáticamente cuando se publica |
| **Notas** | `Text` (opcional) | Cualquier nota interna |

---

## Paso 3 — Rellenar los 16 artículos

Crea un row por cada artículo del plan. Mínimo los 4 que ya tenemos listos:

| # | Título | Slug | Fecha | Estado | Categoría |
|---|---|---|---|---|---|
| 1 | Cómo elegir una agencia ecommerce en Barcelona | `como-elegir-agencia-ecommerce-barcelona` | 2026-05-05 | **Publicado** | Ecommerce |
| 2 | Desarrollo web a medida vs WordPress | `desarrollo-web-a-medida-vs-wordpress` | 2026-05-20 | **Aprobado** | Desarrollo Web |
| 3 | Agencia diseño UX/UI: cómo evaluar propuestas | `agencia-diseno-ux-ui-evaluar-propuestas` | 2026-05-27 | **Aprobado** | UX / UI |
| 4 | Tiendas online: 4 puntos de fricción | `tiendas-online-barcelona-puntos-friccion-conversion` | 2026-06-03 | **Aprobado** | Ecommerce |
| 5–16 | (resto del plan) | … | … | **Pendiente** | … |

**Estados:**
- `Pendiente` — todavía sin redactar
- `Maquetado` — HTML local listo, pendiente OK Jordi
- `Aprobado` — Jordi ha dado OK, listo para publicar el día programado
- `Publicado` — el workflow ya lo subió
- `Rechazado` — no se va a publicar

> **Curry solo publica los que están en `Aprobado`** y cuya fecha = hoy. Si quieres pausar, cambias a otro estado.

---

## Paso 4 — Conectar la integración Notion

1. Ve a https://www.notion.so/profile/integrations
2. **Crear integración** llamada `Curry Blog Publisher`
3. Workspace: el de Tres Puntos
4. Capabilities: lectura + actualización de contenido
5. **Copia el token** (empieza por `ntn_…`) — lo necesitas en `setup-tokens.md`

Después en la página del Plan Blog Notion:
- Click en **`···`** (top-right de la database)
- **Connections → Add connection** → busca `Curry Blog Publisher` → conectar
- Verifica permisos de lectura/escritura

---

## Paso 5 — Obtener el data source ID de la database

n8n necesita el ID de la **data source** (la tabla concreta dentro de la database).

1. Abre la database `📝 Blog Posts` en Notion
2. Click en `···` → `Open as page`
3. Click en `Copy link`
4. La URL será algo como: `https://www.notion.so/abc123def456...?v=xyz789`
5. El `data_source_id` lo obtienes haciendo una llamada GET a `/v1/databases/{database_id}` y mirando la propiedad `data_sources[0].id`

**Atajo:** desde la skill `/blog-maqueta` Claude puede llamar al MCP de Notion para obtener el ID. Pídeselo después de crear la DB.

---

## Verificación

Cuando esté hecho, deberías poder:
- Ver la database con los 16 rows (al menos los 4 primeros)
- La integración `Curry Blog Publisher` aparece en `Connections`
- Tienes el `data_source_id` apuntado para el siguiente paso (configurar tokens)

Pasa al archivo `setup-tokens.md` para los tokens de Cloudflare + el del paso anterior.
