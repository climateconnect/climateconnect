from rest_framework.pagination import PageNumberPagination

class MembersPagination(PageNumberPagination):
  page_size = 12
  page_size_query_param = 'page_size'
  max_page_size = 20

class SkillsPagination(PageNumberPagination):
  page_size = 200
  page_size_query_param = 'page_size'
  max_page_size = 200