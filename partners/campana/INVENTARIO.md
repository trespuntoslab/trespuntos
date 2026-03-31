# Inventario de Agencias — Campana Partners

**Ultima actualizacion:** 2026-03-23

## Agencias cualificadas (19)

### ICP: SEO (10 agencias)

| Agencia | Score AT | Web | Decisor | Email | Slug | JSON | Auditoria AT | Secuencia AT |
|---------|---------|-----|---------|-------|------|------|-------------|-------------|
| RODANET | 82 | rodanet.es | Sergi Lechado / Daniel Larrosa | daniel.larrosa@rodanet.es | rodanet | OK | OK (limpiar dup) | OK (limpiar dup) |
| SEOCOM Agency | 78 | seocom.agency | Ivan Ruiz Sevilla | iruiz@seocom.agency | seocom | OK | OK | OK |
| Human Level | 76 | humanlevel.com | Fernando Macia | info@humanlevel.com | human-level | OK | OK | OK |
| Kanlli | 76 | kanlli.com | Gonzalo Ibanez | gonzalo@kanlli.com | kanlli | OK | OK | OK |
| Sumate | 75 | sumate.es | Carmen Ceballos | carmen@sumate.eu | sumate | OK | OK | OK |
| Peter Lead | 75 | peterlead.com | Peter Raventos | peter@peterlead.com | peter-lead | OK | OK | OK (descartada en AT) |
| Orbitalia | 74 | orbitalia.es | Chema Bescos | chema@orbitalia.com | orbitalia | OK | OK | OK |
| Tu Posicionamiento Web | 74 | tuposicionamientoweb.es | Ana Pedroche | ana@tuposicionamientoweb.net | tu-posicionamiento-web | OK | OK | OK |
| SEOinHouse | 72 | seoinhouse.es | Miguel Angel Serra | maserra@seoinhouse.es | seoinhouse | OK | OK | OK (descartada en AT) |
| Relevantium | 72 | relevantium.com | Javier Vilarino | javier@relevantium.com | relevantium | OK | OK | OK |
| Seonet | 65 | seonet.es | Carlos Hueso | carlos@seonetdigital.com | seonet | OK | OK | OK |

### ICP: Branding (4 agencias)

| Agencia | Score AT | Web | Decisor | Email | Slug | JSON | Auditoria AT | Secuencia AT |
|---------|---------|-----|---------|-------|------|------|-------------|-------------|
| Agencia Jaimito | 78 | agenciajaimito.com | Alfredo Sanchez Martin | alfredo@agenciajaimito.com | agencia-jaimito | OK | OK | OK |
| V3rtice | 76 | v3rtice.com | ? | ? | v3rtice | FALTA | FALTA | FALTA |
| Oink My God | 72 | oinkmygod.com | Laura Amanda Bahi | laura@oinkmygod.com | oink-my-god | OK | OK | OK |
| BACAAM | 70 | bacaam.com | Maria Azorin | maria@bacaam.es | bacaam | OK | OK | OK |

### ICP: Performance (5 agencias)

| Agencia | Score AT | Web | Decisor | Email | Slug | JSON | Auditoria AT | Secuencia AT |
|---------|---------|-----|---------|-------|------|------|-------------|-------------|
| GO2JUMP | 85 | go2jump.es | Jorge Zuluaga Botero | jorge@go2jump.com | go2jump | OK | OK | OK |
| Duplo Digital | 78 | duplodigital.com | Angelica Avila | angelica@duplodigital.com | duplo-digital | OK | OK | OK |
| Comunicare | 75 | comunicare.es | Raul Yanez Alonso | raul@comunicare.es | comunicare | OK | OK | OK |
| Proogresa | 73 | proogresa.es | Joan Guitart Peracaula | info@proogresa.es | proogresa | FALTA | OK | OK |
| La Teva Web | 72 | latevaweb.com | Francesc Sanchez Loro | francesc@latevaweb.com | la-teva-web | OK | OK | OK |

## Scores de auditoria (JSON)

| Agencia | Score Global | UX | UI | SEO | Dev |
|---------|-------------|----|----|-----|-----|
| duplo-digital | 6.0 | 6.0 | 6.5 | 7.0 | 5.0 |
| trespuntos-test | 6.2 | 6.5 | 7.0 | 7.5 | 4.5 |

(Scores de las demas agencias: consultar JSONs individuales en `/partners/audit/data/`)

## Problemas detectados

1. **RODANET**: Tiene duplicados en tabla Auditorias (registro "DUPLICADO — BORRAR") y en Secuencia Emails (2 registros)
2. **V3rtice**: Cualificada pero falta: email decisor, JSON auditoria, registro auditoria en AT, secuencia emails
3. **Proogresa**: Falta JSON de auditoria en `/partners/audit/data/proogresa.json`
4. **Peter Lead y SEOinHouse**: Estan descartadas en tabla Agencias pero tienen auditoria y secuencia creadas — confirmar si incluir en la campana
