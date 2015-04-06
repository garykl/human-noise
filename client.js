var content = document.getElementById('content');
var input = document.getElementById('input');
var field = document.getElementById('field');

var clientName = false;

window.WebSocket = window.WebSocket || window.MozWebSocket;
if (!window.WebSocket) {
    content.innerHTML = '<p>Sorry, but your browser doesn\'t support WebSockets.';
}


var connection = new WebSocket('ws://127.0.0.1:1337');
connection.onopen = function () {
    field.innerHTML = 'Choose name:';
};

connection.onerror = function (error) {
    content.innerHTML = '<p>Sorry, but there\'s some problem with your connection or the server is down.';
};


var workWithAgent = function (f, obj) {
    var number = obj.names.length;
    for (var i = 0; i < number; i++) {
        f(obj.names[i], obj.positions[i], obj.velocities[i]);
    }
}


connection.onmessage = function (message) {
    try { var json = JSON.parse(message.data); }
    catch (e) {
        console.log('This doesn\'t look like a valid JSON: ', message.data);
        return;
    }

    if (json.type === 'new') { workWithAgent(newAgent, json); }
    if (json.type === 'old') { workWithAgent(updateAgent, json); }
};


input.onkeypress = function(e) {
    if (e.keyCode === 13) {

        var msg = input.value;
        if (!msg) { return; }

        connection.send(msg);
        input.value = '';
        field.innerHTML = 'Acceleration: ';

        if (clientName === false) {
            clientName = msg;
        }
    }
};


setInterval(function() {
    if (connection.readyState !== 1) {
        field.innerHTML = 'Error';
    }
}, 3000);
