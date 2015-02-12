// timeout necessary since I have to allow the tab to load
// this is because the content script is run right after the response comes back, so nothing is rendered yet
setTimeout(function() {
    if(isMusicVideo(document))
    {
        self.postMessage(getVideoTitle(document));
    }
}, 1000);
