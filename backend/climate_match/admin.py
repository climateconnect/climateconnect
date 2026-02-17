from django.contrib import admin

from climate_match.models import (
    Answer,
    AnswerMetaData,
    Question,
    UserQuestionAnswer,
    QuestionTranslation,
    AnswerTranslation,
)

admin.site.register(Question, admin.ModelAdmin)
admin.site.register(Answer, admin.ModelAdmin)
admin.site.register(AnswerMetaData, admin.ModelAdmin)
admin.site.register(QuestionTranslation, admin.ModelAdmin)
admin.site.register(AnswerTranslation, admin.ModelAdmin)


class UserQuestionAnswerAdmin(admin.ModelAdmin):
    search_fields = (
        "user__username",
        "user__id",
        "user__first_name",
        "user__last_name",
        "question__text",
        "question__id",
    )


admin.site.register(UserQuestionAnswer, UserQuestionAnswerAdmin)
