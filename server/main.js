var fs = require('fs');
var assert = require('assert');
var model = require('./model');
var conns = require('./connections');
var utils = require('../share/utils');
var server = require('./server');


"use strict";
process.title = 'swarming';
var portnumber = 1337;

if (process.argv.length !== 5) {
    console.log('usage: ' + process.argv[0] + ' ' + process.argv[1] +
                 'L v0 mu');
    process.exit();
}

// physics parameters as command line arguments // reasonable values
var sizeRatio = process.argv[2];                // 10
var initialVelocity = process.argv[3];          // 10
var angularNoise = process.argv[4];             // 1


// feeding the model
var sensingDistance = 200;
var fieldsize = sensingDistance * sizeRatio;
var m = model(fieldsize, sensingDistance, angularNoise);


// all the periodic stuff is done with certain periods
var integrationPeriod = 40;
var viewportPeriod = integrationPeriod;
var scenePeriod = 40;
var dataWritePeriod = 500;


// put all the connections into the following containers, depending on what the
// client wants to hear or say.
var actorSockets = conns();
var viewportObservers = conns();
var sceneObservers = conns();


var dataFolderName = function () {
    return 'L' + sizeRatio + '_' + 'v' + initialVelocity + '_' +
        'n' + angularNoise + '_' + 'size' + fieldsize;
};

var createDataFolder = function () {
    // check for data folder
    var foldername = dataFolderName();
    if (!fs.existsSync('data')) {
        fs.mkdirSync('data');
    }
    if (!fs.existsSync('data/' + foldername)) {
        fs.mkdirSync('data/' + foldername);
    }
};

createDataFolder();


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

    var vx = 0.5 - Math.random();
    var vy = 0.5 - Math.random();
    var vl = Math.sqrt(vx * vx + vy * vy);
    vx = vx / vl * initialVelocity;
    vy = vy / vl * initialVelocity;
    var x = Math.random() * fieldsize;
    var y = Math.random() * fieldsize;

    m.add(cindex, [x, y], [vx, vy]);

    actorSockets.add(cindex, socket);
    actorSockets.send(cindex, 'index', cindex);
};


var initializeSceneObserver = function (cindex, socket, size) {
    //: Integer -> WebSocket -> Float -> Global ()
    // add the socket to the sceneObserver distributor and the size to the
    // client

    sceneObservers.add(cindex, socket);
    sceneObservers.send(cindex, 'fieldsize', size);
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
                initializeSceneObserver(clientIndex, connection, fieldsize);
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
        function () {
            m.integrateSystem();
        }, integrationPeriod);



// send data to clients regularly
var stopSendingViewport = utils.simpleTimer(function () {
    m.updateNeighborList();
    viewportObservers.broadcastFunc('viewport', function (i) {
        return m.stateInEnvironmentOf(i);
    });
}, viewportPeriod);


// integrate the system and send data to clients regularly
var stopSendingScene = utils.simpleTimer(function () {
    sceneObservers.broadcast('scene', m.state());
}, scenePeriod);


// save some data
var stopWritingData = utils.simpleTimer(function () {
    var date = new Date();
    var dataString = m.stateAsMatrix();
    if (dataString !== '') {
        fs.writeFile('data/' + dataFolderName() + '/' +
                     date.getTime(), m.stateAsMatrix());
    }
}, dataWritePeriod);
