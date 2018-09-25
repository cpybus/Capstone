using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class movementtest : MonoBehaviour {

	public float speed = 5f;
	public int t = 2;

	// Use this for initialization
	void Start () {

		InvokeRepeating("Update_Position", 0, t); //calls Update_Position() every 2 secs
	}


	// Update is called once per frame
    void Update() {

	}
	
	// Update_Position is called once every t seconds
	void Update_Position() {
		
		int step = 10;

		transform.position = new Vector3(transform.position.x, transform.position.y, transform.position.z-step);

	}
}
