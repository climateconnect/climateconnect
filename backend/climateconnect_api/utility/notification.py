from climateconnect_api.models.notification import UserNotification

def create_user_notification(user, notification):
    old_notification_object = UserNotification.objects.filter(
        user=user, 
        notification=notification
    )
    if not old_notification_object.exists():
        UserNotification.objects.create(
            user=user, notification=notification
        )
    else :
        if not old_notification_object[0].read_at == None:
            old_notification = old_notification_object[0]
            old_notification.read_at = None
            old_notification.save()
