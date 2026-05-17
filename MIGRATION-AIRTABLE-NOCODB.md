# Migración Airtable → NocoDB — Plan Completo

**Fecha:** 2026-05-17  
**Motivo:** `PUBLIC_API_BILLING_LIMIT_EXCEEDED` en el plan gratuito de Airtable (1.000 calls/mes por workspace). Con 4 workspaces, el upgrade cuesta mínimo $80/mes.  
**Fix inmediato ya aplicado:** `continueOnFail: true` en los nodos Airtable de n8n → Telegram + email backup se disparan aunque Airtable falle.

---

## ⚠️ ANTES DE EJECUTAR: evaluar 3 alternativas, no solo NocoDB

Recomiendo evaluar estas 3 opciones antes de comprometer 16-24h a la migración a NocoDB. Hay una claramente mejor.

### Opción A — Supabase (ya en el stack) — **RECOMENDADA**

**Coste:** $0  
**Tiempo estimado:** **4-6h** (vs 16-24h de NocoDB)  
**Por qué no se descartó antes:** CLAUDE.md dice que Supabase se descartó "por riesgo de exponer schema `trespuntos` en Kong". Pero esa decisión asumía que el frontend escribiría directamente. **Aquí n8n y server.py escriben server-side** → no necesitan Kong/PostgREST → el riesgo desaparece.

**Ventajas concretas:**
- Supabase Postgres ya está corriendo en el VPS (instalado, backups automáticos, RLS, etc.)
- Schema `trespuntos` ya tiene tabla `leads` creada (vacía pero estructurada)
- n8n tiene nodo nativo Supabase + nodo nativo Postgres — ambos funcionan vía service role key
- server.py ya tiene conexión Postgres (la usa para `web_metrics`)
- SQL estándar — sin lenguajes propietarios tipo `filterByFormula` ni `where` raros
- Upsert nativo en SQL (`INSERT ... ON CONFLICT DO UPDATE`)
- Backup y restore son `pg_dump` / `pg_restore` estándar
- Dashboard mantiene su REST API (server.py endpoints) — sin cambios desde el cliente
- Cero servicio nuevo que instalar, mantener, actualizar, monitorizar
- Postgres es 100x más rápido que NocoDB para queries con joins/agregaciones (el dashboard hace muchas)

**Cambios necesarios:**
1. Mover tablas `leads`, `jordan_chat_leads`, `agencias`, `secuencias`, `auditorias`, `revision`, `sectores`, `analisis`, `linkedin_snapshots` de schema `trespuntos` → schema `public` (o crear un schema nuevo `crm` accesible para service role key sin exponer en Kong)
2. Recrear schemas SQL desde las tablas Airtable (script automático con Meta API → SQL DDL — ver Apéndice A)
3. Exportar datos Airtable → CSV → `\copy` a Postgres
4. n8n: reemplazar nodos Airtable por nodos Postgres con queries SQL parametrizadas
5. server.py: reemplazar `_airtable()` helpers por `psycopg2.execute()` con queries SQL

**Desventaja:** No tienes UI tipo Airtable para editar registros manualmente. Pero **Supabase Studio (ya instalado)** te da una interfaz tabular tipo Excel a las tablas en `public`. Para el equipo no técnico que edita registros manualmente (¿Jordi únicamente?), Supabase Studio cubre el caso. Si el equipo necesita una UI más friendly, NocoDB se puede conectar a la misma Postgres como UI de solo lectura (gratis).

### Opción B — NocoDB self-hosted (este documento)

**Coste:** $0 software + ~512MB RAM en VPS  
**Tiempo:** 16-24h  
**Ventaja:** UI más cercana a Airtable, funcionalidad de "base de datos visual"  
**Desventaja:** Servicio nuevo que mantener, actualizar, monitorizar. Más lento que Postgres puro para agregaciones del dashboard. API menos madura (sin upsert nativo). Es un single point of failure adicional.

### Opción C — Consolidar Airtable a 1 workspace + pagar Team ($20/mes)

**Coste:** $20/mes ($240/año)  
**Tiempo:** 4-8h (mover bases entre workspaces)  
**Pregunta clave:** ¿realmente necesitáis 4 workspaces o se pueden consolidar las 4 bases en 1 workspace y pagar solo ese?  
- Si las 4 bases caben en 1 workspace: $20/mes = ~$240/año. Cero migración técnica. UI Airtable mantenida.
- Si necesitan estar separadas (por permisos, por colaboradores externos), entonces sí son 4 workspaces de pago = $80/mes.

**Ventaja:** Cero cambio técnico. Mantiene la UI con la que el equipo está cómodo.  
**Desventaja:** $240+/año recurrente. Vendor lock-in.

### Comparativa rápida

| Criterio | A. Supabase | B. NocoDB | C. Airtable Team |
|---|---|---|---|
| Coste anual | $0 | $0 (recursos VPS) | $240-960 |
| Tiempo migración | 4-6h | 16-24h | 4-8h |
| Servicios nuevos | 0 | 1 (NocoDB) | 0 |
| Performance dashboard | ⚡⚡⚡ | ⚡ | ⚡⚡ |
| UI para no-técnicos | Supabase Studio (básica) | Buena (tipo Airtable) | Excelente |
| Madurez de la API | Muy alta (Postgres) | Media | Muy alta |
| Mantenimiento ongoing | Bajo (ya está) | Medio (nuevo servicio) | Cero |
| Riesgo vendor lock-in | Bajo (SQL estándar) | Bajo | Alto |

**Mi recomendación:** Opción A (Supabase). Razones:
1. Ahorra 12-18 horas de trabajo
2. No añade servicios al stack
3. Postgres es objetivamente la mejor herramienta para esto
4. Schema `trespuntos.leads` ya existe — solo hay que activarlo
5. El "problema Kong" que descartó esta opción antes no aplica aquí (escrituras server-side)

**El resto de este documento describe la Opción B (NocoDB) por si finalmente decides ir por ahí.** Para Opción A (Supabase) habría que reescribir las fases 1-4 con SQL en lugar de calls REST, pero la estructura del plan (qué workflows tocar, qué endpoints de server.py, etc.) es la misma.

---

---

## Estado actual post-fix inmediato

El pipeline de leads NO pierde contactos ahora mismo:
- Telegram a Jordi → se dispara siempre (✅)
- Email backup a Jordi → se dispara siempre (✅)
- Airtable → falla silenciosamente hasta junio 1 (reset de cuota)

**La cuota se resetea el 1 de junio 2026.** La migración puede hacerse con calma antes o después de esa fecha.

---

## Inventario completo de touchpoints

