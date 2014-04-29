var WebSocketServer = require('ws').Server,
    http = require('http'),
    express = require('express'),
    app = express(),
    port = process.env.PORT || 5000,
    _ = require('underscore'),
    irc = require('irc');


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
        console.log("websocket index: %d", clients.indexOf(ws));
        clients = _.without(clients, ws);
        console.log("total websockets %d", clients.length);
    });
});

var ircClient = new irc.Client('irc.wikimedia.org', 'wiki-update-sockets', {
    channels: ['#en.wikipedia'],
});

ircClient.addListener('error', function(message) {
    console.log('error: ', message);
});

ircClient.addListener('message', function(from, to, message) {
    _.each(clients, function(client, index, list) {
        client.send("Message received: " + message);
    });
});