from django.urls import path

from hubs.views import hub_views

app_name = 'hubs'
urlpatterns = [
    path(
        'hubs/<str:url_slug>/',
        hub_views.HubAPIView.as_view(),
        name='hub-api-view'
    ),
    path('hubs/', hub_views.ListHubsView.as_view(), name='list-hubs'),
]