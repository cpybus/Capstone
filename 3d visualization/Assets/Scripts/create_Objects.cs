using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Mapbox.Unity.Utilities;
using Mapbox.Utils;
using Mapbox.Unity.Map;
using UnityEngine.UI;
using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class create_Objects : MonoBehaviour
{
    public static Dictionary<String, AirplaneObject> planes; //contains all planes that are sent from rtap. this is continually updated
    public static CancellationTokenSource cts;
    public static bool startBackUp = false;
    public static bool disconnectRequested = false;
    public static int connectionStatus = 0; //0=not connected, 1=attemping connection, 2=connected

    public Task task;

    public GameObject boeing_747;
    public GameObject Unknown_Object;
    public GameObject boeing_747_standalone; //without bubble
    public GameObject Unknown_Object_standalone; //without bubble
    public AbstractMap map;
    public float speed = 5f;
    public float threshold_aircraft_speed = 2000f; //high speed (in knots)
    public int t = 2; //seconds to wait before updating the planes again
    public Toggle bubble_toggle;

    [SerializeField]
    bool include_bubble = true; //enabled by default

    Vector2d old_center;


    // Use this for initialization
    void Start()
    {
        planes = new Dictionary<String, AirplaneObject>();
        
        //set toggle switch
        bubble_toggle.isOn = include_bubble;
        bubble_toggle.onValueChanged.AddListener(TaskOnSelect);

        //reference of initial map center
        old_center = map.CenterMercator;

        cts = new CancellationTokenSource();
        task = Echo(cts.Token);
        Task timer = connectTimer();
    }

    public async Task Echo(CancellationToken cancelToken)
    {

        Debug.Log("Starting WebSocket connection...");
        connectionStatus = 1;
        using (ClientWebSocket ws = new ClientWebSocket())
        {
            //Uri serverUri = new Uri("ws://129.161.38.105:8000/"); //connects to daniel's RTAP server
            //Uri serverUri = new Uri("ws://mdl-vm1.eng.rpi.edu:8000/"); //connects to main project RTAP server
            Uri serverUri = new Uri("ws://localhost:8000/"); 
            await ws.ConnectAsync(serverUri, cancelToken);
            
            if(ws.State == WebSocketState.Open)
            {
                Debug.Log("Connected!");
                connectionStatus = 2;
            }
            else
            {
                Debug.Log("Not connected! (" + ws.State + ")");
                connectionStatus = 0;
                return;
            }

            while (ws.State == WebSocketState.Open)
            {
                if (cancelToken.IsCancellationRequested)
                {
                    await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                    Debug.Log("WebSocket connection ended (1)");
                    connectionStatus = 0;
                    return;
                }

                //Debug.Log("Received bytes of data");
                ArraySegment<byte> bytesReceived = new ArraySegment<byte>(new byte[1024]);
                WebSocketReceiveResult result = await ws.ReceiveAsync(bytesReceived, cancelToken);
                String message = "";
                if(result != null)
                {
                    //message = Encoding.UTF8.GetString(bytesReceived.Array, 0, result.Count);
                    //Debug.Log(message);
                    message = "{\"Trace\": {\"UnknownId\": null, \"Timestamp\": \"2017 - 12 - 03 23:00:10\", \"Trak\": 97.3, \"Lat\": 37.9625, \"Lng\": -119.7028, \"Spd\": 498.0, \"Alt\": 8000}, \"SourceAirport\": \"KLAS\", \"Icao\": \"A6587B\", \"DestAirport\": \"KBOS\", \"Operator\": \"JBU\", \"Model\": \"A320\", \"Reg\": \"N508JL\"}";
                }

                if (cancelToken.IsCancellationRequested)
                {
                    await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                    Debug.Log("WebSocket connection ended (2)");
                    connectionStatus = 0;
                    return;
                }

                if (message.StartsWith("{\"Trace\""))
                {
                    message = message.Replace("null", "0");
                    //Debug.Log(message);

                    AirplaneObject rtapPlane = JsonConvert.DeserializeObject<AirplaneObject>(message);

                    if (planes.ContainsKey(rtapPlane.icao))
                    {
                        planes[rtapPlane.icao].updateStats(rtapPlane);
                        //update_aircraft(planes[rtapPlane.icao]);

                        float myFloat = (float)(planes[rtapPlane.icao].trace.alt * 0.3048); //convert plane altitute from feet to meters

                        Vector2 latLngVector2 = new Vector2((float)planes[rtapPlane.icao].trace.lat, (float)planes[rtapPlane.icao].trace.lng); //2D vector that stores lat and long of the updated plane
                        update_location(planes[rtapPlane.icao].renderedPlane, latLngVector2, map);
                    }
                    else
                    {
                        planes.Add(rtapPlane.icao, rtapPlane);
                        //generate_aircraft(planes[rtapPlane.icao]);

                        float myFloat = (float)(planes[rtapPlane.icao].trace.alt * 0.3048);
                        Vector2d latlngVector = new Vector2d(planes[rtapPlane.icao].trace.lat, planes[rtapPlane.icao].trace.lng);

                        planes[rtapPlane.icao].renderedPlane = Instantiate(Unknown_Object);
                        
                        planes[rtapPlane.icao].renderedPlane.name = planes[rtapPlane.icao].icao;
                        planes[rtapPlane.icao].renderedPlane.transform.localScale = new Vector3(1, 1, 1);
                        VectorExtensions.MoveToGeocoordinate(planes[rtapPlane.icao].renderedPlane.transform, latlngVector, map.CenterMercator, map.WorldRelativeScale);
                        planes[rtapPlane.icao].renderedPlane.transform.position = new Vector3(planes[rtapPlane.icao].renderedPlane.transform.position.x, myFloat, planes[rtapPlane.icao].renderedPlane.transform.position.z);
                    }
                }
            }

            Debug.Log("Not connected! (" + ws.State + ")");
            connectionStatus = 0;
            return;
        }

    }

    public async Task connectTimer()
    {
        await Task.Delay(5000);
        if(connectionStatus == 0 || connectionStatus == 1)
        {
            Debug.Log("Timeout of 5 seconds reached, ending connection attempt.");
            cts.Cancel();
            await Task.Delay(2000);
            task.Dispose();
            connectionStatus = 0;
        }
    }

    public async Task disconnectTimer()
    {
        await Task.Delay(3000);
        if (connectionStatus == 2)
        {
            Debug.Log("Timeout of 3 seconds reached for safe disconnect, forcing the disconnect instead.");
            connectionStatus = 0;
            task.Dispose();
            connectionStatus = 0;
        }
    }

    // Update is called once per frame
    void Update()
    {
        if(startBackUp == true)
        {
            startBackUp = false;
            cts = new CancellationTokenSource();
            task = Echo(cts.Token);
            Task timer = connectTimer();
        }

        if(disconnectRequested == true)
        {
            cts.Cancel();
            disconnectRequested = false;
            Task timer = disconnectTimer();
        }
    }

    //generate aircraft based on scene location. Takes in plane object (by reference) and adds it to the map. Also instantiates the rendered boeing, 
    //which is attached to the AircraftObject class


    public void update_aircraft(AirplaneObject plane)
    {
        float myFloat = (float)(plane.trace.alt * 0.3048); //convert plane altitute from feet to meters

        Vector2 latLngVector2 = new Vector2((float) plane.trace.lat, (float) plane.trace.lng); //2D vector that stores lat and long of the updated plane
        update_location(plane.renderedPlane, latLngVector2, map);

        Vector2d new_center = map.CenterMercator;

    	//if map center has changed, refresh trails
    	if(new_center[0] != old_center[0] || new_center[1] != old_center[1])
    	{
    		plane.renderedPlane.GetComponent<TrailRenderer>().Clear();
    	}

        //show speed
        plane.renderedPlane.GetComponent<TextMesh>().text = plane.trace.spd.ToString() + "kn";

        //set trail color
        float percent_green = (float)plane.trace.spd / threshold_aircraft_speed; //find how much to color red (for close to maximum threshold speed)
        percent_green = Mathf.Min(1F, percent_green); //cap value at 100 percent
        Color nColor = new Color((1 - percent_green), percent_green, 0, 1); // create color for trail based on speed (green if very fast, red if very slow)
        Material trail = plane.renderedPlane.GetComponent<TrailRenderer>().material; // Get the material list of the trail as per the scripting API.
        trail.color = nColor;
    }

    public static void update_location(GameObject plane, Vector2 latLngVector, AbstractMap map)
    {
        Vector3 nextLatLng = VectorExtensions.AsUnityPosition(latLngVector, map.CenterMercator, map.WorldRelativeScale); //Converts lat/long to unity cords
        nextLatLng.y = plane.transform.position.y; //adds in altitude into the vector3
        plane.transform.LookAt(nextLatLng); //makes the plane look at the cordinate its about to move to
        plane.transform.position = nextLatLng; //move the plane
    }


    void TaskOnSelect(bool value)
    {
        include_bubble = value;

    }
}



