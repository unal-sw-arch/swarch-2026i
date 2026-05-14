from django.urls import path
from .views import CreateActivityView, OrderActivityHistoryView

urlpatterns = [
    path("activities", CreateActivityView.as_view(), name="create-activity"),
    path(
        "activities/order/<str:order_id>",
        OrderActivityHistoryView.as_view(),
        name="order-activity-history",
    ),
]