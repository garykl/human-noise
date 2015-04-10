
var range = function (n) {
    var res = [];
    for (var i = 0; i < n; i++) {
        res[i] = i;
    }
    return res;
}


module.exports = function () {

    var ids= [];

    var x = [];
    var y = [];

    var vx = [];
    var vy = [];

    var dt = 1;
    var size = 800;
    var cutoffRadius = 300;


    var addAgent = function (cindex, position, velocity) {
        var newIndex = x.length;

        ids[newIndex] = cindex;
        x[newIndex] = position[0];
        y[newIndex] = position[1];
        vx[newIndex] = velocity[0];
        vy[newIndex] = velocity[1];

        return newIndex;
    };

    var findIndex = function (cindex) {
        //: AgentIndex -> Maybe Integer
        // given the the index of agentSockets, return the model index
        for (var i = 0; i < ids.length; i++) {
            if (cindex === ids[i]) { return i; }
        }
        return undefined;
    }

    var accelerateAgent = function (cindex, acceleration) {
        var index = findIndex(cindex);
        // consider only changes in the direction, velocity is rotated.
        var angle = acceleration * dt;
        var t_vx = Math.cos(angle) * vx[index] + Math.sin(angle) * vy[index];
        var t_vy = -Math.sin(angle) * vx[index] + Math.cos(angle) * vy[index];
        //var vl = Math.sqrt(vx[index] * vx[index] + vy[index] * vy[index]);
        //vx[index] = vl * Math.cos(orientation);
        //vy[index] = vl * Math.sin(orientation);
        vx[index] = t_vx;
        vy[index] = t_vy;
    };

    var integrateSystem = function () {
        for (var i = 0; i < x.length; i++) {
            // consider periodic boundary conditions
            x[i] = (x[i] + vx[i] * dt + size) % size;
            y[i] = (y[i] + vy[i] * dt + size) % size;
        }
    };

    var state = function () {
        return {
            ids: ids,
            x: x, y: y,
            vx: vx, vy: vy
        }
    }

    var relativeCoordinate = function (ci, cj) {
        // returns the relative vector of j with respect to i,
        // considering periodicity.
        var i = findIndex(ci);
        var j = findIndex(cj);
        var u = x[j] - x[i], v = y[j] - y[i];
        if (u > size * 0.5) { u -= size; }
        if (v > size * 0.5) { v -= size; }
        if (u < -size * 0.5) { u += size; }
        if (v < -size * 0.5) { v += size; }
        return [u, v];
    }

    var distance = function (ci, cj) {
        // AgentIndex -> AgentIndex
        var h = relativeCoordinate(ci, cj),
            dx = h[0], dy = h[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    var stateInEnvironmentOf = function (cindex) {
        //: AgentIndex -> State
        // return the state of agent `index`'s environment in relative
        // coordinates
        var hids = [], hx = [], hy = [], hvx = [], hvy = [], found = 0;

        for (var i = 0;  i < x.length; i++) {
            var h;

            if (distance(ids[i], cindex) < cutoffRadius) {

                hids[found] = ids[i];

                h = relativeCoordinate(cindex, ids[i]);
                hx[found] = h[0]; hy[found] = h[1];

                hvx[found] = vx[i]; hvy[found] = vy[i];
                found++;
            }
        }

        return {
            ids: hids,
            x: hx, y: hy,
            vx: hvx, vy: hvy
        };
    }

    var stateOf = function (cindex) {
        index = findIndex(cindex);
        return {
            ids : [cindex],
            x: [x[index]],
            y: [y[index]],
            vx: [vx[index]],
            vy: [vy[index]]
        }
    }

    return {
        addAgent: addAgent,
        accelerateAgent: accelerateAgent,
        integrateSystem: integrateSystem,
        state: state,
        stateInEnvironmentOf: stateInEnvironmentOf,
        stateOf: stateOf
    }
}