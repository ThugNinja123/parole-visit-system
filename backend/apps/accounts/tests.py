import pytest

pytestmark = pytest.mark.django_db


def test_user_has_permission_code_from_role(officer_user):
    assert officer_user.has_permission_code("offender.view") is True
    assert officer_user.has_permission_code("offender.delete") is False


def test_user_with_no_roles_has_no_permissions(django_user_model):
    user = django_user_model.objects.create_user(username="norole", password="x")
    assert user.get_all_permission_codes() == set()
    assert user.has_permission_code("offender.view") is False


def test_superuser_has_every_permission(django_user_model):
    admin = django_user_model.objects.create_superuser(username="admin", password="x", email="a@a.com")
    assert admin.has_permission_code("anything.at.all") is True
