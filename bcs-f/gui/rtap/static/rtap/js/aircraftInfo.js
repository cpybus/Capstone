// --------------------------------------------------------
// Helper function for constructing rows in a table
// --------------------------------------------------------
function createTableRow(fieldName, fieldValue) {
    return "<tr><td class='fieldName'>"+fieldName+":</td><td>"+fieldValue+"</td></tr>";
}

// --------------------------------------------------------
// Updates the weather info table on the page given lat and lng
// --------------------------------------------------------
function getCurrentWeather(lat, lng) {
    $.getJSON(
        'http://api.openweathermap.org/data/2.5/weather?lat='+lat.toString()+'&lon='+lng.toString()+'&units=imperial&appid=b627ad7b6f59e4e4e4dbe4112ccfb8e4',
        function (data) {
            var clouds = data.clouds.all;
            var humidity = data.main.humidity;
            var pressure = data.main.pressure;
            var temperature = data.main.temp;
            var description = data.weather[0].description;
            var wind_angle = data.wind.deg;
            var wind_speed = data.wind.speed;

            var table = $('#weather-info-table');
            table.find('tr').remove();
            table.append(createTableRow('Cloud Cover [%]', clouds));
            table.append(createTableRow('Humidity [%]', humidity));
            table.append(createTableRow('Pressure [hPa]', pressure));
            table.append(createTableRow('Temperature [F]', temperature));
            table.append(createTableRow('Description', description));
            table.append(createTableRow('Wind Angle [°]', wind_angle));
            table.append(createTableRow('Wind Speed [mph]', wind_speed));


        }
    );
}

// --------------------------------------------------------
// Updates all information on the page
// --------------------------------------------------------
function update() {

    var aircraft_data = JSON.parse(localStorage.getItem('aircraft_data'));
    var icao = localStorage.getItem('aircraft_icao');

    $('#icao').text(icao);
    var table = $('#aircraft-info-table');
    table.find('tr').remove();
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
    table.append(createTableRow('Model', aircraft_data['Model']));
    table.append(createTableRow('Operator', aircraft_data['Operator']));
    table.append(createTableRow('Registration', aircraft_data['Reg']));
    table.append(createTableRow('From', aircraft_data['SourceAirport']));
    table.append(createTableRow('To', aircraft_data['DestAirport']));

    traces = aircraft_data['traces'];
    last_known_trace = traces[traces.length-1];
    lat = parseFloat(last_known_trace['Lat']);
    lng = parseFloat(last_known_trace['Lng']);
    trak = parseFloat(last_known_trace['Trak']);
    alt = parseFloat(last_known_trace['Alt']);
    spd = parseFloat(last_known_trace['Spd']);

    getCurrentWeather(lat, lng);

    table.append(createTableRow('Lat', lat));
    table.append(createTableRow('Lng', lng));
    table.append(createTableRow('Dir [°]', trak));
    table.append(createTableRow('Alt [ft]', alt));
    table.append(createTableRow('Spd [knots]', spd));

    var imageURL = 'http://www.skybrary.aero/images/'+aircraft_data['Model']+'.jpg';
    $('#aircraft-thumbnail').attr('src', imageURL);

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(function(){ drawChart(aircraft_data) });

    var threat_table = $('#threat-info-table');
    threat_table.find('tr').remove();

    if(typeof(aircraft_data['ThreatLevel']) == 'undefined') {
        threat_table.css('visibility', 'hidden');
    } else {
        threat_table.css('visibility', 'visible');
        var total = aircraft_data['ThreatLevel'];
        threat_table.append(createTableRow('Threat Level', total.toFixed(1).toString()));

        if(total != 0) {
            for(var metric in aircraft_data['ThreatContributions']) {
                var val = aircraft_data['ThreatContributions'][metric];
                var percentage = val/total*100;
                threat_table.append(
                    createTableRow(metric, "<div class='meter'><span style='width: "+percentage+"%'></span></div>")
                );
            }
        }
    }

    // update the page every 10 seconds
    setTimeout(function() { update(aircraft_data, icao); }, 10000);
}

// --------------------------------------------------------
// Draws the altitude and speed charts for the aircraft_data
// --------------------------------------------------------
function drawChart(aircraft_data) {
    var raw_alt_data = [['Time', 'Alt']];
    var raw_spd_data = [['Time', 'Speed']];
    var traces = aircraft_data['traces'];

    for(var i=0; i<traces.length; i++) {
        raw_alt_data.push([traces[i]['Timestamp'], traces[i]['Alt']]);
        raw_spd_data.push([traces[i]['Timestamp'], traces[i]['Spd']]);
    }

    var alt_data = google.visualization.arrayToDataTable(raw_alt_data);
    var spd_data = google.visualization.arrayToDataTable(raw_spd_data);

    var options = {
      legend: { position: 'none' },
      hAxis: { textPosition: 'none',
               title: 'Time'
           },
       vAxis: { //textPosition: 'none'
                      title: 'feet'
                       }
    };

    var alt_chart = new google.visualization.LineChart(document.getElementById('alt_chart'));
    var spd_chart = new google.visualization.LineChart(document.getElementById('spd_chart'));
    alt_chart.draw(alt_data, options);
    options.vAxis.title = "knots";
    spd_chart.draw(spd_data, options);
}

// --------------------------------------------------------
// Shows the passport overlay
// --------------------------------------------------------
function showPassport() {
    $('#passport').css('display', 'block');
}

// --------------------------------------------------------
// Hides the passport overlay
// --------------------------------------------------------
function hidePassport() {
    $('#passport').css('display', 'none');
}

// --------------------------------------------------------
// Triggers an update once the page is loaded
// --------------------------------------------------------
$(document).ready(function() {
    update();
});
