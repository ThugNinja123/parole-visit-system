from rest_framework.routers import DefaultRouter

from .views import OffenderViewSet, ParoleConditionViewSet, ParoleIncidentViewSet

router = DefaultRouter()
router.register("offenders", OffenderViewSet, basename="offender")
router.register("parole-conditions", ParoleConditionViewSet, basename="parole-condition")
router.register("parole-incidents", ParoleIncidentViewSet, basename="parole-incident")

urlpatterns = router.urls
