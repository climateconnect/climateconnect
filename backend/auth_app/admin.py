from django.contrib import admin

from auth_app.models import LoginAuditLog, LoginToken


@admin.register(LoginToken)
class LoginTokenAdmin(admin.ModelAdmin):
    list_display = ("email", "expires_at", "used_at", "attempt_count", "created_at")
    search_fields = ("email",)
    readonly_fields = ("id", "created_at")
    ordering = ("-created_at",)


@admin.register(LoginAuditLog)
class LoginAuditLogAdmin(admin.ModelAdmin):
    """Read-only admin — LoginAuditLog is an append-only audit table."""

    list_display = ("email", "outcome", "ip_address", "created_at")
    search_fields = ("email",)
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_readonly_fields(self, request, obj=None):
        return [f.name for f in self.model._meta.fields]
