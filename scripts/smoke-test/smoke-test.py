#!/usr/bin/env python3
"""
Smoke test post-deploy — Tres Puntos Comunicación.

Verifica un set de URLs críticas tras cada deploy FTP + purga Cloudflare.
Hace 3 niveles de checks:
  1. HTTP rápido (status, headers, content presence) — siempre, ~5s para 16 URLs
  2. Visual headless (Playwright vía Node) — opcional, --visual flag
  3. Lighthouse mobile en home — opcional, --perf flag

Uso:
    python3 smoke-test.py                  # checks HTTP rápidos (default)
    python3 smoke-test.py --visual         # añade screenshots Playwright
    python3 smoke-test.py --perf           # añade Lighthouse mobile en home
    python3 smoke-test.py --all            # todo
    python3 smoke-test.py --url /blog/foo/ # solo testea esa URL

Output:
    - Tabla pass/fail en terminal con color
    - report.html en el mismo directorio (HTML estático con detalles)
    - screenshots/ con PNGs si --visual y hay fallos
    - Exit code 0 si todo pasa, 1 si hay 1+ fallos críticos

Requiere:
    pip install requests beautifulsoup4
    npx playwright install chromium  (solo si --visual)
    npm i -g lighthouse              (solo si --perf)
"""
import argparse
import json
import re
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin

try:
    import requests
except ImportError:
    print("FATAL: pip install requests beautifulsoup4")
    sys.exit(2)

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("FATAL: pip install beautifulsoup4")
    sys.exit(2)

ROOT = Path(__file__).resolve().parent
URLS_FILE = ROOT / "urls.json"
REPORT_FILE = ROOT / "report.html"
SCREENSHOTS_DIR = ROOT / "screenshots"

# ANSI colors
G = "\033[32m"   # green
R = "\033[31m"   # red
Y = "\033[33m"   # yellow
B = "\033[34m"   # blue
D = "\033[2m"    # dim
N = "\033[0m"    # reset
BOLD = "\033[1m"


def load_manifest():
    with open(URLS_FILE) as f:
        return json.load(f)


