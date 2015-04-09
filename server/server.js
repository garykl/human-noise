var webSocketServer = require('websocket').server;
var http = require('http');
var assert = require('assert');
var model = require('./model');
var conns = require('./connections');

"use strict";
process.title = 'node-simulation';
var portnumber = 1337;


var radius = 10;
var intitialVelocity = 1;

var m = model();
var cs = conns();


// set up server //////////////////////////////////////////////////
var server = http.createServer(function(request, response) {});
server.listen(portnumber, function() {
    console.log((new Date()) + " Server is listening on port " + portnumber);
});
var wsServer = new webSocketServer({ httpServer: server });
// set up server //////////////////////////////////////////////////


var initializeClient = function (request) {

    var cindex = cs.addConnection(request);

    // the order is very important (next three lines)
    cs.send(cindex, 'index', cindex);

    var initialVelocity = 1;
    var mindex = m.addAgent([0, Math.random() * 400],
                            [10 * (1 - Math.random()), 10 * (1 - Math.random())]);

    assert.equal(cindex, mindex, 'indices from connections and model must agree');

    // all other clients need to know about the new agent, too
    cs.broadcast('spawned', m.stateOf(cindex));

    return cindex;
}


wsServer.on('request', function(request) {

    var clientIndex = initializeClient(request);
    var connection = cs.at(clientIndex);

    cs.send(clientIndex, 'message', clientIndex + '');

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
    cs.broadcastFunc('viewport', function (i) {
        return m.stateInEnvironmentOf(i);
    });

}, 30);
