/*

This function updates an aircraft info panel within
the UI whenever a marker on the map is clicked.

*/

function AircraftInfoPanel(app){

    var self = this;

    // ---------------------------------------------------
    // Sets up configuration settings for the aircraft info panel
    // ---------------------------------------------------
    self.initialize = function(app) {
        self.app = app;

    }

    // ----------------------------------------------------
    // Given a fieldName and fieldValue, creates HTML markup for
    // a table row containing this data
    // ----------------------------------------------------
    self.createTableRow = function(fieldName, fieldValue) {
        return "<tr><td class='fieldName'>"+fieldName+":</td><td>"+fieldValue+"</td></tr>";
    }

    // ----------------------------------------------------
    // Accepts aircraft data as JSON and adds it to an HTML
    // table with id #aircraft-info-table
    // ----------------------------------------------------
    self.update = function(aircraft_data, icao) {
        console.log(typeof(aircraft_data));

        // write aircraft_data to localStorage for use in static page
        if (typeof(Storage) !== 'undefined') {
            localStorage.setItem('aircraft_data', JSON.stringify(aircraft_data));
            localStorage.setItem('aircraft_icao', icao);
        }
        if(aircraft_data['Model'] == null)
            aircraft_data['Model'] ="Unknown";
        if(aircraft_data['Operator'] == null)
            aircraft_data['Operator'] ="Unknown";
        if(aircraft_data['Reg'] == null)
            aircraft_data['Reg'] ="Unknown";
        if(aircraft_data['SourceAirport'] == null)
            aircraft_data['SourceAirport'] ="Unknown";
        if(aircraft_data['DestAirport'] == null)
            aircraft_data['DestAirport'] ="Unknown";

        $('#aircraft-info-panel').find('h3:first').text(icao);
        var table = $('#aircraft-info-table');
        table.find('tr').remove();
        table.append(self.createTableRow('Model', aircraft_data['Model']));
        table.append(self.createTableRow('Operator', aircraft_data['Operator']));
        table.append(self.createTableRow('Registration', aircraft_data['Reg']));
        table.append(self.createTableRow('From', aircraft_data['SourceAirport']));
        table.append(self.createTableRow('To', aircraft_data['DestAirport']));

        traces = aircraft_data['traces']; 
        last_known_trace = traces[traces.length-1];
        
        lat = parseFloat(last_known_trace['Lat']);
        lng = parseFloat(last_known_trace['Lng']);
        trak = parseFloat(last_known_trace['Trak']);
        alt = parseFloat(last_known_trace['Alt']);
        spd = parseFloat(last_known_trace['Spd']);


        table.append(self.createTableRow('Lat', lat));
        table.append(self.createTableRow('Lng', lng));
        table.append(self.createTableRow('Dir [°]', trak));
        table.append(self.createTableRow('Alt [ft]', alt));
        table.append(self.createTableRow('Spd [knots]', spd));

        var imageURL = 'http://www.skybrary.aero/images/'+aircraft_data['Model']+'.jpg';
        $('#aircraft-thumbnail').attr('src', imageURL);

        var threat_table = $('#aircraft-threat-info-table');
        threat_table.find('tr:gt(0)').remove();

        if(typeof(aircraft_data['ThreatLevel']) == 'undefined') {
            threat_table.css('visibility', 'hidden');
            return;
        }
        threat_table.css('visibility', 'visible');
        var total = aircraft_data['ThreatLevel'];
        threat_table.append(self.createTableRow('Threat Level', total.toFixed(1).toString()));
        threat_table.find('tr:last').find('td:last').css('background-color', self.app.threatQueue.getThreatColor(total, 10)).css('color', 'black');

        if(total == 0) { return; }

        for(var metric in aircraft_data['ThreatContributions']) {
            var val = aircraft_data['ThreatContributions'][metric];
            var percentage = val/total*100;
            threat_table.append(
                self.createTableRow(metric, "<div class='meter'><span style='width: "+percentage+"%'></span></div>")
            );
        }
    }

    // initialize upon creation
    self.initialize(app);

}
