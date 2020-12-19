from django.contrib import admin

from hubs.models import (
    Hub,
    HubStat
)

admin.site.register(Hub, admin.ModelAdmin)

admin.site.register(HubStat, admin.ModelAdmin)