using UnityEngine;
using System.Collections;
 
public class FlyC: MonoBehaviour{
        //The purpose of this script is to simulate Newtonian phy
        private float maxThrust = 600; //The maximum Thrust provided by the thruster(s) at full throttle
        private float rollWeight = 3; //This float and the next two only serve to adjust sensitivity
        private float pitchWeight = 3;//of the controls, and to allow calibration for more massive ships.
        private float yawWeight = 3;//Set these 3 floats to the mass of the rigidbody for sensitive controls

	public static float throttle=1;
	public Transform prop;
	private bool crashed=false;
	public Transform plane;
	public AudioClip audiocrash;
	public AudioClip audiodisapointment;
	public Transform smoke;
	public Material mat;

	void Start(){
		throttle=1;
	}

        void FixedUpdate ()     {
        float yaw = yawWeight*Input.GetAxis("Horizontal");
        float roll = rollWeight*Input.GetAxis("Vertical");
        Vector3 Rotation = new Vector3(roll,0, -yaw);
		GetComponent<AudioSource>().pitch=-roll/5+throttle;
		if(yaw==0 && roll==0)
		GetComponent<Rigidbody>().angularVelocity=GetComponent<Rigidbody>().angularVelocity*0.95f;
		transform.Translate(0,0,throttle);
		transform.Rotate(roll,0,-yaw);

		if(Input.GetKey(KeyCode.LeftShift) && throttle<3)
			throttle+=0.05f;
		if(Input.GetKey(KeyCode.LeftControl) && throttle>0)
			throttle-=0.05f;

		if(throttle<0.5f){
			transform.Rotate(0,0,1,Space.World);
			transform.Translate(0,0,1);
			transform.Translate(0,-throttle,0,Space.World);
		}
			GetComponent<Rigidbody>().drag=throttle;
        }



	void OnCollisionEnter(Collision col){
		if(crashed)
			return;
		crashed=true;
		throttle=0;
		GetComponent<Rigidbody>().useGravity=true;
		prop.GetComponent<SimpleRotate>().Crashed(0);
		//plane.GetComponent<MeshDeformator>().deform();
		GetComponent<Rigidbody>().velocity*=5;
		AudioSource.PlayClipAtPoint(audiocrash,transform.position);
		GetComponent<ParticleEmitter>().Emit();
		Vector3 velo=smoke.GetComponent<ParticleEmitter>().worldVelocity;
		velo.y=6;
		smoke.Translate (0,2,0);
		smoke.GetComponent<ParticleEmitter>().worldVelocity=velo;
		smoke.GetComponent<ParticleEmitter>().minSize=1;
		smoke.GetComponent<ParticleEmitter>().maxSize=10;
		smoke.GetComponent<ParticleRenderer>().material=mat;
		GetComponent<AudioSource>().Stop();
		foreach (Transform trans in plane){
			Debug.Log (trans.name);
			if(trans.name.StartsWith("DO_")){
				GameObject go=trans.gameObject;
				go.AddComponent<Rigidbody>();
				go.GetComponent<Rigidbody>().useGravity=true;
				go.GetComponent<Rigidbody>().drag=0.5f;
				go.GetComponent<Rigidbody>().mass=1100;
				go.GetComponent<Rigidbody>().angularDrag=0.1f;
				go.AddComponent<BoxCollider>();
			}
			if(trans.name.Contains("MOTOR")){
				trans.GetComponent<Rigidbody>().drag=0.1f;
				trans.GetComponent<Rigidbody>().mass=200000;
			}
			if(trans.name.Contains("TRUP")){
				trans.GetComponent<Rigidbody>().drag=0.1f;
				trans.GetComponent<Rigidbody>().mass=100000;
				GameObject.Find("maincameraR").GetComponent<StereoCamera>().target=trans;
				GameObject.Find("maincameraR").GetComponent<StereoCamera>().distance=30;
			}


		}  
		plane.DetachChildren();
		Invoke("Restart",5);
		Invoke("disapointment",1.5f);
	}
	void disapointment(){
		AudioSource.PlayClipAtPoint(audiodisapointment,transform.position);
	}
	void Restart(){
		Application.LoadLevel(Application.loadedLevel);
	}
}