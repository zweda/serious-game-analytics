from django.urls import include, path
from rest_framework import routers
from service import views

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'games', views.GameViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'research-questions', views.ResearchQuestionViewSet)
router.register(r'user-events', views.UserEventViewSet)
router.register(r'user-event-props', views.UserEventPropViewSet)
router.register(r'event-groups', views.EventGroupViewSet)

# Wire up our API using automatic URL routing.
urlpatterns = [
    path('api/', include(router.urls)),
    path('api/refresh-data/<str:game_code>/', views.CSVUploadAndProcessView.as_view(), name='refresh-data'),
    path('api/analytics/<str:game_code>/<str:measurement>/', views.AnalyticsView.as_view()),
    path('api/user-stats/<str:game_code>/', views.UserStatisticsView().as_view()),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
