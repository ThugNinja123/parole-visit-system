from django.apps import AppConfig


class CriminalRecordsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.criminal_records"

    def ready(self):
        from . import signals  # noqa: F401
