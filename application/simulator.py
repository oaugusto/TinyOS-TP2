#!/usr/bin/env python

from optparse import OptionParser
from TOSSIM   import *
from random   import *
import time
import sys
import os

usage = "usage: %prog [options]"
des = "Simulator"

parser = OptionParser(usage = usage, description = des, version = "%prog 1.0")

parser.add_option("-n","--node",
          action = "store", type = "int", dest = "node", default = 20,
          help = "number of nodes [default: %default]")

parser.add_option("-T", "--TOPO",
          action = "store", type = "string", dest = "topo", default = "1",
          help = "set the topology [default: %default]")

parser.add_option("--test",
          action = "store", type = "int", dest = "test", default = 1,
          help = "number of the test [default: %default]")

parser.add_option("-u", "--utime",
          action = "store", dest = "time", default = "m",
          help = "[default: %default]")

parser.add_option("-t", "--ntime",
          action = "store", type = "int", dest = "ntime", default = 5,
          help = "[default: %default]")


(options, args) = parser.parse_args()


#obtem parametros para o tempo
def getMinute(time, who):
  split = time.split(':')
  if who is 'h':
    return int(split[0])
  elif who is 'm':
    return int(split[1])
  elif who is 's':
    return float(split[2])
  else:
    return split

#funcao de simulacao
#number_test corresponde ao numero do teste sendo executado
#data corresponde a um objeto com metodos: topo, node, test, time, ntime
def simulate(data):
  fileName1 = "boot-test-"         + str(data.test) + ".txt"
  fileName2 = "radio-test-"        + str(data.test) + ".txt"
  fileName3 = "topo--test-"        + str(data.test) + ".txt"
  fileName4 = "trickleP-test-"     + str(data.test) + ".txt"
  fileName5 = "trickleM-test-"     + str(data.test) + ".txt"
  fileName6 = "message-Agg-test-"  + str(data.test) + ".txt"
  fileName7 = "message-Dis-test-"  + str(data.test) + ".txt"
  fileName8 = "message-App-test-"  + str(data.test) + ".txt"
  fileName9 = "stable-test-"       + str(data.test) + ".txt"
  fileName10 = "table-test-"       + str(data.test) + ".txt"
  fileName11 = "./TOPO/"           + str(data.node) + "-nodes/"
  fileName12 = "beacons-test-"     + str(data.test) + ".txt"
  fileName13 = "receive-App-test-" + str(data.test) + ".txt"

  MatrixTreeRoutingCtl  = "MatrixTreeRoutingCtl-test-" + str(data.test) + ".txt"
  MatrixRouting         = "MatrixRouting-test-"        + str(data.test) + ".txt"
  MatrixForwarder       = "MatrixForwarder-test-"      + str(data.test) + ".txt"
  MatrixLITest          = "MatrixLITest-test-"         + str(data.test) + ".txt"
  MatrixFHangBug        = "MatrixFHangBug-test-"       + str(data.test) + ".txt"
  MatrixRoute           = "MatrixRoute-test-"          + str(data.test) + ".txt"

  logName1 = "./LOG/BOO/"     + str(data.topo) + "-topo/" + fileName1
  logName2 = "./LOG/RAD/"     + str(data.topo) + "-topo/" + fileName2
  logName3 = "./LOG/DFU/"     + str(data.topo) + "-topo/" + fileName4
  logName4 = "./LOG/DFU/"     + str(data.topo) + "-topo/" + fileName5
  logName5 = "./LOG/MSG_AGG/" + str(data.topo) + "-topo/" + fileName6
  logName6 = "./LOG/MSG_DIS/" + str(data.topo) + "-topo/" + fileName7
  logName7 = "./LOG/MSG_APP/" + str(data.topo) + "-topo/" + fileName8
  logName8 = "./LOG/STB/"     + str(data.topo) + "-topo/" + fileName9
  logName9 = "./LOG/TBL/"     + str(data.topo) + "-topo/" + fileName10
  logName10= "./LOG/BEA/"     + str(data.topo) + "-topo/" + fileName12
  logName12= "./LOG/REC_APP/" + str(data.topo) + "-topo/" + fileName13

  pathMtx = "./LOG/MTX/"      + str(data.topo) + "-topo/"

  logName11 = fileName11 + data.topo + "-edge-" + str(data.node) + ".edgelist"
  #numero de nos
  numNodes = data.node;

  t = Tossim([])
  r = t.radio()

  f = open(logName11, "r")
  outFile1 = open(logName1,  "w")
  outFile2 = open(logName2,  "w")
  outFile3 = open(logName3,  "w")
  outFile4 = open(logName4,  "w")
  outFile5 = open(logName5,  "w")
  outFile6 = open(logName6,  "w")
  outFile7 = open(logName7,  "w")
  outFile8 = open(logName8,  "w")
  outFile9 = open(logName9,  "w")
  outFile12= open(logName12, "w")

  #outFile10 = open("./LOG/saida.txt","w")
  outFile11 = open(logName10, "w")

  MTXoutfileTreeRoutingCtl = open(pathMtx + MatrixTreeRoutingCtl,  "w")
  MTXoutfileRouting        = open(pathMtx + MatrixRouting,         "w")
  MTXoutfileForwarder      = open(pathMtx + MatrixForwarder,       "w")
  MTXoutfileLITest         = open(pathMtx + MatrixLITest,          "w")
  MTXoutfileFHangBug       = open(pathMtx + MatrixFHangBug,        "w")
  MTXoutfileRoute          = open(pathMtx + MatrixRoute,           "w")

  for line in f:
    s = line.split()
    if len(s) > 0:
      if "gain" in s:
        r.add(int(s[1]), int(s[2]), float(s[3]))
      else:
        r.add(int(s[0]), int(s[1]), float(s[2]))

  f.close()

  t.addChannel("MatrixTreeRoutingCtl", MTXoutfileTreeRoutingCtl)
  t.addChannel("MatrixRouting", MTXoutfileRouting)
  t.addChannel("MatrixRoute", MTXoutfileRoute)
  t.addChannel("MatrixFHangBug", MTXoutfileFHangBug)
  t.addChannel("MatrixForwarder", MTXoutfileForwarder)
  t.addChannel("MatrixLITest", MTXoutfileLITest)

  t.addChannel("booted", outFile1)
  t.addChannel("radio", outFile2)
  t.addChannel("TrickletimerParent", outFile3)
  t.addChannel("TrickletimerMSG", outFile4)
  t.addChannel("Message_Agg", outFile5)
  t.addChannel("Message_Dis", outFile6)
  t.addChannel("Message_App", outFile7)
  t.addChannel("Receive_App", outFile12)
  t.addChannel("stable", outFile8)
  t.addChannel("Table", outFile9)
  #t.addChannel("Saida",outFile10)
  t.addChannel("beacons", outFile11)
  t.addChannel("tty", sys.stdout)

  #Leitura do ruido
  noise = open("meyer-light.txt", "r")

  for line in noise:
    str1 = line.strip()
    if str1:
      val = int(float(str1))
      for i in range(1, numNodes+1):
        t.getNode(i).addNoiseTraceReading(val)

  for i in range(1, numNodes+1):
    t.getNode(i).createNoiseModel()

  noise.close()
 #''' + 1'''
  for i in range(1, numNodes + 1):
    #com aleatoriadeade
    t.getNode(i).bootAtTime(100000 * i + randrange(10000))

  #t.getNode(8).bootAtTime(1000000000 * 8)

  while getMinute(t.timeStr(), data.time) < data.ntime:
    t.runNextEvent()

  #print t.timeStr()

  sys.stderr.write("Simulacao %d\n"%(data.test))
  outFile1.close()
  outFile2.close()
  outFile3.close()
  outFile4.close()
  outFile5.close()
  outFile6.close()
  outFile7.close()
  outFile8.close()
  outFile9.close()

  #outFile10.close()
  outFile11.close()
  outFile12.close()

  MTXoutfileTreeRoutingCtl.close()
  MTXoutfileRouting.close()
  MTXoutfileForwarder.close()
  MTXoutfileLITest.close()
  MTXoutfileFHangBug.close()
  MTXoutfileRoute.close()

if __name__ == "__main__":
  #GraphViz(options)
  simulate(options)
