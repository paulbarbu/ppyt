var { Hotkey } = require("sdk/hotkeys");
var { Request } = require("sdk/request");
var { PageMod } = require("sdk/page-mod");

Hotkey({
    combo: "shift-accel-alt-p",
    onPress: function() {
        main();
    }
});

PageMod({
    //TODO: if I click a video inside an already opened youtube tab this doesn't fire since it's already attached
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

function main()
{
    require("sdk/preferences/service").set("extensions.ppYt@paul.barbu.sdk.console.logLevel", "all");

    let tabs = require("sdk/tabs");

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
    return url.indexOf("youtube.com/watch") !== -1;
}
