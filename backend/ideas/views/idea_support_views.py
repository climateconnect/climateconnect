from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


from ideas.models import IdeaRating, IdeaSupporter
from ideas.permissions import IdeaRatingPermission, IdeaSupporterPermission
from ideas.serializers.support import IdeaRatingSerializer
from ideas.utility.idea import verify_idea


class IdeaRatingView(APIView):
    permission_classes = [IdeaRatingPermission]

    def post(self, request, url_slug):
        idea = verify_idea(url_slug=url_slug)
        if not idea:
            return Response({
                'message': 'Idea not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if 'rating' not in request.data:
            return Response({
                'message': 'Missing parameter'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        idea_rating = IdeaRating.objects.create(
            idea=idea, user=request.user,
            rating=request.data['rating']
        )

        return Response(
            IdeaRatingSerializer(idea_rating).data,
            status=status.HTTP_201_CREATED
        )
