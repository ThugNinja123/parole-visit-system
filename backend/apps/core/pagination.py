from rest_framework.pagination import PageNumberPagination


class DefaultPagination(PageNumberPagination):
    """Default pagination for all list endpoints.

    Honors a client-supplied `page_size` query param (capped at
    `max_page_size`) so admin-console screens can request "give me
    everything" without silently being truncated to the global
    `PAGE_SIZE` default.
    """

    page_size_query_param = "page_size"
    max_page_size = 1000
