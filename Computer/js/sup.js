var socket = io();

// Requests
$('#reqtop').click(function(){
    socket.emit('reqtop', {request: true});
})

$('#reqread').click(function(){
    socket.emit('reqread', {request: true});
})

$('#reqmread').click(function(){
    socket.emit('reqmread', {request: true});
})

// Answers
socket.on('restop', function(msg){
    if (msg.request) {
        $('#messages').append('<p>ReqTop</p>')
    } 
})

socket.on('resread', function(msg){
    if (msg.request) {
        $('#messages').append('<p>ReqRead</p>')
    } 
})

socket.on('resmread', function(msg){
    if (msg.request) {
        $('#messages').append('<p>ReqMulRead</p>')
    } 
})