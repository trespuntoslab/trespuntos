# Plan de test — Curry Blog Publisher

Antes de activar el cron diario, verificar que todo el flujo funciona end-to-end con un artículo real.

**Tiempo estimado: 30 minutos**

---

## Pre-requisitos

Antes de testear, confirma que tienes:

- [ ] Database `📝 Blog Posts` en Notion creada y con ≥4 rows
- [ ] Integración Notion conectada a la database
- [ ] Variables de entorno configuradas en n8n (`NOTION_BLOG_DATA_SOURCE_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`)
- [ ] Credenciales en n8n: `Notion · Curry Blog`, `Nominalia FTP`, `Claudio Bot Telegram`
- [ ] Workflow `📝 Curry — Blog Publisher Daily` importado en n8n (no activado todavía)
- [ ] Repo GitHub `trespuntoslab/trespuntos` con los 4 HTMLs locales pusheados
- [ ] Repo es privado → necesitas un PAT GitHub. Si es público → no hace falta.

---

## Test 1 — Conectividad básica (5 min)

### 1.1 — Notion query

En n8n, abre el workflow y ejecuta solo el nodo **`Notion · Buscar artículo de hoy`** con "Test step":

- Edita el `jsonBody` temporalmente para que filtre **cualquier** artículo (no por fecha):
  ```json
  { "filter": { "property": "Estado", "status": { "equals": "Aprobado" } } }
  ```
- Click "Test step"
- ✅ Debería devolver 3 artículos (Art. 2, 3 y 4 que están en `Aprobado`)
- Si falla con 401: revisa el token Notion
- Si falla con 404: revisa el `data_source_id`
- Si devuelve `results: []`: la integración no tiene acceso a la DB. Vuelve a `setup-notion-db.md` paso 4.

Restaura el `jsonBody` original tras el test.

### 1.2 — Descarga GitHub raw

En el nodo **`Descargar HTML del repo`**, configura URL manual:
```
https://raw.githubusercontent.com/trespuntoslab/trespuntos/main/blog/desarrollo-web-a-medida-vs-wordpress/index.html
```
- Click "Test step"
- ✅ Debería devolver el HTML (~30 KB)
- Si falla con 404: el HTML no está en GitHub. Haz `git push` desde tu local.
- Si falla con 401/403 y el repo es privado: añade un header `Authorization: token ghp_…` con tu PAT GitHub.

### 1.3 — FTP upload (con archivo de prueba)

Crea un archivo de prueba:
```bash
echo "test curry $(date)" > /tmp/curry-test.txt
```

En el nodo **`FTP · Subir HTML`**, ajusta temporalmente:
- `path`: `/curry-test.txt`
- `fileContent`: pega "test curry"

Ejecuta. ✅ HTTP 226 = OK.

Verifica:
```bash
curl -s "https://www.trespuntoscomunicacion.es/curry-test.txt"
# debe devolver: test curry ...
```

Borra el archivo de prueba después:
```bash
curl -k --ftp-pasv -Q "DELE /curry-test.txt" \
  "ftp://claude%40trespuntoscomunicacion.es:Y20pC%267L%214z%28%24%256g@ftp.trespuntoscomunicacion.es/"
```

### 1.4 — Cloudflare purge

En el nodo **`Cloudflare · Purge by URL`**, ejecuta con un URL real ya cacheado:
```json
{"files":["https://www.trespuntoscomunicacion.es/"]}
```
✅ Debería devolver `"success":true`.

### 1.5 — Telegram

Click en el nodo **`Telegram · Aviso publicado`** → "Test step" con datos dummy. ✅ Debe llegar mensaje al grupo Mesa 3P.

---

## Test 2 — End-to-end con Art. 2 (15 min)

Este es el test real. Vamos a publicar Art. 2 (`Desarrollo web a medida vs WordPress`) **antes** de su fecha programada (20 mayo) ejecutando el workflow manualmente.

### Preparación

1. En la database Notion, confirma que el row de Art. 2 tiene:
   - Slug: `desarrollo-web-a-medida-vs-wordpress`
   - Fecha publicación: `2026-05-20`
   - Estado: `Aprobado`

2. **Cambia temporalmente la fecha a HOY** (4 mayo 2026) para que el filter del workflow lo pille.

