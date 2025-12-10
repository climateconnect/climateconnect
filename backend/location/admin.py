from django.contrib import admin

from location.models import Location, LocationTranslation

# Register your models here.


class LocationAdmin(admin.ModelAdmin):
    search_fields = (
        "name",
        "osm_id",
    )

    list_filter = ("osm_type",)

    list_display = (
        "name",
        "osm_type",
        "osm_id",
        "osm_class",
        "osm_class_type",
        "place_id",
    )


admin.site.register(Location, LocationAdmin)


class LocationTranslationAdmin(admin.ModelAdmin):
    search_fields = (
        "location__name",
        "language__name",
        "language__language_code",
        "name_translation",
    )


admin.site.register(LocationTranslation, LocationTranslationAdmin)
