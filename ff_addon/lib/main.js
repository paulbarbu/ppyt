var { Hotkey } = require("sdk/hotkeys");
var { Request } = require("sdk/request");
var { PageMod } = require("sdk/page-mod");
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


PageMod({ //this handles the loading via a new tab, http-on-examine-response handles the video change in the same tab
    include: "*.youtube.com",
    attachTo: ["top"],
    contentScriptWhen: "ready",
    contentScript: "self.port.emit('title', document.getElementById('eow-title').innerHTML);",
    onAttach: function(worker){
        if(isYoutube(worker.url))
        {
            worker.port.on("title", function(title){
                writeState("PLAYING", title);
            });

        }
    }
});


// when the response is examined, the URL on the tab is changed, too
events.on("http-on-examine-response", responseReceived);
// when a new tab is created, this code will, run, but setTimeout from the content script won't be run, so I need page-mod
function responseReceived(event) {
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel); // without this event.subject.URI would be null for some reason
    var url = event.subject.URI.spec;

    if(isYoutube(url))
    {
        console.log("New video loaded!");

        // get the video id from the URL
        let query = url.slice(url.indexOf("?") + 1);
        let videoId = qs.parse(query)["v"];

        for(let tab of tabs)
        {
            if(tab.url.indexOf(videoId) !== -1 && isYoutube(tab.url))
            {
                console.log("Found tab!");
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
}

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
    console.log("Toggling video!");

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
    console.log("Writing state: " + state + "- Title: " + title);

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

exports.onUnload = function (reason) {
    events.off("http-on-examine-response", responseReceived);
};
