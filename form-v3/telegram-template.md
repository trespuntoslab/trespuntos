# Plantilla Telegram — Lead Notification v3

## Datos que recibe n8n

### Step 1 (webhook `leads-step1-v3` — JSON)
```
nombre, email, telefono, presupuesto
pagina_origen, pagina_referrer
utm_source, utm_medium, utm_campaign
tipo: "step1-v3", timestamp
```

### Step 2 (webhook `briefing-doc-funcional` — FormData)
```
nombre, email                          ← nombre AHORA se envía
servicios (JSON array), timeline
web_actual, descripcion
audio (blob), archivos (files)
pagina_origen, pagina_referrer
tipo: "step2-briefing-v3", timestamp
```

---

## Plantilla para el nodo Telegram en n8n

Copiar esta plantilla al nodo de Telegram. Usar las expresiones de n8n `{{ $json.campo }}` para insertar los valores.

### Notificación Step 1 (lead nuevo)

```
🔵 NUEVO LEAD

👤 {{ $json.nombre }}
📧 {{ $json.email }}
📞 {{ $json.telefono || 'No proporcionado' }}
💰 Presupuesto: {{ $json.presupuesto }}

📍 Origen: {{ $json.pagina_origen }}
🔗 Referrer: {{ $json.pagina_referrer }}
{{ $json.utm_source ? '📊 UTM: ' + $json.utm_source + ' / ' + $json.utm_medium + ' / ' + $json.utm_campaign : '' }}
```

### Notificación Step 2 (briefing recibido)

```
🟢 BRIEFING RECIBIDO

👤 {{ $json.nombre }}
📧 {{ $json.email }}

🛠 Servicios: {{ JSON.parse($json.servicios).join(', ') || 'Sin especificar' }}
📅 Timeline: {{ $json.timeline || 'Sin especificar' }}
🌐 Web actual: {{ $json.web_actual || 'No proporcionada' }}

📝 Descripción:
{{ $json.descripcion || 'Sin descripción' }}

🎤 Audio: {{ $json.audio ? '✅ Adjunto' : '❌ No' }}
📎 Archivos: {{ $json.archivos ? '✅ Adjuntos' : '❌ No' }}
```

### Notificación combinada (si el workflow une ambos pasos)

```
🟢 LEAD COMPLETO

👤 {{ $json.nombre }}
📧 {{ $json.email }}
📞 {{ $json.telefono || '—' }}
💰 {{ $json.presupuesto || '—' }}

🛠 Servicios: {{ JSON.parse($json.servicios).join(', ') }}
📅 Timeline: {{ $json.timeline }}
🌐 Web: {{ $json.web_actual || '—' }}

📝 {{ $json.descripcion || 'Sin descripción del proyecto' }}

📎 Adjuntos:
🎤 Audio: {{ $json.audio ? 'Sí' : 'No' }}
📁 Archivos: {{ $json.archivos ? 'Sí' : 'No' }}

📁 DOCUMENTOS:
{{ $json.doc_funcional_url ? '✅ Doc Funcional: ' + $json.doc_funcional_url : '⏳ Doc Funcional: pendiente' }}
{{ $json.research_url ? '✅ Research: ' + $json.research_url : '⏳ Research: pendiente' }}
{{ $json.audit_seo_url ? '✅ Audit SEO: ' + $json.audit_seo_url : '⏳ Audit SEO: pendiente' }}

📍 Origen: {{ $json.pagina_origen }}
```

---

## Campos que se eliminaron del mensaje actual

Estos campos NO se recogen en ningún formulario, así que siempre salen vacíos:

| Campo eliminado | Motivo |
|---|---|
| Empresa | No se pregunta en el formulario |
| Sector | No se pregunta en el formulario |
| Cargo | No se pregunta en el formulario |
| Tamaño empresa | No se pregunta en el formulario |
| Fiabilidad de datos | Redundante — si no hay datos, no se muestran |
| Intent Score IA | Innecesario en la notificación — mejor en el CRM |
| Análisis comercial largo | Demasiado texto para Telegram — mejor en el doc funcional |
| Scoring 25/100 | No tiene sentido sin los datos de empresa |

## Qué hacer si quieres volver a tener empresa/sector

Si quieres enriquecer leads con datos de empresa, añade un paso en n8n ANTES del mensaje de Telegram:

1. Usa el dominio del email (`email.split('@')[1]`) para buscar en Clearbit, Apollo, o Hunter
2. Solo muestra los campos si realmente se encontraron datos
3. Usa condicionales en la plantilla: `{{ $json.empresa ? '🏢 ' + $json.empresa : '' }}`

Así nunca aparecerán campos vacíos con ❌.
