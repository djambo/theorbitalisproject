var container, scene, camera, renderer, controls, stats;
var light1, lightPosition;
var lightAngle = 100;
var particleGeometry, particleSystem;
var isGenerating = true;

var hemilight;

var mouseX, mouseY;
var orbitMesh;

var orbits = [];
var time = 1;

var currentPosition;

var ctrls = {
	name: "David Walsh",
	speed: 1,
	steps: 1,
	sectionradius: 3, 
	sectionsides: 8,
	followSatCamera: false
	// wireframe: true
};

// var speed = 0.1;
//=========================================

var num = 1;
var clock           = new Cesium.Clock();
var satrecs         = [];   // populated from onclick file load
var satdesigs       = [];   // populated from onclick file load
var satnames        = [];   // populated from onclick file load
var satids          = [];   // populated from onclick file load
var satPositions    = [];   // calculated by updateSatrecsPosVel()
var WHICHCONST      = 84;   //
var TYPERUN         = 'm';  // 'm'anual, 'c'atalog, 'v'erification
var TYPEINPUT       = 'n';  // HACK: 'now'
var PLAY            = false;
var SAT_POSITIONS_MAX = 1; // Limit numer of positions displayed to save CPU
var CALC_INTERVAL_MS  = 0;
var GLOBAL_MARKERS = [];


function getSatrecsFromTLEFile(fileName) {
    var tles = tle.parseFile(fileName);
    var satnum, max, rets, satrec, startmfe, stopmfe, deltamin;

    // Reset the globals
    satrecs = [];
    satnames = [];
    satdesigs = [];
    satids = [];

    tles.sort();            // sort by name (0th element) to improve table
    for (satnum = 0, max = tles.length; satnum < max; satnum += 1) {
        satnames[satnum] = tles[satnum][0].trim();        // Name: (ISS (ZARYA))
        satdesigs[satnum] = tles[satnum][1].slice(9, 17); // Intl Designator YYNNNPPP (98067A)
        satids[satnum]   = tles[satnum][2].split(' ')[1]; // NORAD ID (25544)
        rets = twoline2rv(WHICHCONST, tles[satnum][1], tles[satnum][2], TYPERUN, TYPEINPUT);
        satrec   = rets.shift();
        startmfe = rets.shift();
        stopmfe  = rets.shift();
        deltamin = rets.shift();
        satrecs.push(satrec); // Don't need to sgp4(satrec, 0.0) to initialize state vector
    }
    // Returns nothing, sets globals: satrecs, satnames, satids
}

function updateSatrecsPosVel(satrecs, julianDate) {
    var satrecsOut = [];
    var positions = [];
    var velocities = [];
    var satnum, max, jdSat, minutesSinceEpoch, rets, satrec, r, v;

    for (satnum = 0, max = satrecs.length; satnum < max; satnum += 1) {
        jdSat = new Cesium.JulianDate.fromTotalDays(satrecs[satnum].jdsatepoch);
        minutesSinceEpoch = jdSat.getMinutesDifference(julianDate);
        rets = sgp4(satrecs[satnum], minutesSinceEpoch);
        satrec = rets.shift();
        r = rets.shift();      // [1802,    3835,    5287] Km, not meters
        v = rets.shift();
        satrecsOut.push(satrec);
        positions.push(r);
        velocities.push(v);
    }
    // UPDATE GLOBAL SO OTHERS CAN USE IT (TODO: make this sane w.r.t. globals)
    satPositions = positions;
    return {'satrecs': satrecsOut,
            'positions': positions,
            'velocities': positions};
}


function fMod2p(x) {
    var i = 0;
    var retVal = 0.0;
    var twopi = 2.0 * Math.PI;

    retVal = x;
    i = parseInt(retVal / twopi, 10);
    retVal -= i * twopi;

    if (retVal < 0.0) {
        retVal += twopi;
    }

    return retVal;
}

