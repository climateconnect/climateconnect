from django.urls import path

from hubs.views import hub_views

app_name = "hubs"
urlpatterns = [
    path("hubs/<str:url_slug>/", hub_views.HubAPIView.as_view(), name="hub-api-view"),
    path("hubs/<str:url_slug>/ambassador/", hub_views.HubAmbassadorAPIView.as_view(), name="hub-ambassador-api-view"),
    path("hubs/", hub_views.ListHubsView.as_view(), name="list-hubs"),
    path(
        "sector_hubs/", hub_views.ListSectorHubsView.as_view(), name="list-sector-hubs"
    ),
]
