var webSocketServer = require('websocket').server;
var http = require('http');
var fs = require ('fs');


var createHttpServer = function (portnumber) {
    //: Integer -> HttpServer
    //
    var server = http.createServer(function(request, response) {

        var clientRegexp = /\/client\//;
        var htmlRegexp = /\/html\//;
        var shareRegexp = /\/share\//;

        if (clientRegexp.test(request.url)
         || htmlRegexp.test(request.url)
         || shareRegexp.test(request.url)) {
            console.log(__dirname + '/..' + request.url);
            fs.readFile(__dirname + '/..' + request.url, function (err, data) {
                if (err) { response.end('that route does not exist'); }
                response.writeHeader(200, {"Content-Type": "text/html"});
                response.end(data);
            });
        }

    });

    server.listen(portnumber, function() {
        console.log((new Date()) + " Server is listening on port " + portnumber);
    });

    return server;
};


var createWebsocketServer = function (httpserver) {
    var s = new webSocketServer({ httpServer: httpserver });
    return s;
};


var clientInitializer = function () {
    //: -> (Request -> (Integer, Websocket)
    // whenever executed, a new websocket is created and a counter is
    // incremented. Thus, individual identifiers for each connection are
    // created. Returns the identifier and the socket.
    var nextIndex = 0;

    return function (request) {

        var cindex = nextIndex;
        nextIndex++;
        var socket = request.accept(null, request.origin);

        return [cindex, socket];
    };
};


exports.createHttpServer = createHttpServer;
exports.createWebsocketServer = createWebsocketServer;
exports.clientInitializer = clientInitializer;
