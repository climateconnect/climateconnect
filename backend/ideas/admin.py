from django.contrib import admin

from ideas.models import (
    Idea, IdeaTranslation, IdeaComment,
    IdeaRating
)


class IdeaAdmin(admin.ModelAdmin):
    search_fields = ('name', 'organization__name', 'hub__name')


admin.site.register(Idea, IdeaAdmin)


class IdeaTranslationAdmin(admin.ModelAdmin):
    search_fields = (
        'idea__id', 'idea__name', 'name', 'idea__organization__name',
        'idea__hub__name'
    )


admin.site.register(IdeaTranslation, IdeaTranslationAdmin)


class IdeaCommentAdmin(admin.ModelAdmin):
    search_fields = (
        'idea__name', 'idea__id'
    )


admin.site.register(IdeaComment, IdeaCommentAdmin)
admin.site.register(IdeaRating, admin.ModelAdmin)
