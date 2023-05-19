from channels.auth import AuthMiddlewareStack  # type: ignore
from django.contrib.auth.models import AnonymousUser
from knox.auth import TokenAuthentication  # type: ignore
from channels.sessions import CookieMiddleware  # type: ignore
from rest_framework.exceptions import AuthenticationFailed
import logging

logger = logging.getLogger(__name__)


class TokenAuthMiddleware:
    """
    Token authorization middleware for Django Channels 2
    """

    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        cookies = dict(scope["cookies"])
        if "token" in cookies:
            try:
                tokenString = cookies["token"]
                knoxAuth = TokenAuthentication()
                user, auth_token = knoxAuth.authenticate_credentials(
                    tokenString.encode("utf-8")
                )
                scope["user"] = user
            except AuthenticationFailed:
                logger.error("authentication failed!")
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()
        return self.inner(scope)


def TokenAuthMiddlewareStack(inner):
    return CookieMiddleware(TokenAuthMiddleware(AuthMiddlewareStack(inner)))
