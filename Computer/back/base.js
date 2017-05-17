/**
 * Must execute [chmod 666 serialport] in linux to make the port writable.
 * more info at: 
 * https://www.npmjs.com/package/serialport#ubuntudebian-linux
 * http://tinyos.stanford.edu/tinyos-wiki/index.php/Mote-PC_serial_communication_and_SerialForwarder_(TOS_2.1.1_and_later)
 */
var SerialPort     = require('serialport');
var PortCtrl       = require('./portCtrl');
var Timer          = require('timer');
var TOSMsgCreator  = require('./TOSMsgCreator');
var Tools          = require('./tools');

var BaudRate = { telos:	     115200,
                 telosb:	 115200,
                 tmote:	     115200,
                 micaz:	     57600,
                 mica2:	     57600,
                 iris:	     57600,
                 mica2dot:	 19200,
                 eyes:	     115200,
                 intelmote2: 115200 };

var base = module.exports = function (port_addr, own_id) {
    this.id   = own_id;
    this.port_addr = port_addr;
    this.port = null;

    this.rid      =  0; // Should be random?
    this.last_rid = -1;
}

base.prototype.requestTopology = function() {
    if (this.port != null) {
        this.port.close();
    }

    this.port = new SerialPort(this.port_addr, {
        baudRate: BaudRate.telosb, 
        parser: SerialPort.parsers.byteLength(12) // CHANGE
    });

    var payload = Tools.valueToNBytes(this.rid, 2);
    var msg = TOSMsgCreator.create(0xffff, this.own_id, 0x00, 0x01, payload);

    // Sending request.
    this.port.write(msg.toBuffer(), function(err) {
        if (err) 
            return console.log('Error on write operation:', err.message);
        else
            console.log('Message written.');     
    });

    // 
    this.port.on('data', this.handleTopReq);

    this.last_rid = this.rid;
    this.rid++;
}

base.prototype.requestRead = function() {
    
    if (this.port != null) {
        this.port.close();
    }

    this.port = new SerialPort(this.port_addr, {
        baudRate: BaudRate.telosb//, 
        //parser: SerialPort.parsers.byteLength(11) // CHANGE
    });

    var payload = Tools.valueToNBytes(this.rid, 2);
    var msg = TOSMsgCreator.create(0xffff, this.own_id, 0x00, 0x03, payload);

    // Sending request.
    this.port.write(msg.toBuffer(), function(err) {
        if (err) 
            return console.log('Error on write operation:', err.message);
        else
            console.log('Message written.');     
    });

    // 
    this.port.on('data', this.handleRead);

    this.last_rid = this.rid;
    this.rid++;
}

/**
 * Requests multiple sensor reads with given time interval.
 */
base.prototype.requestMultipleReads = function(num_reads, time_interval) {
    for (var i = 1; i <= num_reads; i++) {
        setTimeout(this.requestRead(), time_interval * i);
    }
}

base.prototype.handleTopReq = function(data) {
    console.log('Data: ' + data);
    console.log('Tamanho: ',data.length)
    var msg = TOSMsgCreator.createFromBuffer(data).toJSON();
    console.log(msg);
    var payload = Tools.extractBufferfromJSON(msg.payload);
    console.log(payload);
    console.log(payload.slice(0,2));
    console.log(Tools.bufferToValue(payload.slice(0,2)));
    console.log(Tools.bufferToValue(payload.slice(2,4)));
}

base.prototype.handleRead = function(data) {
    console.log('Data:' + data);
    var msg = TOSMsgCreator.createFromBuffer(data);
}