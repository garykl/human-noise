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

    }
};
