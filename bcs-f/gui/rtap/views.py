from django.shortcuts import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render

def index1(request):
    return render(request, 'rtap/index1.html', {})

def index2(request):
    return render(request, 'rtap/index2.html', {})

def aircraftInfo(request):
    return render(request, 'rtap/aircraftInfo.html', {})

def analyze(request):
    return render(request, 'rtap/analyze.html', {})

def databaseImage(request):
    json_data = open('rtap/static/rtap/data/databaseImage.json', 'r').read()
    return JsonResponse(json_data, safe=False)
