if(isMusicVideo(document))
{
    self.port.emit('title', getVideoTitle(document));
}
