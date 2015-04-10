var modelBuilder = function (size, textContainer, svgContainer) {

    var existingAgents = [];
    var size = size;


    var drawAgents = {
        'spawned': function (index, data) { workWithAgent(newAgent, data) },
        'viewport': function (index, data) {

            var toberemoved = removedAgents(data.ids);
            R.map(function (id) { removeAgent(id); }, toberemoved);

            var number = data.ids.length;

            if (index !== undefined) {
                for (var i = 0; i < number; i++) {
                    maybeNewAgent(data.ids[i],
                                  data.x[i] + 0.5 * size,
                                  data.y[i] + 0.5 * size,
                                  data.vx[i],
                                  data.vy[i]);
                }
            }
            existingAgents = data.ids;
        }
    };


    var onerror = function () { textContainer.innerHTML = 'server makes problems'; }


    var workWithAgent = function (f, obj) {
        var number = obj.ids.length;
        for (var i = 0; i < number; i++) {
            f(obj.ids[i], obj.x[i], obj.y[i], obj.vx[i], obj.vy[i]);
        }
    };


    var setAgent = function (agent, x, y, vx, vy) {
        var angle = Math.atan2(vy, vx) * 180 / Math.PI + 360;
        svg.setRotation(agent, angle);
        svg.setTranslation(agent, [x, y]);
    };


    var newAgent = function (name, x, y, vx, vy) {
        var agent = svg.setScaling(svg.arrow({ 'id': name,
                                               'fill': 'green',
                                               'stroke': 'white',
                                               'stroke-width': 0.01}), 100);
        setAgent(agent, x, y, vx, vy);
        svgContainer.appendChild(agent);
        existingAgents.push(name);
    };

    var maybeNewAgent = function (name, x, y, vx, vy) {
        if (existAgent(name)) { updateAgent(name, x, y, vx, vy); }
        else { newAgent(name, x, y, vx, vy); }
    };

    var existAgent = function (name) { return inList(existingAgents, name); }

    var inList = function (ll, l) {
        return R.any(function (i) { return l === i; }, ll);
    }

    var removedAgents = function (names) {
        return R.filter(function (name) {
            return !inList(names, name);
        }, existingAgents);
    };

    var updateAgent = function (name, x, y, vx, vy) {
        var agent = document.getElementById(name);
        setAgent(agent, x, y, vx, vy);
    };

    var removeAgent = function (name) {
        var agent = document.getElementById(name);
        svg.remove(agent);
    };

    return {
        drawAgents: drawAgents,
        onerror: onerror
    }

}
