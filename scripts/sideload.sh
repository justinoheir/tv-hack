#!/usr/bin/env bash
# Build, sign and install Ether Launcher on a Samsung TV in Developer Mode.
# Usage: TV_IP=192.168.1.50 CERT_PROFILE=ether ./scripts/sideload.sh
# Requires the Tizen Studio CLI (`tizen`, `sdb`) on PATH. See docs/02-developer-mode-sideloading.md.
set -euo pipefail

: "${TV_IP:?Set TV_IP to the TV LAN IP address}"
: "${CERT_PROFILE:?Set CERT_PROFILE to your Samsung certificate profile name}"
APP_DIR="$(cd "$(dirname "$0")/../apps/ether-launcher" && pwd)"
APP_ID="EthrLnch01.EtherLauncher"

for bin in tizen sdb; do
  command -v "$bin" >/dev/null || { echo "error: '$bin' not on PATH (install Tizen Studio CLI)" >&2; exit 1; }
done

echo "→ tests"
(cd "$APP_DIR" && npm test --silent)

echo "→ connect $TV_IP"
sdb connect "$TV_IP:26101"
SERIAL="$TV_IP:26101"
sdb -s "$SERIAL" get-state | grep -q device || { echo "error: TV not reachable. Is Developer Mode on with this laptop's IP?" >&2; exit 1; }

echo "→ package (signed with profile '$CERT_PROFILE')"
BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "$BUILD_DIR"' EXIT
# Ship only runtime files: no tests, docs or package.json
cp -r "$APP_DIR/config.xml" "$APP_DIR/index.html" "$APP_DIR/css" "$APP_DIR/src" "$BUILD_DIR/"
tizen package -t wgt -s "$CERT_PROFILE" -- "$BUILD_DIR"
WGT="$(ls "$BUILD_DIR"/*.wgt)"

echo "→ install"
tizen install -s "$SERIAL" -n "$(basename "$WGT")" -- "$BUILD_DIR"

echo "→ launch"
tizen run -s "$SERIAL" -p "$APP_ID"
echo "done ✓  (Ether Launcher is now in Apps; long-press to add it to the home bar)"
