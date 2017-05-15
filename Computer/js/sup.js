var socket = io();

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