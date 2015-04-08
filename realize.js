var modelBuilder = function (textContainer, svgContainer) {

    var drawAgents = {
        'spawned': function (data) { workWithAgent(newAgent, data) },
        'existing': function (data) { workWithAgent(updateAgent, data); }
    };


    var onerror = function () { textContainer.innerHTML = 'server makes problems'; }


    var workWithAgent = function (f, obj) {
        var number = obj.ids.length;
        for (var i = 0; i < number; i++) {
            f(obj.ids[i], obj.positions[i], obj.velocities[i]);
        }
    };


    var setAgent = function (agent, position, velocity) {
        if (velocity < 0) {
            svg.setRotation(agent, 180);
        } else {
            svg.setRotation(agent, 0);
        }
        svg.setTranslation(agent, [position + 100, 100]);
    };


    var newAgent = function (name, position, velocity) {
        var agent = svg.setScaling(svg.arrow({ 'id': name }), 100);
        setAgent(agent, position, velocity);
        svgContainer.appendChild(agent);
    };


    var updateAgent = function (name, position, velocity) {
        var agent = document.getElementById(name);
        setAgent(agent, position, velocity);
    };

    return {
        drawAgents: drawAgents,
        onerror: onerror
    }

}
