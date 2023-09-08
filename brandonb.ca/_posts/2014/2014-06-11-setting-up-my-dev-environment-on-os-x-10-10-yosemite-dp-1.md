---
title: Setting up my dev environment on OS X 10.10 Yosemite DP 1
date: 2014-06-11
---


I won't be the first to admit I'm an early adopter. I love the bleeding edge, but sometimes it makes you bleed. Alot.

<!-- break -->

I recently did a full re-install of OS X on my Mid-2012 MacBook Air and instead of 10.9, I decided It would be great to test out and install the recently announced (recent as in, like, a week ago) OS X 10.10 Yosemite. I set out on a mission to get the latest version of OS X and XCode from unnamed sources and succeeded, created a USB install drive with one of my many disposable USB flash drives, and nuked my current partition (backing everything up first, of course).

Once I was finished the install process, I was greeted with the glorious and beautiful new flat UI of OS X Yosemite which is very iOS7-inspired. Instantly I knew I wasn't going back to 10.9, but when I started to install my dev tools and everything I need to work, my enthusiasm for bleeding-edge became a dull ache in the back of my eyes.

Needless to say, here is a comprehensive list of issues I ran into, and how I fixed them:

## First, XCode needs to be installed

The version of XCode in the Appstore only works with OS X 10.9 or lower, so you have to get the XCode 6 Beta from the Apple Developer site. Again, I retrieved it from unnamed sources, but the endgame is exactly the same. For me in OS X 10.9, I only needed to install the XCode CLT, however this is not the case in OS X 10.10. Install XCode 6 Beta, **then** install the XCode 6 Command Line Tools otherwise you’ll run into issues installing Homebrew in the next step.


## Installing Homebrew

Homebrew is amazing and I love it to death. It sure beats compiling all of my software from source. From my knowledge of installing Homebrew on everyother version of OS X I’ve used, I installed it via

```bash
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
brew doctor
brew update
```

Initially I had not installed XCode.app, only the Command Line Tools, so when I tried to install anything else this is where I ran into issues and had to reinstall Homebrew.


```bash
rm -rf /usr/local/Cellar /usr/local/.git
brew cleanup
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
brew doctor
brew prune
brew update
```

When I ran `brew doctor`, I had one less warning than the initial install which isn’t optimal but I needed to continue and solve the rest of the issues.

Now that I had reinstall Homebrew, it was complaining that it's `bin` and `sbin` folders were not accessible in the path and to ammend my path with `/usr/local/bin` and `/usr/local/sbin`. I modified the global `/etc/paths` file from

```
/usr/local/bin
/usr/bin
/bin
/usr/sbin
/sbin
```

to:

```
/usr/local/bin
/usr/local/sbin
/usr/bin
/bin
/usr/sbin
/sbin
```

just like I would in Mavericks, but this did not work. After some Googling, I found a solution on Github. It seems the issue is with iTerm2, my terminal replacement of choice.


> 1. Go to Profiles > Open Profiles…
> 2. Select your profile, Default if you only have one, then click the Edit Profiles… button
> 3. Change the Command radio button from Login shell to Command and paste in `/bin/bash -c /bin/zsh`.
> See screenshot: https://cloud.githubusercontent.com/assets/660139/3190490/3a52b170-eccf-11e3-8329-3ef6ec3f5f0f.png

Source: https://github.com/Homebrew/homebrew/issues/29843#issuecomment-45242894


### Installing Node with Homebrew


I mentioned another issue above in the first section that if you install the CLT first before XCode.app, you’ll run into issues. The issue in question is that Homebrew cannot compile Node in the next step without setting the proper XCode.app path first otherwise it does not compile Node.

Running

```bash
sudo xcode-select -switch /Applications/Xcode6-Beta.app
```

will solve this issue and allow you to continue.


### Installing MongoDB with Homebrew

After the fiasco with installing Node, I was almost ready to just give up but I decided to stick with it and figure out how to solve my issues. The next step was to get MongoDB installed which I’ve never had issues with, until now. When MongoDB was downloaded and started installing, it looked like it might just work on the first try but then I got this weird error saying

```
SCons Error: option --osx-version-min: invalid choice: '10.10' (choose from '10.6', '10.7', '10.8', '10.9’)
```

This indicated to me that the version of MongoDB in the Homebrew list hadn’t been updated for 10.10 yet, but after some Googling I found this fix

> It seems, the version of OS X is read from `/System/Library/CoreServices/SystemVersion.plist`, so if you sudo-edit the file and change:
>
> ```xml
> <key>ProductVersion</key>
> <string>10.10</string
> ```
>
> …to:
>
> ```xml
> <key>ProductVersion</key>
> <string>10.9</string
> ```
>
> And then do `brew install mongo`, it'll install.
>
> **REMEMBER** to change back ProductVersion to 10.10 straight away, otherwise most of the Apple-provided apps will cease to function (Including Terminal.app).

[Source](http://stackoverflow.com/questions/24052145/trouble-reinstalling-mongodb-with-homebrew-using-os-x-10-10-yosemite-beta)
