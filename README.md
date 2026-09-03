# Procurement MVP Copilot Workshop

Hands-on 5-hour workshop to build a web-based procurement MVP and practice Copilot across SDLC.

## Workshop Scope
- Baseline provided in repo: database schema + Home/Dashboard + PR module (list/create/detail + PR APIs)
- Participant implementation backlog: PO module only (list/create/detail + PO APIs + PO validations)
- GR module: out of implementation scope during workshop (further exploration)
- Optional extension: bookmark feature (`PR`, `PO`, `GR`) as post-backlog exercise

Canonical workshop document: [docs/plan.md](docs/plan.md)

## Tech Stack
- Backend: Fastify + REST API (JavaScript)
- Database: PostgreSQL in Docker
- Frontend: Vue 3 + Vite (JavaScript)
- Testing: Jest (unit) + Playwright (e2e)

## Repository Hygiene
- Generated test artifacts are intentionally ignored and should not be committed.
- Ignored outputs include `playwright-report/`, `test-results/`, `backend/coverage/`, and `frontend/coverage/`.
- If you need to share test evidence in the workshop, share screenshots or logs outside the repository commit history.

## Quick Start

### 1) Start PostgreSQL
```bash
docker compose up -d db
```

## DB Bootstrap for Participants

The PostgreSQL container now initializes the workshop baseline automatically:
- Runs schema migration: `db/migrations/001_init_procurement_mvp.sql`
- Runs the users/bookmarks migration: `db/migrations/002_add_users_and_bookmarks.sql`
- Runs sample seed data: `db/seeds/002_seed_procurement_mvp.sql`
- Runs demo user seed data: `db/seeds/003_seed_users.sql`
- Uses Docker init script: `docker/postgres/init/00-init-mvp-db.sh`

Cross-platform notes (Windows/macOS/Linux):
- Init script and SQL files are normalized to LF via `.gitattributes`.
- The init script is committed as executable so PostgreSQL can run it from `/docker-entrypoint-initdb.d`.
- If bootstrap still fails on a local machine, re-apply file mode and reset DB:

```bash
chmod +x docker/postgres/init/00-init-mvp-db.sh
docker compose down -v
docker compose up -d db
```

Use this when starting fresh:

```bash
docker compose down -v
docker compose up -d db
```

Verify database is ready:

```bash
docker compose exec -T db psql -U workshop -d procurement_mvp -c "SELECT pr_number, status FROM purchase_requisitions ORDER BY pr_number;"
```

### Troubleshooting: DB init failed

Symptoms:
- `relation "purchase_requisitions" does not exist`
- `bad interpreter: Permission denied` from `00-init-mvp-db.sh`

Quick fix:

```bash
chmod +x docker/postgres/init/00-init-mvp-db.sh
docker compose down -v
docker compose up -d db
docker compose logs --no-color db | tail -n 120
```

Expected in logs:
- `[initdb] Running baseline migration...`
- `[initdb] Seeding sample data...`
- `[initdb] Database initialization complete.`

### 2) Backend (to be scaffolded in workshop)
```bash
cd backend
npm install
npm run dev
```

### 3) Frontend (to be scaffolded in workshop)
```bash
cd frontend
npm install
npm run dev
```

## Validation Rules
1. PO allocation qty must not exceed PR line remaining qty.
2. PO status transition rules must be enforced.
3. GR validations are optional exploration after workshop backlog.

## Bookmark Feature
The bookmark extension is implemented on top of the baseline:
- Minimal demo auth: `POST /api/auth/login` with a `username` (try `sari` or `budi` from the seed data) returns a bearer token used for subsequent bookmark requests. There is no password — this is intentionally simple for workshop clarity.
- Bookmark APIs (all require an `Authorization` header carrying the login token as a bearer-style credential):
  - `GET /api/bookmarks` — list the current user's bookmarks across PR/PO/GR
  - `POST /api/bookmarks` — create a bookmark `{ entityType: 'PR'|'PO'|'GR', entityId }`
  - `DELETE /api/bookmarks/:id` — remove one of the current user's bookmarks
- Bookmarks are unique per `(user, entityType, entityId)` and enforced both by a DB constraint (`db/migrations/002_add_users_and_bookmarks.sql`) and the API (409 on duplicate).
- The frontend `Bookmarks` page (`/bookmarks`) lists all bookmarked items and links to their detail pages where available. Bookmark toggle buttons are available on the PR, PO, and GR list pages.

## Suggested Workshop Output
- Running baseline PR module + participant-completed PO module on Docker PostgreSQL
- PO happy path demo: create PO from approved PR open lines, submit, and view detail
- Focused Jest tests for PO business validations (over-allocation + status transition)
- Playwright coverage focused on PO flow integrated with baseline PR data
