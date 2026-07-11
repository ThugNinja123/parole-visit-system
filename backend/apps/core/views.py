from django.db import connection
from django.http import JsonResponse


def health_check(request):
    """Liveness/readiness probe for the ALB / ECS. Verifies DB connectivity
    against the configured RDS instance so unhealthy tasks are cycled out."""
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False

    return JsonResponse(
        {"status": "ok" if db_ok else "degraded", "database": db_ok},
        status=200 if db_ok else 503,
    )
