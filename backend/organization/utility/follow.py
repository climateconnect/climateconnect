from organization.models.organization import Organization
from organization.models.followers import OrganizationFollower, ProjectFollower
from organization.models.project import Project
from organization.utility.notification import (
    create_organization_follower_notification,
    create_project_follower_notification,
)
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from django.utils.translation import gettext as _

#  IsUserFollowing View functions
def check_if_user_follows_project(
    user,
    url_slug,
):
    return check_if_user_follows(
        user=user,
        url_slug=url_slug,
        entity_model_being_checked=Project,
        follower_model=ProjectFollower,
        look_up_field_name="project",
        error_msg="Project not found",
    )


def check_if_user_follows_organization(user, url_slug):
    return check_if_user_follows(
        user=user,
        url_slug=url_slug,
        entity_model_being_checked=Organization,
        follower_model=OrganizationFollower,
        look_up_field_name="organization",
        error_msg="Organization not found",
    )


def check_if_user_follows(
    user,
    url_slug,
    entity_model_being_checked,  # type of model being checked for if it is followed by the user (Organization/Project)
    follower_model,  # type of follower model (OrganizationFollower/ProjectFollower)
    look_up_field_name,  # the name of the field that is to be looked up
    error_msg,
):
    try:
        entity_model = entity_model_being_checked.objects.get(url_slug=url_slug)
    except entity_model_being_checked.DoesNotExist:
        raise NotFound(
            detail=error_msg + url_slug,
            code=status.HTTP_404_NOT_FOUND,
        )
    field_look_up_input = {
        look_up_field_name: entity_model
    }  # this syntax is used for field_name=value in the .filter lookup below
    is_following = follower_model.objects.filter(
        user=user, **field_look_up_input
    ).exists()
    return Response({"is_following": is_following}, status=status.HTTP_200_OK)


# SetFollow View functions
def set_user_following_project(request, url_slug):

    return set_user_following(
        request_data=request.data,
        user=request.user,
        entity_model_to_follow=Project,
        url_slug=url_slug,
        follower_model=ProjectFollower,
        lookup_up_field_name="project",
    )


def set_user_following_organization(request, url_slug):

    return set_user_following(
        request_data=request.data,
        user=request.user,
        entity_model_to_follow=Organization,
        url_slug=url_slug,
        follower_model=OrganizationFollower,
        lookup_up_field_name="organization",
    )


def set_user_following(
    request_data,
    user,
    entity_model_to_follow,  # type of model that user is trying to follow
    url_slug,
    follower_model,  # type of follower model (organization/project)
    lookup_up_field_name,  # the name of the field being looked up
):
    # what is a good way to make these different messages generic for this shared function?
    # messages are either for project or organization and differ from eachother
    if "following" not in request_data:
        return Response(
            {"message": _("Missing required parameters")},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        entity_model = entity_model_to_follow.objects.get(url_slug=url_slug)
    except entity_model_to_follow.DoesNotExist:
        message = (
            _("Organization not found.")
            if lookup_up_field_name == "organization"
            else _("Project not found.")
        )
        raise NotFound(detail=message, code=status.HTTP_404_NOT_FOUND)
    field_look_up_input = {
        lookup_up_field_name: entity_model
    }  # this syntax is used for field_name=value in the .filter(s) lookup below
    if request_data["following"] is True:
        if follower_model.objects.filter(user=user, **field_look_up_input).exists():
            message = (
                _("You're already following this organization.")
                if lookup_up_field_name == "organization"
                else _("You're already following this project.")
            )
            raise ValidationError(message)
        else:
            entity_model_follower = follower_model.objects.create(
                user=user, **field_look_up_input
            )
            if lookup_up_field_name == "project":
                create_project_follower_notification(entity_model_follower)
            elif lookup_up_field_name == "organization":
                create_organization_follower_notification(entity_model_follower)

            message = (
                _(
                    "You are now following this organization. You will be notified when they post an update!"
                )
                if lookup_up_field_name == "organization"
                else _(
                    "You are now following this project. You will be notified when they post an update!"
                )
            )
            return Response(
                {
                    "message": message,
                    "following": True,
                },
                status=status.HTTP_200_OK,
            )
    if request_data["following"] is False:
        try:
            follower_object = follower_model.objects.get(
                user=user, **field_look_up_input
            )
        except follower_model.DoesNotExist:
            message = (
                _("You weren't following this organization.")
                if lookup_up_field_name == "organization"
                else _("You weren't following this project.")
            )
            raise NotFound(
                detail=message,
                code=status.HTTP_404_NOT_FOUND,
            )
        follower_object.delete()
        message = (
            _("You are not following this organization anymore.")
            if lookup_up_field_name == "organization"
            else _("You are not following this project anymore.")
        )
        return Response(
            {
                "message": message,
                "following": False,
            },
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"message": _('Invalid value for variable "following"')},
            status=status.HTTP_400_BAD_REQUEST,
        )


# ListFollowerView functions
def get_list_of_organization_followers(self):

    return get_list_of_followers(
        list_of_followers_for_entity_model=Organization,
        follower_model=OrganizationFollower,
        look_up_field_name="organization",
        self=self,
    )


def get_list_of_project_followers(self):

    return get_list_of_followers(
        list_of_followers_for_entity_model=Project,
        follower_model=ProjectFollower,
        look_up_field_name="project",
        self=self,
    )


def get_list_of_followers(
    list_of_followers_for_entity_model,  # for which model should this list be for?
    follower_model,
    look_up_field_name,
    self,
):
    entity_model = list_of_followers_for_entity_model.objects.filter(
        url_slug=self.kwargs["url_slug"]
    )
    if not entity_model.exists():
        return None
    look_up_field_input = {
        look_up_field_name: entity_model[0]
    }  # this syntax is used for field_name=value in the .filter lookup below
    followers = follower_model.objects.filter(**look_up_field_input)
    return followers
