namespace Mapbox.Unity.Map
{
	using System;
	using Mapbox.Unity.MeshGeneration;
	using Mapbox.Unity.Utilities;
	using Utils;
	using UnityEngine;
	using Mapbox.Map;
	using UnityEngine.UI;


	public class location_input : MonoBehaviour {

		public Transform main_player_t; //main player transform

		public GameObject Map;
		public InputField Lat_InputField;
		public InputField Long_InputField;
		public Button submitButton;

		public Text Lat_Text; //in the infobox at the bottom of the screen
		public Text Long_Text; //in the infobox at the bottom of the screen
        
		Vector2d mapLatLong;
		AbstractMap main_map;
		int _zoom;

		Vector3 old_pos;

		// Use this for initialization
		void Start () {

			old_pos = main_player_t.position; //establish current position

			main_map = Map.GetComponent<AbstractMap>();
	        
	        mapLatLong = main_map.CenterLatitudeLongitude; //placeholder
	        _zoom = main_map.Zoom;

	        Button btn = submitButton.GetComponent<Button>();
	        btn.onClick.AddListener(TaskOnClick);

            string latlongstring = main_map._latitudeLongitudeString;
            string[] latlong = latlongstring.Split(',');

            //copy initial lat and long to summary info
            Lat_Text.text = latlong[0].Trim();
            Long_Text.text = latlong[1].Trim();

           }
            
        // Update is called once per frame. It updates the the lat/long in the info box at bottom
        void Update () {

            Vector3 new_pos = main_player_t.position;

            //if position changed
            if(old_pos.x != new_pos.x || old_pos.y != new_pos.y || old_pos.z != new_pos.z)
            {
                //update text to reflect current position

                Vector2d lat_lon = VectorExtensions.GetGeoPosition(new_pos, main_map.CenterMercator, main_map.WorldRelativeScale);
                
                //round to 4th decimal place
                Lat_Text.text = lat_lon[0].ToString("F4");
                Long_Text.text = lat_lon[1].ToString("F4");
            }
        }

        //apply input value for location when button is clicked
        void TaskOnClick()
        {

            Vector2d old_center = main_map.CenterMercator;

            //move player to new location (refer to Update() in PlayerTileProvider.cs for more information)
            Vector2d mapLatLong = new Vector2d(float.Parse(Lat_InputField.text), float.Parse(Long_InputField.text));
			var referenceTileRect = Conversions.TileBounds(TileCover.CoordinateToTileId(mapLatLong, _zoom));
			main_map.CenterMercator = referenceTileRect.Center;
            
            //copy lat and long to summary info
            Lat_Text.text = mapLatLong[0].ToString("F4");
            Long_Text.text = mapLatLong[1].ToString("F4");

            //update all aircraft models to match new scene location (only needed if update isn't frequent enough)
            update_all_aircraft(old_center);

        }

        //update all objects with "aircraft" tag to have position relative to new map center
        void update_all_aircraft(Vector2d old_center)
        {

            GameObject[] aircrafts = GameObject.FindGameObjectsWithTag("aircraft");
            for (int i = 0; i < aircrafts.Length; i++)
            {
                Vector2d latLngVector = VectorExtensions.GetGeoPosition(aircrafts[i].transform.position, old_center, main_map.WorldRelativeScale);
                create_Objects.update_location(aircrafts[i], new Vector2((float)latLngVector[0], (float)latLngVector[1]), main_map);
            }
        }
    }
}
