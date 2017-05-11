#! /usr/bin/python
import sys

from TOSSIM import *
from RequestTopo import *


def simul():
	t = Tossim([])
	r = t.radio()
	f = open("topolinear.txt", "r")
	n = 7
	tcpPort = 9002
	#sf = SerialForwarder(tcpPort)


	for line in f:
	  s = line.split()
	  if s:
	    print " ", s[0], " ", s[1], " ", s[2];
	    r.add(int(s[0]), int(s[1]), float(s[2]))

	t.addChannel("Boot", sys.stdout)
	t.addChannel("RequestTopo", sys.stdout)
	t.addChannel("Receive", sys.stdout)
	saida = open("saida_simulacao.txt", "w")
	t.addChannel("RequestTopo", saida)


	#noise = open("meyer-heavy.txt", "r")
	noise = open("meyer-light.txt", "r")
	for line in noise:
	  str1 = line.strip()
	  if str1:
	    val = int(str1)
	    for i in range(0, n):
	      t.getNode(i).addNoiseTraceReading(val)

	for i in range(0, n):
	  print "Creating noise model for ",i;
	  t.getNode(i).createNoiseModel()
	  t.getNode(i).bootAtTime(1001);


	for i in range(100000):
	  t.runNextEvent()

	# msg = MoteMsg()
	# msg.set_version(7)
	# msg.set_size(2)
	# pkt = t.newSerialPacket()
	# pkt.setData(msg.data)
	# pkt.setType(1)
	# #pkt.setSource(0)
	# pkt.setDestination(65535)

	# print "Delivering " + str(msg) + " to 0 at " + str(t.time() + 10);
	# pkt.deliver(0, t.time() + 10)

	# for i in range(60):
	#   throttle.checkThrottle()
	#   t.runNextEvent()
	#   sf.process()


def main():
	simul()

if __name__ == '__main__':
	main()