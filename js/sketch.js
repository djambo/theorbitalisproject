var container, scene, camera, renderer, controls, stats;
var light1, lightPosition;
var lightAngle = 100;
var particleGeometry, particleSystem;
var isGenerating = true;

var hemilight;

var boomer; // animators


var mouseX, mouseY;
var orbitMesh;

var orbits = [];
var orbite = [];
var camNeedReset = false;
var cameraAngle =100;
var camSpeed = 2;

var container;
var orbitsGroup = new THREE.Object3D();

var followSatCamera = false;

// var newColor;

var time = 1;
var isExporting = false;

var currentPosition;
var isDrawing = false;

var selectedSat;

var isStarting = false;
var isDrawing = false;
var isSuspending = false;

var speed = 1;

var earthSphere, cloudSphere;

var threeClock = new THREE.Clock();


var earthRadius = 100;

var satList = document.getElementById("satellites");

//=========================================
//CESIUM VARIABLES
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
var PLAY            = true;
var SAT_POSITIONS_MAX = 250; // Limit numer of positions displayed to save CPU
var CALC_INTERVAL_MS  = 0;
var GLOBAL_MARKERS = [];
//==========================================

var emitter, particleGroup;

init();
animate();

getSatrecsFromTLEFile('tle/SMD.txt');

document.getElementById('select_satellite_group').onchange = function () {
	clearSats();
	isDrawing = false;
	$( "#satellites li, #draw_button, #camera_button" ).removeClass('active');
   	getSatrecsFromTLEFile('tle/' + this.value + '.txt'); // TODO: security risk?
};

function init() {
	container = document.getElementById("container");
	// SCENE AND CAMERA
	scene = new THREE.Scene();
 	camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 10000);

	scene.add(camera);
	camera.position.set(0,150,800);
	camera.lookAt(scene.position);	
	// RENDERER
	renderer = new THREE.WebGLRenderer( {antialias:true, alpha: true } );
	renderer.setSize(container.offsetWidth, container.offsetHeight);
	container.appendChild(renderer.domElement);

	// CONTROLS
	// var gui = new dat.GUI();
  	// gui.add(ctrls, 'speed', 0, 5);
  	// gui.add(ctrls, 'satMaxWidth', 0, 1000);

	// // CONTROLS
	// controls = new THREE.TrackballControls( camera, renderer.domElement );
	// controls.noZoom = false;
	// controls.noPan = true;

	// controls.dynamicDampingFactor = 0.2;

	// controls.minDistance = earthRadius * 5;
	// controls.maxDistance = earthRadius * 30;
	
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;

	// scene.add(new THREE.AmbientLight(0x333333));

	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(500,300,500);
	scene.add(light);


 	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.4 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.6, 1, 0.6 );
	hemiLight.position.set( 0, 500, 0 );
	scene.add( hemiLight );
 
	
	var particleCount = 800,
	    particles = new THREE.Geometry(),
	    pMaterial = new THREE.PointCloudMaterial({ color: 0xFFFFFF, size: 4 });

	for (var p = 0; p < particleCount; p++) {
		var pX = Math.random() * 6000 - 3000,
		    pY = Math.random() * 6000 - 3000,
		    pZ = Math.random() * 6000 - 3000,
		    particle = new THREE.Vector3(pX, pY, pZ);

		    if(particle.distanceTo(scene.position)>3000){
				particles.vertices.push(particle);
		    }
	}

	var stars = new THREE.PointCloud( particles, pMaterial);
	scene.add(stars);

    var glowGeo = new THREE.SphereGeometry( earthRadius, 64,32);	

	// create custom material from the shader code above
	//   that is within specially labeled script tags
	var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: 
		{ 
			"c":   { type: "f", value: 0.4 },
			"p":   { type: "f", value: 2 },
			glowColor: { type: "c", value: new THREE.Color(0x254bfc) },
			viewVector: { type: "v3", value: camera.position }
		},
		vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		side: THREE.BackSide,
		blending: THREE.AdditiveBlending,
		transparent: true
	}   );
		
	var earthGlow = new THREE.Mesh( glowGeo, customMaterial );

	earthGlow.scale.multiplyScalar(1.07);
	scene.add( earthGlow );

    var sphereGeo = new THREE.SphereGeometry( earthRadius, 64,32);	
    var sphereCloud = new THREE.SphereGeometry( earthRadius, 64,32);	

	var dmap = THREE.ImageUtils.loadTexture("images/earthdmap.jpg");
	var bmap = THREE.ImageUtils.loadTexture('images/earthbmap.jpg');
	var smap = THREE.ImageUtils.loadTexture('images/earthsmap.png');
	var cmap = THREE.ImageUtils.loadTexture('images/cmap.jpg');


	var earthMaterial = new THREE.MeshPhongMaterial( { 
		color: new THREE.Color('gray'),
		map: dmap,
		bumpMap: bmap,
		bumpScale: 3,
		specularMap: smap,
		specular: new THREE.Color('gray'),
		shininess: 5	
	} );

	var cloudMaterial = new THREE.MeshPhongMaterial( { 
		map: cmap,
		// bumpMap: cmap,
		specularMap: cmap,
		blending: THREE.AdditiveBlending,
		transparent: true,
		shininess: 5	
		// side: THREE.DoubleSide
	} );

    earthSphere = new THREE.Mesh( sphereGeo, earthMaterial ); 
    earthSphere.rotation.x = 10 * Math.PI / 180;
    scene.add(earthSphere);

    cloudSphere = new THREE.Mesh( sphereCloud, cloudMaterial ); 
    scene.add(cloudSphere);
	cloudSphere.scale.multiplyScalar(1.01);
	cloudSphere.renderDepth = 2;

	cloudSphere2 = new THREE.Mesh( sphereCloud, cloudMaterial ); 
    // scene.add(cloudSphere2);	
	cloudSphere2.rotation.x = 180 * Math.PI / 180;
	cloudSphere2.rotation.z = 180 * Math.PI / 180;
	cloudSphere2.scale.multiplyScalar(1.01);
	cloudSphere2.renderDepth = 1;

    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);

	// window.addEventListener('mousemove', mouseMonitor);

	scene.add(orbitsGroup);
	createSatGroup();
}

