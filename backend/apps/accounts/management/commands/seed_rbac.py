from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import Permission, Role

PERMISSION_CATALOG = [
    # code, label, category
    ("offender.view", "View offenders", "Offenders"),
    ("offender.create", "Create offenders", "Offenders"),
    ("offender.edit", "Edit offenders", "Offenders"),
    ("offender.delete", "Delete offenders", "Offenders"),
    ("crime.view", "View criminal records", "Criminal Records"),
    ("crime.manage", "Add/edit/delete criminal records", "Criminal Records"),
    ("inventory.view", "View inventory / evidence", "Inventory"),
    ("inventory.manage", "Add/edit/delete inventory / evidence", "Inventory"),
    ("visit.view", "View visit schedules & records", "Visits"),
    ("visit.schedule", "Create/edit visit schedules", "Visits"),
    ("visit.submit", "Submit a visit report (field officer)", "Visits"),
    ("visit.review", "Review flagged visits & mark reviewed", "Visits"),
    ("role.view", "View roles", "Roles & Users"),
    ("role.manage", "Create/edit roles & permissions", "Roles & Users"),
    ("user.view", "View users", "Roles & Users"),
    ("user.manage", "Create/edit users, assign roles", "Roles & Users"),
    ("geography.view", "View districts / police stations", "Geography"),
    ("geography.manage", "Manage districts / police stations", "Geography"),
    ("dashboard.view", "View dashboards & reports", "Dashboard"),
]

STARTER_ROLES = {
    "Admin": {
        "description": "Full system access.",
        "permissions": [code for code, _, _ in PERMISSION_CATALOG],
    },
    "Supervisor": {
        "description": "Oversees officers: reviews flagged visits, manages schedules and reference data.",
        "permissions": [
            "offender.view",
            "crime.view",
            "inventory.view",
            "visit.view",
            "visit.schedule",
            "visit.review",
            "geography.view",
            "dashboard.view",
            "role.view",
            "user.view",
        ],
    },
    "Officer": {
        "description": "Field officer: views assigned offenders and submits visit reports.",
        "permissions": [
            "offender.view",
            "crime.view",
            "inventory.view",
            "visit.view",
            "visit.submit",
        ],
    },
}


class Command(BaseCommand):
    help = "Seed the permission catalog and starter roles (Admin, Supervisor, Officer)."

    @transaction.atomic
    def handle(self, *args, **options):
        for code, label, category in PERMISSION_CATALOG:
            obj, created = Permission.objects.update_or_create(
                code=code, defaults={"label": label, "category": category}
            )
            self.stdout.write(f"{'Created' if created else 'Updated'} permission: {code}")

        for name, cfg in STARTER_ROLES.items():
            role, created = Role.objects.get_or_create(
                name=name, defaults={"description": cfg["description"], "is_system": True}
            )
            if not created:
                role.description = cfg["description"]
                role.is_system = True
                role.save()
            perms = Permission.objects.filter(code__in=cfg["permissions"])
            role.permissions.set(perms)
            self.stdout.write(f"{'Created' if created else 'Updated'} role: {name} ({perms.count()} permissions)")

        self.stdout.write(self.style.SUCCESS("RBAC seed complete."))
