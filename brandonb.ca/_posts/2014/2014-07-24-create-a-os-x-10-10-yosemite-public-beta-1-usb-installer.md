---
title: Create a OS X 10.10 Yosemite Public Beta 1 USB installer
date: 2014-07-24
---


Want an easy, command line one-liner to install your handy-dandy new OS X Yosemite Public Beta that you just redeemed from the App Store?

<!-- break -->

```bash
sudo /Applications/Install\ OS\ X\ Yosemite\ Beta.app/Contents/Resources/createinstallmedia --volume /Volumes/Untitled --applicationpath /Applications/Install\ OS\ X\ Yosemite\ Beta.app --nointeraction
```

Replace `Untitled` with the name of your USB partition and all is well :)
