/*

This app object serves as the primary controller for the rtap. When
the page is loaded, the app is initialized and does the task of
initializing any additional features.

*/

var app = {

    // ------------------------------------------------------
    // Called when the page is loaded to initialize application features
    // ------------------------------------------------------
    initialize : function() {
        var self = this;
        self.map = new Map(self);

        if(typeof(self.LiveData) == 'undefined') {
            console.log('Live data feature loaded');
            self.liveData = new LiveData(self);
        }

        if(typeof(self.Aoi) == 'undefined') {
            console.log('Area of interest feature loaded');
            self.aoi = new Aoi(self);
        }

        if(typeof(self.Weather) == 'undefined') {
            console.log('Weather feature loaded');
            self.weather = new Weather(self.map);
        }

        if (typeof(self.comparisonTable) == 'undefined') {
            console.log('Comparison Table feature loaded');
            self.comparisonTable = new comparisonTable(self.map);
        }

        if (typeof(self.filters) == 'undefined') {
            console.log('Filter feature loaded');
            self.filters = new Filter(self.map);
        }

        if (typeof(self.threatQueue) == 'undefined') {
            console.log('Threat queue feature loaded');
            self.threatQueue = new ThreatQueue(self);
        }

        if (typeof(self.aircraftInfoPanel) == 'undefined') {
            console.log('Aircraft info panel feature loaded');
            self.aircraftInfoPanel = new AircraftInfoPanel(self);
        }

        if (typeof(self.settings) == 'undefined') {
            console.log('Settings feature loaded');
            self.settings = new Settings(self);
        }

        // utils.loadDatabaseSnapshot(self);

    },

    // ------------------------------------------------------
    // Toggles the display of the filters panel
    // ------------------------------------------------------
    toggleDrawer: function(name) {

        var filters = $(name);
        var filter_table = $('#filter-table');
        var aircraft_info = $('#aircraft-info-panel');

        if(filter_table.is(':visible')) {
            $('.hideshow').text('Show');
            // remove content and auto reduce size
            filter_table.hide(0);
            filters.css('height', 'auto');
            // get the new size as a percentage
            var new_filters_height = Math.round(filters.height()/filters.parent().height()*100);
            // set the new heights for the divs using percentages
            filters.css('height', new_filters_height.toString()+'%');
            var new_aircraft_info_height = 100-new_filters_height;
            aircraft_info.css('height', new_aircraft_info_height.toString()+'%');
        } else {
            // restore content and default size
            $('.hideshow').text('Hide');
            filter_table.show(0);
            filters.css('height', '33%');
            aircraft_info.css('height', '67%');
        }

    },

    // ------------------------------------------------------
    // Slides away a sidebar with id in the given direction
    // ------------------------------------------------------
    toggleSidebar: function(id, dir) {
        $(id).toggle("slide", {direction: dir});
    },


    // ------------------------------------------------------
    // Called when the search box icon is clicked
    // ------------------------------------------------------
    search: function(app) {
        var icao = document.getElementById('searchbox').value;
        console.log(icao);
        var position = this.map.markers[icao].getPosition();
        this.map.map.panTo(position);
        this.map.map.setZoom(12);
    },

    // ------------------------------------------------------
    // Called when a name is clicked in the contact menu
    // ------------------------------------------------------
    setContactPhoto: function(imgSrc) {
        $('#profile-photo').attr('src', '../../static/rtap/img/profile-pics/'+imgSrc);
    },

    // ------------------------------------------------------
    // Switches the tab within the threat-queue panel
    // ------------------------------------------------------
    switchThreatTab: function(tab_id, panel_id) {
        $('.active-tab-panel').removeClass('active-tab-panel');
        $(panel_id).addClass('active-tab-panel');

        if(self.app.map.nightMode) {
            $('.active-tab').switchClass('dark', 'darker');
            $(tab_id).switchClass('darker', 'dark');
            $(tab_id).addClass('active-tab');
        } else {
            $('.active-tab').switchClass('light', 'lighter');
            $(tab_id).switchClass('lighter', 'light');
            $(tab_id).addClass('active-tab');
        }
    }

};

// ------------------------------------------------------
// Automatically called when the page is loaded to load
// the google maps api and initialize the application
// ------------------------------------------------------
$(document).ready(function() {

    $.getScript("https://maps.googleapis.com/maps/api/js?libraries=drawing&key=AIzaSyDiMPyh8dVsRBXWIbqxASNzYt5vDksBm00", function() {
        app.initialize();
    });

});
