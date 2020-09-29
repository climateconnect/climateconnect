from climateconnect_api.models.notification import UserNotification

def create_user_notification(user, notification):
    old_notification = UserNotification.objects.filter(
        user=user, 
        notification=notification, 
        read_at = None
    )
    if not old_notification.exists():
        UserNotification.objects.create(
            user=user, notification=notification
        )