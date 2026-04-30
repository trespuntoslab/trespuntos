#!/usr/bin/env python3
"""
Generate OG images for all Tres Puntos pages using Chrome headless + universal template.
Output: /img/og/{slug}.png (1200x630)
"""
import os
import re
import json
import sys
import time
import subprocess
import urllib.parse
from pathlib import Path

ROOT = Path("/Users/jordi/Library/CloudStorage/Dropbox/backupok/TRESPUNTOS-LAB/Trespuntos-web-cloude")
OUT_DIR = ROOT / "img" / "og"
TEMPLATE = "/Users/jordi/Library/CloudStorage/Dropbox/backupok/TRESPUNTOS-LAB/Trespuntos-web-cloude/scripts/og/og-template.html"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ──────────────────────────────────────────────────────────────────
# CATEGORIZATION
# ──────────────────────────────────────────────────────────────────

def categorize(rel_path: str, html: str) -> tuple[str, str]:
    """Return (category_badge, slug) for a given index.html relative path."""
    parts = rel_path.split("/")
    parts = [p for p in parts if p and p != "index.html"]

    # Home
    if not parts:
        return ("AGENCIA UX/UI · BARCELONA", "home")

    # Blog
    if parts[0] == "blog":
        if len(parts) == 1:
            return ("BLOG · TRES PUNTOS", "blog")
        slug = parts[1]
        # Try to read article:section meta
        m = re.search(r'<meta\s+property="article:section"\s+content="([^"]+)"', html)
        section = m.group(1) if m else None
        # Fallback: try to find data-category in blog/index.html for this slug
        if not section:
            section_map = blog_categories()
            section = section_map.get(slug)
        if section:
            return (f"BLOG · {section.upper()}", f"blog-{slug}")
        return ("BLOG · TRES PUNTOS", f"blog-{slug}")

    # Casos de negocio
    if parts[0] == "casos-de-negocio":
        if len(parts) == 1:
            return ("CASOS DE ÉXITO · TRES PUNTOS", "casos")
        slug = parts[1]
        client_map = {
            "exitbcn": "EXITBCN",
            "gibobs": "GIBOBS",
            "diferentidea": "DIFERENT IDEA",
            "tusolucionhipotecaria": "TU SOLUCIÓN HIPOTECARIA",
            "penguinaula": "PENGUIN AULA",
            "nomadevans": "NOMADE VANS",
            "nomade-rent": "NOMADE RENT",
            "tsp": "TALENT SEARCH PEOPLE",
            "zimconnections": "ZIM CONNECTIONS",
        }
        client = client_map.get(slug, slug.upper())
        return (f"CASO DE ÉXITO · {client}", f"caso-{slug}")

    # Servicios
    if parts[0] == "servicios":
        if len(parts) == 1:
            return ("SERVICIOS · TRES PUNTOS", "servicios")
        slug = parts[1]
        # Detect city (barcelona, madrid, bilbao, sevilla)
        city = None
        for c in ["barcelona", "madrid", "bilbao", "sevilla"]:
            if slug.endswith(f"-{c}"):
                city = c.upper()
                break
        if city:
            return (f"SERVICIO · {city}", f"servicio-{slug}")
        return ("SERVICIO · TRES PUNTOS", f"servicio-{slug}")

    # Sectores
    if parts[0] == "sectores":
        if len(parts) == 1:
            return ("SECTORES · TRES PUNTOS", "sectores")
        if parts[1] == "analisis" and len(parts) > 2:
            client = parts[2].replace("-", " ").upper()
            return (f"ANÁLISIS · {client}", f"analisis-{parts[2]}")
        sector = parts[1].replace("-", " ").upper()
        return (f"SECTOR · {sector}", f"sector-{parts[1]}")

    # Páginas legales
    legal_map = {
        "aviso-legal": "AVISO LEGAL",
        "politica-privacidad": "POLÍTICA DE PRIVACIDAD",
        "politica-cookies": "POLÍTICA DE COOKIES",
        "politica-redes-sociales": "REDES SOCIALES",
    }
    if parts[0] in legal_map:
        return (f"LEGAL · {legal_map[parts[0]]}", parts[0])

    # Páginas singulares
    singular_map = {
        "nosotros": ("AGENCIA · NOSOTROS", "nosotros"),
        "contacto": ("CONTACTO · TRES PUNTOS", "contacto"),
        "iniciar-proyecto": ("INICIA TU PROYECTO", "iniciar-proyecto"),
        "arquitectura-digital-conversion": ("ARQUITECTURA DIGITAL", "arquitectura-digital-conversion"),
    }
    if parts[0] in singular_map:
        return singular_map[parts[0]]

    # Default
    return ("TRES PUNTOS", "-".join(parts))


_blog_cat_cache = None
def blog_categories() -> dict:
    """Read /blog/index.html and extract slug → data-category mapping."""
    global _blog_cat_cache
    if _blog_cat_cache is not None:
        return _blog_cat_cache
    blog_index = ROOT / "blog" / "index.html"
    html = blog_index.read_text(encoding="utf-8")
    pattern = re.compile(r'href="/blog/([^"/]+)/?"\s+class="blog-card[^"]*"\s+data-category="([^"]+)"')
    _blog_cat_cache = {m.group(1): m.group(2) for m in pattern.finditer(html)}
    return _blog_cat_cache


# ──────────────────────────────────────────────────────────────────
# METADATA EXTRACTION
# ──────────────────────────────────────────────────────────────────