### Airtable bases y tablas

| Base ID | Workspace | Tablas | Usos |
|---|---|---|---|
| `appR9SHmsc6CZ7VJj` | Leads | `tblqbhaPtZlsPbsYs` (Formulario), `tblU72kaxQq7222Do` (Jordan Chat Leads) | n8n pipelines, dashboard, Calendly webhook |
| `appdeN48esyCb1v7H` | Partners | `tbl2aM1UyAnGobiyK` (Revisión), `tblTfO46247IGjsqj` (Agencias), `tblm37sTNy4nAkEG9` (Secuencias), `tblQAQmKowhh3trvu` (Auditorías) | n8n workflows partners, dashboard |
| `applQhJtxCkCGoVnX` | Sectores | `tblsP9bukhbTTMmpz` (Sectores), `tblCPkfja3rjKfztB` (Análisis) | n8n sectores, dashboard |
| `app2vjuhe4kJkrH5u` | Analytics | `tbl7JxNjtOj4s3FYL` (LinkedIn_Snapshots) | script import-xlsx.py |

### n8n workflows con referencias Airtable (20 total)

**Fase 1 — Lead capture (mayor prioridad)**

| ID | Nombre | Operaciones Airtable |
|---|---|---|
| `fxiAWMB3S0eWc1aM` | Pipeline v2.5 — Leads | PATCH upsert `tblqbhaPtZlsPbsYs` (leads form), PATCH upsert `tblqbhaPtZlsPbsYs` (briefing). PAT `patBGMX5BtT70uLSg` hardcoded. **Ya tiene `continueOnFail: true`** |
| `2a6ZaK3pw9j7LPEc` | Jordan Chat Leads | PATCH upsert `tblU72kaxQq7222Do` (initial + final). Upsert por `Session ID` |
| `BLcLAnrGcwUYyDJf` | Kobe | GET `tblTfO46247IGjsqj` (leer datos agencia). PAT en credencial `airtableApiKey` |

**Fase 2 — Partners**

| ID | Nombre | Operaciones Airtable |
|---|---|---|
| `ofNEs2v9y3angTDz` | WF3 Partner Envío | Lee `tblm37sTNy4nAkEG9` (filter Pipeline="✅ Aprobado"), lee agencias, PATCH estado email |
| `s7rw3nSvqKyujlBQ` | WF3 Sectores Envío | Lee `tblm37sTNy4nAkEG9` sectores, PATCH estado |
| `0EMRAOvITiVjlw8y` | WF4 Partner Detección | Lee/PATCH `tblTfO46247IGjsqj` + `tblm37sTNy4nAkEG9` |
| `4DeHrw1yL4kVMsCZ` | WF4 Sectores Detección | Lee/PATCH tablas sectores |
| `brFpHdEdYYOQ00q8` | WF5 Partner Tracking | PATCH `tblQAQmKowhh3trvu` (tracking auditorías) |
| `SRai7Mly38uCOVO7` | WF6 Discovery Partners | Lee `tblTfO46247IGjsqj`, crea/PATCH registros |
| `bSJnIPaz172bivWY` | Sectores Tracking — Landing | PATCH `tblQAQmKowhh3trvu` (visit tracking) |
| `qWTpFhTaHUscC6Z0` | Sectores Tracking — Click E1 | PATCH `tblQAQmKowhh3trvu` (click tracking) |
| `krNI9bFxAhAAjQi1` | Research Agencias | Lee/escribe `tblTfO46247IGjsqj` |
| `AaghmTTXD5Kd4ODe` | WF-Research-Daily | Lee/escribe múltiples tablas partners |

**Fase 3 — Analytics**

| ID | Nombre | Operaciones Airtable |
|---|---|---|
| `2hSkRO4tBO4VZwdx` | Web Metrics Sync — Hourly | Lee/escribe `web_metrics` en Supabase (no Airtable directamente, pero el endpoint VPS llama Airtable) |
| `ICoeXKSd5NQoVsZS` | WF3-test Gmail | Test — baja prioridad |

### server.py en VPS (dash.trespuntos-lab.com)

Auth: env var `AIRTABLE_KEY`  
Helper central: `_airtable(base, table, params)` y `_airtable_paginated(base, table, params)`

**Métodos de LECTURA (10):**

| Método | Base | Tabla | Sort/Filter |
|---|---|---|---|
| `_leads()` | `appR9SHmsc6CZ7VJj` | `tblqbhaPtZlsPbsYs` | sort=Estado, maxRecords=100 |
| `_form_leads()` | `appR9SHmsc6CZ7VJj` | `tblqbhaPtZlsPbsYs` | maxRecords=50, cross-ref Holded |
| `_pipeline()` | `appR9SHmsc6CZ7VJj` | `tblqbhaPtZlsPbsYs` | maxRecords=500 (KPIs) |
| `_revision()` | `appdeN48esyCb1v7H` | `tbl2aM1UyAnGobiyK` | sort=Fecha mínima verificar |
| `_agencies()` | `appdeN48esyCb1v7H` | `tblTfO46247IGjsqj` | sort=Score, maxRecords=100 |
| `_sequences()` | `appdeN48esyCb1v7H` | `tblm37sTNy4nAkEG9` | sort=Nombre Secuencia, maxRecords=100 |
| `_auditorias()` | `appdeN48esyCb1v7H` | `tblQAQmKowhh3trvu` | fields específicos, sort=Ultima Visita, maxRecords=50 |
| `_sectores()` | `applQhJtxCkCGoVnX` | `tblsP9bukhbTTMmpz` + `tblCPkfja3rjKfztB` | ambas paginadas |
| `_linkedin_snapshots()` | `app2vjuhe4kJkrH5u` | `tbl7JxNjtOj4s3FYL` | — |
| Jordan data | `appR9SHmsc6CZ7VJj` | `tblU72kaxQq7222Do` | — |

**Métodos de ESCRITURA (2):**

| Endpoint | Operación | Detalle |
|---|---|---|
| Calendly webhook (`~línea 1031`) | GET filter + PATCH | `filterByFormula=LOWER({Email})="..."`, luego PATCH Estado + Comentarios + Última actualización |
| Approve partner (`~línea 609`) | PATCH | `appdeN48esyCb1v7H/tblm37sTNy4nAkEG9/{record_id}` → Pipeline = "✅ Aprobado" |

### dashboard.html en VPS

