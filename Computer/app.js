var express    = require('express');
var app        = express();
var http       = require('http').Server(app);
var io         = require('socket.io')(http);
var net        = require('net');
var JsonSocket = require('json-socket');

var WebPort    = 3000;
var CtrPort    = 9000;
var Host       = '127.0.0.1';
var readySend  = false;

var ctrSocket = new JsonSocket(new net.Socket());
//ctrSocket.connect(CtrPort, Host);
ctrSocket.on('connection', function() {
  console.log('Java App connected.');
  readySend = true;
})

// To display the home page.
app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Home',
    AppName: 'Data Collector'
  });
});


// Handles the application requests.
io.on('connection', function(socket){
  console.log('Web App connected.');

  socket.on('reqtop', function(msg){
    if (msg.request) {
      console.log('Request: Network topology.');

      socket.emit('restop', {parent: 31, child: 36});
      socket.emit('restop', {parent: 32, child: 33});
      socket.emit('restop', {parent: 33, child: 34});
      socket.emit('restop', {parent: 31, child: 35});
      socket.emit('restop', {parent: 36, child: 37});

      if (readySend) {
        ctrSocket.sendMessage({
// CHANGE
        });

        ctrSocket.on('message', function(msg) {
          var info = {parent: msg.parent,
                      child:  msg.id}
          io.emit('restop', info);
        })

      } else {
        console.log('Error: Java App not connected.')
      }    
    }
  })


  socket.on('reqread', function(msg){
    if (msg.request) {
      console.log('Request: Round of Reads.');

      socket.emit('resread', {src: 31, temp: 36, lum:210});
      socket.emit('resread', {src: 32, temp: 20, lum:10});
      socket.emit('resread', {src: 33, temp: 19, lum:0});
      socket.emit('resread', {src: 35, temp: 5, lum:150});

      if (readySend) {
        ctrSocket.sendMessage({
// CHANGE
        });

        ctrSocket.on('message', function(msg) {
          var info = {src:  msg.id, // CHANGE
                      temp: msg.temperature, // CHANGE
                      lum:  msg.luminosity};

          io.emit('resread', info);
        })

      } else {
        console.log('Error: Java App not connected.')
      }
    }
  })

/*
  socket.on('reqmread', function(msg){
    if (msg.request) {
      console.log('Request: Multiple reads.');
      io.emit('resmread', msg);
    }
  })
*/

  socket.on('disconnect', function(){
    console.log('Web App disconnected');
  });
});

http.listen(WebPort, function(){
  console.log('Listening on localhost: ', WebPort);
});