#!/usr/bin/env python3
"""
LinkedIn Analytics XLSX Importer — Tres Puntos

Lee XLSX exportados desde LinkedIn Company Page Analytics y los inserta/actualiza
en la tabla `LinkedIn_Snapshots` de la base Airtable "Analytics".

Pipeline:
  1. Jordi exporta XLSX desde LinkedIn admin
  2. Drop en ~/Dropbox/Tres Puntos/LinkedIn Analytics/inbox/
  3. Ejecuta este script
  4. Hace upsert por snapshot_id (no duplica si re-procesas)
  5. Mueve XLSX a processed/ con timestamp

Uso:
  python3 scripts/linkedin/import-xlsx.py                       # procesa toda la inbox
  python3 scripts/linkedin/import-xlsx.py --dry-run             # solo imprime qué haría
  python3 scripts/linkedin/import-xlsx.py --keep                # no mueve a processed/
  python3 scripts/linkedin/import-xlsx.py path.xlsx             # procesa un archivo concreto
  python3 scripts/linkedin/import-xlsx.py --export-json out.json  # vuelca JSON sin escribir Airtable (no requiere PAT)

Requiere:
  - openpyxl, pandas, requests (pip install openpyxl pandas requests)
  - PAT de Airtable en env var AIRTABLE_PAT o ~/.config/tres-puntos/airtable.env
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    import pandas as pd
    import requests
except ImportError as e:
    print(f"Error: falta dependencia ({e}). Instala con: pip3 install openpyxl pandas requests")
    sys.exit(1)

# --- Configuración ----------------------------------------------------------

AIRTABLE_BASE_ID = "app2vjuhe4kJkrH5u"            # base "Analytics"
AIRTABLE_TABLE_ID = "tbl7JxNjtOj4s3FYL"           # tabla "LinkedIn_Snapshots"
CLIENT_RECORD_ID = "rec9UH6rTgxHykknV"            # cliente "Tres Puntos"
CLIENT_SLUG = "trespuntos"

INBOX = Path.home() / "Library/CloudStorage/Dropbox/Tres Puntos/LinkedIn Analytics/inbox"
PROCESSED = Path.home() / "Library/CloudStorage/Dropbox/Tres Puntos/LinkedIn Analytics/processed"

# Field IDs de la tabla LinkedIn_Snapshots
FIELDS = {
    "snapshot_id":                    "fld0czsolrg99Bh6m",
    "client":                         "fldar4FuCpFhafJaH",
    "date":                           "fldGfWIc97BWsTgOA",
    "impressions":                    "fldbhycCoGw7sqKh7",
    "interactions":                   "fldtTDAVVt19mDePR",
    "members_reached":                "fldgMoAoEH37ajIxv",
    "followers_total":                "flds4RuieiHD4xviD",
    "new_followers":                  "fld2L62zsE6kO3WRC",
    "engagement_rate":                "fldsKgIpflM7vg7py",
    "top_posts_by_interactions_json": "flds7vsif6iMttXLR",
    "top_posts_by_impressions_json":  "fldwj4CNaPMLLg20y",
    "demo_jobtitles_json":            "fld5ECLWHgSHexFK7",
    "demo_locations_json":            "fldVBi8hwGm9a3TTK",
    "demo_industries_json":           "fldJsWdhZEFS9iEpZ",
    "demo_seniority_json":            "fldezATVVcUIQiwJm",
    "demo_company_size_json":         "fldqqqhKpTl0y4mZy",
    "demo_top_companies_json":        "fldtpMGeXmI4d9r2l",
    "period_start":                   "fld0jX9ILyB0Ab3eY",
    "period_end":                     "fldfe4UNIfCXK705N",
    "is_period_end":                  "fldGuq9fLU4TtzJzr",
    "source_file":                    "fld8Qf9P3LszVtkGG",
    "fetched_at":                     "fldkJOgDydeg7j96g",
}

# Mapeo categoría demografía (label en español del XLSX) → field key
DEMO_FIELD_MAP = {
    "Cargos":                   "demo_jobtitles_json",
    "Ubicaciones":              "demo_locations_json",
    "Sectores":                 "demo_industries_json",
    "Nivel de responsabilidad": "demo_seniority_json",
    "Tamaño de la empresa":     "demo_company_size_json",
    "Empresas":                 "demo_top_companies_json",
}


# --- Helpers ---------------------------------------------------------------

def load_pat() -> str:
    """Carga el Airtable PAT de env var o config file."""
    pat = os.environ.get("AIRTABLE_PAT")
    if pat:
        return pat.strip()

    cfg = Path.home() / ".config/tres-puntos/airtable.env"
    if cfg.exists():
        for line in cfg.read_text().splitlines():
            line = line.strip()
            if line.startswith("AIRTABLE_PAT="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")

    print("Error: no se encontró el Airtable PAT.")
    print("Solución 1 (recomendado): export AIRTABLE_PAT='patXXXXXXX'")
    print("Solución 2: crea ~/.config/tres-puntos/airtable.env con AIRTABLE_PAT=patXXXXXXX")
    sys.exit(1)


def parse_date_es(value: Any) -> str | None:
    """Convierte fechas del XLSX (datetime, '4/5/2025', etc.) a YYYY-MM-DD."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d")
    if isinstance(value, str):
        s = value.strip()
        # Formato D/M/YYYY (LinkedIn ES)
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"):
            try:
                return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
            except ValueError:
                continue
    return None


