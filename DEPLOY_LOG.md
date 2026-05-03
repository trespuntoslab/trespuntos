# Deploy Log — trespuntoscomunicacion.es

Registro cronológico de cada deploy a producción. Una entrada por subida FTP a Nominalia.

**Regla:** cada entrada debe tener un SHA de commit que ya esté en `origin/main`. Si la línea SHA queda vacía o no se corresponde con un push, el deploy es inválido y hay que reconciliar.

**Formato:**
```
## YYYY-MM-DD HH:MM — descripción corta
- **Commit:** <sha-completo> (<rama>)
- **Archivos:** lista de archivos subidos por FTP (o "ZIP completo" si fue masivo)
- **Cloudflare:** Purge Everything | Custom URL: <urls>
- **Verificación:** OK | <issue>
- **Notas:** opcional
```

---

## 2026-04-30 — Fix redirects 404 + sistema OG versionado en git

- **Commits:**
  - `1802689` — fix(seo): redirects 301 para 404s detectados en GSC
  - `3205a1b` — feat(og): sistema OG completo (102 imágenes + plantilla + scripts)
  - `f8d033c` — feat(blog): 3 posts nuevos + grid actualizado + assets blog-article
  - `86f75ef` — feat(sectores): nueva sección /sectores/ + workflows backup + firma email
  - `29ef196` — docs(claude): documentar sistema OG en CLAUDE.md
- **Archivos subidos por FTP en esta sesión:**
  - `.htaccess` (2 veces — segunda para fix de regex `/portfolio/1csoft/`)
- **Archivos ya presentes en producción (no resubidos):**
  - 87 HTMLs con meta tags OG (subidos en sesiones anteriores entre 2026-04-22 y 2026-04-29)
  - 108 imágenes en `/img/og/*.png` (subidas el 2026-04-29)
  - Scripts `/scripts/og/*` — solo locales, no se sirven desde el dominio
  - 16 páginas en `/sectores/*` (subidas en sesiones anteriores)
  - 3 posts de blog (subidos en sesiones anteriores)
  - `img/logo-trespuntos-dark.svg` (subido en sesiones anteriores)
- **Cloudflare:** Purge Everything (después del primer FTP de `.htaccess`) + Custom URL para `/portfolio/1csoft/` (después del segundo FTP)
- **Verificación:** 11/12 redirects OK tras la primera purga, 12/12 OK tras la segunda
- **Notas:**
  - Esta es la primera entrada del log. Todo lo previo a este punto NO está registrado y constituye deuda histórica de versionado (ver "Regla crítica de versionado" en CLAUDE.md).
  - A partir de aquí, cada deploy debe entrar aquí.
  - **INCIDENTE durante este deploy**: GitHub Secret Scanning bloqueó el primer push detectando 2 secretos en `partners/campana/sectores-workflows-backup/wf3-sectores-completo.json` (Airtable PAT + Telegram bot token, hardcoded en el JSON exportado del workflow). Sanitizados con `sed` (placeholders `<AIRTABLE_PAT_REDACTED>` y `<TELEGRAM_BOT_TOKEN_REDACTED>`), commits reescritos vía `git reset --mixed origin/main` + reaplicación, push aceptado (`5322865..1be0afe`). **Pendiente: rotar las 2 credenciales** (siguen activas en producción n8n). Ver bloque "🚨 LEER PRIMERO" en CLAUDE.md.
  - `.gitignore` actualizado con reglas `**/workflows-backup/*.json`, `**/n8n-export/*.json`, `*.workflow.json`, `*.n8n.json` para evitar repetir el incidente.

---

## 2026-05-03 — Auditoría de credenciales hardcoded en workflows n8n (sin deploy a producción)

- **Commits:** ninguno (solo actualización de docs locales: CLAUDE.md, memoria, DEPLOY_LOG)
- **Acción:** auditoría completa vía MCP n8n de los 88 workflows en `n8n.trespuntos-lab.com`
- **Cobertura:** 15 workflows descargados completos + extracción de metadatos. Cobertura priorizada en familia partners + sectores + research (los más sospechosos).
- **Hallazgo:** El problema es 4-5x más grande de lo reportado el 2026-04-30:
  - **No son 2 credenciales filtradas, son 5**: Airtable PAT + Telegram bot + OpenAI key + Anthropic key + Serper key
  - **No es 1 workflow afectado, son 9** workflows (7 activos + 2 inactivos):
    - WF6 Discovery Partners (`SRai7Mly38uCOVO7`)
    - WF-Research-Daily (`AaghmTTXD5Kd4ODe`)
    - WF3 Partner Envío (`ofNEs2v9y3angTDz`)
    - WF4 Partner Detección (`0EMRAOvITiVjlw8y`)
    - WF5 Partner Tracking (`brFpHdEdYYOQ00q8`)
    - WF4 Sectores Detección (`4DeHrw1yL4kVMsCZ`)
    - Research Agencias (`krNI9bFxAhAAjQi1`)
    - WF3 Sectores Envío (`s7rw3nSvqKyujlBQ`) — inactivo
    - WF3-test Gmail (`ICoeXKSd5NQoVsZS`) — inactivo
- **Workflows ya correctos:** `o8dV7unLeUuOrqXo` (Partner WF5 antiguo, archived) usa `{{$credentials.xxx}}` correctamente — modelo a seguir
- **Workflows verificados sin secretos:** Briefing→Doc Funcional, Pipeline Briefing v1, SEO Audit Multi-Agent, SEO Audit Semanal, Email Recordatorio, Jordan Leads Chat Web
- **No auditados:** 73 workflows restantes (paneles exitbcn, share drive, sync mensual, calendly, healthcheck, etc.). Probabilidad baja de tener secretos pero conviene auditar tras rotar.
- **Notas:**
  - Bloque "🚨 LEER PRIMERO" de CLAUDE.md actualizado con las 5 credenciales (no 2) + tabla de 9 workflows + plan de sanitización por workflow
  - Memoria del proyecto (`project_credentials_to_rotate.md`) actualizada igual
  - Producción n8n NO modificada — la auditoría fue solo lectura

---
