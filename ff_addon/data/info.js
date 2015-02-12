function isMusicVideo(document)
{
    var meta = document.querySelector("meta[itemprop='genre']");
    if(meta)
    {
        return /music/i.test(meta.getAttribute('content'));
    }

    return false;
}

function getVideoTitle(document)
{
    return document.getElementById('eow-title').innerHTML;
}
