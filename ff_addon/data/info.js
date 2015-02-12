function isMusicVideo(document)
{
    return /music/i.test(document.querySelector("meta[itemprop='genre']").getAttribute('content'));
}

function getVideoTitle(document)
{
    return document.getElementById('eow-title').innerHTML;
}
