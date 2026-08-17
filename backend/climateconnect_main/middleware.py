from django.http import HttpResponse


class AzureHealthCheckMiddleware:
    """
    Middleware to handle Azure App Service health check probes.

    Azure App Service sends health check requests using internal IPs
    (169.254.x.x range) as the HTTP_HOST header. Django rejects these
    because the IPs aren't in ALLOWED_HOSTS, and Django doesn't support
    IP range patterns in ALLOWED_HOSTS.

    This middleware intercepts those requests early and returns a 200 OK
    before Django's host validation runs.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.META.get("HTTP_HOST", "").split(":")[0]
        if host.startswith("169.254."):
            return HttpResponse("OK", status=200)
        return self.get_response(request)
