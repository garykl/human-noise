var configureConnection = function (connection, drawAgents, onerror) {
    // connection: object returned by 'new WebSocket'.
    // drawAgent: a dictionary/object with keys in 'messageType' and values
    //            being function that takes one argument (JSON object)
    // onerror: function without arguments
    //
    // setup the connection and start a responiveness checking loop.

    connection.onopen = function () {};
    connection.onerror = function (error) { onerror(); };


    connection.onmessage = function (message) {

        // the following messages from the server are allowed are allowed
        var messageTypes = ['spawned', 'viewport'];

        try { var json = JSON.parse(message.data); }
        catch (e) {
            console.log('message data does not contain JSON', message.data);
            return;
        }

        R.map(function (mt) {
            if (json[mt] !== undefined) { drawAgents[mt](json[mt]); }
        }, messageTypes)
    };


    if (connection !== undefined) {
        setInterval(function() {
            if (connection.readyState !== 1) {
                onerror();
            }
        }, 3000);
    }

};


