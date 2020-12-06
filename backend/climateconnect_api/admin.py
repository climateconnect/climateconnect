from django.contrib import admin

from climateconnect_api.models import (UserProfile, Availability, Skill, Role)
from climateconnect_api.models.common import Feedback
from climateconnect_api.models.faq import (FaqSection, FaqQuestion)
from climateconnect_api.models.notification import (Notification, UserNotification, EmailNotification)
from climateconnect_api.models.donation import Donation, DonationGoal

pass_through_models = (
    UserProfile, Availability, Role, 
    Feedback, FaqSection, FaqQuestion,
    Notification, UserNotification, EmailNotification,
    Donation, DonationGoal
)

for model in pass_through_models:
    admin.site.register(model, admin.ModelAdmin)


class SkillAdmin(admin.ModelAdmin):
    search_fields = ('name',)


admin.site.register(Skill, SkillAdmin)