### Ejecutar

1. En n8n, abre el workflow `📝 Curry — Blog Publisher Daily`
2. Click **"Execute workflow"** (no "Test step", ejecuta el flujo entero)
3. Observa cada nodo:
   - ✅ Cron trigger no se dispara en manual, salta directo a Notion query
   - ✅ Notion query devuelve 1 resultado
   - ✅ IF dice "true"
   - ✅ Code extrae datos
   - ✅ HTTP descarga HTML (~30 KB) y OG (~250 KB) en paralelo
   - ✅ FTP sube ambos
   - ✅ Cloudflare purge OK
   - ✅ Notion update Estado → Publicado
   - ✅ Telegram aviso llega al grupo

### Verificar en producción

```bash
# Comprobar que el HTML está servido
curl -sI "https://www.trespuntoscomunicacion.es/blog/desarrollo-web-a-medida-vs-wordpress/" | grep -E "HTTP|cf-cache-status"
# Debe devolver HTTP 200

# Comprobar componentes
curl -sL "https://www.trespuntoscomunicacion.es/blog/desarrollo-web-a-medida-vs-wordpress/" | grep -oE "pain-block|signal-card|stat-callout|comparison-table|checklist-box" | sort | uniq -c

# Comprobar OG
curl -sI "https://www.trespuntoscomunicacion.es/img/og/blog-desarrollo-web-a-medida-vs-wordpress.png" | grep HTTP
```

### Después del test

1. **Restaura la fecha** del row Notion a `2026-05-20` (la fecha real del plan)
2. **Restaura el Estado** a `Aprobado` (el workflow lo cambió a `Publicado`)
3. **Borra el HTML de producción** si no quieres que esté público hasta el 20 mayo:
   ```bash
   curl -k --ftp-pasv -Q "DELE /blog/desarrollo-web-a-medida-vs-wordpress/index.html" \
     "ftp://claude%40trespuntoscomunicacion.es:Y20pC%267L%214z%28%24%256g@ftp.trespuntoscomunicacion.es/"
   ```
   (Y purga Cloudflare después)

---

## Test 3 — Activar cron y dejarlo correr (5 min)

Si los tests 1 y 2 pasaron:

1. En n8n, **toggle el workflow a Active** (esquina superior derecha)
2. **Verifica que NO hay artículos en Notion con `Estado=Aprobado AND Fecha=hoy`** (excepto los que quieras publicar hoy)
3. Espera a las 09:00 del próximo día programado (20 mayo para Art. 2)
4. A las 09:00, deberías recibir notificación Telegram

---

## Plan de mitigación si falla

### Síntoma: el cron no dispara
- Verificar timezone del workflow: debe ser `Europe/Madrid`
- Verificar que el workflow está activo (toggle on)
- Mirar `Executions` en n8n

### Síntoma: Notion no devuelve nada
- Confirmar fecha del filter: usa `{{ $now.format('yyyy-MM-dd') }}` en zona Madrid
- Confirmar que el row tiene `Estado = Aprobado` exactamente

### Síntoma: descarga GitHub falla 404
- Verificar que el HTML está en `main` branch
- Verificar URL exacta: `raw.githubusercontent.com/trespuntoslab/trespuntos/main/blog/{slug}/index.html`

### Síntoma: FTP falla
- Probar credentials manualmente con curl
- Verificar que `ftp.trespuntoscomunicacion.es` resuelve (no `trespuntoscomunicacion.es` sin el `ftp.`)

### Síntoma: Cloudflare purge devuelve 403
- Token expirado o sin permisos `Purge`
- Zone ID incorrecto

### Síntoma: Notion update falla 400
- La integración no tiene permiso de escritura
- El nombre `Estado` o `URL real` no coincide exactamente con el de la DB

---

## Rollback

Si algo va mal en producción tras un publish:

1. **Borrar HTML del FTP**:
   ```bash
   curl -k --ftp-pasv -Q "DELE /blog/{slug}/index.html" "ftp://...@ftp.trespuntoscomunicacion.es/"
   ```
2. **Purgar Cloudflare** (Custom Purge by URL)
3. **Pausar el workflow** (toggle off) hasta investigar
4. Avisar Telegram al grupo Mesa 3P
