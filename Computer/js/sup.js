var socket = io();
var network;
var nodes;
var edges;
var display;
var data;
var vis_options;

$('document').ready(function(){
    network = null;
    display = document.getElementById('top');
    vis_options = {
        nodes: {
            shape: 'dot',
            size: 20,
            font: {
                size: 16
            },
            borderWidth: 2,
            shadow: true
        },
        edges: {
            width: 2,
            shadow: true
        },
        interaction: {
            dragNodes: true,
            dragView: false,
            zoomView: false
        },
        height: '95%',
    };

    $('.btn#reqread').hide();
});

$('#btn-conn').click(function(){
    socket.emit('connsetings', {host: $('#host_addr').val(),
                                port: $('#port').val()});
})

socket.on('connstatus', function(msg){
    console.log(msg);

    // Feedback
    if (msg.isConn) {
        $('div#conpanel').fadeOut(600);
        $('div.btn-panel').fadeIn(600);
        $('label#status').text('Connected.')
                         .css({'color': 'green', 'font-weight': 'bold',
                               'font-size': '16px'});

    } else {
        $('label#status').text('Error: Base station not found. Try again.')
                         .css({'color': 'red', 'font-weight': 'bold',
                               'font-size': '16px'});
    }
})

var createNodeLabel = function(id, temp, lum){
    if (id == 1)
        node_id = 'Base';
    else
        node_id = id;

    return 'Node ' + node_id
         + '\nTemp.: '+ temp.toFixed(2)
         + ' C\nLum.: '+ lum.toFixed(2) + ' lux';
}

// Topology request
$('#reqtop').click(function(){
    $('div#top').empty();
    socket.emit('reqtop', {request: true});

    nodes = new vis.DataSet();
    edges = new vis.DataSet();

    data = {
        nodes: nodes,
        edges: edges
    };

    network = new vis.Network(display, data, vis_options);
})

socket.on('restop', function(msg){
    console.log('Message Received: ', msg);

    if($('.btn#reqread').is(":hidden")) {
        $('.btn#reqread').fadeIn(600)
        $('div.multreadpanel').fadeIn(600);
    }

    console.log(nodes);

    if (nodes.get(msg.parent) == null) {
        if (msg.parent == 1)
            node_label = "Base Station";
        else
            node_label = "Node " + msg.parent;
            
        nodes.add({id: msg.parent,
                   label: node_label,
                   color: '#d3d3d3'})
    }

    if (nodes.get(msg.child) == null) {
        if (msg.child == 1)
            node_label = "Base Station";
        else
            node_label = "Node " + msg.child;

        nodes.add({id: msg.child,
                   label: node_label,
                   color: '#d3d3d3'})
    }

    edges.update({from: msg.parent, to: msg.child});  
})


// Individual read function.
var read_fun = function(){
    if (nodes != null) {
        nodes.forEach(function(node) {
            node.color = '#d3d3d3';
            nodes.update({id: node.id, 
                         label: node.label,
                         color: node.color});
        });
    }

    socket.emit('reqread', {request: true});
};

// Read request
$('#reqread').click(read_fun);

// Handle read answer
socket.on('resread', function(msg){
    console.log('Read Received.');

    if (network != null) {
        var node_label = createNodeLabel(msg.src, msg.temp, msg.lum); 

        nodes.update({id: msg.src,
                    label: node_label,
                    color: '#8AF487'});
    }
})


// Multiple reads.
$('#reqmread').click(function(){
    var numreads = document.getElementById('numreads').value;
    var time_interval = document.getElementById('time').value;

    if (network != null) {
        for (var i = 0; i <= numreads; i++) {
            setTimeout(read_fun, time_interval * i);
        }
    }
})

