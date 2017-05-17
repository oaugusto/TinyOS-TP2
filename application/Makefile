COMPONENT=IotAppC
TOSMAKE_PRE_EXE_DEPS = RequestTopo.py RequestTopo.class ReplyTopo.class RequestData.class ReplyData.class
TOSMAKE_CLEAN_EXTRA = RequestTopo.py RequestTopo.class RequestTopo.java ReplyTopo.class ReplyTopo.java RequestData.class RequestData.java ReplyData.class ReplyData.java
CFLAGS += -I$(TINYOS_OS_DIR)/sensorboards/mda100/cb
CFLAGS += -I$(TINYOS_OS_DIR)/sensorboards/mda100
#CFLAGS += -I$(TOSDIR)/sensorboards/mda100
#CFLAGS += -I$(TOSDIR)/sensorboards/mda100/cb



RequestTopo.py: Iot.h
	nescc-mig python $(CFLAGS) $(NESC_PFLAGS) -python-classname=RequestTopo Iot.h request_topo -o $@

RequestTopo.class: RequestTopo.java
	javac RequestTopo.java

RequestTopo.java: Iot.h
	nescc-mig java $(CFLAGS) $(NESC_PFLAGS) -java-classname=RequestTopo Iot.h request_topo -o $@

ReplyTopo.class: ReplyTopo.java
	javac ReplyTopo.java

ReplyTopo.java: Iot.h
	nescc-mig java $(CFLAGS) $(NESC_PFLAGS) -java-classname=ReplyTopo Iot.h reply_topo -o $@

RequestData.class: RequestData.java
	javac RequestData.java

RequestData.java: Iot.h
	nescc-mig java $(CFLAGS) $(NESC_PFLAGS) -java-classname=RequestData Iot.h request_data -o $@

ReplyData.class: ReplyData.java
	javac ReplyData.java

ReplyData.java: Iot.h
	nescc-mig java $(CFLAGS) $(NESC_PFLAGS) -java-classname=ReplyData Iot.h reply_data -o $@

#include $(MAKERULES)
include $(TINYOS_ROOT_DIR)/Makefile.include

