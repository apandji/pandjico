#!/usr/bin/env bash
# Serve this repo over HTTP and expose it with a temporary HTTPS URL (TryCloudflare).
# Usage: ./scripts/dev-tunnel.sh
# Optional: PORT=9000 ./scripts/dev-tunnel.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-8787}"
HOST="${HOST:-127.0.0.1}"

cleanup() {
	if [[ -n "${HTTP_PID:-}" ]] && kill -0 "$HTTP_PID" 2>/dev/null; then
		kill "$HTTP_PID" 2>/dev/null || true
	fi
}
trap cleanup EXIT INT TERM

echo "Serving ${ROOT} at http://${HOST}:${PORT}/"
python3 -m http.server "$PORT" --bind "$HOST" --directory "$ROOT" &
HTTP_PID=$!
sleep 0.25
if ! kill -0 "$HTTP_PID" 2>/dev/null; then
	echo "Failed to start python http.server" >&2
	exit 1
fi

if ! command -v cloudflared >/dev/null 2>&1; then
	echo "cloudflared not found. Install with: brew install cloudflare/cloudflare/cloudflared" >&2
	exit 1
fi

echo "Starting tunnel (open the trycloudflare URL on your iPhone)…"
cloudflared tunnel --url "http://${HOST}:${PORT}"
