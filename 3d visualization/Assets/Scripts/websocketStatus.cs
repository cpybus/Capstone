using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
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

public class websocketStatus : MonoBehaviour {

    public Button connectButton;
    public Button disconnectButton;
    public Button refreshButton;

    public Text statusReport;

    private int pastStatus;

    // Use this for initialization
    void Start ()
    {
        pastStatus = 0;

        Button btn = disconnectButton.GetComponent<Button>();
        btn.onClick.AddListener(TaskOnClick_Disconnect);

        Button btn2 = connectButton.GetComponent<Button>();
        btn2.onClick.AddListener(TaskOnClick_Connect);

        Button btn3 = refreshButton.GetComponent<Button>();
        btn3.onClick.AddListener(TaskOnClick_Refresh);
    }
	
	// Update is called once per frame
	void Update ()
    {
        if(pastStatus != create_Objects.connectionStatus)
        {
            if (create_Objects.connectionStatus == 2)
            {
                statusReport.text = "Connected";
            }
            else if (create_Objects.connectionStatus == 0)
            {
                statusReport.text = "NOT Connected";
            }
            else if (create_Objects.connectionStatus == 1)
            {
                statusReport.text = "Attemping connection...";
            }
            pastStatus = create_Objects.connectionStatus;
        }
    }

    void TaskOnClick_Connect()
    {
        create_Objects.startBackUp = true;
    }

    void TaskOnClick_Disconnect()
    {
        create_Objects.disconnectRequested = true;

    }

    void TaskOnClick_Refresh()
    {
        
        
    }
}
