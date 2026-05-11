# Setup Tokens para Curry Blog Publisher

El workflow necesita 4 credenciales. 2 ya existen en n8n (FTP + Telegram), 2 hay que crear (Notion + Cloudflare).

**Tiempo estimado: 10 minutos**

---

## 1. Notion API Token

✅ **Ya creado** en `setup-notion-db.md` paso 4.

**En n8n:**
1. Settings → Credentials → New
2. Tipo: **Notion API**
3. Nombre: `Notion · Curry Blog`
4. API Key: `ntn_…` (el que copiaste)
5. Save

---

## 2. Cloudflare API Token

### Crear el token

1. Login en https://dash.cloudflare.com
2. Click derecho-arriba en el avatar → **My Profile** → **API Tokens**
3. **Create Token** → **Custom token**
4. Configuración:
   - **Token name:** `Curry Blog Publisher — Cache Purge`
   - **Permissions:**
     - Zone | Cache Purge | **Purge**
   - **Zone Resources:**
     - Include | Specific zone | `trespuntoscomunicacion.es`
   - **Client IP Address Filtering:** dejar vacío (n8n VPS rotará IP)
   - **TTL:** sin expiración (o 1 año si prefieres rotar)
5. **Continue to summary** → **Create Token**
6. **Copia el token** (solo se muestra una vez)

### Obtener el Zone ID

1. En el dashboard CF, click en `trespuntoscomunicacion.es`
2. Scroll hasta el panel derecho **API**
3. Copia el `Zone ID` (32 chars hex)

### En n8n

No necesita credential propia. Lo metes como **environment variables** en n8n (settings del VPS):

```bash
# En el .env del VPS donde corre n8n:
CLOUDFLARE_API_TOKEN=tu-token-de-32-chars
CLOUDFLARE_ZONE_ID=el-zone-id-de-trespuntoscomunicacion-es
NOTION_BLOG_DATA_SOURCE_ID=el-data-source-id-de-la-database
```

Si tu n8n vive en Docker, edita el `docker-compose.yml` o el panel de Hostinger VPS. Reinicia n8n tras añadir.

> Alternativa: meter los valores hardcoded en los nodos del workflow. Más rápido pero menos seguro. Si lo haces así, no commits del JSON con las claves dentro.

---

## 3. FTP Nominalia

✅ **Probablemente ya existe** en n8n (lo usan los workflows de partners y Kobe).

**Verifica que existe la credential `Nominalia FTP` con:**
- Host: `ftp.trespuntoscomunicacion.es`
- Port: `21`
- Username: `claude@trespuntoscomunicacion.es`
- Password: `Y20pC&7L!4z($%6g`
- Encryption: ninguna (FTP plano, NO FTPS)

Si no existe: créala con esos datos.

---

## 4. Telegram Bot

✅ **Ya existe** como `Claudio Bot Telegram` con el bot `@claudio_tp_bot`.

Si por alguna razón falta:
- Token: el que está en `~/.claude/channels/telegram/.env`
- Chat ID del grupo Mesa 3P: `-4999298972`

---

## Resumen — credenciales necesarias en n8n

| Credencial | Tipo | Estado |
|---|---|---|
| Notion · Curry Blog | Notion API | 🆕 Crear |
| Nominalia FTP | FTP | ✅ Probable que exista (verificar) |
| Claudio Bot Telegram | Telegram | ✅ Existe |

## Variables de entorno necesarias

| Variable | Dónde se obtiene |
|---|---|
| `NOTION_BLOG_DATA_SOURCE_ID` | Setup Notion DB paso 5 |
| `CLOUDFLARE_API_TOKEN` | Setup tokens paso 2 |
| `CLOUDFLARE_ZONE_ID` | Setup tokens paso 2 |

---

## Verificación final

Cuando todo esté configurado:

```bash
# Test desde tu máquina o desde el VPS (no desde tu navegador)
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://www.trespuntoscomunicacion.es/blog/"]}'
```

Respuesta esperada: `{"result":{"id":"..."},"success":true,...}`

Si sale `success: true`, el token Cloudflare funciona. Pasa al `test-plan.md`.
