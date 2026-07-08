import pytest

from apps.core.geo import haversine_distance_meters


def test_haversine_distance_same_point_is_zero():
    assert haversine_distance_meters(28.6139, 77.2090, 28.6139, 77.2090) == pytest.approx(0, abs=1e-6)


def test_haversine_distance_known_points():
    # Delhi to Agra, roughly 178km apart as the crow flies.
    distance = haversine_distance_meters(28.6139, 77.2090, 27.1767, 78.0081)
    assert 170_000 < distance < 190_000


def test_haversine_distance_small_offset():
    # ~0.001 degrees latitude is roughly 111 meters.
    distance = haversine_distance_meters(28.6139, 77.2090, 28.6149, 77.2090)
    assert 100 < distance < 130
