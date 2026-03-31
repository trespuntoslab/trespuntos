# Plan de Accion — Campana Partners Tres Puntos

**Estado:** Sistema automatizado completo. WF3 activo enviando emails con firma. Tarea programada `enrich-partners` configurada para lunes 10am. Flujo probado end-to-end.
**Ultima actualizacion:** 2026-03-25 00:10
**Responsable:** Jordi Exposito

---

## Flujo semanal automatizado

```
Lunes 9:00  → WF6b (n8n): busca agencias "Apta" → scrape + GPT-4.1 research → marca "Cualificada"
Lunes 10:00 → Claude (enrich-partners): detecta "Cualificada" sin datos completos →
              1. Deep research (WebFetch + WebSearch)
              2. Completa: decisor, email, LinkedIn, clientes, notas, Notes
              3. Calcula Score 0-100 (cualificacion)
              4. Si Score >= 65: Lighthouse + auditoria + 3 emails personalizados → "Pendiente aprobacion"
              5. Si Score 50-64: marca dudosa → Telegram para decidir
              6. Si Score < 50: auto-descarta
Tu          → Revisas en Airtable → cambias Pipeline a "✅ Aprobado"
WF3 (2h)    → Detecta "Aprobado" → envia Email 1 con firma HTML → Email 2 (dia 3) → Email 3 (dia 7)
WF5         → Tracking: visitas auditoria, Calendly, descartes
```

---

## Score de cualificacion (0-100)

Evalua si la agencia es buen candidato para partnership, NO la calidad de su web.

```
+20  Base
+15  Sin equipo dev propio (no compite)
+15  Sin equipo UX/UI propio (no compite)
+10  Barcelona o Madrid (proximidad)
+10  ICP claro (SEO/Branding/Performance)
+10  Tamano correcto (10-50 personas)
+5   Clientes visibles de calidad
+5   5+ anos experiencia
-20  Dev propio fuerte (competencia directa)
-15  Multinacional o >100 personas
-10  Fuera de Espana
-10  Nicho muy diferente
```

**Umbrales automaticos:**
- >= 65: Procede (auditoria + emails)
- 50-64: Dudosa (solo datos, Telegram para decidir)
- < 50: Auto-descartada

---

## Estado actual por componente

### Airtable (base: appdeN48esyCb1v7H)
| Tabla | Registros | Estado |
|-------|-----------|--------|
| Agencias | ~49 | OK — 20 cualificadas, 3 nuevas enriquecidas |
| Auditorias | ~22 | OK — JSONs con Lighthouse real |
| Secuencia Emails | ~22 | OK — 3 emails por agencia |

### n8n Workflows
| Workflow | ID | Estado |
|----------|-----|--------|
| WF3 Envio Secuencial | ofNEs2v9y3angTDz | **ACTIVO** — Gmail OAuth2, firma HTML, busca "✅ Aprobado", horario L-V 9-18h CET |
| WF4 Deteccion Respuestas | 0EMRAOvITiVjlw8y | LISTO (inactivo) — Activar cuando se lance |
| WF5 Tracking Auditoria | brFpHdEdYYOQ00q8 | **ACTIVO** — Tracking visitas, Calendly, descartes |
| WF6b Research | krNI9bFxAhAAjQi1 | **ACTIVO** — Lunes 9am, solo research (sin auditoria ni emails) |
| WF6 Discovery | SRai7Mly38uCOVO7 | ACTIVO — Busqueda semanal nuevas agencias |
| Kobe Emails | BLcLAnrGcwUYyDJf | ACTIVO — Genera emails bajo demanda |

### Tarea programada Claude
| Tarea | Schedule | Estado |
|-------|----------|--------|
| enrich-partners | Lunes 10:00 | **CONFIGURADA** — Pendiente pre-aprobar permisos (ejecutar "Run now" una vez) |

### Email
- **Proveedor:** Google Workspace (jordi@trespuntos-lab.com)
- **DNS:** SPF + DKIM + DMARC configurados en Hostinger
- **Firma HTML:** `/partners/campana/firma-email.html` — Logo, datos, Calendly, aviso legal
- **n8n:** Gmail OAuth2 (credencial mZrY6QLz18g6MESS)
- **Footer n8n desactivado** en los 3 nodos Gmail

---

## Agencias nuevas enriquecidas (25 marzo 2026)

