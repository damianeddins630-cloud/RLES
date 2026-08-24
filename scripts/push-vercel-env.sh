#!/usr/bin/env bash
# Push all variables from .env to Vercel Production.
# Prereqs: npm i -g vercel && vercel login && vercel link
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v vercel &>/dev/null; then
  echo "Install Vercel CLI: npm i -g vercel"
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Missing .env file"
  exit 1
fi

echo "Pushing env vars to Vercel Production..."
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// }" ]] && continue
  name="${line%%=*}"
  value="${line#*=}"
  value="${value%\"}"
  value="${value#\"}"
  echo "  → $name"
  printf '%s' "$value" | vercel env add "$name" production --force 2>/dev/null || \
    printf '%s' "$value" | vercel env add "$name" production
done < .env

echo "Done. Redeploy: vercel --prod"
