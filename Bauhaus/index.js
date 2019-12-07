//import regel
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

// PUT YOUR IP HERE TOO conected with the remote control
const socket = io('http://192.168.43.155:9876')

//////////////////////////////////////////////////////////////////

//define the mouseX and mouseY variables for mouse tracking
var mouseX=0.0;
var mouseY=0.0;

//define touche/click position of x and y 
var clickedX = 0.0;
var clickedY = 0.0;

//set initial time for each wave animation
var time0 = 0.0;
var time1 = 0.0;
var time2 = 0.0;

//create array for touch/click x and y position
var clickedPosX = []
var clickedPosY = []

//array for number of clicks
var numClick = 0

//array por time array used for wave animations
var waveTime =[]

//control touch/click signal from the remote control used to create wave motion
socket.on('clicked', function(objClick){

    //reange of mouse action
    var moveRangeX = 370
    var moveRangeY = 200

    //create array of mouse position for x, y and for the time
    waveTime[numClick] =  0
    clickedPosX[numClick] = (objClick.clickX-0.5) * moveRangeX
    clickedPosY[numClick] = -(objClick.clickY-0.5) * moveRangeY

    //clicks count
    numClick ++

    //link time count to click count array, control wave motion time
    time0 = waveTime[0];
    time1 = waveTime[1];
    time2 = waveTime[2];

    //reset the click count 
    if (numClick == 3){
       numClick = 0;
    }

    //defin click to triger time for wave motion
    if (waveTime[numClick] > 0.25){
        waveTime[numClick] = 0.01
    }
})

//control the mouse position with a remote control 
socket.on('touch', function (objTouch) {

    //reange of mouse action
    var moveRangeX = 370
    var moveRangeY = 200

    //receive x and y position and center it 
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

// clear the background in each frame color black
const clear = () => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
}

//setup draw cube 
var drawCube;

//load object function - call the 3D model and set a function for it
loadObj('./assets/cube.obj', function(obj){

    //define atributes for the 3D cube
    const attributes = {
        aPositions: regl.buffer(obj.positions),
        aUV: regl.buffer(obj.uvs)
    }
    //set up all the uniforms to conect with vertex shader
    drawCube = regl({
        uniforms: {
            uTime:regl.prop('time'),
            uProjectionMatrix: regl.prop('projection'),
            uViewMatrix: regl.prop('view'),
            uTranslate: regl.prop('translate'),
            uMouse: regl.prop('mouseMo'),
            uMouse1: regl.prop('mouseMo1'),
            uMouse2: regl.prop('mouseMo2'),
            uMouse3: regl.prop('mouseMo3'),
            uClick1: regl.prop('clicked1'),
            uClick2: regl.prop('clicked2'), 
            uClick3: regl.prop('clicked3'), 
            uClickTime1: regl.prop('clickTime1'),
            uClickTime2: regl.prop('clickTime2'),
            uClickTime3: regl.prop('clickTime3'),
        },

        //call external shaders, atributes and time count for the 3D cube
        vert:vertexShader,
        frag: fragShader,
        attributes: attributes,
        count: obj.count
    })
})

//////////////////////////////////////////////////////////////////

//define the render function
function render (){

    //call background clear function 
    clear()

    //set the movment that the camera 
    var cameraRad = 2;
    var cameraX = Math.sin(currTime)*cameraRad
    var cameraY = Math.cos(currTime)*cameraRad

    //define the camara depth 
    mat4.lookAt(viewMatrix, [cameraX,cameraY,130], [0,0,0], [0,1,0])

    //add each time  aditional factor
    currTime += 0.01
    time0 += 0.01 
    time1 += 0.01
    time2 += 0.01  

    //condition of add time for wave motion independently and progresive
    for (var b = 0; b < waveTime.length; b++){
        waveTime[b] += 0.01;
    }

    //call and draw 3D object by checking if the objects is already loaded
    if (drawCube !== undefined){
        var num = 100;
        var sizeCube = 4.5;
        var start = -num / 2 * sizeCube ;

        //create grid of 3D objects
        for (i = 0; i< num; i++){
             for (j = 0; j < num; j++){  

                //make the grid centered
                var x = start + i * sizeCube;
                var y = start + j * sizeCube;  

                //draw the object and call all the uniforms
                var obj = {
                    time: currTime,
                    projection: projectionMatrix,
                    view: viewMatrix,
                    translate: [x,y,1],                 
                    mouseMo: [mouseX ,mouseY,0],
                    mouseMo1:[clickedPosX[0],clickedPosY[0],0], 
                    mouseMo2:[clickedPosX[1],clickedPosY[1],0],
                    mouseMo3:[clickedPosX[2],clickedPosY[2],0],
                    clicked1:[clickedPosX[0],clickedPosY[0],0],
                    clickTime1 : time0,
                    clicked2:[clickedPosX[1],clickedPosY[1],0],
                    clickTime2 : time1,  
                    clicked3:[clickedPosX[2],clickedPosY[2],0],
                    clickTime3: time2,             
                }             
             drawCube(obj) 
            }
        }
    }    
    window.requestAnimationFrame(render)
}

//calling the render function and print the final image
render()

//create event to change size depending on the window size
window.addEventListener('resize', function (){
    regl.poll()
    var fov = 75 * Math.PI / 180
    var aspect = window.innerWidth / window.innerHeight
    mat4.perspective(projectionMatrix, fov, aspect, 0.01, 1000.0)
    var viewMatrix = mat4.create()
    mat4.lookAt(viewMatrix, [0,0,2], [0,0,0], [0,1,0])
})               