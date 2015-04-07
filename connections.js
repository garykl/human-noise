module.exports = function () {

    var clients = [];

    var broadcastString = function (string) {
        for (var i = 0; i < clients.length; i++) { clients[i].sendUTF(string); }
    }

    var serializeNamedObject = function (name, obj) {
        var sobj = {};
        sobj[name] = obj;
        return JSON.stringify(sobj);
    }

    var broadcast = function (name, obj) {
        broadcastString(serializeNamedObject(name, obj));
    }

    var send = function (index, name, object) {
        clients[index].sendUTF(serializeNamedObject(name, object));
    }

    var addConnection = function (request) {
        var connection = request.accept(null, request.origin);
        var clientIndex = clients.push(connection) - 1;
        return clientIndex;
    }

    var at = function (index) {
        return clients[index];
    }

    return {
        addConnection: addConnection,
        broadcast: broadcast,
        send: send,
        at: at
    }

}

