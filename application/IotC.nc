#include <Timer.h>
#include "Iot.h"

#define RETRY_TIME 2

module IotC {

    provides interface Init;

    uses{
        interface Boot;
        interface Leds;

	interface AMPacket;
	interface AMSend as Send;
	interface Receive as Receive;
	interface SplitControl as RadioControl;
	interface PacketAcknowledgements as RoutingAck;

        interface Timer<TMilli> as RetryTimer;
        interface Timer<TMilli> as TimerTwo;

        interface Random;
    }
}

implementation {

	/*keeps track of whether the radio is on.*/
	am_addr_t parent; //Node keep only one parent in requisition mode

	/*keeps track of whether the radio is on.*/
	bool radioOn = FALSE;

	bool running = FALSE;
	
	bool sending = FALSE;

	bool state_is_root;
	
	am_addr_t my_ll_addr;

 
	uint8_t tries = 0;
	uint8_t maxRetransmissions = 10;
	uint8_t numRetransmissions = 0;

	message_t beaconMsgBuffer;
	bool retransmittingRequest = FALSE;
	bool requireAck = TRUE;
	request_topo_t* rcvBeacon;

	command error_t Init.init() {
		radioOn = FALSE;
		running = FALSE;
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
			// if (TOS_NODE_ID == 1) {
			// 	//set root here
			// }
		}
	}

	event void RadioControl.stopDone(error_t error) {
		radioOn = FALSE;
	}

	task void sendBeaconTask() {
		uint8_t len;
		uint16_t seqnoRequest;

		error_t eval;
		uint16_t maxLength;
		request_topo_t* beaconMsg;


		if (sending) {
			return;
		}

		beaconMsg = call Send.getPayload(&beaconMsgBuffer, call Send.maxPayloadLength());
		maxLength = call Send.maxPayloadLength();
	    if (requireAck) {
	      eval = call RoutingAck.requestAck(&beaconMsgBuffer);
	    } else {
	      eval = call RoutingAck.noAck(&beaconMsgBuffer);
	    }

		
		beaconMsg->seqno = rcvBeacon->seqno;
		//dbg("", "");
		
		eval = call Send.send(AM_BROADCAST_ADDR,
					    &beaconMsgBuffer,
					    sizeof(request_topo_t));		

		if (eval == SUCCESS) {
			sending = TRUE;
			tries = 0;
		} else {
			radioOn = FALSE;
			tries++;
			// if(tries < 3){
			// 	post sendBeaconTask();
			// }
			//dbg("", "");
		}

	}



	event void Send.sendDone(message_t* msg, error_t error) {
		bool dropped = FALSE;
		if ((msg != &beaconMsgBuffer) || !sending) {
			return;
		}
		sending = FALSE;

	    if (error == EBUSY) {
	      retransmittingRequest = TRUE;
	      call RetryTimer.startOneShot(RETRY_TIME);
	      return;
	    }

	    if (requireAck) {
	      if (!call RoutingAck.wasAcked(msg)) {
	        if (!retransmittingRequest) {
	          retransmittingRequest = TRUE;
	          numRetransmissions++;
	          call RetryTimer.startOneShot(RETRY_TIME);
	          return;
	        } 
	        else {
	          if (numRetransmissions < maxRetransmissions) {
	            numRetransmissions++;
	            call RetryTimer.startOneShot(RETRY_TIME);
	            return;
	          } 
	          else {
	            dropped = TRUE;
	          }
	        }
	      }
	    }

	    numRetransmissions = 0;
	    retransmittingRequest = FALSE;
	 

	}

	event void RetryTimer.fired() {
	    if (retransmittingRequest) {
      		post sendBeaconTask();
    	}
	}

	event void TimerTwo.fired() {
		
	}

	request_topo_t* getHeader(message_t* ONE m) {
		return (request_topo_t*)call Send.getPayload(m, call Send.maxPayloadLength());
	}

	event message_t* Receive.receive(message_t* msg, void* payload, uint8_t len) {

		
		if (len == sizeof(request_topo_t)) {
			uint8_t type = call AMPacket.type(msg);
			am_addr_t from;
			if(type == 0x1){
				//request_topo_t* rcvBeacon;
				from = call AMPacket.source(msg);
				parent = from; //Usa para resposta
				rcvBeacon = (request_topo_t*)payload;
				post sendBeaconTask();
			}
			else{
				//type == 0x3
				from = call AMPacket.source(msg);
			}
		}

		if (len == sizeof(reply_topo_t)) {
			am_addr_t destino = parent;
			//Encaminha para pai
			/*deal with data here*/
		}
		


		return msg;

	}

}
