var modelBuilder = function (size, textContainer, svgContainer) {

    var existingAgents = [];
    var size = size;


    var drawAgents = function (index, data) {

        var toberemoved = removedAgents(data.ids);
        R.map(function (id) { removeAgent(id); }, toberemoved);

        if (index !== undefined) {
            for (var i = 0; i < data.ids.length; i++) {
                maybeNewAgent(data.ids[i],
                        data.x[i] + 0.5 * size,
                        data.y[i] + 0.5 * size,
                        data.vx[i],
                        data.vy[i]);
            }
        }
        existingAgents = data.ids;
    };


    var drawScene = function (data) {

        var toberemoved = removedAgents(data.ids);
        R.map(function (id) { removeAgent(id); }, toberemoved);

        for (var i = 0; i < data.ids.length; i++) {
            maybeNewAgent(data.ids[i],
                    0.3 * data.x[i] + 50,
                    0.3 * data.y[i] + 50,
                    data.vx[i],
                    data.vy[i], 30);
        }
        existingAgents = data.ids;
    };


    var onerror = function () { textContainer.innerHTML = 'server makes problems'; }


    var workWithAgent = function (f, obj) {
        var number = obj.ids.length;
        for (var i = 0; i < number; i++) {
            f(obj.ids[i], obj.x[i], obj.y[i], obj.vx[i], obj.vy[i]);
        }
    };


    var setAgent = function (agent, x, y, vx, vy) {
        var angle = Math.atan2(vy, vx) * 180 / Math.PI;
        if (angle < 0) { angle += 360; }
        if (angle > 360) { angle -= 360; }
        svg.setRotation(agent, angle);
        svg.setTranslation(agent, [x, y]);
    };


    var newAgent = function (name, x, y, vx, vy, scaling) {
        if (scaling === undefined) { scaling = 80; }
        var agent = svg.setScaling(svg.arrow({ 'id': name,
                                               'fill': 'green',
                                               'stroke': 'white',
                                               'stroke-width': 0.01}), scaling);
        setAgent(agent, x, y, vx, vy);
        svgContainer.appendChild(agent);
        existingAgents.push(name);
    };

    var maybeNewAgent = function (name, x, y, vx, vy, scaling) {
        if (existAgent(name)) { updateAgent(name, x, y, vx, vy); }
        else { newAgent(name, x, y, vx, vy, scaling); }
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
        drawScene: drawScene,
        onerror: onerror
    }

}
