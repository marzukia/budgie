"""Django settings for budgie."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("BUDGIE_SECRET_KEY") or "dev-secret-key-change-in-production"
DEBUG = os.getenv("BUDGIE_DEBUG", "True") == "True"

_raw_hosts = os.getenv("BUDGIE_ALLOWED_HOSTS", "*")
ALLOWED_HOSTS = [h.strip() for h in _raw_hosts.split(",") if h.strip()]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "django.contrib.sessions",
    "django.contrib.staticfiles",
    "api",
]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {},
    },
]

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "static"

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "api.middleware.CsrfCookieMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
]

ROOT_URLCONF = "budgie.urls"

# Database — Postgres or SQLite
_db_engine = os.getenv("BUDGIE_DB_ENGINE", "django.db.backends.sqlite3")
_db_name = os.getenv("BUDGIE_DB_NAME")
_db_user = os.getenv("BUDGIE_DB_USER")
_db_password = os.getenv("BUDGIE_DB_PASSWORD")
_db_host = os.getenv("BUDGIE_DB_HOST")
_db_port = os.getenv("BUDGIE_DB_PORT")

if _db_engine == "django.db.backends.postgresql":
    DATABASES = {
        "default": {
            "ENGINE": _db_engine,
            "NAME": _db_name or "budgie_dev",
            "USER": _db_user or "budgie",
            "PASSWORD": _db_password or "budgie_password",
            "HOST": _db_host or "localhost",
            "PORT": _db_port or "5432",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": _db_engine,
            "NAME": _db_name or str(BASE_DIR / "db.sqlite3"),
        }
    }

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
LANGUAGE_CODE = "en-us"
USE_TZ = True
APPEND_SLASH = False

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"

# Security hardening — enable secure cookies and headers when behind TLS
_secure = os.getenv("BUDGIE_SECURE", "False") == "True"
CSRF_COOKIE_SECURE = _secure
SESSION_COOKIE_SECURE = _secure
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https") if _secure else None
SECURE_HSTS_SECONDS = 0  # set to 31536000 once TLS is proven
SECURE_HSTS_INCLUDE_SUBDOMAINS = _secure
SECURE_CONTENT_TYPE_NOSNIFF = _secure
X_FRAME_OPTIONS = "DENY"

# CSRF trusted origins for development — frontend proxy on localhost:5173
if DEBUG:
    CSRF_TRUSTED_ORIGINS = ["http://localhost:5173"]

# Business defaults — change these per deployment
BUCKET_DEFAULTS = {
    "currency": "AUD",
    "color": "#3B82F6",
    "icon": "wallet",
    "distribute_to_period": "monthly",
}

USER_SETTINGS_DEFAULTS = {
    "base_currency": "AUD",
    "theme": "light",
}
