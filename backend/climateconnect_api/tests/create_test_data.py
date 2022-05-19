from datetime import timedelta
from django.utils import timezone

from climateconnect_api.factories import (
    IdeaFactory,
    OrganizationFactory,
    OrganizationMemberFactory,
    ProjectFactory,
    ProjectLikeFactory,
    ProjectParentsFactory,
    ProjectTaggingFactory,
    UserProfileFactory,
    OrganizationTranslationFactory,
    ProjectTranslationFactory,
    IdeaTranslationFactory,
)


def create_project_test_data(
    number_of_likes=0,
    location=None,
    translation_language=None,
    created_outside_of_timespan=False,
    has_parent_organization=False,
):
    # changes the creation date to 8 days ago, so it should be filtered out
    outside_of_timespan = timezone.now() - timedelta(days=8)

    # creates a project with not unique data
    project = ProjectFactory()

    # creates a creator for the project
    creator = UserProfileFactory()
    project_parents = ProjectParentsFactory(
        project=project,
        parent_user=creator.user,
    )
    if has_parent_organization:
        project_parents.parent_organization = OrganizationFactory()
        project_parents.save()

    # creates likes for the project which will be tested
    for _ in range(number_of_likes):
        ProjectLikeFactory(project=project)

    # creates data that will be tested
    if location:
        project.loc = location
    if created_outside_of_timespan:
        project.created_at = outside_of_timespan
    if translation_language:
        ProjectTranslationFactory(project=project, language=translation_language)

    # creates tags for the project
    ProjectTaggingFactory(project=project)

    project.save()
    return project


def create_org_test_data(
    location=None,
    hub=None,
    translation_language=None,
    created_outside_of_timespan=False,
):
    # changes the creation date to 8 days ago, so it should be filtered out
    outside_of_timespan = timezone.now() - timedelta(days=8)

    # creates org data that wont be tested
    org = OrganizationFactory()

    # creates the creator for the org
    OrganizationMemberFactory(organization=org)

    # creates data that will be tested
    if location:
        org.location = location
    if created_outside_of_timespan:
        org.created_at = outside_of_timespan
    if translation_language:
        OrganizationTranslationFactory(organization=org, language=translation_language)

    org.save()
    return org


def create_idea_test_data(
    location, hub, translation_language=None, created_outside_of_timespan=False
):
    # changes the creation date to 8 days ago, so it should be filtered out
    outside_of_timespan = timezone.now() - timedelta(days=8)

    # creates not unique data that wont be tested
    creator = UserProfileFactory()
    idea = IdeaFactory(
        hub_shared_in=hub,
        location=location,
        user=creator.user,
    )

    # creates data that will be tested
    if created_outside_of_timespan:
        idea.created_at = outside_of_timespan
    if translation_language:
        IdeaTranslationFactory(idea=idea, language=translation_language)

    idea.save()
    return idea
