var irc = require('irc');
var client = new irc.Client('irc.wikimedia.org', 'wiki-update-sockets', {
    channels: ['#en.wikipedia'],
});

client.addListener('message', function(from, to, message) {
    console.log(from + ' => ' + to + ' : ' + message);
});