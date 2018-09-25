/*

This function accepts a Map object and performs
the construction and maintenance of a comparison panel
for viewing data of multiple aircraft side by side.

*/

function comparisonTable(map){

    var self = this;

    // ---------------------------------------------------
    // Sets up the necessary data and configures colors
    // ---------------------------------------------------
    self.initialize = function(map){

        self.table_rows = $('#aircraft-comparison-table tr');
        self.panel = $('#aircraft-comparison-panel');
        self.num_aircraft = 0;
        self.map = map;

        // keep track of aircraft and their column in the table
        self.aircraft = {};

        // keep track of colors already in use
        self.colors = {
            '#FF69B4':false,
            '#3F51B5':false,
            '#00FFE5':false,
            '#00FF04':false,
            '#FF8800':false
        };
    }

    // ---------------------------------------------------
    // Finds the next available color for identifying an aircraft
    // ---------------------------------------------------
    self.getAvailableColor = function() {
        for(var color in self.colors) {
            if(self.colors[color] == false) {
                self.colors[color] = true;
                return color;
            }
        }
    }

    // ---------------------------------------------------
    // Called when an aircraft is right-clicked and adds or
    // removes as necessary
    // ---------------------------------------------------
    self.compare = function(icao) {
        if(icao in self.aircraft) {
            self.remove(icao);
        } else {
            self.add(icao);
        }
    }

    // ---------------------------------------------------
    // Adds the aircraft with the given icao to the table
    // ---------------------------------------------------
    self.add = function(icao) {
        var marker = self.map.markers[icao];
        var aircraft_data = self.map.dataset[icao];
        if(self.num_aircraft == 0) {
            self.panel.css('visibility', 'visible');
        }
        // can only compare 5 at a time
        if(self.num_aircraft == 5){ return; }

        var color = self.getAvailableColor();

        // add data to each row in the table
        self.table_rows.each(function(){
            var field = $(this).data('field');
            if(field == 'Icao') {
                $(this).append('<td>'+marker.icao+'</td>');  
            } else if (field == 'Color'){
                $(this).append('<td onclick="app.comparisonTable.remove(\''+icao+'\')">X</td>');
                $(this).find('td:last').css('background', color);
                self.map.setMarkerColor(marker, color);
            } else {
                var data = aircraft_data[field];
                if(data==null)
                    data="Unknown";
                $(this).append('<td>'+data+'</td>');
            }
        });
        self.num_aircraft += 1;
        self.aircraft[marker.icao] = {};
        self.aircraft[marker.icao].column = self.num_aircraft;
        self.aircraft[marker.icao].color = color;

    }

    // ---------------------------------------------------
    // Removes the aircraft with the given icao from the table
    // ---------------------------------------------------
    self.remove = function(icao) {

        var marker = self.map.markers[icao];
        var aircraft_data = self.map.dataset[icao];

        // remove the column
        var idx = self.aircraft[marker.icao].column;
        self.table_rows.each(function() {
            $(this).find("td:eq("+idx.toString()+")").remove();
        });

        // free up the color
        var color = self.aircraft[marker.icao].color;
        self.colors[color] = false;

        // remove the aircraft from the record
        delete self.aircraft[marker.icao];
        self.num_aircraft -= 1;

        if(self.num_aircraft == 0) {
            self.panel.css('visibility', 'hidden');
        }

        // shift remaining column indexes
        $.each(self.aircraft, function( icao, data ) {
            if(data.column > idx){ self.aircraft[icao].column = data.column-1; }
        });

        // restore marker color
        if(self.map.nightMode) {
            self.map.setMarkerColor(marker, 'white');
        } else {
            self.map.setMarkerColor(marker, 'black');
        }
    }

    // initialize upon creation
    self.initialize(map);
}
