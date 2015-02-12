var http = require('http');
var util = require('util');
var net = require('net');
var qs = require('querystring')

var mpd = require('mpd');

var client = mpd.connect({
    port: 6600,
    host: "localhost",
});

client.on("system-player", getMpdTitle);

currentTitle = null;

var httpServer = http.createServer(function(req, res){
    var data = "";

    if(req.method == "POST")
    {
        req.on('data', function(chunk){
            data += chunk;
        });

        req.on('end', function(){
            receivedCommand(qs.parse(data));

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end();
        })
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

function receivedCommand(c)
{
    var t = c.title ? c.title.replace(/\s+/gi, ' ') : "";
    util.log("Youtube is " + c.state);
    util.log("Title is " + t);

    switch(c.state)
    {
        case "INEXISTENT":
            toggleMpd();
            break;
        case "PLAYING":
            currentTitle = t;
        case "PAUSED":
            pauseMpd();
            break;
        default:
            break;
    }
}

function playMpd()
{
    client.sendCommand("play", function(err, msg){
        if(err)
        {
            console.error("MPD returned error: " + err);
        }
        else
        {
            util.log("Played successfully" + (msg ? ": " + msg : ""));
            getMpdTitle();
        }
    });
}

function pauseMpd()
{
    //TODO:  intelligent stop/pause - stop if stream, pause if file on disk
    client.sendCommand("stop", function(err, msg){
        if(err)
        {
            console.error("MPD returned error: " + err);
        }
        else
        {
            util.log("Paused successfully" + (msg ? ": " + msg : ""));
        }
    });
}

function toggleMpd()
{
    client.sendCommand("status", function(err, msg){
        if(err)
        {
            console.error("MPD returned error: " + err);
        }
        else
        {
            if(msg)
            {
                var state = mpd.parseKeyValueMessage(msg)["state"];
                switch(state)
                {
                    case "play":
                        pauseMpd();
                        break;
                    case "stop":
                    case "pause":
                        playMpd();
                        break;
                    default:
                        console.error("MPD can only have three states: play, pause, stop");
                        break;
                }
            }
        }
    });
}

function getMpdTitle()
{
    client.sendCommand("currentsong", function(err, msg){
        if(err)
        {
            console.error("MPD returned error: " + err);
            currentTitle = "";
        }
        else
        {
            if(msg)
            {
                var song = mpd.parseKeyValueMessage(msg);

                if(song.Title != null)
                {
                    currentTitle = song.Title;
                }
                else if(song.Name != null)
                {
                    currentTitle = song.Name;
                }
                else
                {
                    currentTitle = song.file;
                }
            }
        }
    });
}

httpServer.listen(1337, '127.0.0.1');
tcpServer.listen(1338, '127.0.0.1');
