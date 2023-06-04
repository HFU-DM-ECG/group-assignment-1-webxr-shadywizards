import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'https://unpkg.com/three@0.120.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.120.1/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from './ARButton.js';


//changing variables
let time = 0;

//constant Variables
const startContainer = document.getElementById('start-container');
const sceneContainer = document.getElementById('scene-container');

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}

const sunPos = {
	x: 0,
	y: 0,
	z: 0
}

const can1 = {
	rx: 30,
	ry: 60,
	rz: 180,
}

const can2 = {
	rx: 90,
	ry: 20,
	rz: 0,
}

const can3 = {
	rx: 30,
	ry: 25,
	rz: 25,
}

const can4 = {
	rx: 33,
	ry: 90,
	rz: 90,
}

const can5 = {
	rx: 5,
	ry: 20,
	rz: 100,
}

const canRotations = [
	can1,
	can2,
	can3,
	can4,
	can5,
]

const amountOfCans = 9;
// spawn all amount of cans, thus far it was manual

// function to return a list of all positions given the amount of cans
function getCanPositions(amountOfCans) {
	// coords spread out in a circle: to position all amount of cans right
	const center = { x: 0, z: 0 };
	const radius = 5;
	const angleIncrement = (2 * Math.PI) / amountOfCans;

	const coordinates = [];

	for (let i = 0; i < amountOfCans; i++) {
		const angle = angleIncrement * i;
		const x = center.x + radius * Math.cos(angle);
		const z = center.z + radius * Math.sin(angle);
		coordinates.push({ x, y: 0, z });
	}
	return coordinates;
}

//shaders
//sun
const sunVertexShader = await fetch('./shaders/sun_shader.vert').then(response => response.text());
const sunFragmentShader = await fetch('./shaders/sun_shader.frag').then(response => response.text());


//Basiskomponenten erzeugen
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 25);
const renderer = new THREE.WebGLRenderer(
	{ antialias: true, alpha: true, canvas: sceneContainer }
);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
// sceneContainer.appendChild(renderer.domElement);

//AR-Button
const arButton = ARButton.createButton(renderer, {
	requiredFeatures: ['hit-test'],
	optionalFeatures: ["dom-overlay", "dom-overlay-for-handheld-ar"],
	domOverlay: { root: document.body },
});
arButton.id = "ar-btn";
arButton.addEventListener("click", () => {
	//container by default has class "hidden", which has the attribute "display: none"
	//-> hide container which holds the scene until AR is started
	sceneContainer.className = "";
});
startContainer.appendChild(arButton);


//AR controller 
let objectPlaced = false;
function onSelect() {
	if (objectPlaced) return;

	sunMesh.position.set(0, 0, -0.5).applyMatrix4(controller.matrixWorld);
	console.log("selected");

	objectPlaced = true;
}

const controller = renderer.xr.getController(0);
controller.addEventListener("select", onSelect);
scene.add(controller);


//Lights
const sunLight = new THREE.PointLight(0xffffff, 1.5);
sunLight.position.set(sunPos.x, sunPos.y, sunPos.z);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0xffffff, .2);
ambientLight.position.set(sunPos.x, sunPos.y, sunPos.z);
scene.add(ambientLight);

//Kamera-Settings
camera.position.set(3.5, 0.5, 5);
scene.add(camera);

//load banners for the cans
var canBanners = [];
//load the bannernames into an array, so their loading process can be started within one for-loop
var bannerNames = ["Merkury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
for (let i = 0; i < (amountOfCans); i++) {
	loadBanners('Assets/Planetbanners/' + bannerNames[i] + '.png');
}
function loadBanners(src) {
	const texture = new THREE.TextureLoader().load(src);
	texture.flipY = false;
	const material = new THREE.MeshPhysicalMaterial({ map: texture });
	canBanners.push(material);
}

//GLTF-Loader for Can
const loader = new GLTFLoader();
var cans = loadCans(loader, amountOfCans);
console.log(cans);

// loads the cans using the supplied loader and returns them in a list
function loadCans(loader, amountOfCans) {
	var cans = [];
	loader.load('Assets/Can_Self_Material.glb', function (glb) {
		const can = glb.scene;
		can.scale.set(0.008, 0.008, 0.008);

		// //metallic effect on can
		// const generator = new THREE.PMREMGenerator(renderer);
		// const envMap = generator.fromScene(scene, 0, 0.1, 100);
		// envMap.mapping = THREE.CubeRefractionMapping;;
		// envMap.texture.encoding = THREE.sRGBEEncoding;
		// can.material = new THREE.MeshPhysicalMaterial({
		// 	envMap: envMap.texture,
		// 	envMapIntensity: 1.0,
		// 	roughness: 0.1,
		// 	clearcoat: 1.0,
		// 	clearcoatRoughness: 0.0,
		// 	metalness: 1.0,
		// });

		var canPositions = getCanPositions(amountOfCans);
		// clone the cans and put them into the array to be returned later
		for (var i = 0; i < amountOfCans; i++) {
			var thisCan = can;
			if (i != 0) {
				thisCan = can.clone();
			}
			thisCan.position.set(canPositions[i].x, canPositions[i].y, canPositions[i].z);
			thisCan.rotation.set(canRotations[i % 5].rx, canRotations[i % 5].ry, canRotations[i % 5].rz);
			//add banner to can
			thisCan.getObjectByName("Cylinder.002_0").material = canBanners[i];
			scene.add(thisCan);
			cans.push(thisCan);
		}
		animateCans(cans);
	}, function (xhr) {
		console.log((xhr.loaded / xhr.total * 100) + "% loaded")
	}, function (error) {
		console.log("An error occured")
	});
	return cans;
}




//Sun----------------------------------------------------------------
const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
const sunMaterial = new THREE.ShaderMaterial({
	vertexShader: sunVertexShader,
	fragmentShader: sunFragmentShader,
	uniforms: {
		time: { value: 0 }
	}
});
//sun texutre
const threeTone = new THREE.TextureLoader().load('Assets/sun.jpg');
threeTone.minFilter = THREE.NearestFilter;
threeTone.magFilter = THREE.NearestFilter;

//toon shader
const toonMaterial = new THREE.MeshToonMaterial();
toonMaterial.map = threeTone;
toonMaterial.color = new THREE.Color(0xfcba03);

const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.x = sunPos.x;
sunMesh.position.y = sunPos.z;
sunMesh.position.z = sunPos.y;
scene.add(sunMesh);
//-------------------------------------------------------------------

//controls (for now)
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.enablePan = false;
controls.minDistance = 2;
controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI;
controls.update()


//Szene rendern lassen
function animate() {
	time += 1;
	sunMaterial.uniforms.time.value = time;
	scene;
	controls.update();
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
};

function animateCans() {
	let canCounter = 0;
	for (const can of cans) {
		canCounter += 1;
		const time = Date.now();
		const offsetTime = time + 500;

		can.rotation.x = can.rotation.x + .0008;
		can.rotation.y = can.rotation.y + .0009;
		can.rotation.z = can.rotation.z + .0003;

		if (canCounter % 2 === 0) {
			can.position.y = 0.5 + Math.sin(offsetTime * 0.001) * 0.5;
		} else {
			can.position.y = Math.sin(time * 0.001) * 0.3;
		}
	}
	requestAnimationFrame(animateCans);
	renderer.render(scene, camera);

};

animate();