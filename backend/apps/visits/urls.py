from rest_framework.routers import DefaultRouter

from .views import VisitRecordViewSet, VisitScheduleViewSet

router = DefaultRouter()
router.register("visit-schedules", VisitScheduleViewSet, basename="visit-schedule")
router.register("visit-records", VisitRecordViewSet, basename="visit-record")

urlpatterns = router.urls
