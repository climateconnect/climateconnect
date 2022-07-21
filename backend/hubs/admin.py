from django.contrib import admin

from hubs.models import Hub, HubStat, HubTranslation, HubStatTranslation

admin.site.register(Hub, admin.ModelAdmin)

admin.site.register(HubStat, admin.ModelAdmin)

admin.site.register(HubTranslation, admin.ModelAdmin)

admin.site.register(HubStatTranslation, admin.ModelAdmin)