```js
const AT_BASE = 'appR9SHmsc6CZ7VJj'   // línea ~5678
const AT_JORDAN = 'tblU72kaxQq7222Do'  // línea ~5679
const AT_FORM = 'tblqbhaPtZlsPbsYs'   // línea ~5680
```
- `atLink()`: genera deep links `airtable.com/appXXX/tblYYY/recZZZ` (solo navegación, no API)
- Links estáticos hardcoded a `airtable.com/appdeN48esyCb1v7H/...` y `airtable.com/appR9SHmsc6CZ7VJj/...`

### scripts/linkedin/import-xlsx.py

```python
AIRTABLE_BASE_ID = "app2vjuhe4kJkrH5u"
AIRTABLE_TABLE_ID = "tbl7JxNjtOj4s3FYL"
# Lee AIRTABLE_PAT de env var o ~/.config/tres-puntos/airtable.env
# PATCH con performUpsert por snapshot_id — batches de 10
```

### PATs a revocar (al final, no antes)

| PAT | Dónde se usa | Permisos |
|---|---|---|
| `patBGMX5BtT70uLSg` | Pipeline v2.5 n8n (hardcoded en header) | Leads base |
| `patjWY5cQ2bhjRDpn` | Otro nodo n8n (no identificado, hacer grep) | Leads base |
| `patN5OZQ6F9GiKkn1` | Partners base (credencial n8n `airtableApiKey` id `zQer745cZNd0kQyb`) | Partners base |

---

## Prerequisitos — Instalar y configurar NocoDB

### 1. Instalar NocoDB en el VPS

```bash
# Opción A: Docker Compose (recomendado — el VPS ya tiene Docker via Dokploy)
# Crear en Dokploy un nuevo servicio Docker Compose:

version: '3.8'
services:
  nocodb:
    image: nocodb/nocodb:latest
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      NC_DB: "pg://localhost:5432?u=nocodb&p=STRONG_PASSWORD&d=nocodb"
      NC_AUTH_JWT_SECRET: "RANDOM_64_CHAR_SECRET"
      NC_PUBLIC_URL: "https://db.trespuntos-lab.com"
    volumes:
      - nocodb_data:/usr/app/data
volumes:
  nocodb_data:
```

Alternativa más simple con SQLite (sin PostgreSQL externo):
```yaml
environment:
  NC_AUTH_JWT_SECRET: "RANDOM_64_CHAR_SECRET"
  NC_PUBLIC_URL: "https://db.trespuntos-lab.com"
volumes:
  - ./nocodb-data:/usr/app/data
```

### 2. Configurar subdominio

En Cloudflare (o DNS del VPS): `db.trespuntos-lab.com` → IP del VPS. Añadir proxy reverso en Nginx/Traefik si ya está configurado en el VPS.

### 3. Generar API token de NocoDB

1. Login en NocoDB UI → Team & Auth → API Tokens → Add New Token
2. Guardar como `NOCODB_API_KEY` en el `.env` del VPS
3. Obtener los IDs de cada tabla tras crearlas (NocoDB genera `tbl_XXXX` IDs propios)

### 4. Instalar nodo NocoDB en n8n

El nodo oficial `n8n-nodes-base.nocoDb` (v3) viene incluido en n8n desde v0.214. Verificar que la versión instalada lo incluye. Si no: actualizar n8n.

### 5. API NocoDB: usar v2, no v1

NocoDB tiene dos APIs simultáneamente:
- **v1** (`/api/v1/db/data/noco/{projectId}/{tableId}`) — legacy, todavía funciona pero **no añadirá features nuevas**
- **v2** (`/api/v2/tables/{tableId}/records`) — **recomendada para nuevos proyectos**

La diferencia clave: v2 no necesita projectId en la URL (solo tableId), tiene mejor soporte para `where` complejos, y es la que el nodo nativo n8n usa internamente.

**Todos los ejemplos de este documento usan v2.** Si algún snippet usa v1, sustituir por v2.

### 6. Recursos VPS para NocoDB

- RAM: ~256-512 MB
- CPU: ~5% en idle, picos al 30% durante queries pesadas
- Disco: depende del volumen de datos (~100MB por cada 10k registros)
- Conviene monitorizar tras instalación porque el VPS ya hospeda n8n + Supabase + Postgres + Dokploy + dashboard. Verificar con `free -h` y `docker stats`.

---

## Fase 1 — Migrar bases críticas (Lead capture)

**Tiempo estimado: 3-4 horas**

### 1a. Crear tablas en NocoDB

#### Tabla: `formulario_leads` (equivale a `tblqbhaPtZlsPbsYs`)

Campos mínimos necesarios (verificar schema real en Airtable antes de migrar):

| Campo Airtable | Tipo Airtable | Campo NocoDB | Tipo NocoDB |
|---|---|---|---|
| Nombre | Single line | nombre | SingleLineText |
| Email empresa | Email | email | Email |
| Teléfono | Phone | telefono | PhoneNumber |
| Servicios | Long text | servicios | LongText |
| Presupuesto | Single select | presupuesto | SingleLineText |
| Estado | Single select | estado | SingleLineText |
| Página origen | URL | pagina_origen | URL |
| UTM Source | Single line | utm_source | SingleLineText |
| UTM Medium | Single line | utm_medium | SingleLineText |
| UTM Campaign | Single line | utm_campaign | SingleLineText |
| Lead Score | Number | lead_score | Number |
| Lead Quality | Single line | lead_quality | SingleLineText |
| Timestamp | Date/time | created_at | DateTime |
| Comentarios | Long text | comentarios | LongText |
| Última actualización | Date/time | updated_at | DateTime |

> ⚠️ Antes de crear manualmente, exportar el schema real desde Airtable: ir a cada tabla → API docs (airtable.com/developers/web/api) para ver todos los campos reales.

#### Tabla: `jordan_chat_leads` (equivale a `tblU72kaxQq7222Do`)

| Campo | Tipo NocoDB |
|---|---|
| Session ID | SingleLineText (campo clave para upsert) |
| nombre | SingleLineText |
| email | Email |
| telefono | PhoneNumber |
| empresa | SingleLineText |
| rol | SingleLineText |
| tipo_proyecto | SingleLineText |
| presupuesto | SingleLineText |
| conversacion_completa | LongText |
| score | Number |
| resumen_ia | LongText |
| stage | SingleLineText (initial/update/final) |
| url_origen | URL |
| created_at | DateTime |
| updated_at | DateTime |

### 1b. Exportar datos históricos de Airtable → NocoDB

