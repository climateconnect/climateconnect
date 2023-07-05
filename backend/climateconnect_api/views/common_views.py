from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework import status

from climateconnect_api.models.common import Availability, Skill
from rest_framework.permissions import AllowAny
from climateconnect_api.serializers.common import (
    AvailabilitySerializer,
    SkillSerializer,
)
from climateconnect_api.pagination import SkillsPagination
from rest_framework.response import Response
from climateconnect_api.models.common import Feedback
from climateconnect_api.utility.email_setup import send_feedback_email
from django.utils.translation import gettext as _


class ListAvailabilitiesView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = AvailabilitySerializer

    def get_queryset(self):
        return Availability.objects.all()


class ListSkillsView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SkillSerializer
    pagination_class = SkillsPagination

    def get_queryset(self):
        return Skill.objects.all()


class ListParentSkillsView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SkillSerializer
    pagination_class = SkillsPagination

    def get_queryset(self):
        return Skill.objects.filter(parent_skill=None)


class ReceiveFeedback(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if "message" not in request.data:
            return Response(
                {"message": "Message is missing."}, status=status.HTTP_400_BAD_REQUEST
            )
        if "send_response" in request.data and request.data["send_response"] is True:
            if request.user and request.user.is_authenticated:
                feedback = Feedback.objects.create(
                    user=request.user,
                    email=request.user.email,
                    text=request.data["message"],
                    send_response=True,
                )
                send_feedback_email(request.user.email, request.data["message"], True)
                feedback.save()
                return Response(
                    _(
                        "Feedback successfully submitted. We will get back to you within 24 hours."
                    ),
                    status=status.HTTP_200_OK,
                )
            else:
                if "email_address" not in request.data:
                    return Response(
                        {"message": "E-Mail address is missing."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                feedback = Feedback.objects.create(
                    email=request.data["email_address"],
                    text=request.data["message"],
                    send_response=True,
                )
                send_feedback_email(
                    request.data["email_address"], request.data["message"], True
                )
                feedback.save()
                return Response(
                    _(
                        "Feedback successfully submitted. We will get back to you within 24 hours."
                    ),
                    status=status.HTTP_200_OK,
                )
        else:
            feedback = Feedback.objects.create(text=request.data["message"])
            send_feedback_email(None, request.data["message"], False)
            feedback.save()
            return Response(
                _("Feedback successfully submitted."), status=status.HTTP_200_OK
            )
