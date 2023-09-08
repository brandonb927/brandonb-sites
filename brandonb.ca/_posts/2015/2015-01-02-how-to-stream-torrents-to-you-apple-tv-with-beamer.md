---
title: How to stream torrents to your Apple TV with Beamer
date: 2015-01-02
---

Last updated: January 13, 2016

_Edit: The current version of Beamer (3.0.4) seems to render this method unusable due to some fixes in how files are read in the app so YMMV_

Recently I wanted to watch an episode of Chopped Canada that had previously aired on the Food Network website, but I wanted to AirPlay it to my TV so I could watch it with others. If you've never watched a video from their website, the experience is shitty and the quality is terrible even on a small screen. This makes it almost embarrassingly impossible to play on a 42" TV. This caused me to resort to looking up a torrented version of the episode from my sources.

<!-- break -->

From my knowledge I knew that one could potentially use [TorrenTV](https://torrentv.github.io/) to stream a magnet link/torrent directly to an AppleTV but the past few times I used it it didn't work well. The app wouldn't see my AppleTV at all, and at that point I gave up. I tried using PopcornTime ~http://popcorntime.io/~ (dead link) which streams torrents directly from the app to your AppleTV but from my research the app doesn't support custom magnet link URIs :(

This lead me to further my search and I found out that PopcornTime uses an `npm` module called `[peerflix](https://github.com/mafintosh/peerflix)` to stream a torrent file/magnet link to a temporary file in your filesystem. At this point I encountered a mental lightbulb and realized I could use an existing app I already use called [Beamer](http://beamer-app.com/) to cast my streamed media file directly to my TV. Bingo!

So my workflow for this now looks like:

- Get torrent file/magnet link from a source into clipboard buffer
- Paste buffered link into commandline as `peerflix [TORRENT FILE/MAGNET LINK] --remove`
- Open Finder and go to `/tmp/torrent-stream/<path to file found in peerflix output>`
- Drag file into Beamer and go make some popcorn to watch your video with

This seems complicated at first (and it is for what it is) so I think I'll improve on this workflow in the future as there are probably other ways you can accomplish this in a simpler fashion. For now however, it works wonders for me and isn't too cumbersome because I'm always using a terminal.
