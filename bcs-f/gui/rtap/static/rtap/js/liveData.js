/*

This function accepts a Map object and adds live data
updating via a websocket connection back to the webserver.

*/

function LiveData(app){

    var self = this;

    // ---------------------------------------------------
    // Creates the websocket connection and adds the message listener
    // ---------------------------------------------------
    self.initialize = function(app) {
        self.app = app;
        self.map = app.map;
        self.socket = new WebSocket('ws://'+window.location.host+'/users/');

        self.socket.onopen = function(){
            console.log('WebSocket connected successfully.');
        }

        self.socket.onmessage = function message(event) {
            self.handleMessage(event);

        }

        if(self.socket.readyState == WebSocket.OPEN) {
            self.socket.onopen();
        }

        // set to clear data that's stale more than 30 seconds
        self.purgeOldData(30000);

    }


    // ---------------------------------------------------
    // Returns a if a is not null, else returns b
    // ---------------------------------------------------
    self.coalesce = function(a, b) {
        if(typeof(a) != 'object') { return a; }
        return b;
    }

    // ---------------------------------------------------
    // Given a message event, this function parses the data and
    // performs the necessary processing to use that data
    // ---------------------------------------------------
    self.handleMessage = function(event){
        try{
            var data = JSON.parse(event.data);
        }
        catch(error){
            console.log(event.data);
        }


        if (data.hasOwnProperty('connected')){
            // default message sent upon successful connection
        } else if(data.hasOwnProperty('ThreatLevel')) {
            // Aircraft ThreatLevel update message
            Icao = data['Icao'];
            // only care about threat levels for currently displayed aircraft
            if(Icao in self.map.dataset) {
                self.map.dataset[Icao]['ThreatLevel'] = data['ThreatLevel'];
                self.map.dataset[Icao]['ThreatContributions'] = data['ThreatContributions'];
                self.app.threatQueue.checkAircraft(Icao, data['ThreatLevel']);
            }
        } else {
            // Aircraft info update message

            new_trace = data['Trace'];
            Icao = data['Icao'];

            // update the existing marker
            if(Icao in self.map.dataset) {
                self.map.dataset[Icao].traces.push(new_trace);
                self.map.dataset[Icao]['Model'] = self.coalesce(self.map.dataset[Icao]['Model'], data['Model']);
                self.map.dataset[Icao]['Operator'] = self.coalesce(self.map.dataset[Icao]['Operator'], data['Operator'])
                self.map.dataset[Icao]['Reg'] = self.coalesce(self.map.dataset[Icao]['Reg'], data['Reg']);
                self.map.dataset[Icao]['SourceAirport'] = self.coalesce(self.map.dataset[Icao]['SourceAirport'], data['SourceAirport']);
                self.map.dataset[Icao]['DestAirport'] = self.coalesce(self.map.dataset[Icao]['DestAirport'], data['DestAirport']);
                self.map.dataset[Icao]['LastUpdate'] = Date.now();
                self.map.setMarkerPosition(
                    self.map.markers[Icao],
                    new_trace['Lat'],
                    new_trace['Lng'],
                    new_trace['Trak']
                );
                self.app.aoi.checkInsidePolygons(Icao, self.map.dataset[Icao]);
            // create a marker for this new aircraft
            } else {
                self.map.dataset[Icao] = {
                    'SourceAirport': data['SourceAirport'],
                    'DestAirport': data['DestAirport'],
                    'Operator': data['Operator'],
                    'Model': data['Model'],
                    'Reg': data['Reg'],
                    'traces': [new_trace],
                    'LastUpdate': Date.now()
                };


                self.map.createAircraftMarker(Icao, new_trace['Lat'], new_trace['Lng'], new_trace['Trak'], self.app);
                self.app.aoi.checkInsidePolygons(Icao, self.map.dataset[Icao]);
            }

            // update aircraft info panel if necessary
            if(self.map.activeMarker !== null && self.map.activeMarker.icao == Icao) {
                self.app.aircraftInfoPanel.update(self.map.dataset[Icao], Icao);
            }

        }

    }

    // ---------------------------------------------------
    // Every 5 seconds, this function is executed and deletes
    // markers and data for which new data has not been received
    // in the last delta milliseconds
    // ---------------------------------------------------
    self.purgeOldData = function(delta) {
        for(var Icao in self.map.dataset) {
            last_update = self.map.dataset[Icao]['LastUpdate'];
            if((Date.now() - last_update) > delta) {
                if(self.map.markers[Icao].traceDisplayed == true) {
                    self.map.markers[Icao].trace.setMap(null);
                    self.map.markers[Icao].traceDisplayed = false;
                }
                if(Icao in self.app.comparisonTable.aircraft) {
                    self.app.comparisonTable.remove(Icao);
                }
                self.map.markers[Icao].setMap(null);
                delete self.map.dataset[Icao];
                delete self.map.markers[Icao];
            }
        }
        // clear the old data every 5 seconds
        setTimeout(function(){self.purgeOldData(delta);}, 5000);
    }

    // initialize upon creation
    self.initialize(app);

}
