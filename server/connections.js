var utils = require('../share/utils');

module.exports = function () {

    var clients = [];
    var ids = [];

    var broadcastString = function (string) {
        for (var i = 0; i < clients.length; i++) { clients[i].sendUTF(string); }
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
        for (var i = 0; i < clients.length; i++) {
            send(ids[i], name, factory(ids[i]));
        }
    };

    var send = function (cindex, name, object) {
        clients[findIndex(cindex)].sendUTF(serializeNamedObject(name, object));
    };

    var addConnection = function (cindex, connection) {
        var clientIndex = clients.push(connection) - 1;
        ids.push(cindex);
        return clientIndex;
    };

    var remove = function (cindex) {
        // check if a client given by its index exist and remove it
        var index = findIndex(cindex);
        if (index !== undefined) {
            ids.splice(index, 1);
            clients.splice(index, 1);
        }
    }

    var findIndex = function (cindex) {
        //: AgentIndex -> Maybe Integer
        // given the the index of agentSockets, return the model index
        return utils.findIndex(ids, cindex);
    };

    var at = function (cindex) {
        return clients[findIndex(cindex)];
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

