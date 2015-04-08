
var range = function (n) {
    var res = [];
    for (var i = 0; i < n; i++) {
        res[i] = i;
    }
    return res;
}


module.exports = function () {

    // var positions = [];
    var x = [];
    var y = [];
    // var velocities = [];
    var vx = [];
    var vy = [];

    var dt = 1;
    var size = 800;


    var addAgent = function (position, velocity) {
        var newIndex = x.length;

        //positions[newIndex] = position
        x[newIndex] = position[0];
        y[newIndex] = position[1];
        //velocities[newIndex] = velocity;
        vx[newIndex] = velocity[0];
        vy[newIndex] = velocity[1];

        return newIndex;
    }

    var accelerateAgent = function (index, acceleration) {
        // consider only changes in the direction, velocity is rotated.
        var angle = acceleration * dt;
        t_vx = Math.cos(angle) * vx[index] + Math.sin(angle) * vy[index];
        t_vy = -Math.sin(angle) * vx[index] + Math.cos(angle) * vy[index];
        vx[index] = t_vx
        vy[index] = t_vy
    }

    var integrateSystem = function () {
        for (var i = 0; i < x.length; i++) {
            // consider periodic boundary conditions
            x[i] = (x[i] + vx[i] * dt + size) % size;
            y[i] = (y[i] + vy[i] * dt + size) % size;
        }
    }

    var state = function () {
        return {
            ids: range(x.length),
            //positions: positions,
            x: x,
            y: y,
            //velocities: velocities
            vx: vx,
            vy: vy
        }
    }

    var stateOf = function (index) {
        return {
            ids : [index],
            //positions: [positions[index]],
            //velocities: [velocities[index]]
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
        stateOf: stateOf
    }
}
