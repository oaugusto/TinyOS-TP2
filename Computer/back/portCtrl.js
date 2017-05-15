/**
 * Must execute [chmod 666 serialport] in linux to make the port writable.
 * more info at: 
 * https://www.npmjs.com/package/serialport#ubuntudebian-linux
 * http://tinyos.stanford.edu/tinyos-wiki/index.php/Mote-PC_serial_communication_and_SerialForwarder_(TOS_2.1.1_and_later)
 */
var serialPort = require('serialport');

var BaudRate = { telos:	     115200,
                 telosb:	 115200,
                 tmote:	     115200,
                 micaz:	     57600,
                 mica2:	     57600,
                 iris:	     57600,
                 mica2dot:	 19200,
                 eyes:	     115200,
                 intelmote2: 115200 };

var portCtrl = module.exports = function(port_addr) {
    this.port = new serialPort(port_addr, {
        baudRate: BaudRate.telosb,
        stopBits: 1,    // 1 or 2.
        parity: 'none', //'none', 'even', 'mark', 'odd' or 'space' 
        autoOpen: false
    });
}

portCtrl.prototype.send = function(data) {
    console.log('Sending message: [' + this.msg + ']');
    
    this.port.on('open', function(){
        this.port.write(data, function(err) {
            if (err) 
                return console.log('Error on write operation:', err.message);
            else
                console.log('Message written.');     
        });
    }); 
}

portCtrl.prototype.rcv = function(data_handle) {
    // Sends updates when new data arrive.
    this.port.on('data', data_handle);
}

portCtrl.prototype.close = function() {
    this.port.close();
}

