#!/bin/sh

set -eu

case "${DATABASE_URL:-}" in
  file:/*)
    DB_PATH="${DATABASE_URL#file:}"
    ;;
  *)
    echo "DATABASE_URL must be an absolute SQLite path such as file:/data/custom.db"
    exit 1
    ;;
esac

DB_DIRECTORY="$(dirname "$DB_PATH")"
mkdir -p "$DB_DIRECTORY"

if [ ! -f "$DB_PATH" ]; then
  echo "Initializing SQLite database at $DB_PATH"

  if [ ! -f /app/bootstrap/custom.db ]; then
    echo "Bootstrap database not found at /app/bootstrap/custom.db"
    exit 1
  fi

  cp /app/bootstrap/custom.db "$DB_PATH"
fi

if [ ! -r "$DB_PATH" ]; then
  echo "SQLite database is not readable: $DB_PATH"
  exit 1
fi

if [ ! -w "$DB_PATH" ]; then
  echo "SQLite database is not writable: $DB_PATH"
  exit 1
fi

echo "SQLite database ready at $DB_PATH"
exec "$@"
