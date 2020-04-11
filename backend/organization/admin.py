from django.contrib import admin

from organization.models import (
    Organization, OrganizationTags, OrganizationTagging
)

pass_through_models = (
    OrganizationTags, OrganizationTagging
)

for model in pass_through_models:
    admin.site.register(model, admin.ModelAdmin)


class OrganizationAdmin(admin.ModelAdmin):
    search_fields = ('name', 'country', 'state', 'city', 'url-slug')


admin.site.register(Organization, OrganizationAdmin)