def check_http(base_url, entry, timeout=15):
    """Single URL HTTP check. Returns dict with results."""
    url = urljoin(base_url, entry["path"])
    result = {
        "url": url,
        "label": entry["label"],
        "checks": {},
        "errors": [],
        "warnings": [],
    }
    try:
        t0 = time.time()
        r = requests.get(
            url,
            timeout=timeout,
            headers={"User-Agent": "TresPuntos-SmokeTest/1.0 (+jordi@trespuntos-lab.com)"},
            allow_redirects=True,
        )
        result["elapsed_ms"] = int((time.time() - t0) * 1000)
        result["status"] = r.status_code
        result["final_url"] = r.url
        result["cf_cache"] = r.headers.get("cf-cache-status", "—")
        result["content_length"] = len(r.content)
        result["server"] = r.headers.get("server", "—")
    except requests.RequestException as e:
        result["errors"].append(f"Request failed: {e}")
        result["status"] = 0
        return result

    checks = entry.get("checks", ["status"])

    if "status" in checks:
        ok = 200 <= r.status_code < 400
        result["checks"]["status"] = ok
        if not ok:
            result["errors"].append(f"HTTP {r.status_code}")

    if "html_size" in checks:
        ok = result["content_length"] > 5000
        result["checks"]["html_size"] = ok
        if not ok:
            result["errors"].append(f"HTML too small ({result['content_length']}B) — likely partial response")

    text = r.text if r.status_code < 400 else ""

    # must_contain assertions
    for needle in entry.get("must_contain", []):
        ok = needle.lower() in text.lower()
        result["checks"][f"contains:{needle[:30]}"] = ok
        if not ok:
            result["errors"].append(f"Missing required text: {needle!r}")

    for needle in entry.get("must_not_contain", []):
        bad = needle.lower() in text.lower()
        result["checks"][f"absent:{needle[:30]}"] = not bad
        if bad:
            result["errors"].append(f"Forbidden text present: {needle!r}")

    if r.status_code < 400:
        soup = BeautifulSoup(text, "html.parser")

        if "navbar" in checks:
            # En HTTP-only, muchos templates dejan el navbar para components.js (inyección runtime).
            # No es error sino aviso: el check real es visual (Playwright tras JS).
            has_nav_html = bool(soup.select_one("nav, [role=navigation], .nav, #nav, header nav, .navbar"))
            has_components_js = "components.js" in text or "TP.navbar" in text
            ok = has_nav_html or has_components_js
            result["checks"]["navbar"] = ok
            if not ok:
                result["errors"].append("Sin <nav> ni components.js — navbar no se renderizará")
            elif not has_nav_html and has_components_js:
                result["warnings"].append("Navbar inyectado por components.js (verificar con --visual)")

        if "footer" in checks:
            has_footer_html = bool(soup.select_one("footer"))
            has_components_js = "components.js" in text or "TP.footer" in text
            ok = has_footer_html or has_components_js
            result["checks"]["footer"] = ok
            if not ok:
                result["errors"].append("Sin <footer> ni components.js — footer no se renderizará")
            elif not has_footer_html and has_components_js:
                result["warnings"].append("Footer inyectado por components.js (verificar con --visual)")

        if "jordan_widget" in checks:
            scripts = " ".join(s.get("src", "") for s in soup.find_all("script"))
            has_v7 = "jordan-widget-v7" in scripts
            result["checks"]["jordan_widget"] = has_v7
            if not has_v7:
                # check for older versions for diagnostic
                if any(v in scripts for v in ["jordan-widget-v6", "jordan-widget-v5", "jordan-widget-v4"]):
                    result["errors"].append("Jordan widget present but not v7 (cache-bust failed?)")
                else:
                    result["errors"].append("Jordan widget script not found")

        if "og_image" in checks:
            og = soup.find("meta", property="og:image")
            ok = bool(og and og.get("content", "").startswith("http"))
            result["checks"]["og_image"] = ok
            if not ok:
                result["errors"].append("Missing og:image with absolute URL")
            else:
                og_url = og["content"]
                try:
                    # GET (no HEAD) porque algunos CDN cachean HEAD distinto
                    og_r = requests.get(og_url, timeout=5, stream=True, allow_redirects=True)
                    ctype = og_r.headers.get("content-type", "")
                    if og_r.status_code >= 400:
                        result["errors"].append(f"og:image roto ({og_r.status_code}): {og_url} — preview en redes no funcionará")
                    elif not ctype.startswith("image/"):
                        result["errors"].append(f"og:image content-type incorrecto ({ctype}): {og_url}")
                    og_r.close()
                except requests.RequestException as e:
                    result["errors"].append(f"og:image unreachable: {og_url} ({e})")

        if "no_console_errors" in checks:
            # informational only at HTTP level — needs --visual for real check
            result["checks"]["no_console_errors"] = "skipped (use --visual)"

    # informational: cf-cache-status
    if r.headers.get("cf-cache-status") == "HIT":
        result["warnings"].append("cf-cache-status HIT — was Cloudflare purged after FTP?")

    return result


def check_visual(base_url, entries):
    """Run Playwright (Node) to take screenshots + check console errors."""
    SCREENSHOTS_DIR.mkdir(exist_ok=True)
    script = ROOT / "_playwright-runner.mjs"
    if not script.exists():
        print(f"{Y}Skipping --visual: {script.name} not found{N}")
        return {}

    targets = [{"path": e["path"], "label": e["label"]} for e in entries]
    payload = json.dumps({
        "base_url": base_url,
        "targets": targets,
        "screenshots_dir": str(SCREENSHOTS_DIR),
    })
    try:
        r = subprocess.run(
            ["node", str(script)],
            input=payload,
            capture_output=True,
            text=True,
            timeout=300,
        )
        if r.returncode != 0:
            print(f"{R}Playwright runner failed: {r.stderr[:500]}{N}")
            return {}
        return json.loads(r.stdout)
    except subprocess.TimeoutExpired:
        print(f"{R}Playwright runner timeout (5min){N}")
        return {}
    except Exception as e:
        print(f"{R}Playwright runner error: {e}{N}")
        return {}


def check_lighthouse(base_url):
    """Run Lighthouse CLI mobile audit on home only."""
    try:
        r = subprocess.run(
            ["npx", "--yes", "lighthouse", base_url,
             "--quiet", "--chrome-flags=--headless",
             "--only-categories=performance,accessibility,best-practices,seo",
             "--output=json", "--output-path=stdout",
             "--preset=desktop" if False else "--form-factor=mobile",
             "--throttling-method=simulate"],
            capture_output=True, text=True, timeout=120,
        )
        if r.returncode != 0:
            return None
        data = json.loads(r.stdout)
        return {
            "performance": int(data["categories"]["performance"]["score"] * 100),
            "accessibility": int(data["categories"]["accessibility"]["score"] * 100),
            "bestPractices": int(data["categories"]["best-practices"]["score"] * 100),
            "seo": int(data["categories"]["seo"]["score"] * 100),
            "lcp_ms": data["audits"]["largest-contentful-paint"]["numericValue"],
            "cls": data["audits"]["cumulative-layout-shift"]["numericValue"],
            "tbt_ms": data["audits"]["total-blocking-time"]["numericValue"],
        }
    except Exception as e:
        print(f"{Y}Lighthouse skipped: {e}{N}")
        return None


