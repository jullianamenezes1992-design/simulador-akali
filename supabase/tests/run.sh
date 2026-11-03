#!/usr/bin/env bash
# Sobe um PostgreSQL temporário, aplica stub do Supabase + migrations e roda os testes de RLS.
set -euo pipefail
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
DATA="$(mktemp -d)"
PORT=55432
cleanup() { "$PGBIN/pg_ctl" -D "$DATA" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$DATA"; }
trap cleanup EXIT

if [ "$(id -u)" = "0" ]; then
  chown -R postgres "$DATA"
  RUN="runuser -u postgres --"
else
  RUN=""
fi
$RUN "$PGBIN/initdb" -D "$DATA" -U postgres -A trust >/dev/null
$RUN "$PGBIN/pg_ctl" -D "$DATA" -o "-p $PORT -k /tmp" -l "$DATA/log" start -w >/dev/null

PSQL=(psql -h /tmp -p $PORT -U postgres -d postgres -v ON_ERROR_STOP=1 -q)
"${PSQL[@]}" -f "$DIR/supabase/tests/supabase_stub.sql"
for f in "$DIR"/supabase/migrations/*.sql; do
  echo "aplicando $(basename "$f")"
  "${PSQL[@]}" -f "$f"
done
"${PSQL[@]}" -f "$DIR/supabase/tests/rls_test.sql"
