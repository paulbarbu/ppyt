/*jslint white: true */

var util = require('util');

var mpd = require('mpd');

var client = mpd.connect({
    port: 6600,
    host: "localhost"
});

exports.mpdClient = client;

function mpdSend(cmd, callback, onError)
{
    client.sendCommand(cmd, function(err, msg){
        if(err)
        {
            console.error("MPD returned error: " + err);
            if(typeof onError === "function")
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

function getMpdTitle(titleSetter)
{
    if(typeof titleSetter !== "function")
    {
        throw "titleSetter has to be a function, but is: " + typeof titleSetter;
    }

    mpdSend("currentsong",
        function(msg){
            if(msg)
            {
                var song = mpd.parseKeyValueMessage(msg);

                if(song.Title)
                {
                    titleSetter(song.Title);
                }
                else if(song.Name)
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

function playMpd(titleSetter)
{
    mpdSend("play", function(msg){
        util.log("Played successfully" + (msg ? ": " + msg : ""));
        getMpdTitle(titleSetter);
    });
}

function pauseMpd()
{
    mpdSend("currentsong", function(msg){
        var file = mpd.parseKeyValueMessage(msg).file;

        if(file.indexOf("http://") === -1)
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

function toggleMpd(titleSetter)
{
    mpdSend("status", function(msg){
        if(msg)
        {
            var state = mpd.parseKeyValueMessage(msg).state;
            switch(state)
            {
                case "play":
                    pauseMpd();
                    break;
                case "stop":
                case "pause":
                    playMpd(titleSetter);
                    break;
                default:
                    console.error("MPD can only have three states: play, pause, stop");
                    break;
            }
        }
    });
}

exports.pauseMpd = pauseMpd;
exports.toggleMpd = toggleMpd;
exports.getMpdTitle = getMpdTitle;
