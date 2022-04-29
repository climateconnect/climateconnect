from datetime import timedelta
from django.utils import timezone

from climateconnect_api.factories import (
    IdeaFactory,
    OrganizationFactory,
    OrganizationMemberFactory,
    ProjectFactory,
    ProjectLikeFactory,
    ProjectParentsFactory,
)


def create_project_test_data(
    number_of_likes=0,
    location=None,
    created_outside_of_timespan=False,
    has_parent_organization=False,
):
    # changes the creation date to 8 days ago, so it should be filtered out
    outside_of_timespan = timezone.now() - timedelta(days=8)

    # creates a project with not unique data
    project = ProjectFactory()

    # creates a creator for the project
    project_parents = ProjectParentsFactory(
        project=project,
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

    project.save()
    return project


def create_org_test_data(location=None, hub=None, created_outside_of_timespan=False):
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

    org.save()
    return org


def create_idea_test_data(location, hub, created_outside_of_timespan=False):
    # changes the creation date to 8 days ago, so it should be filtered out
    outside_of_timespan = timezone.now() - timedelta(days=8)

    # creates not unique data that wont be tested
    idea = IdeaFactory(
        hub_shared_in=hub,
        location=location,
    )

    # creates data that will be tested
    if created_outside_of_timespan:
        idea.created_at = outside_of_timespan

    idea.save()
    return idea
