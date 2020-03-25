import factory
from django.contrib.auth.models import User


class UserFactory(factory.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ('username', 'password', 'is_active')

    is_active = True
    username="test_user" 
    password="testing@2020"
