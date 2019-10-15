module.exports =
`
precision mediump float;
attribute vec3 aPositions;
attribute vec2 aUV;

uniform float uTime;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform vec3 uTranslate;

varying vec2 vUV;

void main() {
  vec3 pos = aPositions;
  pos *= 0.5;
  pos += uTranslate;


	gl_Position = uProjectionMatrix * uViewMatrix * vec4(pos.xzy, 1.0);
  vUV = aUV;
}				
`
