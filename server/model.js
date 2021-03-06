var utils = require('../share/utils');
var R = require('ramda');

var range = function (n) {
    var res = [];
    for (var i = 0; i < n; i++) {
        res[i] = i;
    }
    return res;
}


var neighborlist = function (size, cutoffRadius) {

    var L = Math.round(size / cutoffRadius)
    var neighbors = undefined;
    var ids = undefined;

    var emptyNeighborList = function () {
        neighbors = [];
        for (var i = 0; i < L; i++) {
            neighbors[i] = [];
            for (var j = 0; j < L; j++) {
                neighbors[i][j] = [];
            }
        }
        ids = {};
    };

    var addNeighbor = function (id, x, y) {
        // save the id in the appropriate grid element
        var xp = Math.floor(x / cutoffRadius);
        var yp = Math.floor(y / cutoffRadius);
        neighbors[xp][yp][neighbors[xp][yp].length] = id;
        ids[id] = [xp, yp];
    };

    var potentiallyInteractingWith = function (id) {
        // return a list of ids that are potentially interacting with id, i.e.
        // they are in the same grid element as id or in a surrounding one,
        // considering periodic boundary conditions.
        if (ids[id] === undefined) {
            return [];
        }
        var x = ids[id][0];
        var y = ids[id][1];
        var res = [];
        for (var di = -1; di < 2; di++) {
            for (var dj = -1; dj < 2; dj++) {
                var xh = (x + di + L) % L;
                var yh = (y + dj + L) % L;
                res = res.concat(neighbors[xh][yh]);
            }
        }
        return res;
    };

    return {
        emptyNeighborList: emptyNeighborList,
        addNeighbor: addNeighbor,
        potentiallyInteractingWith: potentiallyInteractingWith
    };
};


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

    var neighboring = neighborlist(size, cutoffRadius);


    var addAgent = function (cindex, position, velocity) {
        var newIndex = ids.length;

        ids[newIndex] = cindex;
        x[cindex] = position[0];
        y[cindex] = position[1];
        vx[cindex] = velocity[0];
        vy[cindex] = velocity[1];

        neighboring.addNeighbor(cindex, position[0], position[1]);

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

    var updateNeighborList = function () {
        neighboring.emptyNeighborList();

        for (var i = 0; i < ids.length; i++) {
            neighboring.addNeighbor(ids[i], x[ids[i]], y[ids[i]]);
        }
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

        var pids = neighboring.potentiallyInteractingWith(cindex);
        // var pids = ids;

        for (var i = 0;  i < pids.length; i++) {
            var h;

            if (distance(pids[i], cindex) < cutoffRadius) {

                hids[found] = pids[i];

                h = relativeCoordinate(cindex, pids[i]);
                hx[found] = cx + h[0];
                hy[found] = cy + h[1];

                hvx[found] = vx[pids[i]]; hvy[found] = vy[pids[i]];
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
        updateNeighborList: updateNeighborList,
        state: state,
        stateInEnvironmentOf: stateInEnvironmentOf,
        stateOf: stateOf,
        stateAsMatrix: stateAsMatrix
    };
}
