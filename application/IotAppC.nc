#include "Iot.h"

configuration IotAppC { }

implementation {

  components  MainC, LedsC, ActiveMessageC;
  components IotC as App;
  components new AMSenderC(AM_REQ_TOPO) as SenderReq;
  components new AMReceiverC(AM_REQ_TOPO) as ReceiverReq;

  components new AMSenderC(AM_REPLY_TOPO) as SenderReply;
  components new AMReceiverC(AM_REPLY_TOPO) as ReceiverReply;

  components new TimerMilliC() as RetryTimerC;
  components new TimerMilliC() as timer2;
  components RandomC;

  MainC.SoftwareInit -> App;
  App.Boot -> MainC;
  App.RadioControl -> ActiveMessageC;
  App.Leds -> LedsC;
  App.AMPacket -> ActiveMessageC;

  //Request topo
  App.Send -> SenderReq;
  App.Receive -> ReceiverReq;

  //Reply topo
  App.Send -> SenderReply;
  App.Receive -> ReceiverReply;

  App.RoutingAck -> ActiveMessageC;

  App.RetryTimer -> RetryTimerC;
  App.TimerTwo -> timer2;
  App.Random -> RandomC;
} 
