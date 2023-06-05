varying vec2 vUv;
varying vec3 vPosition;
uniform float time;


void main() {
    vPosition = position.xyz;
    vUv = vec2(1.0, 1.0);
    
    vec4 worldPosition = modelMatrix *  vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}