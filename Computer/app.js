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
app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Welcome',
    name: 'Jose'
  });
});

app.get('/reqtop', function(req, res) {
  res.render('top', {
    title: 'Welcome'
  });
});

app.listen(3000);

//console.log(msg.getMsgInBytes);
/*var http = require('http');

var server = http.createServer(function(req, res) {
    res.writeHead(200); // 200 - OK
    res.end(opstatus);
});

server.listen(8000);*/