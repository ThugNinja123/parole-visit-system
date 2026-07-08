from django.core.management.base import BaseCommand
from django.db import transaction

from apps.geography.models import District, PoliceStation

SAMPLE_DATA = {
    "Central District": ["Central PS 1", "Central PS 2"],
    "North District": ["North PS 1", "North PS 2"],
    "South District": ["South PS 1", "South PS 2"],
}


class Command(BaseCommand):
    help = "Seed a small set of sample districts and police stations for local development."

    @transaction.atomic
    def handle(self, *args, **options):
        for district_name, stations in SAMPLE_DATA.items():
            district, _ = District.objects.get_or_create(
                name=district_name, defaults={"code": district_name[:3].upper()}
            )
            for station_name in stations:
                PoliceStation.objects.get_or_create(
                    district=district,
                    name=station_name,
                    defaults={"code": station_name.replace(" ", "").upper()[:10]},
                )
        self.stdout.write(self.style.SUCCESS("Sample geography data seeded."))
