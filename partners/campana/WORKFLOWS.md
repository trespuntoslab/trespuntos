# Workflows n8n — Campana Partners

**Ultima actualizacion:** 2026-03-24

---

## Arquitectura del sistema

```
[Research]          [Auditoria]          [Outreach]           [Tracking]
Magic Research  →   web-audit skill  →   Kobe Emails      →   WF3 Envio
(n8n o manual)      (Claude Code)        (n8n GPT-4.1)        Secuencial
                    + n8n Multi-Agent                          ↓
                                                            WF4 Deteccion
                                                            Respuestas
                                                               ↓
                                                            WF5 Tracking
                                                            Auditoria
                                                               ↓
                                                            Telegram
                                                            Notificaciones
```

---

## WF3 — Partner Outreach: Envio Secuencial

- **ID:** ofNEs2v9y3angTDz
- **Estado:** INACTIVO
- **Ejecuciones:** 0
- **Trigger:** Schedule cada 2 horas

### Flujo:
1. Schedule Check (cada 2h)
2. Verificar Horario (L-V 9-18h CET)
3. Leer Secuencias con Pipeline = "Listo" desde Airtable
4. Por cada secuencia pendiente:
   - Si Pipeline = "Listo" → enviar Email 1
   - Si Pipeline = "Email 1 Enviado" y han pasado 3 dias → enviar Email 2
   - Si Pipeline = "Email 2 Enviado" y han pasado 4 dias → enviar Email 3
5. Actualizar Pipeline en Airtable
6. Guardar Message-ID para threading
7. Actualizar Funnel de agencia a "Contactada"
8. Notificar por Telegram

### Problemas detectados:
- **CRITICO:** El filtro busca Pipeline = "Listo" pero el valor real en Airtable es "Listo para enviar"
- Envia desde jordi@trespuntos-lab.com — verificar que es correcto
- No tiene credential reference para Airtable, usa {{$credentials.airtableApiKey}}

---

## WF4 — Partner Outreach: Deteccion Respuestas

- **ID:** 0EMRAOvITiVjlw8y
- **Estado:** INACTIVO
- **Ejecuciones:** 0
- **Trigger:** Schedule cada 2 horas

### Flujo:
1. Check cada 2h
2. Leer emails nuevos por IMAP
3. Extraer remitente (email)
4. Buscar en Airtable si el email pertenece a una agencia de la campana
5. Si coincide: marcar "Respondio" en Secuencia Emails + fecha
6. Alertar por Telegram con preview del email

### Problemas detectados:
- Necesita credencial IMAP configurada en n8n
- El nodo emailReadImap necesita parametros (servidor, puerto, credenciales)

---

## WF5 — Partner Outreach: Tracking Auditoria

- **ID:** brFpHdEdYYOQ00q8
- **Estado:** ACTIVO
- **Ejecuciones:** 10 (todas con error)
- **Trigger:** 3 webhooks (audit-visit, audit-calendly, audit-dismiss)

### Flujo (3 ramas paralelas):

**Rama 1: Visita auditoria** (POST /webhook/audit-visit)
1. Recibe {id: slug} desde la landing
2. Busca auditoria por slug en Airtable
3. Incrementa contador de visitas + marca "Vista" + guarda timestamp
4. Notifica Telegram (emoji diferente si es primera visita vs repetida)

**Rama 2: Click Calendly** (POST /webhook/audit-calendly)
1. Recibe {id: slug}
2. Busca auditoria en Airtable
3. Marca "Call Agendada" = true
4. Notifica Telegram

**Rama 3: Descarte** (POST /webhook/audit-dismiss)
1. Recibe {id: slug, motivo: texto}
2. Busca auditoria en Airtable
3. Guarda motivo de descarte
4. Cambia Funnel de agencia a "Descartada"
5. Notifica Telegram

### Problemas detectados:
- **CRITICO:** 10/10 ejecuciones con error — probable problema de credencial Airtable
- La landing audit/index.html SI envia eventos a estos webhooks (trackEvent)
- Verificar que la URL base del webhook es correcta en el JS de la landing

---

## Kobe — Emails Outreach Partner

- **ID:** BLcLAnrGcwUYyDJf
- **Estado:** ACTIVO
- **Ejecuciones:** 0
- **Trigger:** Webhook POST /kobe-email-partner

