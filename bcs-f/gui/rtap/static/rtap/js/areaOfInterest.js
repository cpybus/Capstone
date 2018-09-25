/*

This function accepts a Map object and adds the ability
for a BCS-F operator to select an area of interest.

*/

function Aoi(app){

    var self = this;

    // ----------------------------------------------------
    // Creates a drawing manager for the map and adds
    // the event listener for creating new AOIs
    // ----------------------------------------------------
    self.initialize = function(app) {

        self.app = app;
        self.map = app.map;
        self.table = $('#alerts-table');
        self.polygons = {};
        self.max_queue_length = 5;

        // create the drawingManager instance and add to map
        self.drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: false
        });
        self.drawingManager.setMap(app.map.map);

        // create a listener for when a new area of interest polygon is drawn
        google.maps.event.addListener(self.drawingManager, 'polygoncomplete', function(polygon) {
            self.drawingManager.setDrawingMode(null);
            self.processNewAreaOfInterest(polygon);
        });

        // dialog for editing AOI settings
        self.dialog = $( "#aoi-dialog" ).dialog({
            autoOpen: false,
            height: 400,
            width: 350,
            modal: true,
            buttons: {
                "Submit": self.updateAoiSettings,
                Cancel: function() {
                    self.dialog.dialog( "close" );
                }
            },
                close: function() {
                    form[ 0 ].reset();
            }
        });

        form = self.dialog.find( "form" ).on( "submit", function( event ) {
            event.preventDefault();
            self.updateAoiSettings();
        });

    }

    // ----------------------------------------------------
    // Returns the lowest available ID for a new AOI
    // ----------------------------------------------------
    self.getUsableId = function(){
        var i = 0;
        while(i in self.polygons) { i++; }
        return i;
    }

    // ----------------------------------------------------
    // Function which can be called to enter AOI creation mode
    // ----------------------------------------------------
    self.create = function() {
        self.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }

    // ----------------------------------------------------
    // Automatically called when a polygon is created to set it up as an AOI
    // ----------------------------------------------------
    self.processNewAreaOfInterest = function(polygon) {

        polygon.id = self.getUsableId();
        polygon.containedMarkers = {};
        polygon.infoWindow = null;
        polygon.minAlt = null;
        polygon.maxAlt = null;

        polygon.addListener('click', function() {
            self.delete(this);
        });
        polygon.addListener('mouseover', function(){
            self.mouseOver(this);
        });
        polygon.addListener('mouseout', function(){
            self.mouseOut(this);
        });
        polygon.addListener('rightclick', function(){
            self.dialog.polygon = this;
            self.dialog.dialog( "open" );
        });

        self.polygons[polygon.id] = polygon;

        self.checkAllMarkersInsidePolygon(polygon);
    }

    // ---------------------------------------------------
    // This function is called when a new AOI is created
    // and checks all markers against it
    // ---------------------------------------------------
    self.checkAllMarkersInsidePolygon = function(polygon){
        for (var icao in self.map.dataset){
            var data = self.map.dataset[icao];
            var last_known_loc = data['traces'][data['traces'].length-1];
            markerLatLng = new google.maps.LatLng({lat: last_known_loc["Lat"], lng: last_known_loc["Lng"]});
            if (google.maps.geometry.poly.containsLocation(markerLatLng, polygon)){
                if(polygon.minAlt !== null && last_known_loc["Alt"] >= polygon.minAlt) {
                    if(polygon.maxAlt !== null && last_known_loc["Alt"] <= polygon.maxAlt) {
                        polygon.containedMarkers[icao] = true; // doesn't matter what value is, using as hash set
                    }
                }
            }
        }
    }

    // ---------------------------------------------------
    // This function is called when an AOI is clicked in
    // order to delete it and all associated alerts
    // ---------------------------------------------------
    self.delete = function(poly){
        poly.setMap(null);

        // delete rows from the alerts table for this polygon
        self.table.find('tr').each(function() {
            var polyID = $(this).find('td:first').html();
            if(polyID == poly.id.toString()) {
                $(this).remove();
            }
        });

        delete self.polygons[poly.id];
    }

    // ---------------------------------------------------
    // This function checks a single marker to see if it has
    // entered or exited a polygon
    // ---------------------------------------------------
    self.checkInsidePolygons = function(icao, data, surpress=false) {

        var last_known_loc = data['traces'][data['traces'].length-1];
        markerLatLng = new google.maps.LatLng({lat: last_known_loc["Lat"], lng: last_known_loc["Lng"]});

        for (var id in self.polygons){
            polygon = self.polygons[id];

            // check if was previously inside the polygon
            var prev_contained = (icao in polygon.containedMarkers);

            // check if now inside the polygon
            var now_contained = (google.maps.geometry.poly.containsLocation(markerLatLng, polygon));
            if(polygon.minAlt !== null && last_known_loc["Alt"] < polygon.minAlt) {
                now_contained = false;
            }
            if(polygon.maxAlt !== null && last_known_loc["Alt"] > polygon.maxAlt) {
                now_contained = false;
            }

            if(prev_contained != now_contained) {
                if(prev_contained) {
                    delete polygon.containedMarkers[icao];
                    // publish EXITED alert
                    self.publishAlert(id, icao, "Exited");
                } else {
                    polygon.containedMarkers[icao] = true; // doesn't matter what value is, using as hash set
                    // publish ENTERED alert
                    self.publishAlert(id, icao, "Entered");
                }
            }

        }
    }

    // ---------------------------------------------------
    // Utility function to change active marker on table click
    // ---------------------------------------------------
    self.onClick = function(icao) {
        //console.log(self.app);
        self.app.map.aircraftMarkerOnClick(self.app.map.markers[icao]);
    }

    // ---------------------------------------------------
    // Adds an alert to the queue for the given polygon and icao
    // with the text given by alert_text
    // ---------------------------------------------------
    self.publishAlert = function(polyID, icao, alert_text) {
        if(self.table.find('tr').length == 0) {
            self.table.append('<tr onclick="app.aoi.onClick(\''+icao+'\')"><td class="poly-id" style="width:0" hidden>'+polyID+'</td><td>'+icao+'</td><td>'+alert_text+'</td></tr>');
            self.table.append('<tr class="table-spacer"></tr>');
        } else {
            self.table.find('tr:first').before('<tr class="table-spacer"></tr>');
            self.table.find('tr:first').before('<tr onclick="app.aoi.onClick(\''+icao+'\')"><td class="poly-id" style="width:0" hidden>'+polyID+'</td><td>'+icao+'</td><td>'+alert_text+'</td></tr>');
        }
        self.table.find('tr:first').addClass(self.map.nightMode?"darker hover":"lighter hover");

        // have to delete two rows to account for spacers
        while(self.table.find('tr').length > self.max_queue_length*2) {
            self.table.find('tr:last').remove();
            self.table.find('tr:last').remove();
        }
    }

    // ---------------------------------------------------
    // Computes the lat, lng center of a polygon
    // ---------------------------------------------------
    self.polygonCenter = function(poly) {
        var lowx,highx
        var lowy,highy
        var lats = []
        var lngs = []
        var vertices = poly.getPath();

        for(var i=0; i<vertices.length; i++) {
          lngs.push(vertices.getAt(i).lng());
          lats.push(vertices.getAt(i).lat());
        }

        lats.sort();
        lngs.sort();
        lowx = lats[0];
        highx = lats[vertices.length - 1];
        lowy = lngs[0];
        highy = lngs[vertices.length - 1];
        center_x = lowx + ((highx-lowx) / 2);
        center_y = lowy + ((highy - lowy) / 2);
        return (new google.maps.LatLng(center_x, center_y));
    }

    // ----------------------------------------------------
    // Called when the mouse moves over a polygon to display
    // its info window and higlight the corresponding alerts
    // ----------------------------------------------------
    self.mouseOver = function(polygon) {
        if(polygon.infoWindow !== null) { polygon.infoWindow.close(); }
        var infoWindow = new google.maps.InfoWindow();
        infoWindow.setContent('AOI ID: '+polygon.id+ (polygon.minAlt !== null ?'<br>Min Alt: '+polygon.minAlt: "") +(polygon.maxAlt !== null? '<br>Max Alt: '+polygon.maxAlt : ""));
        infoWindow.setPosition(self.polygonCenter(polygon));
        polygon.infoWindow = infoWindow;
        polygon.infoWindow.open(self.map.map);

        // highlight the corresponding alerts
        self.table.find('tr').each(function() {
            var polyID = $(this).find('td:first').html();
            if(polyID == polygon.id.toString()) {
                $(this).css('border-width', '6px');
            }
        });

    }

    // ----------------------------------------------------
    // Called when the mouse moves off a polygon to remove its
    // info window and restore the alerts to the default coloring
    // ----------------------------------------------------
    self.mouseOut = function(polygon) {
        setTimeout(function() {
            polygon.infoWindow.close();
            self.table.find('tr').each(function() {
                var polyID = $(this).find('td:first').html();
                if(polyID == polygon.id.toString()) {
                    $(this).css('border-width', '1px');
                }
            });
        }, 5000);
    }

    // ----------------------------------------------------
    // Called to update the aoi parameters on diaolog submition
    // ----------------------------------------------------
    self.updateAoiSettings = function() {

        var minAlt = $('#minAlt').val();
        var maxAlt = $('#maxAlt').val();

        if(minAlt !== '') {
            self.dialog.polygon.minAlt = parseInt(minAlt);
        } else {
            self.dialog.polygon.minAlt = null;
        }

        if(maxAlt !== '') {
            self.dialog.polygon.maxAlt = parseInt(maxAlt);
        } else {
            self.dialog.polygon.maxAlt = null;
        }

        // reset the contained markers in case they no longer meet criteria
        self.dialog.polygon.containedMarkers = {};
        self.checkAllMarkersInsidePolygon(self.dialog.polygon);

        self.dialog.dialog( "close" );
    }

    // initialize upon creation
    self.initialize(app);

}
