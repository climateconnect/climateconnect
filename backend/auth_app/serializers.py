from rest_framework import serializers


class CheckEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