```bash
# Script de migración de datos (ejecutar desde terminal local)
python3 << 'EOF'
import requests, json

AIRTABLE_PAT = "patBGMX5BtT70uLSg"  # o el PAT correcto con lectura total
NOCODB_URL = "https://db.trespuntos-lab.com"
NOCODB_TOKEN = "YOUR_NOCODB_TOKEN"
NOCODB_TABLE_ID = "tbl_XXXX"  # ID de la tabla en NocoDB tras crearla

# 1. Leer TODOS los registros de Airtable (paginando)
all_records = []
offset = None
while True:
    params = {"pageSize": 100}
    if offset:
        params["offset"] = offset
    r = requests.get(
        "https://api.airtable.com/v0/appR9SHmsc6CZ7VJj/tblqbhaPtZlsPbsYs",
        headers={"Authorization": f"Bearer {AIRTABLE_PAT}"},
        params=params
    )
    data = r.json()
    all_records.extend(data.get("records", []))
    offset = data.get("offset")
    if not offset:
        break

print(f"Total registros: {len(all_records)}")

# 2. Insertar en NocoDB en batches de 25
BATCH = 25
for i in range(0, len(all_records), BATCH):
    batch = all_records[i:i+BATCH]
    rows = [rec["fields"] for rec in batch]
    r = requests.post(
        f"{NOCODB_URL}/api/v1/db/data/noco/YOUR_PROJECT_ID/{NOCODB_TABLE_ID}/bulk",
        headers={"xc-token": NOCODB_TOKEN, "Content-Type": "application/json"},
        json=rows
    )
    print(f"Batch {i//BATCH + 1}: {r.status_code}")
EOF
```

### 1c. Actualizar Pipeline v2.5 en n8n

**Nodo `Guardar en Airtable` → reemplazar por nodo NocoDB:**

El nodo actual es HTTP Request PATCH con `performUpsert`. NocoDB no tiene upsert nativo, así que el patrón es:

```
[Nuevo subflow de upsert]
  ↓
HTTP GET (NocoDB) — buscar por email
  ?where=(email,eq,{{ $json.email }})
  ↓
IF — ¿existe registro?
  ├─ YES → HTTP PATCH /api/v1/.../RECORD_ID
  └─ NO  → HTTP POST /api/v1/.../bulk
```

**Configuración del nodo HTTP GET (buscar) — API v2:**
```
URL: https://db.trespuntos-lab.com/api/v2/tables/TABLE_ID/records
Method: GET
Headers: xc-token: {{ $env.NOCODB_API_KEY }}
Query params:
  where: (email,eq,{{ $('Preparar Airtable').first().json.email }})
  limit: 1
```

**Configuración del nodo HTTP PATCH (actualizar) — API v2:**
```
URL: https://db.trespuntos-lab.com/api/v2/tables/TABLE_ID/records
Method: PATCH
Headers: xc-token: {{ $env.NOCODB_API_KEY }}
Body: { "Id": {{ $json.list[0].Id }}, ...resto de campos a actualizar... }
```
Nota: en v2 el PATCH recibe el `Id` en el body, no en la URL.

**Configuración del nodo HTTP POST (crear) — API v2:**
```
URL: https://db.trespuntos-lab.com/api/v2/tables/TABLE_ID/records
Method: POST
Headers: xc-token: {{ $env.NOCODB_API_KEY }}
Body: { ...campos... }
```

### 1d. Actualizar Jordan Chat Leads (ID: `2a6ZaK3pw9j7LPEc`)

Mismo patrón de upsert, pero la clave es `Session ID` en lugar de `email`:

```
GET ?where=(session_id,eq,{{ $json.session_id }})&limit=1
IF list[0] exists → PATCH /TABLE_ID/{{ list[0].Id }}
                  → POST /TABLE_ID
```

---

## Fase 2 — Migrar bases Partners y Sectores

**Tiempo estimado: 5-7 horas**

### 2a. Crear tablas en NocoDB

#### Base Partners → NocoDB project "partners"

**Tabla `agencias`** (equivale a `tblTfO46247IGjsqj`):
- Exportar schema real de Airtable API docs
- Campos mínimos: Nombre, Score, Pipeline, Sector, URL, Email contacto, Fecha contacto

**Tabla `secuencias_email`** (equivale a `tblm37sTNy4nAkEG9`):
- Campos: Nombre Secuencia, Pipeline, Estado, Agencia (link), Email enviado, Fecha envío

**Tabla `revision`** (equivale a `tbl2aM1UyAnGobiyK`):
- Campos: Fecha mínima verificar, Estado, Notas

**Tabla `auditorias`** (equivale a `tblQAQmKowhh3trvu`):
- Campos: Última visita, tracking data, agencia linked

#### Base Sectores → NocoDB project "sectores"

**Tabla `sectores`** (equivale a `tblsP9bukhbTTMmpz`)  
**Tabla `analisis`** (equivale a `tblCPkfja3rjKfztB`)

### 2b. Actualizar workflows partners (10 workflows)

Para cada workflow en la Fase 2, el patrón de cambio es:

**Lecturas simples (GET/list):**
```
Antiguo: HTTP GET api.airtable.com/v0/BASE_ID/TABLE_ID?filterByFormula=...
Nuevo:   HTTP GET db.trespuntos-lab.com/api/v1/db/data/noco/PROJECT/TABLE?where=(campo,eq,valor)
```

**Conversión de filterByFormula → NocoDB where:**

| filterByFormula Airtable | where NocoDB |
|---|---|
| `Pipeline = "✅ Aprobado"` | `(pipeline,eq,✅ Aprobado)` |
| `LOWER({Email})="x@y.com"` | `(email,eq,x@y.com)` (NocoDB es case-insensitive por defecto) |
| `{Score}>5` | `(score,gt,5)` |
| `AND({A}="x",{B}="y")` | `(a,eq,x)~and(b,eq,y)` |
| `OR({A}="x",{B}="y")` | `(a,eq,x)~or(b,eq,y)` |

**Operadores NocoDB:**
- `eq` = igual
- `neq` = no igual
- `gt` = mayor que
- `lt` = menor que
- `gte` = mayor o igual
- `lte` = menor o igual
- `like` = contiene (con %)
- `null` = es nulo
- `notnull` = no es nulo

**Ejemplo — WF3 Partner Envío (filtro Pipeline="✅ Aprobado"):**
```
Antiguo URL query: filterByFormula={Pipeline}="✅ Aprobado"
Nuevo URL query:   where=(pipeline,eq,✅ Aprobado)&sort[0][field]=nombre&sort[0][direction]=asc
```

**Escrituras (POST/PATCH):**
Mismo patrón GET + IF → PATCH/POST que en Fase 1.

**Endpoint `approve partner` en server.py:**
Antiguo: `PATCH api.airtable.com/v0/appdeN48esyCb1v7H/tblm37sTNy4nAkEG9/{record_id}`  
Nuevo:   `PATCH db.trespuntos-lab.com/api/v1/db/data/noco/PROJECT/SEQUENCES_TABLE/{nocodb_row_id}`

