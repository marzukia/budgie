"""Middleware to set CSRF cookie for Django Ninja ASGI responses.

In ASGI mode, Django's response object uses http.cookies.SimpleCookie which
has a different API. We use response.cookies[key] = value dict-style assignment.
"""

from django.conf import settings
from django.middleware.csrf import get_token


class CsrfCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # Call get_token to mark CSRF cookie as needed
        token = get_token(request)
        # Set cookie using dict-style assignment (works with SimpleCookie in ASGI)
        name = settings.CSRF_COOKIE_NAME or "csrftoken"
        response.cookies[name] = token
        response.cookies[name]["path"] = "/"
        response.cookies[name]["samesite"] = "Lax"
        response.cookies[name]["httponly"] = False
        response.cookies[name]["max-age"] = 60 * 60 * 24 * 7
        if settings.CSRF_COOKIE_SECURE:
            response.cookies[name]["secure"] = True
        return response
