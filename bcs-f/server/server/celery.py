from __future__ import absolute_import
import os
from celery import Celery, Task
from django.conf import settings
import requests
import json
import django
from datetime import *
from zeroless import Server
from multiprocessing.managers import BaseManager
from django.core import serializers
import json
import data.dbApi as db
import data.threatMonitoring as tm

# fetch the publisher singleton which contains the remote connection
class PublisherManager(BaseManager): pass
PublisherManager.register('get_publisher')
manager = PublisherManager(address=('localhost', 50000), authkey=b'mitre')
manager.connect()
publisher = manager.get_publisher()

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
app = Celery('server')

# Using a string here means the worker will not have to
# pickle the object when using Windows.
app.config_from_object('django.conf:settings')

# Cannot import django models until settings are configured
# and apps loaded
django.setup()
from data.models import *

@app.task(bind=True)
def debug_task(self):
        print('Request: {0!r}'.format(self.request))

# Adds all the periodic tasks to the beat schedule
# once the app has been configured
@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(timedelta(seconds=10), taskUpdateEADS, name='UpdateEADS', ignore_result=True)
    sender.add_periodic_task(timedelta(seconds=10), taskUpdateSEADS, name='UpdateSEADS', ignore_result=True)
    sender.add_periodic_task(timedelta(seconds=10), taskUpdateWADS, name='UpdateWADS', ignore_result=True)
    sender.add_periodic_task(timedelta(hours=8), taskClearTraces, name='ClearTraces', ignore_result=True)
    sender.add_periodic_task(timedelta(seconds=10), taskPublishThreatLevels, name='PublishThreatLevels', ignore_result=True)

# Returns True if the data contains at least the
# minimum required fields
def hasRequiredData(data):
    keys = data.keys()
    if 'Lat' not in keys:
        return False
    if 'Long' not in keys:
        return False
    if 'Trak' not in keys:
        return False
    return True

# This function periodically pulls data from VirtualRadar.
@app.task
def taskUpdateEADS():
    updateDatabase(43.220259, -75.411311)

# This function periodically pulls data from VirtualRadar.
@app.task
def taskUpdateSEADS():
    updateDatabase(30.079703, -85.606772)

# This function periodically pulls data from VirtualRadar.
@app.task
def taskUpdateWADS():
    updateDatabase(47.110015, -122.529190)

# Periodic task to prevent disk overload by deleting old data
@app.task
def taskClearTraces():
    td = timedelta(days=1)
    delete_before = (datetime.now(timezone.utc) - td)
    # delete all trace data from before the current time minus td
    Trace.objects.filter(Timestamp__lt=delete_before).delete()

# Periodic task to calculate threat levels for aircraft in the database
# and send the new ThreatLevels to the UI
@app.task
def taskPublishThreatLevels():
    aircraft_data = tm.run()

    for icao, data in aircraft_data.items():
        message_data = json.dumps({'Icao':icao, 'ThreatLevel':data['ThreatLevel'], 'ThreatContributions':data['ThreatContributions']})
        publisher.send(bytearray(message_data, 'utf8'))

# This function pulls data from VirtualRadar.
# The data is parsed, checked for required data, stored in
# the database, and sent to the UI
def updateDatabase(lat, lng):
    # set up filtering params for the query
    params = {
        'lat': lat,
        'lng': lng,
        'fDstU': 250,               # less than 200 miles from coordinates
        'User-Agent': 'Mozilla/5.0' # prevent http forbidden error
    }

    # construct the url and perform the request
    url = 'http://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?'
    response = requests.get(url=url, params=params)
    data = json.loads(response.text)

    # write the new data to the database
    db.addNewOperators(data['acList'])
    db.addNewModels(data['acList'])
    new_aircraft = db.addNewAircraft(data['acList'])
    new_traces = db.addNewTraces(data['acList'])

    # send the data to the UI
    for idx, ac in enumerate(new_aircraft):
        aircraft_data = json.dumps({
            'Icao':ac[0],
            'Reg':ac[1],
            'Operator':ac[2],
            'Model':ac[3],
            'SourceAirport':ac[4],
            'DestAirport':ac[5],
            'Trace':{
                'Lat':new_traces[idx][0],
                'Lng':new_traces[idx][1],
                'Trak':new_traces[idx][2],
                'Alt':new_traces[idx][3],
                'Spd':new_traces[idx][4],
                'Timestamp':new_traces[idx][5],
                'UnknownId':new_traces[idx][6]
            }
        })
        publisher.send(bytearray(aircraft_data, 'utf8'))

