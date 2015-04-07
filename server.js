var webSocketServer = require('websocket').server;
var http = require('http');
var assert = require('assert');

"use strict";
process.title = 'node-simulation';
var portnumber = 1337;


var radius = 10;
var clients = [];
var intitialVelocity = 1;


var model = function () {

    var positions = [];
    var velocities = [];

    var dt = 1;


    var addAgent = function (position, velocity) {
        var newIndex = positions.length;

        positions[newIndex] = position
        velocities[newIndex] = velocity;

        return newIndex;
    }

    var accelerateAgent = function (index, acceleration) {
        velocities[index] += acceleration * dt;
    }

    var integrateSystem = function () {
        for (var i = 0; i < positions.length; i++) {
            positions[i] += velocities[i] * dt;
        }
    }

    var state = function () {
        return {
            ids: range(positions.length),
            positions: positions,
            velocities: velocities
        }
    }

    var stateOf = function (index) {
        return {
            ids : [index],
            positions: [positions[index]],
            velocities: [velocities[index]]
        }
    }

    return {
        addAgent: addAgent,
        accelerateAgent: accelerateAgent,
        integrateSystem: integrateSystem,
        state: state,
        stateOf: stateOf
    }
}

var m = model();


var range = function (n) {
    var res = [];
    for (var i = 0; i < n; i++) {
        res[i] = i;
    }
    return res;
}


function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// set up server //////////////////////////////////////////////////
var server = http.createServer(function(request, response) {});
server.listen(portnumber, function() {
    console.log((new Date()) + " Server is listening on port " + portnumber);
});

var wsServer = new webSocketServer({ httpServer: server });


var initializeClient = function (connection) {

    var initialVelocity = 1;

    var clientIndex = clients.push(connection) - 1;
    assert.equal(clientIndex, m.addAgent(Math.random() * 100, initialVelocity),
                 'different clientIndices!');

    return clientIndex;
}


var broadcast = function (string) {
    for (var i = 0; i < clients.length; i++) { clients[i].sendUTF(string); }
}


wsServer.on('request', function(request) {

    var connection = request.accept(null, request.origin);

    // send back trajectory
    connection.sendUTF(JSON.stringify({ 'spawned': m.state() }));

    var clientIndex = initializeClient(connection);

    // all other clients need to know about the new agent, too
    for (var i = 0; i < clients.length; i++) {
        clients[i].sendUTF(JSON.stringify({ 'spawned': m.stateOf(clientIndex) }));
    };

    connection.on('message', function(message) {

        console.log('client ' + clientIndex + ' sends ' + message.utf8Data);

        if (message.type === 'utf8') {

            var acceleration = Number(message.utf8Data);
            m.accelerateAgent(clientIndex, acceleration);

        }

    });

    // user disconnected
    connection.on('close', function(connection) {});

});


// integrate the system and send data to clients regularly
setInterval(function () {

    m.integrateSystem();

    for (var i = 0; i < clients.length; i++) {
        clients[i].sendUTF(JSON.stringify({ 'existing': m.state() }));
    }

}, 40);
