# Budgie Backend — Handover

## Repo Location
`~/projects/budgie/`

## Current State — Complete Backend Implementation

### File Structure
```
backend/
├── pyproject.toml          # deps + ruff config + pytest settings
├── .pre-commit-config.yaml # ruff formatting + linting hooks
├── manage.py               # Django management entry point
├── .venv/                  # Python venv with all deps installed
├── budgie/
│   ├── __init__.py
│   ├── asgi.py             # ASGI app for uvicorn
│   ├── settings.py         # Django settings (APPEND_SLASH=False, BUCKET_DEFAULTS, USER_SETTINGS_DEFAULTS)
│   └── urls.py             # Root URL conf → api.urls
├── api/
│   ├── __init__.py
│   ├── _shared.py          # Cents/dollars conversion helpers
│   ├── auth.py             # Django SessionAuth wrapper + signal disconnect
│   ├── models.py           # 7 Django models (UserProfile, Bucket, BucketShare, Transaction, BucketLog, MonthlySnapshot, UserSettings)
│   ├── schemas.py          # 16 Pydantic schemas — OpenAPI source of truth
│   ├── urls.py             # NinjaAPI with all routers mounted + exception handlers
│   ├── views/
│   │   ├── __init__.py
│   │   ├── auth.py         # POST /api/auth/login (username/password) + logout
│   │   ├── buckets.py      # CRUD + reset + sharing + audit logs + ownership checks
│   │   ├── transactions.py # CRUD + soft delete + undo (atomic spent updates)
│   │   ├── insights.py     # GET /summary, GET /monthly trend
│   │   ├── settings.py     # GET/PUT user settings (auto-create defaults)
│   │   └── users.py        # Admin-only user management (no side-effect read)
│   ├── migrations/
│   │   └── 0001_initial.py # All 7 tables + relationships
│   └── tests/
│       └── test_api.py     # 65 tests — all passing
└── db.sqlite4              # SQLite database (auto-created on migrate)
```

### What's Complete
- **Dependencies** — django 6.0.6, django-ninja 1.6.2, uvicorn, pytest, ruff
- **Auth** — Django session auth via `SessionAuth`, username/password login, login count tracking, signal disconnect to prevent last_login error
- **Buckets** — full CRUD, reset (creates MonthlySnapshot), sharing (share/list/remove shares), audit logs (BucketLog), ownership checks on every endpoint
- **Transactions** — atomic create (updates bucket spent via F()), update (adjusts bucket spent), soft delete (reverses bucket spent), undo (restores bucket spent)
- **Insights** — aggregate monthly summary across all buckets, per-bucket monthly trend (from MonthlySnapshot)
- **Settings** — auto-creates UserSettings on first GET, PUT updates
- **Users** — admin-only list/create/delete with role-based auth (403 for non-admins), no side-effect reads
- **OpenAPI** — auto-generated at `/api/openapi.json`, Swagger UI docs at `/api/docs`
- **Tests** — 65 tests, all passing (auth, buckets happy+negative, transactions happy+negative, settings, user management, insights)
- **Pre-commit** — ruff format + lint with auto-fix

### Key Conventions
- **Cents/dollars boundary**: models store `int` (cents), schemas return `float` (dollars)
- **Strict typing**: explicit `str | None` unions, no `from __future__ import annotations` (Python 3.14 native syntax)
- **Ruff config**: rule groups E, W, F, I, C, T20, BLE, RUF, py314 target
- **Auth**: Django session auth via `SessionAuth`, no JWT
- **Status objects**: Uses `from ninja import Status` instead of deprecated tuple returns
- **FK naming**: Field names are logical (`owner`, `bucket`, `user`) — Django ORM appends `_id` to the DB column internally

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | — | Login with username/password → session cookie |
| POST | /api/auth/logout | — | Logout (clears session) |
| GET | /api/buckets/ | @auth | List buckets (own + shared) |
| POST | /api/buckets/ | @auth | Create bucket |
| GET | /api/buckets/{id} | @auth | Get bucket |
| PUT | /api/buckets/{id} | @auth | Update bucket |
| DELETE | /api/buckets/{id} | @auth | Delete bucket |
| POST | /api/buckets/{id}/reset | @auth | Reset spent → snapshot |
| POST | /api/buckets/{id}/share | @auth | Share bucket |
| GET | /api/buckets/{id}/shares | @auth | List shares |
| DELETE | /api/buckets/{id}/share/{uid} | @auth | Remove share |
| GET | /api/buckets/{id}/logs | @auth | Audit logs |
| GET | /api/buckets/{id}/transactions | @auth | List transactions |
| POST | /api/buckets/{id}/transactions | @auth | Create transaction |
| PUT | /api/transactions/{id} | @auth | Update transaction |
| DELETE | /api/transactions/{id} | @auth | Soft delete |
| POST | /api/transactions/{id}/undo | @auth | Undo delete |
| GET | /api/insights/summary | @auth | Monthly summary |
| GET | /api/insights/monthly | @auth | Per-bucket trend |
| GET | /api/settings/ | @auth | Get settings |
| PUT | /api/settings/ | @auth | Update settings |
| GET | /api/users/ | @auth (admin) | List users |
| POST | /api/users/ | @auth (admin) | Create user |
| DELETE | /api/users/{id} | @auth (admin) | Delete user |

### Running
```bash
cd ~/projects/budgie/backend
DJANGO_SETTINGS_MODULE=budgie.settings .venv/bin/python manage.py migrate
DJANGO_SETTINGS_MODULE=budgie.settings .venv/bin/uvicorn budgie.asgi:application --reload --port 8000
```

### Tests
```bash
cd ~/projects/budgie/backend
DJANGO_SETTINGS_MODULE=budgie.settings .venv/bin/python -m pytest tests/ -v   # 65 tests, ~150s
```

### Next Steps
1. Frontend scaffold (React + Mantine + openapi-fetch codegen from `/api/openapi.json`)
2. Wire up to backend
