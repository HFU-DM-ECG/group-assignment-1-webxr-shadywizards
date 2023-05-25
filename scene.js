import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'https://unpkg.com/three@0.120.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.120.1/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://unpkg.com/three@0.120.1/examples/jsm/loaders/RGBELoader.js';
import { ARButton } from './ARButton.js';


//changing variables
let time = 0;

//constant Variables
const startContainer = document.getElementById('start-div');
const container = document.getElementById('3d-container');

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

// coords spread out in a circle:
const center = { x: 0, z: 0 };
const radius = 5;
const angleIncrement = (2 * Math.PI) / 5;

const coordinates = [];

for (let i = 0; i < 5; i++) {
	const angle = angleIncrement * i;
	const x = center.x + radius * Math.cos(angle);
	const z = center.z + radius * Math.sin(angle);
	coordinates.push({ x, y: 0, z });
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
container.appendChild(renderer.domElement);


//AR-Button
const button = ARButton.createButton(renderer);
button.id = "ar-btn";
startContainer.appendChild(button);

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
loader.load('Assets/Can.gltf', function (glb) {
	console.log(glb);
	const root = glb.scene;
	root.scale.set(0.008, 0.008, 0.008);
	root.position.x = coordinates[0].x;
	root.position.y = coordinates[0].y;
	root.position.z = coordinates[0].z;
	root.rotation.x = can1.rx;
	root.rotation.x = can1.rz;
	root.rotation.x = can1.ry;

	//metallic effect on can
	const generator = new THREE.PMREMGenerator(renderer);
	const envMap = generator.fromScene(scene, 0, 0.1, 100);
	envMap.mapping = THREE.CubeRefractionMapping;;
	envMap.texture.encoding = THREE.sRGBEEncoding;
	root.material = new THREE.MeshPhysicalMaterial({
		envMap: envMap.texture,
		envMapIntensity: 1.0,
		roughness: 0.1,
		clearcoat: 1.0,
		clearcoatRoughness: 0.0,
		metalness: 1.0,
	});

	scene.add(root);
	initCan(root);
	animateCans();

	model = root;

}, function (xhr) {
	console.log((xhr.loaded / xhr.total * 100) + "% loaded")
}, function (error) {
	console.log("An error occured")
});


loader.load('Assets/Can.gltf', function (glb) {
	console.log(glb);
	const root = glb.scene;
	root.scale.set(0.008, 0.008, 0.008);
	root.position.x = coordinates[1].x;
	root.position.y = coordinates[1].y;
	root.position.z = coordinates[1].z;
	root.rotation.x = can2.rx;
	root.rotation.x = can2.rz;
	root.rotation.x = can2.ry;

	//metallic effect on can
	const generator = new THREE.PMREMGenerator(renderer);
	const envMap = generator.fromScene(scene, 0, 0.1, 100);
	envMap.mapping = THREE.CubeRefractionMapping;;
	envMap.texture.encoding = THREE.sRGBEEncoding;
	root.material = new THREE.MeshPhysicalMaterial({
		envMap: envMap.texture,
		envMapIntensity: 1.0,
		roughness: 0.1,
		clearcoat: 1.0,
		clearcoatRoughness: 0.0,
		metalness: 1.0,
	});

	scene.add(root);
	initCan(root);
	animateCans();

	model = root;

}, function (xhr) {
	console.log((xhr.loaded / xhr.total * 100) + "% loaded")
}, function (error) {
	console.log("An error occured")
});

loader.load('Assets/Can.gltf', function (glb) {
	console.log(glb);
	const root = glb.scene;
	root.scale.set(0.008, 0.008, 0.008);
	root.position.x = coordinates[2].x;
	root.position.y = coordinates[2].y;
	root.position.z = coordinates[2].z;
	root.rotation.x = can3.rx;
	root.rotation.x = can3.rz;
	root.rotation.x = can3.ry;

	//metallic effect on can
	const generator = new THREE.PMREMGenerator(renderer);
	const envMap = generator.fromScene(scene, 0, 0.1, 100);
	envMap.mapping = THREE.CubeRefractionMapping;;
	envMap.texture.encoding = THREE.sRGBEEncoding;
	root.material = new THREE.MeshPhysicalMaterial({
		envMap: envMap.texture,
		envMapIntensity: 1.0,
		roughness: 0.1,
		clearcoat: 1.0,
		clearcoatRoughness: 0.0,
		metalness: 1.0,
	});

	scene.add(root);
	initCan(root);
	animateCans();

	model = root;

}, function (xhr) {
	console.log((xhr.loaded / xhr.total * 100) + "% loaded")
}, function (error) {
	console.log("An error occured")
});

loader.load('Assets/Can.gltf', function (glb) {
	console.log(glb);
	const root = glb.scene;
	root.scale.set(0.008, 0.008, 0.008);
	root.position.x = coordinates[3].x;
	root.position.y = coordinates[3].y;
	root.position.z = coordinates[3].z;
	root.rotation.x = can4.rx;
	root.rotation.x = can4.rz;
	root.rotation.x = can4.ry;

	//metallic effect on can
	const generator = new THREE.PMREMGenerator(renderer);
	const envMap = generator.fromScene(scene, 0, 0.1, 100);
	envMap.mapping = THREE.CubeRefractionMapping;;
	envMap.texture.encoding = THREE.sRGBEEncoding;
	root.material = new THREE.MeshPhysicalMaterial({
		envMap: envMap.texture,
		envMapIntensity: 1.0,
		roughness: 0.1,
		clearcoat: 1.0,
		clearcoatRoughness: 0.0,
		metalness: 1.0,
	});

	scene.add(root);
	initCan(root);
	animateCans();

	model = root;

}, function (xhr) {
	console.log((xhr.loaded / xhr.total * 100) + "% loaded")
}, function (error) {
	console.log("An error occured")
});

loader.load('Assets/Can.gltf', function (glb) {
	console.log(glb);
	const root = glb.scene;
	root.scale.set(0.008, 0.008, 0.008);
	root.position.x = coordinates[4].x;
	root.position.y = coordinates[4].y;
	root.position.z = coordinates[4].z;
	root.rotation.x = can5.rx;
	root.rotation.x = can5.rz;
	root.rotation.x = can5.ry;

	//metallic effect on can
	const generator = new THREE.PMREMGenerator(renderer);
	const envMap = generator.fromScene(scene, 0, 0.1, 100);
	envMap.mapping = THREE.CubeRefractionMapping;;
	envMap.texture.encoding = THREE.sRGBEEncoding;
	root.material = new THREE.MeshPhysicalMaterial({
		envMap: envMap.texture,
		envMapIntensity: 1.0,
		roughness: 0.1,
		clearcoat: 1.0,
		clearcoatRoughness: 0.0,
		metalness: 1.0,
	});

	scene.add(root);
	initCan(root);
	animateCans();

	model = root;

}, function (xhr) {
	console.log((xhr.loaded / xhr.total * 100) + "% loaded")
}, function (error) {
	console.log("An error occured")
});

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

let cans = [];
function initCan(root) {
	cans.push(root);
}

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