# Budgie Backend — Handover

## Repo Location
`~/projects/budgie/`

## Current State — Backend Complete

### File Structure
```
budgie/
├── backend/
│   ├── pyproject.toml      # deps + ruff config
│   ├── manage.py           # Django management entry point
│   ├── db.sqlite3          # SQLite DB (migrations applied)
│   ├── budgie/
│   │   ├── __init__.py
│   │   ├── settings.py     # Django settings (session auth)
│   │   └── urls.py         # Root URL conf
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py         # SessionAuth + signal disconnect
│   │   ├── models.py       # 7 Django models (UserProfile, Bucket, BucketShare, Transaction, BucketLog, MonthlySnapshot, UserSettings)
│   │   ├── schemas.py      # Pydantic schemas for all endpoints
│   │   ├── views/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # Login/logout (username+password, session)
│   │   │   ├── buckets.py      # CRUD + reset + sharing
│   │   │   ├── transactions.py # CRUD + soft delete + undo
│   │   │   ├── insights.py     # Summary + monthly trend
│   │   │   ├── settings.py     # GET/PUT user settings
│   │   │   └── users.py        # Admin user management
│   │   └── urls.py         # NinjaAPI router mounting all views
│   └── tests/
│       └── test_api.py     # 21 tests, all passing
```

### Auth System
- **Session-based** — Django `django.contrib.auth.models.User` with `django.contrib.auth.authenticate()` / `login()`
- No JWT, no PIN — traditional username + password
- `POST /api/auth/login` returns session cookie + user info
- `POST /api/auth/logout` destroys session
- Ninja `SessionAuth` decorator protects all endpoints (returns 401 if no session)

### What's Done
- **Models** — 7 tables using Django's built-in `auth.User` (ForeignKeys via `settings.AUTH_USER_MODEL`). `UserProfile` stores extra login_count.
- **All API endpoints** — auth (login/logout), buckets (CRUD + reset + share + logs), transactions (CRUD + soft delete + undo), insights (summary + monthly trend), settings (GET/PUT), users (admin list/create/delete)
- **21 tests** — all passing with session-based auth
- **OpenAPI spec** — auto-generated at `/api/openapi.json`
- **Dependencies** — django, django-ninja, python-dotenv, uvicorn
- **Strict typing** — `from __future__ import annotations` on all files, explicit union syntax

### Key Conventions
- **Cents/dollars boundary**: models store `int` (cents), schemas return `float` (dollars), frontend always gets/sends floats
- **Strict typing**: `from __future__ import annotations` everywhere, explicit union syntax, no `Optional`
- **Ruff config**: all rules enabled, py312 target
- **Admin check**: `request.user.is_staff` (Django built-in)

### Run
```bash
cd ~/projects/budgie/backend
DJANGO_SETTINGS_MODULE=budgie.settings .venv/bin/uvicorn budgie.asgi:application --port 8002
# Tests:
DJANGO_SETTINGS_MODULE=budgie.settings .venv/bin/python -m pytest tests/ -v
```

### GitHub
- Repo: github.com/marzukia/budgie
- PR #1 open on feat/backend → main
