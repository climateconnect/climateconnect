import uuid

from climateconnect_api.models import UserProfile
from climateconnect_api.permissions import UserPermission
from climateconnect_api.serializers.user import UserAccountSettingsSerializer
from climateconnect_api.utility.email_setup import (
    register_newsletter_contact,
    send_new_email_verification,
    unregister_newsletter_contact,
)

from django.utils.translation import gettext as _
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView


class UserAccountSettingsView(APIView):
    permission_classes = [UserPermission]

    def get(self, request):
        user = request.user
        serializer = UserAccountSettingsSerializer(user.user_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        # set and confirm password.
        if (
            "password" in request.data
            and "confirm_password" in request.data
            and "old_password" in request.data
        ):
            check_existing_password = user.check_password(request.data["old_password"])
            if check_existing_password:
                if request.data["password"] == request.data["confirm_password"]:
                    user.set_password(request.data["password"])
                    user.save()
                else:
                    raise ValidationError("Password do not match.")
            else:
                raise ValidationError(
                    "Incorrect password. Did you forget your password?"
                )

        if "email" in request.data:
            new_verification_key = uuid.uuid4()
            user.user_profile.verification_key = new_verification_key
            user.user_profile.pending_new_email = request.data["email"]
            send_new_email_verification(
                user, request.data["email"], new_verification_key
            )
            user.user_profile.save()

        email_preference_values = [
            "send_newsletter",
            "email_on_private_chat_message",
            "email_on_group_chat_message",
            "email_on_comment_on_your_project",
            "email_on_comment_on_your_idea",
            "email_on_reply_to_your_comment",
            "email_on_new_project_follower",
            "email_on_new_project_like",
            "email_on_mention",
            "email_on_idea_join",
            "email_on_join_request",
            "email_on_new_organization_follower",
            "email_on_new_project_from_followed_org",
        ]

        if "send_newsletter" in request.data:
            for value in email_preference_values:
                if value not in request.data:
                    return Response(
                        {"message": "Required parameter missing"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            if (
                not user.user_profile.send_newsletter
                and request.data["send_newsletter"]
            ):
                register_newsletter_contact(user.email)
            if (
                user.user_profile.send_newsletter is True
                and request.data["send_newsletter"] is False
            ):
                unregister_newsletter_contact(user.email)
            user.user_profile.send_newsletter = request.data["send_newsletter"]
            user.user_profile.email_on_private_chat_message = request.data[
                "email_on_private_chat_message"
            ]
            user.user_profile.email_on_group_chat_message = request.data[
                "email_on_group_chat_message"
            ]
            user.user_profile.email_on_comment_on_your_project = request.data[
                "email_on_comment_on_your_project"
            ]
            user.user_profile.email_on_reply_to_your_comment = request.data[
                "email_on_reply_to_your_comment"
            ]
            user.user_profile.email_on_new_project_follower = request.data[
                "email_on_new_project_follower"
            ]
            user.user_profile.email_on_new_project_like = request.data[
                "email_on_new_project_like"
            ]
            user.user_profile.email_on_comment_on_your_idea = request.data[
                "email_on_comment_on_your_idea"
            ]
            user.user_profile.email_on_idea_join = request.data["email_on_idea_join"]
            user.user_profile.email_on_join_request = request.data[
                "email_on_join_request"
            ]
            user.user_profile.email_on_new_organization_follower = request.data[
                "email_on_new_organization_follower"
            ]
            user.user_profile.email_on_new_project_from_followed_org = request.data[
                "email_on_new_project_from_followed_org"
            ]

            user.user_profile.save()

        return Response(
            {"message": "Account successfully updated"}, status=status.HTTP_200_OK
        )


class ChangeEmailView(APIView):
    permission_classes = [UserPermission]

    def post(self, request):
        if "uuid" not in request.data:
            return Response(
                {"message": _("Required parameters are missing.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        verification_key = request.data["uuid"].replace("%2D", "-")
        try:
            user_profile = UserProfile.objects.get(
                user=request.user, verification_key=verification_key
            )
        except User.DoesNotExist:
            return Response(
                {
                    "message": _("User profile not found.")
                    + " "
                    + _(
                        "Contact contact@climateconnect.earth if you repeatedly experience problems."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if user_profile.pending_new_email:
            user_profile.user.email = user_profile.pending_new_email
            user_profile.pending_new_email = None
            user_profile.save()
            user_profile.user.save()
        else:
            return Response(
                {
                    "message": _(
                        "No pending E-Mail change. This link may already have been used."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"message": _("Your E-Mail address is now ") + user_profile.user.email},
            status=status.HTTP_200_OK,
        )
