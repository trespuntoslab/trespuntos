#!/usr/bin/env python3
"""
Update OG image references in all 101 HTML files based on manifest.json.
Replaces og:image, twitter:image, and JSON-LD image fields.
"""
import re
import json
import sys
from pathlib import Path

ROOT = Path("/Users/jordi/Library/CloudStorage/Dropbox/backupok/TRESPUNTOS-LAB/Trespuntos-web-cloude")
MANIFEST = Path("/Users/jordi/Library/CloudStorage/Dropbox/backupok/TRESPUNTOS-LAB/Trespuntos-web-cloude/scripts/og/manifest.json")
BASE_URL = "https://www.trespuntoscomunicacion.es"

manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

stats = {"updated": 0, "no_change": 0, "missing": 0}
report = []

for entry in manifest:
    rel = entry["rel_path"]
    slug = entry["slug"]
    new_url = f"{BASE_URL}/img/og/{slug}.png"
    page = ROOT / rel
    if not page.exists():
        stats["missing"] += 1
        report.append(f"[MISS] {rel}")
        continue

    html = page.read_text(encoding="utf-8")
    original = html
    changes = []

    # 1) <meta property="og:image" content="...">
    new, n = re.subn(
        r'(<meta\s+property="og:image"\s+content=")[^"]*(")',
        rf'\g<1>{new_url}\g<2>',
        html,
    )
    if n > 0:
        html = new
        changes.append(f"og:image x{n}")
    else:
        # Insert it just before </head> if missing
        og_tag = f'  <meta property="og:image" content="{new_url}" />\n'
        html = re.sub(r'(</head>)', og_tag + r'\1', html, count=1)
        changes.append("og:image INSERTED")

    # 2) og:image:width and og:image:height (only if not already present)
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

    # 3) <meta name="twitter:image" content="...">
    new, n = re.subn(
        r'(<meta\s+name="twitter:image"\s+content=")[^"]*(")',
        rf'\g<1>{new_url}\g<2>',
        html,
    )
    if n > 0:
        html = new
        changes.append(f"twitter:image x{n}")
    else:
        # Insert it after twitter:card line if exists, else before </head>
        if re.search(r'<meta\s+name="twitter:card"', html):
            tw_tag = f'  <meta name="twitter:image" content="{new_url}" />\n'
            html = re.sub(
                r'(<meta\s+name="twitter:card"[^>]*>\s*\n)',
                r'\1' + tw_tag,
                html,
                count=1,
            )
            changes.append("twitter:image INSERTED")

    # 4) Twitter card type (ensure summary_large_image)
    new, n = re.subn(
        r'(<meta\s+name="twitter:card"\s+content=")[^"]*(")',
        r'\1summary_large_image\2',
        html,
    )
    if n > 0 and new != html:
        html = new
        changes.append("twitter:card normalized")
    else:
        html = new  # apply even if no change

    # 5) JSON-LD "image": "..." inside @type BlogPosting / Article / etc.
    # Only replace if value matches old/wrong path patterns (relative or wrong filename)
    # We replace any "image": "...trespuntoscomunicacion.es/img/blog/...og.jpg" or similar wrong refs
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
        stats["updated"] += 1
        report.append(f"[UPD] {rel} — {', '.join(changes)}")
    else:
        stats["no_change"] += 1
        report.append(f"[ -- ] {rel} (no change)")

print(f"\n{'='*70}")
print(f"Updated: {stats['updated']} · No change: {stats['no_change']} · Missing: {stats['missing']}")
print(f"{'='*70}\n")
# Print first 20 + last 5 of report
for line in report[:20]:
    print(line)
if len(report) > 25:
    print(f"... {len(report)-25} more ...")
for line in report[-5:]:
    print(line)
