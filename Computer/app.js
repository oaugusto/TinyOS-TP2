var express = require('express');
//var Port = require('./portCtrl');
//var MsgCreator = require('./TOSMsgCreator');

//port = new Port(, BaudRate.iris);
/*var info = new Buffer(4);
info[0] = 0x00; 
info[1] = 0x02;
info[2] = 0x00;
info[3] = 0x0B;

var creator = new MsgCreator();
var msg1 = creator.create(0xffff, 0x0000, 0x22, 0x06, info);
var TOSmsg = msg1.toBuffer();
for (var i=0; i < TOSmsg.length; i++)
    console.log(TOSmsg[i]);

var msg2 = creator.createFromBuffer(TOSmsg);
var tosmsg = msg2.toBuffer();
for (var i=0; i < tosmsg.length; i++)
    console.log(tosmsg[i]);*/

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Welcome',
    name: 'Jose'
  });
});

// Handles the application requests.
io.on('connection', function(socket){
  console.log('User connected.');

  socket.on('reqtop', function(msg){
    if (msg.request) {
      console.log('Request: Network topology.');
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