function createSatGroup(){

	// particleGeometry = new THREE.Geometry();

	// var satTexture = new THREE.ImageUtils.loadTexture( 'images/ball.png' );

	// var particleMaterial = new THREE.PointCloudMaterial({
	// 	size: 0, 
	// 	map: satTexture, 
	// 	vertexColors: THREE.VertexColors,
	// 	sizeAttenuation: true,
	// 	transparent: true
	// });


	// particleSystem = new THREE.PointCloud(
	//   	particleGeometry,
	//   	particleMaterial
	// );

	// particleSystem.sortParticles = true;

	// scene.add(particleSystem);

	particleGroup = new SPE.Group({
		texture: THREE.ImageUtils.loadTexture('images/spark.png'),
		maxAge: 1
	});
}

function updateOrbit(orbit, orbitColor, altitude) {

	if(orbit.vertices.length>=1000){
		orbit.vertices.shift();
	}

  	var extrusionPath =  new THREE.SplineCurve3( orbit.vertices );

	var orbitGeometry = new THREE.TubeGeometry(
	    extrusionPath,  //extrusionPath
	   	orbit.vertices.length,
	    altitude/30,     //radius
	    5,     //radiusSegments
	    false  //closed
	);

	if(orbite[orbit.num]==null){

		var orbitMaterial = new THREE.MeshLambertMaterial( { 
			color: orbitColor, 
			wireframe: false, 
			shading: THREE.FlatShading, 
			side: THREE.FrontSide
		} );
	
		orbite[orbit.num] = new THREE.Mesh( orbitGeometry, orbitMaterial );
		orbitsGroup.add( orbite[orbit.num] );
	} else {
		orbite[orbit.num].geometry.dispose() 

        orbite[orbit.num].geometry = orbitGeometry;  
        orbite[orbit.num].geometry.verticesNeedUpdate = true;
        orbite[orbit.num].geometry.elementsNeedUpdate = true;
        orbite[orbit.num].geometry.normalsNeedUpdate = true;
	    orbite[orbit.num].geometry.computeFaceNormals();
		orbitGeometry.dispose() 
	}
}



// function computeCoords() {
// 	lat =  (lat * time)* Math.PI / 180.0;
// 	lon =  (-lon * time)* Math.PI / 180.0; 

// 	var posX = Math.cos(lat) * Math.cos(lon);	
// 	var posY = Math.sin(lat);
// 	var posZ = Math.cos(lat) * Math.sin(lon) ;
// 	var altitude = (earthRadius + alt/350);
// }

