#include <Timer.h>
#include "Iot.h"
#include "AM.h"
#include "Serial.h"

#define RETRY_TIME 2

module IotC {

    provides interface Init;

    uses{
        interface Boot;
        interface Leds;

		interface AMPacket;
		interface AMSend as SendRequest;
		interface AMSend as SendReply;
		interface Receive as ReceiveRequest;
		interface Receive as ReceiveReply;
		interface SplitControl as RadioControl;
		interface PacketAcknowledgements as RoutingAck;

		//serial
		// interface SplitControl as SerialControl;
	 //    interface AMSend as UartSend[am_id_t id];
	 //    interface Receive as UartReceive[am_id_t id];
	 //    interface Packet as UartPacket;
	 //    interface AMPacket as UartAMPacket;

        interface Timer<TMilli> as RetryTimer;
        interface Timer<TMilli> as ReplyTimer;

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

	uint16_t seqno = 0;
	uint16_t seqnoAux = 0;
	uint8_t count = 1;

 
	uint8_t tries = 0;
	uint8_t maxRetransmissions = 1;
	uint8_t numRetransmissions = 0;

	message_t beaconMsgBuffer;
	message_t topoMsgBuffer;
	bool retransmittingRequest = FALSE;
	bool requireAck = TRUE;
	//request_topo_t* rcvBeacon;
	uint16_t window = 2500;



	void initRequest(){
		error_t eval;		
		request_topo_t* beaconMsg = (request_topo_t*) call SendRequest.getPayload(&beaconMsgBuffer, sizeof(request_topo_t) );
		beaconMsg->seqno = count;

		if(sending){
			return;
		}

		eval = call SendRequest.send(AM_BROADCAST_ADDR, &beaconMsgBuffer, sizeof(request_topo_t));
		if (eval == SUCCESS) {
			sending = TRUE;
			dbg("RequestTopo", "Request topology by node %hhu Time: %s\n", TOS_NODE_ID ,sim_time_string());
		}
	}

	task void sendBeaconTask() {
		uint16_t maxLength;
		uint16_t r;
		
		error_t eval;
		
		request_topo_t* beaconMsg;


		if (sending) {
			return;
		}

		// beaconMsg = call Send.getPayload(&beaconMsgBuffer, call Send.maxPayloadLength());
		// maxLength = call Send.maxPayloadLength();
	    if (requireAck) {
	      eval = call RoutingAck.requestAck(&beaconMsgBuffer);
	    } else {
	      eval = call RoutingAck.noAck(&beaconMsgBuffer);
	    }

		
		dbg("RequestTopo", "Task sendBeaconTask\n");
		
		eval = call SendRequest.send(AM_BROADCAST_ADDR,
					    &beaconMsgBuffer,
					    sizeof(request_topo_t));		

		if (eval == SUCCESS) {
			sending = TRUE;
			tries = 0;
		} else {
			//radioOn = FALSE;
			tries++;
			// if(tries < 3){
			// 	post sendBeaconTask();
			// }
			//dbg("", "");
		}

		//Reply data
		r = call Random.rand16();
		r %= window;
		r += 500;
		dbg("RequestTopo", "Reply topo after %d ms  Time: %s\n", r, sim_time_string());
		call ReplyTimer.startOneShot(r);

	}


	task void reply_topo_tTask() {

		
		error_t eval;
		request_topo_t* beaconMsg;
		uint16_t seqnoTopo = 1;

		reply_topo_t* pkt = (reply_topo_t*)call SendReply.getPayload(&pkt, sizeof(reply_topo_t));

		if (sending) {
			dbg("RequestTopo", "Error in reply  Time: %s\n", sim_time_string());
			return;
		}


		// beaconMsg = call Send.getPayload(&beaconMsgBuffer, call Send.maxPayloadLength());
		// maxLength = call Send.maxPayloadLength();
		
		pkt->seqno = seqnoTopo;
		pkt->parent = parent;
		pkt->origem = TOS_NODE_ID;

	    if (requireAck) {
	      eval = call RoutingAck.requestAck(&topoMsgBuffer);
	    } else {
	      eval = call RoutingAck.noAck(&topoMsgBuffer);
	    }

		
		dbg("RequestTopo", "Task reply_topo_t to node %hhu Time: %s\n", parent, sim_time_string());
		
		eval = call SendReply.send(parent, &topoMsgBuffer, sizeof(reply_topo_t));		

		if (eval == SUCCESS) {
			sending = TRUE;
		} 



	}




	command error_t Init.init() {
		radioOn = FALSE;
		running = FALSE;
		//dbg("", "");
		return SUCCESS;
	}

	event void Boot.booted() {
		call RadioControl.start();
		// call SerialControl.start();
		dbg("Boot", "Application booted.\n");
	}

	event void RadioControl.startDone(error_t error) {
		if (error != SUCCESS) {
			call RadioControl.start();
		} else {
			radioOn = TRUE;
			if (TOS_NODE_ID == 0) {
				//Teste request topo
				initRequest();
			}
		}
	}

	event void RadioControl.stopDone(error_t error) {
		radioOn = FALSE;
	}

  // event void SerialControl.startDone(error_t error) {}
  // event void SerialControl.stopDone(error_t error) {}






	event void SendRequest.sendDone(message_t* msg, error_t error) {
		bool dropped = FALSE;
		if ((msg != &beaconMsgBuffer) || !sending) {
			return;
		}
		sending = FALSE;

		if(TOS_NODE_ID == 0)
			return;

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
	          dbg("Boot", "Retransmite.\n");
	          return;
	        } 
	        else {
	          if (numRetransmissions < maxRetransmissions) {
	            numRetransmissions++;
	            call RetryTimer.startOneShot(RETRY_TIME);
	            dbg("Boot", "Retransmite.\n");
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

	event void SendReply.sendDone(message_t* msg, error_t error) {
		bool dropped = FALSE;
		if ((msg != &beaconMsgBuffer) || !sending) {
			return;
		}
		sending = FALSE;

	    if (error == EBUSY) {
	      retransmittingRequest = TRUE;
	      call ReplyTimer.startOneShot(RETRY_TIME);
	      return;
	    }

	    if (requireAck) {
	      if (!call RoutingAck.wasAcked(msg)) {
	        if (!retransmittingRequest) {
	          retransmittingRequest = TRUE;
	          numRetransmissions++;
	          call ReplyTimer.startOneShot(RETRY_TIME);
	          return;
	        } 
	        else {
	          if (numRetransmissions < maxRetransmissions) {
	            numRetransmissions++;
	            call ReplyTimer.startOneShot(RETRY_TIME);
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
	    	if(TOS_NODE_ID != 0)
      			post sendBeaconTask();
    	}
	}

	event void ReplyTimer.fired() {
		post reply_topo_tTask();
	}

	request_topo_t* getHeader(message_t* ONE m) {
		return (request_topo_t*)call SendRequest.getPayload(m, call SendRequest.maxPayloadLength());
	}

	event message_t* ReceiveRequest.receive(message_t* msg, void* payload, uint8_t len) {

		if(TOS_NODE_ID == 0){
			return msg;
		}

		if (len == sizeof(request_topo_t)) {
			uint8_t type = call AMPacket.type(msg);
			am_addr_t from;
			//dbg("RequestTopo", "Received packet type %hhu. Time: %s\n", type, sim_time_string());
			//if(type == 0x1){
		    request_topo_t* rcvBeacon;
			from = call AMPacket.source(msg);
			rcvBeacon = (request_topo_t*)payload;
			seqnoAux = rcvBeacon->seqno;
			//dbg("RequestTopo", "Received rcvBeacon->seqno %hhu. Time: %s\n", rcvBeacon->seqno , sim_time_string());
			if(seqnoAux != seqno){
				seqno = seqnoAux;
				parent = from; //Usa para resposta
				dbg("RequestTopo", "Configura parent %d Time: %s\n", parent,  sim_time_string());
				dbg("RequestTopo", "Encaminha Time: %s\n", sim_time_string());
				//dbg("RequestTopo", "Received seqnoAux %hhu seqno %hhu. Time: %s\n", seqnoAux, seqno, sim_time_string());
				beaconMsgBuffer = *msg;
				post sendBeaconTask();
			}
			//}
		}



		return msg;

	}

	event message_t* ReceiveReply.receive(message_t* msg, void* payload, uint8_t len) {
		dbg("Receive", "ReceivedReply packet len %hhu. Time: %s\n", len, sim_time_string());
		if (len == sizeof(reply_topo_t)) {
			uint8_t type = call AMPacket.type(msg);
			am_addr_t from;
			am_addr_t origemPkt;
		    reply_topo_t* rcvTopo;
			from = call AMPacket.source(msg);
			rcvTopo = (reply_topo_t*)payload;
			seqnoAux = rcvTopo->seqno;
			origemPkt = rcvTopo->origem;

			if(seqnoAux != seqno){
				seqno = seqnoAux;
				dbg("RequestTopo", "Receive reply of node %hhu Forward Time: %s\n", from, origemPkt, sim_time_string());
				//dbg("RequestTopo", "Received seqnoAux %hhu seqno %hhu. Time: %s\n", seqnoAux, seqno, sim_time_string());
				topoMsgBuffer = *msg;
				post reply_topo_tTask();
			}
			//}
		}
		
		return msg;

	}


  // event void UartSend.sendDone[am_id_t id](message_t* msg, error_t error) {}
  // event message_t *UartReceive.receive[am_id_t id](message_t *msg, void *payload, uint8_t len) {  
  //   	return msg;
  // }

}
