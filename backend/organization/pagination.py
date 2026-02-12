from rest_framework.pagination import PageNumberPagination, _positive_int


class ProjectsPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 20
    parent_project_max_page_size = 100

    def get_page_size(self, request):
        dynamic_max = (
            self.parent_project_max_page_size
            if request.query_params.get("parent_project_slug")
            else self.max_page_size
        )
        if self.page_size_query_param:
            try:
                return _positive_int(
                    request.query_params[self.page_size_query_param],
                    strict=True,
                    cutoff=dynamic_max,
                )
            except (KeyError, ValueError):
                pass
        return self.page_size


class MembersPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = "page_size"
    max_page_size = 48


class OrganizationsPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 20


class ProjectPostPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = "page_size"
    max_page_size = 20


class ProjectCommentPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 20


class ProjectsSitemapPagination(PageNumberPagination):
    page_size = 200
    page_size_query_param = "page_size"
    max_page_size = 1000
