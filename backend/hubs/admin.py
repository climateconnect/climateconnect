from django.contrib import admin

from hubs.models import (
    Hub,
    HubStat,
    HubTranslation,
    HubStatTranslation,
    HubAmbassador,
    HubSupporter,
    HubSupporterTranslation,
    HubTheme,
    HubThemeColor,
)

admin.site.register(Hub, admin.ModelAdmin)

admin.site.register(HubStat, admin.ModelAdmin)

admin.site.register(HubTranslation, admin.ModelAdmin)

admin.site.register(HubStatTranslation, admin.ModelAdmin)

admin.site.register(HubAmbassador, admin.ModelAdmin)

admin.site.register(HubSupporter, admin.ModelAdmin)

admin.site.register(HubSupporterTranslation, admin.ModelAdmin)

admin.site.register(HubTheme, admin.ModelAdmin)

admin.site.register(HubThemeColor, admin.ModelAdmin)
