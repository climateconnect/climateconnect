from rest_framework import serializers


class CheckEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class RequestTokenSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class VerifyTokenSerializer(serializers.Serializer):
    session_key = serializers.CharField(required=True)
    code = serializers.CharField(required=True)
