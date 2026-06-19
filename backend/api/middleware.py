"""Middleware to set CSRF cookie for Django Ninja ASGI responses.

Django's CsrfViewMiddleware doesn't set the csrftoken cookie in ASGI mode
for Ninja views. This middleware ensures the cookie is set on every response
using Django's csrf.get_token() which triggers cookie generation.
"""

from django.middleware.csrf import get_token, rotate_token


class CsrfCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # Ensure CSRF cookie is set on every response
        get_token(request)
        return response
