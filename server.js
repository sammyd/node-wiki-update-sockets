var WebSocketServer = require('ws').Server,
    http = require('http'),
    express = require('express'),
    app = express(),
    port = process.env.PORT || 5000,
    _ = require('underscore');


app.use(express.static(__dirname + '/'));

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var clients = [];

var wss = new WebSocketServer({server: server});
console.log('WebSocketServer created');
wss.on('connection', function(ws) {
    clients.push(ws);
    console.log('websocket %d connection open', clients.length);

    ws.on('close', function() {
        console.log("websocket connection close");
        _.reject(clients, function(client){ return client === ws; }); 
    });
});