⚠️ El `record_id` de Airtable (`recXXX`) NO sirve en NocoDB. NocoDB usa IDs numéricos autoincrementales. Al migrar los datos históricos, añadir un campo `airtable_id` para mantener el mapping mientras coexisten ambos sistemas.

---

## Fase 3 — Migrar Analytics (LinkedIn Snapshots)

**Tiempo estimado: 1-2 horas**

### 3a. Crear tabla en NocoDB

**Tabla `linkedin_snapshots`** en project "analytics":

| Campo | Tipo | Notas |
|---|---|---|
| snapshot_id | SingleLineText | `YYYY-MM-DD_trespuntos` — clave única |
| metric_date | Date | |
| impressions | Number | |
| interactions | Number | |
| new_followers | Number | |
| engagement_rate | Decimal | |
| members_reached | Number | solo en is_period_end |
| followers_total | Number | |
| is_period_end | Checkbox | |
| top_posts_by_interactions_json | LongText | JSON stringificado |
| top_posts_by_impressions_json | LongText | |
| demo_jobtitles_json | LongText | |
| demo_locations_json | LongText | |
| demo_industries_json | LongText | |
| demo_seniority_json | LongText | |
| demo_company_size_json | LongText | |
| demo_top_companies_json | LongText | |
| client | SingleLineText | `trespuntos` |

### 3b. Actualizar import-xlsx.py

```python
# Cambiar constantes al inicio del archivo:
NOCODB_URL = os.environ.get("NOCODB_URL", "https://db.trespuntos-lab.com")
NOCODB_TOKEN = os.environ.get("NOCODB_API_KEY", "")
NOCODB_TABLE_ID = "tbl_XXXX"  # ID real tras crear la tabla

# Función de upsert (reemplaza la llamada a Airtable performUpsert):
def nocodb_upsert_snapshot(record: dict) -> dict:
    snapshot_id = record["snapshot_id"]
    
    # Buscar si existe
    r = requests.get(
        f"{NOCODB_URL}/api/v1/db/data/noco/PROJECT_ID/{NOCODB_TABLE_ID}",
        headers={"xc-token": NOCODB_TOKEN},
        params={"where": f"(snapshot_id,eq,{snapshot_id})", "limit": 1}
    )
    existing = r.json().get("list", [])
    
    if existing:
        row_id = existing[0]["Id"]
        r = requests.patch(
            f"{NOCODB_URL}/api/v1/db/data/noco/PROJECT_ID/{NOCODB_TABLE_ID}/{row_id}",
            headers={"xc-token": NOCODB_TOKEN},
            json=record
        )
    else:
        r = requests.post(
            f"{NOCODB_URL}/api/v1/db/data/noco/PROJECT_ID/{NOCODB_TABLE_ID}",
            headers={"xc-token": NOCODB_TOKEN},
            json=record
        )
    return r.json()
```

---

## Fase 4 — Migrar server.py y dashboard.html en VPS

**Tiempo estimado: 4-6 horas**

### 4a. Añadir variable de entorno NOCODB_API_KEY al VPS

```bash
# En el .env del VPS o en docker-compose del servicio
NOCODB_API_KEY=your_nocodb_token_here
NOCODB_URL=https://db.trespuntos-lab.com
```

### 4b. Refactorizar helpers en server.py

```python
# AÑADIR — nuevos helpers NocoDB
import os

NOCODB_URL = os.environ.get("NOCODB_URL", "https://db.trespuntos-lab.com")
NOCODB_TOKEN = os.environ.get("NOCODB_API_KEY", "")

# IDs de tablas NocoDB (rellenar tras crear las tablas)
NOCODB_TABLES = {
    "leads_form":     {"project": "PROJECT_ID", "table": "tbl_XXXX"},
    "jordan_leads":   {"project": "PROJECT_ID", "table": "tbl_YYYY"},
    "agencias":       {"project": "PROJECT_ID", "table": "tbl_ZZZZ"},
    "secuencias":     {"project": "PROJECT_ID", "table": "tbl_AAAA"},
    "auditorias":     {"project": "PROJECT_ID", "table": "tbl_BBBB"},
    "revision":       {"project": "PROJECT_ID", "table": "tbl_CCCC"},
    "sectores":       {"project": "PROJECT_ID", "table": "tbl_DDDD"},
    "analisis":       {"project": "PROJECT_ID", "table": "tbl_EEEE"},
    "linkedin":       {"project": "PROJECT_ID", "table": "tbl_FFFF"},
}

def _nocodb(table_key: str, params: dict = None) -> dict:
    """GET paginado a NocoDB."""
    t = NOCODB_TABLES[table_key]
    url = f"{NOCODB_URL}/api/v1/db/data/noco/{t['project']}/{t['table']}"
    r = requests.get(
        url,
        headers={"xc-token": NOCODB_TOKEN},
        params=params or {},
        timeout=10
    )
    r.raise_for_status()
    return r.json()

def _nocodb_paginated(table_key: str, params: dict = None) -> list:
    """Lee TODOS los registros paginando automáticamente."""
    t = NOCODB_TABLES[table_key]
    url = f"{NOCODB_URL}/api/v1/db/data/noco/{t['project']}/{t['table']}"
    all_rows = []
    page = 1
    while True:
        p = dict(params or {})
        p["limit"] = 100
        p["offset"] = (page - 1) * 100
        r = requests.get(url, headers={"xc-token": NOCODB_TOKEN}, params=p, timeout=10)
        r.raise_for_status()
        data = r.json()
        rows = data.get("list", [])
        all_rows.extend(rows)
        page_info = data.get("pageInfo", {})
        if not page_info.get("isLastPage", True):
            page += 1
        else:
            break
    return all_rows

def _nocodb_patch(table_key: str, row_id: int, fields: dict) -> dict:
    """PATCH un registro por su ID numérico de NocoDB."""
    t = NOCODB_TABLES[table_key]
    url = f"{NOCODB_URL}/api/v1/db/data/noco/{t['project']}/{t['table']}/{row_id}"
    r = requests.patch(
        url,
        headers={"xc-token": NOCODB_TOKEN, "Content-Type": "application/json"},
        json=fields,
        timeout=10
    )
    r.raise_for_status()
    return r.json()
```

**Conversión de cada método (ejemplos):**