function calcLatLonAlt(time, position, satellite) {
    var r = 0.0,
        e2 = 0.0,
        phi = 0.0,
        c = 0.0,
        f = 3.35281066474748E-3,
        twopi = 6.28318530717958623,
        pio2 = 1.57079632679489656,
        pi = 3.14159265358979323,
        xkmper = 6378.137,
        rad2degree = 57.295;

    satellite.theta = Math.atan2(position[1],position[0]);
    satellite.lonInRads = fMod2p(satellite.theta - gstime(time));
    r = Math.sqrt(Math.pow(position[0], 2) + Math.pow(position[1], 2));
    e2 = f * (2 - f);
    satellite.latInRads = Math.atan2(position[2], r);

    do {
        phi = satellite.latInRads;
        c = 1 / Math.sqrt(1 - e2 * Math.pow(Math.sin(phi), 2));
        satellite.latInRads = Math.atan2((position[2] + xkmper * c * e2 * Math.sin(phi)), r);

    } while (Math.abs(satellite.latInRads - phi) >= 1E-10);

    satellite.alt = r / Math.cos(satellite.latInRads) - xkmper * c;

    if (satellite.latInRads > pio2) {
        satellite.latInRads -= twopi;
    }

    if (satellite.lonInRads > pio2) {
        satellite.lonInRads = -twopi + satellite.lonInRads;
    }

    satellite.latInDegrees = satellite.latInRads * rad2degree;
    satellite.lonInDegrees = satellite.lonInRads * rad2degree;
}


function displayPositions(time, sats) {
    // var positionTable = document.getElementById('positions');
    // var tbody = positionTable.getElementsByTagName('tbody')[0];
    var satnum, max, pos0, vel0, vel0Carte, carte, carto, newRow, latLonAlt;

    // if (typeof tbody !== 'undefined' && tbody !== null) {
    //     positionTable.removeChild(tbody);
    // }
    // tbody = document.createElement('tbody');
    // positionTable.appendChild(tbody);
    for (satnum = 0, max = satrecs.length; satnum < max && satnum < SAT_POSITIONS_MAX; satnum += 1) {
        pos0 = sats.positions[satnum];                 // position of first satellite
        vel0 = sats.velocities[satnum];
        latLonAlt = calcLatLonAlt(time, satPositions[satnum], satrecs[satnum]);
        // vel0Carte = new Cesium.Cartesian3(vel0[0], vel0[1], vel0[2]);
        // carte = new Cesium.Cartesian3(pos0[0], pos0[1], pos0[2]);
        // BUG: carto giving bad valus like -1.06, 0.88, -6351321 or NaN; radians instead of degrees?
        // carto = ellipsoid.cartesianToCartographic(carte); // BUG: Values are totally unrealistic, height=NaN
        // newRow = tbody.insertRow(-1);
        // newRow.insertCell(-1).appendChild(document.createTextNode(satnames[satnum]));
        // newRow.insertCell(-1).appendChild(document.createTextNode(satids[satnum]));
        // newRow.insertCell(-1).appendChild(document.createTextNode(Cesium.Cartesian3.magnitude(vel0Carte).toFixed(0)));
        // newRow.insertCell(-1).appendChild(document.createTextNode(satrecs[satnum].latInDegrees.toFixed(3)));
        // newRow.insertCell(-1).appendChild(document.createTextNode(satrecs[satnum].lonInDegrees.toFixed(3)));
        // var heightkm = satrecs[satnum].alt;
        // var heightm = heightkm * 0.621371;
        // newRow.insertCell(-1).appendChild(document.createTextNode(heightkm.toFixed(3)));
        // newRow.insertCell(-1).appendChild(document.createTextNode(heightm.toFixed(3)));

        //DISPLAY SATELLITES OF SELECTED GROUP IN THE CONSOLE
        // console.log(satrecs[satnum].latInDegrees.toFixed(3),satrecs[satnum].lonInDegrees.toFixed(3))
		
        if(isGenerating == true){
            addSat(satnum, satrecs[satnum].latInDegrees.toFixed(3),satrecs[satnum].lonInDegrees.toFixed(3),satrecs[satnum].alt);
        } else{   
            updateSatPos(satnum, satrecs[satnum].latInDegrees.toFixed(3),satrecs[satnum].lonInDegrees.toFixed(3),satrecs[satnum].alt);
        }     
    }
    isGenerating = false;
}


function computeStats() {

    var currentTime = clock.tick();

    var now = new Cesium.JulianDate(); // TODO: we'll want to base on tick and time-speedup
    var time = now.getJulianDayNumber() + now.getJulianTimeFraction() ;

    if (PLAY) {
        // document.getElementById('date').textContent = currentTime.toDate();
    }
    if (satrecs.length > 0 && PLAY) {
        var sats = updateSatrecsPosVel(satrecs, now); // TODO: sgp4 needs minutesSinceEpoch from timeclock
        satrecs = sats.satrecs;                       // propagate [GLOBAL]
        displayPositions(time, sats);
    }
}


//==========//==========//==========//==========//==========//==========//==========


init();
animate();

