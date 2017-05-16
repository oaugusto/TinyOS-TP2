/*var socket = io();

// Requests
$('#reqtop').click(function(){
    $('div#top').empty();
    socket.emit('reqtop', {request: true});
})

$('#reqread').click(function(){
    $('div#read').empty();
    socket.emit('reqread', {request: true});
})

$('#reqmread').click(function(){
    $('div#read').empty();
    socket.emit('reqmread', {request: true});
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
*/

var network = null;
var nodes   = null;
var edges   = null;

// create an array with nodes
$('#reqtop').click(function() {
    if (network == null) {
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

        // create a network
        var container = document.getElementById('top');
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {
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
        network = new vis.Network(container, data, options);
    }
});

var updateNodes = function(){
    nodes.forEach(function(element) {
        var temp = (Math.random() * 20) + 10;
        var lum = (Math.random() * 200) + 100;
        element.label = 'Node ' + element.id + '\nTemp.: '+ temp.toFixed(2) +' C\nLum.: '+ lum.toFixed(2);
        nodes.update(element);
    });
}

$('#reqread').click(updateNodes);


var time_interval = 1500; //ms

$('#reqmread').click(function() {
    for (var i = 1; i <= 10; i++) {
        setTimeout(updateNodes, time_interval * i);
    }
});


