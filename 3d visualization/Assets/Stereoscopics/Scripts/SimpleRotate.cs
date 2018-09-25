using UnityEngine;
using System.Collections;

public class SimpleRotate : MonoBehaviour {
	public Vector3 rot=new Vector3(0,1,0);
	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
		rot.x=FlyC.throttle*10;
		transform.Rotate(rot);
	}
	public void Crashed(float damage){
		rot=Vector3.zero;
	}
}
