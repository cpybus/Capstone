from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'1/', views.index1, name='index1'),
    url(r'2/', views.index2, name='index2'),
    url(r'aircraft/', views.aircraftInfo, name='aircraftInfo'),
    url(r'analyze/', views.analyze, name='analyze'),
    url(r'(?i)databaseImage/', views.databaseImage, name='databaseImage'),
]