def render_report(results, lh_data, base_url):
    """Generate static HTML report."""
    now = datetime.now().isoformat(timespec="seconds")
    rows = []
    for r in results:
        ok = not r["errors"]
        cls = "ok" if ok else "fail"
        check_pills = " ".join(
            f'<span class="pill {"ok" if v is True else ("warn" if v == "skipped (use --visual)" else "fail")}">{k}</span>'
            for k, v in r.get("checks", {}).items()
        )
        errs = "<br>".join(f'<span class="err">{e}</span>' for e in r["errors"])
        warns = "<br>".join(f'<span class="warn">{w}</span>' for w in r.get("warnings", []))
        rows.append(f"""
        <tr class="{cls}">
          <td><strong>{r['label']}</strong><br><span class="dim">{r['url']}</span></td>
          <td>{r.get('status','—')}</td>
          <td>{r.get('elapsed_ms','—')}ms</td>
          <td>{r.get('cf_cache','—')}</td>
          <td>{check_pills}</td>
          <td>{errs}{('<br>'+warns) if warns else ''}</td>
        </tr>""")

    lh_block = ""
    if lh_data:
        lh_block = f"""
        <h2>Lighthouse mobile · home</h2>
        <table>
          <tr><th>Performance</th><th>A11y</th><th>Best Practices</th><th>SEO</th><th>LCP</th><th>CLS</th><th>TBT</th></tr>
          <tr>
            <td class="score-{ 'ok' if lh_data['performance'] >= 90 else 'warn' if lh_data['performance']>=50 else 'fail'}">{lh_data['performance']}</td>
            <td class="score-{ 'ok' if lh_data['accessibility'] >= 90 else 'warn' if lh_data['accessibility']>=70 else 'fail'}">{lh_data['accessibility']}</td>
            <td class="score-{ 'ok' if lh_data['bestPractices'] >= 90 else 'warn' if lh_data['bestPractices']>=70 else 'fail'}">{lh_data['bestPractices']}</td>
            <td class="score-{ 'ok' if lh_data['seo'] >= 90 else 'warn' if lh_data['seo']>=70 else 'fail'}">{lh_data['seo']}</td>
            <td>{lh_data['lcp_ms']/1000:.2f}s</td>
            <td>{lh_data['cls']:.3f}</td>
            <td>{lh_data['tbt_ms']:.0f}ms</td>
          </tr>
        </table>"""

    n_pass = sum(1 for r in results if not r["errors"])
    n_fail = len(results) - n_pass
    summary_color = "ok" if n_fail == 0 else "fail"
    html = f"""<!doctype html><meta charset="utf-8">
<title>Smoke test · {now}</title>
<style>
  body {{ font: 14px/1.5 -apple-system, system-ui, sans-serif; background: #0e0e0e; color: #f0f0f0; padding: 2rem; }}
  h1 {{ color: #5dffbf; margin: 0 0 .5rem; }}
  .meta {{ color: #888; margin-bottom: 2rem; }}
  table {{ width: 100%; border-collapse: collapse; margin-bottom: 2rem; }}
  th, td {{ padding: .6rem .8rem; text-align: left; border-bottom: 1px solid #2a2a2a; vertical-align: top; }}
  th {{ background: #1a1a1a; color: #aaa; font-weight: 600; }}
  tr.ok td {{ background: rgba(93,255,191,.04); }}
  tr.fail td {{ background: rgba(255,80,80,.08); }}
  .pill {{ display: inline-block; padding: 2px 8px; margin: 1px; border-radius: 999px; font-size: 11px; font-family: ui-monospace, monospace; }}
  .pill.ok {{ background: #1a3a2a; color: #5dffbf; }}
  .pill.fail {{ background: #3a1a1a; color: #ff8080; }}
  .pill.warn {{ background: #3a2e1a; color: #ffc060; }}
  .err {{ color: #ff8080; }}
  .warn {{ color: #ffc060; }}
  .dim {{ color: #666; font-size: 12px; }}
  .summary {{ font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }}
  .summary.ok {{ color: #5dffbf; }}
  .summary.fail {{ color: #ff8080; }}
  .score-ok {{ color: #5dffbf; font-weight: 700; }}
  .score-warn {{ color: #ffc060; font-weight: 700; }}
  .score-fail {{ color: #ff8080; font-weight: 700; }}
</style>
<h1>Smoke test · Tres Puntos</h1>
<div class="meta">{base_url} · {now}</div>
<div class="summary {summary_color}">{n_pass}/{len(results)} pass · {n_fail} fail</div>
<table>
  <tr><th>URL</th><th>Status</th><th>Time</th><th>CF cache</th><th>Checks</th><th>Errors / Warnings</th></tr>
  {''.join(rows)}
</table>
{lh_block}
"""
    REPORT_FILE.write_text(html)
    return REPORT_FILE


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--visual", action="store_true", help="Add Playwright visual checks (slower)")
    parser.add_argument("--perf", action="store_true", help="Run Lighthouse mobile on home")
    parser.add_argument("--all", action="store_true", help="--visual + --perf")
    parser.add_argument("--url", help="Test only this single URL path")
    parser.add_argument("--base", help="Override base URL (default from urls.json)")
    parser.add_argument("--quiet", action="store_true", help="Less verbose output")
    args = parser.parse_args()

    manifest = load_manifest()
    base_url = args.base or manifest["_meta"]["base_url"]
    entries = manifest["urls"]

    if args.url:
        entries = [e for e in entries if e["path"] == args.url]
        if not entries:
            print(f"{R}URL {args.url!r} not in manifest{N}")
            sys.exit(2)

    if args.all:
        args.visual = args.perf = True

    print(f"{BOLD}Smoke test · {base_url}{N}")
    print(f"Checking {len(entries)} URLs...\n")

    # Parallel HTTP checks
    results = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(check_http, base_url, e): e for e in entries}
        for f in as_completed(futures):
            results.append(f.result())

    # Sort to match original order
    order = {e["path"]: i for i, e in enumerate(entries)}
    results.sort(key=lambda r: order.get(r["url"].replace(base_url, "") or "/", 999))

    # Print table
    n_pass = n_fail = 0
    for r in results:
        ok = not r["errors"]
        marker = f"{G}✔{N}" if ok else f"{R}✘{N}"
        cf = r.get("cf_cache", "—")
        cf_color = G if cf == "MISS" else (Y if cf == "HIT" else D)
        line = f"  {marker} {r['label']:<35} {r.get('status','---')} {r.get('elapsed_ms','---'):>5}ms  {cf_color}{cf}{N}"
        print(line)
        if not args.quiet:
            for e in r["errors"]:
                print(f"      {R}↳ {e}{N}")
            for w in r.get("warnings", []):
                print(f"      {Y}↳ {w}{N}")
        if ok:
            n_pass += 1
        else:
            n_fail += 1

    # Optional visual
    if args.visual:
        print(f"\n{BOLD}Running Playwright visual checks...{N}")
        visual_results = check_visual(base_url, entries)
        # merge
        for r in results:
            v = visual_results.get(r["url"])
            if v:
                r["checks"].update(v.get("checks", {}))
                r["errors"].extend(v.get("errors", []))
                r["warnings"].extend(v.get("warnings", []))
                if v.get("screenshot"):
                    r["screenshot"] = v["screenshot"]

    # Optional Lighthouse
    lh_data = None
    if args.perf:
        print(f"\n{BOLD}Running Lighthouse mobile on home...{N}")
        lh_data = check_lighthouse(base_url)
        if lh_data:
            print(f"  Perf: {lh_data['performance']} · A11y: {lh_data['accessibility']} · "
                  f"BP: {lh_data['bestPractices']} · SEO: {lh_data['seo']}")
            print(f"  LCP: {lh_data['lcp_ms']/1000:.2f}s · CLS: {lh_data['cls']:.3f} · TBT: {lh_data['tbt_ms']:.0f}ms")

    # Report
    report_path = render_report(results, lh_data, base_url)

    print(f"\n{BOLD}Result: {G if n_fail==0 else R}{n_pass}/{len(results)} pass · {n_fail} fail{N}")
    print(f"Report: {report_path}")
    if SCREENSHOTS_DIR.exists() and any(SCREENSHOTS_DIR.iterdir()):
        print(f"Screenshots: {SCREENSHOTS_DIR}")

    sys.exit(0 if n_fail == 0 else 1)


if __name__ == "__main__":
    main()
