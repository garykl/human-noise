var webSocketServer = require('websocket').server;
var http = require('http');
var assert = require('assert');
var model = require('./model');
var conns = require('./connections');

"use strict";
process.title = 'swarming';
var portnumber = 1337;

var intitialVelocity = 1;

var m = model();
var agentSockets = conns();


// set up server //////////////////////////////////////////////////
var setupServer = function (portnumber) {
    //: Integer -> WebsocketServer
    var server = http.createServer(function(request, response) {});
    server.listen(portnumber, function() {
        console.log((new Date()) + " Server is listening on port " + portnumber);
    });
    var wsserver = new webSocketServer({ httpServer: server });
    return wsserver;
};

var wsServer = setupServer(portnumber);
// set up server //////////////////////////////////////////////////



var initializeClient = function (request) {

    var cindex = agentSockets.addConnection(request);

    // the order is very important (next three lines)
    agentSockets.send(cindex, 'index', cindex);

    var initialVelocity = 1;
    var mindex = m.addAgent(cindex,
                            [0, Math.random() * 400],
                            [10 * (1 - Math.random()), 10 * (1 - Math.random())]);

    // all other clients need to know about the new agent, too
    agentSockets.broadcast('spawned', m.stateOf(cindex));

    return cindex;
}


wsServer.on('request', function(request) {

    var clientIndex = initializeClient(request);
    console.log('start socket ' + clientIndex);
    var connection = agentSockets.at(clientIndex);

    agentSockets.send(clientIndex, 'message', clientIndex + '');

    connection.on('message', function(message) {

        var data;
        if (message.type === 'utf8') { data = JSON.parse(message.utf8Data); }
        else { return; }

        if (data.acceleration !== undefined) {
            m.accelerateAgent(clientIndex, data.acceleration);
        }

    });

    // user disconnected
    connection.on('close', function(connection) {});

});


// integrate the system and send data to clients regularly
setInterval(function () {

    m.integrateSystem();
    agentSockets.broadcastFunc('viewport', function (i) {
        return m.stateInEnvironmentOf(i);
    });

}, 30);
