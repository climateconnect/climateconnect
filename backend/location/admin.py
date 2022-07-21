from location.models import Location, LocationTranslation
from django.contrib import admin

# Register your models here.

admin.site.register(Location, admin.ModelAdmin)


class LocationTranslationAdmin(admin.ModelAdmin):
    search_fields = (
        "location__name",
        "language__name",
        "language__language_code",
        "name_translation",
    )


admin.site.register(LocationTranslation, LocationTranslationAdmin)
