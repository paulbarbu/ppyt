#! /bin/bash

rm -f ~/.ppyt

if [[ 0 -ne "$?" ]]; then
    s=$?
    echo "rm failed: $?"
    exit 1
fi

xdotool search --sync --class firefox key ctrl+shift+alt+p

if [[ 0 -ne "$?" ]]; then
    echo "xdotool failed: $?"
    exit 1
fi

sleep 0.5

if [[ -f ~/.ppyt ]]; then
    state=$(cat ~/.ppyt)
    case "$state" in
        INEXISTENT )
            mpc toggle
            ;;
        PAUSED | PLAYING )
            mpc pause
            ;;
        * )
            echo "Invalid player state!"
            exit 1
            ;;
    esac
else
    echo "Inexistent file ~/.ppyt"
    mpc toggle
fi