def safe_int(value: Any) -> int:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return 0
    try:
        return int(value)
    except (ValueError, TypeError):
        return 0


def safe_float(value: Any) -> float | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


# --- XLSX parser -----------------------------------------------------------

def parse_xlsx(path: Path) -> dict:
    """Lee las 5 hojas del XLSX de LinkedIn y devuelve dict estructurado."""
    xl = pd.ExcelFile(path)
    sheets_lower = {s.lower(): s for s in xl.sheet_names}

    def find_sheet(*candidates: str) -> str | None:
        for cand in candidates:
            for low, original in sheets_lower.items():
                if cand.lower() in low:
                    return original
        return None

    result = {
        "source_file": path.name,
        "members_reached": 0,
        "total_impressions_period": 0,
        "daily": {},                 # date_iso -> {impressions, interactions}
        "followers": {},             # date_iso -> {followers_total?, new_followers}
        "followers_total_latest": None,
        "top_by_interactions": [],
        "top_by_impressions": [],
        "demo": {key: [] for key in DEMO_FIELD_MAP.values()},
        "period_start": None,
        "period_end": None,
    }

    # Hoja DESCUBRIMIENTO: rango de fechas + total impresiones + miembros alcanzados
    sh = find_sheet("descubrimiento")
    if sh:
        df = pd.read_excel(path, sheet_name=sh, header=None)
        # Estructura típica: R0 [Rendimiento general, "27/4/2026 - 3/5/2026"]
        #                    R1 [Impresiones, NN]
        #                    R2 [Miembros alcanzados, NN]
        for _, row in df.iterrows():
            if len(row) < 2:
                continue
            label = str(row.iloc[0]).strip().lower() if pd.notna(row.iloc[0]) else ""
            val = row.iloc[1]
            if "rendimiento" in label and isinstance(val, str) and " - " in val:
                parts = [p.strip() for p in val.split(" - ")]
                if len(parts) == 2:
                    result["period_start"] = parse_date_es(parts[0])
                    result["period_end"] = parse_date_es(parts[1])
            elif "impresion" in label:
                result["total_impressions_period"] = safe_int(val)
            elif "miembros alcanzados" in label or "alcanzad" in label:
                result["members_reached"] = safe_int(val)

    # Hoja INTERACCIÓN: serie diaria
    sh = find_sheet("interacci")
    if sh:
        df = pd.read_excel(path, sheet_name=sh, header=None)
        # R0 header: [Fecha, Impresiones, Interacciones]; R1+ datos
        header_row = 0
        for i, row in df.iterrows():
            cell0 = str(row.iloc[0]).strip().lower() if pd.notna(row.iloc[0]) else ""
            if "fecha" in cell0:
                header_row = i
                break
        for _, row in df.iloc[header_row + 1:].iterrows():
            d = parse_date_es(row.iloc[0])
            if not d:
                continue
            result["daily"].setdefault(d, {})
            result["daily"][d]["impressions"] = safe_int(row.iloc[1] if len(row) > 1 else 0)
            result["daily"][d]["interactions"] = safe_int(row.iloc[2] if len(row) > 2 else 0)

    # Hoja PUBLICACIONES PRINCIPALES: 2 listas (por interacciones y por impresiones)
    sh = find_sheet("publicaciones")
    if sh:
        df = pd.read_excel(path, sheet_name=sh, header=None)
        # Columnas A-C: top por interacciones; columnas E-G: top por impresiones
        # Header row contiene "URL de la publicación" en col 0 y col 4
        header_row = None
        for i, row in df.iterrows():
            cell0 = str(row.iloc[0]).strip().lower() if pd.notna(row.iloc[0]) else ""
            if "url" in cell0 and "publicaci" in cell0:
                header_row = i
                break
        if header_row is not None:
            for _, row in df.iloc[header_row + 1:].iterrows():
                # Columnas A-C
                if len(row) >= 3 and pd.notna(row.iloc[0]) and isinstance(row.iloc[0], str) and row.iloc[0].startswith("http"):
                    result["top_by_interactions"].append({
                        "url": row.iloc[0].strip(),
                        "publish_date": parse_date_es(row.iloc[1]),
                        "interactions": safe_int(row.iloc[2]),
                    })
                # Columnas E-G (índices 4-6)
                if len(row) >= 7 and pd.notna(row.iloc[4]) and isinstance(row.iloc[4], str) and row.iloc[4].startswith("http"):
                    result["top_by_impressions"].append({
                        "url": row.iloc[4].strip(),
                        "publish_date": parse_date_es(row.iloc[5]),
                        "impressions": safe_int(row.iloc[6]),
                    })

    # Hoja SEGUIDORES: total + nuevos por día
    sh = find_sheet("seguidores")
    if sh:
        df = pd.read_excel(path, sheet_name=sh, header=None)
        # R0: [Total de seguidores el FECHA:, NN]
        # R2 header: [Fecha, Nuevos seguidores]
        # R3+: datos
        for _, row in df.iterrows():
            cell0 = str(row.iloc[0]).strip().lower() if pd.notna(row.iloc[0]) else ""
            if "total de seguidores" in cell0 and pd.notna(row.iloc[1]):
                result["followers_total_latest"] = safe_int(row.iloc[1])
                break
        header_row = None
        for i, row in df.iterrows():
            cell0 = str(row.iloc[0]).strip().lower() if pd.notna(row.iloc[0]) else ""
            if cell0 == "fecha":
                header_row = i
                break
        if header_row is not None:
            for _, row in df.iloc[header_row + 1:].iterrows():
                d = parse_date_es(row.iloc[0])
                if not d:
                    continue
                result["followers"].setdefault(d, {})
                result["followers"][d]["new_followers"] = safe_int(row.iloc[1] if len(row) > 1 else 0)

    # Hoja INFORMACIÓN DETALLADA: demografía
    sh = find_sheet("información detallada", "informacion detallada")
    if sh:
        df = pd.read_excel(path, sheet_name=sh, header=None)
        # R0 header: [Información detallada principal, Valor, Porcentaje]
        # R1+: [categoria, label, percent]
        for _, row in df.iloc[1:].iterrows():
            if len(row) < 3:
                continue
            category = str(row.iloc[0]).strip() if pd.notna(row.iloc[0]) else ""
            label = str(row.iloc[1]).strip() if pd.notna(row.iloc[1]) else ""
            pct_raw = row.iloc[2]
            if not category or not label or category not in DEMO_FIELD_MAP:
                continue
            # Porcentaje puede ser float (0.044) o string ("< 1 %")
            pct: Any
            if isinstance(pct_raw, (int, float)) and pd.notna(pct_raw):
                pct = float(pct_raw)
            else:
                pct = str(pct_raw).strip() if pd.notna(pct_raw) else None
            result["demo"][DEMO_FIELD_MAP[category]].append({
                "label": label,
                "percent": pct,
            })

    return result


