ppYt
====
**Play/Pause Youtube** is a Firefox extension and a shell script that plays/pauses my music
(regardless of the source, youtube or mpd).

The whole point of this is that I can control the music only with the keyboard, regardless of the current program,
via keybindings in the window manager.


Data flow
=========
1. User presses a key combination
2. `ppyt.sh` fires (the window manager calls it)
3. Firefox is sent the key combination: `ctrl+shift+alt+p`
 * If Firefox is not open, jump to step 5 (with INEXISTENT as command)
4. The Firefox addon searches for a YT tab and if playing, pauses it, if paused, plays it.
5. The addon makes a request to 127.0.0.1:1337 where the `ppytd.js` nodejs app continuously listens for requests
6. The request contains one of three commands: `INEXISTENT`, `PLAYING`, `PAUSED`, depending on the
state of the youtube video after step 4
7. If the command is `INEXISTENT` mpd is toggled, since I want to play some music if it's paused in mpd,
or pause it if it's paused in mpd
8. If the command is `PLAYING` or `PAUSED` mpd is paused since I want no music from mpd
if I have a playing youtube tab, also if I have a paused youtube tab, I want to keep mpd quiet by pausing it

The `ppytd.js` application also listens for TCP connections on port 1338 and writes there the current song name.
This can be used to read the song name into conky.

The Firefox exension also stops MPD when you open a new video.

If you send `ctrl+shift+alt+s` to the Firefox extension it will stop the current video and toggle MPD (mpd can be toggle via `ppyst.sh mpdonly`, too).


Installation (development)
==========================

**Firefox extension:**

1. Install [Extension Auto-Installer](https://addons.mozilla.org/en-US/firefox/addon/autoinstaller/) in Firefox
2. Install [cfx](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation)
 * ArchLinux note: https://wiki.archlinux.org/index.php/python#Dealing_with_version_problem_in_build_scripts
3. make install

**Dependencies:**

1. MPD: `npm install mpd`


LICENSE
=======
MPL 2.0
