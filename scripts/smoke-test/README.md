# Smoke test post-deploy

Verifica que el sitio funciona tras cada FTP + purga Cloudflare. Detecta el tipo de incidente que pasó con el FOUC del 10-abr o el loop `.htaccess` de `/servicios/`.

## Quick start

```bash
cd scripts/smoke-test
python3 smoke-test.py                    # checks HTTP rápidos (~5s)
python3 smoke-test.py --visual           # + Playwright headless (~60s)
python3 smoke-test.py --perf             # + Lighthouse mobile en home (~30s)
python3 smoke-test.py --all              # todo
python3 smoke-test.py --url /blog/foo/   # solo una URL
```

Output: tabla en terminal + `report.html` + `screenshots/` (solo de fallos).
Exit code 0 si todo pasa, 1 si hay 1+ fallos.

## Qué valida

### HTTP rápido (default, sin dependencias extra)
- Status 2xx/3xx
- Headers (`cf-cache-status` — alerta si HIT post-deploy → falló la purga)
- Tamaño HTML mínimo (detecta respuestas truncadas)
- Texto requerido / prohibido (`must_contain` / `must_not_contain`)
- `<nav>` y `<footer>` presentes en HTML
- Script Jordan widget v7 presente
- `og:image` con URL absoluta + verifica que esa URL existe (HEAD)

### Visual con Playwright (`--visual`)
- Mobile viewport real (iPhone 14)
- Navbar y footer **renderizados** (no solo en HTML — verifica que `components.js` corrió)
- Jordan widget cargado en el DOM
- Console errors / uncaught exceptions
- Failed network requests
- Screenshot fullPage solo cuando hay fallo

### Lighthouse mobile (`--perf`, solo home)
- Performance, Accessibility, Best Practices, SEO scores
- LCP, CLS, TBT
- Útil para detectar regresiones tipo "subimos critical CSS roto y CLS pasó de 0.005 a 0.49"

## Editar la lista de URLs

`urls.json` define qué se chequea. Para añadir una página nueva:

```json
{
  "path": "/blog/mi-post-nuevo/",
  "label": "Blog: Mi post",
  "must_contain": ["palabra clave del post"],
  "checks": ["status", "navbar", "footer", "jordan_widget", "og_image"]
}
```

Checks disponibles: `status`, `html_size`, `navbar`, `footer`, `jordan_widget`, `og_image`, `no_console_errors`, `contains:*`, `absent:*`.

## Setup inicial (una sola vez)

```bash
pip3 install requests beautifulsoup4
```

Para `--visual`:
```bash
npm i playwright
npx playwright install chromium
```

Para `--perf`: usa `npx --yes lighthouse` (no requiere install global).

## Cuándo ejecutarlo

**Obligatorio:**
1. Tras cada FTP a Nominalia + purga Cloudflare → `python3 smoke-test.py` (5s)
2. Tras un cambio estructural (CSS framework, `.htaccess`, `components.js`) → `--all` (90s)

**Opcional:**
3. Cron diario para detectar regresiones silenciosas (rutas que se rompen sin tocar nada)
4. Antes de un push importante a main, en local

## Workflow sugerido tras deploy

```bash
# 1. FTP los archivos modificados
# 2. Purgar Cloudflare (Custom URL si <5 archivos, Purge Everything si más)
# 3. Smoke test
python3 scripts/smoke-test/smoke-test.py

# Si todo verde → anota en DEPLOY_LOG.md y termina
# Si rojo → abre report.html, mira los screenshots de fallos, fixea, redeploya
```

## Integración futura (no implementada aún)

- Hook PostToolUse en Claude Code que dispare el smoke test cuando detecte `curl ... ftp://`
- Endpoint en n8n que lo ejecute cada hora y notifique Telegram si rompe
- GitHub Action (cuando el repo esté en CI/CD real) que lo corra en cada push a main
