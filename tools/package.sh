#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

npm run build

rm -rf dist
mkdir -p dist

(cd BP && zip -qr ../dist/angel_devil_BP.mcpack .)
(cd RP && zip -qr ../dist/angel_devil_RP.mcpack .)
(cd dist && zip -q angel_devil.mcaddon angel_devil_BP.mcpack angel_devil_RP.mcpack)

echo "Built dist/angel_devil.mcaddon"
