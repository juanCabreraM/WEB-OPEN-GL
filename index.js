const regl = require('regl')()

const strVertex = require('./shaders/shaderVertex2.js')
const fragShader = require('./shaders/fragShader2.js')
const loadObj = require('./utils/loadObj.js')

console.log('loadObj', loadObj)

//////////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////////

var drawCube

loadObj('./disk.obj',function(obj){
	console.log(obj)
	//creat the atribute

    var attributes = {
	  aPositions: regl.buffer(obj.positions),
	  aUV: regl.buffer(obj.uvs)
    }
	//create our draw call

	drawCube = regl(
    {
     uniforms: {
	 uTime: regl.prop('time'),
	 uProjectionMatrix: projectionMatrix,
	 uViewMatrix: regl.prop('view1'),
	 uTranslate: regl.prop('translate'),
	 uColor: regl.prop('color')
	 },
	 
	 frag: fragShader,
	 vert: strVertex,
	 attributes: attributes,
	 count: obj.count

	})
})

///////////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////////

const clear = () => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
}

//////////////////////////////////////////////////////////////////

function render (){
	currTime += 0.01

    var cameraRad = 0.5;
    var cameraX = Math.sin(currTime)*cameraRad
    var cameraY = Math.cos(currTime)*cameraRad
    
    //mat4.lookAt(viewMatrix, [mouseX*2,mouseY*5,30], [0,0,0], [0,1,0])
    mat4.lookAt(viewMatrix, [cameraX*5,0.5,cameraY*5], [0,0,0], [0,1,0])
    
    //el modelo siempre tardara un tiempo antes de cargar completo
    //con esta funcion hasta no cargar el modelo no se activara el renderizado
    
    clear()
    if (drawCube != undefined){
        var num = 30;

    	for(i = 0; i<num;i++){
    		for(j=0; j<num; j++){    			
    				var obj={
    	            time: currTime,
    	            projection: projectionMatrix,
    	            view1: viewMatrix,
    	            translate: [i*2-num,j*2-num,1],
    	            color: [i/num, j/num, 0]
    	        }
    		    drawCube(obj)
    		}    	    
    	}    	
    }
    
    console.log('render')
    
    
    window.requestAnimationFrame(render)
}

render()