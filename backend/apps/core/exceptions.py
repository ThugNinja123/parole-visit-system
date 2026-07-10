from django.db.models.deletion import ProtectedError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def custom_exception_handler(exc, context):
    """Extends DRF's default handler so DB integrity errors surface as clean
    API responses instead of bubbling up as unhandled 500s.

    In particular, deleting a row that other rows still reference via
    `on_delete=PROTECT` (e.g. a District with Police Stations, or a Police
    Station with registered Offenders) raises `ProtectedError`, which DRF
    does not handle by default.
    """
    response = drf_exception_handler(exc, context)
    if response is not None:
        return response

    if isinstance(exc, ProtectedError):
        protected_objects = list(exc.protected_objects)
        count = len(protected_objects)
        if protected_objects:
            label = protected_objects[0]._meta.verbose_name_plural
        else:
            label = "other records"
        detail = (
            f"This can't be deleted because it is still linked to {count} {label}. "
            "Reassign or remove those first."
        )
        return Response({"detail": detail}, status=status.HTTP_400_BAD_REQUEST)

    return None
