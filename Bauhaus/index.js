const regl = require('regl')()
const glm = require('gl-matrix')
var mat4 = glm.mat4

//import the shader located in a external file
const vertexShader = require('./shaders/vertexShader.js')
const fragShader = require('./shaders/fragShader.js')

//load the object tool
const loadObj = require('./utils/loadObj.js')

//////////////////////////////////////////////////////////////////
//create socket control
const io = require('socket.io-client')

// PUT YOUR IP HERE TOO
//const socket = io('http://10.97.247.72:9967')
//const socket = io('http://10.98.28.76:9876')
const socket = io('http://192.168.43.155:9876')

//define the mouseX and mouseY variables
var mouseX=0.0;
var mouseY=0.0;

var clickedX = 0.0;
var clickedY = 0.0;
var time2 = 0.0;

socket.on('clicked', function(objClick){
    if (time2 > 0.25){
        time2 = 0.01;
        var moveRangeX = 370
        var moveRangeY = 200

        clickedX = (objClick.clickX-0.5) * moveRangeX
        clickedY = -(objClick.clickY-0.5) * moveRangeY
        console.log('reset', clickedX, clickedY)
    }
})

//control the mouse position with a remote control 
socket.on('touch', function (objTouch) {
    var moveRangeX = 370
    var moveRangeY = 200

    mouseX = (objTouch.touchX-0.5) * moveRangeX
    mouseY = -(objTouch.touchY-0.5) * moveRangeY
})

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

///////////////////////////////////////////////////////////////////
// defin the time for animation
var currTime = 0

//////////////////////////////////////////////////////////////////
// clear the background in each frame
const clear = () => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
}

var drawCube;

loadObj('./assets/cube.obj', function(obj){
    console.log('model loaded',obj)

    const attributes = {
        aPositions: regl.buffer(obj.positions),
        aUV: regl.buffer(obj.uvs)
    }

    drawCube = regl({
        uniforms: {
            uTime:regl.prop('time'),
            uProjectionMatrix: regl.prop('projection'),
            uViewMatrix: regl.prop('view'),
            uTranslate: regl.prop('translate'),
            uMouse: regl.prop('mouseMo'),
            uClick: regl.prop('clicked'), 
            uClickTime1: regl.prop('clickTime1')
        },

        vert:vertexShader,
        frag: fragShader,
        attributes: attributes,
        count: obj.count
    })
})

//////////////////////////////////////////////////////////////////
//define the render function
function render (){
    
    clear()
    //set the movment that the camera will have if it is required
    var cameraRad = 2;
    var cameraX = Math.sin(currTime)*cameraRad
    var cameraY = Math.cos(currTime)*cameraRad
    //define the camara movment and interaction with the mouse
    mat4.lookAt(viewMatrix, [cameraX,cameraY,130], [0,0,0], [0,1,0])
    //clear the drawing for each frame
    currTime += 0.01
    time2 += 0.01   

    if (drawCube !== undefined){
        var num = 100;
        var sizeCube = 4.5;
        var start = -num / 2 * sizeCube ;

        for (i = 0; i< num; i++){
             for (j = 0; j < num; j++){
           
                //make the grid centered
                var x = start + i * sizeCube;
                var y = start + j * sizeCube;
                
                //draw the object
                var obj = {
                    time: currTime,
                    projection: projectionMatrix,
                    view: viewMatrix,
                    translate: [x,y,1],                 
                    mouseMo: [mouseX ,mouseY,0],  
                    clicked:[clickedX,clickedY,0],
                    clickTime1 : time2,               
                }                                                  
            
             drawCube(obj) 
            }
        }
    }    
    
    window.requestAnimationFrame(render)
}
//calling the render function and print the final image
render()

window.addEventListener('resize', function (){
    regl.poll()
    var fov = 75 * Math.PI / 180
    var aspect = window.innerWidth / window.innerHeight
    mat4.perspective(projectionMatrix, fov, aspect, 0.01, 1000.0)

    var viewMatrix = mat4.create()
    mat4.lookAt(viewMatrix, [0,0,2], [0,0,0], [0,1,0])
})               