'use strict';

module.exports = function(socketio){
  socketio.on('connection', function(socket){

    socket.address = socket.handshake.address ?
      socket.handshake.address.address + ':' + socket.handshake.address.port :
      process.env.DOMAIN;

    socket.connectedAt = new Date();
    console.log('Socket<%s> CONNECT', socket.address);


    require('../sockets')(socket);

    socket.on('info', function(data){
      console.log('Socket<%s> %s', socket.address, JSON.stringify(data, null, 2));
    });

    socket.on('error',function(err){
      console.error('SocketError<%s> %s', socket.address, err.stack || err);
    });

    socket.on('disconnect', function(){
      console.log('Socket<%s> DISCONNECT', socket.address);
    });
  });
};
