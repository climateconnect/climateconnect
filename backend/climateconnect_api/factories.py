import factory
from django.contrib.auth.models import User

from climateconnect_api.models import UserProfile
from organization.models.project import Project
from climateconnect_api.models.language import Language
from ideas.models.ideas import Idea
from location.models import Location
from organization.models.organization import Organization
from climateconnect_api.models.user import UserProfile


class UserFactory(factory.DjangoModelFactory):
    class Meta:
        model = User

    is_active = True


class UserProfileFactory(factory.DjangoModelFactory):
    class Meta:
        model = UserProfile

    user = factory.SubFactory(UserFactory)
    url_slug = "testing"
    image = "profile.png"
    background_image = "background.png"
    country = "Planet"
    state = "Earth"
    city = "Climate"
    biography = "Testing bio"



class ProjectFactory(factory.DjangoModelFactory):
    class Meta:
        model = Project

    user = factory.SubFactory(UserFactory)
    url_slug = "testing"
    image = "profile.png"
    background_image = "background.png"
    country = "Planet"
    state = "Earth"
    city = "Climate"
    biography = "Testing bio"
