COMPONENT=IotAppC
TOSMAKE_PRE_EXE_DEPS = RequestTopo.py RequestTopo.class
TOSMAKE_CLEAN_EXTRA = RequestTopo.py RequestTopo.class RequestTopo.java
CFLAGS += -I$(TINYOS_OS_DIR)/sensorboards/mda100/cb


RequestTopo.py: Iot.h
	nescc-mig python $(CFLAGS) $(NESC_PFLAGS) -python-classname=RequestTopo Iot.h request_topo -o $@

RequestTopo.class: RequestTopo.java
	javac RequestTopo.java

RequestTopo.java: Iot.h
	nescc-mig java $(CFLAGS) $(NESC_PFLAGS) -java-classname=RequestTopo Iot.h request_topo -o $@

#include $(MAKERULES)
include $(TINYOS_ROOT_DIR)/Makefile.include

