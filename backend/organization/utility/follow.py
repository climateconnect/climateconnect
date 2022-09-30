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
def check_if_user_follows(
    user, 
    url_slug, 
    entity_model_being_checked, # type of model being checked for if it is followed by the user (Organization/Project)
    follower_model, # type of follower model (OrganizationFollower/ProjectFollower)
    look_up_field_name, # the name of the field that is to be looked up
    error_msg):
    try:
        entity_model = entity_model_being_checked.objects.get(url_slug=url_slug) 
    except entity_model_being_checked.DoesNotExist:
        raise NotFound(
            detail=error_msg + url_slug, 
            code=status.HTTP_404_NOT_FOUND,
        )
    field_look_up_input = {look_up_field_name: entity_model} # this syntax is used for field_name=value in the .filter lookup below 
    is_following = follower_model.objects.filter(user=user, **field_look_up_input).exists()
    return Response({"is_following": is_following}, status=status.HTTP_200_OK)


# SetFollow View function
def set_user_following(
    request_data, 
    user, 
    entity_model_to_follow, # type of model that user is trying to follow 
    url_slug, 
    follower_model, # type of follower model (organization/project)
    lookup_up_field_name, # the name of the field being looked up
    msgs
):
    lang_code = get_language()
    if "following" not in request_data:
        return Response(
            {"message": "Missing required parameters"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        entity_model = entity_model_to_follow.objects.get(url_slug=url_slug)
    except entity_model_to_follow.DoesNotExist:
        raise NotFound(detail=msgs[0], code=status.HTTP_404_NOT_FOUND)
    field_look_up_input = {lookup_up_field_name: entity_model} # this syntax is used for field_name=value in the .filter(s) lookup below 
    if request_data["following"] == True:
        if follower_model.objects.filter(user=user, **field_look_up_input).exists():
            raise ValidationError(msgs[1])
        else:
            entity_model_follower = follower_model.objects.create(
                user=user, **field_look_up_input
            )  
            if lookup_up_field_name == "project":
                create_project_follower_notification(entity_model_follower)
            elif lookup_up_field_name == "organization":
                create_organization_follower_notification(entity_model_follower)
            
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
            follower_object = follower_model.objects.get(user=user, **field_look_up_input)
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
def get_list_of_followers(
    list_of_followers_for_entity_model, # for which model should this list be for?
    follower_model, 
    look_up_field_name, 
    self
):
    entity_model = list_of_followers_for_entity_model.objects.filter(url_slug=self.kwargs["url_slug"])
    if not entity_model.exists():
        return None
    look_up_field_input = {look_up_field_name: entity_model[0]} # this syntax is used for field_name=value in the .filter lookup below 
    followers = follower_model.objects.filter(**look_up_field_input)
    return followers
