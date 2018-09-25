/*

This function accepts a Map object and adds a periodic
updating weather overlay.

*/

function Weather(map) {

    var self = this;
    
    // -----------------------------------------------------
    // Adds an empty overlay to the map and starts periodic updating
    // -----------------------------------------------------
    self.initialize = function(map) {
        self.map = map;
        self.opacity = 0.6;
        self.timeout_id = null;
        self.updateTiles(self.map.map);
    }

    // -----------------------------------------------------
    //  function called to update the weather data
    // -----------------------------------------------------
    self.updateTiles = function(map){
        // grab the radar precip data pngs
        var tileNEX = new google.maps.ImageMapType({
            getTileUrl: function(tile, zoom) {
                return "http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/"
                    + zoom + "/" + tile.x + "/" + tile.y +".png?"+ (new Date()).getTime();
            },
            tileSize: new google.maps.Size(256, 256),
            opacity: self.opacity,
            name : 'NEXRAD',
            isPng: true
        });

        map.overlayMapTypes.setAt("0", tileNEX);
        console.log('Updated weather tiles.');
        self.timeout_id = setTimeout(function() { self.updateTiles(map); }, 5*1000*60);
    }

    // -----------------------------------------------------
    //  function called to update the weather opacity
    // -----------------------------------------------------
    self.setOpacity = function(opacity){
        clearTimeout(self.timeout_id);
        self.opacity = opacity;
        self.updateTiles(map.map);
    }


    // initialize upon creation
    self.initialize(map);

};
