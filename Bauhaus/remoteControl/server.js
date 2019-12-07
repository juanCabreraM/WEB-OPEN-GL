// server.js

//WEB SOCKETS
const PORT_SOCKET = 9876
const app = require('express')()
const server = app.listen(PORT_SOCKET)
const io = require('socket.io')(server)

// OSC 
const PORT_OSC = 32000
const OscReceiver = require('osc-receiver')
const receiver = new OscReceiver()
receiver.bind(PORT_OSC)

// WEB SOCKETS event lisstener

io.on('connection', (socket) => _onConnected(socket))

function dispatch (socket, eventName) {
  socket.on(eventName, function (o) {
    io.emit(eventName, o)
  })
}

function _onConnected (socket) {
  console.log('A user is connected : ', socket.id)

  socket.on('disconnect', () => _onDisconnected())

  //getting event/data from remote control
  //conection remote to server
  socket.on('touch', function (objTouch){
   
    //sending event/data to front end
    //conection server to frontend
    io.emit('touch', objTouch)
  })

  socket.on('clicked', function(objClick){
    io.emit('clicked', objClick)
    //console.log('clicked', objClick)
  })

  dispatch(socket, 'cameramove')
  dispatch(socket, 'tilt')
}

function _onDisconnected () {
  console.log('A user is disconnected')
}

// EVENT LISTENERS FROM OSC
receiver.on('/mousemove', function (mouseX, mouseY) {
  console.log('OSC mouse move ', mouseX, mouseY)
  io.emit('mousemove', {
    x: mouseX,
    y: mouseY
  })
})