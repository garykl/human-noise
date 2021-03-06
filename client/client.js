var client = {

    subjectiveConnection: function (connection, messageCallback, onerror) {
        // connection: object returned by 'new WebSocket'.
        // messageCallback: function that takes one clientIndex and one JSON object
        // onerror: function without arguments
        //
        // setup the connection and start a responiveness checking loop.
        var cindex;
        var sensingDistance;

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


            // client index, saved at the server, corresponding to this agent,
            if (json.index !== undefined) {
                cindex = Number(json.index);
            }

            // sensing distance, useful for dynamically create ui sizes.
            else if (json.sensing !== undefined) {
                sensingDistance = Number(json.sensing);
            }

            // only when the information is complete, start reacting on the state
            else if (json.viewport !== undefined) {
                if (sensingDistance !== undefined && cindex !== undefined) {
                    messageCallback(cindex, json.viewport);
                }
            }
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

        var fieldsize;

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

            // size of the simulation box
            if (json.fieldsize !== undefined) {
                fieldsize = Number(json.fieldsize);
            }

            // only when the information is complete, start reacting on the state
            else if (json.scene !== undefined) {

                if (fieldsize !== undefined) {
                    messageCallback(json.scene, fieldsize);
                }
            }

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
