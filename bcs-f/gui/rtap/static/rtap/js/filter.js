/*

This function creates a Dict object which contains the functions and
variables necessary to impliment a dictionary structure.

*/



function Dict(){
    self.dict = {};
    self.keys = []

    this.insert = function(key, value) {
        if (value !== null){
             if (!self.dict[key] || !(self.dict[key] instanceof Array)) {
                self.dict[key] = [];
                self.keys.push(key);
             }
             // All arguments, exept first push as valuses to the dictonary
             self.dict[key] = self.dict[key].concat(Array.prototype.slice.call(arguments, 1));
             //return self.dict;
         }
     }

     this.keys = function(){
         return self.keys;
     }

    this.value = function(key){
        return self.dict[key];
    }
}


/*

This function creates a Filter object which contains the functions and
variables necessary to filter marker out based on the marker's data.

*/


function Filter(dataset){

    var self = this;



    // --------------------------------------------------------
    // Creates the Filter instance and initializes other
    // member variables
    // --------------------------------------------------------
    this.initialize = function(map){
        var dataset = map.dataset;
        this.options = new Dict();
        this.categories = [];
        this.filters = [];
        this.eads = true;
        this.seads = true;
        this.wads = true;
        console.log(dataset);
        for(var key in dataset){
            if (this.categories.length == 0){
                for(var item in dataset[key]){
                    this.categories.push(item);
                    this.options.insert(item,dataset[key][item]);
                }
            }
            for (var item in dataset[key]){
                this.options.insert(item,dataset[key][item]);
                //console.log(dataset[key][item]);
            }
        }

        self.listFilters();
        //self.altitudeFilter(map,100,20000);
    }


    // --------------------------------------------------------
    // Creates a filter that filters markers depending on
    // the type of test passed to it.
    // Example input: this.rangeFilters(airplaneData,trueOrFalse,1000,10000,"Alt");
    // --------------------------------------------------------
    this.rangeFilter = function(data,flag,minVal, maxVal,type){
        var l = data['traces'].length;


        if (typeof(minVal) !== "NaN"){
            if (data['traces'][l-1][type] < minVal){
                flag = false;
            }
        }
        if (typeof(maxVal) !== "NaN"){
            if (data['traces'][l-1][type] > maxVal){
                flag = false;
            }
        }
        if (data['traces'][l-1][type] == null)
        {
            flag = false;
        }
        return flag
    }

    this.circleFilter = function(data,flag,radius,point,units){
        //42.7191858,-73.6862277, 100 km
        var l = data['traces'].length;
        //console.log("circle!");
        if (data['traces'][l-1]["Lat"] == null ||
            data['traces'][l-1]["Lng"] == null){
                //console.log("Not defined");
                return false;
            }

        else if (typeof(radius) !== "NaN" &&
            typeof(point['lat']) !== "NaN" &&
            typeof(point['lng']) !== "NaN"){

            var plane = {
                lat: parseFloat(data['traces'][l-1]["Lat"]),
                lng: parseFloat(data['traces'][l-1]["Lng"])
            }
            //console.log("Compare!");
            var dist = utils.distBetweenTwoPoints(plane,point,units);
            //console.log(dist, radius);
            if (dist > radius){
                flag = false;
            }

        }

        return flag;


    }

    this.subEADS = function(map) {
        self.eads = !self.eads;
        self.defaultFilter(map);
    }
    this.subSEADS = function(map) {
        self.seads = !self.seads;
        self.defaultFilter(map);
    }
    this.subWADS = function(map) {
        self.wads = !self.wads;
        self.defaultFilter(map);
    }

    // --------------------------------------------------------
    // Creates a filter that filters markers depending on
    // the marker's speed and altitude.
    // --------------------------------------------------------
    this.defaultFilter = function(map)
    {
        var minSpd = parseInt(document.forms["defaultFilterForm"]["minSpd"].value);
        var maxSpd = parseInt(document.forms["defaultFilterForm"]["maxSpd"].value);
        var minAlt = parseInt(document.forms["defaultFilterForm"]["minAlt"].value);
        var maxAlt = parseInt(document.forms["defaultFilterForm"]["maxAlt"].value);
        var lat = document.forms["defaultFilterForm"]["lat"].value;
        var lng = document.forms["defaultFilterForm"]["lng"].value;


        var point = {lat: parseFloat(lat),
                    lng: parseFloat(lng)
        };
        var radius = parseFloat(document.forms["defaultFilterForm"]["radius"].value);
        var unitsMenu = document.getElementById("distUnits");
        var units = unitsMenu.options[unitsMenu.selectedIndex].value;


        var dataset = map.dataset;
        var flag = true;

        for (var key in dataset){
            flag = true;
            if (self.eads == true && self.seads == true && self.wads == true) {
                flag = true;
            }else if (self.eads == true && self.seads == true){
                console.log("eads n seads");
                var point2 = {lat: 43.220259,
                              lng: -75.411311
                };
                flag = self.circleFilter(dataset[key],flag,500,point2,units);
                
                if (flag == false){
                    flag = true;
                    point2 = {lat: 30.079703,
                              lng: -85.606772
                    };
                    flag = self.circleFilter(dataset[key],flag,500,point2,units);
                }
            }else if (self.eads == true && self.wads == true){
                var point2 = {lat: 43.220259,
                              lng: -75.411311
                };
                flag = self.circleFilter(dataset[key],flag,500,point2,units);

                if (flag == false){
                    flag = true;
                    point2 = {lat: 47.110015,
                              lng: -122.529190
                    };
                    flag = self.circleFilter(dataset[key],flag,500,point2,units);
                }
            }else if (self.seads == true && self.wads == true){
                var point2 = {lat: 30.079703,
                              lng: -85.606772
                };
                flag = self.circleFilter(dataset[key],flag,500,point2,units);
                
                if (flag == false){
                    flag = true;
                    point2 = {lat: 47.110015,
                              lng: -122.529190
                    };
                    flag = self.circleFilter(dataset[key],flag,500,point2,units);
                }
            }else if (self.eads == true){
                var point2 = {lat: 43.220259,
                              lng: -75.411311
                };
                flag = self.circleFilter(dataset[key],flag,500,point2,units);
            }else if (self.seads == true){
                var point2 = {lat: 30.079703,
                              lng: -85.606772
                };
                flag = self.circleFilter(dataset[key],flag,500,point2,units);
            }else if (self.wads == true){
                var point2 = {lat: 47.110015,
                              lng: -122.529190
                };
                flag = self.circleFilter(dataset[key],flag,500,point2,units);
            }else{
                flag = false;
            }
            flag = self.rangeFilter(dataset[key],flag,minAlt,maxAlt,"Alt");
            flag = self.rangeFilter(dataset[key],flag,minSpd,maxSpd,"Spd");
            flag = self.circleFilter(dataset[key],flag,radius,point,units);

            if (flag){
                map.markers[key].setMap(map.map);
            }
            else {
                map.markers[key].setMap(null);


            }

        }

    }




    // --------------------------------------------------------
    // Creates a unordered list of marker detail names
    // to be placed in id="cat"
    // --------------------------------------------------------
    this.listCategories = function(){
        self.makeUL(self.categories,"cat");
    }

    // --------------------------------------------------------
    // Creates a unordered list of filters
    // to be placed in id="filts"
    // --------------------------------------------------------
    this.listFilters = function(){
        self.makeUL(self.filters,"filts");
    }


    // --------------------------------------------------------
    // Creates a unordered list of items from an array
    // --------------------------------------------------------
    this.makeUL = function(array,id) {
        console.log(array);
        // Create the list element:
        var list = document.createElement('ul');

        for(var i = 0; i < array.length; i++) {
            // Create the list item:
            var item = document.createElement('li');

            // Set its contents:
            item.appendChild(document.createTextNode(array[i]));

            // Add it to the list:
            list.appendChild(item);
        }

        // Finally, return the constructed list:
        document.getElementById(id).appendChild(list);

    }



    // --------------------------------------------------------
    // Toggle a filter on or off
    // --------------------------------------------------------
    this.toggleFilter = function(){
        console.log("num",1);
    }

    this.initialize(dataset);


}
