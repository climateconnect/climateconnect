from rest_framework.exceptions import NotFound
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


from ideas.models import IdeaRating, IdeaSupporter
from ideas.permissions import IdeaRatingPermission, IdeaSupporterPermission
from ideas.utility.idea import verify_idea
from rest_framework.permissions import IsAuthenticated


class IdeaRatingView(APIView):
    permission_classes = [IdeaRatingPermission]

    def post(self, request, url_slug):
        idea = verify_idea(url_slug=url_slug)
        if not idea:
            return Response(
                {"message": "Idea not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if "rating" not in request.data:
            return Response(
                {"message": "Missing parameter"}, status=status.HTTP_400_BAD_REQUEST
            )
        if int(request.data["rating"]) > 100 or int(request.data["rating"]) < 0:
            return Response(
                {"message": "Unsupported value for parameter rating"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        idea_rating, created = IdeaRating.objects.get_or_create(
            idea=idea, user=request.user
        )

        idea_rating.rating = int(request.data["rating"])
        idea_rating.save()
        average_rating = (
            sum(idea_rating.rating for idea_rating in idea.rating_idea.all())
            // idea.rating_idea.count()
        )

        return Response(
            {
                "average_rating": {
                    "rating_score": average_rating,
                    "number_of_ratings": idea.rating_idea.count(),
                }
            },
            status=status.HTTP_201_CREATED,
        )


class IdeaSupportView(APIView):
    permission_classes = [IdeaSupporterPermission]

    def post(self, request, url_slug):
        idea = verify_idea(url_slug=url_slug)
        if not idea:
            return Response(
                {"message": "Idea not found."}, status=status.HTTP_404_NOT_FOUND
            )

        IdeaSupporter.objects.get_or_create(idea=idea, user=request.user)

        return Response(None, status=status.HTTP_201_CREATED)


class GetPersonalIdeaRatingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, url_slug):
        idea = verify_idea(url_slug=url_slug)
        if not idea:
            raise NotFound(
                detail="Idea not found:" + url_slug, code=status.HTTP_404_NOT_FOUND
            )
        user_rating = IdeaRating.objects.filter(user=request.user, idea=idea)
        if user_rating.exists():
            return Response(
                {"user_rating": user_rating[0].rating, "has_user_rated": True},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"user_rating": 0, "has_user_rated": False}, status=status.HTTP_200_OK
            )
