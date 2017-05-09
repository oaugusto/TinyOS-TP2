#include "Collector.h"

configuration CollectorAppC { }

implementation {

  components CollectorC, MainC, LedsC, ActiveMessageC;
  components new AMSenderC(AM_COLLECTOR_TOPO);
  components new AMReceiverC(AM_COLLECTOR_TOPO);
  components new TimerMilliC() as timer1;
  components new TimerMilliC() as timer2;
  components RandomC;

  MainC.SoftwareInit -> CollectorC;
  CollectorC.Boot -> MainC;
  CollectorC.RadioControl -> ActiveMessageC;
  CollectorC.Leds -> LedsC;

  CollectorC.BeaconSend -> AMSenderC;
  CollectorC.BeaconReceive -> AMReceiverC;

  CollectorC.TimerOne -> timer1;
  CollectorC.TimerTwo -> timer2;
  CollectorC.Random -> RandomC;
} 
