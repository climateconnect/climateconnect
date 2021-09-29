from rest_framework.generics import ListAPIView
from hubs.serializers.hub import HubSerializer, HubStubSerializer
from hubs.models.hub import Hub
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from hubs.utility.analytics import process_url_visit_origin
from django.utils.timezone import now
from uuid import uuid4

class HubAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, url_slug):
        try:
            print(f"self.request.user.is_authenticated: {request.user.is_authenticated}")
            analytics_url_params = ('from_stickers',)
            url_kwargs ={k:request.GET[k] for k in request.GET}
            entry_url = request.get_full_path()
            if request.user.is_authenticated==True:
                visitor_guid = request.user.id
                user_is_authenticated=True 
            else:
                visitor_guid = str(uuid4())
                user_is_authenticated=False


            #checks if url contains any specific analytics tracking related query params (defined in analytics_url_params)
            if any([param in analytics_url_params for param in url_kwargs]):
                ##TODO
                ##Make this a Middleware for all visits/ Not only for Hubs
                print("recording entry...")
                process_url_visit_origin(analytics_params=analytics_url_params
                                        ,url_kwargs=url_kwargs
                                        ,visit_time=now()
                                        ,entry_url=entry_url
                                        ,visitor_guid=visitor_guid
                                        ,user_is_authenticated=user_is_authenticated
                                        ,request=request
                                        )

            hub = Hub.objects.get(url_slug=str(url_slug))
        except Hub.DoesNotExist:
            return Response({'message': 'Hub not found: {}'.format(url_slug)}, status=status.HTTP_404_NOT_FOUND)
        serializer = HubSerializer(hub, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ListHubsView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = HubStubSerializer

    def get_queryset(self):
        return Hub.objects.filter(importance__gte=1)

class ListSectorHubsView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = HubStubSerializer

    def get_queryset(self):
        return Hub.objects.filter(hub_type=Hub.SECTOR_HUB_TYPE).filter(importance__gte=1)