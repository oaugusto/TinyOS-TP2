#include "Iot.h"

configuration IotAppC { }

implementation {



  components  MainC, LedsC, ActiveMessageC;
  components IotC as App;
  components new AMSenderC(AM_REQ_TOPO) as SenderReq;
  components new AMReceiverC(AM_REQ_TOPO) as ReceiverReq;

  components new AMSenderC(AM_REPLY_TOPO) as SenderReply;
  components new AMReceiverC(AM_REPLY_TOPO) as ReceiverReply;

  components new AMSenderC(AM_REQ_DATA) as RequestData;
  components new AMReceiverC(AM_REQ_DATA) as ReceiverReqData;

  components new AMSenderC(AM_REPLY_DATA) as ReplyData;
  components new AMReceiverC(AM_REPLY_DATA) as ReceiverData;

  components new TimerMilliC() as RetryTimerC;
  components new TimerMilliC() as ReplyTimerC;
  components new TimerMilliC() as ReqDataTimerC;
  components new TimerMilliC() as OrigTimerC;
  components new TimerMilliC() as TimerSensor;
  components RandomC;



#if defined(PLATFORM_IRIS)
  components new PhotoC();
  components new TempC();
  App.TimerSensor -> TimerSensor;
  App.ReadPhoto ->PhotoC;
  App.ReadTemp -> TempC;


#endif

  //serial
  // components SerialActiveMessageC as Serial;

  // App.SerialControl -> Serial;
  
  // App.UartSend -> Serial;
  // App.UartReceive -> Serial.Receive;
  // App.UartPacket -> Serial;
  // App.UartAMPacket -> Serial;

  MainC.SoftwareInit -> App;
  App.Boot -> MainC;
  App.RadioControl -> ActiveMessageC;
  App.Leds -> LedsC;
  App.AMPacket -> ActiveMessageC;

  //Request topo
  App.SendRequest -> SenderReq;
  App.ReceiveRequest -> ReceiverReq;

  //Reply topo
  App.SendReply -> SenderReply;
  App.ReceiveReply -> ReceiverReply;

   //Request data
  App.TxReqData -> RequestData;
  App.RxReqData -> ReceiverReqData;

  //Reply data
  App.TxReplyData -> ReplyData;
  App.RxReplyData -> ReceiverData;

  App.RoutingAck -> ActiveMessageC;
  App.RetryTimer -> RetryTimerC;
  App.ReplyTimer -> ReplyTimerC;
  App.OrigPktTimer -> OrigTimerC;
  App.ReplyDataTimer -> ReqDataTimerC;
  App.Random -> RandomC;

} 