function updateSatPos(num, lat, lon, alt) {
	
	lat =  (lat * time)* Math.PI / 180.0;
	lon =  (-lon * time)* Math.PI / 180.0; 

	var posX = Math.cos(lat) * Math.cos(lon);	
	var posY = Math.sin(lat);
	var posZ = Math.cos(lat) * Math.sin(lon) ;
	var altitude = (earthRadius + alt/350);

	// particleGeometry.vertices[num].x = posX;
	// particleGeometry.vertices[num].y = posY;
	// particleGeometry.vertices[num].z = posZ;
	// particleGeometry.vertices[num].multiplyScalar(altitude);

	// particleGeometry.verticesNeedUpdate = true;


	orbits[num].num = num;
	orbits[num].currentPosition = new THREE.Vector3(posX, posY, posZ).multiplyScalar(altitude);
	particleGroup.emitters[num].position = orbits[num].currentPosition;


	// if(isStarting) {
	//   if(posX < 0.01 && posX > -0.01 && posZ < 0.01 && posZ > -0.01) {
	//     isDrawing = true;
	//     isStarting = false;
	//   }
	// }

	if(isDrawing){
		if(orbits[num].num==selectedSat) {
			var orbitColor = particleGroup.emitters[num].colorStart;
			orbits[num].vertices.push(orbits[num].currentPosition);
			updateOrbit(orbits[num],orbitColor, altitude);

			// if(isSuspending) {
   //       	    if(posX>-0.01 && posX < 0.01 && posZ > -0.01 && posZ < 0.01) {
   //       	      isDrawing = false;
   //       	    }
   //       	}
		}
	}
}

function clearOrbits() {
	while (orbitsGroup.children.length>0) {
      orbitsGroup.children.pop();
    	// orbitsGroup.children[i].geomery.dispose();
    }
    // isDrawing = false;
	// for (var i = 0; i >= orbitGroup.children.length; i++) { 
	// 	orbitGroup.children[i].dispose();
	// 	scene.remove(orbitGroup.children[i].dispose();
}

function clearSats() {

	while (satList.firstChild) {
      satList.removeChild(satList.firstChild);
    }
	// scene.remove(particleSystem);
	// particleGeometry.dispose()

	scene.remove( particleGroup.mesh );
	particleGroup.geometry.dispose()

	// particleGeometry.dispose()

	createSatGroup();
	isGenerating = true;
}


function addSat(num, satname, lat, lon, alt) {

	var div = document.createElement("div");
	div.innerHTML = satname;
	// div.createTextNode(satname);
	var li = document.createElement("li");
	li.appendChild(div);
	li.setAttribute("id","st_"+ num);
	satList.appendChild(li);	

	lat =  lat * Math.PI / 180.0;
	lon = -lon * Math.PI / 180.0;

	var posX = Math.cos(lat) * Math.cos(lon); 
	var posY = Math.sin(lat);
	var posZ = Math.cos(lat) * Math.sin(lon) ;
	var altitude = (earthRadius + alt/350);


	var satPos = new THREE.Vector3(posX, posY, posZ).multiplyScalar(altitude);


	// var colors = [ 0x000000, 0xff0080, 0x8000ff, 0xffffff ];
	var newColor = new THREE.Color("#"+((1<<24)*Math.random()|0).toString(16));

	// particleGeometry.dispose() 

	// particleGeometry.vertices.push(new THREE.Vector3(posX, posY, posZ).multiplyScalar(altitude));

	// particleGeometry.vertices[num] = new THREE.Vector3(posX, posY, posZ).multiplyScalar(altitude);

	// particleGeometry.colors.push( new THREE.Color( colors[ Math.floor( Math.random() * colors.length ) ] ) );
	// particleGeometry.colors[num] = newColor;

	// var satTexture = new THREE.ImageUtils.loadTexture( 'images/ball.png' );


	// particleGeometry.vertices[num].material = new THREE.PointCloudMaterial({
		// vertexColors: true,
		// sizeAttenuation: false,
		// size : 100,
  //       map : satTexture,
  //       transparent : true,

  //   });



	orbits[num] = new THREE.Geometry();	 
	orbits[num].dynamic = true;

	addParticles(satPos);

}

function animate() {

    requestAnimationFrame( animate );

    // console.log(orbitsGroup.children);

	computeStats();

	if(followSatCamera){
		var currentPosition = orbits[selectedSat].currentPosition;
		camera.position.set(currentPosition.x,currentPosition.y,currentPosition.z).multiplyScalar(4);
		camera.lookAt(scene.position);
		camNeedReset = true;
	} else {
		if(camNeedReset){
			// controls.reset();
			camNeedReset = false;
		}
	    // controls.update();
		camPosition = cameraAngle * Math.PI / 180;
		camera.position.x = 400*Math.cos(camPosition*camSpeed) + 0;
		camera.position.y =	50*Math.sin(camPosition*camSpeed) + 50;
		camera.position.z = 1050*Math.sin(camPosition*camSpeed) + 0;
		camera.lookAt(scene.position );
	}

	cloudSphere.rotation.y = cloudSphere.rotation.y + speed/800;

	if(cameraAngle>=360){
		cameraAngle = 0;	
	} else {
		cameraAngle += 0.1;	
	}
	stats.update();

	render();	

	time = time + speed/100;

    particleGroup.tick();
}

function render() {
	renderer.clear();
    renderer.render(scene, camera);
}



var exportString = function ( output ) {
		var blob = new Blob( [ output ], { type: 'text/plain' } );
  		saveAs(blob, 'my_orbitalis.stl');
	};

