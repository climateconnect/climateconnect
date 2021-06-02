from rest_framework.pagination import PageNumberPagination


class IdeasBoardPagination(PageNumberPagination):
    page_size = 12
    max_page_size = 20
