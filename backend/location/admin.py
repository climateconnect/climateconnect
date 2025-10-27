from location.models import Location, LocationTranslation
from django.contrib import admin

# Register your models here.

class LocationAdmin(admin.ModelAdmin):
    search_fields = (
        'name', 
        'osm_id',
    )
    
    list_filter = (
        'osm_type', 
    )
    
    list_display = (
        'name', 
        'osm_type',
        'osm_id', 
        'place_id',
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
