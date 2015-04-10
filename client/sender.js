var timer = function (func, period) {
    // a timer can be started, and every `period` millisecond,
    // `func` is called with the specified argument.
    // Once a timer is running, it can not be started again, unless it was
    // stopped previously.

    var threadNumber = undefined;

    var start = function (args) {
        if (threadNumber === undefined) {
            threadNumber = setInterval(function () {
                func(args);
            }, period);
        }
    };

    var stop = function () {
        if (threadNumber !== undefined) {
            clearInterval(threadNumber);
            threadNumber = undefined;
        }
    };

    return {
        start: start,
        stop: stop
    };
}


var sendToConnection = function (connection, obj) {
    connection.send(JSON.stringify(obj));
}

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

        var threadKey = setInterval(function () {
            // for viscek in this form, we need the acceleration. No need for the actual
            // angles. Acceleration of velocity is a short angular velocity, given by
            // the following cross product.

            // client's angle
            var state = getState();
            var fullState = getFullState();
            if (state !== undefined) {

                var xsum = R.reduce(R.add, 0, fullState.vx) - state.vx;
                var ysum = R.reduce(R.add, 0, fullState.vy) - state.vy;

                var angular = ysum * state.vx - xsum * state.vy;

                // rotate accordingly
                if (angular > 0.1) {
                    sendToConnection(conn, {'acceleration': -0.05});
                } else if (angular < -0.1) {
                    sendToConnection(conn, {'acceleration': 0.05});
                }
            }

        }, 40);

        return function () { clearInterval(threadKey); };
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
