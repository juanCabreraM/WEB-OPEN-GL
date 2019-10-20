module.exports = 
`
  precision mediump float;

  //define the varying atributes of the object
  varying vec2 vUV;
  
  //define the uniforms of the object
  uniform vec3 uTranslate;

  //define the color percent 
  float map(float value, float start, float end, float newStart, float newEnd) {
  float percent = (value - start) / (end - start);
  if (percent < 0.0) {
    percent = 0.0;
  }
  if (percent > 1.0) {
    percent = 1.0;
  }
  float newValue = newStart + (newEnd - newStart) * percent;
  return newValue;
  } 
  
  //defining the frag shader call
  void main() {

    //defining the color 
  	float range = 10.0;
    float r = map(uTranslate.x, -range, range, 0.7, 1.0);
    float g = map(uTranslate.y, -range, range, 0.7, 1.0);
    float b = map(uTranslate.z, -range, range, 0.7, 1.0);
   
   //final color
   gl_FragColor = vec4(b,g,g,1.0);
}
`