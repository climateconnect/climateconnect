from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from climateconnect_api.pagination import NotificationsPagination
from climateconnect_api.serializers.notification import (
    NotificationSerializer
)
from climateconnect_api.models.notification import UserNotification, Notification

class ListNotificationsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = NotificationsPagination
    serializer_class = NotificationSerializer

    def get_queryset(self):
        user_notifications = UserNotification.objects.filter(
            user=self.request.user, read_at=None
        ).values_list('notification')
        notifications = Notification.objects.filter(
            id__in = user_notifications
        )
        if notifications.exists():
            return notifications
        else:
            return []