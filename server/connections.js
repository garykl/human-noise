var utils = require('../share/utils');
var R = require('ramda');

module.exports = function () {

    var clients = {};
    var ids = [];

    var broadcastString = function (string) {
        for (var i = 0; i < ids.length; i++) {
            clients[ids[i]].sendUTF(string);
        }
    };

    var serializeNamedObject = function (name, obj) {
        var sobj = {};
        sobj[name] = obj;
        return JSON.stringify(sobj);
    };

    var broadcast = function (name, obj) {
        broadcastString(serializeNamedObject(name, obj));
    };

    var broadcastFunc = function (name, factory) {
        // name: message type for the client
        // factory: function that takes an index and returns an object
        //
        // produces the data from `factory` for each client and send.
        for (var i = 0; i < ids.length; i++) {
            send(ids[i], name, factory(ids[i]));
        }
    };

    var send = function (cindex, name, object) {
        clients[cindex].sendUTF(serializeNamedObject(name, object));
    };

    var addConnection = function (cindex, connection) {
        ids.push(cindex);
        clients[cindex] = connection;
        return cindex;
    };

    var remove = function (cindex) {
        // check if a client given by its index exist and remove it
        var index = utils.findIndex(ids, cindex);
        if (index !== undefined) {
            ids.splice(index, 1);
            clients = R.dissoc(cindex + '', clients);
        }
    }

    var at = function (cindex) {
        return clients[cindex];
    };

    return {
        add: addConnection,
        remove: remove,
        broadcast: broadcast,
        broadcastFunc: broadcastFunc,
        send: send,
        at: at
    };

}

