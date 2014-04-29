// Prepare some imports
var WebSocketServer = require('ws').Server,
    http = require('http'),
    express = require('express'),
    app = express(),
    port = process.env.PORT || 5000,
    _ = require('underscore'),
    irc = require('irc');

// Create the http server which will serve the websocket requests
var server = http.createServer(app);
server.listen(port);
console.log('http server listening on %d', port);

// This stores the active web socket clients
var clients = [];

// Create a websocket server
var wss = new WebSocketServer({server: server});
console.log('WebSocketServer created');
wss.on('connection', function(ws) {
    // Add the active websocket client to the clients collection
    clients.push(ws);
    console.log('websocket %d connection open', clients.length);

    // When we close the connection, remove it from the clients collection
    ws.on('close', function() {
        console.log("websocket connection close");
        console.log("websocket index: %d", clients.indexOf(ws));
        clients = _.without(clients, ws);
        console.log("total websockets %d", clients.length);
    });
});

// Create an IRC client and connect the the update channel on Wikipedia-EN
var ircClient = new irc.Client('irc.wikimedia.org', 'wiki-update-sockets', {
    channels: ['#en.wikipedia'],
    stripColors: true,
});

// Handle errors just by logging them
ircClient.addListener('error', function(message) {
    console.log('error: ', message);
});

function extract_message_type(message) {
    if(message.indexOf("[[Special:Log/newusers]]") >= 0) {
        return "newuser";
    } else if(message.indexOf("[[Special:Log/upload]]")>= 0) {
        return "upload";
    } else if(message.indexOf("[[Special:") >= 0) {
        return "special";
    } else if(message.indexOf("[[Talk:") >= 0) {
        return "talk";
    } else if(message.indexOf("[[User:") >= 0) {
        return "user";
    } else {
        return "unspecified";
    }
}

// Messages should be processed and sent to each of the web socket clients
ircClient.addListener('message', function(from, to, message) {
    var msg;
    if(clients.length > 0) {
        msg = {
            "type": extract_message_type(message),
            "time": new Date()
        };
    }
    _.each(clients, function(client, index, list) {
        client.send(JSON.stringify(msg));
    });
});