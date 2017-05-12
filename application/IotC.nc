#include <Timer.h>
#include "Iot.h"
#include "AM.h"
#include "Serial.h"

#define RETRY_TIME 2
#define TAM_BUF 20

module IotC {

    provides interface Init;

    uses{
        interface Boot;
        interface Leds;

		interface AMPacket;
		interface AMSend as SendRequest;
		interface AMSend as SendReply;
		interface AMSend as TxReqData;
		interface AMSend as TxReplyData;
		interface Receive as ReceiveRequest;
		interface Receive as ReceiveReply;
		interface Receive as RxReqData;
		interface Receive as RxReplyData;
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
        interface Timer<TMilli> as ReplyDataTimer;
        interface Timer<TMilli> as OrigPktTimer;
     //    interface Timer<TMilli> as TimerSensor;

	    // interface Read<uint16_t> as ReadPhoto;
	    // interface Read<uint16_t> as ReadTemp;

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

	
	uint16_t lastLuminosity;
	uint16_t lastTemperature;
	
	am_addr_t my_ll_addr;

	uint16_t seqnoReqTopo = 0;
	uint16_t seqnoAux = 0;
	uint16_t seqnoReqData = 0;
	uint16_t seqnoReplyTopo = 0;
	uint16_t seqnoReplyData = 0;
	uint8_t count = 1;


	uint16_t seqnoOrigTopo = 1;
	uint16_t seqnoOrigData = 1;

 
	uint8_t tries = 0;
	uint8_t maxRetransmissions = 1;
	uint8_t numRetransmissions = 0;

	message_t beaconMsgBuffer;
	message_t topoMsgBuffer;
	message_t requestDataBuffer;
	message_t dataBuffer;

	bool retransmitting = FALSE;
	bool retransmittingRequest = FALSE;
	bool retransmittingRequestData = FALSE;
	bool requireAck = TRUE;
	bool ownTopo = FALSE;
	bool ownData = FALSE;
	bool bTxRequest = FALSE;
	bool bTxData = FALSE;
	bool createPkt = FALSE;

	uint16_t window = 2500;

	uint16_t bufferTopo_ids[TAM_BUF];
	uint16_t bufferData_ids[TAM_BUF];
	uint8_t pos_bufferTopo = 0;
	uint8_t pos_bufferData = 0;


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


    bool check_node(uint16_t origin, uint16_t buf[TAM_BUF]){
        uint8_t i, count;
        count = 0;
        for(i = 0; i < TAM_BUF; i++){
        	if(buf[i] == origin){
        	    return TRUE;
        	}
        }
        return FALSE;
    }

    void clean_buffer(){
    	uint8_t i;
  	    for(i = 0; i < TAM_BUF; i++)
            bufferTopo_ids[i] = 0;
        	bufferData_ids[i] = 0;
    }



    void addContent(uint16_t buf[TAM_BUF], uint16_t origin, uint8_t *pos) {
        uint8_t i, count;
        count = 0;
        for(i = 0; i < TAM_BUF; i++){
        	if(buf[i] == origin){
        	    return;
        	}
        }
        buf[*pos] = origin;
        *pos = (*pos + 1)%TAM_BUF;
    }

	task void sendBeaconTask() {
		uint16_t maxLength;
		uint16_t r;
		
		error_t eval;
		
		request_topo_t* beaconMsg;
		reply_topo_t* pkt;
		bTxRequest = TRUE;
		bTxData = FALSE;


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
		
		pkt = (reply_topo_t*)call SendReply.getPayload(&topoMsgBuffer, sizeof(reply_topo_t));
		pkt->origem = TOS_NODE_ID;
		pkt->seqno = seqnoOrigTopo;
		pkt->parent = parent;
		//ownTopo = TRUE;
		call OrigPktTimer.startOneShot(r);

	}


	task void replyTopoTask() {

		
		error_t eval;
		reply_topo_t* pkt = (reply_topo_t*)call SendReply.getPayload(&topoMsgBuffer, sizeof(reply_topo_t));
		dbg("RequestTopo", "ReplyTopoTask Time: %s\n", sim_time_string());


		if (sending) {
			dbg("RequestTopo", "Error in reply  Time: %s\n", sim_time_string());
			return;
		}


		if(createPkt){
			dbg("RequestTopo", "Create packet Time: %s\n", sim_time_string());
			pkt->seqno = seqnoOrigTopo;
			pkt->parent = parent;
			pkt->origem = TOS_NODE_ID;		
			seqnoOrigTopo++;
			createPkt = FALSE;
		}


	    if (requireAck) {
	      eval = call RoutingAck.requestAck(&topoMsgBuffer);
	    } else {
	      eval = call RoutingAck.noAck(&topoMsgBuffer);
	    }

				
		dbg("RequestTopo", "Task ReplyTopo from node %hhu to node %hhu seqno %hhu Time: %s\n", pkt->origem , parent, pkt->seqno, sim_time_string());
		
		eval = call SendReply.send(parent, &topoMsgBuffer, sizeof(reply_topo_t));		

		if (eval == SUCCESS) {
			sending = TRUE;
		} 



	}


	task void requestDataTask() {
		uint16_t r;
		
		error_t eval;
		
		request_data_t* requestDataMsg;
		reply_data_t* pktData;
		bTxData = TRUE;
		bTxRequest = FALSE;


		if (sending) {
			return;
		}

	    if (requireAck) {
	      eval = call RoutingAck.requestAck(&requestDataBuffer);
	    } else {
	      eval = call RoutingAck.noAck(&requestDataBuffer);
	    }

		
		dbg("RequestData", "Task requestDataTask\n");
		
		eval = call TxReqData.send(AM_BROADCAST_ADDR, &requestDataBuffer, sizeof(request_data_t));		

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
		dbg("RequestData", "Reply data after %d ms  Time: %s\n", r, sim_time_string());
		pktData = (reply_data_t*)(call TxReplyData.getPayload(&dataBuffer, sizeof(reply_data_t)));
		pktData->seqno = seqnoOrigData;
		pktData->origem = TOS_NODE_ID;
		call OrigPktTimer.startOneShot(r);

	}


	task void replyDataTask() {

		
		error_t eval;
		reply_data_t* pktData = (reply_data_t*)(call TxReplyData.getPayload(&dataBuffer, sizeof(reply_data_t)));

		if (sending) {
			dbg("RequestData", "Error in reply Data  Time: %s\n", sim_time_string());
			return;
		}

		if(createPkt){
			dbg("RequestData", "Create packet  Time: %s\n", sim_time_string());
			pktData->seqno = seqnoOrigData;
			pktData->origem = TOS_NODE_ID;
			pktData->data_luminosity = lastLuminosity;
			pktData->data_temperature = lastTemperature;
			seqnoOrigData++;
			createPkt = FALSE;

		}



	    if (requireAck) {
	      eval = call RoutingAck.requestAck(&dataBuffer);
	    } else {
	      eval = call RoutingAck.noAck(&dataBuffer);
	    }

		
		dbg("RequestData", "Task replyDataTask from node %hhu to node %hhu seqno %hhu Time: %s\n", pktData->origem, parent, pktData->seqno, sim_time_string());
		
		eval = call TxReplyData.send(parent, &dataBuffer, sizeof(reply_data_t));		

		if (eval == SUCCESS) {
			sending = TRUE;
			//seqnoData++;
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
		clean_buffer();
		//call TimerSensor.startPeriodic(500);
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
		if ((msg != &beaconMsgBuffer)) {
			return;
		}
		sending = FALSE;

		if(TOS_NODE_ID == 0)
			return;

	    if (error == EBUSY) {
	      retransmittingRequest = TRUE;
	      call RetryTimer.startOneShot(RETRY_TIME);
	      dbg("Boot", "Retransmite SendRequest BUSY.\n");
	      return;
	    }

	    if (requireAck) {
	      if (!call RoutingAck.wasAcked(msg)) {
	        if (!retransmittingRequest) {
	          retransmittingRequest = TRUE;
	          numRetransmissions++;
	          call RetryTimer.startOneShot(RETRY_TIME);
	          dbg("Boot", "Retransmite SendRequest numRetransmissions %hhu.\n", numRetransmissions);
	          return;
	        } 
	        else {
	          if (numRetransmissions < maxRetransmissions) {
	            numRetransmissions++;
	            call RetryTimer.startOneShot(RETRY_TIME);
	            dbg("Boot", "Retransmite SendRequest %hhu.\n", numRetransmissions);
	            return;
	          } 
	          else {
	            dropped = TRUE;
	          }
	        }
	      }
	      // else{
	      // 	dbg("Boot", "ACKED numRetransmissions %hhu.\n", numRetransmissions);
	      // }
	    }

	    numRetransmissions = 0;
	    retransmittingRequest = FALSE;
	 

	}

	event void SendReply.sendDone(message_t* msg, error_t error) {
		bool dropped = FALSE;
		if ((msg != &topoMsgBuffer)) {
			return;
		}
		sending = FALSE;

	    if (error == EBUSY) {
	      retransmitting = TRUE;
	      call ReplyTimer.startOneShot(RETRY_TIME);
	      return;
	    }

	    if (requireAck) {
	      if (!call RoutingAck.wasAcked(msg)) {
	        if (!retransmitting) {
	          retransmitting = TRUE;
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

	    // if(ownTopo){
	    // 	ownTopo = FALSE;
	    // 	seqnoOrigTopo++;
	    // }
	    numRetransmissions = 0;
	    retransmitting = FALSE;
	 

	}

	event void TxReqData.sendDone(message_t* msg, error_t error) {

		bool dropped = FALSE;
		if ((msg != &requestDataBuffer)) {
			return;
		}
		sending = FALSE;

		if(TOS_NODE_ID == 0)
			return;

	    if (error == EBUSY) {
	      retransmittingRequestData = TRUE;
	      call RetryTimer.startOneShot(RETRY_TIME);
	      dbg("Boot", "Retransmite TxReqData.\n");
	      return;
	    }

	    if (requireAck) {
	      if (!call RoutingAck.wasAcked(msg)) {
	        if (!retransmittingRequestData) {
	          retransmittingRequestData = TRUE;
	          numRetransmissions++;
	          call RetryTimer.startOneShot(RETRY_TIME);
	          dbg("Boot", "Retransmite TxReqData.\n");
	          return;
	        } 
	        else {
	          if (numRetransmissions < maxRetransmissions) {
	            numRetransmissions++;
	            call RetryTimer.startOneShot(RETRY_TIME);
	            dbg("Boot", "Retransmite TxReqData.\n");
	            return;
	          } 
	          else {
	            dropped = TRUE;
	          }
	        }
	      }
	    }

	    numRetransmissions = 0;
	    retransmittingRequestData = FALSE;

	}
	event void TxReplyData.sendDone(message_t* msg, error_t error) {
		bool dropped = FALSE;
		if ((msg != &dataBuffer)) {
			return;
		}
		sending = FALSE;

	    if (error == EBUSY) {
	      retransmitting = TRUE;
	      call ReplyDataTimer.startOneShot(RETRY_TIME);
	      return;
	    }

	    if (requireAck) {
	      if (!call RoutingAck.wasAcked(msg)) {
	        if (!retransmitting) {
	          retransmitting = TRUE;
	          numRetransmissions++;
	          call ReplyDataTimer.startOneShot(RETRY_TIME);
	          return;
	        } 
	        else {
	          if (numRetransmissions < maxRetransmissions) {
	            numRetransmissions++;
	            call ReplyDataTimer.startOneShot(RETRY_TIME);
	            return;
	          } 
	          else {
	            dropped = TRUE;
	          }
	        }
	      }
	    }

	    // if(ownData){
	    // 	ownData = FALSE;
	    // 	seqnoOrigData++;
	    // }
	    numRetransmissions = 0;
	    retransmitting = FALSE;

	}

	event void RetryTimer.fired() {
	    if (retransmittingRequest && bTxRequest) {
	    	if(TOS_NODE_ID != 0)
      			post sendBeaconTask();

    	}
	    if (retransmittingRequestData && bTxData) {
	    	if(TOS_NODE_ID != 0)
      			post requestDataTask();

    	}
	}

	event void ReplyTimer.fired() {
		dbg("RequestTopo", "Post ReplyTopoTask Time: %s\n", sim_time_string());
		post replyTopoTask();
	}

	event void OrigPktTimer.fired() {
		dbg("RequestTopo", "OrigPktTimer Post ReplyTopoTask Time: %s\n", sim_time_string());
	    if (bTxRequest) {
	    	createPkt = TRUE;
  			post replyTopoTask();

    	}
	    if (bTxData) {
	    	createPkt = TRUE;
  			post replyDataTask();
    	}

	}

	event void ReplyDataTimer.fired() {
		post replyDataTask();
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

		    request_topo_t* rcvBeacon;
			from = call AMPacket.source(msg);
			rcvBeacon = (request_topo_t*)payload;
			seqnoAux = rcvBeacon->seqno;
			//dbg("RequestTopo", "Received rcvBeacon->seqno %hhu. Time: %s\n", rcvBeacon->seqno , sim_time_string());
			if(seqnoAux != seqnoReqTopo){ 
				seqnoReqTopo = seqnoAux;
				parent = from; //Usa para resposta
				dbg("RequestTopo", "Configura parent %d Time: %s\n", parent,  sim_time_string());
				dbg("RequestTopo", "Encaminha Time: %s\n", sim_time_string());
				//dbg("RequestTopo", "Received seqnoAux %hhu seqno %hhu. Time: %s\n", seqnoAux, seqno, sim_time_string());
				beaconMsgBuffer = *msg;
				post sendBeaconTask();
			}

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

			//Forward
			if(seqnoAux != seqnoReplyTopo || !check_node(origemPkt, bufferTopo_ids)){
				seqnoReplyTopo = seqnoAux;
				dbg("RequestTopo", "Receive reply topo of node %hhu origem %hhu Forward Time: %s\n", from, origemPkt, sim_time_string());
				//dbg("RequestTopo", "Received seqnoAux %hhu seqno %hhu. Time: %s\n", seqnoAux, seqno, sim_time_string());
				topoMsgBuffer = *msg;
				addContent(bufferTopo_ids, origemPkt, &pos_bufferTopo);
				post replyTopoTask();
			}
		}
		
		return msg;

	}

	event message_t* RxReqData.receive(message_t* msg, void* payload, uint8_t len) {
		dbg("RequestData", "Receive request of data packet len %hhu. Time: %s\n", len, sim_time_string());
		if (len == sizeof(request_data_t)) {
		    request_data_t* pktReqData;
			am_addr_t from = call AMPacket.source(msg);
			pktReqData = (request_data_t*)payload;
			seqnoAux = pktReqData->seqno;
			//dbg("RequestTopo", "Received pktReqData->seqno %hhu. Time: %s\n", pktReqData->seqno , sim_time_string());
			if(seqnoAux != seqnoReqData){
				seqnoReqData = seqnoAux;
				//parent = from; //Usa para resposta
				//dbg("RequestTopo", "Configura parent %d Time: %s\n", parent,  sim_time_string());
				dbg("RequestTopo", "Encaminha Time: %s\n", sim_time_string());
				//dbg("RequestTopo", "Received seqnoAux %hhu seqno %hhu. Time: %s\n", seqnoAux, seqno, sim_time_string());
				requestDataBuffer = *msg;
				post requestDataTask();
			}
		}
		
		return msg;

	}

	event message_t* RxReplyData.receive(message_t* msg, void* payload, uint8_t len) {
		dbg("RequestData", "Receive reply of data packet len %hhu. Time: %s\n", len, sim_time_string());
		if (len == sizeof(reply_data_t)) {
			uint8_t type = call AMPacket.type(msg);
			am_addr_t from;
			am_addr_t origemPkt;
		    reply_data_t* pktData;
			from = call AMPacket.source(msg);
			pktData = (reply_data_t*)payload;
			seqnoAux = pktData->seqno;
			origemPkt = pktData->origem;

			if(seqnoAux != seqnoReplyData || !check_node(origemPkt, bufferData_ids)){
				seqnoReplyData = seqnoAux;
				dbg("RequestTopo", "Receive reply of data of node %hhu origem %hhu Forward Time: %s\n", from, origemPkt, sim_time_string());
				//dbg("RequestTopo", "Received seqnoAux %hhu seqno %hhu. Time: %s\n", seqnoAux, seqno, sim_time_string());
				dataBuffer = *msg;
				addContent(bufferData_ids, origemPkt, &pos_bufferData);
				post replyTopoTask();

			}
		}
		
		return msg;

	}

	// event void ReadPhoto.readDone(error_t result, uint16_t val){
	// 	if (result == SUCCESS){
	// 		lastLuminosity = val;
	// 	}
	// }
	
	// event void ReadTemp.readDone(error_t result, uint16_t val){
	// 	if (result == SUCCESS){
	// 		lastTemperature = val;
	// 	}
	// }

	// event void TimerSensor.fired(){
	// 	call ReadPhoto.read();
	// 	call ReadTemp.read();
	// }

  // event void UartSend.sendDone[am_id_t id](message_t* msg, error_t error) {}
  // event message_t *UartReceive.receive[am_id_t id](message_t *msg, void *payload, uint8_t len) {  
  //   	return msg;
  // }

}
