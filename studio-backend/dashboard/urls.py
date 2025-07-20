from django.urls import path
from .views import DashboardAPIView, DashboardHealthView

app_name = 'dashboard'

urlpatterns = [
    path('', DashboardAPIView.as_view(), name='dashboard-data'),
    path('health/', DashboardHealthView.as_view(), name='dashboard-health'),
] 