var Msg   = require('./TOSMessage');
var Tools = require('./tools');

module.exports.create = function(dest_addr, src_addr, groupID, 
                                        handlerID, payload) {

    return new Msg.TOSMsg(dest_addr, src_addr, groupID, handlerID, payload);
}

module.exports.createFromBuffer = function (msg_array) {
    if (!(msg_array instanceof Buffer))
        throw 'Error: Array must be of type Buffer.';

    if (msg_array.length <= Msg.HeaderSize)
        throw 'Error: Array length is smaller than the header of a message.';

    var point = 0;
    var dest_addr = msg_array.slice(point, point+Msg.FieldSize.dest_addr);
    dest_addr = Tools.bufferToValue(dest_addr);

    point += Msg.FieldSize.dest_addr;
    var src_addr = msg_array.slice(point, point+Msg.FieldSize.src_addr);
    src_addr = Tools.bufferToValue(src_addr);

    point += (Msg.FieldSize.src_addr + Msg.FieldSize.msg_len);
    var groupID = msg_array.slice(point, point+Msg.FieldSize.groupID);
    groupID = Tools.bufferToValue(groupID);

    point += Msg.FieldSize.groupID;
    var handlerID = msg_array.slice(point, point+Msg.FieldSize.handlerID);
    handlerID = Tools.bufferToValue(handlerID);

    point += Msg.FieldSize.handlerID;
    var payload = msg_array.slice(point);
    
    return this.create(dest_addr, src_addr, groupID, handlerID, payload);
}

