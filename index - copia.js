const regl = require('regl')()

const strVertex = require('./shaders/shaderVertex.js')
const fragShader = require('./shaders/fragShader.js')
const loadObj = require('./utils/loadObj.js')

console.log('loadObj', loadObj)

loadObj('./cube.obj',function(){
	console.log('loadObj')
})

const glm = require('gl-matrix')
var mat4 = glm.mat4
var projectionMatrix = mat4.create()

var fovy = 75 * Math.PI/180;
var aspect = window.innerWidth / window.innerHeight
var near = 0.01;
var far = 1000.0;
mat4.perspective(projectionMatrix,fovy,aspect,near,far)

var viewMatrix = mat4.create()
mat4.lookAt(viewMatrix, [0,0,2], [0,0,0], [0,1,0])

var currTime = 0

var mouseX=0
var mouseY=0

window.addEventListener('mousemove', function(e){
	//console.log('mouse move',e.clientX,e.clientY)

	var percentX = e.clientX / window.innerWidth
	var percentY = e.clientY / window.innerHeight

	percentX = percentX * 2 - 1
	percentY = percentY * 2 - 1

	var moveRange = 10
	mouseX = -percentX * moveRange
	mouseY = percentY  * moveRange
})

const clear = () => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
}

var r= 0.2

const points = [
[-r, r, 0],
[r, r, 0],
[r, -r, 0],
[-r,r,0],
[r,-r,0],
[-r,-r,0]
]

var colors = [
[1,0,0],
[0.3,1,0],
[0,0.5,1],
[0,0.5,1],
[0.3,1,0],
[1,0,0]
]

var uvs = [
 [0,0],
 [1,0],
 [1,1],

 [0,0],
 [1,1],
 [0,1]
]

var attributes = {
	aPositions: regl.buffer(points),
	aColor: regl.buffer(colors),
	aUV: regl.buffer(uvs)
}

const drawTriangle = regl(
    {
     uniforms: {
	 uTime: regl.prop('time'),
	 uProjectionMatrix: projectionMatrix,
	 uViewMatrix: regl.prop('view1'),
	 uTranslate: regl.prop('translate')

     },
	 
	 frag: fragShader,
	 vert: strVertex,
	 attributes: attributes,

     depth: {
     	enable: false,
     },

     blend: {
       enable: true,
       func: {
         srcRGB: 'src alpha',
         srcAlpha: 'src alpha',
         dstRGB: 'one minus src alpha',
         dstAlpha: 'one minus src alpha',
         }
        },

	 count: 6
    }
)



function render (){
	currTime += 0.01

    var cameraRad = 0.5;
    var cameraX = Math.sin(currTime)*cameraRad
    var cameraY = Math.cos(currTime)*cameraRad
    mat4.lookAt(viewMatrix, [mouseX*2,mouseY*5,30], [0,0,0], [0,1,0])

    console.log('render')
    clear()

    var numb =50;
    var start = -numb /2

    for (var i = 0; i < numb; i ++) {
    	for (var g = 0; g <numb; g++){
    		//for (var k = 0; k <numb; k++){
    			var x=start+i;
    			var y=start+g;
    			//var z=start+k;

    	        var obj = {
		         time: currTime,
		         view1: viewMatrix,
		         translate: [x,y,1]
		        }
		     drawTriangle(obj) 
	        //} 
	    }
	 }	     

    window.requestAnimationFrame(render)
}

render()