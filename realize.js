var modelBuilder = function (textContainer, svgContainer) {

    var drawAgents = {
        'spawned': function (data) { workWithAgent(newAgent, data) },
        'existing': function (data) { workWithAgent(updateAgent, data); }
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
        var agent = svg.setScaling(svg.arrow({ 'id': name }), 100);
        setAgent(agent, x, y, vx, vy);
        svgContainer.appendChild(agent);
    };


    var updateAgent = function (name, x, y, vx, vy) {
        var agent = document.getElementById(name);
        setAgent(agent, x, y, vx, vy);
    };

    return {
        drawAgents: drawAgents,
        onerror: onerror
    }

}
