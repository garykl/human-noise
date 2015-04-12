var timer = function (func, period) {
    // a timer can be started, and every `period` millisecond,
    // `func` is called with the specified argument.
    // Starting the timer multiple times, results in restarts.
    // usage example:
    //
    // var t = timer(function (arg) { console.log(arg); }, 100);
    // t.start(5); // starts the timer logging 5.
    // t.start(6); // stops loggin 5, start logging 6.
    // t.stop();   // stop logging at all

    var threadNumber = undefined;
    var period = period;
    var args = undefined;

    var setPeriod = function (p) {
        period = p;
        if (stop()) {
            start(args);
        }
    }

    var start = function (a) {
        args = a;
        stop();
        threadNumber = setInterval(function () {
            func(args);
        }, period);
    };

    var stop = function () {
        // stops the timer, if it is running.
        // returns true if timer stopped, false if it was not running
        if (threadNumber !== undefined) {
            clearInterval(threadNumber);
            threadNumber = undefined;
            return true;
        }
        return false;
    };

    return {
        start: start,
        stop: stop
    };
}


var simpleTimer = function (callback, period) {
    var t = timer(callback, period);
    t.start();
    return function () { t.stop() };
};


var findIndex = function (list, value) {
    //: [a] -> a -> Maybe a
    // return the index of the first occurence of value in list.
    // return undefined if value is not in list.
    for (var i = 0; i < list.length; i++) {
        if (value === list[i]) { return i; }
    }
    return undefined;
}


var range = function (start, step, high) {
    return R.unfold(function (n) {
        if (n <= high) { return [n, n + step]; }
        else { return false; }
    }, start);
}


// make module usable to node.js
if (typeof exports == 'object' && exports) {

    exports.timer = timer;
    exports.simpleTimer = simpleTimer;
    exports.findIndex = findIndex;

}
