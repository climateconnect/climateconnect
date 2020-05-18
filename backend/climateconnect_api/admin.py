from django.contrib import admin

from climateconnect_api.models import (UserProfile, Availability, Skill, Role)

pass_through_models = (UserProfile, Availability, Role)

for model in pass_through_models:
    admin.site.register(model, admin.ModelAdmin)


class SkillAdmin(admin.ModelAdmin):
    search_fields = ('name',)


admin.site.register(Skill, SkillAdmin)
