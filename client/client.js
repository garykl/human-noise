var configureConnection = function (connection, messageCallback, onerror) {
    // connection: object returned by 'new WebSocket'.
    // messageCallback: a dictionary/object with keys in 'messageType' and values
    //            being function that takes one argument (JSON object)
    // onerror: function without arguments
    //
    // setup the connection and start a responiveness checking loop.
    var cindex;

    connection.onopen = function () {};
    connection.onerror = function (error) { onerror(); };


    connection.onmessage = function (message) {

        try { var json = JSON.parse(message.data); }
        catch (e) {
            console.log('message data does not contain JSON', message.data);
            return;
        }


        if (json.index !== undefined) { cindex = json.index; }
        else { messageCallback(cindex, json); }
    };


    if (connection !== undefined) {
        setInterval(function() {
            if (connection.readyState !== 1) {
                onerror();
            }
        }, 3000);
    }

    return function () { return cindex; };

};


