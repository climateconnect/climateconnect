from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from uuid import uuid4

from django.contrib.auth.models import User
from chat_messages.models import MessageParticipants
from chat_messages.consumer import DirectMessageConsumer


class ConnectMessageParticipantsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        import pdb
        pdb.set_trace()
        user = request.user
        if 'user_id' not in request.data:
            return Response({
                'message': 'Required parameter is missing'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            participant_user = User.objects.get(id=int(request.data['user_id']))
        except User.DoesNotExist:
            return Response({
                'message': 'Participant not found'
            }, status=status.HTTP_404_NOT_FOUND)

        if participant_user:
            participants = [user, participant_user]
            message_participants, created = MessageParticipants.objects.get_or_create(
                participants__in=participants,
            )

            if created:
                message_participants.chat_uuid = str(uuid4())
                message_participants.save()

            # TODO: Add a websocket connection. Connect to the chat.
            DirectMessageConsumer(group_name='chat').connect()
            return Response({
                'message': 'Participants successfully connected'
            }, status=status.HTTP_200_OK)
