---
title: How to install Airport Utility 5.6.1 on OS X Mountain Lion 10.8
date: 2012-12-29
---

{% responsive_image path:_assets/media/posts/2012-12-samsung-hw-e450.jpg alt:"Samsung-HW-E450 Soundbar" %}

<!-- break -->

I've always wanted a cinematic experience when listening to music, watching movies and playing some videogames in my living room. However, my tiny apartment doesn't allow me to have a full-fledged 5.1 surround sound system, so I've had to resort to suffering the tinny sounding, horrible TV speakers on my Toshiba LED TV. This year I decided to spoil myself on Boxing Day (December 26th, much like Black Friday in the USA, [but far less violent](http://articles.latimes.com/2012/nov/23/nation/la-na-nn-black-friday-walmart-shooting-20121123)),
so over the holidays I picked up a very nice Samsung soundbar for my TV at a severely reduced price. Specifically, I purchased the
[Samsung HW-E450](https://discussions.apple.com/thread/4172563?start=0&tstart=0).
I love it so far and it sounds absolutely fantastic compared to what I've been using prior. I have also used the Bluetooth functionality on it with my iPhone and it works great, albeit alittle quieter than I'd hoped but I'm sure that I'm not using it correctly. I also wanted to use my MacBook and stream music to it but unfortunately the bluetooth is far too choppy it to be usable as far away as it is from my desk. This reminded me that I had an AirPort Express Base Station somewhere
in my closet.

{% responsive_image path:_assets/media/posts/2012-12-airport-express-base-station.jpg alt:"Apple AirPort Express Base Station" %}

I had bought a used Apple AirPort Express Base Station (802.11g) sometime last year with great intentions of using it but never did. I found it and decided to set it up to use for music streaming to my new soundbar. Those of you with one of these units who have OS X Lion 10.7 and Mountain Lion 10.8 will know that one does not simply plug it in and configure it with AirPort Utility 6 which comes standard with these OS versions. It turns out that the older Base Stations are not compatible with the newer AirPort Utility which is extremely frustrating. So with that being said, a user must turn to the internet for a solution because Apple would simply not let this happen, would they?

[Turns out they would](http://www.macworld.com/article/1167965/mountain_lion_and_the_ancient_airport_base_station.html).

On OS X Lion 10.7, it is as easy as downloading the AirPort Utility 5.6.1 package from Apple's support downloads and installing said package.
Easier said than done on 10.8: When you go to install the utility, Mountain Lion screams at you that you cannot install this application. GREAT!
Thanks again Apple for supporting the user. Now at this point the technology illiterate people cry, get angry, or simply say "f\*\*k it" and bring the unit back to the store they purchased it from, or stash it away in a closet and have buyers remorse. However for the 1% tech-savvy people out there, we say "there must be another way to install this piece of crap…". Well you're in luck! There are two solutions to the problem: you can venture through some [simple Terminal commands](https://discussions.apple.com/thread/4172563?start=0&tstart=0), or follow some instructions ~http://frank.is/mountain-lion-and-the-old-airport-utility/~ (dead link) by a dude named Frank to download an Automator Workflow and have your Mac do the work for you. I chose the former because I found it first but the choice it is ultimately up to you on how you want to go about installing the utility.
