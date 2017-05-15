	
	
	var serialport = require("serialport");
	var SerialPort = serialport.SerialPort
	var BLEPort = new SerialPort("/dev/ttyUSB3", {
  		baudrate: 115200
	});
	
	var thisAddr = 5;	

var buildPkt_v1 = function(to, from,seq, data){

	var firstByte = 1 << 3;
	firstByte += parseInt(to);
	firstByte <<= 3;
	firstByte += parseInt(from);

	if(data.lenght > 9){
		return false;
	}
	var secondByte = data.length;

	var pkt = new Buffer(12);
	pkt.writeUInt8(firstByte, 0);
	pkt.writeUInt8(seq,1);
	pkt.writeUInt8(secondByte,2);

	data.copy(pkt,3,0,secondByte);

	return pkt;

}

var parsePkt_v1 = function(pkt){

	var ret = {};

	var firstByte = pkt.readUInt8(0);
	ret.from = firstByte & 7;
	firstByte >>= 3;
	ret.to = firstByte & 7;
	firstByte >>= 3;
	var version = firstByte & 3;

	if(version != 1){
		return false;
	}

	var secondByte = pkt.readUInt8(1);

	ret.seq = secondByte;

	var thirdByte = pkt.readUInt8(2);

	ret.size = thirdByte;

	ret.data = new Buffer(thirdByte);

	pkt.copy(ret.data,0,3,3+thirdByte);
	
	return ret;
	

}

	var pkt = {'parsePkt_v1': parsePkt_v1, 'buildPkt_v1': buildPkt_v1};

	var data = new Buffer("l");

	var p = data;
	
	var currPkt = new Buffer(12);

	var currPnt = 0;
	
	var pressThreshold = 400;

var temp = {};
var press = {};

var fifo = [];
var fifo_cb = [];
var fifo_to = [];
var lastPkt = null;
var lastCb = null;
var lastTo = null;
var seq = 1;

var BLEtimer = function(){
	if(lastPkt == null){
		lastPkt = fifo.shift();
		lastCb = fifo_cb.shift();
		lastTo = fifo_to.shift();
	}
	if(lastPkt != null){
		var p = pkt.buildPkt_v1(lastTo,thisAddr,seq,lastPkt);
		BLEPort.write(p,lastCb);
	}
}	

var sendPacket = function(packet,to,cb){
	seq = (seq + 1) % 128;
	var p = pkt.buildPkt_v1(to,thisAddr,seq,packet);
	BLEPort.write(p,cb);
}

var BLEParse = function(pk){
	var parsed = pkt.parsePkt_v1(pk);
	//console.log(parsed);
	if(parsed.to == 7 || parsed.to == thisAddr){
		if(parsed.to == thisAddr && parsed.seq == seq){
			lastPkt = null;
			lastCb = null;
		}
		//console.log(parsed.data[0]);
		switch(parsed.data[0]){
			case 114:
						var b1 = parsed.data.readInt32LE(1);
						temp.a = b1 & 1023;
						b1 >>= 10;
						temp.b = b1 & 1023;
						b1 >>= 10;
						temp.c = b1 & 1023;

						var b2 = parsed.data.readInt32LE(5);
						press.a = b2 & 1023;
						b2 >>= 10;
						press.b = b2 & 1023;
						b2 >>= 10;
						press.c = b2 & 1023;

						var dataD = new Buffer(2);

						dataD[0] = 76; //L

						var readings = {
							a: -1,
							b: -1,
							c: -1
				
						};
						if(press.a > pressThreshold){
							readings.a = temp.a;
						}
						if(press.b > pressThreshold){
							readings.b = temp.b;
						}
						if(press.c > pressThreshold){
							readings.c = temp.c;
						}

						if(readings.a > readings.b && readings.a > readings.c){
							dataD[1] = 1;
				
						}else if(readings.b > readings.a && readings.b > readings.c){
							dataD[1] = 2;

						}else if(readings.c > readings.b && readings.c > readings.a){
							dataD[1] = 4;
						}
						console.log("Received beacon",dataD[1],temp,press);

						
/*
						sendPacket(dataD,parsed.from,function(err,results){
							console.log(temp,press,"Replied L!", dataD ,"Success:" + (!err));
						});
*/
			break;
/*
			case 65:
				console.log("Received callback.",parsed,parsed.data[1])

			break;
			case 108:
				console.log("Received listening callback. Requesting information...");
				var data = new Buffer("R");
				sendPacket(data,parsed.from,function(err,results){
					console.log("Replied R! Success:" + (!err));
				});
			break;
*/
			default:
				console.log("Unknown package received.",parsed.data[0],parsed);
		}
	}else{
		console.log("Discard! Destination:" + parsed.to);
	}
}	
	var BLEStarted = false;
	BLEPort.on("open", function () {
	console.log("open BLE");
				BLEPort.on('data', function(data) {
							//console.log("pkg in",data);
							data.copy(currPkt,currPnt);
							currPnt += data.length;
							if(currPnt >= 12){
								currPnt = 0;
								BLEParse(currPkt);
							}
				});
		//setInterval(BLEtimer,5000);
	});
 


//
