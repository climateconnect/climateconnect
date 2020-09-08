from rest_framework.pagination import PageNumberPagination


class ChatMessagePagination(PageNumberPagination):
    page_size = 10
    page_query_param = 'page_size'
    max_page_size = 20
