import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'https://unpkg.com/three@0.120.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.120.1/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://unpkg.com/three@0.120.1/examples/jsm/loaders/RGBELoader.js';
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

const sun = {
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

const amountOfCans = 12;
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
const glowVertexShader = await fetch('./shaders/glow_shader.vert').then(response => response.text());
const glowFragmentShader = await fetch('./shaders/glow_shader.frag').then(response => response.text());

//Basiskomponenten erzeugen
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 25);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 0.6;
// renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
sceneContainer.appendChild(renderer.domElement);


//AR-Button
const arButton = ARButton.createButton(renderer);
arButton.id = "ar-btn";
arButton.addEventListener("click", () => {
	//container by default has class "hidden", which has the attribute "display: none"
	//-> hide container which holds the scene until AR is started
	sceneContainer.className = "";
});
startContainer.appendChild(arButton);

//HDRI for Scene
// new RGBELoader()
// 	.load("Assets/galaxy.hdr", function (texture) {
// 		texture.mapping = THREE.EquirectangularReflectionMapping;
// 		scene.background = texture;
// 		//scene.environment = texture;
// 	});
new RGBELoader().load("Assets/can.hdr", function (texture) {
	texture.mapping = THREE.EquirectangularReflectionMapping;
	scene.environment = texture;
});


//Temporary Light
const light = new THREE.AmbientLight(0xffffff, 2);
light.position.set(2, 2, 5);
scene.add(light);

//Kamera-Settings
camera.position.set(3.5, 0.5, 5);
scene.add(camera);


//GLTF-Loader for Can
const loader = new GLTFLoader();
var cans = loadCans(loader, amountOfCans);
console.log(cans);

// loads the cans using the supplied loader and returns them in a list
function loadCans(loader, amountOfCans) {
	var cans = [];
	loader.load('Assets/Can.gltf', function (glb) {
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




//Sphere
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.ShaderMaterial({
	vertexShader: sunVertexShader,
	fragmentShader: sunFragmentShader,
	uniforms: {
		time: { value: 0 }
	}
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.x = sun.x;
sphere.position.y = sun.z;
sphere.position.z = sun.y;
scene.add(sphere);

//Sphere-glow
const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
const glowMaterial = new THREE.ShaderMaterial({
	vertexShader: glowVertexShader,
	fragmentShader: glowFragmentShader,
	side: THREE.BackSide,
	uniforms: {
		time: { value: 0 }
	}
});
const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
glowSphere.position.x = sun.x;
glowSphere.position.y = sun.z;
glowSphere.position.z = sun.y;
// scene.add(glowSphere);

//Orbitcontrols
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
	sphereMaterial.uniforms.time.value = time;
	glowMaterial.uniforms.time.value = time;
	scene;
	requestAnimationFrame(animate);
	controls.update();
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