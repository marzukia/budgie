"""Middleware to set CSRF cookie for Django Ninja ASGI responses.

Django's CsrfViewMiddleware.process_response() checks request.META for
CSRF_COOKIE_USED to decide whether to set the cookie. In ASGI mode, Ninja
views don't trigger this flag. We call get_token() which marks it as used,
then manually set the cookie on the response.
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
        # Manually set the csrftoken cookie on the response
        response.cookies.set(
            settings.CSRF_COOKIE_NAME or "csrftoken",
            token,
            max_age=60 * 60 * 24 * 7,  # 7 days
            httponly=False,
            secure=settings.CSRF_COOKIE_SECURE or False,
            samesite="Lax",
        )
        return response
