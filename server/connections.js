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
            send(i, name, factory(ids[i]));
        }
    };

    var send = function (index, name, object) {
        clients[index].sendUTF(serializeNamedObject(name, object));
    };

    var addConnection = function (cindex, connection) {
        var clientIndex = clients.push(connection) - 1;
        ids.push(cindex);
        console.log(ids);
        return clientIndex;
    };

    var findIndex = function (cindex) {
        //: AgentIndex -> Maybe Integer
        // given the the index of agentSockets, return the model index
        for (var i = 0; i < ids.length; i++) {
            if (cindex === ids[i]) { return i; }
        }
        return undefined;
    };

    var at = function (cindex) {
        console.log(cindex, findIndex(cindex));
        return clients[findIndex(cindex)];
    };

    return {
        addConnection: addConnection,
        broadcast: broadcast,
        broadcastFunc: broadcastFunc,
        send: send,
        at: at
    };

}

