var PortCtrl = require('./portCtrl');
var Timer    = require('timer');
var Message  = require('./tosMessage');

var base = module.exports = function (port_addr, baudrate, own_id) {
    this.port = new PortCtrl(port_addr, baudrate);
    this.id   = own_id;

    this.rid      =  0; // Should be random?
    this.last_rid = -1;
}

base.prototype.requestRead = function() {

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

base.prototype.handleRead = function() {

}