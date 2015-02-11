var http = require('http');
var util = require('util');
var mpd = require('mpd');

var client = mpd.connect({
    port: 6600,
    host: "localhost",
});

var server = http.createServer(function(req, res){
    var data = "";

    if(req.method == "POST")
    {
        req.on('data', function(chunk){
            data += chunk;
        });

        req.on('end', function(){
            receivedCommand(data);

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

function receivedCommand(c)
{
    util.log("Youtube is " + c);

    switch(c)
    {
        case "INEXISTENT":
            toggleMpd();
            break;
        case "PLAYING":
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
        }
    });
}

function pauseMpd()
{
    client.sendCommand("pause 1", function(err, msg){
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

server.listen(1337, '127.0.0.1');
