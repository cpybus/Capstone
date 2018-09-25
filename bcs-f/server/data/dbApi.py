from django.db import connection
import time

# Returns the Icao of all Aircraft with known sources and
# destinations as well as the lat/lng of the source
# and destination
def getSourceDest():
    cursor = connection.cursor()
    cursor.execute("""
        SELECT
            x.Icao,
            a.Lat AS SourceLat,
            a.Lng AS SourceLng,
            b.Lat AS DestLat,
            b.Lng AS DestLng
        FROM
            data_airport a,
            data_airport b,
            data_aircraft x
        WHERE
            x.SourceAirport_id = a.Icao AND
            x.DestAirport_id = b.Icao;
    """)
    return {x[0]: {
                'SourceLat':float(x[1]),
                'SourceLng':float(x[2]),
                'DestLat':float(x[3]),
                'DestLng':float(x[4]) }
            for x in cursor.fetchall() }

# Returns data from the most recent Trace for all Aircraft
def getLastKnownTraces():
    cursor = connection.cursor()
    cursor.execute("""
        SELECT
            t.Aircraft_id,
            t.Lat,
            t.Lng,
            t.Trak,
            t.Alt,
            t.Spd
        FROM
            data_trace t
        INNER JOIN
            (
                SELECT Aircraft_id, MAX(Timestamp) AS mostrecent
                FROM data_trace
                GROUP BY Aircraft_id
            ) x
        ON
            t.Aircraft_id = x.Aircraft_id AND
            t.Timestamp = x.mostrecent;
    """)
    return { x[0]: {
                'Lat':float(x[1]),
                'Lng':float(x[2]),
                'Trak':float(x[3]),
                'Alt':int(x[4]) if x[4] else None,
                'Spd':float(x[5]) if x[5] else None }
            for x in cursor.fetchall() }

# Performs an update of the ThreatAssessment for each Aircraft
# given in AircraftData
def updateThreatLevels(AircraftData):
    cursor = connection.cursor()

    threats = [(
        ac[0],
        ac[1]['ThreatLevel'],
        ac[1]['ThreatContributions']['PathDev'],
        ac[1]['ThreatContributions']['HeadingDev'],
        ac[1]['ThreatContributions']['Alt'],
        ac[1]['ThreatContributions']['Spd']
    ) for ac in AircraftData.items()]

    cursor.executemany("""
        INSERT INTO data_threatassessment
            (Aircraft_id, ThreatLevel, PathDevThreatContribution, HeadingDevThreatContribution,
            AltThreatContribution, SpdThreatContribution)
        VALUES
            (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            ThreatLevel = VALUES(ThreatLevel),
            PathDevThreatContribution = VALUES(PathDevThreatContribution),
            HeadingDevThreatContribution = VALUES(HeadingDevThreatContribution),
            AltThreatContribution = VALUES(AltThreatContribution),
            SpdThreatContribution = VALUES(SpdThreatContribution);
    """, threats)

# Returns data from the most recent Trace for the given Aircraft Icao
def getLastKnownTrace(AircraftIcao):
    cursor = connection.cursor()
    cursor.execute("""
        SELECT
            t.Lat,
            t.Lng,
            t.Trak,
            t.Alt,
            t.Spd
        FROM
            data_aircraft a,
            data_trace t
        WHERE
            a.Icao = %s AND
            t.Aircraft_id = a.Icao
        ORDER BY
            t.Timestamp DESC
        LIMIT
            1;
    """, [AircraftIcao])
    result = cursor.fetchall()[0]
    return {
            'Lat':float(result[0]),
            'Lng':float(result[1]),
            'Trak':float(result[2]),
            'Alt':int(result[3]) if result[3] else None,
            'Spd':float(result[4]) if result[4] else None }

# Given an acList from VirtualRadar, store any new Operator information
# in the database
def addNewOperators(acList):
    cursor = connection.cursor()

    # construct a list of VALUES tuples
    operators = [(
        ac['OpIcao'][:3],
        ac['Op'][:100] if 'Op' in ac.keys() else None
    ) for ac in acList if 'OpIcao' in ac.keys()]

    cursor.executemany("""
        INSERT IGNORE INTO data_operator
            (Icao, Name)
        VALUES
            (%s, %s);
    """, operators)

# Given an acList from VirtualRadar, store any new Model information
# in the database
def addNewModels(acList):
    cursor = connection.cursor()

    # construct a list of VALUES tuples
    models = [(
        ac['Type'][:4],
        ac['Man'][:100] if 'Man' in ac.keys() else None,
        ac['Mdl'][:100] if 'Mdl' in ac.keys() else None
    ) for ac in acList if 'Type' in ac.keys()]

    cursor.executemany("""
        INSERT IGNORE INTO data_model
            (Icao, Man, Name)
        VALUES
            (%s, %s, %s);
    """, models)

# Given an acList from VirtualRadar, store any new Aircraft information
# in the database or update entries that already exist
def addNewAircraft(acList):
    cursor = connection.cursor()

    # construct a list of VALUES tuples
    aircraft = [(
        ac['Icao'][:6],
        ac['Reg'][:6] if 'Reg' in ac.keys() else None,
        ac['OpIcao'][:3] if 'OpIcao' in ac.keys() else None,
        ac['Type'][:4] if 'Type' in ac.keys() else None,
        ac['From'].split(' ')[0] if 'From' in ac.keys() else None,
        ac['To'].split(' ')[0] if 'To' in ac.keys() else None,
    ) for ac in acList if ('Lat' in ac.keys() and 'Long' in ac.keys() and 'Trak' in ac.keys() and 'Icao' in ac.keys())]

    cursor.executemany("""
        INSERT INTO data_aircraft
            (Icao, Reg, Operator_id, Model_id, SourceAirport_id, DestAirport_id)
        VALUES
            (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            Reg = COALESCE(Reg,VALUES(Reg)),
            Operator_id = COALESCE(Operator_id,VALUES(Operator_id)),
            Model_id = COALESCE(Model_id,VALUES(Model_id)),
            SourceAirport_id = COALESCE(VALUES(SourceAirport_id),SourceAirport_id),
            DestAirport_id = COALESCE(VALUES(DestAirport_id),DestAirport_id);
    """, aircraft)

    return aircraft

# Given an acList from VirtualRadar, store any new Trace information
# in the database
def addNewTraces(acList):
    cursor = connection.cursor()

    # construct a list of VALUES tuples
    traces = [(
        float(ac['Lat']),
        float(ac['Long']),
        float(ac['Trak']),
        int(ac['Alt']) if 'Alt' in ac.keys() else None,
        float(ac['Spd']) if 'Spd' in ac.keys() else None,
        time.strftime('%Y-%m-%d %H:%M:%S'),
        None,
        ac['Icao']
    ) for ac in acList if ('Lat' in ac.keys() and 'Long' in ac.keys() and 'Trak' in ac.keys() and 'Icao' in ac.keys())]

    cursor.executemany("""
        INSERT INTO data_trace
            (Lat, Lng, Trak, Alt, Spd, Timestamp, UnknownId, Aircraft_id)
        VALUES
            (%s, %s, %s, %s, %s, %s, %s, %s);
    """, traces)

    return traces
