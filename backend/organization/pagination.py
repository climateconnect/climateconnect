from rest_framework.pagination import PageNumberPagination

class ProjectsPagination(PageNumberPagination):
  page_size = 12
  page_size_query_param = 'page_size'
  max_page_size = 20

class MembersPagination(PageNumberPagination):
  page_size = 12
  page_size_query_param = 'page_size'
  max_page_size = 20

class OrganizationsPagination(PageNumberPagination):
  page_size = 12
  page_size_query_param = 'page_size'
  max_page_size = 20

class ProjectPostPagination(PageNumberPagination):
  page_size = 100
  page_size_query_param = 'page_size'
  max_page_size = 20

class ProjectCommentPagination(PageNumberPagination):
  page_size = 10
  page_size_query_param = 'page_size'
  max_page_size = 20
