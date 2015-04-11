var client = {

    subjectiveConnection: function (connection, messageCallback, onerror) {
        // connection: object returned by 'new WebSocket'.
        // messageCallback: function that takes one clientIndex and one JSON object
        // onerror: function without arguments
        //
        // setup the connection and start a responiveness checking loop.
        var cindex;

        connection.onopen = function () {
            sendToConnection(connection, {'type': 'viewport'});
            sendToConnection(connection, {'type': 'actor'});
        };

        connection.onerror = function (error) { onerror(); };


        connection.onmessage = function (message) {

            try { var json = JSON.parse(message.data); }
            catch (e) {
                console.log('message data does not contain JSON', message.data);
                return;
            }


            if (json.index !== undefined) { cindex = Number(json.index); }
            else { messageCallback(cindex, json); }
        };


        if (connection !== undefined) {
            var stopChecking = simpleTimer(function() {
                if (connection.readyState !== 1) {
                    onerror();
                }
            }, 3000);
        }

        return function () { return cindex; };

    },


    objectiveConnection: function (connection, messageCallback, onerror) {
        // connection: object returned by 'new WebSocket'.
        // messageCallback: function that takes one argument (JSON object)
        // onerror: function without arguments
        //
        // setup the connection and start a responiveness checking loop.

        connection.onopen = function () {
            sendToConnection(connection, {'type': 'scene'});
        };
        connection.onerror = function (error) { onerror(); };


        connection.onmessage = function (message) {

            try { var json = JSON.parse(message.data); }
            catch (e) {
                console.log('message data does not contain JSON', message.data);
                return;
            }

            messageCallback(json); 
        };


        if (connection !== undefined) {
            var stopChecking = simpleTimer(function() {
                if (connection.readyState !== 1) {
                    onerror();
                }
            }, 3000);
        }

    }

};
