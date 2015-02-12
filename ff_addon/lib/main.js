var { Hotkey } = require("sdk/hotkeys");
var { Request } = require("sdk/request");
var events = require("sdk/system/events");
var tabs = require("sdk/tabs");
var qs = require("sdk/querystring");

const { Cc, Ci, Cr } = require("chrome");
Hotkey({
    combo: "shift-accel-alt-p",
    onPress: function() {
        main();
    }
});

// when the response is examined, the URL on the tab is changed, too
events.on("http-on-examine-response", function (event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel); // without this event.subject.URI would be null for some reason
    var url = event.subject.URI.spec;

    if(isYoutube(url))
    {
        // get the video id from the URL
        let query = url.slice(url.indexOf("?") + 1);
        let videoId = qs.parse(query)["v"];

        for(let tab of tabs)
        {
            if(tab.url.indexOf(videoId) !== -1 && isYoutube(tab.url))
            {
                tab.attach({
                    contentScriptFile: "./videoLoaded.js",
                    onMessage: function(title) {
                        writeState("PLAYING", title);
                    }
                });

                break; //TODO:what if I have more YT tabs open?
            }
        }
    }
});

function main()
{
    require("sdk/preferences/service").set("extensions.ppYt@paul.barbu.sdk.console.logLevel", "all");

    let found = false;
    for(let tab of tabs)
    {
        // check if the tab is a youtube.com tab with a video in it
        if(isYoutube(tab.url))
        {
            found = true;
            pauseYT(tab);
            break;
        }
    }

    if(!found)
    {
        writeState("INEXISTENT", null);
    }
}

function pauseYT(tab)
{
    tab.attach({
        contentScriptFile: "./pauseScript.js",
        onMessage: function(msg) {
            console.log(msg.msg);
            writeState(msg.state, msg.title)
        },
        onError: function(err) {
            console.log(err.fileName + ":" + err.lineNumber + ": " + err);
        }
    });
}

function writeState(state, title)
{
    var r = Request({
        url: "http://127.0.0.1:1337",
        content: {
            state: state,
            title:title,
        },
        onComplete: function(response) {
            if(response.status !== 200)
            {
                console.error("Could not communicate with server, status: " + response.status);
            }
        }
    });

    r.post();
}

function isYoutube(url) {
    return url.indexOf("youtube.com/watch?v") !== -1;
}

// exports.onUnload = function (reason) {
//     events.off("http-on-modify-request", listener);
// };
