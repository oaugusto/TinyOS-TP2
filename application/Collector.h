#ifndef COLLECTOR_H
#define COLLECTOR_H

enum {
    //AM TYPES
    AM_COLLECTOR_TOPO = 0x70,
    AM_COLLECTOR_DATA = 0x71
};

typedef nx_struct {
    nx_uint16_t        id;
    nx_am_addr_t       parent;
    nx_uint8_t         type;
} collector_topo_header_t;   

#endif
