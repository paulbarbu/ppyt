#! /bin/bash

#xdotool search --sync --name "Mozilla Firefox" key ctrl+shift+alt+p

id=$(xdotool search --name "Mozilla Firefox")

if [[ $? -ne 0 ]]; then
    echo "Cannot find Firefox, sending INEXISTENT command to toggle MPD"
    curl -d 'INEXISTENT' http://127.0.0.1:1337

    exit
fi

xdotool key --window $id ctrl+shift+alt+p

if [[ 0 -ne "$?" ]]; then
    echo "xdotool failed: $?"

    echo "Sending INEXSITENT command to toggle MPD"
    curl -d 'INEXISTENT' http://127.0.0.1:1337

    exit 1
fi