```python
# ANTES — _leads() con Airtable
def _leads():
    return _airtable(
        "appR9SHmsc6CZ7VJj",
        "tblqbhaPtZlsPbsYs",
        {"sort[0][field]": "Estado", "sort[0][direction]": "asc", "maxRecords": 100}
    )

# DESPUÉS — _leads() con NocoDB
def _leads():
    return _nocodb("leads_form", {
        "sort[0][field]": "estado",
        "sort[0][direction]": "asc",
        "limit": 100
    })

# ANTES — Calendly webhook (filterByFormula + PATCH)
# (~línea 1031 en server.py)
def handle_calendly(email: str, data: dict):
    # Buscar por email
    r = _airtable("appR9SHmsc6CZ7VJj", "tblqbhaPtZlsPbsYs",
                  {"filterByFormula": f'LOWER({{Email}})="{email.lower()}"'})
    records = r.get("records", [])
    if records:
        record_id = records[0]["id"]
        # PATCH
        requests.patch(
            f"https://api.airtable.com/v0/appR9SHmsc6CZ7VJj/tblqbhaPtZlsPbsYs/{record_id}",
            headers={"Authorization": f"Bearer {AIRTABLE_KEY}"},
            json={"fields": data}
        )

# DESPUÉS — Calendly webhook con NocoDB
def handle_calendly(email: str, data: dict):
    # Buscar por email (NocoDB es case-insensitive por defecto)
    result = _nocodb("leads_form", {
        "where": f"(email,eq,{email})",
        "limit": 1
    })
    rows = result.get("list", [])
    if rows:
        row_id = rows[0]["Id"]
        _nocodb_patch("leads_form", row_id, data)
```

### 4c. Eliminar referencias a `AIRTABLE_KEY` en server.py

Una vez migrados todos los métodos, eliminar:
- `AIRTABLE_KEY = os.environ.get("AIRTABLE_KEY", "")`
- Funciones `_airtable()` y `_airtable_paginated()` originales
- Todos los imports de Airtable si los hay

### 4d. Actualizar dashboard.html

```javascript
// ANTES
const AT_BASE = 'appR9SHmsc6CZ7VJj'
const AT_JORDAN = 'tblU72kaxQq7222Do'
const AT_FORM = 'tblqbhaPtZlsPbsYs'

// DESPUÉS — adaptar atLink() para apuntar a NocoDB UI
// NocoDB también tiene URLs de registro: /nc/PROJECT_ID/table/TABLE_ID/record/ROW_ID
function atLink(tableKey, rowId) {
    const tables = {
        form: 'tbl_XXXX',
        jordan: 'tbl_YYYY',
        // etc
    }
    return `https://db.trespuntos-lab.com/nc/PROJECT_ID/${tables[tableKey] || tableKey}/${rowId}`
}
```

Los links estáticos a `airtable.com/appXXX/...` del dashboard son solo de navegación — actualizarlos con las URLs de NocoDB correspondientes.

---

## Patrones técnicos de referencia

### Patrón upsert en NocoDB (en n8n)

Añadir este subflow para cualquier operación que antes usaba `performUpsert`:

```
[Inicio] → HTTP GET NocoDB (buscar por campo único)
         ↓
         IF {{ $json.pageInfo.totalRows > 0 }}
         ├─ YES → Set RECORD_ID = {{ $json.list[0].Id }}
         │        → HTTP PATCH NocoDB /TABLE/{{ $('Set RECORD_ID').first().json.id }}
         └─ NO  → HTTP POST NocoDB /TABLE
