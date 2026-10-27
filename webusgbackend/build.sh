#!/usr/bin/env bash
set -e

echo "=== Step 1: Installing frontend dependencies ==="
cd "$(dirname "$0")/../usgweb-main"
npm install

echo "=== Step 2: Building frontend (React/Vite) ==="
npm run build

echo "=== Step 3: Copying frontend dist into backend/public/dist ==="
cd "$(dirname "$0")"
rm -rf public/dist
mkdir -p public/dist
cp -r ../usgweb-main/dist/. public/dist/

echo "=== Step 4: Installing backend dependencies ==="
npm install

echo "=== Build complete! ==="
ls -lh public/dist/
