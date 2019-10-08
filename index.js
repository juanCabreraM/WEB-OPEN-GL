const regl = require('regl')()

const glm = require('gl-matrix')
var mat4 = glm.mat4
var projectionMatrix = mat4.create()

var fovy = 45 * Math.PI/180;
var aspect = window.innerWidth / window.innerHeight
var near = 0.01;
var far = 1000.0;
mat4.perspective(projectionMatrix,fovy,aspect,near,far)

var viewMatrix = mat4.create()
mat4.lookAt(viewMatrix, [0,0,1], [0,0,0], [0,1,0])

var currTime = 0.0

var mouseX=0
var mouseY=0

window.addEventListener('mousemove', function(event){
	var percentX = event.clientX / window.innerWidth;
	percentX = percentX*2-1
	var percentY = event.clientY / window.innerHeight;
	percentY = percentY*2-1

	var cameraRange = 3.0
	mouseX =percentX*cameraRange
	mouseY =percentY*cameraRange
})

var r= 0.2

const points = [
[r, r, 0],
[r, -r, 0],
[-r, -r, 0],
[-r,-r,0],
[-r,r,0],
[r,r,0]
]

var colors = [
[1,0,0],
[0.3,1,0],
[0,0.5,1],
[0,0.5,1],
[0.3,1,0],
[1,0,0]
]

var attributes = {
	aPpositions: regl.buffer(points)
}

var attributes = {
	aPositions: regl.buffer(points),
	aColor: regl.buffer(colors)
}


var vertexShader= `
precision mediump float;
attribute vec3 aPositions;
attribute vec3 aColor;

uniform float uTime;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

varying vec3 vColor;

void main() {
	vec3 pos = aPositions;

//float scale = sin(uTime);
//pos.xy *= scale*0.5+0.5;

//pos.x += sin(uTime)*0.5;
//pos.y += cos(uTime)*0.5;


gl_Position = uProjectionMatrix * uViewMatrix * vec4(pos, 1.0);
vColor = aColor;

}
`

var fragShader = `
precision mediump float;

varying vec3 vColor;

void main() {
	gl_FragColor = vec4(vColor,0.5);
}
`

const drawTriangle = regl(
    {
    uniforms: {
	uTime: regl.prop('time'),
	uProjectionMatrix: projectionMatrix,
	uViewMatrix: regl.prop('view1')
    },
	attributes: attributes,
	frag: fragShader,
	vert: vertexShader,
	count: 6
    }
)

function clear(){
	regl.clear({
		color: [0.8, 0.5, 0.3, 0.7]
	})
}

function render (){
	currTime += 0.01

    var cameraRad = 1.0;
    var cameraX = Math.sin(currTime)*cameraRad
    var cameraZ = Math.cos(currTime)*cameraRad
    //mat4.lookAt(viewMatrix, [cameraX,0,cameraZ], [0,0,0], [0,1,0])
    mat4.lookAt(viewMatrix, [mouseX,mouseY,cameraZ], [0,0,0], [0,1,0])


	var obj = {
		time: currTime,
		view1: viewMatrix
	}
    console.log('render')
    clear()
    drawTriangle(obj)
      

    window.requestAnimationFrame(render)
}

render()