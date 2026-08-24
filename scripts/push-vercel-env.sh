#!/usr/bin/env bash
# Push all variables from .env to Vercel Production.
# Prereqs: VERCEL_ACCESS_TOKEN in environment OR run vercel login locally
set -euo pipefail
cd "$(dirname "$0")/.."

TOKEN="${VERCEL_ACCESS_TOKEN:-${VERCEL_TOKEN:-}}"
PROJECT="${VERCEL_PROJECT:-leaguemastersystem}"
SCOPE_FLAG=()
if [[ -n "${VERCEL_ORG_ID:-}" ]]; then
  SCOPE_FLAG=(--scope "$VERCEL_ORG_ID")
fi

if [[ ! -f .env ]]; then
  echo "Missing .env file"
  exit 1
fi

if ! command -v vercel &>/dev/null; then
  echo "Install Vercel CLI: npm i -g vercel"
  exit 1
fi

if [[ -z "$TOKEN" ]]; then
  echo "Set VERCEL_ACCESS_TOKEN or run vercel login"
  exit 1
fi

echo "Pushing env vars to Vercel Production (project: $PROJECT)..."
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// }" ]] && continue
  name="${line%%=*}"
  value="${line#*=}"
  value="${value%\"}"
  value="${value#\"}"
  echo "  → $name"
  printf '%s' "$value" | vercel env add "$name" production \
    --token "$TOKEN" \
    --project "$PROJECT" \
    "${SCOPE_FLAG[@]}" \
    --force 2>/dev/null || \
    printf '%s' "$value" | vercel env add "$name" production \
      --token "$TOKEN" \
      --project "$PROJECT" \
      "${SCOPE_FLAG[@]}"
done < .env

echo "Done. Redeploy with: vercel --prod --token \$VERCEL_ACCESS_TOKEN --project $PROJECT"
