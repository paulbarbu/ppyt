#! /bin/bash

#xdotool search --sync --name "Mozilla Firefox" key ctrl+shift+alt+p

id=$(xdotool search --name "Mozilla Firefox")

if [[ $? -ne 0 ]]; then
    echo "Cannot find Firefox, sending INEXISTENT command to toggle MPD"
    curl -d 'state=INEXISTENT&title=null' http://127.0.0.1:1337

    exit
fi


if [[ $# -eq 1 ]] && [[ "$1" -eq "mpdonly" ]]; then
    xdotool key --window $id ctrl+shift+alt+s
    # if FF exists, it will send the INEXISTENT command, so mpd will be toggled
    # if it doesn't there's fallback code below
else
    xdotool key --window $id ctrl+shift+alt+p
fi

if [[ 0 -ne "$?" ]]; then
    echo "xdotool failed: $?"

    echo "Sending INEXSITENT command to toggle MPD"
    curl -d 'state=INEXISTENT&title=null' http://127.0.0.1:1337

    exit 1
fi
