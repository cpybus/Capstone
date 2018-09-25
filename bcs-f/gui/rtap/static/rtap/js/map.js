/*

This function creates a Map object which contains the functions and
variables necessary to display an operational BCS-F map.

*/

function Map(app){

    var self = this;

    // --------------------------------------------------------
    // Creates the google map instance and initializes other
    // member variables
    // --------------------------------------------------------
    self.initialize = function(app) {

        var RPI = {lat: 42.730093, lng: -73.678819};
        self.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 8,
            center: RPI,
            //controlUI.style.backgroundColor = "#000";
            mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
              mapTypeIds: ['roadmap', 'terrain','satellite'],
              position: google.maps.ControlPosition.RIGHT_BOTTOM
            },
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            },
            streetViewControl: false,
            rotateControl: true,
        });

        self.app = app;
        // associative array for storing marker by icao
        self.markers = new Object;
        // keeps track of the 'active' marker whose info is displayed
        self.activeMarker = null;
        // stores all of the data for display on the map
        self.dataset = {};
        // true if in night mode, otherwise false
        self.nightMode = false;

        // keeps track of pressing and releasing of the shift key
        self.shiftKey = false;
        window.onkeydown = function(e) {
            self.shiftKey = ((e.keyIdentifier == 'Shift') || (e.shiftKey == true));
        }
        window.onkeyup = function(e) {
            self.shiftKey = false;
        }

    }

    // --------------------------------------------------------
    // Creates an aircraft marker, places it on the map, adds the
    // on click listener, and stores the marker
    // --------------------------------------------------------
    self.createAircraftMarker = function(icao, lat, lng, trak,app){
        var color;
        if (self.nightMode){
            color = '#fff';
        } else{
            color = '#000'
        }

        var marker =  new google.maps.Marker({
            position: {lat: lat, lng: lng},
            map: self.map,
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                rotation: trak,
                strokeColor: color,
            },
        });
        marker.icao = icao;
        marker.addListener('click', function() {
            self.aircraftMarkerOnClick(marker);
        });
        marker.addListener('rightclick', function() {
            self.app.comparisonTable.compare(icao);
        });
        self.markers[icao] = marker;

    }

    self.createSectorMarker = function(name, lat, lng){
        var color = '#fff';
        var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            icon: iconBase + 'http://images.clipartpanda.com/radar-clipart-parabolic_antenna_BW.png'
          });
    }

    // --------------------------------------------------------
    // Sets the stroke color for a marker and redraws it using
    // the new color
    // --------------------------------------------------------
    self.setMarkerColor = function(marker,color){
        marker.icon.strokeColor = color;
        marker.setIcon(marker.icon);
    }

    // --------------------------------------------------------
    // Moves the given marker to the new location and rotation
    // --------------------------------------------------------
    self.setMarkerPosition = function(marker, lat, lng, trak) {
        new_loc = new google.maps.LatLng(lat,lng);
        marker.setPosition(new_loc);
        marker.icon.rotation = trak;
        marker.setIcon(marker.icon);
        if(marker.traceDisplayed == true) {
            marker.trace.getPath().push(new_loc);
        }
    }

    // --------------------------------------------------------
    // Function for when an aircraft marker is clicked
    // --------------------------------------------------------
    self.aircraftMarkerOnClick = function(marker) {
        console.log(marker.icao);

        if(self.shiftKey) {
            // on shift click, just toggle the trace display
            self.toggleTraceDisplay(marker);
            return;
        } else if(self.activeMarker == marker) {
            // don't update info panel if marker already active
            self.map.panTo(marker.getPosition());
            return;
        }

        // reset the previously clicked marker to it's default color
        if(self.activeMarker !== null) {
            self.setMarkerColor(self.activeMarker, (self.nightMode ? 'white':'black'));
        }

        // set the newly clicked marker as active
        self.activeMarker = marker;
        self.map.panTo(marker.getPosition());
        self.setMarkerColor(marker, 'red');

        // grab the associated data and display it in the panel
        aircraft_data = self.dataset[marker.icao];
        self.app.aircraftInfoPanel.update(aircraft_data, marker.icao);

    }

    // --------------------------------------------------------
    // Toggles the trace data display for the given marker
    // --------------------------------------------------------
    self.toggleTraceDisplay = function(marker) {
        if(marker.traceDisplayed == true) {
            marker.trace.setMap(null);
            marker.traceDisplayed = false;
        } else {
            aircraft_data = self.dataset[marker.icao];
            traces = aircraft_data['traces'];
            coords = utils.tracesToCoordArray(traces);
            marker.trace = new google.maps.Polyline({
                path: coords,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map: self.map
            });
            marker.traceDisplayed = true;
        }
    }

    // ----------------------------------------------------
    // Toggles the map styling between night mode and standard
    // ----------------------------------------------------
    self.toggleNightMode = function(){

        if(self.nightMode) {

            // invert panel coloring
            $('.dark').switchClass('dark', 'light');
            $('.darker').switchClass('darker', 'lighter');

            // change map style
            self.map.setOptions({'styles':[]});

            // invert new tab icon
            $('#aircraft-info-panel .icon').attr("src", "../../static/rtap/img/new_tab.png");

            // change marker colors
            for (var icao in self.markers){
                var marker = self.markers[icao];
                if(marker != self.activeMarker && !(icao in self.app.comparisonTable.aircraft)){
                    self.setMarkerColor(marker, 'black');
                }
            }

        } else {

            // invert panel coloring
            $('.light').switchClass('light', 'dark');
            $('.lighter').switchClass('lighter', 'darker');

            // change map style
            self.map.setOptions({'styles':nightMode});

            // invert new tab icon
            $('#aircraft-info-panel .icon').attr("src", "../../static/rtap/img/new_tab_white.png");

            // change marker colors
            for (var icao in self.markers){
                var marker = self.markers[icao];
                if(marker != self.activeMarker && !(icao in self.app.comparisonTable.aircraft)){
                    self.setMarkerColor(marker, 'white');
                }
            }

        }

        self.nightMode = !self.nightMode;
        //self.app.aoi.updateTable();
    }

    // initialize upon creation
    self.initialize(app);

}
