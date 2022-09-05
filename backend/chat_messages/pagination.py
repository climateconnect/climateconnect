from rest_framework.pagination import PageNumberPagination


class ChatMessagePagination(PageNumberPagination):
    page_size = 20
    page_query_param = "page_size"
    max_page_size = 20


class ChatsPagination(PageNumberPagination):
    page_size = 20
    max_page_size = 50
