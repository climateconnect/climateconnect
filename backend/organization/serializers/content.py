from rest_framework import serializers

from organization.models import Post, PostComment, Comment
from climateconnect_api.serializers.user import UserProfileStubSerializer

class PostSerializer(serializers.ModelSerializer):
  #TODO: add pagination
  author_user = serializers.SerializerMethodField()
  comments = serializers.SerializerMethodField()

  class Meta:
    model = Post
    fields = (
      'author_user', 'content', 
      'created_at', 'updated_at', 
      'is_hidden', 'comments'
    )

  def get_author_user(self, obj):
    serializer = UserProfileStubSerializer(obj.author_user.user_profile)
    return serializer.data

  def get_comments(self, obj):
    serializer = PostCommentSerializer(obj.post_comment, many=True)
    return serializer.data

class PostCommentSerializer(serializers.ModelSerializer):
  #TODO: add pagination

  class Meta: 
    model = PostComment
    fields = (
      'id','parent_comment_id', 
      'author_user', 'content', 
      'is_abusive', 'created_at', 
      'updated_at'
    )