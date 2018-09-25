/*

This function provides settings to the application.

*/

function Settings(app) {

    var self = this;

    // -----------------------------------------------------
    // Adds an empty overlay to the map and starts periodic updating
    // -----------------------------------------------------
    self.initialize = function(app) {

        self.app = app;

        var weather_opacity_slider = $('#weather-opacity');
        weather_opacity_slider.on('change', function(){
            self.app.weather.setOpacity(parseFloat(this.value));
        });

    }


    // initialize upon creation
    self.initialize(app);

};
