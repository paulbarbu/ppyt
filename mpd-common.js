var util = require('util');

exports.pauseMpd = pauseMpd;
exports.playMpd = playMpd;
exports.toggleMpd = toggleMpd;
exports.getMpdTitle = getMpdTitle;

var mpd = require('mpd');

var client = mpd.connect({
    port: 6600,
    host: "localhost",
});

exports.mpdClient = client;

function mpdSend(cmd, callback, onError)
{
    client.sendCommand(cmd, function(err, msg){
        if(err)
        {
            console.error("MPD returned error: " + err);
            if(typeof onError == "function")
            {
                onError(err);
            }
        }
        else
        {
            callback(msg);
        }
    });
}

function playMpd()
{
    mpdSend("play", function(msg){
        util.log("Played successfully" + (msg ? ": " + msg : ""));
        getMpdTitle();
    });
}

function pauseMpd()
{
    mpdSend("currentsong", function(msg){
        var file = mpd.parseKeyValueMessage(msg).file;

        if(file.indexOf("http://") == -1)
        {
            // the file is on disk, I can pause it
            mpdSend("pause 1", function(msg){
                util.log("Paused successfully" + (msg ? ": " + msg : ""));
            });
        }
        else
        {
            // a stream is currently playing, pausing makes no sense, so I stop it
            mpdSend("stop", function(msg){
                util.log("Paused successfully" + (msg ? ": " + msg : ""));
            });
        }
    });
}

function toggleMpd()
{
    mpdSend("status", function(msg){
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
    });
}

function getMpdTitle(titleSetter)
{
    if(typeof titleSetter != "function")
    {
        throw "titleSetter has to be a function, but is: " + typeof titleSetter;
    }

    mpdSend("currentsong",
        function(msg){
            if(msg)
            {
                var song = mpd.parseKeyValueMessage(msg);

                if(song.Title != null)
                {
                    titleSetter(song.Title);
                }
                else if(song.Name != null)
                {
                    titleSetter(song.Name);
                }
                else
                {
                    titleSetter(song.file);
                }
            }
        },
        function(){
            titleSetter("");
        }
    );
}
