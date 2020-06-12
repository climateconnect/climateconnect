import factory
from django.contrib.auth.models import User

from climateconnect_api.models import UserProfile


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
