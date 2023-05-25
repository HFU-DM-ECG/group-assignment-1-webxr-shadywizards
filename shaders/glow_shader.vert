varying vec3 pos;
uniform float time;


void main() {
    pos = position.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}