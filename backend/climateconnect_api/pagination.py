from rest_framework.pagination import PageNumberPagination


class GeneralizedPagination(PageNumberPagination):
  page_size = 1
  page_size_query_param = 'page_size'
  max_page_size = 20

class MembersPagination(PageNumberPagination):
  page_size = 12
  page_size_query_param = 'page_size'
  max_page_size = 20

class SkillsPagination(PageNumberPagination):
  page_size = 200
  page_size_query_param = 'page_size'
  max_page_size = 200

class NotificationsPagination(PageNumberPagination):
  page_size = 20
  page_size_query_param = 'page_size'
  max_page_size = 200