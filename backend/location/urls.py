from django.urls import path

from location import location_views

app_name = "location"
urlpatterns = [
    # Location URLs
    path("get_location/", location_views.GetLocationView.as_view(), name="get-location"),
    # Nominatim autocomplete request tracking
    path(
        "nominatim_request_count/",
        location_views.TrackNominatimRequestView.as_view(),
        name="track-nominatim-request",
    ),
    path(
        "nominatim_stats/",
        location_views.NominatimStatsView.as_view(),
        name="nominatim-stats",
    ),
]
