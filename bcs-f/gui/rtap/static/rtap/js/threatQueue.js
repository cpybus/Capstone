/*

This function updates and populates a threat queue
based on information received from the server and
calculated using outlier threat detection.

*/

function ThreatQueue(app){

    var self = this;

    // ---------------------------------------------------
    // Sets up configuration settings for the threat queue
    // ---------------------------------------------------
    self.initialize = function(app) {
        self.app = app;

        self.panel = $('#warnings-panel');
        self.table = $('#threat-queue-table');


        self.threatColors = ['#1DD129', '#1D99D1', '#FEEB19', '#FEB919', '#FE2119'];

        self.queueLength = 5;

        self.aircraft = {};
        self.queue = [];
        self.min_threat = 0;

    }

    // ---------------------------------------------------
    // Returns the correct color based on the max threat and threat level
    // ---------------------------------------------------
    self.getThreatColor = function(threat_level, max_threat_level) {
        var step = max_threat_level / 5;
        if(threat_level > 4*step) {
            return self.threatColors[4];
        } else if(threat_level > 3*step) {
            return self.threatColors[3];
        } else if(threat_level > 2*step) {
            return self.threatColors[2];
        } else if(threat_level > step) {
            return self.threatColors[1];
        } else {
            return self.threatColors[0];
        }
    }

    // ---------------------------------------------------
    // Utility function to change active marker on table click
    // ---------------------------------------------------
    self.onClick = function(icao) {
        self.app.map.aircraftMarkerOnClick(self.app.map.markers[icao]);
    }

    // ---------------------------------------------------
    // Check if an aircraft belongs in the queue and update if so
    // ---------------------------------------------------
    self.checkAircraft = function(icao, threat_level) {
        if(threat_level > self.min_threat) {
            self.updateQueue(icao, threat_level);
        }
    }

    // ---------------------------------------------------
    // Periodic function to update the threat queue
    // ---------------------------------------------------
    self.updateQueue = function(icao, threat_level) {

        // add the new entry or update if already present
        self.aircraft[icao] = threat_level;

        // sort
        var sortable = [];
        for(var icao in self.aircraft) {
            sortable.push([icao, self.aircraft[icao]]);
        }
        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });
        //console.log(sortable);

        // remove the least threat if necessary
        if(sortable.length > self.queueLength) {
            sortable.splice(-1,1)
        }

        // update min_threat
        if(sortable.length == self.queueLength) {
            self.min_threat = sortable[self.queueLength-1][1];
        } else {
            self.min_threat = 0;
        }

        self.table.find('tr').remove();
        for(var idx=0; idx<Math.min(self.queueLength, sortable.length); idx++){
            var threat_level = Number(sortable[idx][1].toFixed(1));
            var icao = sortable[idx][0];
            self.table.append('<tr onclick="app.threatQueue.onClick(\''+icao+'\')"><td class="threat-color">'+threat_level.toString()+'</td><td>'+icao+'</td></tr>');
            var color = self.getThreatColor(threat_level.toString(), 10);
            self.table.find('tr:last').find('td:first').css('background', color);
            self.table.find('tr:last').addClass(self.app.map.nightMode?"darker hover":"lighter hover");
            self.table.append('<tr class="table-spacer"></tr>');
        }

    }

    // initialize upon creation
    self.initialize(app);

}
