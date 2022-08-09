from climateconnect_api.models import UserProfile
from climateconnect_api.serializers.user import UserProfileStubSerializer


def get_following_user(user):
    follower_user = UserProfile.objects.filter(user=user)
    serializer = UserProfileStubSerializer(follower_user[0])
    return serializer.data
