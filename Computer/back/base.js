var PortCtrl       = require('./portCtrl');
var Timer          = require('timer');
var TOSMsgCreator  = require('./TOSMsgCreator');
var Tools          = require('./tools');

var base = module.exports = function (port_addr, own_id) {
    this.id      = own_id;
    this.port    = new PortCtrl(port_addr);
    this.creator = new TOSMsgCreator();

    this.rid      =  0; // Should be random?
    this.last_rid = -1;
}

base.prototype.requestTopology = function() {
    var payload = Tools.valueToNBytes(this.rid, 2);
    var msg = this.creator.create(0xffff, own_id, 0x00, 0x01, payload);

    this.port.send(msg.toBuffer());
    this.port.rcv(this.handleTopReq);

    this.last_rid = this.rid;
    this.rid++;
}

base.prototype.requestRead = function() {
    var payload = Tools.valueToNBytes(this.rid, 2);
    var msg = this.creator.create(0xffff, own_id, 0x00, 0x03, payload);

    this.port.send(msg.toBuffer());
    this.port.rcv(this.handleRead);

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
    var msg = this.creator.createFromBuffer(data);
    console.log('Data: ' + data);
}

base.prototype.handleRead = function(data) {
    var msg = this.creator.createFromBuffer(data);
    console.log('Data:' + data);
}