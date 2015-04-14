var webSocketServer = require('websocket').server;
var http = require('http');
var assert = require('assert');
var model = require('./model');
var conns = require('./connections');
var utils = require('../share/utils');
var fs = require ('fs');


"use strict";
process.title = 'swarming';
var portnumber = 1337;

var fieldsize = 1500;
var sensingDistance = 200;
var m = model(fieldsize, sensingDistance);

// put all the connections into the following containers, depending on what the
// client wants to hear or say.
var actorSockets = conns();
var viewportObservers = conns();
var sceneObservers = conns();

// set up server //////////////////////////////////////////////////
var setupServer = function (portnumber) {
    //: Integer -> WebsocketServer
    //
    var server = http.createServer(function(request, response) {

        var clientRegexp = /\/client\//;
        var htmlRegexp = /\/html\//;
        var shareRegexp = /\/share\//;

        if (clientRegexp.test(request.url)
         || htmlRegexp.test(request.url)
         || shareRegexp.test(request.url)) {
            console.log(__dirname + '/..' + request.url);
            fs.readFile(__dirname + '/..' + request.url, function (err, data) {
                if (err) { response.end('that route does not exist'); }
                response.writeHeader(200, {"Content-Type": "text/html"});
                response.end(data);
            });
        }

    });

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
                viewportObservers.add(clientIndex, connection);
                viewportObservers.send(clientIndex,
                        'index', clientIndex + '');
                // the viewport observers need to know the sensing distance
                viewportObservers.send(clientIndex,
                        'sensing', sensingDistance);
            }

            else if (data.type === 'actor') {
                actorSockets.add(clientIndex, connection);
                actorSockets.send(clientIndex, 'index', clientIndex + '');
                var initialVelocity = 10;
                var vx = 10 * (0.5 - Math.random());
                var vy = 10 * (0.5 - Math.random());
                var vl = Math.sqrt(vx * vx + vy * vy);
                vx = vx / vl * initialVelocity;
                vy = vy / vl * initialVelocity;
                m.add(clientIndex,
                      [0, 0],
                      [vx, vy]);
            }

            else if (data.type === 'scene') {
                sceneObservers.add(clientIndex, connection);
                // the scene observer needs to know the size of the field
                sceneObservers.send(clientIndex, 'fieldsize', fieldsize);
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
    connection.on('close', function(connection) {
        // remove agent from model and various connections
        m.remove(clientIndex);
        actorSockets.remove(clientIndex);
        viewportObservers.remove(clientIndex);
        sceneObservers.remove(clientIndex);
    });

});


var integrationPeriod = 40;
var viewportPeriod = 40;
var scenePeriod = 40;

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