| Agencia | Score Cual. | Score Audit | Decisor | Email | ICP |
|---------|------------|-------------|---------|-------|-----|
| alGenio | 68 | 5.9 | Carmen Fernandez Lara (CEO) | hola@algenio.com | Performance |
| 2bedigital | 55 (dudosa) | 6.7 | Pablo Borras Garcia (CEO) | info@2bedigital.com | Performance |
| Yumagic Social | 65 | 5.9 | Didac Cervera (CEO) | info@yumagic.com | Branding |

---

## Pipeline de estados

### Tabla Agencias — campo Funnel
| Estado | Significado |
|--------|------------|
| 🔍 Investigada | WF6 Discovery la encontro |
| 👍 Apta | Jordi la aprueba para research |
| ✅ Cualificada | WF6b hizo research / Claude enriquecio |
| 📧 Contactada | WF3 envio Email 1 |
| 💬 Respondida | La agencia respondio |
| 📞 Call | Call agendada |
| 🧪 Piloto | Proyecto piloto |
| 🤝 Partner Activo | Partnership activo |
| ❌ Descartada | No encaja |

### Tabla Secuencia Emails — campo Pipeline
| Estado | Significado |
|--------|------------|
| Borrador | Emails generados, sin revisar |
| 👀 Pendiente aprobacion | Claude los preparo, listos para revision |
| ✅ Aprobado | Jordi aprueba → WF3 envia Email 1 |
| 📧 Email 1 enviado | Dia 0 — enviado |
| 📧 Email 2 enviado | Dia 3 — enviado |
| 📧 Email 3 enviado | Dia 7 — enviado |
| 💬 Respondida | La agencia respondio |
| 🚫 Sin respuesta | No respondio a los 3 emails |

---

## Tareas pendientes

| # | Tarea | Quien |
|---|-------|-------|
| 1 | Ejecutar `enrich-partners` "Run now" para pre-aprobar permisos | **Jordi** |
| 2 | V3rtice: se procesara automaticamente el proximo lunes | Automatico |
| 3 | Calentar dominio (emails manuales desde Gmail) | **Jordi** |
| 4 | Activar WF4 (deteccion respuestas) cuando se lance | **Jordi** |
| 5 | Revisar emails en Airtable y aprobar ("✅ Aprobado") | **Jordi** |

---

## Inventario de archivos

- `/partners/index.html` — Landing principal
- `/partners/audit/index.html` — Template dinamico auditoria
- `/partners/audit/data.json` — JSON combinado agencias
- `/partners/audit/data/*.json` — JSONs individuales por agencia
- `/partners/campana/PLAN.md` — Este documento
- `/partners/campana/INVENTARIO.md` — Inventario de agencias
- `/partners/campana/WORKFLOWS.md` — Documentacion workflows n8n
- `/partners/campana/firma-email.html` — Firma HTML para emails

---

## Metricas

| Metrica | Valor |
|---------|-------|
| Agencias investigadas | ~49 |
| Agencias cualificadas | 22 |
| Auditorias con Lighthouse real | 22 |
| Emails personalizados | 22 agencias x 3 emails |
| Emails enviados (test) | 2 (alGenio real + 2bedigital a Jordi) |
| Score medio cualificacion | 73/100 |

---

## Historial de cambios

| Fecha | Cambios |
|-------|---------|
| 2026-03-25 00:10 | Sistema automatizado completo. WF3 activo con firma HTML. Tarea enrich-partners configurada (lunes 10am). Score 0-100 implementado. Pipeline "✅ Aprobado" → envio automatico. Footer n8n eliminado. Prueba end-to-end OK. |
| 2026-03-24 22:00 | WF6b simplificado (solo research, sin audit/emails). 3 nuevas agencias enriquecidas: alGenio (68), 2bedigital (55), Yumagic (65). Lighthouse real + emails personalizados. |
| 2026-03-24 17:00 | WF6b actualizado: multi-scrape 6 paginas, GPT-4.1 research, PageSpeed Lighthouse (HTTP nodes). Nodos PSI Desktop/Mobile/Parsear Lighthouse anadidos. |
| 2026-03-23 23:00 | Google Workspace contratado. DNS configurado. Gmail OAuth2 en n8n. WF3/WF4 migrados. Test envio OK. |
| 2026-03-23 02:00 | Lighthouse fresco 18 agencias. 19 Email 2 personalizados. Proogresa creada. |
| 2026-03-23 00:30 | Documento creado. WF3 filtro corregido. WF5 diagnosticado. |
