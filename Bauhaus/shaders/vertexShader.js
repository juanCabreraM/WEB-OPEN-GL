module.exports =
`
precision mediump float;

//atribute set up in the frontend
attribute vec3 aPositions;
attribute vec2 aUV;

//unifroms for camera settings
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

//unoforms for mouse position used for the dots
uniform vec3 uMouse;
uniform vec3 uMouse1;
uniform vec3 uMouse2;
uniform vec3 uMouse3;

//uniform for click position of the mouse to set wave position
uniform vec3 uClick1;
uniform vec3 uClick2;
uniform vec3 uClick3;

//uniform for the time used for for wave animation
uniform float uClickTime1;
uniform float uClickTime2;
uniform float uClickTime3;

//uniform for time to scale dots
uniform float uTime;

//uniform for the position of the 3D objects
uniform vec3 uTranslate;

// varying to give data to the frag shader
varying vec3 vColor;
varying vec2 vUV;
varying float vNoiseX;
varying float vNoiseY;

//////////////////////////////////////////////////////////////////////////
//set noise function to modiffy 3D object in the frontend

//  Classic Perlin 3D Noise 
//  by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}


//  <https://www.shadertoy.com/view/Xd23Dh>
//  by inigo quilez <http://iquilezles.org/www/articles/voronoise/voronoise.htm>
//

vec3 hash3( vec2 p ){
    vec3 q = vec3( dot(p,vec2(127.1,311.7)), 
           dot(p,vec2(269.5,183.3)), 
           dot(p,vec2(419.2,371.9)) );
  return fract(sin(q)*43758.5453);
}

//set up vertex shader function called in the frontend
void main() {

  //define objects positions 
  vec3 pos = aPositions;
  
  //set radius from the mouse and deffine objects position to scale them
  //create dot that follow the mouse position
  vec3 mousePos = uMouse;
  float distToMouse = distance(mousePos, uTranslate);
  float maxRadius = 25.0;
  float minRadius = 0.05;
  float mouseScale= sin(minRadius + uTime * 6.0);
  minRadius += mouseScale*15.0;
  float radiusScale = smoothstep(maxRadius, minRadius, distToMouse);

  //create first staticdot after the first click
  vec3 mousePos1 = uMouse1;
  float distToMouse1 = distance(mousePos1, uTranslate);
  float maxRadius1 = 25.0;
  float minRadius1 = 0.05;
  float mouseScale1= sin(minRadius1 + uTime * 6.0);
  minRadius1 += mouseScale1*15.0;
  float radiusScale1 = smoothstep(maxRadius1, minRadius1, distToMouse1);

  //create second static dot after the second click
  vec3 mousePos2 = uMouse2;
  float distToMouse2 = distance(mousePos2, uTranslate);
  float maxRadius2 = 25.0;
  float minRadius2 = 0.05;
  float mouseScale2= sin(minRadius2 + uTime * 8.0);
  minRadius2 += mouseScale2*15.0;
  float radiusScale2 = smoothstep(maxRadius2, minRadius2, distToMouse2);

  //create third static dot after the third click
  vec3 mousePos3 = uMouse3;
  float distToMouse3 = distance(mousePos3, uTranslate);
  float maxRadius3 = 25.0;
  float minRadius3 = 0.05;
  float mouseScale3= sin(minRadius3 + uTime * 4.0);
  minRadius3 += mouseScale3*15.0;
  float radiusScale3 = smoothstep(maxRadius3, minRadius3, distToMouse3);
  //create variable that contain all statics dots
  float totalRadScale = radiusScale + radiusScale1 + radiusScale2 + radiusScale3;

  //defining first circular wave with first mouse uClick
  vec3  centerMouse1 = uClick1 ;
  float r1 = 10.0* uClickTime1*2.0;
  float distWave1 = distance(centerMouse1, uTranslate);
  float maxCircle1 = 20.0 + r1;
  float minCircle1 = 10.0 + r1;
  float bigCircleWave1 = smoothstep(minCircle1, maxCircle1, distWave1);
  float smalCircleWave1 = smoothstep(maxCircle1, minCircle1, distWave1);
  float negative1 = (bigCircleWave1 * smalCircleWave1)*3.0;

  //defining second circular wave with second mouse uClick
  vec3  centerMouse2 = uClick2 ;
  float r2 = 10.0* uClickTime2*5.0;
  float distWave2 = distance(centerMouse2, uTranslate);
  float maxCircle2 = 20.0 + r2;
  float minCircle2 = 10.0 + r2;
  float bigCircleWave2 = smoothstep(minCircle2, maxCircle2, distWave2);
  float smalCircleWave2 = smoothstep(maxCircle2, minCircle2, distWave2);
  float negative2 = (bigCircleWave2 * smalCircleWave2)*3.0;

  //defining third circular wave with third mouse uClick
  vec3  centerMouse3 = uClick3 ;
  float r3 = 10.0* uClickTime3*4.0;
  float distWave3 = distance(centerMouse3, uTranslate);
  float maxCircle3 = 20.0 + r3;
  float minCircle3 = 10.0 + r3;
  float bigCircleWave3 = smoothstep(minCircle3, maxCircle3, distWave3);
  float smalCircleWave3 = smoothstep(maxCircle3, minCircle3, distWave3);
  float negative3 = (bigCircleWave3 * smalCircleWave3)*3.0;

  //create variable that contain all waves motion
  float negative = negative1 + negative2 + negative3 ;

  //create variables in order to apply change in x and y objects position
  float noiseX = cnoise(uTranslate + uTime * 0.5) * .5 + .5;
  float noiseY = cnoise(uTranslate.zyx + uTime * 0.2) * .5 + .5;

  //apply noise to x and y position
  pos.x *= noiseX * 3.0;
  pos.y *= noiseY * 3.0;

  //visualice all dots and waves in the frontend
  pos.xy *= totalRadScale + negative;
  pos += uTranslate; 

  //define vertex shader to call in the frontend
  gl_Position = uProjectionMatrix * uViewMatrix * vec4(pos, 1.0); 
  
  //data to transmit to the fragment shader and apply color
  vNoiseX = noiseX;
  vNoiseY = noiseY;
}				
`