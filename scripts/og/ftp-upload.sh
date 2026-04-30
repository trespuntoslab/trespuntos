#!/bin/bash
# Upload all OG images + 101 HTMLs to Nominalia via FTP
set -e

ROOT="/Users/jordi/Library/CloudStorage/Dropbox/backupok/TRESPUNTOS-LAB/Trespuntos-web-cloude"
FTP_HOST="ftp.trespuntoscomunicacion.es"
FTP_USER="claude%40trespuntoscomunicacion.es"
FTP_PASS="Y20pC%267L%214z%28%24%256g"
BASE="ftp://${FTP_USER}:${FTP_PASS}@${FTP_HOST}"

LOG=/Users/jordi/Library/CloudStorage/Dropbox/backupok/TRESPUNTOS-LAB/Trespuntos-web-cloude/scripts/og/ftp.log
> "$LOG"

upload() {
  local local_path="$1"
  local remote_path="$2"
  local code=$(curl -s -k --ftp-pasv --ftp-create-dirs -T "$local_path" "$BASE${remote_path}" -w "%{http_code}" -o /dev/null)
  if [ "$code" = "226" ]; then
    echo "[OK ] $remote_path" | tee -a "$LOG"
  else
    echo "[ERR $code] $remote_path" | tee -a "$LOG"
  fi
}

echo "═══ STEP 1: Create /img/og/ and upload 101 OG images ═══"
# Create directory by uploading first file (curl --ftp-create-dirs handles it)
COUNT=0
for f in "$ROOT/img/og/"*.png; do
  COUNT=$((COUNT+1))
  name=$(basename "$f")
  upload "$f" "/img/og/$name"
done
echo "Uploaded $COUNT OG images"
echo ""

echo "═══ STEP 2: Replace og-default.jpg ═══"
upload "$ROOT/img/blog/og-default.jpg" "/img/blog/og-default.jpg"
echo ""

echo "═══ STEP 3: Upload 101 HTMLs ═══"
# Read manifest to get rel_paths
python3 -c "
import json
m = json.load(open('/Users/jordi/Library/CloudStorage/Dropbox/backupok/TRESPUNTOS-LAB/Trespuntos-web-cloude/scripts/og/manifest.json'))
for e in m:
    print(e['rel_path'])
" | while read rel; do
  upload "$ROOT/$rel" "/$rel"
done

echo ""
echo "═══ DONE ═══"
echo "Log: $LOG"
echo "OK count: $(grep -c '\[OK ' "$LOG")"
echo "ERR count: $(grep -c '\[ERR' "$LOG")"
