var webSocketServer = require('websocket').server;
var http = require('http');

"use strict";
process.title = 'node-simulation';
var portnumber = 1337;


var positions = [];
var velocities = [];
var dt = 1;
var names = [];
var radius = 10;
var clients = [];


var integrateSystem = function () {
    for (var i = 0; i < names.length; i++) {
        positions[i] += velocities[i] * dt;
    }
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


var initializeClient = function (connection, name) {

    var initialVelocity = 1;

    var clientIndex = clients.push(connection) - 1;
    positions[clientIndex] = Math.random() * 100;
    velocities[clientIndex] = initialVelocity;
    names[clientIndex] = name;

    return clientIndex;
}

wsServer.on('request', function(request) {

    var connection = request.accept(null, request.origin);
    var nameFlag = false;
    var clientIndex = undefined;

    connection.on('message', function(message) {

        if (message.type === 'utf8') {

            // the first connection brings us a name:
            if (!nameFlag) {
                nameFlag = true;

                console.log(message);
                clientIndex = initializeClient(connection,
                                               htmlEntities(message.utf8Data));

                // send back trajectory
                connection.sendUTF(
                    JSON.stringify(
                        {
                            type: 'new',
                            names: names,
                            positions: positions,
                            velocities: velocities
                        }));

                // all other clients need to know about the new agent, too
                for (var i = 0; i < clients.length; i++) {
                    if (i !== clientIndex) {
                        clients[i].sendUTF(JSON.stringify({
                            type: 'new',
                            names: [names[clientIndex]],
                            positions: [positions[clientIndex]],
                            velocities: [velocities[clientIndex]],
                        }));
                    }
                };


            // if not the name is send, then the acceleration information
            } else {

                var acceleration = Number(message.utf8Data);
                velocities[clientIndex] += acceleration * dt;

            }
        }

    });

    // user disconnected
    connection.on('close', function(connection) {});

});


// integrate the system and send data to clients regularly
setInterval(function () {

    integrateSystem();

    for (var i = 0; i < clients.length; i++) {
        clients[i].sendUTF(JSON.stringify({
            type: 'old',
            names: names,
            positions: positions,
            velocities: velocities,
        }));
    }

}, 40);
