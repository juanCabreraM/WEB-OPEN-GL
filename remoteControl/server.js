// server.js

//crear el servidos
const PORT_SOCKET = 9876
const app = require('express')()
const server = app.listen(PORT_SOCKET)

//metodo de comunicacion
const io = require('socket.io')(server)

// WEB SOCKETS

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
  //socket.on('test', function (objReceived){
    //if(Math.random()>0.99){
      //console.log('obj received : ',objReceived)
    //}
    


    //sending event/data to front end
    //conection server to frontend
    //io.emit('test From Server', objReceived)
  //})

  dispatch(socket, 'cameramove')
  dispatch(socket, 'tilt')
}

function _onDisconnected () {
  //console.log('A user is disconnected')
}
