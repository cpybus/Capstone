import math
import numpy as np
from .dbApi import *

# Returns the angle between two points clockwise from
# 0 degrees north
def anglePointToPoint(x0, y0, x1, y1):
    m = (y1-y0)/(x1-x0)
    return math.degrees(math.atan(m))

# Returns the minimum distance from a point (x0, y0) to a line
# segment passing through two other points (x1, y1) (x2, y2)
def distancePointToSegment(x0, y0, x1, y1, x2, y2):
    numerator = abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1)
    denominator = math.sqrt(((y2-y1)**2) + ((x2-x1)**2))
    if (denominator != 0):
        return numerator / denominator
    else:
        return 0


# Returns the absolute difference between the heading of an aircraft
# and the heading necessary to fly directly towards its destination
def calculateHeadingDeviation(loc_data, source_dest_data):
    correct_heading = anglePointToPoint(
        loc_data['Lng'], loc_data['Lat'],
        source_dest_data['DestLng'], source_dest_data['DestLat']
    )
    return abs(loc_data['Trak'] - correct_heading)


# Returns the distance that an aircraft has veered from
# a straight line between its source and destination airports
# using Haversine
def calculatePathDeviation(loc_data, source_dest_data):
    phi1 = loc_data['Lat']
    phi2 = source_dest_data['SourceLat']
    deltaPhi = source_dest_data['SourceLat'] - loc_data['Lat']
    deltaLambda = source_dest_data['SourceLng'] - loc_data['Lng']
    retval = (math.sin(deltaPhi/2)**2) + (math.cos(phi1) * math.cos(phi2) * math.sin(deltaLambda/2) * math.sin(deltaLambda/2))
    return retval

# Converts a dict of arbitrary weights to relative percentages
def weightsToPercentages(weights):
    total = sum(weights.values())
    weights.update((key, float(val)/total) for key,val in weights.items())
    return weights

# This function assigns a threat level between 0 and 10 based on
# metrics and associated weights given in the 'weights' argument. 
# Within 'aircraft_data', there must be a key for each aircraft
# which matches the name of the metric. Fence values are calculated
# for each metric and threat level increases the further an aircraft
# deviates beyond the fence value.
def outlierThreatDetection(aircraft_data, weights, mode=0):

    # Convert each weight to a percentage to ensure threats sums to 10
    weights = weightsToPercentages(weights)

    # Perform outlier calculations for each metric given a weight
    for metric, weight in weights.items():

        # Pull the relevant data out of the aircraft_data dictionary
        metric_data = np.array([aircraft[metric] for aircraft in
            aircraft_data.values() if aircraft[metric] is not None])

        # Calculate statistics
        maximum = np.max(metric_data)
        minimum = np.min(metric_data)
        lowerQuartile, upperQuartile = np.percentile(metric_data, [25,75])
        IQR = upperQuartile - lowerQuartile

        # Calculate outlier boundaries
        #lowerFence = lowerQuartile - IQR*1.5   # anything less is an outlier
        #upperFence = upperQuartile + IQR*1.5   # anything more is an outlier

        # THESE VALUES ARE BEING USED JUST TO FORCE THREATS FOR THE SAKE OF DEMOING
        lowerFence = lowerQuartile
        upperFence = upperQuartile

        # Determine threat level based on outlier boundaries for this metric
        for aircraft_icao,  data in aircraft_data.items():
            data['ThreatContributions'][metric] = 0
            if data[metric] is not None:
                if data[metric] < lowerFence and (mode == 0 or mode == 2): # low outliers
                    outlierScore = (lowerFence-data[metric])/(lowerFence-minimum)
                    threatContribution = 10*weight*outlierScore
                    data['ThreatLevel'] += threatContribution
                    data['ThreatContributions'][metric] = threatContribution
                if data[metric] > upperFence and (mode == 0 or mode == 1): # high outliers
                    outlierScore = (data[metric]-upperFence)/(maximum-upperFence)
                    threatContribution = 10*weight*outlierScore
                    data['ThreatLevel'] += threatContribution
                    data['ThreatContributions'][metric] = threatContribution

# Main processing function which is executed periodically as a Celery task
def run():

    # Get data from most recent Trace for each aircraft in database
    aircraft_data = getLastKnownTraces()

    # Get source/destination data for aircraft which this is known
    aircraft_source_dest = getSourceDest()

    # Calculate path and heading deviations where possible
    for aircraft_icao, loc_data in aircraft_data.items():

        # Assign a 'no threat' basis to each aircraft
        loc_data['ThreatLevel'] = 0
        loc_data['ThreatContributions'] = {}

        # If source and destination are known, perform calculation
        if aircraft_icao in aircraft_source_dest.keys():
            path_dev = calculatePathDeviation(loc_data, aircraft_source_dest[aircraft_icao])
            heading_dev = calculateHeadingDeviation(loc_data, aircraft_source_dest[aircraft_icao])

            # Add the calculated values to the aircraft data
            loc_data['PathDev'] = path_dev
            loc_data['HeadingDev'] = heading_dev

        else:
            # Add None placeholders if source/destination unknown
            loc_data['PathDev'] = None
            loc_data['HeadingDev'] = None         

    # Perform outlier threat detection with equal weighting across metrics
    weights = {'PathDev':1, 'HeadingDev':1, 'Alt':1, 'Spd':1}
    outlierThreatDetection(aircraft_data, weights)

    # Write the new threat levels to the database
    updateThreatLevels(aircraft_data)

    # Return the new data so it can be published to the UI
    return aircraft_data

