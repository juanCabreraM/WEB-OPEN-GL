// index.js
const alfrid = require('alfrid')
const io = require('socket.io-client')
const GL = alfrid.GL

// PUT YOUR OWN IP HERE
const socket = io('http://10.98.28.76:9876')
//const socket = io('http://192.168.43.155:9876')

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)
canvas.style.position = 'fixed'
canvas.style.margin = 0
canvas.style.padding = 0
canvas.style.top = 0
canvas.style.left = 0

var mouseX = 0;
var mouseY = 0;


window.addEventListener('mousemove', function (event){
  var percentX = event.clientX / window.innerWidth
  var percentY = event.clientY / window.innerHeight
  
  mouseX = percentX 
  mouseY = percentY 
 console.log(mouseX,mouseY)
}) 

  //window.addEventListener('touchmove', function (event){
    //mouseX = event.touches[0].pageX 
    //mouseY = event.touches[0].pageY 

    //mouseX = mouseX / window.innerWidth
    //mouseY = mouseY / window.innerHeight
   //console.log(mouseX,mouseY)
  //}) 

GL.init(canvas, { alpha: false })

const camera = new alfrid.CameraPerspective()
camera.setPerspective(45 * Math.PI / 180, GL.aspectRatio, 0.01, 1000)
const orbitalControl = new alfrid.OrbitalControl(camera, window, 5)
orbitalControl.rx.value = orbitalControl.ry.value = 0.3

const bAxis = new alfrid.BatchAxis()
const bDots = new alfrid.BatchDotsPlane()

const fs = `
precision mediump float;

uniform mat3 uNormalMatrix;
varying vec3 vNormal;

float diffuse(vec3 n, vec3 l) {
  return max(dot(normalize(n), normalize(l)), 0.0);
}

#define LIGHT vec3(0.25, .5, 1.0)

void main() {
  float d = diffuse(uNormalMatrix * vNormal, LIGHT);
  d = mix(d, 1.0, .2);
  gl_FragColor = vec4(vec3(d), 1.0);
}
`
const drawCube = new alfrid.Draw()
  .setMesh(alfrid.Geom.cube(1, 1, 1))
  .useProgram(alfrid.ShaderLibs.basicVert, fs)

function render () {
  GL.clear(0, 0, 0, 1)

  GL.setMatrices(camera)
  bAxis.draw()
  bDots.draw()
  drawCube.draw()

  var objTouch = {
    touchX : mouseX,
    touchY : mouseY
  }

  socket.emit('touch',objTouch)

  socket.emit('cameramove',{
    view: camera.matrix,
    projection: camera.projection
  })

}

alfrid.Scheduler.addEF(render)

window.addEventListener('resize', () => {
  GL.setSize(window.innerWidth, window.innerHeight)
  camera.setAspectRatio(GL.aspectRatio)
})

window.ondeviceorientationabsolute = (e) => {
  // console.log('orientation absolute', e.alpha, e.beta, e.gamma)
  socket.emit('tilt', {
    alpha: e.alpha,
    beta: e.beta,
    gamma: e.gamma
  })
}
