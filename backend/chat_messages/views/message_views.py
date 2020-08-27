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

            if MessageParticipants.objects.filter(participants__in=participants).exists():
                return Response(None, status=status.HTTP_200_OK)
            else:
                message_participants = MessageParticipants.objects.create(
                    chat_uuid=str(uuid4())
                )
                for user in participants:
                    message_participants.add(user)

                message_participants.save()

                return Response({
                    'message': 'Participants successfully connected'
                }, status=status.HTTP_201_CREATED)
