"""Authentication — Django session auth with built-in User."""

from django.contrib.auth.signals import user_logged_in
from ninja.security import SessionAuth

try:
    from django.contrib.auth.models import update_last_login

    user_logged_in.disconnect(
        update_last_login, dispatch_uid="django.contrib.auth.models.update_last_login"
    )
except ImportError, LookupError:
    pass

auth = SessionAuth()  # CSRF validated via cookie+header
# Cookie is set by CsrfCookieMiddleware
