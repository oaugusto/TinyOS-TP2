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
});

/**/
var updateNodes = function(){
    nodes.forEach(function(element) {
        var temp = (Math.random() * 20) + 10;
        var lum = (Math.random() * 200) + 100;
        element.label = 'Node ' + element.id + '\nTemp.: '+ temp.toFixed(2) +' C\nLum.: '+ lum.toFixed(2);
        nodes.update(element);
    });
}

var createNodeLabel = function(id, temp, lum){
    return 'Node ' + id
         + '\nTemp.: '+ temp.toFixed(2)
         + ' C\nLum.: '+ lum.toFixed(2) + ' lux';
}

// Requests
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
    console.log('Message Received.');

    if (nodes.get(msg.parent) == null) {
        var node_label = "Node " + msg.parent;
        nodes.add({id: msg.parent,
                   label: node_label,
                   color: '#d3d3d3'})
    }

    if (nodes.get(msg.child) == null) {
        var node_label = "Node " + msg.child;
        nodes.add({id: msg.child,
                   label: node_label,
                   color: '#d3d3d3'})
    }

    edges.update({from: msg.parent, to: msg.child});  
})


// Individual read function.
var read_fun = function(){
    nodes.forEach(function(node) {
        node.color = '#d3d3d3';
    });
    
    socket.emit('reqread', {request: true});
};

// Request
$('#reqread').click(read_fun);

// Answers
socket.on('resread', function(msg){
    console.log('Read Received.');

    var node_label = createNodeLabel(msg.src, msg.temp, msg.lum); 

    nodes.update({id: msg.src,
                  label: node_label,
                  color: '#8AF487'});
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

/*socket.on('resmread', function(msg){
    if (msg.request) {
        $('div#top').append('<p>ReqMulRead</p>')
    } 
})*/

