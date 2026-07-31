#!/usr/bin/env bash
# Microsoft Clarity — Data Export API (project-live-insights)
#
# Uso:
#   bash scripts/clarity/fetch.sh                      # 3 días, global
#   bash scripts/clarity/fetch.sh 3 URL                # 3 días, desglose por URL
#   bash scripts/clarity/fetch.sh 1 Device Browser     # 1 día, 2 dimensiones
#
# Dimensiones válidas: Browser, Device, Country, OS, Source, Medium, Campaign,
#                      Channel, URL, referrerUrl  (máx 3 por llamada)
#
# ⚠️  LÍMITE DURO: 10 requests/día por proyecto. No hacer polling.
# ⚠️  Rango máximo: 3 días (la API no da histórico; para tendencia hay que
#     guardar snapshots diarios, p.ej. en Airtable/Supabase).
#
# Token: ~/.config/tres-puntos/clarity.env (chmod 600)

set -euo pipefail
source ~/.config/tres-puntos/clarity.env

DAYS="${1:-3}"
Q="numOfDays=${DAYS}"
[ "${2:-}" ] && Q="${Q}&dimension1=$2"
[ "${3:-}" ] && Q="${Q}&dimension2=$3"
[ "${4:-}" ] && Q="${Q}&dimension3=$4"

curl -s -H "Authorization: Bearer ${CLARITY_API_TOKEN}" \
  "https://www.clarity.ms/export-data/api/v1/project-live-insights?${Q}" \
  | python3 -m json.tool
