var modelBuilder = function (textContainer, svgContainer) {

    var existingAgents = [];


    var drawAgents = {
        'spawned': function (data) { workWithAgent(newAgent, data) },
        'viewport': function (data) {
            var toberemoved = removedAgents(data.ids);
            R.map(function (id) { removeAgent(id); }, toberemoved);
            workWithAgent(maybeNewAgent, data);
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
        svg.setTranslation(agent, [x + 100, y + 100]);
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
