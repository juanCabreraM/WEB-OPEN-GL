const regl = require('regl')()
const glm = require('gl-matrix')
var mat4 = glm.mat4

//import the shader located in a external file
const strVertex = require('./shaders/shaderVertex2.js')
const fragShader = require('./shaders/fragShader2.js')

//load the object tool
const loadObj = require('./utils/loadObj.js')

//////////////////////////////////////////////////////////////////
//camera settings 
// create and define the projection matrix of the camera image
var projectionMatrix = mat4.create()

var fovy = 75 * Math.PI/180;
var aspect = window.innerWidth / window.innerHeight
var near = 0.01;
var far = 1000.0;
mat4.perspective(projectionMatrix,fovy,aspect,near,far)

//create the view matrix that defin the camera position
var viewMatrix = mat4.create()
mat4.lookAt(viewMatrix, [0,0,2], [0,0,0], [0,1,0])

//////////////////////////////////////////////////////////////////
//define  the draw function 
var drawCube
var drawSphere

//load the object that i am going to use
loadObj('./negativeCube.obj',function(obj){
	
	//creat the atribute for the object
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

//load the object that i am going to use
loadObj('./sphere2.obj',function(obj){
    
    //creat the atribute for the object
    var attributes = {
      aPositions: regl.buffer(obj.positions),
      aUV: regl.buffer(obj.uvs)
    }

    //create our draw call
    drawSphere = regl(
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
// defin the time for animation
var currTime = 0

//define the mouseX and mouseY variables
var mouseX=0
var mouseY=0


//define the movment range and listen function por the mouse movment
window.addEventListener('mousemove', function(e){
	
	var percentX = e.clientX / window.innerWidth
	var percentY = e.clientY / window.innerHeight

	percentX = percentX * 2 - 1
	percentY = percentY * 2 - 1

	var moveRange = 10
	mouseX = -percentX * moveRange
	mouseY = percentY  * moveRange
})

//////////////////////////////////////////////////////////////////
// clear the background in each frame
const clear = () => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
}

//////////////////////////////////////////////////////////////////
//define the render function
function render (){
    //define the time for each frame
	currTime += 0.01
    
    //set the movment that the camera will have if it is required
    var cameraRad = 3;
    var cameraX = Math.sin(currTime)*cameraRad
    var cameraY = Math.cos(currTime)*cameraRad
    //define the camara movment and interaction with the mouse
    mat4.lookAt(viewMatrix, [mouseX,mouseY,15], [0,0,0], [0,1,0])
    //clear the drawing for each frame
    clear()
    // define number of objects
    var objects = 10;
    //call the drawing of the first oject the cube
    if (drawCube != undefined){
        var num = objects;
        //loop to make the grid 
    	for(i = 0; i<num;i=i+2){
    		for(j=0; j<num; j=j+2){ 
                for(k=0; k<num; k=k+2){
                   //defining the objet atributes to draw
                   var e=i*2-num;
                   var g=j*2-num;
                   var c=k*2-num;
                   var obj={
                   time: currTime,
                   projection: projectionMatrix,
                   view1: viewMatrix,
                   translate: [e,g,c]                    
                }
                //calling the draw function
                drawCube(obj)
                }
    		}    	    
    	}    	
    }

    //call the drawing of the first oject the cube
    if (drawSphere != undefined){
        var num2 =5* objects;
        //loop to make the grid 
        for(i = 0; i<num2;i=i+2){
            for(j=0; j<num2; j=j+4){ 
                for(k=0; k<num2; k=k+2){
                    //defining the objet atributes to draw
                    var e=i*2-num2;
                    var g=j*2-num2;
                    var c=k*2-num2;
                    var obj={
                    time: currTime,
                    projection: projectionMatrix,
                    view1: viewMatrix,
                    translate: [e,g,c],
                    
                }


                //calling the draw function
                drawSphere(obj)
                }
            }           
        }       
    }
    
    console.log('render')
    
    
    window.requestAnimationFrame(render)
}
//calling the render function and print the final image
render()