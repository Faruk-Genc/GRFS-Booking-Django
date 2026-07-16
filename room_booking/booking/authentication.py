from rest_framework_simplejwt.authentication import JWTAuthentication
from django.middleware.csrf import CsrfViewMiddleware
from rest_framework.exceptions import PermissionDenied


class CookieJWTAuthentication(JWTAuthentication):
    """Authenticate with an HttpOnly access-token cookie."""

    def authenticate(self, request):
        header = self.get_header(request)
        if header is not None:
            return super().authenticate(request)

        raw_token = request.COOKIES.get('access_token')
        if not raw_token:
            return None
        validated_token = self.get_validated_token(raw_token.encode())
        if request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            reason = CsrfViewMiddleware(lambda req: None).process_view(request, None, (), {})
            if reason:
                raise PermissionDenied(f'CSRF validation failed: {reason.reason}')
        return self.get_user(validated_token), validated_token
