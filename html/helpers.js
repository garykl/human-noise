var helpers = {

    initializeWebsocket: function (url) {
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        if (!window.WebSocket) {
            var content = document.getElementById('content');
            content.innerHTML = '<p>Sorry, but your browser doesn\'t support WebSockets.';
            return undefined;
        }

        websocket = new WebSocket(url);
        return websocket;
    },

    rectangularBackground: function (svg, size) {
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        var background = svg.rectangle(size, size, { fill: '#333333' });
        svg.appendChild(background);
    },

    initializeUI: function () {

        var size = 600;

        var textContainer = document.getElementById('content');
        var svgns = 'http://www.w3.org/2000/svg';

        var svgContainer = document.createElementNS(svgns, 'svg');
        svgContainer.setAttribute('width', size);
        svgContainer.setAttribute('height', size);
        var background = svg.rectangle(size, size, { fill: '#333333' });
        svgContainer.appendChild(background);

        textContainer.appendChild(svgContainer);

        return modelBuilder(size, textContainer, svgContainer);

    },

};


// start websocket
var spawnViscekAgent = function (url) {

    var connection = helpers.initializeWebsocket(url);

    var currentState = state();

    // connect the ui with the socket
    var checkoutIndex = client.subjectiveConnection(
            connection,
            configuration.saveViewport(currentState),
            uiBuilder.onerror);

    var stopSending = sender.viscekAgent(

            function () {
                return currentState.getStateFromServerIndex(checkoutIndex());
            },

            function () {
                return currentState.getState();
            },

            connection);
};


var observe = function (url) {

    var connection = helpers.initializeWebsocket(url);

    var currentState = state();

    // connect the ui with the socket
    client.objectiveConnection(
            connection,
            configuration.drawScene(currentState, uiBuilder),
            uiBuilder.onerror);
}