getSatrecsFromTLEFile('tle/SMD.txt');
document.getElementById('select_satellite_group').onchange = function () {
    getSatrecsFromTLEFile('tle/' + this.value + '.txt'); // TODO: security risk?
};

// FUNCTIONS 		
function init() 
{
	// SCENE
	scene = new THREE.Scene();

	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 1000000;
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
	
	var gui = new dat.GUI();
	// gui.add(text, 'Time Speed');
  	gui.add(ctrls, 'speed', -10, 10);
  	gui.add(ctrls, 'sectionradius', 1, 20);
  	gui.add(ctrls, 'sectionsides', 3, 20);
  	gui.add(ctrls, 'followSatCamera')
  	// gui.add(text, 'displayOutline');
  	// gui.add(text, 'explode');
	scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0002 );

	// CONTROLS
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.noZoom = true;
	controls.noPan = true;

	controls.dynamicDampingFactor = 0.2;

	// controls.minDistance = radius * 1.1;
	// controls.maxDistance = radius * 25;
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	// LIGHT
	// light1 = new THREE.PointLight(0xffffff, 0.5);
	// light1.position.set(0,0,0);
	// scene.add(light1);
	// scene.add(new THREE.PointLightHelper(light1, 100));

	
	// light2 = new THREE.PointLight(0xffffff, 0.4);
	// light2.position.set(1000,0,1000);
	// scene.add(light2);
	// scene.add(new THREE.PointLightHelper(light2, 100));


 	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.9 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 500, 0 );
	scene.add( hemiLight );
 
// SKYDOME
	var vertexShader = document.getElementById( 'vertexShader' ).textContent;
	var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	var uniforms = {
		topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
		bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
		// topColor: 	 { type: "c", value: new THREE.Color( 0x000000 ) },
		// bottomColor: { type: "c", value: new THREE.Color( 0x000000 ) },

		offset:		 { type: "f", value: 33 },
		exponent:	 { type: "f", value: 0.6 }
	}
	
	uniforms.topColor.value.copy( hemiLight.color );

	scene.fog.color.copy( uniforms.bottomColor.value );


	var skyGeo = new THREE.SphereGeometry( 10000, 32, 15 );
	var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

	var sky = new THREE.Mesh( skyGeo, skyMat );
	scene.add( sky );


	////////////
	// CUSTOM //
	////////////

    var sphereGeo = new THREE.IcosahedronGeometry( 100, 1);
	
    // Create the Earth with nice texture

	var colors = THREE.ImageUtils.loadTexture( "images/earth-day.jpg" );

	var earthMaterial = new THREE.MeshPhongMaterial( { 
		wireframe: true, 
		wireframeLinewidth: 10,
		color: 0x2dceff, 
		shading: THREE.FlatShading,
		// map: colors 
	} );

    this.earthSphere = new THREE.Mesh( sphereGeo, earthMaterial ); 
    scene.add(earthSphere);	
	
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);

	window.addEventListener('mousemove', mouseMonitor);

	createSatGroup();
}

function createSatGroup(){

	particleGeometry = new THREE.Geometry();

	var particleMaterial = new THREE.PointCloudMaterial({
		size: 20, 
		vertexColors: THREE. VertexColors, 
		depthTest: true, 
		opacity: 0.5, 
		sizeAttenuation: false, 
		transparent: true
	});

	particleSystem = new THREE.PointCloud(
	  	particleGeometry,
	    particleMaterial
	);

	scene.add(particleSystem);

}


function updateOrbit(orbit) {

	// scene.remove( orbitMesh );

	// if(extrusionPathPoints.length>0){
	// } else {
	// 	var extrusionPathPoints = [];
	// 		extrusionPathPoints.push(new THREE.Vector3(posX, posY, posZ).multiplyScalar(alt/50));
		

	var extrusionPath =  new THREE.SplineCurve3( orbit.vertices );


	var extrudeSettings = {
		// amount			: 1,
		steps			: ctrls.steps,
		bevelEnabled	: false,
		extrudePath		: extrusionPath,
		// curveSegments 	: 10
		// bevelThickness — float. how deep into the original shape bevel goes
		// bevelSize — float. how far from shape outline is bevel
		// bevelSegments — int. number of bevel layers
		// extrudePath — THREE.CurvePath. 3d spline path to extrude shape along. (creates Frames if (frames aren't defined)
		// frames — THREE.TubeGeometry.FrenetFrames. containing arrays of tangents, normals, binormals
		};
	

	var circleGeometry = new THREE.CircleGeometry( ctrls.sectionradius, ctrls.sectionsides );
	var orbitSection = new THREE.Shape( circleGeometry.vertices );

	var orbitGeometry = new THREE.ExtrudeGeometry( orbitSection, extrudeSettings );


	var orbitMaterial = new THREE.MeshLambertMaterial( { color: 0xff2990, wireframe: false, shading: THREE.FlatShading } );
	
	var glassMaterialSmooth = new THREE.MeshPhongMaterial( {
		color: 0xffffff,
		specular: 0xffaa55,
		shininess: 10000,
		vertexColors: THREE.NoColors,
		shading: THREE.SmoothShading
	} );
	glassMaterialSmooth.glass = true;
	glassMaterialSmooth.reflectivity = 0.25;
	glassMaterialSmooth.refractionRatio = 0.6;

	orbitMesh = new THREE.Mesh( orbitGeometry, orbitMaterial );
			
	// console.log(orbitMesh.geometry);

	scene.add( orbitMesh );
}


