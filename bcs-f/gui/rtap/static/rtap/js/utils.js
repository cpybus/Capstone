/*

The utils object serves as a module which contains reusable
utility functions. These are functions which may be used by
multiple other modules or are used for demo purposes. This file
should be loaded on every page within the system in order to ensure
other features work as intended.

*/

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

var utils = {

    // ----------------------------------------------------
    // Converts trace information from json to an array of
    // {lat: val, lng: val} objects
    // ----------------------------------------------------
    tracesToCoordArray: function(traces) {
        coords = [];
        $.each(traces, function(idx, trace) {
            coords.push({lat: parseFloat(trace['Lat']), lng: parseFloat(trace['Lng'])});
        });
        return coords;
    },

    // ----------------------------------------------------
    // Loads json database snapshot from the server and calls display function
    // ----------------------------------------------------
    loadDatabaseSnapshot: function(app) {
        $.getJSON("http://localhost:8000/rtap/databaseImage", function(response) {
            app.map.dataset = JSON.parse(response);
            utils.displayDatabaseSnapshot(app);

        });
    },

    // ----------------------------------------------------
    // Parses a json database snapshot and adds markers to the map
    // ----------------------------------------------------
    displayDatabaseSnapshot: function(app) {
        $.each(app.map.dataset, function(icao, aircraft_data) {
            traces = aircraft_data['traces'];
            last_known_trace = traces[traces.length-1];
            lat = parseFloat(last_known_trace['Lat']);
            lng = parseFloat(last_known_trace['Lng']);
            trak = parseFloat(last_known_trace['Trak']);
            app.map.createAircraftMarker(icao, lat, lng, trak,app);
        });
    },

    // ----------------------------------------------------
    // The Haversine formula returns the great-circle distance
    // (read: the shortest distance between two points on a sphere)
    // between two points on a sphere given their
    // longitudes and latitudes.
    // ----------------------------------------------------
    haversine: function(p1,p2) {
        var phi1 = p1['lat'].toRad();
        var phi2 = p2['lat'].toRad();

        var deltaPhi = (p2['lat']- p1['lat']).toRad();
        var deltaLambda = (p2['lng']- p1['lng']).toRad();

        // It's slightly faster to do x*x instead of x^2
        return Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    },

    // ----------------------------------------------------
    //  Given two points, return their distance to each other on the Earth
    // ----------------------------------------------------
    distBetweenTwoPoints: function(p1,p2,units) {
        var R;
        if (units == "miles"){
            R = 3959;
        }
        else if (units == "km"){
            R = 6371; // Radius of the Earth in km!
        }

        var haversineResults = utils.haversine(p1,p2);
        var a = 2 * Math.atan2(Math.sqrt(haversineResults), Math.sqrt(1-haversineResults));

        return R*a;
    }

};
