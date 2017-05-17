var socket;
var network;
var nodes;
var edges;
var display;
var data;
var vis_options;

$('document').ready(function(){
    socket  = io();
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
            dragNodes: false,
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

// Requests
$('#reqtop').click(function(){
    $('div#top').empty();
    socket.emit('reqtop', {request: true});

    nodes = new vis.DataSet([
    {id: 31, label: 'Node 31'},
    {id: 32, label: 'Node 32'},
    {id: 33, label: 'Node 33'},
    {id: 34, label: 'Node 34'},
    {id: 35, label: 'Node 35'},
    {id: 36, label: 'Node 36'}
    ]);

    // create an array with edges
    edges = new vis.DataSet([
    {from: 31, to: 33},
    {from: 31, to: 32},
    {from: 32, to: 34},
    {from: 32, to: 35},
    {from: 33, to: 36}
    ]);
    
    data = {
        nodes: nodes,
        edges: edges
    };

    network = new vis.Network(display, data, vis_options);
})

$('#reqread').click(function(){
    socket.emit('reqread', {request: true});
    updateNodes();
})

$('#reqmread').click(function(){
    var numreads = document.getElementById('numreads').value;
    var time_interval = document.getElementById('time').value;

    if (network != null) {
        socket.emit('reqmread', {request: true});
        for (var i = 0; i <= numreads; i++) {
            setTimeout(updateNodes, time_interval * i);
        }
    }
})

// Answers
socket.on('restop', function(msg){
    if (msg.request) {
        $('div#top').append('<p>ReqTop</p>')
    } 
})

socket.on('resread', function(msg){
    if (msg.request) {
        $('div#top').append('<p>ReqRead</p>')
    } 
})

socket.on('resmread', function(msg){
    if (msg.request) {
        $('div#top').append('<p>ReqMulRead</p>')
    } 
})
