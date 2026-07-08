from rest_framework.routers import DefaultRouter

from .views import CrimeViewSet, InventoryItemViewSet

router = DefaultRouter()
router.register("crimes", CrimeViewSet, basename="crime")
router.register("inventory-items", InventoryItemViewSet, basename="inventory-item")

urlpatterns = router.urls
