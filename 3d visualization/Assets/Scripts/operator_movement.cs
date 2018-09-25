namespace Mapbox.Unity.Map
{
	using System.Collections;
	using System.Collections.Generic;
	using UnityEngine;
	using UnityEngine.UI;
	using Mapbox.Map;

	public class operator_movement : MonoBehaviour {

        public int speed = 50;
		public Text Speed_Text;
		public GameObject Map;
		public InputField ICAO_input_field;
		public InputField Lat_input_field;
		public InputField Long_input_field;
		AbstractMap main_map;
		float speed_mult; //multiplier to adjust for tile size

		// Use this for initialization
		void Start () {

			main_map = Map.GetComponent<AbstractMap>();
			speed_mult = main_map._unityTileSize/100;
			
		}
		
		// Update is called once per frame
		void Update () {

			//for keys, make sure not inside text box before applying operator movement
			if(ICAO_input_field.isFocused == false && Lat_input_field.isFocused == false && Long_input_field.isFocused == false)
			{
				 
				 if(Input.GetKey(KeyCode.RightArrow))
			     {
			         //rotate right
			        transform.Rotate(Vector3.up, speed * Time.deltaTime,  Space.World);

			     }
			     if(Input.GetKey(KeyCode.LeftArrow))
			     {
			         //rotate left
			     	transform.Rotate(Vector3.down, speed * Time.deltaTime,  Space.World);
			     }
			     if(Input.GetKey(KeyCode.UpArrow))
			     {
			         //rotate up
			        transform.Rotate(Vector3.left, speed * Time.deltaTime);

			     }
			     if(Input.GetKey(KeyCode.DownArrow))
			     {
			         //rotate down
			     	transform.Rotate(Vector3.right, speed * Time.deltaTime);
			     }
			     




		         if(Input.GetKey(KeyCode.W))
			     {
			     	//move forward
			        transform.Translate(new Vector3(0,0,speed * speed_mult * Time.deltaTime));
			     }
		         if(Input.GetKey(KeyCode.S))
			     {
			     	//move backward
			        transform.Translate(new Vector3(0,0,-speed * speed_mult * Time.deltaTime));
			     }
			     if(Input.GetKey(KeyCode.E))
			     {
			     	//move up
			        transform.Translate(new Vector3(0,speed * speed_mult * Time.deltaTime,0));
			     }
			     if(Input.GetKey(KeyCode.Q))
			     {
			     	//move down
			        transform.Translate(new Vector3(0,-speed * speed_mult * Time.deltaTime,0));
			     }
			     if(Input.GetKey(KeyCode.A))
			     {
			     	//move left
			        transform.Translate(new Vector3(-speed * speed_mult *Time.deltaTime,0,0));
			     }
			     if(Input.GetKey(KeyCode.D))
			     {
			     	//move right
			        transform.Translate(new Vector3(speed * speed_mult * Time.deltaTime,0,0));
			     }

			}

			

		    //xbox controller joysticks
		    var r_controller_x = Input.GetAxis("RightJoystickHorizontal") * Time.deltaTime * speed;
		    var r_controller_y = -Input.GetAxis("RightJoystickVertical") * Time.deltaTime * speed;
		
		    var l_controller_x = Input.GetAxis("LeftJoystickHorizontal") * Time.deltaTime * speed_mult * speed;
	        var l_controller_y = -Input.GetAxis("LeftJoystickVertical") * Time.deltaTime * speed_mult * speed;

	        transform.Rotate(0, r_controller_x, 0, Space.World);
	        transform.Rotate(-r_controller_y, 0, 0);

	        transform.Translate(l_controller_x, 0, 0);
	        transform.Translate(0, 0, l_controller_y);


	        //xbox controller triggers (for moving up and down)
	        var trigger_val = Input.GetAxis("Right_Trigger") * Time.deltaTime * speed_mult * speed;
	        transform.Translate(new Vector3(0,-trigger_val,0));

		     //adjust speed
		     if(Input.GetKeyDown(KeyCode.Minus) || Input.GetButtonDown("Left_Bumper") || Input.GetButtonDown("X_Button"))
		     {
		     	//decrease speed
		     	speed = Mathf.Max(10, (speed-10));
		     }
		     if(Input.GetKeyDown(KeyCode.Equals) || Input.GetButtonDown("Right_Bumper") || Input.GetButtonDown("B_Button"))
		     {
		     	//increase speed
		     	speed = Mathf.Min(100, (speed+10));
		     }



		     Speed_Text.text = speed.ToString() + "%";
		}

	}
}