# --- Build snapshot rows ---------------------------------------------------

def build_rows(parsed: dict, fetched_at_iso: str) -> list[dict]:
    """Genera N rows (1 por día con datos), is_period_end=true en el último."""
    # Unión de fechas presentes en daily o followers
    all_dates = sorted(set(list(parsed["daily"].keys()) + list(parsed["followers"].keys())))
    if not all_dates:
        return []

    period_end = parsed["period_end"] or all_dates[-1]
    period_start = parsed["period_start"] or all_dates[0]

    # followers_total: solo tenemos el SNAPSHOT del día final del export
    followers_total_final = parsed["followers_total_latest"]

    rows = []
    for d in all_dates:
        is_end = (d == period_end)
        daily = parsed["daily"].get(d, {})
        flw = parsed["followers"].get(d, {})

        impressions = daily.get("impressions", 0)
        interactions = daily.get("interactions", 0)
        engagement = (interactions / impressions) if impressions > 0 else None

        fields: dict[str, Any] = {
            FIELDS["snapshot_id"]:   f"{d}_{CLIENT_SLUG}",
            FIELDS["client"]:        [CLIENT_RECORD_ID],
            FIELDS["date"]:          d,
            FIELDS["impressions"]:   impressions,
            FIELDS["interactions"]:  interactions,
            FIELDS["new_followers"]: flw.get("new_followers", 0),
            FIELDS["period_start"]:  period_start,
            FIELDS["period_end"]:    period_end,
            FIELDS["is_period_end"]: is_end,
            FIELDS["source_file"]:   parsed["source_file"],
            FIELDS["fetched_at"]:    fetched_at_iso,
        }
        if engagement is not None:
            fields[FIELDS["engagement_rate"]] = engagement

        # Solo el último día del rango lleva: members_reached, followers_total, posts top, demografía
        if is_end:
            fields[FIELDS["members_reached"]] = parsed["members_reached"]
            if followers_total_final is not None:
                fields[FIELDS["followers_total"]] = followers_total_final
            if parsed["top_by_interactions"]:
                fields[FIELDS["top_posts_by_interactions_json"]] = json.dumps(
                    parsed["top_by_interactions"], ensure_ascii=False, indent=2
                )
            if parsed["top_by_impressions"]:
                fields[FIELDS["top_posts_by_impressions_json"]] = json.dumps(
                    parsed["top_by_impressions"], ensure_ascii=False, indent=2
                )
            for demo_key, demo_data in parsed["demo"].items():
                if demo_data:
                    fields[FIELDS[demo_key]] = json.dumps(demo_data, ensure_ascii=False, indent=2)

        rows.append({"fields": fields})

    return rows


