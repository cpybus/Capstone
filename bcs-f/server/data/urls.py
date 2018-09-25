from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index),
    url(r'aircraft/(?P<AircraftIcao>[a-zA-Z0-9]{0,6})', views.AircraftInfoIcao),
    url(r'airport/(?P<AirportIcao>[a-zA-Z0-9]{4})', views.AirportInfoIcao),
    url(r'airport/(?P<AirportIata>[a-zA-Z0-9]{3})', views.AirportInfoIata),
]
