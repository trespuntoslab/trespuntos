# Sectores Workflows — Backup local + estado actual

Trabajo del Agente B (2026-04-25). Auth del n8n MCP cayó a mitad de tarea; este folder guarda el estado y los JSON necesarios para reanudar manualmente.

## Estado actual de los 3 workflows

| Workflow | n8n ID | Estado | Notas |
|---|---|---|---|
| WF-Track-sectores · /s/ Click E1 | `qWTpFhTaHUscC6Z0` | **Creado, INACTIVO** (no pude activarlo por la caída de auth) | 11 nodos completos. Webhook GET path `/s/:slug?e=1`. Lee Empresa por Slug → Secuencia linkada → incrementa Veces E{1,2} Click → si primer click envía Telegram a Jordi DM `7313439878`. Redirect 302 a `https://go.trespuntoscomunicacion.es/s/{slug}/`. |
| WF4-sectores · Detección Respuestas | `4DeHrw1yL4kVMsCZ` | **Creado, INACTIVO** | 15 nodos completos. Schedule cada 15 min. Gmail search `label:sectores-outreach is:unread newer_than:1d -from:me`. Match por email → update Pipeline=Respondida + Estado=En conversación + Telegram Mesa 3P `-4999298972` + marcar leído. |
| WF3-sectores · Envío Secuencial | `s7rw3nSvqKyujlBQ` | **Creado parcialmente, INACTIVO** | 7 de los 14 nodos planificados. Faltan: Combinar Datos, IF Email 1, Build MIME E1, Enviar Email 1, Update Secuencia E1 Enviado, Update Empresa Contactado, Telegram Mesa 3P E1. JSON completo del workflow en `wf3-sectores-completo.json` para pegar manualmente o reintentar via MCP cuando la auth se recupere. |

## URLs de webhook (production)

- WF-Track: `https://n8n.trespuntoscomunicacion.es/webhook/s/:slug?e=1`
  - Vía go.trespuntoscomunicacion.es debe enrutar a este path. Cloudflare/Traefik.
- WF4: no expone webhook (es Schedule trigger).
- WF3: no expone webhook (es Schedule trigger).

## Credenciales reutilizadas (de partners — NO se crearon nuevas)

- **Airtable**: PAT `<AIRTABLE_PAT_REDACTED>` (hardcoded en headers HTTP Request, igual que partners). Pendiente migrar a n8n credential `airtableApiKey`.
- **Gmail OAuth2**: credential id `mZrY6QLz18g6MESS` (jordi@trespuntos-lab.com) — la misma que usa WF3/WF4 partners.
- **Telegram bot `claudio_tp_bot`**: token `<TELEGRAM_BOT_TOKEN_REDACTED>` hardcoded en URL HTTP Request, igual que partners. Pendiente migrar a nodo Telegram nativo + credential.

## Pendientes humanos (Jordi)

1. **Activar WF-Track-sectores** (`qWTpFhTaHUscC6Z0`) → debe quedar `active: true`.
2. **Activar WF4-sectores** (`4DeHrw1yL4kVMsCZ`) → debe quedar `active: true`.
3. **Dejar WF3-sectores** (`s7rw3nSvqKyujlBQ`) **INACTIVO** — Jordi aprueba manual.
4. **Crear label Gmail `sectores-outreach`** + filter en Gmail que aplique ese label automáticamente a las respuestas a emails enviados desde el WF3-sectores. Sin esto, WF4-sectores no detecta respuestas.
5. **Cloudflare/Traefik**: configurar `go.trespuntoscomunicacion.es/s/*` → `n8n.trespuntoscomunicacion.es/webhook/s/*` (igual que el `/p/` actual de partners).
6. **Firma email sectores**: cuando Agente A genere `/partners/campana/firma-email-sectores.html`, sustituir el HTML inline en el nodo "Combinar Datos" del WF3-sectores (actualmente usa la firma genérica de partners como placeholder).
7. **Completar WF3-sectores**: pegar manualmente los 7 nodos restantes desde `wf3-sectores-completo.json` o reintentar via `n8n_update_partial_workflow` cuando la auth del MCP se recupere.

## Ajustes vs spec del usuario

- Spec decía `Pipeline = "Pendiente E1"` → la opción real en Airtable es `"✅ Aprobado"` (verificada via schema). Se usa esa.
- Spec decía setear `Pipeline = "E1 enviado"` tras enviar → la opción real es `"📧 E1 Enviado"`. Se usa esa.
- Spec decía `Estado = "Contactado"` → existe en el schema, se aplica.
- Spec decía notificar Mesa 3P en WF3 tras envío → hecho con chat_id `-4999298972`.
- Spec decía notificar a Jordi DM en clic primer E1 → hecho con chat_id `7313439878`.
- WF3-sectores se crea SIN E2/E3 (el spec dice "el envío de E1" como foco principal y bot es para activar sólo cuando Jordi apruebe). Si se quieren añadir E2/E3 en el futuro, replicar el patrón de WF3 partners.
- Trigger WF3-sectores: cron `0 9 * * *` (9am Madrid diario) — pero como queda DESACTIVADO, no se ejecuta.

## Tests pendientes

NO se pudieron ejecutar tests por la caída de auth del MCP. Lista para hacer manualmente:

1. **WF-Track-sectores**: `curl -i "https://n8n.trespuntoscomunicacion.es/webhook/s/fincas-blanco-test?e=1"` → debe responder 302 y NO romper aunque el slug no exista. (El nodo "Preparar Update" devuelve `[]` si no encuentra, parando silenciosamente).
2. **WF4-sectores**: ejecución manual del Schedule trigger → si no hay emails con label `sectores-outreach`, devuelve 0 resultados (correcto).
3. **WF3-sectores**: una vez completos los 14 nodos, ejecución manual con la base Airtable que ya tenga al menos 1 secuencia con Pipeline=Aprobado y empresa con Estado=Prospecto + Prioridad=A + Fecha próxima acción ≤ today. **NO hacer envío real hasta dry-run de Agente D**.
