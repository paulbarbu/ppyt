var { Hotkey } = require("sdk/hotkeys");

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
        onError: function (err) {
            console.log(err.fileName + ":" + err.lineNumber + ": " + err);
        }
    });
}

function writeState(state)
{
    let fileIO = require("sdk/io/file");
    let textWriter = fileIO.open("~/.ppyt", "w");

    if(!textWriter.closed)
    {
        textWriter.write(state)
        textWriter.close();
    }
    else
    {
        console.error("Cannot access the state file, it's closed!")
    }
}
