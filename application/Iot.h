#ifndef IOT_H
#define IOT_H

//Request topo: 0x1
//Reply topo: 0x2
//Request data: 0x3
//Reply data: 0x4

enum {
    //AM TYPES
    AM_REQ_TOPO = 0x1,
    AM_REPLY_TOPO = 0x2,
    AM_REQ_DATA = 0x3,
    AM_REPLY_DATA = 0x4
};


typedef nx_struct {
    nx_uint16_t        seqno;
} request_topo_t;   

typedef nx_struct {
    nx_uint16_t        seqno;
    nx_uint16_t       parent;
    nx_uint16_t        origem;
} reply_topo_t;   

typedef nx_struct FlushReplyMsg {
	nx_uint16_t seqno;

} reques_data_t;

typedef struct {
    nx_uint16_t seqno;
    nx_uint16_t data_luz;
    nx_uint16_t data_temp;
    nx_uint16_t origem;
    nx_uint16_t extra[10];
} reply_data_t;



#endif
