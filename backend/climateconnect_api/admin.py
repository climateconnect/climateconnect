from django.contrib import admin

from climateconnect_api.models import (UserProfile, Availability, Skill, Role)
from climateconnect_api.models.common import Feedback
from climateconnect_api.models.faq import (FaqSection, FaqQuestion)
from chat_messages.models.message import (MessageParticipants, Message)

pass_through_models = (UserProfile, Availability, Role, Feedback, FaqSection, FaqQuestion, MessageParticipants, Message)

for model in pass_through_models:
    admin.site.register(model, admin.ModelAdmin)


class SkillAdmin(admin.ModelAdmin):
    search_fields = ('name',)


admin.site.register(Skill, SkillAdmin)
