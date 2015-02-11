var { Hotkey } = require("sdk/hotkeys");
var { Request } = require("sdk/request");

var triggerKey = Hotkey({
    combo: "shift-accel-alt-p",
    onPress: function() {
        main();
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
        if(tab.url.indexOf("youtube.com/watch") !== -1)
        {
            found = true;
            pauseYT(tab);
            break;
        }
    }

    if(!found)
    {
        writeState("INEXISTENT");
    }
}

function pauseYT(tab)
{
    tab.attach({
        contentScriptFile: "./pauseScript.js",
        onMessage: function(msg) {
            console.log(msg.msg);
            writeState(msg.state)
        },
        onError: function(err) {
            console.log(err.fileName + ":" + err.lineNumber + ": " + err);
        }
    });
}

function writeState(state)
{
    var r = Request({
        url: "http://127.0.0.1:1337",
        content: state,
        onComplete: function(response) {
            if(response.status !== 200)
            {
                console.error("Could not communicate with server, status: " + response.status);
            }
        }
    });

    r.post();
}
