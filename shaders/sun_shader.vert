varying vec3 gridPos;
varying vec3 vNormal;
varying vec3 eyeVector;
uniform float time;


void main() {
    vNormal = normal;
    gridPos = position.xyz;
    
    vec4 worldPosition = modelMatrix *  vec4(position, 1.0);
    eyeVector = normalize(worldPosition.xyz - cameraPosition);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}