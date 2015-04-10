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
                    conn.send(-0.05);
                } else if (angular < -0.1) {
                    conn.send(0.05);
                }
            }

        }, 40);

        return function () { clearInterval(threadKey); };
    },


    // send messages as user
    human: function (conn) {

        var keyTimer = undefined;

        var clearLoop = function () {
            if (keyTimer !== undefined) {
                clearInterval(keyTimer);
                keyTimer = undefined;
            }
        };

        var sendAcceleration = function (acceleration) {
            if (keyTimer !== undefined) { return; }
            keyTimer = setInterval(function () {
                conn.send(acceleration + ''); 
            }, 30)
        };

        document.onkeydown = function(e) {

            // Left arrow key
            if (e.keyCode === 37) { sendAcceleration(0.2); }
            // Right arrow key
            if (e.keyCode === 39) { sendAcceleration(-0.2); }

        };

        document.onkeyup = function (e) {
            clearLoop();
        };

        var stopSending = function () {
            document.onkeydown = undefined;
            document.onkeyup = undefined;
            clearLoop;
        };

        return stopSending;
    }

};