### Flujo:
1. Recibe {record_id} via webhook
2. Lee datos de la agencia desde Airtable
3. Genera 3 emails con GPT-4.1-mini (system prompt con voz Tres Puntos)
4. Notifica por Telegram
5. Responde con JSON de los 3 emails

### Problemas detectados:
- **SEGURIDAD:** API key de Airtable hardcodeada en texto plano en nodo HTTP
- **SEGURIDAD:** API key de OpenAI hardcodeada en texto plano en nodo HTTP
- **SEGURIDAD:** Token de Telegram hardcodeado en texto plano
- Todas deberian usar n8n credentials en lugar de valores inline

---

## Magic — Research Agencias Partner

- **ID:** XG4VLgVSOqZJoq0n
- **Estado:** INACTIVO (correcto, ya cumplio su funcion)
- **Ejecuciones:** completadas

### Flujo:
1. Trigger manual
2. Lee agencias de Airtable
3. Loop: por cada agencia, scrape con Jina
4. Analiza con GPT-4o-mini
5. Parsea y actualiza Airtable
6. Notifica Telegram

---

## SEO Audit Multi-Agent

- **ID:** 7TUiRW3lfWh71tqL
- **Estado:** ACTIVO
- **Trigger:** Webhook

### Flujo:
1. Webhook recibe URL
2. Scrape de la web
3. 4 agentes IA en paralelo: Semantic, IT Technical, SEO, CRO
4. Merge de resultados
5. Editor in Chef consolida
6. Convierte a Markdown + envia por email
7. Guarda en Supabase

### Notas:
- Este workflow genera auditorias en formato diferente (para Supabase, no para la campana partners)
- La skill web-audit de Claude Code genera el formato JSON correcto para la campana
- Potencialmente se podria integrar para automatizar la generacion semanal

---

## WF6b — Research + Cualificacion Automatica

- **ID:** krNI9bFxAhAAjQi1
- **Estado:** ACTIVO
- **Ejecuciones:** en curso
- **Trigger:** Schedule cada 30 min + Webhook manual POST /research-manual

### Flujo (20 nodos):
1. Trigger (schedule 30min o webhook manual)
2. Leer agencias con Funnel = "Apta" desde Airtable
3. Por cada agencia:
   a. Scrape con Jina (12000 chars max)
   b. GPT-4.1-mini Research: extrae metadatos (nombre, email, decisor, ciudad, ICP, clientes)
   c. Actualiza agencia en Airtable con metadatos
   d. **GPT-4.1 Audit**: genera auditoria completa (4 categorias, 16 hallazgos, scores, quickWin, resumen)
   e. Parsea audit JSON + genera slug
   f. Crea registro en tabla Auditorias de Airtable (con JSON, score, link, slug)
   g. Kobe genera 3 emails personalizados
   h. Crea secuencia de emails en Airtable (Pipeline = Borrador)
   i. Marca agencia como "Cualificada"
   j. Notifica Telegram con score y link a landing

### Limitaciones:
- No ejecuta Lighthouse (n8n no puede). Las auditorias no tienen datos de performance reales.
- No genera archivo JSON local. El JSON se guarda en Airtable. Para publicar landing, pedir a Claude que sincronice.
- Email 2 de Kobe es generico. Para personalizarlo con hallazgos de auditoria, pedir a Claude que lo reescriba.

### Actualizado: 2026-03-24
- Anadidos 4 nodos de auditoria (Preparar Audit Prompt, GPT Audit, Parsear Audit, Crear Auditoria AT)
- Scrape ampliado de 5000 a 12000 chars
- Modelo de auditoria: GPT-4.1 (no mini)
- Telegram actualizado con score y link

---

## Workflow faltante: Automatizacion semanal

**Objetivo FASE 4:** Un workflow que cada semana:
1. Identifique nuevas agencias candidatas (por busqueda o lista)
2. Genere auditoria con la skill web-audit
3. Genere emails con Kobe
4. Cree registros en Airtable
5. Notifique a Jordi para aprobacion
6. Solo despues de aprobacion, mueva a "Listo para enviar"

**Opcion A:** n8n scheduled + Claude Code skill via MCP
**Opcion B:** Claude Code scheduled task + n8n solo para envio
**Opcion C:** Hibrido — Claude Code genera, n8n ejecuta

Pendiente de decidir en Fase 4.
