from django.shortcuts import HttpResponse, get_object_or_404
from django.http import JsonResponse
from data.models import Aircraft, Airport, Trace
from django.core import serializers
import json

# Default landing page
# /data
def index(request):
    return HttpResponse('Hello, World!')

# View information on a specfic aircraft
# /data/aircraft/<AircraftIcao>
def AircraftInfoIcao(request, AircraftIcao):
    obj = get_object_or_404(Aircraft, Icao=AircraftIcao.upper())
    data = serializers.serialize('json', [obj])
    return JsonResponse(data, safe=False)

# View information on a specific airport by icao
# /data/airport/<AirportIcao>
def AirportInfoIcao(request, AirportIcao):
    obj = get_object_or_404(Airport, Icao=AirportIcao.upper())
    data = serializers.serialize('json', [obj])
    return JsonResponse(data, safe=False)

# View information on a specific airport by iata
# /data/airport/<AirportIata>
def AirportInfoIata(request, AirportIata):
    obj = get_object_or_404(Airport, Iata=AirportIata.upper())
    data = serializers.serialize('json', [obj])
    return JsonResponse(data, safe=False)

