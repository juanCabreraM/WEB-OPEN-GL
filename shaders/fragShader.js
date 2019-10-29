module.exports = 
`
  #define NUM_OCTAVES 5

  precision mediump float;

  varying vec3 vColor;
  varying vec2 vUV;
  varying float vYPosition;

  uniform vec3 uTranslate;
  uniform float uTime;
  
  float rand(float n){return fract(sin(n) * 43758.5453123);}

float noise(float p){
	float fl = floor(p);
  float fc = fract(p);
	return mix(rand(fl), rand(fl + 1.0), fc);
}
	
	float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float noise(vec2 n) {
	const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

  float fbm(float x) {
	float v = 0.0;
	float a = 0.5;
	float shift = float(100);
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		v += a * noise(x);
		x = x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
  }

  float fbm(vec2 x) {
	float d = 0.0;
	float e = 0.5;
	vec2 shift = vec2(100);
	mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		d += e * noise(x);
		x = rot * x * 2.0 + shift;
		e *= 0.5;
	}
	return d;
}


  void main() {

    vec3 finalColor = uTranslate / 5.0*0.5+0.5;
    //gl_FragColor = vec4(finalColor,1.0);

    vec3 red = vec3 (0.0,0.8,1.0);
    vec3 yellow = vec3(1.0,0.8,0.0);

    finalColor = mix(red,yellow,vYPosition);
  
    gl_FragColor = vec4(finalColor,1.0);
}
`