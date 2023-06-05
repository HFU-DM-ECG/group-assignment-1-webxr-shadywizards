varying vec2 vUv;
varying vec3 vPosition;
uniform float time;
uniform sampler2D texture1;
uniform vec4 resolution;
uniform samplerCube uPerlin;
float PI = 3.14159265358979328;


vec3 brightnessToColor(float b) {
    b *= 0.25;
    return (vec3(b, b*b, b*b*b*b) / 0.25) * 0.8;
}

float supersun() // 38:00


void main() {
    //textureCube returns a texel, i.e. the color value of the texture at the given coordinates
    gl_FragColor = textureCube(uPerlin, vPosition);
}