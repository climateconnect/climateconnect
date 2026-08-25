from django.urls import path
from feature_toggles.views import FeatureToggleListView

urlpatterns = [
    path(
        "feature_toggles/", FeatureToggleListView.as_view(), name="feature-toggle-list"
    ),
]
