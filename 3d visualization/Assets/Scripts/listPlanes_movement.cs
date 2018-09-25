using Mapbox.Unity.Map;
using Mapbox.Unity.Utilities;
using Mapbox.Utils;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Mapbox.Map;

public class listPlanes_movement : MonoBehaviour
{

    public Transform main_player_t; //main player transform
    public GameObject Map;
    public ScrollRect scrollView;
    public Button submitButton;


    // Use this for initialization
    void Start()
    {
        Button btn = submitButton.GetComponent<Button>();
        btn.onClick.AddListener(TaskOnClick);
    }

    // Update is called once per frame
    void Update()
    {
        if(create_Objects.planes != null)
        {
            
        }
    }

    void TaskOnClick()
    {
       
    }
}
