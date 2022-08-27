from django.urls import path

from location import location_views

app_name = "location"
urlpatterns = [
    # Location URLs
    path("get_location/", location_views.GetLocationView.as_view(), name="get-location")
]
