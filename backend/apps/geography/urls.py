from rest_framework.routers import DefaultRouter

from .views import DistrictViewSet, PoliceStationViewSet

router = DefaultRouter()
router.register("districts", DistrictViewSet, basename="district")
router.register("police-stations", PoliceStationViewSet, basename="police-station")

urlpatterns = router.urls
