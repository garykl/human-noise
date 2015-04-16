
var sender = {
    //: this module contains functions of the following type
    //: WebSocket -> Net (Net ());
    //- a websocket is given, and an information sending loop is activated.
    //- the return function can be called to deactivate the loop.


    // send messages as Viscek agent
    viscekAgent: function (getState, getFullState, conn) {
        //: (Maybe Integer -> Maybe IsolatedState) ->
        //: (-> FullState) -> WebSocket -> Net ()
        // getState: may return the state of the client.
        // getFullState: returns the state of all clients.
        var consciousAngular = 0.05;
        var angularNoise = 0.5;

        var stopSending = simpleTimer(function () {
            // for viscek in this form, we need the acceleration. No need for the actual
            // angles. Acceleration of velocity is a short angular velocity, given by
            // the following cross product.

            // client's angle
            var state = getState();
            var fullState = getFullState();
            if (state !== undefined) {

                var xsum = R.reduce(R.add, 0, fullState.vx);
                var ysum = R.reduce(R.add, 0, fullState.vy);
                var sumAng = Math.atan2(ysum, xsum);
                var vAng = Math.atan2(state.vy, state.vx);

                var angular = vAng - sumAng;

                var randomAngular = angularNoise * (1 - 2 * Math.random());

                sendToConnection(conn,
                        {'acceleration': angular + randomAngular});
            }

        }, 40);

        return stopSending;
    },


    // send messages as user
    human: function (conn) {

        var accelerationTimer = timer(function (acceleration) {
            sendToConnection(conn, {'acceleration': acceleration});
        }, 30);

        var sendAcceleration = function (acc) { accelerationTimer.start(acc); }
        var stopSending = function () { accelerationTimer.stop(); }

        document.onkeydown = function(e) {

            // Left arrow key
            if (e.keyCode === 37) { sendAcceleration(0.2); }
            // Right arrow key
            if (e.keyCode === 39) { sendAcceleration(-0.2); }

        };

        document.onkeyup = function (e) {
            stopSending();
        };

        var stopUI = function () {
            document.onkeydown = undefined;
            document.onkeyup = undefined;
            stopSending;
        };

        return stopUI;
    }

};
