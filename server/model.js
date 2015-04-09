
var range = function (n) {
    var res = [];
    for (var i = 0; i < n; i++) {
        res[i] = i;
    }
    return res;
}


module.exports = function () {

    var x = [];
    var y = [];

    var vx = [];
    var vy = [];

    var dt = 1;
    var size = 800;
    var cutoffRadius = 300;


    var addAgent = function (position, velocity) {
        var newIndex = x.length;

        x[newIndex] = position[0];
        y[newIndex] = position[1];
        vx[newIndex] = velocity[0];
        vy[newIndex] = velocity[1];

        return newIndex;
    };

    var accelerateAgent = function (index, acceleration) {
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
            ids: range(x.length),
            x: x, y: y,
            vx: vx, vy: vy
        }
    }

    var distance = function (i, j) {
        var h = relativeCoordinate(i, j),
            dx = h[0], dy = h[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    var relativeCoordinate = function (i, j) {
        // returns the relative vector of j with respect to i,
        // considering periodicity.
        var u = x[j] - x[i], v = y[j] - y[i];
        if (u > size * 0.5) { u -= size; }
        if (v > size * 0.5) { v -= size; }
        if (u < -size * 0.5) { u += size; }
        if (v < -size * 0.5) { v += size; }
        return [u, v];
    }

    var stateInEnvironmentOf = function (index) {
        // return the state of agent `index`'s environment in relative
        // coordinates
        var ids = [], hx = [], hy = [], hvx = [], hvy = [], found = 0;

        for (var i = 0;  i < x.length; i++) {
            var h;

            if (distance(i, index) < cutoffRadius) {

                ids[found] = i;

                h = relativeCoordinate(index, i);
                hx[found] = h[0]; hy[found] = h[1];

                hvx[found] = vx[i]; hvy[found] = vy[i];
                found++;
            }
        }

        return {
            ids: ids,
            x: hx, y: hy,
            vx: hvx, vy: hvy
        };
    }

    var stateOf = function (index) {
        return {
            ids : [index],
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
