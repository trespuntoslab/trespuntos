# Jordan widget E2E test

Reproduce los 5 escenarios críticos del widget Jordan v7 que han roto antes, con **TEST MODE activo** para no contaminar métricas reales.

## Quick start

```bash
# Contra producción (default)
node scripts/jordan-e2e/jordan-e2e.mjs

# Contra preview local
node scripts/jordan-e2e/jordan-e2e.mjs --base http://localhost:3000

# Ver navegador (no headless)
node scripts/jordan-e2e/jordan-e2e.mjs --headed

# Solo un escenario
node scripts/jordan-e2e/jordan-e2e.mjs --only escenario5
```

Output: tabla en terminal + `report.json` + screenshots del badge.
Exit code 0 si todo pasa, 1 si hay 1+ fallos.

## Escenarios cubiertos

| # | Qué prueba | Por qué importa |
|---|---|---|
| 1 | Carga del widget en home (modo flotante) — bubble visible, sin JS errors | Detecta que el widget no se rompe con cambios al HTML/CSS de la home |
| 2 | Carga del widget en `/contacto/` (modo embed) — chat embebido visible | Detecta regresión del modo embed (la página de contacto depende de él) |
| 3 | Badge 🧪 TEST visible cuando `?jordan_test=1` está activo | Confirma que el modo test se activa visualmente — protege de "creía que era test pero era real" |
| 4 | Payload al webhook lleva `is_test:true` + `test_triggers:[...]` | Confirma que n8n recibe el flag correcto para hacer skip de Telegram/emails |
| 5 | **Click slot Calendly → `_sendLeadWebhook` corre ANTES de `window.open`** | **Regresión del 2026-04-24 que perdió 8 días de leads.** Si esto rompe, los leads del chat dejan de llegar |

## Cómo funciona el test mode en el script

El script siempre añade `?jordan_test=1` a las URLs del browser. Eso activa los triggers del widget:
- Badge `🧪 TEST` visible en el chat
- Payload del webhook con `is_test:true`
- GA4 events con `test_mode:true`
- (Cuando estén implementados en n8n) skip de Telegram + emails al ejecutar

**Por eso el script es seguro de correr contra producción** — nunca contamina métricas reales.

## Setup inicial (una sola vez)

```bash
npm i playwright
npx playwright install chromium
```

## Cuándo ejecutarlo

**Obligatorio:**
1. Antes de hacer push de cualquier cambio en `assets/jordan/jordan-widget-v7.js`
2. Antes de cambiar el system prompt de Jordan (verifica que la mecánica de captura/Calendly sigue intacta)
3. Tras cualquier cambio en n8n WF2 (jordan-chat-leads) o WF0 (proxy)

**Recomendado:**
4. Cron diario contra producción para detectar regresiones por cambios externos (Cloudflare, n8n, Calendly API)

## Mocking activo durante el test

El script intercepta dos endpoints para no llamar servicios reales:
- `**/jordan-chat-leads` → devuelve `{ok:true, intercepted:true}` y captura el payload para validarlo
- `**/jordan-chat-proxy` → devuelve respuesta falsa de Jordan

Esto significa: aunque corras el script 100 veces, **0 leads llegan a Airtable, 0 Telegrams, 0 emails**. Solo verificamos que el cliente ENVIARÍA lo correcto si fuese real.

## Limitaciones actuales

- El escenario 5 valida la **secuencia en el código fuente** (analizando el `.js`). Para probar el comportamiento real necesitaríamos mockar también el API de Calendly slots — TODO si encontramos otra regresión.
- Los escenarios 4 y 5 dependen del helper `JordanAPI.__test` que se introdujo en v7.3 (este commit). Si rebajas el widget a v7.2 o anterior, fallarán por API ausente.

## Próxima iteración

- Escenario 6: simular conversación completa (5 mensajes, capturar email, click Calendly) end-to-end con timing realista
- Integrar con CI cuando exista
- Añadir "screenshot diff" baseline para detectar cambios visuales no intencionales