# --- Airtable upsert -------------------------------------------------------

def upsert_batch(rows: list[dict], pat: str, dry_run: bool = False) -> dict:
    """Upsert por snapshot_id en lotes de 10 (límite Airtable API)."""
    if dry_run:
        for r in rows:
            sid = r["fields"][FIELDS["snapshot_id"]]
            print(f"  [DRY] upsert {sid}")
        return {"created": 0, "updated": 0, "errors": 0}

    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_ID}"
    headers = {
        "Authorization": f"Bearer {pat}",
        "Content-Type": "application/json",
    }
    stats = {"created": 0, "updated": 0, "errors": 0}

    for i in range(0, len(rows), 10):
        chunk = rows[i:i + 10]
        body = {
            "performUpsert": {"fieldsToMergeOn": [FIELDS["snapshot_id"]]},
            "records": chunk,
            "typecast": True,
        }
        resp = requests.patch(url, headers=headers, json=body, timeout=30)
        if resp.status_code != 200:
            stats["errors"] += len(chunk)
            print(f"  [ERROR {resp.status_code}] {resp.text[:300]}")
            continue
        data = resp.json()
        stats["created"] += len(data.get("createdRecords", []))
        stats["updated"] += len(data.get("updatedRecords", []))
        time.sleep(0.25)  # rate limit safety

    return stats


# --- Main ------------------------------------------------------------------

