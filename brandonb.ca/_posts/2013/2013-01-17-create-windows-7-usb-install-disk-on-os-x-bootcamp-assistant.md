---
title: Create Windows 7 USB install disk on OS X BootCamp Assistant
date: 2013-01-17
---


Over the past few days I have been trying to dualboot Windows 8 on my mid-2010 MacBookPro because I want to game out to some Skyrim and finish the storyline. Unfortunately, when I use the BootCamp Assistant I have no option to create a Windows 7 USB installer. On the second screen where you can download the Apple Windows drivers and perform the install, there should be a checkbox to create a Windows 7 USB install disk. The funny thing is, I could have sworn I had seen this option enabled before. Well on my MacBook this option was nowhere to be found.

<!-- break -->

I did some googling and I stumbled across [this thread](http://www.codez4mac.com/forum/viewtopic.php?f=212&t=61921) which outlines that the BootCamp Assistant does not have the current Mac in its "support Macs" plist file. By editing the `Info.plist` in the Package Contents of `BootCamp Assistant.app` and adding my MacBook into the file, I was able to create a Windows 8 install disk with the BootCamp Assistant.

If the thread mentioned earlier does not work, the information is in a more condensed version on the [Apple Forums](https://discussions.apple.com/thread/3435734?start=15&tstart=0).