```

### Conversión filterByFormula completa

```
# Airtable → NocoDB
{Field}="value"                    → (field,eq,value)
{Field}!="value"                   → (field,neq,value)
{Field}>5                          → (field,gt,5)
{Field}<5                          → (field,lt,5)
LOWER({Email})="x@y.z"            → (email,eq,x@y.z)  # NocoDB case-insensitive
FIND("texto",{Field})>0            → (field,like,%texto%)
{Field}=""                         → (field,null,true)
{Field}!=""                        → (field,notnull,true)
AND({A}="x",{B}="y")              → (a,eq,x)~and(b,eq,y)
OR({A}="x",{B}="y")               → (a,eq,x)~or(b,eq,y)
AND(OR({A}="x",{B}="y"),{C}="z") → ((a,eq,x)~or(b,eq,y))~and(c,eq,z)
```

### Auth en n8n — NocoDB

Opción A: Header directo en cada nodo HTTP Request:
```
Header: xc-token = {{ $env.NOCODB_API_KEY }}
```

Opción B: Credencial nativa n8n de tipo "Generic Credential" con el token, y reusar en todos los nodos NocoDB.

El nodo nativo n8n NocoDB v3 también acepta credencial tipo "NocoDB API" directamente — preferible a HTTP Request manual.

---

## Checklist de testing por fase

### Fase 1 — Leads

- [ ] NocoDB levantado y accesible en `db.trespuntos-lab.com`
- [ ] Tablas `formulario_leads` y `jordan_chat_leads` creadas con todos los campos
- [ ] Datos históricos exportados desde Airtable e importados en NocoDB
- [ ] Pipeline v2.5 n8n actualizado: envío form → upsert en NocoDB
- [ ] **Test real**: Enviar formulario desde `trespuntoscomunicacion.es` → verificar registro en NocoDB
- [ ] **Test real**: Chat Jordan hasta email capturado → verificar Telegram 🟡 + registro en NocoDB
- [ ] **Test real**: Chat Jordan completo → verificar Telegram 💬 + actualización registro en NocoDB (no duplicado)
- [ ] Calendly webhook en server.py: simular evento Calendly → verificar update en NocoDB
- [ ] Dashboard leads: pestaña Captación muestra datos de NocoDB

### Fase 2 — Partners

- [ ] Tablas agencias, secuencias, revisión, auditorías creadas
- [ ] Datos históricos migrados
- [ ] WF3 Partner Envío: filtro por Pipeline = Aprobado funciona
- [ ] WF5 Tracking: update de auditoría funciona
- [ ] Approve partner desde dashboard → Pipeline se actualiza en NocoDB
- [ ] Dashboard pestaña Partners muestra datos

### Fase 3 — Analytics

- [ ] Tabla `linkedin_snapshots` creada
- [ ] Datos históricos migrados (91 registros desde 2025-09)
- [ ] import-xlsx.py: `--dry-run` muestra los records correctamente
- [ ] import-xlsx.py: inserción real de snapshot nuevo funciona
- [ ] Protección "rango grande gana" funciona correctamente

### Fase 4 — VPS

- [ ] `NOCODB_API_KEY` y `NOCODB_URL` en env del VPS
- [ ] Todos los métodos `_leads()`, `_form_leads()`, `_pipeline()`, `_revision()`, `_agencies()`, `_sequences()`, `_auditorias()`, `_sectores()`, `_linkedin_snapshots()` actualizados
- [ ] server.py no tiene ninguna referencia a `api.airtable.com`
- [ ] Dashboard carga sin errores en las 7 pestañas
- [ ] `atLink()` genera URLs de NocoDB válidas

---

## Revocación de PATs Airtable (ÚLTIMO PASO)

**No revocar hasta que TODO lo anterior esté probado en producción.**

1. Entrar en Airtable → Account → Developer hub → Personal access tokens
2. Revocar `patBGMX5BtT70uLSg` (Leads, Pipeline v2.5)
3. Revocar `patjWY5cQ2bhjRDpn` (buscar dónde está antes de revocar — hacer grep en n8n MCP)
4. Revocar `patN5OZQ6F9GiKkn1` (Partners, credencial `airtableApiKey` id `zQer745cZNd0kQyb` en n8n)
5. Eliminar credencial `airtableApiKey` de n8n (Team → Credentials → buscar "airtable")
6. Eliminar `AIRTABLE_KEY` del env del VPS

---

## Estimación de tiempo total

| Fase | Tarea | Tiempo estimado |
|---|---|---|
| Prerequisitos | Instalar NocoDB + configurar dominio | 1-2 h |
| Fase 1 | Tablas leads + n8n Pipeline v2.5 + Jordan | 3-4 h |
| Fase 2 | Tablas partners + 10 workflows | 5-7 h |
| Fase 3 | LinkedIn Analytics + script | 1-2 h |
| Fase 4 | server.py + dashboard.html | 4-6 h |
| Testing | Todas las fases | 2-3 h |
| **Total** | | **16-24 h** |

---

## Decisión de timing

**Opción A — Migrar antes del 1 junio** (urgente):
- Pro: dashboard y workflows 100% funcionales sin errores
- Contra: 16-24h de trabajo bajo presión

**Opción B — Esperar al 1 junio, migrar en junio**:
- Pro: cuota se resetea → todo funciona hasta julio sin urgencia
- Contra: el problema reaparecerá en julio si no se migra
- El `continueOnFail: true` ya garantiza que NO se pierden leads mientras tanto

**Recomendación**: Opción B. Esperar al reset de junio, planificar la migración en semanas del 9-20 junio con calma. Empezar por Fase 1 (leads) que es la más crítica, en un fin de semana.

---

## Notas adicionales

### Sobre el plan gratuito de Airtable
- 1.000 calls/mes **por workspace** (no por tabla ni por usuario)
- Con 4 workspaces: Leads, Partners, Sectores, Analytics → potencialmente 4.000 calls/mes total
- Las calls se consumen en LECTURA y ESCRITURA
- El dashboard hace múltiples lecturas por cada refresh → consume rápido
- Considerar añadir más agresivo caching en server.py para reducir calls mientras se usa Airtable

### Sobre NocoDB
- La UI de NocoDB es funcional pero más básica que Airtable (sin Kanban nativo tan pulido, sin automations integradas)
- Para las operaciones del dashboard (solo lectura desde server.py) no afecta la UI
- Las fórmulas de Airtable (campos calculados) hay que recrearlas como campos fórmula en NocoDB o calcularlos en n8n/server.py
- NocoDB soporta WebSockets para actualizaciones en tiempo real (no lo usamos actualmente)

### Backup antes de migrar
```bash
# Exportar TODOS los datos de Airtable antes de empezar
# Para cada base: usar el botón "Download CSV" en cada tabla
# CSV solo cubre campos básicos — no cubre attachments, ni linked records correctamente
# Para backup completo usar el script del Apéndice B
```

---

## Apéndice A — Extraer schema completo de Airtable automáticamente

CSV no captura tipos de campo. La Airtable Metadata API sí. Script para extraer todos los schemas de las 4 bases:

```python
#!/usr/bin/env python3
"""Extrae el schema completo de todas las bases Airtable a JSON."""
import requests, json, os

PAT = os.environ["AIRTABLE_PAT"]  # PAT con scope schema.bases:read
BASES = {
    "leads":     "appR9SHmsc6CZ7VJj",
    "partners":  "appdeN48esyCb1v7H",
    "sectores":  "applQhJtxCkCGoVnX",
    "analytics": "app2vjuhe4kJkrH5u",
}

