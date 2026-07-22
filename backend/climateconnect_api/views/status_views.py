import json
import pathlib

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class PingPongView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        return Response({"result": "pong"}, status=status.HTTP_200_OK)


class BuildInfoView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        info_path = pathlib.Path(__file__).resolve().parents[2] / "build_info.json"
        try:
            return Response(
                json.loads(info_path.read_text()), status=status.HTTP_200_OK
            )
        except FileNotFoundError:
            return Response(
                {"sha": "dev", "ref": "local", "built_at": None},
                status=status.HTTP_200_OK,
            )
