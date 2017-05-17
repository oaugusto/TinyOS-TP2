var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Base = require('./back/base');

app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Home',
    AppName: 'Data Collector'
  });
});

//base = new Base('/dev/ttyUSB0', 0x0000);

// Handles the application requests.
io.on('connection', function(socket){
  console.log('User connected.');

  socket.on('reqtop', function(msg){
    if (msg.request) {
      console.log('Request: Network topology.');
      //base.requestTopology();
      io.emit('restop', msg);
    }
  })

  socket.on('reqread', function(msg){
    if (msg.request) {
      console.log('Request: Read.');
      io.emit('resread', msg);
    }
  })

  socket.on('reqmread', function(msg){
    if (msg.request) {
      console.log('Request: Multiple reads.');
      io.emit('resmread', msg);
    }
  })


  socket.on('disconnect', function(){
    console.log('User disconnected');
  });
});

http.listen(3000, function(){
  console.log('Listening on localhost:3000')
});