function updateSatPos(num, lat, lon, alt) {
	
	lat =  (lat * time)* Math.PI / 180.0;
	lon =  (-lon * time)* Math.PI / 180.0; 


	var posX = Math.cos(lat) * Math.cos(lon);	var posY = Math.sin(lat);
	var posZ = Math.cos(lat) * Math.sin(lon) ;
	var altitude = 5000 + alt;

	particleGeometry.vertices[num].x = posX;
	particleGeometry.vertices[num].y = posY;
	particleGeometry.vertices[num].z = posZ;
	particleGeometry.vertices[num].multiplyScalar(altitude/50);

	particleGeometry.verticesNeedUpdate = true;

	currentPosition = new THREE.Vector3(posX, posY, posZ).multiplyScalar(altitude/50);

	orbits[num].vertices.unshift(currentPosition);
	orbits[num].vertices.pop();

	updateOrbit(orbits[num]);
}



// function clearCanvas(array) {
//  	var array = [];
// }


function addSat(num, lat, lon, alt) {

	lat =  lat * Math.PI / 180.0;
	lon = -lon * Math.PI / 180.0;

	var posX = Math.cos(lat) * Math.cos(lon); 
	var posY = Math.sin(lat);
	var posZ = Math.cos(lat) * Math.sin(lon) ;
	var altitude = 5000 + alt;

	// var colors = [ 0x000000, 0xff0080, 0x8000ff, 0xffffff ];
	var colors = [0x8000ff];

	particleGeometry.dispose() 
	particleGeometry.vertices.push(new THREE.Vector3(posX, posY, posZ).multiplyScalar(altitude/50));
	particleGeometry.colors.push( new THREE.Color( colors[ Math.floor( Math.random() * colors.length ) ] ) );

	orbits[num] = new THREE.Geometry();	 

	for (i=0; i<4; i++){
    	orbits[num].vertices.push(new THREE.Vector3(posX, posY, posZ).multiplyScalar(altitude/50));
    }
    orbits[num].dynamic = true;
}

function animate() {

    requestAnimationFrame( animate );

    if(PLAY) {
		computeStats();
	}
	
	// lightPosition = lightAngle * Math.PI / 180;
	// light1.position.x = 800*Math.cos(lightPosition) + 0;
	// light1.position.z = 800*Math.sin(lightPosition) + 0;
	// lightAngle = lightAngle + 0.4;
	
	// console.log(mouseX,mouseY);
	time = time + ctrls.speed/100;
	render();		


	if(ctrls.followSatCamera){
		camera.position.set(currentPosition.x,currentPosition.y, currentPosition.z).multiplyScalar(4);
		camera.lookAt(scene.position)
	} else {
	    controls.update();
	}
	stats.update();
}

function render() {
	renderer.clear();
    renderer.render(scene, camera);
}


window.onresize = function() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function mouseMonitor( event ) {
    event.preventDefault();
    mouseX =  ( event.clientX / window.innerWidth ) * 20 - 1;
    mouseY = - ( event.clientY / window.innerHeight ) * 20 + 1;
}
//TODO:
//REDUCE WIREFRAME LINE NUMBER
// LET THE CLOCK START WHEN PRESS PLAY
//ITEGRATE TRACKBALL CONTROLS WITH AN IF STATEMENT TO KEEP IT SPINNING 
// APPLY TUBEGEOMETRY TO ORBITS
//NORMALIZE ORBITS RADIUS IN 8 LEVELS
//STROKE REVEAL
//ANIMATE!
//CONNECT EVERY ORBIT WITH 4 LINES TO THE CORE
//STARS
//PIXEL NOISE SHADER
//ADDITIONAL
//AUDIO