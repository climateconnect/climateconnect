from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from climateconnect_api.models.faq import FaqQuestion
from climateconnect_api.serializers.faq import FaqQuestionSerializer


class ListFaqView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = FaqQuestionSerializer

    def get_queryset(self):
        return FaqQuestion.objects.all()


class AboutFaqView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = FaqQuestionSerializer

    def get_queryset(self):
        return FaqQuestion.objects.filter(section__is_on_about_page=True)