window.onresize = function() {
	camera.aspect = container.offsetWidth / container.offsetHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(container.offsetWidth, container.offsetHeight);
}


function getRandomNumber( base ) {
    return Math.random() * base - (base/2);
}


// Create particle group and emitter
function addParticles(satVectPos) {

    	emitter = new SPE.Emitter({
    		position: new THREE.Vector3(satVectPos.x,satVectPos.y,satVectPos.z),

    		accelerationSpread: new THREE.Vector3(
                getRandomNumber(10),
                getRandomNumber(10),
                getRandomNumber(10)
            ),

            velocitySpread: new THREE.Vector3(
                getRandomNumber(100),
                getRandomNumber(100),
                getRandomNumber(100)
            ),

            colorStart: (new THREE.Color()).setRGB(
                Math.random(),
                Math.random(),
                Math.random()
            ),
            colorEnd: (new THREE.Color()).setRGB(
                Math.random(),
                Math.random(),
                Math.random()
            ),
    		sizeStart: 8,
    		sizeMiddle: 4,
    		sizeEnd: 2,

    		particleCount: 500,

            opacityStart: 1,
            opacityMiddle: 1,
            opacityEnd: 1
    	});


    	particleGroup.addEmitter( emitter );

	scene.add( particleGroup.mesh );
}


// function mouseMonitor( event ) {
//     event.preventDefault();
//     mouseX =  ( event.clientX / window.innerWidth ) * 20 - 1;
//     mouseY = - ( event.clientY / window.innerHeight ) * 20 + 1;
// }


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
        // positionTable.removeChild(tbody);
    // }

    // tbody = document.createElement('tbody');
    // positionTable.appendChild(tbody);

    for (satnum = 0; satnum < satrecs.length && satnum < SAT_POSITIONS_MAX; satnum ++) {

        pos0 = sats.positions[satnum];                 // position of first satellite
        vel0 = sats.velocities[satnum];
        latLonAlt = calcLatLonAlt(time, satPositions[satnum], satrecs[satnum]);
        vel0Carte = new Cesium.Cartesian3(vel0[0], vel0[1], vel0[2]);
        carte = new Cesium.Cartesian3(pos0[0], pos0[1], pos0[2]);
        // BUG: carto giving bad valus like -1.06, 0.88, -6351321 or NaN; radians instead of degrees?
        // carto = ellipsoid.cartesianToCartographic(carte); // BUG: Values are totally unrealistic, height=NaN

        // newRow = tbody.insertRow(-1);
        // newRow.insertCell(-1).appendChild(document.createTextNode(satnames[satnum]));
        var heightkm = satrecs[satnum].alt;
        // newRow.insertCell(-1).appendChild(document.createTextNode(satids[satnum]));
        // newRow.insertCell(-1).appendChild(document.createTextNode(Cesium.Cartesian3.magnitude(vel0Carte).toFixed(0)));
        // newRow.insertCell(-1).appendChild(document.createTextNode(satrecs[satnum].latInDegrees.toFixed(3)));
        // newRow.insertCell(-1).appendChild(document.createTextNode(satrecs[satnum].lonInDegrees.toFixed(3)));
        // var heightm = heightkm * 0.621371;
        // newRow.insertCell(-1).appendChild(document.createTextNode(heightkm.toFixed(3)));
        // newRow.insertCell(-1).appendChild(document.createTextNode(heightm.toFixed(3)));

        // DISPLAY SATELLITES OF SELECTED GROUP IN THE CONSOLE
        // console.log(satrecs[satnum].latInDegrees.toFixed(3),satrecs[satnum].lonInDegrees.toFixed(3))
		
        if(isGenerating == true){
            addSat(satnum, satnames[satnum], satrecs[satnum].latInDegrees.toFixed(3),satrecs[satnum].lonInDegrees.toFixed(3),satrecs[satnum].alt);
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


function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) 
{	
	// note: texture passed by reference, will be updated by the update function.
		
	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet. 
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
	texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;
		
	this.update = function( milliSec )  {
		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration)
		{
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;
			if (this.currentTile == this.numberOfTiles)
				this.currentTile = 0;
			var currentColumn = this.currentTile % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
			texture.offset.y = currentRow / this.tilesVertical;
		}
	};
}		

//==========//==========//==========//==========//==========//==========//==========



//TODO:
//ITEGRATE TRACKBALL CONTROLS WITH AN IF STATEMENT TO KEEP IT SPINNING 
//NORMALIZE ORBITS RADIUS IN 8 LEVELS
//CONNECT EVERY ORBIT WITH 4 LINES TO THE CORE
//STARS
//PIXEL NOISE SHADER
//ADDITIONAL
//AUDIO


//GOOD SEQUENCE === NASA ---GALILEO=---GLONASS