//Custom object represents an airplane and holds all related values (alt, lat, lng, etc)
//This custome object also holds the actual GameObject that is rendered in scenes
//The gameobject is instantiated when a plane is generated in generate_aircraft()
//The fields in the custom class match the JSON returns exactly so they can be
//automatically initated by using JSON parser.
public class AirplaneObject
{
    [JsonProperty("Icao")]
    public String icao { get; set; }

    [JsonProperty("DestAirport")]
    public String destAirport { get; set; }

    [JsonProperty("Operator")]
    public String oper { get; set; }

    [JsonProperty("Model")]
    public String model { get; set; }

    [JsonProperty("Reg")]
    public String reg { get; set; }

    [JsonProperty("Trace")]
    public Trace trace { get; set; }

    public GameObject renderedPlane { get; set; }

    AirplaneObject()
    {

    }

    public AirplaneObject(double lat, double lng, int alt)
    {
        //this.lat = lat;
        //this.lng = lng;
        //this.alt = alt;
    }

    public void updateStats(AirplaneObject other)
    {
        destAirport = other.destAirport;
        oper = other.oper;
        model = other.model;
        reg = other.reg;
        trace.timestamp = other.trace.timestamp;
        trace.trak = other.trace.trak;
        trace.lat = other.trace.lat;
        trace.lng = other.trace.lng;
        trace.spd = other.trace.spd;
        trace.alt = other.trace.alt;
    }


    public override string ToString()
    {
        return "ICAO:" + icao + "  Reg:" + reg + "  Model:" + model;
    }
}

public class Trace
{
    [JsonProperty("Timestamp")]
    public String timestamp { get; set; }

    [JsonProperty("Trak")]
    public double trak { get; set; }

    [JsonProperty("Lat")]
    public double lat { get; set; }

    [JsonProperty("Lng")]
    public double lng { get; set; }

    [JsonProperty("Spd")]
    public double spd { get; set; }

    [JsonProperty("Alt")]
    public double alt { get; set; }

    Trace()
    {

    }

    Trace(int id, string name, bool polarPlot)
    {

    }
}

