var utils = require('../share/utils');
var R = require('ramda');

var range = function (n) {
    var res = [];
    for (var i = 0; i < n; i++) {
        res[i] = i;
    }
    return res;
}


module.exports = function (size, sensingDistance, noise) {

    var ids= [];

    var x = {};
    var y = {};

    var vx = {};
    var vy = {};

    var dt = 1;
    var size = size;
    var cutoffRadius = sensingDistance;
    var noise = noise;


    var addAgent = function (cindex, position, velocity) {
        var newIndex = ids.length;

        ids[newIndex] = cindex;
        x[cindex] = position[0];
        y[cindex] = position[1];
        vx[cindex] = velocity[0];
        vy[cindex] = velocity[1];

        return newIndex;
    };

    var remove = function (cindex) {
        // check if a client given by its index exist and remove it
        var index = utils.findIndex(ids, cindex);
        if (index !== undefined) {
            ids.splice(index, 1);
            x = R.dissoc(cindex + '', x);
            y = R.dissoc(cindex + '', y);
            vx = R.dissoc(cindex + '', vx);
            vy = R.dissoc(cindex + '', vy);
        }
    };

    var accelerate = function (cindex, acceleration) {
        var angle = acceleration * dt;
        var t_vx = Math.cos(angle) * vx[cindex] + Math.sin(angle) * vy[cindex];
        var t_vy = -Math.sin(angle) * vx[cindex] + Math.cos(angle) * vy[cindex];
        vx[cindex] = t_vx;
        vy[cindex] = t_vy;
    };

    var integrateSystem = function () {
        for (var i = 0; i < ids.length; i++) {
            // add noise
            var randomAngular = (0.5 - Math.random()) * noise;
            accelerate(ids[i], randomAngular);
            // consider periodic boundary conditions
            x[ids[i]] = (x[ids[i]] + vx[ids[i]] * dt + size) % size;
            y[ids[i]] = (y[ids[i]] + vy[ids[i]] * dt + size) % size;
        }
    };

    var state = function () {
        return {
            ids: ids,
            x: R.values(x), y: R.values(y),
            vx: R.values(vx), vy: R.values(vy)
        }
    };

    var relativeCoordinate = function (ci, cj) {
        // returns the relative vector of j with respect to i,
        // considering periodicity.
        var u = x[cj] - x[ci], v = y[cj] - y[ci];
        if (u > size * 0.5) { u -= size; }
        if (v > size * 0.5) { v -= size; }
        if (u < -size * 0.5) { u += size; }
        if (v < -size * 0.5) { v += size; }
        return [u, v];
    };

    var distance = function (ci, cj) {
        //: AgentIndex -> AgentIndex
        var h = relativeCoordinate(ci, cj),
            dx = h[0], dy = h[1];
        return Math.sqrt(dx * dx + dy * dy);
    };

    var stateInEnvironmentOf = function (cindex) {
        //: AgentIndex -> State
        // return the state of agent `index`'s environment in relative
        // coordinates
        var hids = [], hx = [], hy = [], hvx = [], hvy = [], found = 0;
        var cx = x[cindex];
        var cy = y[cindex];

        for (var i = 0;  i < ids.length; i++) {
            var h;

            if (distance(ids[i], cindex) < cutoffRadius) {

                hids[found] = ids[i];

                h = relativeCoordinate(cindex, ids[i]);
                hx[found] = cx + h[0];
                hy[found] = cy + h[1];

                hvx[found] = vx[ids[i]]; hvy[found] = vy[ids[i]];
                found++;
            }
        }

        return {
            ids: hids,
            x: hx, y: hy,
            vx: hvx, vy: hvy
        };
    };

    var stateOf = function (cindex) {
        index = findIndex(cindex);
        return {
            ids : [cindex],
            x: [x[cindex]],
            y: [y[cindex]],
            vx: [vx[cindex]],
            vy: [vy[cindex]]
        }
    };

    var stateAsMatrix = function () {
        var res = '';
        for (var i = 0; i < ids.length; i++) {
            res += ids[i] + ' ' + x[ids[i]] + ' ' + y[ids[i]] + ' ';
            res += vx[ids[i]] + ' ' + vy[ids[i]] + '\n';
        }
        return res;
    };

    return {
        add: addAgent,
        remove: remove,
        accelerateAgent: accelerate,
        integrateSystem: integrateSystem,
        state: state,
        stateInEnvironmentOf: stateInEnvironmentOf,
        stateOf: stateOf,
        stateAsMatrix: stateAsMatrix
    };
}
