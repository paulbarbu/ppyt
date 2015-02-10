var player = unsafeWindow.document.getElementById('movie_player');

switch(player.getPlayerState())
{
    case 1: // playing
    case 3: // buffering
        player.pauseVideo();
        self.postMessage({
            msg: "Video paused!",
            state: "PAUSED"
        });
        break;
    case 2: // paused
        player.playVideo();
        self.postMessage({
            msg: "Video playing!",
            state: "PLAYING"
        });
        break;
    default: // all the other states do not involve a deliberate playing state
        self.postMessage({
            msg: "There is no video!",
            state: "INEXISTENT"
        });
        break;
}
