/**
 * Must execute [chmod 666 serialport] in linux to make the port writable.
 * more info at: 
 * https://www.npmjs.com/package/serialport#ubuntudebian-linux
 * http://tinyos.stanford.edu/tinyos-wiki/index.php/Mote-PC_serial_communication_and_SerialForwarder_(TOS_2.1.1_and_later)
 */
var serialPort = require('serialport');

var portCtrl = module.exports = function() {

    serialPort.list(function (err, ports) {
        ports.forEach(function(port) {
            console.log(port.comName);
            console.log(port.pnpId);
            console.log(port.manufacturer);
        });
    });

    try {
        this.port = new serialPort('/dev/tty-usbserial1', {
            baudRate: 57600, // For iris
            autoOpen: false
        });

    } catch (err) {
        console.log("Coudn't open the port.")
    }
}

portCtrl.prototype.send = function() {
    console.log('> ' + this.msg);
    
    this.port.on('open', function(){
        this.port.write('teste', function(err) {
            if (err) 
                return console.log('Error on write operation:', err.message);
            else
                console.log('Message written.');     
        });
    }); 

    // Sends updates when new data arrive.
    this.port.on('data', function(data) {
        console.log('Data: ' + data);
    })
}

portCtrl.prototype.rcv = function() {

}

portCtrl.prototype.close = function() {
    this.port.close();
}

