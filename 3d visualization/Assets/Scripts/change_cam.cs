using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

/* based on code from http://answers.unity3d.com/questions/1329439/switch-between-cameras-in-c.html */

public class change_cam : MonoBehaviour {

	public Camera Standard_Camera;
	public KeyCode TKey;
	public int camSwitch;
	public int num_views;
	public Text Camera_Text;
	public Canvas StdInfo_display;
	public GameObject StdInfo_panel;

	public Camera lefteye_cam;
	public Camera righteye_cam;

	public InputField ICAO_input_field;
	public InputField Lat_input_field;
	public InputField Long_input_field;

	//eye distance for stereoscopic view
	public float eye_dist = 0.75F;

	Vector3 center_position;

	// Use this for initialization
	void Start () 
	{

		//initialize
		camSwitch = 0;
		num_views = 3;

		//remove unnecessary audio listeners (and prevent warnings)
		lefteye_cam.GetComponent<AudioListener>().enabled = false;
		righteye_cam.GetComponent<AudioListener>().enabled = false;

		//separate stereoscopic cameras
		Vector3 offsetL = new Vector3((eye_dist/2),0,0);
		lefteye_cam.transform.position = lefteye_cam.transform.position + offsetL;


		Vector3 offsetR = new Vector3(-(eye_dist/2),0,0);
		righteye_cam.transform.position = righteye_cam.transform.position + offsetR;

		center_position = StdInfo_panel.transform.position;

		switch(camSwitch)
		{
			case 0:
				standard_display();
				break;

			case 1:
				vr_ready_display();
				break;

			case 2:
				stereoscopic_display();
				break;

			default:
				standard_display();
				break;

		}


		
	    
	}

	void Update()
	{

		//for keys, make sure not inside text box before applying actions
		if(ICAO_input_field.isFocused == false && Lat_input_field.isFocused == false && Long_input_field.isFocused == false)
		{

			//tab key
		    if (Input.GetKeyDown(TKey))
		    {

		    	camSwitch = (camSwitch + 1)%num_views;

				switch(camSwitch)
				{
					case 0:
						standard_display();
						break;

					case 1:
						vr_ready_display();
						break;

					case 2:
						stereoscopic_display();
						break;

					default:
						standard_display();
						break;

				}
		    }

		    //number keys 1, 2, & 3
		    else if (Input.GetKeyDown(KeyCode.Alpha1))
		    {
		    	standard_display();
		    }

		    else if (Input.GetKeyDown(KeyCode.Alpha2))
		    {
		    	vr_ready_display();
		    }

		    else if (Input.GetKeyDown(KeyCode.Alpha3))
		    {
		    	stereoscopic_display();
		    }

		}
	}

	void standard_display()
	{
		Standard_Camera.gameObject.SetActive(true);
		lefteye_cam.gameObject.SetActive(false);
		righteye_cam.gameObject.SetActive(false);

		StdInfo_display.renderMode = RenderMode.ScreenSpaceOverlay;

		
		StdInfo_panel.transform.position = center_position;

		Camera_Text.text = "Standard View";
	}

	void vr_ready_display()
	{
		Standard_Camera.gameObject.SetActive(true);
		lefteye_cam.gameObject.SetActive(false);
		righteye_cam.gameObject.SetActive(false);

		StdInfo_display.renderMode = RenderMode.ScreenSpaceCamera;
		StdInfo_display.worldCamera = Standard_Camera;

		Vector3 cur_position = StdInfo_panel.transform.position;
		StdInfo_panel.transform.position = center_position;

		Camera_Text.text = "VR-Ready View";
	}

	void stereoscopic_display()
	{
		Standard_Camera.gameObject.SetActive(false);
		lefteye_cam.gameObject.SetActive(true);
		righteye_cam.gameObject.SetActive(true);

		StdInfo_display.renderMode = RenderMode.ScreenSpaceOverlay;

		Vector3 cur_position = StdInfo_panel.transform.position;
		StdInfo_panel.transform.position = new Vector3(center_position.x + (Screen.width/4),center_position.y, center_position.z);

		Camera_Text.text = "3D TV View";
	}


}

