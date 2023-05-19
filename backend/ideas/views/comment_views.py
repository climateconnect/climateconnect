from organization.utility.notification import (
    create_comment_mention_notification,
    get_mentions,
)
from typing import Optional

from django.contrib.auth.models import User
from django.utils import timezone

from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ParseError, NotFound
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from ideas.models import IdeaComment
from ideas.serializers.comment import IdeaCommentSerializer
from ideas.utility.idea import verify_idea
from ideas.utility.notification import (
    create_idea_comment_reply_notification,
    create_idea_comment_notification,
)

import logging

logger = logging.getLogger(__name__)


class ListIdeaCommentsView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = IdeaCommentSerializer

    def get_queryset(self):
        idea = verify_idea(url_slug=self.kwargs["url_slug"])
        if not idea:
            raise NotFound(detail="Idea not found.")

        return IdeaComment.objects.filter(
            idea__url_slug=self.kwargs["url_slug"],
            is_abusive=False,
            deleted_at__isnull=True,
            parent_comment=None,
        ).order_by("-id", "updated_at", "created_at")


class IdeaCommentsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, url_slug):
        idea = verify_idea(url_slug=url_slug)
        if not idea:
            raise NotFound(detail="Idea not found.")

        # Check for required params
        required_params = ["content"]
        for param in required_params:
            if param not in request.data:
                raise ParseError(detail="Missing required parameter")

        parent_comment = None
        if request.data["parent_comment_id"]:
            try:
                parent_comment = IdeaComment.objects.get(
                    id=request.data["parent_comment_id"]
                )
            except IdeaComment.DoesNotExist as e:
                logger.info(
                    f"IdeaComment: Parent comment for {request.data['parent_comment_id']} does not exist: {e}"
                )

        idea_comment = IdeaComment.objects.create(
            author_user=request.user,
            content=request.data["content"],
            idea=idea,
            parent_comment=parent_comment,
        )
        mentioned_users = get_mentions(text=idea_comment.content, url_slugs_only=True)
        if len(mentioned_users) > 0:
            create_comment_mention_notification(
                entity_type="idea",
                entity=idea,
                comment=idea_comment,
                sender=request.user,
            )
        if idea_comment.parent_comment:
            create_idea_comment_reply_notification(
                idea=idea,
                comment=idea_comment,
                sender=request.user,
                user_url_slugs_to_ignore=mentioned_users,
            )
        else:
            create_idea_comment_notification(
                idea=idea,
                comment=idea_comment,
                sender=request.user,
                user_url_slugs_to_ignore=mentioned_users,
            )
        serializer = IdeaCommentSerializer(idea_comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UpdateDestroyIdeaCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def get_comment(self, comment_id: int) -> Optional[IdeaComment]:
        try:
            idea_comment = IdeaComment.objects.get(id=comment_id)
        except IdeaComment.DoesNotExist:
            raise NotFound(detail="Comment not found.")

        return idea_comment

    def verfiy_author_permission(self, idea_comment: IdeaComment, user: User) -> None:
        if idea_comment.author_user != user:
            raise PermissionDenied(detail="Cannot update or delete this comment.")

    def patch(self, request, url_slug, comment_id):
        idea = verify_idea(url_slug=url_slug)
        if not idea:
            raise NotFound(detail="Idea not found.")

        idea_comment = self.get_comment(comment_id=comment_id)

        self.verfiy_author_permission(idea_comment, request.user)

        parent_comment = None
        if "parent_comment_id" in request.data:
            try:
                parent_comment = IdeaComment.objects.get(
                    id=request.data["parent_comment_id"]
                )
            except IdeaComment.DoesNotExist as e:
                logger.error(
                    f"UDIdeaComment: idea comment {request.data['parent_comment_id']} does not exist: {e}"
                )

        idea_comment.content = request.data["content"]
        if parent_comment:
            idea_comment.parent_comment = parent_comment

        idea_comment.save()

        return Response(
            {"message": "Your comment is updated."}, status=status.HTTP_200_OK
        )

    def delete(self, request, url_slug, comment_id):
        idea = verify_idea(url_slug=url_slug)
        if not idea:
            raise NotFound(detail="Idea not found.")

        idea_comment = self.get_comment(comment_id=comment_id)
        self.verfiy_author_permission(idea_comment, request.user)

        idea_comment.deleted_at = timezone.now()
        idea_comment.deleted_by_user = request.user
        idea_comment.content = "DELETED"
        idea_comment.save()

        return Response({"message": "Comment deleted."}, status=status.HTTP_200_OK)
