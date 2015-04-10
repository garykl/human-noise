var maybe = function (func) {
  //: (a -> b) -> Maybe a -> Maybe b
    return function (a) {
      if (a === undefined) { return undefined; }
      return func(a);
    };
};


var state = function () {
    var ids = [];
    var x = [];
    var y = [];
    var vx = [];
    var vy = [];

    var findIndex = maybe(function (cindix) {
        //: Integer -> Maybe Integer
        // cindex: the index send by the server.
        // return: the index of ids with value == cindex
        for (var i = 0; i < ids.length; i++) {
            if (cindix === ids[i]) {
                return i;
            }
        }
        return undefined;
    });

    var set = function (obj) {
        // obj: contains currentState like data.
        // resets the id and state variables.
        ids = obj.ids;
        x = obj.x;
        y = obj.y;
        vx = obj.vx;
        vy = obj.vy;
    };

    var getStateFromServerIndex = maybe(function (cindex) {
        //: Integer -> State of one agent
        if (findIndex(cindex) === undefined) { return undefined; }
        return {
            id: ids[findIndex(cindex)],
            x: x[findIndex(cindex)],
            y: y[findIndex(cindex)],
            vx: vx[findIndex(cindex)],
            vy: vy[findIndex(cindex)]
        }
    });


    var getState = function () {
        return {
            ids: ids,
            x: x,
            y: y,
            vx: vx,
            vy: vy
        };
    };


    return {
        set: set,
        getStateFromServerIndex: getStateFromServerIndex,
        getState: getState
    }

};

