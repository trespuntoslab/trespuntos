# Migración Auditorías Partners → Supabase

**Estado:** Pendiente. Deploy actual (2026-04-21) todavía en JSON+FTP.
**Motivo:** FTP por hostname bloqueado por Cloudflare. Workaround actual: FTP por IP de origen (185.2.4.34). No escala para el pipeline automático de Jordan generando auditorías nuevas.

---

## Contexto

### Flujo actual (frágil)
```
Jordan/n8n termina auditoría
  → Genera JSON individual (ej. partners/audit/data/{slug}.json)
  → Regenera data.json consolidado
  → Requiere subida manual por FTP a Nominalia
  → Landing /partners/audit/?id={slug} hace fetch al JSON
```

### Problema
- **Cloudflare bloquea FTP 21** en hostname → timeout
- **SFTP no disponible** en Nominalia
- **FTP por IP directa (185.2.4.34)** funciona pero:
  - Depende de que Nominalia no cambie la IP
  - Requiere intervención manual cada vez que se genera una auditoría
  - No se puede disparar desde n8n ni desde VPS limpio

### Workaround vigente (2026-04-21)
Subida manual por FTP a IP 185.2.4.34 con cURL:
```
curl -k --ftp-pasv -T archivo.json \
  "ftp://claude%40trespuntoscomunicacion.es:PASSWORD@185.2.4.34/partners/audit/data/archivo.json"
```

Los 37 archivos actuales (36 JSONs + data.json consolidado) están sincronizados en producción para cubrir los 20 emails que salen el 22-23 abril.

---

## Solución: Supabase

### Arquitectura propuesta
```
Jordan/n8n termina auditoría
  → INSERT en tabla partner_audits (Supabase)
  → Landing /partners/audit/?id={slug} hace SELECT vía PostgREST
  → Sin archivos, sin FTP, sin intervención manual
```

### Tabla `partner_audits`
Schema: **`public`** (NO `trespuntos` — ese schema no está expuesto en PostgREST/Kong, workaround psql directo documentado en CLAUDE.md).

```sql
CREATE TABLE public.partner_audits (
  id          bigserial PRIMARY KEY,
  slug        text NOT NULL UNIQUE,          -- ej. "algenio", "2bedigital"
  agencia     text NOT NULL,                 -- nombre display
  web         text NOT NULL,                 -- dominio auditado
  data        jsonb NOT NULL,                -- payload completo (lighthouse, recomendaciones, screenshots, etc.)
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_partner_audits_slug ON public.partner_audits(slug);

-- RLS: lectura pública (landing pública)
ALTER TABLE public.partner_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.partner_audits FOR SELECT USING (true);
-- Escritura solo con service_role (n8n)
```

### Endpoint lectura (PostgREST, anon key)
```
GET https://<supabase>.supabase.co/rest/v1/partner_audits?slug=eq.algenio&select=data,agencia,web
Headers:
  apikey: <anon key>
  Authorization: Bearer <anon key>
```

### Cambios necesarios

#### 1. Frontend — `partners/audit/index.html`
Reemplazar el fetch actual:
```js
// ANTES
fetch(`/partners/audit/data/${id}.json`)

// DESPUÉS
fetch(`${SUPABASE_URL}/rest/v1/partner_audits?slug=eq.${id}&select=*`, {
  headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
})
.then(r => r.json())
.then(rows => rows[0]?.data)
```

#### 2. n8n — workflow Kobe (o el que genere auditorías)
Añadir nodo Supabase (UPSERT) al final:
```json
{
  "slug": "{{slug}}",
  "agencia": "{{agencia}}",
  "web": "{{web}}",
  "data": {{json_completo}},
  "updated_at": "now()"
}
```

#### 3. Migración inicial (one-shot)
Script local que lee los 36 JSONs de `partners/audit/data/` y hace INSERT masivo a la tabla. Así las auditorías ya generadas siguen accesibles desde la landing cuando se haga el switch.

---

## Plan de ejecución

### Fase 0 — Los 20 emails en curso (ya hecho 2026-04-21)
- [x] Subida FTP-IP de los 37 JSONs para cubrir emails del 22-23 abril
- [x] Verificado HTTP 200 en producción

### Fase 1 — Backend Supabase (Shaq)
- [ ] Crear tabla `public.partner_audits` en Supabase
- [ ] Configurar RLS (SELECT público, INSERT service_role)
- [ ] Probar endpoint PostgREST con curl + anon key
- [ ] Script migración inicial (importar 36 JSONs existentes)

### Fase 2 — Frontend (Iverson)
- [ ] Adaptar `partners/audit/index.html` para hacer fetch a Supabase
- [ ] Fallback al JSON si Supabase devuelve 404 (transición suave)
- [ ] Test con URLs de los 36 slugs existentes

### Fase 3 — Automatización (n8n)
- [ ] Añadir nodo Supabase UPSERT al workflow que genera auditorías
- [ ] Test end-to-end: Jordan detecta partner → audit generada → registro en Supabase → landing renderiza
- [ ] Desactivar el paso de guardado a disco / FTP

### Fase 4 — Cleanup
- [ ] Confirmar 7-14 días de funcionamiento estable
- [ ] Retirar `partners/audit/data/*.json` del repo (opcional, mantener como backup)
- [ ] Actualizar `PLAN.md` y `WORKFLOWS.md` reflejando el nuevo flujo
- [ ] Cerrar esta migración en CLAUDE.md como completada

---

## Riesgos / consideraciones

- **Schema `trespuntos` vs `public`**: usar `public` para evitar el workaround psql. Si en el futuro se mueve a `trespuntos`, exponer primero el schema en Kong.
- **Cache edge Cloudflare**: la landing cachea 2h por defecto. Tras el switch purgar caché. Para auditorías nuevas, si la URL cambia (`?id=X` con slug nuevo) no hay conflicto. Si se regenera una existente, requiere purge puntual.
- **CORS**: Supabase PostgREST ya permite CORS de cualquier origen con anon key — no hace falta configurar nada extra.
- **Dependencia Supabase**: si Supabase cae, la landing cae. Hoy con JSONs en CDN Cloudflare es más resiliente. Asumible porque el resto del stack (dashboard, web_metrics, Jordan) ya depende de Supabase.

---

## Links relevantes
- `/partners/campana/PLAN.md` — plan general campaña
- `/partners/campana/WORKFLOWS.md` — workflows n8n
- `/partners/audit/index.html` — landing template
- `/partners/audit/data/*.json` — JSONs actuales (backup hasta switch)
- Dashboard Supabase: `https://dash.trespuntos-lab.com/dashboard.html`

---

**Última actualización:** 2026-04-21
**Responsable:** Jordi Expósito
**Siguiente paso:** coordinar con Shaq la creación de la tabla en Supabase.
