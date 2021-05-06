from rest_framework.pagination import PageNumberPagination


class IdeasBoardPagination(PageNumberPagination):
    page_size = 12
    page_query_param = "page_size"
    max_page_size = 20
