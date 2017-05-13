var Port = require('./portCtrl');
var Msg  = require('./tosMessage');

var BaudRate = { telos:	     115200,
                 telosb:	 115200,
                 tmote:	     115200,
                 micaz:	     57600,
                 mica2:	     57600,
                 iris:	     57600,
                 mica2dot:	 19200,
                 eyes:	     115200,
                 intelmote2: 115200 };

port = new Port(BaudRate.iris);

var info = new Uint8Array(4);
info[0] = 0x00; 
info[1] = 0x02;
info[2] = 0x00;
info[3] = 0x0B;

var msg = new Msg(0xffff, 0x0000, 0x22, 0x06, info);

function logArrayElements(element, index, array) {
  console.log('a[' + index + '] = ' + element);
}

var TOSmsg = msg.getMsgInBytes();
for (var i=0; i < TOSmsg.length; i++)
    console.log(TOSmsg[i]);


//console.log(msg.getMsgInBytes);
/*var http = require('http');

var server = http.createServer(function(req, res) {
    res.writeHead(200); // 200 - OK
    res.end(opstatus);
});

server.listen(8000);*/