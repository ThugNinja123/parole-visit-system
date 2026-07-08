import pytest

from apps.accounts.models import Permission, Role, User
from apps.geography.models import District, PoliceStation
from apps.offenders.models import Offender


@pytest.fixture
def district(db):
    return District.objects.create(name="Central District", code="CEN")


@pytest.fixture
def police_station(db, district):
    return PoliceStation.objects.create(district=district, name="Central PS 1", code="CENPS1")


@pytest.fixture
def offender(db, district, police_station):
    return Offender.objects.create(
        district=district,
        police_station=police_station,
        name="John Doe",
        latitude=28.6139,
        longitude=77.2090,
    )


@pytest.fixture
def permission_view_offender(db):
    return Permission.objects.create(code="offender.view", label="View offenders", category="Offenders")


@pytest.fixture
def officer_role(db, permission_view_offender):
    role = Role.objects.create(name="Officer", description="Field officer")
    role.permissions.add(permission_view_offender)
    return role


@pytest.fixture
def officer_user(db, police_station, officer_role):
    user = User.objects.create_user(username="officer1", password="testpass123", police_station=police_station)
    user.roles.add(officer_role)
    return user
