/*jslint white: true */

var http = require('http');
var util = require('util');
var net = require('net');
var qs = require('querystring');

var mpdLib = require('./mpd-common');

var currentTitle = null;

mpdLib.mpdClient.on("system-player", function() {
    mpdLib.getMpdTitle(function(title){
        currentTitle = title;
    });
});


function receivedCommand(c)
{
    var t = c.title ? c.title.replace(/\s+/gi, ' ') : "";
    util.log("Youtube is " + c.state);
    util.log("Title is " + t);

    switch(c.state)
    {
        case "INEXISTENT":
            mpdLib.toggleMpd(function(title){
                currentTitle = title;
            });
            break;
        case "PLAYING":
            mpdLib.currentTitle = t;
        case "PAUSED":
            mpdLib.pauseMpd();
            break;
        default:
            break;
    }
}

var httpServer = http.createServer(function(req, res){
    var data = "";

    if(req.method === "POST")
    {
        req.on('data', function(chunk){
            data += chunk;
        });

        req.on('end', function(){
            receivedCommand(qs.parse(data));

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end();
        });
    }
    else
    {
        res.writeHead(405, {'Content-Type': 'text/plain'});
        res.end();
    }
});

var tcpServer = net.createServer(function(socket) {
    if(currentTitle !== null)
    {
        socket.end(currentTitle);
    }
});

httpServer.listen(1337, '127.0.0.1');
tcpServer.listen(1338, '127.0.0.1');
