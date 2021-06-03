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
        
        idea_rating, created = IdeaRating.objects.get_or_create(
            idea=idea, user= request.user
        )

        idea_rating.rating = request.data['rating']
        idea_rating.save()

        average_rating = sum(
            idea_rating.rating for idea_rating in idea.rating_idea.all()
        ) // idea.rating_idea.count

        return Response({
            "average_rating": average_rating
        }, status=status.HTTP_201_CREATED)


class IdeaSupportView(APIView):
    permission_classes = [IdeaSupporterPermission]

    def post(self, request, url_slug):
        idea = verify_idea(url_slug=url_slug)
        if not idea:
            return Response({
                'message': 'Idea not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        IdeaSupporter.objects.get_or_create(
            idea=idea, user=request.user
        )

        return Response(None, status=status.HTTP_201_CREATED)
