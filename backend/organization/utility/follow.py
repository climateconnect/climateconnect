from organization.utility.notification import (
    create_organization_follower_notification,
    create_project_follower_notification,
)
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from django.utils.translation import get_language
from rest_framework.exceptions import ValidationError


#  IsUserFollowing View function
def check_if_user_follows(user, url_slug, model, follower_model, field_name, error_msg):
    try:
        obj = model.objects.get(url_slug=url_slug)
    except model.DoesNotExist:
        raise NotFound(
            detail=error_msg + url_slug,  # object can either
            code=status.HTTP_404_NOT_FOUND,
        )
    query = {field_name: obj}
    is_following = follower_model.objects.filter(user=user, **query).exists()
    return Response({"is_following": is_following}, status=status.HTTP_200_OK)


# SetFollow View function
def set_user_following(
    request_data, user, model, url_slug, follower_model, field_name, msgs
):
    lang_code = get_language()
    print(lang_code)
    if "following" not in request_data:
        return Response(
            {"message": "Missing required parameters"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        obj = model.objects.get(url_slug=url_slug)
    except model.DoesNotExist:
        raise NotFound(detail=msgs[0], code=status.HTTP_404_NOT_FOUND)
    query = {field_name: obj}
    if request_data["following"] == True:
        if follower_model.objects.filter(user=user, **query).exists():
            raise ValidationError(msgs[1])
        else:
            obj_follower = follower_model.objects.create(
                user=user, **query
            )  # needs a better way ?
            if field_name == "project":
                create_project_follower_notification(obj_follower)
            elif field_name == "organization":
                create_organization_follower_notification(obj_follower)
            # create_follower_notification(obj_follower)
            if lang_code == "en":
                message = msgs[2]
            else:
                message = msgs[3]

            return Response(
                {
                    "message": message,
                    "following": True,
                },
                status=status.HTTP_200_OK,
            )
    if request_data["following"] == False:
        try:
            follower_object = follower_model.objects.get(user=user, **query)
        except follower_model.DoesNotExist:
            raise NotFound(
                detail=msgs[4],
                code=status.HTTP_404_NOT_FOUND,
            )
        follower_object.delete()
        if lang_code == "en":
            message = msgs[5]
        else:
            message = msgs[6]
        return Response(
            {
                "message": message,
                "following": False,
            },
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"message": 'Invalid value for variable "following"'},
            status=status.HTTP_400_BAD_REQUEST,
        )


# ListFollowerView function
def get_list_of_followers(model, follower_model, field_name, self):
    object = model.objects.filter(url_slug=self.kwargs["url_slug"])
    if not object.exists():
        return None
    query = {field_name: object[0]}
    followers = follower_model.objects.filter(**query)
    return followers
