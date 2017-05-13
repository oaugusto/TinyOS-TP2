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

var FIELD_SIZE = { dest_addr:  2, // in bytes
                   src_addr:   2, 
                   msg_len:    1, 
                   groupID:    1, 
                   handlerID:  1, 
                   payload:   28 };

var HEADER_SIZE = FIELD_SIZE.dest_addr + FIELD_SIZE.src_addr
                    + FIELD_SIZE.msg_len + FIELD_SIZE.groupID 
                    + FIELD_SIZE.handlerID;

var TOSMsg = function(dest_addr, src_addr, groupID, handlerID, payload) {
    this.defineDestAddr(dest_addr);
    this.defineSrcAddr(src_addr);
    this.defineGroupID(groupID);
    this.defineHandlerID(handlerID);
    this.definePayload(payload);
}

TOSMsg.prototype.defineDestAddr = function(dest_addr) { 
    this.dest_addr = Tools.valueToNBytes(dest_addr, 2);
}

TOSMsg.prototype.defineSrcAddr = function(src_addr) { 
    this.src_addr = Tools.valueToNBytes(src_addr, 2);
}

TOSMsg.prototype.defineGroupID = function(groupID) { 
    this.groupID = Tools.valueToNBytes(groupID, 1);
}

TOSMsg.prototype.defineHandlerID = function(handlerID) { 
    this.handlerID = Tools.valueToNBytes(handlerID, 1);
}

// Payload MUST be of type Uint8Array and in big-endian format. 
TOSMsg.prototype.definePayload = function(payload) { 
    if (!(payload instanceof Buffer))
        throw 'Error: Payload must be of type Buffer.'

    if (payload.length <= FIELD_SIZE.payload) {
        this.payload = new Buffer(payload);

    } else {
        this.payload = new Buffer(FIELD_SIZE.payload);
        for (var i = 0; i < FIELD_SIZE.payload; i++) {
            this.payload[i] = payload[i];
        }
    }

    // Updates the message length.
    this.msg_len = Tools.valueToNBytes(payload.length, 1);
}

// MUST be called only after all fields are completed.
TOSMsg.prototype.calculateMsgLen = function() { 
    var sum = this.dest_addr.length + this.src_addr.length + this.groupID.length
                    + this.handlerID.length + this.payload.length + 1;
    this.msg_len = Tools.valueToNBytes(sum, 1);
}

TOSMsg.prototype.toBuffer = function() {
    var totalLength = HEADER_SIZE + Tools.bufferToValue(this.msg_len);

    return Buffer.concat([this.dest_addr,
                             this.src_addr,
                             this.msg_len,
                             this.groupID,
                             this.handlerID,    
                             this.payload], totalLength);  
}

TOSMsg.prototype.toJSON = function() {
    return {dest_addr:  Tools.bufferToValue(this.dest_addr),
            src_addr:   Tools.bufferToValue(this.src_addr),
            msg_len:    Tools.bufferToValue(this.msg_len),
            groupID:    Tools.bufferToValue(this.groupID),
            handlerID:  Tools.bufferToValue(this.handlerID),
            payload:    this.payload.toJSON()
        };
}

module.exports.TOSMsg     = TOSMsg;
module.exports.FieldSize  = FIELD_SIZE;
module.exports.HeaderSize = HEADER_SIZE;