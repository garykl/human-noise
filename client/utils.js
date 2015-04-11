var sendToConnection = function (connection, obj) {
    connection.send(JSON.stringify(obj));
}