def process_file(path: Path, pat: str, dry_run: bool) -> dict:
    print(f"\n📄 {path.name}")
    parsed = parse_xlsx(path)
    print(f"   Periodo: {parsed['period_start']} → {parsed['period_end']}")
    print(f"   Días con datos: {len(set(list(parsed['daily'].keys()) + list(parsed['followers'].keys())))}")
    print(f"   Top posts (interacciones): {len(parsed['top_by_interactions'])}")
    print(f"   Top posts (impresiones): {len(parsed['top_by_impressions'])}")
    print(f"   Followers total snapshot: {parsed['followers_total_latest']}")
    print(f"   Demografía categorías con datos: {sum(1 for v in parsed['demo'].values() if v)}")

    fetched_at = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    rows = build_rows(parsed, fetched_at)
    if not rows:
        print("   ⚠️  Sin filas que insertar (XLSX vacío o no parseable)")
        return {"created": 0, "updated": 0, "errors": 0, "rows": 0}

    print(f"   → upsert {len(rows)} filas...")
    stats = upsert_batch(rows, pat, dry_run)
    stats["rows"] = len(rows)
    print(f"   ✅ creadas={stats['created']} actualizadas={stats['updated']} errores={stats['errors']}")
    return stats


def main():
    p = argparse.ArgumentParser()
    p.add_argument("path", nargs="?", help="XLSX concreto (si se omite procesa toda la inbox)")
    p.add_argument("--dry-run", action="store_true", help="Solo imprime qué haría, no escribe en Airtable")
    p.add_argument("--keep", action="store_true", help="No mueve los XLSX a processed/ tras procesarlos")
    p.add_argument("--export-json", help="Vuelca el JSON de rows a un archivo y sale (no requiere PAT, no escribe Airtable)")
    args = p.parse_args()

    # Modo export: parsea y vuelca JSON, sin tocar Airtable
    if args.export_json:
        if args.path:
            files = [Path(args.path)]
        else:
            files = sorted(INBOX.glob("*.xlsx"))
        if not files:
            print(f"No hay XLSX en {INBOX}")
            sys.exit(1)
        all_rows = []
        fetched_at = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        for f in files:
            print(f"📄 Parseando {f.name}")
            parsed = parse_xlsx(f)
            rows = build_rows(parsed, fetched_at)
            print(f"   → {len(rows)} filas")
            all_rows.append({"source_file": f.name, "rows": rows, "summary": {
                "period_start": parsed["period_start"],
                "period_end": parsed["period_end"],
                "followers_total": parsed["followers_total_latest"],
                "members_reached": parsed["members_reached"],
                "top_by_interactions_count": len(parsed["top_by_interactions"]),
                "top_by_impressions_count": len(parsed["top_by_impressions"]),
            }})
        Path(args.export_json).write_text(json.dumps(all_rows, ensure_ascii=False, indent=2))
        print(f"\n✅ JSON exportado a {args.export_json} ({sum(len(f['rows']) for f in all_rows)} filas total)")
        return

    pat = load_pat() if not args.dry_run else "DRY-RUN"

    if args.path:
        files = [Path(args.path)]
    else:
        if not INBOX.exists():
            print(f"Error: la carpeta inbox no existe: {INBOX}")
            sys.exit(1)
        files = sorted(INBOX.glob("*.xlsx"))

    if not files:
        print(f"No hay XLSX para procesar en {INBOX}")
        return

    print(f"Procesando {len(files)} archivo(s){' [DRY RUN]' if args.dry_run else ''}...")
    PROCESSED.mkdir(parents=True, exist_ok=True)

    total = {"created": 0, "updated": 0, "errors": 0, "rows": 0}
    for f in files:
        try:
            stats = process_file(f, pat, args.dry_run)
            for k in total:
                total[k] += stats.get(k, 0)
            if not args.dry_run and not args.keep and stats["errors"] == 0:
                ts = datetime.now().strftime("%Y%m%dT%H%M%S")
                dest = PROCESSED / f"{ts}__{f.name}"
                shutil.move(str(f), str(dest))
                print(f"   📦 movido a processed/{dest.name}")
        except Exception as e:
            import traceback
            print(f"   ❌ Error procesando {f.name}: {e}")
            traceback.print_exc()
            total["errors"] += 1

    print("\n" + "=" * 60)
    print(f"RESUMEN · archivos={len(files)}  filas={total['rows']}  "
          f"creadas={total['created']}  actualizadas={total['updated']}  errores={total['errors']}")


if __name__ == "__main__":
    main()
