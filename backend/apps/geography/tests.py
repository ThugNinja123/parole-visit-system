import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.geography.models import District, PoliceStation

pytestmark = pytest.mark.django_db


@pytest.fixture
def admin_client(db):
    user = User.objects.create_superuser(username="admin", password="testpass123")
    client = APIClient()
    client.force_authenticate(user)
    return client


def test_police_station_list_honors_requested_page_size(admin_client):
    """Regression test: the admin console's "add user" form requests
    `page_size=500` so every station is selectable as a user's location.
    Without a pagination class that exposes `page_size_query_param`, DRF
    silently ignores the param and truncates the list to the global
    default (25), hiding stations from the dropdown."""
    district = District.objects.create(name="Central District", code="CEN")
    for i in range(30):
        PoliceStation.objects.create(district=district, name=f"PS {i:02d}", code=f"CENPS{i:02d}")

    response = admin_client.get("/api/police-stations/", {"page_size": 500})

    assert response.status_code == 200
    assert response.data["count"] == 30
    assert len(response.data["results"]) == 30


def test_police_station_list_still_paginates_without_page_size_param(admin_client):
    district = District.objects.create(name="Central District", code="CEN")
    for i in range(30):
        PoliceStation.objects.create(district=district, name=f"PS {i:02d}", code=f"CENPS{i:02d}")

    response = admin_client.get("/api/police-stations/")

    assert response.status_code == 200
    assert response.data["count"] == 30
    assert len(response.data["results"]) == 25
