# Curry Blog Publisher — Automatización de publicación de blog

Sistema que publica automáticamente cada lunes los artículos del blog programados en Notion, sin intervención manual.

## Arquitectura

```
┌─────────────────────┐
│ Notion Plan Blog DB │  ← Fuente de verdad: slug, fecha, estado, categoría
└──────────┬──────────┘
           │
           │ (filter: fecha=hoy AND estado=Aprobado)
           ▼
┌─────────────────────┐         ┌─────────────────────────┐
│ n8n VPS · Curry Pub │ ───GET─→│ GitHub raw (HTMLs+OGs)  │
│ (cron diario 09:00) │         └─────────────────────────┘
└──────────┬──────────┘
           │ FTP
           ▼
┌─────────────────────┐
│ Nominalia (público) │  ← /blog/{slug}/index.html + /img/og/blog-{slug}.png
└──────────┬──────────┘
           │ (purge by URL)
           ▼
┌─────────────────────┐
│ Cloudflare CDN      │  ← invalidación de cache
└─────────────────────┘
           │
           │ (notion update + telegram)
           ▼
┌─────────────────────┐
│ Mesa 3P Telegram    │  ← "✅ Publicado: …"
└─────────────────────┘
```

## Componentes

| Pieza | Dónde vive | Propósito |
|---|---|---|
| **Plan Blog database** | Notion | Calendario y estado de los 16 artículos |
| **HTMLs maquetados** | Repo GitHub `trespuntoslab/trespuntos` | Versionado, fuente de verdad del contenido |
| **OG images** | Repo GitHub | Generadas con `/og-generate` antes de subir al repo |
| **Workflow Curry Publisher** | n8n VPS (`n8n.trespuntos-lab.com`) | Cron diario que publica lo que toque |
| **Web pública** | Nominalia (FTP) | Dominio `www.trespuntoscomunicacion.es` |
| **CDN** | Cloudflare | Cache 2h de HTMLs |
| **Notificaciones** | Telegram grupo Mesa 3P | Avisos de éxito/error |

## Flujo del trabajo manual antes de la publicación

1. **Curry/Bird redacta** el texto del artículo en Notion (subpágina del Plan Blog)
2. **Jordi maqueta** localmente con la skill `/blog-maqueta {slug}` → genera HTML + OG
3. **Jordi revisa** en preview local → http://localhost:3000/blog/{slug}/
4. **Jordi commitea + pushea** a GitHub → ya está disponible en raw.githubusercontent.com
5. **Jordi marca el row Notion** → Estado: `Aprobado`, fecha publicación
6. ⏰ **A las 09:00 del día programado**, Curry Publisher hace el resto

## Archivos en esta carpeta

| Archivo | Contenido |
|---|---|
| `README.md` | Este overview |
| `curry-blog-publisher.json` | Workflow n8n exportable (12 nodos) |
| `setup-notion-db.md` | Guía para convertir el Plan Blog Notion en database |
| `setup-tokens.md` | Guía para crear tokens Notion + Cloudflare |
| `test-plan.md` | Plan de test end-to-end antes de activar el cron |

## Setup en orden

1. **`setup-notion-db.md`** — convertir Plan Blog en database
2. **`setup-tokens.md`** — crear tokens y configurar credenciales en n8n
3. Importar `curry-blog-publisher.json` en n8n VPS
4. **`test-plan.md`** — verificar end-to-end con Art. 2
5. Activar el workflow (toggle Active)

## Estados del workflow

| Estado Notion | Significado | El workflow lo publica |
|---|---|---|
| `Pendiente` | Sin redactar todavía | ❌ |
| `Maquetado` | HTML local listo, sin push a GitHub | ❌ |
| `Aprobado` | HTML en GitHub + Jordi dio OK | ✅ (cuando fecha=hoy) |
| `Publicado` | Ya está en producción | ❌ (no se vuelve a subir) |
| `Rechazado` | No se va a publicar | ❌ |

## Operaciones comunes

### Pausar la publicación de un artículo
Cambia su estado en Notion de `Aprobado` a otro (ej. `Maquetado`). El workflow lo ignorará.

### Adelantar la fecha de publicación
Cambia la fecha en Notion. El workflow lo recogerá el día indicado.

### Re-publicar un artículo (tras edición)
- Cambia su estado de `Publicado` a `Aprobado`
- Cambia la fecha a hoy
- A las 09:00 lo re-sube + purga Cloudflare

### Publicar AHORA (manual)
- En n8n, abre el workflow
- Cambia temporalmente la fecha del row Notion a hoy
- Click "Execute workflow" → corre el flow inmediato
- Restaura la fecha real después

### Pausar todo el sistema
Toggle Active → Off en n8n. Los artículos no se publicarán hasta reactivar.

## Logs y monitoring

- **n8n Executions** (UI): historial completo de cada ejecución
- **Telegram Mesa 3P**: aviso de éxito o error tras cada cron
- **GSC**: Curry Tracker (workflow separado, semanal) mide impresiones a 7d/30d

## Mantenimiento

- **Tokens**: rotar Cloudflare API token cada 6-12 meses
- **Notion integration**: revisar permisos cada vez que se añada una propiedad nueva a la DB
- **Workflow**: backup del JSON exportado en este repo cada vez que se modifique en n8n

## Próximos pasos (futuro)

Cuando el sistema esté rodando, considerar:

- **Curry GSC Tracker** — workflow semanal que mide impresiones/posición de cada artículo publicado y avisa por Telegram si <umbral
- **Curry Sitemap Updater** — al publicar, añadir entrada en `sitemap.xml` automáticamente
- **Curry Hub Updater** — al publicar, añadir card en `/blog/index.html` (página hub) automáticamente
- **Curry Social Distributor** — al publicar, postear automáticamente en LinkedIn de Tres Puntos
