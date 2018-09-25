from __future__ import unicode_literals

from django.db import models

# Defines the model for Airports worldwide
class Airport(models.Model):
    Icao    = models.CharField(max_length=4, primary_key=True)    # icao code of the airport 
    Iata    = models.CharField(max_length=3)                      # iata code of the airport
    Name    = models.CharField(max_length=100)                    # name of the airport, may or may not include city
    City    = models.CharField(max_length=100)                    # city  in which the airport is located
    Country = models.CharField(max_length=100)                    # country in which the airport is located
    Lat     = models.DecimalField(max_digits=9, decimal_places=6) # decimal latitude of the airport
    Lng     = models.DecimalField(max_digits=9, decimal_places=6) # decimal longitude of the airport
    Alt     = models.IntegerField()                               # altitude of the airport in feet

# Defines the model for an operator in the system
class Operator(models.Model):
    Icao = models.CharField(max_length=3, primary_key=True) # icao code of the operator
    Name = models.CharField(max_length=100, blank=True)     # name of the operator (airline)

# Defines the model for a model of Aircraft in the system
class Model(models.Model):
    Icao = models.CharField(max_length=4, primary_key=True) # icao type code
    Man = models.CharField(max_length=100, blank=True)      # the manufacturer's name
    Name = models.CharField(max_length=100, blank=True)     # description of aircraft model

# Defines the model for a single Aircraft in the system
class Aircraft(models.Model):
    Icao   = models.CharField(max_length=6, primary_key=True) # icao code of the aircraft
    Reg    = models.CharField(                                # registration code
        max_length=6,
        blank=True, null=True)       
    Operator = models.ForeignKey(                             # Operator of this aircraft
        Operator,
        on_delete=models.CASCADE,
        related_name='aircraft',
        blank=True, null=True)
    Model  = models.ForeignKey(                               # Model of this aircraft
        Model,
        on_delete=models.CASCADE,
        related_name='aircraft',
        blank=True, null=True)
    SourceAirport = models.ForeignKey(                        # airport of departure
        Airport,
        on_delete=models.CASCADE,
        related_name='departures',
        blank=True, null=True)
    DestAirport   = models.ForeignKey(                        # destination airport
        Airport,
        on_delete=models.CASCADE,
        related_name='arrivals',
        blank=True, null=True)

# Stores the threat information for each aircraft. 
# This is in its own table to cut down on / prevent 
# database deadlock on the Aircraft table
class ThreatAssessment(models.Model):
    Aircraft  = models.ForeignKey(                            # Aircraft for which this threat information is stored
        Aircraft,
        on_delete=models.CASCADE,
        related_name='threat_assessments',
        primary_key=True)  
    ThreatLevel   = models.DecimalField(                      # threat level from 0 - 10
        max_digits=10,
        decimal_places=8,
        default=0)
    PathDevThreatContribution = models.DecimalField(          # contribution to threat level from path deviation
        max_digits=10,
        decimal_places=8,
        default=0)
    HeadingDevThreatContribution = models.DecimalField(       # contribution to threat level from heading deviation
        max_digits=10,
        decimal_places=8,
        default=0)
    AltThreatContribution   = models.DecimalField(            # contribution to threat level from altitude
        max_digits=10,
        decimal_places=8,
        default=0)
    SpdThreatContribution   = models.DecimalField(            # contribution to threat level from speed
        max_digits=10,
        decimal_places=8,
        default=0)
    
# Defines the model for tracking an Aircraft's movements in Flight
class Trace(models.Model):
    Timestamp = models.DateTimeField(auto_now_add=True)             # timestamp at which the trace data was added
    Aircraft  = models.ForeignKey(                                  # Aircraft for which this trace information is stored
        Aircraft,
        on_delete=models.CASCADE,
        related_name='traces',
        blank=True, null=True)
    UnknownId = models.IntegerField(blank=True, null=True)          # used in the event of an unknown aircraft
    Lat       = models.DecimalField(max_digits=9, decimal_places=6) # latitude over the ground
    Lng       = models.DecimalField(max_digits=9, decimal_places=6) # longitude over the ground
    Trak      = models.DecimalField(max_digits=4, decimal_places=1) # track angle across the ground, clockwise from 0 degrees north
    Alt       = models.IntegerField(blank=True, null=True)          # altitude in feet
    Spd       = models.DecimalField(max_digits=6,                   # ground speed in knots
                    decimal_places=1, blank=True, null=True)
