using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class general_program_controls : MonoBehaviour {

    public GameObject StdInfo_display;
    public GameObject LatLong_display;
    public GameObject ICAO_display;

    bool is_enabled = true;

    // Use this for initialization
    void Start () {
		
	}
	
	// Update is called once per frame
	void Update () {

        //toggle user interfaces
        if (Input.GetKeyDown(KeyCode.BackQuote) || Input.GetButtonDown("Back_Button"))
        {
            is_enabled = !is_enabled;

            StdInfo_display.SetActive(is_enabled);
            LatLong_display.SetActive(is_enabled);
            ICAO_display.SetActive(is_enabled);
        }

        //escape key to quit
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            Application.Quit();
        }

    }
}
