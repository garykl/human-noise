
var range = function (n) {
    var res = [];
    for (var i = 0; i < n; i++) {
        res[i] = i;
    }
    return res;
}


module.exports = function () {

    var positions = [];
    var velocities = [];

    var dt = 1;


    var addAgent = function (position, velocity) {
        var newIndex = positions.length;

        positions[newIndex] = position
        velocities[newIndex] = velocity;

        return newIndex;
    }

    var accelerateAgent = function (index, acceleration) {
        velocities[index] += acceleration * dt;
    }

    var integrateSystem = function () {
        for (var i = 0; i < positions.length; i++) {
            positions[i] += velocities[i] * dt;
        }
    }

    var state = function () {
        return {
            ids: range(positions.length),
            positions: positions,
            velocities: velocities
        }
    }

    var stateOf = function (index) {
        return {
            ids : [index],
            positions: [positions[index]],
            velocities: [velocities[index]]
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
