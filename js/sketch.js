var container, scene, camera, renderer, controls, stats;
var light1, lightPosition;
var lightAngle = 100;



init();
animate();

// FUNCTIONS 		
function init() 
{
	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,800);
	camera.lookAt(scene.position);	
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	container.appendChild( renderer.domElement );
	// EVENTS
	
	// CONTROLS
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	// LIGHT
	light1 = new THREE.PointLight(0xffffff, 2);
	light1.position.set(0,0,0);
	scene.add(light1);
	scene.add(new THREE.PointLightHelper(light1, 100));

	
	light2 = new THREE.PointLight(0xffffff, 0.4);
	light2.position.set(1000,0,1000);
	scene.add(light2);
	scene.add(new THREE.PointLightHelper(light2, 100));
 
	////////////
	// CUSTOM //
	////////////

    var sphereGeo = new THREE.SphereGeometry(100, 32, 16);
	
    // Create the Earth with nice texture

	var colors = THREE.ImageUtils.loadTexture( "images/earth-day.jpg" );

	var earthMaterial = new THREE.MeshBasicMaterial( { 
		wireframe: false, 
		color: 0xffffff, 
		shading: THREE.FlatShading,
		map: colors 
	} );

    this.earthSphere = new THREE.Mesh( sphereGeo, earthMaterial ); 
    scene.add(earthSphere);	
	
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);

	// var GCNY = convertLatLonToVec3(40.7, -73.6).multiplyScalar(100.5);
	// var NOLA = convertLatLonToVec3(30,-90).multiplyScalar(100.5);	
	// drawCurve( createSphereArc(GCNY,NOLA), 0x00FFFF );
}


//    	addSatellites();

// function addSatellites() {
// 	addMarker(20, -160, 0xFF0000); // Near Hawaii
// 	addMarker(40.7, -73.6, 0x0000FF); // Garden City, NY
// 	addMarker(30,-90, 0x00FF00); // New Orleans, LA
// 	addMarker(10.7, -123.6, 0x0000FF); // Garden City, NY
// 	addMarker(-30,-190, 0x00FF00); // New Orleans, LA
// }


function addMarker(lat, lon, alt)
{
	var marker = new THREE.Mesh( new THREE.SphereGeometry(2, 8, 4), new THREE.MeshBasicMaterial({color:0xFFFFFF, transparent: true, opacity: 8}) );

	
	lat =  lat * Math.PI / 180.0;
	lon = -lon * Math.PI / 180.0;

	var posX = Math.cos(lat) * Math.cos(lon); 
	var posY = Math.sin(lat);
	var posZ = Math.cos(lat) * Math.sin(lon) ;
	var altitude = 5000 + alt;


	marker.position.set( posX, posY, posZ).multiplyScalar(altitude/50);
	scene.add(marker)
}


// function addMarker(lat, lon, colory)
// {
// 	var radius = 100;
// 	var marker = new THREE.Mesh( new THREE.SphereGeometry(1, 8, 4), new THREE.MeshBasicMaterial({color:colory}) );
// 	marker.position = convertLatLonToVec3(lat,lon).multiplyScalar(radius);
// 	scene.add(marker)
// }

// function convertLatLonToVec3(lat,lon)
// {
// 	lat =  lat * Math.PI / 180.0;
// 	lon = -lon * Math.PI / 180.0;
// 	return new THREE.Vector3( 
// 		Math.cos(lat) * Math.cos(lon), 
// 		Math.sin(lat), 
// 		Math.cos(lat) * Math.sin(lon) );
// }

function greatCircleFunction(P, Q)
{
	var angle = P.angleTo(Q);
	return function(t)
	{
	    var X = new THREE.Vector3().addVectors(
			P.clone().multiplyScalar(Math.sin( (1 - t) * angle )), 
			Q.clone().multiplyScalar(Math.sin(      t  * angle )))
			.divideScalar( Math.sin(angle) );
	    return X;
	};
}

function createSphereArc(P,Q)
{
	var sphereArc = new THREE.Curve();
	sphereArc.getPoint = greatCircleFunction(P,Q);
	return sphereArc;
}

function drawCurve(curve, color)
{
	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices = curve.getPoints(100);
	lineGeometry.computeLineDistances();
	var lineMaterial = new THREE.LineBasicMaterial();
	lineMaterial.color = (typeof(color) === "undefined") ? new THREE.Color(0xFF0000) : new THREE.Color(color);
	var line = new THREE.Line( lineGeometry, lineMaterial );
	scene.add(line);
}

function animate() 
{

	lightPosition = lightAngle * Math.PI / 180;
	light1.position.x = 800*Math.cos(lightPosition) + 0;
	light1.position.z = 800*Math.sin(lightPosition) + 0;
	lightAngle = lightAngle + 0.4;

    requestAnimationFrame( animate );
	render();		
	update();
}

function update()
{
	controls.update();
	stats.update();
}

function render() 
{
	renderer.clear();
    renderer.render(scene, camera);
}