var assert = require('assert');
var model = require('./model');
var conns = require('./connections');
var utils = require('../share/utils');
var server = require('./server');


"use strict";
process.title = 'swarming';
var portnumber = 1337;


// physics parameters and data
var fieldsize = 1500;
var sensingDistance = 200;
var m = model(fieldsize, sensingDistance);


// all the periodic stuff is done with certain periods
var integrationPeriod = 40;
var viewportPeriod = 40;
var scenePeriod = 40;


// put all the connections into the following containers, depending on what the
// client wants to hear or say.
var actorSockets = conns();
var viewportObservers = conns();
var sceneObservers = conns();


// set up server
var wsServer = server.createWebsocketServer(
        server.createHttpServer(portnumber));

var initializeClient = server.clientInitializer();


var initializeViewportObserver = function (cindex, socket, distance) {
    //: Integer -> WebSocket -> Float -> Global ()
    // add the socket to the viewportObservers and send the client identifier
    // and the sensing distance/cutoff radius to the client

    viewportObservers.add(cindex, socket);
    viewportObservers.send(cindex, 'index', cindex);
    viewportObservers.send(cindex, 'sensing', distance);
};


var initializeActorSocket = function (cindex, socket) {
    //: Integer -> WebSocket -> Global ()
    // add an agent at the origin with random velocity direction to the model,
    // add the socket to the actorSocket distribution list and send the client
    // identifier to the client.

    var initialVelocity = 10;

    var vx = 10 * (0.5 - Math.random());
    var vy = 10 * (0.5 - Math.random());
    var vl = Math.sqrt(vx * vx + vy * vy);
    vx = vx / vl * initialVelocity;
    vy = vy / vl * initialVelocity;

    m.add(cindex, [0, 0], [vx, vy]);

    actorSockets.add(cindex, socket);
    actorSockets.send(cindex, 'index', cindex);
};


var initializeSceneObserver = function (cindex, socket, size) {
    //: Integer -> WebSocket -> Float -> Global ()
    // add the socket to the sceneObserver distributor and the size to the
    // client

    sceneObservers.add(clientIndex, connection);
    sceneObservers.send(clientIndex, 'fieldsize', fieldsize);
};


var removeClient = function (cindex) {
    //: Integer -> Global ()
    // remove the client, given by its identifier cndex from the model and
    // all the distributor lists.

    m.remove(cindex);
    actorSockets.remove(cindex);
    viewportObservers.remove(cindex);
    sceneObservers.remove(cindex);
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
                initializeViewportObserver(
                        clientIndex, connection, sensingDistance);
            }

            else if (data.type === 'actor') {
                initializeActorSocket(clientIndex, connection);
            }

            else if (data.type === 'scene') {
                initializeSceneObserver(clientIndex, connection);
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

    connection.on('close', function(connection) { removeClient(clientIndex); });

});


// integrate the system
var stopIntegrating = utils.simpleTimer(
        function () { m.integrateSystem(); }, integrationPeriod);

// send data to clients regularly
var stopViewportSending = utils.simpleTimer(function () {
    viewportObservers.broadcastFunc('viewport', function (i) {
        return m.stateInEnvironmentOf(i);
    });
}, viewportPeriod);

// integrate the system and send data to clients regularly
var stopSceneSending = utils.simpleTimer(function () {
    sceneObservers.broadcast('scene', m.state());
}, scenePeriod);