for name, base_id in BASES.items():
    r = requests.get(
        f"https://api.airtable.com/v0/meta/bases/{base_id}/tables",
        headers={"Authorization": f"Bearer {PAT}"}
    )
    data = r.json()
    with open(f"airtable_schema_{name}.json", "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Resumen legible
    print(f"\n=== {name} ({base_id}) ===")
    for table in data.get("tables", []):
        print(f"\n  Tabla: {table['name']} ({table['id']})")
        for field in table.get("fields", []):
            ftype = field.get("type", "?")
            options = field.get("options", {})
            extras = ""
            if ftype == "singleSelect" or ftype == "multipleSelects":
                choices = [c["name"] for c in options.get("choices", [])]
                extras = f" choices={choices}"
            print(f"    - {field['name']} ({ftype}){extras}")
```

Esto te da el schema exacto: nombres de campos, tipos, choices de selects, formats de campos calculados, etc. Sirve tanto para recrear en NocoDB como para generar DDL SQL si vas por Supabase.

---

## Apéndice B — Backup completo previo a migración

El "Download CSV" de Airtable no es suficiente para campos complejos. Backup full:

```python
#!/usr/bin/env python3
"""Backup completo: cada tabla a JSON con TODOS los datos."""
import requests, json, os, time

PAT = os.environ["AIRTABLE_PAT"]
BASES_TABLES = [
    ("appR9SHmsc6CZ7VJj", "tblqbhaPtZlsPbsYs", "leads_form"),
    ("appR9SHmsc6CZ7VJj", "tblU72kaxQq7222Do", "jordan_chat_leads"),
    ("appdeN48esyCb1v7H", "tbl2aM1UyAnGobiyK", "revision"),
    ("appdeN48esyCb1v7H", "tblTfO46247IGjsqj", "agencias"),
    ("appdeN48esyCb1v7H", "tblm37sTNy4nAkEG9", "secuencias"),
    ("appdeN48esyCb1v7H", "tblQAQmKowhh3trvu", "auditorias"),
    ("applQhJtxCkCGoVnX", "tblsP9bukhbTTMmpz", "sectores"),
    ("applQhJtxCkCGoVnX", "tblCPkfja3rjKfztB", "sectores_analisis"),
    ("app2vjuhe4kJkrH5u", "tbl7JxNjtOj4s3FYL", "linkedin_snapshots"),
]

for base, table, name in BASES_TABLES:
    print(f"Backing up {name}...")
    all_records = []
    offset = None
    while True:
        params = {"pageSize": 100}
        if offset:
            params["offset"] = offset
        r = requests.get(
            f"https://api.airtable.com/v0/{base}/{table}",
            headers={"Authorization": f"Bearer {PAT}"},
            params=params
        )
        if r.status_code == 429:
            print("  Rate limited, waiting 30s...")
            time.sleep(30)
            continue
        if r.status_code != 200:
            print(f"  ERROR: {r.status_code} {r.text}")
            break
        data = r.json()
        all_records.extend(data.get("records", []))
        offset = data.get("offset")
        if not offset:
            break
        time.sleep(0.2)  # rate limit defensivo
    
    with open(f"backup_{name}.json", "w") as f:
        json.dump(all_records, f, indent=2, ensure_ascii=False)
    print(f"  Saved {len(all_records)} records to backup_{name}.json")
```

Guardar los backups en Dropbox + Git LFS antes de empezar la migración. Si algo sale mal, son el rollback.

---

## Apéndice C — Estrategia dual-write durante la migración

No hacer cutover directo. Durante 2 semanas escribir en AMBOS sistemas en paralelo:

```
n8n Pipeline v2.5:
   ↓
   [Preparar Airtable]
   ↓
   ├─ HTTP PATCH Airtable (continueOnFail: true)   ← legacy
   └─ HTTP POST/PATCH NocoDB (continueOnFail: true) ← nuevo
   ↓
   [Resto del flow]
```

**Ventajas:**
- Si NocoDB falla por algo, Airtable sigue siendo source of truth
- Permite comparar registros en ambos sistemas y validar paridad
- Rollback = quitar el nodo NocoDB, cero pérdida
- Dashboard puede empezar a leer de NocoDB en paralelo y comparar

**Cuándo hacer el cutover definitivo:**
1. Mínimo 100 leads escritos en ambos sistemas verificados idénticos
2. Dashboard funciona 100% leyendo solo de NocoDB durante 1 semana
3. No hubo incidencias en n8n por culpa del nodo NocoDB

Tras cutover: borrar nodos Airtable, revocar PATs (sección final del doc).

---

## Apéndice D — Mystery PAT `patjWY5cQ2bhjRDpn`

Antes de revocar, identificar dónde se usa:

```bash
# 1. En el repo web local
grep -r "patjWY5cQ2bhjRDpn" /Users/jordi/Library/CloudStorage/Dropbox/backupok/TRESPUNTOS-LAB/Trespuntos-web-cloude/

# 2. En el VPS (server.py, .env, dashboard.html)
ssh tp-vps "grep -r 'patjWY5cQ2bhjRDpn' /root/ 2>/dev/null"

# 3. En todos los workflows n8n
# Vía MCP n8n: n8n_list_workflows + n8n_get_workflow para cada uno, grep en el JSON
```

Si tras esos 3 greps no aparece: el PAT está sin uso → revocar sin riesgo.

---

## Apéndice E — Tipos de campo Airtable especiales (atención)

Estos tipos necesitan tratamiento especial en NocoDB (o Postgres si vas por Supabase):

| Tipo Airtable | Cómo recrear en NocoDB | Cómo recrear en Postgres |
|---|---|---|
| Linked records | Crear campo `Links` apuntando a otra tabla | FK + tabla join si es many-to-many |
| Single select | Campo `SingleSelect` con opciones predefinidas | `CHECK (col IN ('a','b','c'))` o `ENUM` |
| Multiple select | Campo `MultiSelect` | `TEXT[]` array o tabla join |
| Lookup | Campo `Lookup` apuntando a campo de tabla linked | `VIEW` con JOIN |
| Rollup | Campo `Rollup` con agregación | `VIEW` con `SUM`/`COUNT`/etc |
| Formula | Campo `Formula` (sintaxis distinta a Airtable) | Columna `GENERATED ALWAYS AS (...)` o `VIEW` |
| Attachment | Campo `Attachment` (NocoDB necesita storage configurado, ej. S3 o local) | `TEXT[]` con URLs externas (almacenar en S3/Cloudflare R2) |
| Created time | Campo `CreatedTime` | `DEFAULT now()` |
| Last modified | Campo `LastModifiedTime` | Trigger BEFORE UPDATE |
| Created by / Modified by | No nativo (campo `Collaborator` parcial) | Manual via trigger + auth context |
| Auto number | Campo `AutoNumber` | `BIGSERIAL` o `IDENTITY` |
| Barcode | No soportado | `TEXT` |
| Button | No soportado | N/A |

**Atención especial a `Pipeline` en partners** — es Single Select con opciones tipo "✅ Aprobado" que incluyen emojis. NocoDB soporta emojis en select values, Postgres también. Pero el match exacto del string es crítico — copiar literal, incluido el espacio entre emoji y palabra.

---

## Apéndice F — Conversión `_form_leads()` con cross-ref Holded

El método `_form_leads()` en server.py NO es solo lectura de Airtable: además cruza cada lead con la API de Holded para enriquecerlo con datos de contacto CRM. Eso NO depende de Airtable y NO cambia en la migración — solo cambia la lectura inicial:

```python
# ANTES
def _form_leads():
    airtable_leads = _airtable("appR9SHmsc6CZ7VJj", "tblqbhaPtZlsPbsYs", {"maxRecords": 50})
    # ...luego enriquece con Holded para cada lead
    
# DESPUÉS (NocoDB)
def _form_leads():
    leads = _nocodb("leads_form", {"limit": 50, "sort[0][field]": "created_at", "sort[0][direction]": "desc"})
    # ...mismo enriquecimiento Holded sin cambios

# DESPUÉS (Supabase)
def _form_leads():
    with _pg_conn() as conn:
        leads = conn.execute("""
            SELECT * FROM crm.leads_form 
            ORDER BY created_at DESC 
            LIMIT 50
        """).fetchall()
    # ...mismo enriquecimiento Holded sin cambios
```

---

## Apéndice G — Diferencias de paginación

| Sistema | Cómo paginar |
|---|---|
| Airtable | `offset` = string token devuelto en respuesta anterior. Iterar hasta no recibir `offset` |
| NocoDB v2 | `offset` numérico + `limit`. Respuesta incluye `pageInfo.isLastPage` |
| Postgres (Supabase) | `LIMIT n OFFSET m` o keyset pagination con `WHERE id > last_id` |

Postgres con keyset es muchísimo más eficiente para tablas grandes que la paginación offset de los otros dos. Punto a favor de Supabase.
