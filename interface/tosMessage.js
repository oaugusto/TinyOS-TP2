/**
 * TinyOS Message
 * 
 * Destination address (2 bytes)
 * Source address (2 bytes)
 * Message length (1 byte)
 * Group ID (1 byte)
 * Active Message handler type (1 byte)
 * Payload (up to 28 bytes)
 * 
 * | dest_addr | src_addr| msg_len | groupID | handlerID | payload |
 */

var Tools = require('./tools');

var MAX_SIZE = { dest_addr:  2, // in bytes
                 src_addr:   2, 
                 msg_len:    1, 
                 groupID:    1, 
                 handlerID:  1, 
                 header:     7, // sum of all elements above
                 payload:   28 };

var TOSMsg = module.exports = function(dest_addr, src_addr, groupID, handlerID, payload) {
    this.tools      = new Tools();  

    this.defineDestAddr(dest_addr); //this.dest_addr  = new Uint8Array(2);
    this.defineSrcAddr(src_addr); //this.src_addr   = new Uint8Array(2);
    this.defineGroupID(groupID); //this.groupID    = new Uint8Array(1);
    this.defineHandlerID(handlerID); //this.handlerID  = new Uint8Array(1);
    this.definePayload(payload); //this.payload    = new Uint8Array(28);
}

TOSMsg.prototype.defineDestAddr = function(dest_addr) { 
    this.dest_addr = this.tools.valueToNBytes(dest_addr, 2);
}

TOSMsg.prototype.defineSrcAddr = function(src_addr) { 
    this.src_addr = this.tools.valueToNBytes(src_addr, 2);
}

TOSMsg.prototype.defineGroupID = function(groupID) { 
    this.groupID = this.tools.valueToNBytes(groupID, 1);
}

TOSMsg.prototype.defineHandlerID = function(handlerID) { 
    this.handlerID = this.tools.valueToNBytes(handlerID, 1);
}

/**
 * Payload MUST be of type Uint8Array and in big-endian format. 
 */
TOSMsg.prototype.definePayload = function(payload) { 
    if (!(payload instanceof Uint8Array))
        throw 'Error: Payload must be of type Uint8Array.'

    if (payload.length <= MAX_SIZE.payload) {
        this.payload = new Uint8Array(payload);

    } else {
        this.payload = new Uint8Array(MAX_SIZE.payload);
        for (var i = 0; i < MAX_SIZE.payload; i++) {
            this.payload[i] = payload[i];
        }
    }

    // Updates the message length.
    this.msg_len = this.tools.valueToNBytes(payload.length, 1);
}

// MUST be called only after all fields are completed.
TOSMsg.prototype.calculateMsgLen = function() { 
    var sum = this.dest_addr.length + this.src_addr.length + this.groupID.length
                    + this.handlerID.length + this.payload.length + 1;
    this.msg_len = this.tools.valueToNBytes(sum, 1);
}

TOSMsg.prototype.getMsgInBytes = function() {
    var msg = new Uint8Array(MAX_SIZE.header + 
                    this.tools.byteArrayToValue(this.msg_len));
    var point = 0;
    msg.set(this.dest_addr, point);

    point += MAX_SIZE.dest_addr
    msg.set(this.src_addr, point);

    point += MAX_SIZE.src_addr;
    msg.set(this.msg_len, point);

    point += MAX_SIZE.msg_len;
    msg.set(this.groupID, point);

    point += MAX_SIZE.groupID;
    msg.set(this.handlerID, point);
    
    point += MAX_SIZE.handlerID;
    msg.set(this.payload, point);

    return msg;
}