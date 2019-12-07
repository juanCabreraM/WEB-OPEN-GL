// module.exports is the preserved word for exporting
module.exports = 
`
  precision mediump float;

  //varying data from vertex shader
  varying vec3 vColor;
  varying float vNoiseX;
  varying float vNoiseY;

  //define the color from the animation  
  const vec3 color0 = vec3 (242.0,192.0,41.0)/255.0;
  const vec3 color1 = vec3 (58.0,70.0,140.0)/255.0;
  const vec3 color2 = vec3 (217.0,48.0,62.0)/255.0;
  const vec3 color3 = vec3 (242.0,242.0,242.0)/255.0;

  void main() {

    //noise from vertex shader and define variables to apply color
  	float x = vNoiseX*5.0/5.0;
  	float y = vNoiseY*5.0/5.0;

    //define vector to use in the frag shader
  	vec3 color;

    //set the color depending of x and y change 
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
    
     //frag color function for the frontend 	
    gl_FragColor = vec4(color,1.0);
}
`