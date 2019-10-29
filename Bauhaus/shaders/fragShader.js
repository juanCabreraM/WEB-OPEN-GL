module.exports = 
`
  precision mediump float;

  varying vec3 vColor;
  varying vec2 vUV;
  varying float vNoiseX;
  varying float vNoiseY;
  
  const vec3 color0 = vec3 (242.0,192.0,41.0)/255.0;
  const vec3 color1 = vec3 (58.0,70.0,140.0)/255.0;
  const vec3 color2 = vec3 (217.0,48.0,62.0)/255.0;
  const vec3 color3 = vec3 (242.0,242.0,242.0)/255.0;

  void main() {

  	float x = vNoiseX*5.0/5.0;
  	float y = vNoiseY*5.0/5.0;

  	vec3 color;

  	if(x < y*0.7) {
   		color = color0;
  	} else if (x > y*0.7){
  		color = color3;
  	}
  	if(y < x * 0.7) {
   		color = color1;
  	}
  	if (x < 0.25 || y<0.25){
  		color = color2;
  	}
  	
  	
    gl_FragColor = vec4(color,1.0);
}
`