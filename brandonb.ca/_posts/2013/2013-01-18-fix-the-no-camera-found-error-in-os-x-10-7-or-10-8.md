---
title: Fix the no camera found error in OS X 10.7 or 10.8
date: 2013-01-18
---


I restored my new MacBook Air from a Time Machine backup from my MacBook Pro and I have been running into issues as of late, mainly to do with the iSight camera. What happens is, when I go to use an application that uses my camera, I get an error message saying my camera is disconnected.

<!-- break -->

Disconnected? Please… I was using it a half hour ago. So I began to Google questions looking for answers. I found all sorts of people saying to [reset my SMC](http://support.apple.com/kb/HT3964) but to no avail. After about 15 minutes of scouring the Apple forums, I stumbled upon a gem that
finally fixes my issue:

    killall VDCAssistant

This solution however, does not expose the root of the problem. It seems to happen whenever I put my MacBook to sleep. It doesn't happen often enough
to warrant replacing the computer, however it is rather annoying.

Readers, let me know if you find any other solutions which are permanent.
