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
var actorSockets = conns();
var viewportObservers = conns();
var sceneObservers = conns();


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



nextIndex = 0;

var initializeClient = function (request) {

    var cindex = nextIndex;
    nextIndex++;
    var connection = request.accept(null, request.origin);

    var initialVelocity = 1;
    var mindex = m.addAgent(cindex,
                            [0, Math.random() * 400],
                            [10 * (1 - Math.random()), 10 * (1 - Math.random())]);

    return [cindex, connection];
}


wsServer.on('request', function(request) {

    var h = initializeClient(request);
    var clientIndex = h[0];
    var connection = h[1];
    var type = undefined;


    connection.on('message', function(message) {

        var data;
        if (message.type === 'utf8') { data = JSON.parse(message.utf8Data); }
        else { return; }


        //// handshake //////////////////////////////
        if (data.type !== undefined) {

            if (data.type === 'viewport') {
                viewportObservers.addConnection(clientIndex, connection);
                viewportObservers.send(clientIndex, 'index', clientIndex + '');
            }

            else if (data.type === 'actor') {
                actorSockets.addConnection(clientIndex, connection);
                actorSockets.send(clientIndex, 'index', clientIndex + '');
            }

            else if (data.type === 'scene') {
                sceneObservers.addConnection(clientIndex, connection);
            }

            type = data.type;
        }
        //// handshake //////////////////////////////


        if (type !== undefined) {

            if (type === 'actor') {
                if (data.acceleration !== undefined) {
                    m.accelerateAgent(clientIndex, data.acceleration);
                }
            }

        }

    });

    // user disconnected
    connection.on('close', function(connection) {});

});


// integrate the system and send data to clients regularly
setInterval(function () {

    m.integrateSystem();
    viewportObservers.broadcastFunc('viewport', function (i) {
        return m.stateInEnvironmentOf(i);
    });

}, 30);
