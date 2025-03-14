from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from climateconnect_api.pagination import NotificationsPagination
from climateconnect_api.serializers.notification import NotificationSerializer
from climateconnect_api.models.notification import UserNotification, Notification
from rest_framework.exceptions import ValidationError
from datetime import datetime
from rest_framework.response import Response
from rest_framework import status


class ListNotificationsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = NotificationsPagination
    serializer_class = NotificationSerializer

    def get_queryset(self):
        user_notifications = UserNotification.objects.filter(
            user=self.request.user, read_at=None
        ).values_list("notification")
        notifications = Notification.objects.filter(id__in=user_notifications)
        if notifications.exists():
            return notifications
        else:
            return []
    #wanted to send User data to the Notification serializer 
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class SetUserNotificationsRead(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if "notifications" not in request.data:
            raise ValidationError("Required parameter mission: notifications")
        unread_notifications = UserNotification.objects.filter(
            notification__in=request.data["notifications"],
            user=request.user,
            read_at=None,
        )
        for notification in unread_notifications:
            notification.read_at = datetime.now()
            notification.save()
        all_unread_user_notifications = UserNotification.objects.filter(
            user=request.user, read_at=None
        ).values_list("notification")
        notifications = Notification.objects.filter(
            id__in=all_unread_user_notifications
        )
        if notifications.exists():
            serializer = NotificationSerializer(notifications, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response([], status=status.HTTP_200_OK)
