import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'https://unpkg.com/three@0.120.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.120.1/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from './ARButton.js';

import * as planets from './planets.js';

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

//shaders
//sun
const perlinVertexShader = await fetch('./shaders/old/sun_shader.vert').then(response => response.text());
const perlinFragmentShader = await fetch('./shaders/old/sun_shader.frag').then(response => response.text());
const sunVertexShader = await fetch('./shaders/sun_shader.vert').then(response => response.text());
const sunFragmentShader = await fetch('./shaders/sun_shader.frag').then(response => response.text());


//Basiskomponenten erzeugen
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
const renderer = new THREE.WebGLRenderer(
	{ antialias: true, alpha: true, canvas: sceneContainer }
);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
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
var canBanners = loadBanners();;
function loadBanners() {
	//load the bannernames into an array, so their loading process can be started within one for-loop
	var bannerNames = ["Merkury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

	var canBanners = [];
	for (let i = 0; i < (planets.amount); i++) {
		const texture = new THREE.TextureLoader().load('Assets/Planetbanners/' + bannerNames[i] + '.png');
		texture.flipY = false;
		texture.encoding = THREE.sRGBEncoding;
		const material = new THREE.MeshPhysicalMaterial({ map: texture });
		canBanners.push(material);
	}
	return canBanners;
}

//GLTF-Loader for Can
const loader = new GLTFLoader();
var cans = loadCans(loader, planets.amount);

// loads the cans using the supplied loader and returns them in a list
function loadCans(loader, amountOfCans) {
	var cans = [];
	loader.load('Assets/Can_Self_Material.glb', function (glb) {
		const can = glb.scene;
		can.scale.set(0.004, 0.004, 0.004);

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

		// set the initial Position of the can once
		var canPositions = planets.getAllPlanetPositions(time);
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

function animateCans() {
	// the counter is used to differentiate between the planets
	let canCounter = 0;
	for (const can of cans) {
		can.rotation.x = can.rotation.x + .0008;
		can.rotation.y = can.rotation.y + .0009;
		can.rotation.z = can.rotation.z + .0003;

		const timeFactor = 1 / 2000
		can.position.x = planets.getAllPlanetPositions(time * timeFactor)[canCounter].x;
		can.position.z = planets.getAllPlanetPositions(time * timeFactor)[canCounter].z;
		canCounter += 1;
	}
	requestAnimationFrame(animateCans);
	renderer.render(scene, camera);
};



//Sun----------------------------------------------------------------
const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
const sunMaterial = new THREE.ShaderMaterial({
	side: THREE.DoubleSide,
	vertexShader: sunVertexShader,
	fragmentShader: sunFragmentShader,
	uniforms: {
		time: { value: 0 },
		uPerlin: { value: null },
		resolution: { value: new THREE.Vector4() }
	}
});

//sun texutre
const cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget(
	256, {
	format: THREE.RGBFormat,
	generateMipMaps: true,
	minFilter: THREE.LinearMipmapFilter,
	encoding: THREE.sRGBEncoding
}
);
cubeRenderTarget1.texture.type = THREE.HalfFloatType;
const cubeCamera1 = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget1);
const perlinMaterial = new THREE.ShaderMaterial({
	side: THREE.DoubleSide,
	vertexShader: perlinVertexShader,
	fragmentShader: perlinFragmentShader,
	uniforms: {
		time: { value: 0 },
	}
});

function addSunTexture() {

	const geometry = new THREE.SphereBufferGeometry(.99, 30, 30);

	const perlin = new THREE.Mesh(geometry, perlinMaterial);
	perlin.position.x = sunPos.x;
	perlin.position.y = sunPos.z;
	perlin.position.z = sunPos.y;
	scene.add(perlin);
}
addSunTexture();


const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.x = sunPos.x;
sunMesh.position.y = sunPos.z;
sunMesh.position.z = sunPos.y;
scene.add(sunMesh);
//-------------------------------------------------------------------

//controls (for now)
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = false;
controls.enablePan = false;
controls.minDistance = 2;
controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI;
controls.update()


//Szene rendern lassen
function renderScene() {
	time += 1;
	cubeCamera1.update(renderer, scene);
	perlinMaterial.uniforms.time.value = time;
	sunMaterial.uniforms.time.value = time;
	sunMaterial.uniforms.uPerlin.value = cubeRenderTarget1.texture;
	scene;
	controls.update();
	requestAnimationFrame(renderScene);
	renderer.render(scene, camera);
};

renderScene();
