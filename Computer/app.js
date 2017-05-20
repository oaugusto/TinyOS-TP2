var express    = require('express');
var app        = express();
var http       = require('http').Server(app);
var io         = require('socket.io')(http);
var net        = require('net');

var WebPort    = 3000;
var CtrPort    = 9000;
var Host       = '127.0.0.1';
var readySend  = false;

var ctrSocket = new net.Socket();

// To display the home page.
app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Home',
    AppName: 'Data Collector'
  });
});

// Reveive data from base station.
ctrSocket.on('data', function(data) {
  try {
    msg = JSON.parse(data);
  } catch (e) {
    console.log('Unknown message: ', data);
    return;
  }

  console.log(msg);

  if (!msg.temperature) { // Topology message
    console.log('Message received from Java App. --Top');
    io.emit('restop', {parent: msg.parent,
                       child:  msg.id});

  } else {  // Data message
    console.log('Message received from Java App. --Read');
    io.emit('resread', {src:  msg.id,
                        temp: msg.temperature,
                        lum:  msg.luminosity});
  }
})


// Handles the application requests.
io.on('connection', function(socket){
  console.log('Web App connected.');

  socket.on('connsetings', function(msg) {
    console.log('Config msg received.');
    console.log(msg);

    ctrSocket.connect(msg.port, msg.host, function(){
      console.log('Java App connected.');
      io.emit('connstatus', {isConn: true});
      readySend = true;
    });

    ctrSocket.on('error', function(){
      console.log('Java App not found.');
      io.emit('connstatus', {isConn: false});
      readySend = false;
    })
  })

  socket.on('reqtop', function(msg){
    if (msg.request) {
      console.log('Request: Network topology.');
      console.log(msg);

      if (readySend)
        ctrSocket.write('RequestTopo\n');
      else
        console.log('Error: Java App not connected.')  
    }
  })


  socket.on('reqread', function(msg){
    if (msg.request) {
      console.log('Request: Round of Reads.');
      console.log(msg);

      if (readySend)
        ctrSocket.write('RequestData\n');
      else
        console.log('Error: Java App not connected.')
    }
  })

  socket.on('disconnect', function(){
    console.log('Web App disconnected');
  });
});

// Server
http.listen(WebPort, function(){
  console.log('Listening on localhost: ', WebPort);
});