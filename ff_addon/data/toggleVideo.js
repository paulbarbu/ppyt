var player = unsafeWindow.document.getElementById('movie_player');
var titleElem = unsafeWindow.document.getElementById('eow-title')

var title = null;
if(titleElem)
{
    title = titleElem.innerHTML.trim();
}

if(player)
{
    if(self.options.stop)
    {
        player.pauseVideo();
        self.postMessage({
            msg: "Video stopped!",
            state: "INEXISTENT",
            title: null,
        });
    }
    else
    {
        switch(player.getPlayerState())
        {
            case 1: // playing
            case 3: // buffering
                player.pauseVideo();
                self.postMessage({
                    msg: "Video paused!",
                    state: "PAUSED",
                    title: null,
                });
                break;
            case 2: // paused
                player.playVideo();
                self.postMessage({
                    msg: "Video playing!",
                    state: "PLAYING",
                    title: title,
                });
                break;
            default: // all the other states do not involve a deliberate playing state
                self.postMessage({
                    msg: "There is no video!",
                    state: "INEXISTENT",
                    title: null,
                });
                break;
        }
    }
}
else
{
    self.postMessage({
        msg: "There is no video!",
        state: "INEXISTENT",
        title: null,
    });
}