def extract_meta(html: str) -> dict:
    import html as html_lib
    title_m = re.search(r'<title>\s*([^<]+?)\s*</title>', html)
    title = title_m.group(1).strip() if title_m else ""
    desc_m = re.search(
        r'<meta\s+name="description"\s+content="([^"]+)"', html, re.IGNORECASE
    )
    desc = desc_m.group(1).strip() if desc_m else ""
    title = html_lib.unescape(title)
    desc = html_lib.unescape(desc)
    return {"title": title, "description": desc}


def clean_title(title: str, rel_path: str) -> str:
    """Clean title for OG by removing generic suffixes and redundant chunks."""
    if not title:
        return "Tres Puntos Comunicación"

    parts = rel_path.split("/")
    parts = [p for p in parts if p and p != "index.html"]
    section = parts[0] if parts else ""
    t = title

    # Special: Home — pick the value prop (after first " | ", before " · Tres Puntos")
    if section == "":
        m = re.search(r'\|\s*([^|·—]+?)(?:\s*[·—|]\s*Tres Puntos.*)?$', t, re.IGNORECASE)
        if m:
            return m.group(1).strip()

    # Universal: if title has "... | Tres Puntos — VALOR_PROP", prefer the value prop
    # (used by hubs like blog/, casos-de-negocio/, and pages like nosotros/, contacto/)
    m = re.search(r'Tres Puntos\s*[—–]\s*(.+)$', t)
    if m:
        candidate = m.group(1).strip()
        # Use it only if it's substantive (not just "."
        if len(candidate) >= 8:
            return candidate

    # Generic cleanup — strip trailing chunks
    # 1) Remove trailing "Tres Puntos" chunks (with separator)
    t = re.sub(r'\s*[|·—–-]\s*Tres Puntos\b[^|·—–-]*$', '', t, flags=re.IGNORECASE)
    # 2) Remove trailing "| Blog"
    t = re.sub(r'\s*[|·—–-]\s*Blog\s*$', '', t, flags=re.IGNORECASE)
    # 3) Remove trailing "| Caso XYZ"
    t = re.sub(r'\s*[|·—–-]\s*Caso\s+\S.*$', '', t, flags=re.IGNORECASE)
    # 4) Remove trailing "| Tres Puntos" again if remained
    t = re.sub(r'\s*[|·—–-]\s*Tres Puntos.*$', '', t, flags=re.IGNORECASE)

    t = t.strip().rstrip('|·—–-').strip()

    # If still has " | " separator, take first chunk
    if '|' in t:
        chunks = [c.strip() for c in t.split('|') if c.strip()]
        if chunks:
            t = chunks[0]

    return t.strip() or "Tres Puntos Comunicación"


def truncate_subtitle(text: str, max_chars: int = 160) -> str:
    if not text or len(text) <= max_chars:
        return text
    # Cut at last space before max_chars
    cut = text[:max_chars].rsplit(" ", 1)[0]
    return cut.rstrip(",.;:") + "…"


# ──────────────────────────────────────────────────────────────────
# RENDER
# ──────────────────────────────────────────────────────────────────

def render_og(category: str, title: str, subtitle: str, output: Path) -> bool:
    params = urllib.parse.urlencode({"cat": category, "title": title, "sub": subtitle})
    url = f"file://{TEMPLATE}#{params}"
    try:
        result = subprocess.run(
            [
                CHROME,
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--window-size=1200,630",
                "--virtual-time-budget=3000",
                f"--screenshot={output}",
                "--default-background-color=00000000",
                url,
            ],
            capture_output=True,
            timeout=30,
        )
        return output.exists() and output.stat().st_size > 5000
    except subprocess.TimeoutExpired:
        return False


# ──────────────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────────────

def find_pages() -> list[Path]:
    excludes = {"node_modules", ".git", "master", "partners", "_wordpress-backup",
                "form-v3", "private", "api"}
    pages = []
    for p in ROOT.rglob("index.html"):
        rel = p.relative_to(ROOT)
        if any(part in excludes for part in rel.parts):
            continue
        if "casos-de-negocio" in rel.parts and "assets" in rel.parts:
            continue
        pages.append(p)
    return sorted(pages)


def main():
    pages = find_pages()
    print(f"Found {len(pages)} pages\n")
    manifest = []
    failures = []
    start = time.time()

    for i, page in enumerate(pages, 1):
        rel = str(page.relative_to(ROOT))
        html = page.read_text(encoding="utf-8", errors="replace")
        meta = extract_meta(html)
        category, slug = categorize(rel, html)
        title = clean_title(meta["title"], rel)
        subtitle = truncate_subtitle(meta["description"], 160)
        output = OUT_DIR / f"{slug}.png"

        ok = render_og(category, title, subtitle, output)
        status = "OK" if ok else "FAIL"
        size = output.stat().st_size if output.exists() else 0
        print(f"[{i:3d}/{len(pages)}] {status} {slug}.png ({size//1024}KB) — {title[:50]}")

        manifest.append({
            "rel_path": rel,
            "slug": slug,
            "category": category,
            "title": title,
            "subtitle": subtitle,
            "output": f"/img/og/{slug}.png",
            "ok": ok,
        })
        if not ok:
            failures.append(rel)

    # Save manifest
    manifest_path = Path("/Users/jordi/Library/CloudStorage/Dropbox/backupok/TRESPUNTOS-LAB/Trespuntos-web-cloude/scripts/og/manifest.json")
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")

    elapsed = time.time() - start
    print(f"\n{'='*60}")
    print(f"Done in {elapsed:.1f}s · {len(pages)-len(failures)}/{len(pages)} OK · {len(failures)} failed")
    print(f"Manifest: {manifest_path}")
    if failures:
        print("\nFailures:")
        for f in failures:
            print(f"  - {f}")


if __name__ == "__main__":
    main()
