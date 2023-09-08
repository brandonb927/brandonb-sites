---
title: Fix Google Chrome from crashing in OS X 10.10 Yosemite
date: 2014-06-11
---

**Edit:** This doesn't seem to be an issue anymore in the Public Beta. Let me know if you still have Chrome crashing all the time!

----------

Google Chrome Canary is usually pretty good in any OS, almost good enough for a daily driver except for the odd crash now and then, but in OS X 10.10 it is not stable **at all**. Every second or even every tab I open crashes after a period of time, or just straight up will not load. I googled around and found that the solution is partially caused by having to show scrollbars on using the trackpad on MacBooks. You can fix this by running these two commands:

```bash
defaults write com.google.Chrome AppleShowScrollBars Always
defaults write com.google.Chrome.canary AppleShowScrollBars Always
```
