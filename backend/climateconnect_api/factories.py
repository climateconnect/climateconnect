import factory
from django.contrib.auth.models import User
from django.conf import settings

from climateconnect_api.models import UserProfile
from organization.models.project import Project, ProjectParents
from organization.models.likes import ProjectLike
from organization.models.tags import ProjectTagging, ProjectTags
from climateconnect_api.models.language import Language
from ideas.models.ideas import Idea
from hubs.models.hub import Hub
from organization.models.status import ProjectStatus
from location.models import Location
from organization.models.organization import Organization
from organization.models.members import OrganizationMember
from climateconnect_api.models.role import Role
from organization.models.translations import ProjectTranslation, OrganizationTranslation
from ideas.models.translation import IdeaTranslation


class UserFactory(factory.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: "user{}".format(n + 1))
    is_active = True
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    email = factory.LazyAttribute(
        lambda a: "{}.{}@test.test".format(a.first_name, a.last_name).lower()
    )


class LocationFactory(factory.DjangoModelFactory):
    """Creates a stub location. Add coordinates for additional functionality such as location search"""

    class Meta:
        model = Location

    name = factory.Sequence(lambda n: f"test-location{n+1}")
    city = factory.Sequence(lambda n: f"test-city{n+1}")
    country = factory.Sequence(lambda n: f"test-country{n+1}")


class LanguageFactory(factory.DjangoModelFactory):
    class Meta:
        model = Language
        django_get_or_create = ('language_code',)

    name = "english"
    language_code = "en"


class UserProfileFactory(factory.DjangoModelFactory):
    class Meta:
        model = UserProfile

    user = factory.SubFactory(UserFactory)
    url_slug = factory.Sequence(lambda n: "userslug{}".format(n + 1))
    image = "profile.png"
    thumbnail_image = factory.django.ImageField(
        from_path=(
            settings.BASE_DIR
            + "/climateconnect_api/tests/media/"
            + "userprofile_thumbnail_image.jpeg"
        )
    )
    background_image = "background.png"
    biography = "This is a biography"
    send_newsletter = True
    is_profile_verified = True


class HubFactory(factory.DjangoModelFactory):
    """Creates by default a stub SectorHub"""

    class Meta:
        model = Hub

    name = factory.Sequence(lambda n: "hubname{}".format(n + 1))
    url_slug = factory.Sequence(lambda n: "hub_slug{}".format(n + 1))
    segway_text = "This is a segway_text"
    quick_info = "This is a quick_info"
    hub_type = Hub.SECTOR_HUB_TYPE
    icon =  factory.django.FileField(
        from_path=(
            settings.BASE_DIR
            + "/climateconnect_api/tests/media/"
            + "hub_icon.svg"
        )
    )

    # implementation of manytomany field
    @factory.post_generation
    def location(self, create, extracted, **kwargs):
        if not create:
            # Simple build, do nothing.
            return

        if extracted:
            # A list of groups were passed in, use them
            for loc in extracted:
                self.location.add(loc)


class ProjectStatusFactory(factory.DjangoModelFactory):
    class Meta:
        model = ProjectStatus
        django_get_or_create = ("name",)

    name = "In Progress"
    status_type = 1
    has_end_date = True
    has_start_date = True


class ProjectTagsFactory(factory.DjangoModelFactory):
    class Meta:
        model = ProjectTags

    name = factory.Sequence(lambda n: "ProjectTag{}".format(n + 1))


class ProjectFactory(factory.DjangoModelFactory):
    class Meta:
        model = Project

    name = factory.Sequence(lambda n: "Projectname{}".format(n + 1))
    url_slug = factory.Sequence(lambda n: "projectslug{}".format(n + 1))
    status = factory.SubFactory(ProjectStatusFactory)
    thumbnail_image = factory.django.ImageField(
        from_path=(
            settings.BASE_DIR
            + "/climateconnect_api/tests/media/"
            + "project_thumbnail_image.jpeg"
        )
    )
    short_description = "How can we maximize our chances to fight climate change? Climate Connect web-platform is a tool, free of use, helping all climate actors to gain visibility and collaborate with each other!"
    language = factory.SubFactory(LanguageFactory)


class ProjectTaggingFactory(factory.DjangoModelFactory):
    class Meta:
        model = ProjectTagging

    project = factory.SubFactory(ProjectFactory)
    project_tag = factory.SubFactory(ProjectTagsFactory)


class ProjectParentsFactory(factory.DjangoModelFactory):
    class Meta:
        model = ProjectParents

    project = factory.SubFactory(ProjectFactory)
    parent_user = factory.SubFactory(UserFactory)


class ProjectLikeFactory(factory.DjangoModelFactory):
    class Meta:
        model = ProjectLike

    project = factory.SubFactory(ProjectFactory)
    user = factory.SubFactory(UserFactory)


class OrganizationFactory(factory.DjangoModelFactory):
    class Meta:
        model = Organization

    name = factory.Sequence(lambda n: "org_name{}".format(n + 1))
    url_slug = factory.Sequence(lambda n: "org_slug{}".format(n + 1))
    short_description = "This is a short description!"
    thumbnail_image = factory.django.ImageField(
        from_path=(
            settings.BASE_DIR
            + "/climateconnect_api/tests/media/"
            + "org_thumbnail_image.jpeg"
        )
    )
    language = factory.SubFactory(LanguageFactory)


class RoleFactory(factory.DjangoModelFactory):
    class Meta:
        model = Role
        django_get_or_create = ("name", "role_type")

    name = "Creator"
    role_type = Role.ALL_TYPE


class OrganizationMemberFactory(factory.DjangoModelFactory):
    class Meta:
        model = OrganizationMember

    user = factory.SubFactory(UserFactory)
    organization = factory.SubFactory(OrganizationFactory)
    role = factory.SubFactory(RoleFactory)


class IdeaFactory(factory.DjangoModelFactory):
    class Meta:
        model = Idea

    name = factory.Sequence(lambda n: "idea_name{}".format(n + 1))
    url_slug = factory.Sequence(lambda n: "idea_slug{}".format(n + 1))
    thumbnail_image = factory.django.ImageField(
        from_path=(
            settings.BASE_DIR
            + "/climateconnect_api/tests/media/"
            + "idea_thumbnail_image.jpeg"
        )
    )
    user = factory.SubFactory(UserFactory)
    language = factory.SubFactory(LanguageFactory)
    short_description = "This is a short description!"


class ProjectTranslationFactory(factory.DjangoModelFactory):
    class Meta:
        model = ProjectTranslation

    name_translation = "translated project_name"
    short_description_translation = "This is a text in a different language. You cannot understand this language because it is different. Please read the factories.py because you cannot understand this because it is in a different language which you dont understand. This is 249 chars."


class OrganizationTranslationFactory(factory.DjangoModelFactory):
    class Meta:
        model = OrganizationTranslation
    
    name_translation = "translated org_name"
    short_description_translation = "This is a text in a different language. You cannot understand this language because it is different. Please read the factories.py because you cannot understand this because it is in a different language which you dont understand. This is 249 chars."


class IdeaTranslationFactory(factory.DjangoModelFactory):
    class Meta:
        model = IdeaTranslation

    name_translation = "translated idea_name"
    short_description_translation = "This is a text in a different language. You cannot understand this language because it is different. Please read the factories.py because you cannot understand this because it is in a different language which you dont understand. This is 249 chars."
    