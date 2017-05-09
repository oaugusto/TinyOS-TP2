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
  fileName2 = "beacons-test-"     + str(data.test) + ".txt"

  pathTopo = "./TOPO/"           + str(data.node) + "-nodes/"

  logName1 = "./LOG/BOO/"     + str(data.topo) + "-topo/" + fileName1
  logName2 = "./LOG/RAD/"     + str(data.topo) + "-topo/" + fileName2

  pathTopo = "./TOPO/"        + str(data.node) + "-nodes/" + data.topo + "-edge-" + str(data.node) + ".edgelist"
  #numero de nos
  numNodes = data.node;

  t = Tossim([])
  r = t.radio()

  f = open(pathTopo, "r")
  outFile1 = open(logName1,  "w")
  outFile2 = open(logName2,  "w")

  for line in f:
    s = line.split()
    if len(s) > 0:
      if "gain" in s:
        r.add(int(s[1]), int(s[2]), float(s[3]))
      else:
        r.add(int(s[0]), int(s[1]), float(s[2]))

  f.close()

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

if __name__ == "__main__":
  #GraphViz(options)
  simulate(options)
