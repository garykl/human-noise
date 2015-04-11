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


// make module usable to node.js
if (typeof exports == 'object' && exports) {

    exports.timer = timer;

}
