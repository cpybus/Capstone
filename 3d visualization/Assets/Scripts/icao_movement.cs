
using UnityEngine;
using UnityEngine.UI;

public class icao_movement : MonoBehaviour {

    public Transform main_player_t; //main player transform
    public GameObject Map;
    public InputField ICAO_InputField;
    public Button submitButton;

    // Use this for initialization
    void Start () {
        Button btn = submitButton.GetComponent<Button>();
        btn.onClick.AddListener(TaskOnClick);
    }
	
	// Update is called once per frame
	void Update () {
		
	}

    void TaskOnClick()
    {
        string icao = ICAO_InputField.text; //gets the inputted icao
        GameObject plane = GameObject.Find(icao); //finds the gameobject based on icao


        if (plane != null)
        {
            Vector3 newpos = plane.transform.position;
            newpos.y = newpos.y + 300;
			main_player_t.transform.position = newpos;
            main_player_t.transform.LookAt(plane.transform.position);
        }

    }
}
