from django.contrib import admin

from climateconnect_api.models import (UserProfile,)

pass_through_models = (UserProfile,)

for model in pass_through_models:
    admin.site.register(model)
