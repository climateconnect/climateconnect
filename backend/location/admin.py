from django.contrib import admin
from django.utils.html import format_html

from location.models import Location, LocationTranslation

# IMPORTANT: Coordinate Storage Format
# =====================================
# The database stores coordinates with X and Y swapped from PostGIS standard:
#   - X coordinate = Latitude (e.g., 52.376666)
#   - Y coordinate = Longitude (e.g., 9.086021)
#
# This is created by location/utility.py functions:
#   - get_location() line 92-93: Point(coords[1], coords[0]) creates (lat, lon)
#   - get_location() line 93-95: Point(lat, lon) for LineString
#   - get_polygon_with_switched_coordinates() line 142-153: swaps polygon coords
#   - get_multipolygon_from_geojson() line 127-140: uses above for multipolygons
#
# Therefore, we do not show any map or let you edit the coordinates.
# Instead, you can follow a link to OSM.


class LocationAdmin(admin.ModelAdmin):

    search_fields = (
        "name",
        "osm_id",
    )

    list_filter = ("osm_type", "is_stub")

    list_display = (
        "name",
        "osm_type",
        "osm_id",
        "osm_class",
        "osm_class_type",
        "place_id",
    )

    readonly_fields = ("nominatim_link", "coordinate_info")

    # Organize fields into logical sections
    fieldsets = (
        (
            "Location Information",
            {
                "fields": (
                    "name",
                    "place_name",
                    "display_name",
                    "exact_address",
                )
            },
        ),
        (
            "Geographic Details",
            {
                "fields": (
                    "city",
                    "state",
                    "country",
                )
            },
        ),
        (
            "OpenStreetMap Data",
            {
                "fields": (
                    "coordinate_info",
                    "nominatim_link",
                    "osm_id",
                    "osm_type",
                    "osm_class",
                    "osm_class_type",
                    "place_id",
                ),
            },
        ),
        (
            "Status",
            {
                "fields": (
                    "is_stub",
                    "is_formatted",
                )
            },
        ),
    )

    def coordinate_info(self, obj):
        """
        Display coordinate information in a readable format.
        NOTE: Database stores as (lat, lon) but we display as (lon, lat) for accuracy.
        """
        info_parts = []

        if obj.centre_point:
            # Database has X=lat, Y=lon (swapped), so we swap them back for display
            lon = obj.centre_point.y  # Database Y is actually longitude
            lat = obj.centre_point.x  # Database X is actually latitude
            info_parts.append(
                f"<strong>Centre Point:</strong> Lat {lat:.6f}°, Lon {lon:.6f}° "
                f"(SRID: {obj.centre_point.srid})<br>"
                f'<small style="color: #666;">Database stores as ({lat:.6f}, {lon:.6f}) but '
                f"actual coordinates are ({lon:.6f}, {lat:.6f})</small>"
            )

        if obj.multi_polygon:
            centroid = obj.multi_polygon.centroid
            # Database has X=lat, Y=lon (swapped), so we swap them back for display
            lon = centroid.y  # Database Y is actually longitude
            lat = centroid.x  # Database X is actually latitude
            num_polygons = len(obj.multi_polygon)
            info_parts.append(
                f"<strong>Polygon Centroid:</strong> Lat {lat:.6f}°, Lon {lon:.6f}° "
                f"({num_polygons} polygon{'s' if num_polygons > 1 else ''}, SRID: {obj.multi_polygon.srid})<br>"
                f'<small style="color: #666;">Database stores as ({lat:.6f}, {lon:.6f}) but '
                f"actual coordinates are ({lon:.6f}, {lat:.6f})</small>"
            )

        if not info_parts:
            return format_html(
                '<span style="color: #999;">No geographic coordinates set</span>'
            )

        return format_html("<br>".join(info_parts))

    coordinate_info.short_description = "Coordinate Details"

    def nominatim_link(self, obj):
        """
        Display a clickable link to the Nominatim details page for this location.
        """
        if obj.osm_id:
            osm_type = obj.osm_type or ""
            osm_class = obj.osm_class or ""
            url = f"https://nominatim.openstreetmap.org/ui/details.html?osmtype={osm_type}&osmid={obj.osm_id}&class={osm_class}"
            return format_html(
                '<a href="{}" target="_blank" rel="noopener noreferrer">View on Nominatim</a>',
                url,
            )
        return "N/A (missing OSM ID)"

    nominatim_link.short_description = "Nominatim Link"


admin.site.register(Location, LocationAdmin)


class LocationTranslationAdmin(admin.ModelAdmin):
    search_fields = (
        "location__name",
        "language__name",
        "language__language_code",
        "name_translation",
    )


admin.site.register(LocationTranslation, LocationTranslationAdmin)
