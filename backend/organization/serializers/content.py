from rest_framework import serializers

from organization.models import Post, PostComment, Comment
from climateconnect_api.serializers.user import UserProfileStubSerializer

#TODO: potentially make serializer from which the other serializers inherit reused code

class PostSerializer(serializers.ModelSerializer):
  #TODO: add additional functionality such as 'is_abusive', 'deleted_at', 'updated_at'
  #TODO: get likes
  author_user = serializers.SerializerMethodField()
  replies = serializers.SerializerMethodField()

  class Meta:
    model = Post
    fields = (
      'id', 'author_user', 'title', 
      'content', 'created_at', 
      'updated_at', 'event_date', 
      'is_hidden', 'replies'
    )

  def get_author_user(self, obj):
    serializer = UserProfileStubSerializer(obj.author_user.user_profile)
    return serializer.data

  def get_replies(self, obj):
    top_level_comments = obj.post_comment.exclude(parent_comment_id__isnull=False)
    serializer = PostCommentSerializer(top_level_comments, many=True)
    return serializer.data

class PostCommentSerializer(serializers.ModelSerializer):
  #TODO: add additional functionality such as 'is_abusive', 'deleted_at', 'updated_at'
  #TODO: get likes
  author_user = serializers.SerializerMethodField()

  class Meta: 
    model = PostComment
    fields = (
      'id','parent_comment_id', 
      'author_user', 'content', 
      'is_abusive', 'created_at', 
      'updated_at'
    )
  
  def get_author_user(self, obj):
    serializer = UserProfileStubSerializer(obj.author_user.user_profile)
    return serializer.data

class ProjectCommentSerializer(serializers.ModelSerializer):
  #TODO: add additional functionality such as 'is_abusive', 'deleted_at', 'updated_at'
  #TODO: get likes
  author_user = serializers.SerializerMethodField()
  replies = serializers.SerializerMethodField()

  class Meta: 
    model = PostComment
    fields = (
      'id','parent_comment_id', 
      'author_user', 'content', 
      'is_abusive', 'created_at', 
      'updated_at', 'replies'
    )

  def get_author_user(self, obj):
    serializer = UserProfileStubSerializer(obj.author_user.user_profile)
    return serializer.data

  def get_replies(self, obj):
    serializer = ProjectCommentSerializer(obj.comment_parent, many=True)
    return serializer.data

# Writing a new generalized serializer that we can use in multiple places.
class CommentSerializer(serializers.ModelSerializer):
  author_user = serializers.SerializerMethodField()
  replies = serializers.SerializerMethodField()
  class Meta:
    model = Comment
    fields = (
      'id', 'parent_comment_id', 'author_user', 'content',
      'is_abusive', 'created_at', 'updated_at', 'replies'
    )

  def get_author_user(self, obj):
    return UserProfileStubSerializer(obj.author_user.user_profile).data
  
  def get_replies(self, obj):
    return CommentSerializer(obj.comment_parent.filter(deleted_at__isnull=True), many=True).data
    