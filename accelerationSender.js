

// send messages as Viscek agent
var accelerationSenderViszekAgent = function (conn) {
  var threadKey = setInterval(function () {
    // for viscek in this form, we need the acceleration. No need for the actual
    // angles. Acceleration of velocity is a short angular velocity, given by
    // the following cross product.

    // client's angle
    var index = indexFromCindex(checkoutIndex());
    if (index !== undefined) {

      var xsum = R.reduce(R.add, 0, currentVx) - currentVx[index];
      var ysum = R.reduce(R.add, 0, currentVy) - currentVy[index];

      var angular = ysum * currentVx[index] - xsum * currentVy[index];

      // rotate accordingly
      if (angular > 0) {
        conn.send(-0.01);
      } else if (angular < 0) {
        conn.send(0.01);
      }
    }

  }, 100);

  return function () { clearInterval(threadKey); };
};

// send messages as user
var accelerationSenderHuman = function (conn) {
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
};

