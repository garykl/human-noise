var modelBuilder = function (size, textContainer, svgContainer) {

    var existingAgents = [];
    var size = size;
    var pointsDrawn = false;
    var agentsize = 5000 / size;

    var drawPoints = function (x, y, x0, y0) {

        // var points;
        if (!pointsDrawn) {

            points = R.map(function (i) {

                var point = svg.point(0, 0, {
                    id: 'point' + i,
                    fill: '#7799ee'
                })
                svgContainer.appendChild(point);
                return point;

            }, R.range(0, x.length * y.length));

            pointsDrawn = true;
        }
        else {
            points = R.map(function (i) {
                return document.getElementById('point' + i);
            }, R.range(0, x.length * y.length));
        }

        R.map(function (p) {

            var x = p[1][0] - x0
                var y = p[1][1] - y0
                svg.setTranslation(p[0], [x, y]);

        }, R.zip(points, R.xprod(x, y)));
    };


    var drawAgents = function (index, data) {
        // draw some points as indicator for movement:
        // points being coordinates around the agent.
        var x = data.x[findIndex(data.ids, index)];
        var y = data.y[findIndex(data.ids, index)];
        x -= x % agentsize - 0.5 * size;
        y -= y % agentsize - 0.5 * size;

        var pointnumber = 11;
        var dr = (pointnumber - 1) / 2 * agentsize;
        var xx = range(x - dr, agentsize, x + dr);
        var yy = range(y - dr, agentsize, y + dr);
        drawPoints(xx, yy,
                data.x[findIndex(data.ids, index)],
                data.y[findIndex(data.ids, index)]);


        var toberemoved = removedAgents(data.ids);
        R.map(function (id) { removeAgent(id); }, toberemoved);

        var cx = data.x[findIndex(data.ids, index)]
        var cy = data.y[findIndex(data.ids, index)]
        if (index !== undefined) {
            for (var i = 0; i < data.ids.length; i++) {
                maybeNewAgent(data.ids[i],
                        data.x[i] - cx + 0.5 * size,
                        data.y[i] - cy + 0.5 * size,
                        data.vx[i],
                        data.vy[i], agentsize);
            }
        }
        existingAgents = data.ids;
    };


    var drawScene = function (data, fieldsize) {

        var toberemoved = removedAgents(data.ids);
        R.map(function (id) { removeAgent(id); }, toberemoved);

        for (var i = 0; i < data.ids.length; i++) {
            maybeNewAgent(data.ids[i],
                    size / (fieldsize + 100) * data.x[i] + 15,
                    size / (fieldsize + 100) * data.y[i] + 15,
                    data.vx[i],
                    data.vy[i], agentsize);
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
    };

}
