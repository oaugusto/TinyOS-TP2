#include <Timer.h>
#include "Collector.h"

module ModuleTestC {

    provides interface Init;

    uses{
        interface Boot;
        interface Leds;

	interface AMPacket;
	interface AMSend as BeaconSend;
	interface Receive as BeaconReceive;
	interface SplitControl as RadioControl;

        interface Timer<TMilli> as TimerOne;
        interface Timer<TMilli> as TimerTwo;

        interface Random;
    }
}

implementation {

	/*keeps track of whether the radio is on.*/
	am_addr_t parent;

	/*keeps track of whether the radio is on.*/
	bool radioOn = FALSE;

	bool running = FALSE;
	
	bool sending = FALSE;

	bool state_is_root;
	
	am_addr_t my_ll_addr;

	message_t beaconMsgBuffer;
	collector_topo_header_t* beaconMsg;

	command error_t Init.init() {
		uint16_t maxLength;
		radioOn = FALSE;
		running = FALSE;
		beaconMsg = call BeaconSend.getPayload(&beaconMsgBuffer, call BeaconSend.maxPayloadLength());
		maxLength = call BeaconSend.maxPayloadLength();
		//dbg("", "");
		return SUCCESS;
	}

	event void Boot.booted() {
		call RadioControl.start();
	}

	event void RadioControl.startDone(error_t error) {
		if (error != SUCCESS) {
			call RadioControl.start();
		} else {
			radioOn = TRUE;
			if (TOS_NODE_ID == 1) {
				//set root here
			}
		}
	}

	event void RadioControl.stopDone(error_t error) {
		radioOn = FALSE;
	}

	task void sendBeaconTask() {
		error_t eval;

		if (sending) {
			return;
		}
		
		beaconMsg->parent = parent;
		//dbg("", "");
		
		eval = call BeaconSend.send(AM_BROADCAST_ADDR,
					    &beaconMsgBuffer,
					    sizeof(collector_topo_header_t));		

		if (eval == SUCCESS) {
			sending = TRUE;
		} else {
			radioOn = FALSE;
			//dbg("", "");
		}

	}

	event void BeaconSend.sendDone(message_t* msg, error_t error) {
		if ((msg != &beaconMsgBuffer) || !sending) {
			return;
		}
		sending = FALSE;
	}

	event void TimerOne.fired() {
		
	}

	event void TimerTwo.fired() {
		
	}

	collector_topo_header_t* getHeader(message_t* ONE m) {
		return (collector_topo_header_t*)call BeaconSend.getPayload(m, call BeaconSend.maxPayloadLength());
	}

	event message_t* BeaconReceive.receive(message_t* msg, void* payload, uint8_t len) {
		am_addr_t from;
		collector_topo_header_t* rcvBeacon;
		
		if (len != sizeof(collector_topo_header_t)) {
			return msg;
		}
		
		from = call AMPacket.source(msg);
		rcvBeacon = (collector_topo_header_t*)payload;

		/*deal with data here*/

		return msg;

	}

}
