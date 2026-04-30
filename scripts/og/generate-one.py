#!/usr/bin/env python3
"""
Generate OG image for a SINGLE page.

Usage:
  python3 scripts/og/generate-one.py <rel_path> [--preview] [--no-html]

Args:
  rel_path     Relative path to the page (e.g. blog/foo, casos-de-negocio/cliente, blog/foo/index.html)
  --preview    Save to /tmp/og-preview-{slug}.png instead of img/og/, don't touch HTML
  --no-html    Generate the PNG only, don't update the HTML meta tags
"""
import re
import sys
import urllib.parse
import subprocess
import importlib.util
from pathlib import Path

ROOT = Path("/Users/jordi/Library/CloudStorage/Dropbox/backupok/TRESPUNTOS-LAB/Trespuntos-web-cloude")
TEMPLATE = ROOT / "scripts/og/og-template.html"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE_URL = "https://www.trespuntoscomunicacion.es"

# Import categorize + clean_title + extract_meta + truncate_subtitle from generate-og.py
spec = importlib.util.spec_from_file_location("og", ROOT / "scripts/og/generate-og.py")
og = importlib.util.module_from_spec(spec)
spec.loader.exec_module(og)


def normalize_path(arg: str) -> str:
    rel = arg.strip().strip("/")
    if not rel.endswith("index.html"):
        rel = f"{rel}/index.html" if rel else "index.html"
    return rel


def render_png(category: str, title: str, subtitle: str, output: Path) -> bool:
    output.parent.mkdir(parents=True, exist_ok=True)
    params = urllib.parse.urlencode({"cat": category, "title": title, "sub": subtitle})
    url = f"file://{TEMPLATE}#{params}"
    try:
        subprocess.run(
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
            check=True,
            timeout=30,
            capture_output=True,
        )
        return output.exists() and output.stat().st_size > 5000
    except Exception as e:
        print(f"❌ Render failed: {e}", file=sys.stderr)
        return False


def update_html(page: Path, slug: str) -> list[str]:
    """Update OG meta tags in the page's HTML. Returns list of changes made."""
    new_url = f"{BASE_URL}/img/og/{slug}.png"
    html = page.read_text(encoding="utf-8")
    original = html
    changes = []

    # 1) og:image — replace or insert
    new, n = re.subn(
        r'(<meta\s+property="og:image"\s+content=")[^"]*(")',
        rf'\g<1>{new_url}\g<2>',
        html,
    )
    if n > 0:
        html = new
        changes.append(f"og:image x{n}")
    else:
        og_tag = f'  <meta property="og:image" content="{new_url}" />\n'
        html = re.sub(r'(</head>)', og_tag + r'\1', html, count=1)
        changes.append("og:image INSERTED")

    # 2) og:image:width / height (insert if missing)
    if 'property="og:image:width"' not in html:
        meta_block = (
            f'  <meta property="og:image:width" content="1200" />\n'
            f'  <meta property="og:image:height" content="630" />\n'
        )
        html = re.sub(
            r'(<meta\s+property="og:image"\s+content="[^"]+"\s*/?>\s*\n)',
            r'\1' + meta_block,
            html,
            count=1,
        )
        changes.append("og:image:width/height INSERTED")

    # 3) twitter:image
    new, n = re.subn(
        r'(<meta\s+name="twitter:image"\s+content=")[^"]*(")',
        rf'\g<1>{new_url}\g<2>',
        html,
    )
    if n > 0:
        html = new
        changes.append(f"twitter:image x{n}")
    elif re.search(r'<meta\s+name="twitter:card"', html):
        tw_tag = f'  <meta name="twitter:image" content="{new_url}" />\n'
        html = re.sub(
            r'(<meta\s+name="twitter:card"[^>]*>\s*\n)',
            r'\1' + tw_tag,
            html,
            count=1,
        )
        changes.append("twitter:image INSERTED")

    # 4) twitter:card → summary_large_image
    new, n = re.subn(
        r'(<meta\s+name="twitter:card"\s+content=")[^"]*(")',
        r'\1summary_large_image\2',
        html,
    )
    if n > 0:
        html = new
        changes.append("twitter:card normalized")

    # 5) JSON-LD image (only if it points to a wrong path)
    new, n = re.subn(
        r'("image"\s*:\s*")(?:https://www\.trespuntoscomunicacion\.es/img/(?:blog/[^"]*-og\.jpg|og/[^"]*\.png))(")',
        rf'\g<1>{new_url}\g<2>',
        html,
    )
    if n > 0:
        html = new
        changes.append(f"jsonld:image x{n}")

    if html != original:
        page.write_text(html, encoding="utf-8")

    return changes


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    args = sys.argv[1:]
    preview = "--preview" in args
    no_html = "--no-html" in args
    rel_arg = next((a for a in args if not a.startswith("--")), None)
    if not rel_arg:
        sys.exit("Missing rel_path argument")

    rel = normalize_path(rel_arg)
    page = ROOT / rel
    if not page.exists():
        sys.exit(f"❌ Not found: {page}\n   Use the FTP-fetched HTML if Jordan uploaded direct.")

    html = page.read_text(encoding="utf-8", errors="replace")
    meta = og.extract_meta(html)
    category, slug = og.categorize(rel, html)
    title = og.clean_title(meta["title"], rel)
    subtitle = og.truncate_subtitle(meta["description"], 160)

    if preview:
        output = Path(f"/tmp/og-preview-{slug}.png")
    else:
        output = ROOT / "img" / "og" / f"{slug}.png"

    print(f"Path:     {rel}")
    print(f"Slug:     {slug}")
    print(f"Badge:    {category}")
    print(f"Title:    {title}")
    print(f"Subtitle: {subtitle}")
    print(f"Output:   {output}")
    print()

    if not render_png(category, title, subtitle, output):
        sys.exit(f"❌ Failed to generate {output}")

    size = output.stat().st_size
    print(f"✅ Generated: {output} ({size//1024} KB)")

    if preview:
        print(f"\n👁  Preview only — HTML not modified, no upload.")
        # Auto-open in macOS Preview
        try:
            subprocess.run(["open", str(output)], check=False)
        except Exception:
            pass
        return

    if no_html:
        print(f"\n⚠️  HTML not updated (--no-html flag).")
        return

    print(f"\n📝 Updating HTML meta tags in {rel}...")
    changes = update_html(page, slug)
    if changes:
        print(f"   Changes: {', '.join(changes)}")
    else:
        print("   No changes needed (already up to date)")

    print()
    print("─" * 60)
    print("📦 To deploy, FTP these 2 files to Nominalia:")
    print(f"   1. {output}  →  /img/og/{slug}.png")
    print(f"   2. {page}  →  /{rel}")
    print()
    print("Then PURGE Cloudflare:")
    print(f"   - {BASE_URL}/{rel.replace('index.html','')}")
    print(f"   - {BASE_URL}/img/og/{slug}.png")
    print("─" * 60)


if __name__ == "__main__":
    main()
