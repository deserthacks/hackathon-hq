'use strict';

var http = require('http'),
    socketio = require('socket.io');

var config = require('../');

module.exports = function(app){
  /** Initialize HTTP server for app */
  var server = http.createServer(app).listen(config.port, function(){
    console.log('Express app running on HTTP port %d in %s mode', config.port, app.get('env'));
  });

  /** Attach socket.io */
  if(config.socketio.enabled){
    var socket = socketio(server, { serveClient: false });
    require('../socketio')(socket);
    console.log('Binding sockets to HTTP server');
  }
};