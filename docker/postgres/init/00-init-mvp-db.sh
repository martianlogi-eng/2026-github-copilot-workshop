#!/bin/sh
set -eu

DB_ROOT="${WORKSHOP_DB_ROOT:-/workspace/db}"
MIGRATION_FILE="$DB_ROOT/migrations/001_init_procurement_mvp.sql"
BOOKMARKS_MIGRATION_FILE="$DB_ROOT/migrations/002_add_users_and_bookmarks.sql"
SEED_FILE="$DB_ROOT/seeds/002_seed_procurement_mvp.sql"
USERS_SEED_FILE="$DB_ROOT/seeds/003_seed_users.sql"

for f in "$MIGRATION_FILE" "$BOOKMARKS_MIGRATION_FILE" "$SEED_FILE" "$USERS_SEED_FILE"; do
	if [ ! -r "$f" ]; then
		echo "[initdb] ERROR: required SQL file not found: $f" >&2
		exit 1
	fi
done

echo "[initdb] Running baseline migration..."
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$MIGRATION_FILE"

echo "[initdb] Running users/bookmarks migration..."
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$BOOKMARKS_MIGRATION_FILE"

echo "[initdb] Seeding sample data..."
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$SEED_FILE"

echo "[initdb] Seeding demo users..."
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$USERS_SEED_FILE"

echo "[initdb] Database initialization complete."
