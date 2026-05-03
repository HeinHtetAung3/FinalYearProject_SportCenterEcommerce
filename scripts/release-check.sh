#!/usr/bin/env bash
set -euo pipefail

echo "[release-check] backend tests"
cd .backend
mvn -q test
cd ..

echo "[release-check] frontend build"
cd .frontend
npm install
npm run build
cd ..

echo "[release-check] docker compose validation"
docker compose config >/dev/null

echo "[release-check] done"
