---
title: How to self-host (almost) everything in your life with unRAID — Part 1
date: 2024-03-15
pinned: true
draft: true
---

{% include ad/vpn.html %}

I decided recently that it was time to upgrade my aging [media server]({% post_url 2017/2017-08-10-ultimate-media-server-setup %}), and having been loosely involved in the homelab community since I built my original machine, I solicited some advice in this endeavor from a few friends. They all pointed me at something I had been unfamiliar with until now: [unRAID](https://docs.unraid.net/unraid-os/manual/what-is-unraid/).

unRAID is an OS purpose-built for NAS-focused machines with RAID. It has a very large community behind it, application support by way of Docker images, and development support is through a [paid license structure](https://unraid.net/pricing). It's very easy to get up and running with unRAID, and it runs entirely in RAM when it is operating, booting off a USB stick only to load the OS and saves it's settings back to the flash drive.

<!-- break -->

If you feel like a noob like I did learning about unRAID, don't worry: it's one of those pieces of software that has all the features I've always wanted but never had the skills to put together in one package. It's [very easy](https://old.reddit.com/r/unRAID/comments/16o4bvs/unraid_guide_for_noobs_made_by_a_noob/) to setup and trial your own unRAID server.

If you're attempting a NAS build, there are a few considerations to think about: what form factor of machine do you want to run on? Are you into purchasing pre-owned rack-mountable hardware with several HDD caddies ready to be filled? Or do you want to rebuild an existing ATX/mATX machine that has reached it's EOL? I wanted something new which meant diving into the [PCPartPicker builds page](https://ca.pcpartpicker.com/builds/) to see what everyone else is doing for a NAS build. One of my constraints is that I needed this new machine to physically fit in the same footprint as my existing machine. This meant that I would be able to swap out machines with very little changes to my 12U network rack configuration.

The first 3U rows of the rack are occupied by a Ubiquiti UDM-Pro, a Unifi 24-port PoE switch, and a patch panel. I then have a shelf that houses a [Reolink NVR](https://reolink.com/product/rlk8-800b4/) and Raspberry Pi 4 running AdGuard Home and some other unrelated bits of software for Amateur Radio things, and a shelf on the bottom 11U row that has the existing media server machine on it. The last 12U row is a rackmount 8-port power strip to power everything, connected to a {% amazon B0BCMLLSHL "CyberPower CP1500AVRLCD3" %}.
{: .post-useful-content}

With that in mind, I wanted to continue the SFF (small form-factor) route with an mITX board and a CPU with an integrated video processor. This meant the power draw would be much lower than the existing machine that has an Intel i7-8700 and RTX 3070 graphics card. Plex, my media server software of choice, [runs fantastic](https://old.reddit.com/r/PleX/comments/11ih0gs/plex_hardware_transcoding_explained/) when transcoding on an Intel iGPU with QuickSync and is recommended for new builds rather than a power-hungry dedicated GPU.

This lead me into researching a NAS-focused SFF case; needless to say, there are not many good-looking cases out there that satisfy this requirement and I whole-heartedly believe this is a market worth disrupting. PC case manufacturers, if you're reading this, PLEASE make beautiful-to-look-at SFF cases that can hold 6-8 HDDs. I understand one of the issues is the niche market for it and thermals would be an issue, but the offerings right now are terrible. That is, except for one: the {% amazon B0BQJ6BCB7 "Jonsbo N2" %} and {% amazon B0CFBDSW1P "N3" %}.

[Jonsbo N2 image here]

These cases, at first glance, fit the criteria of exactly what I wanted in a PC case: small, attractive design, seemingly easy to build in, and didn't have a bunch of empty space due to poor design where the {% amazon B07WFX3FZ5 "PSU" %} fits. It wasn't until my N2 case arrived that I was truly amazed at the quality. I've built a lot of PCs in my life, but this case was so well engineered that I'm now obsessed with it. I love looking at it on it's little shelf. Okay, enough gloating, back to what you're here for.

Once I settled on a motherboard ([Asrock Z790M-ITX WI-FI](https://www.newegg.ca/p/N82E16813162094)), RAM ({% amazon "Teamgroup T-Force Vulcan 2x16GB DDR5 5200MHz modules" %}), CPU ({% amazon B0BQ6CFDCX "Intel i5-13500" %}), CPU cooler ({% amazon B09HCHYMJM "Noctua NH-L9i-17xx" %}), and dual {% amazon B07TLYWMYW "Sabrent Rocket 1TB NVMe M.2 2280 SSDs" %}, I just needed to figure out how much money I wanted to spend on HDDs because they were going to be half the cost of the whole build 🤣. I ended up with three {% amazon B0B94MF4LP "Seagate IronWolf Pro 20TB drives" %} that I luckily acquired on sale. This hurt my wallet a bit, but I knew it would pay off when I setup the RAID and I had +40TB of usable space (I didn't mention I was also installing a 10TB HDD I had picked up earlier last year that would be pulled from the previous machine).

Fast-forward: everything is installed in the case and I've configured the BIOS to boot from the [USB drive with unRAID](https://docs.unraid.net/unraid-os/getting-started/quick-install-guide/) installed on it. Booting up unRAID for the first time is an odd experience, because you don't need to be connected to a monitor much like a headless server, and instead configure everything through a web browser.

I'm going to omit the configuration bits of unRAID because that is highly personal and you need to research what it is you want to get out of the OS before committing to a setup. My friend and coworker Blag has a [great writeup on his migration to unRAID](https://thehomelabber.com/blog/blags-homelab-part-2/) that I suggest reading. There is also a tonne of resources on the internet you should read on various features of unRAID to get yourself familiar with; one of those is the [Trash Guides](https://trash-guides.info/Hardlinks/How-to-setup-for/Unraid/) for how to setup unRAID. This is a big part of the server setup so spend most of your time getting this part right and later on down the line you might not be able to change it.

Once you've configured your Arrays and Cache Pools, it's time to get some plugins installed to make your life easier. I recommend installing the following:

- [Community Applications](https://forums.unraid.net/topic/38582-plug-in-community-applications/) — Install this first by navigating to the Apps page and starting the install. You'll be able to install most of the others in this list from the same page.
- [Appdata Backup](https://forums.unraid.net/topic/137710-plugin-appdatabackup/)
- [Dynamix File Manager](https://forums.unraid.net/topic/120982-dynamix-file-manager/)
- [Fix Common Problems](https://forums.unraid.net/topic/47266-plugin-ca-fix-common-problems/)
- [Unassigned Devices](https://forums.unraid.net/topic/92462-unassigned-devices-managing-disk-drives-and-remote-shares-outside-of-the-unraid-array/)

I also recommend a few other non-essential-but-useful plugins:

- [rclone](https://forums.unraid.net/topic/51633-plugin-rclone/)
- [User Scripts](https://forums.unraid.net/topic/48286-plugin-ca-user-scripts/)

Now that you can install Apps, this is where the convenience, usefulness, and power of unRAID really shines. Here are my recommendations for apps you can install to self-host and replace some services you already use or pay for:

- [FreshRSS](https://github.com/FreshRSS/FreshRSS) — self-hosted RSS reader
- [Redlib](https://github.com/redlib-org/redlib)
- [Hammond](https://github.com/AlfHou/hammond)
- [Scrutiny](https://github.com/AnalogJ/scrutiny)
- [Speedtest-tracker](https://github.com/henrywhitaker3/Speedtest-Tracker)
- [Homebridge](https://homebridge.io/)
- [Homepage](https://gethomepage.dev/)
- [Nginx proxy manager](https://github.com/NginxProxyManager/nginx-proxy-manager)
- [Plex](https://www.plex.tv/)
- [Tautulli](https://github.com/linuxserver/docker-tautulli)
- [Sonarr](https://github.com/linuxserver/docker-sonarr)
- [Radarr](https://github.com/linuxserver/docker-radarr)
- [Prowlarr](https://github.com/linuxserver/docker-prowlarr)
- [Flaresolverr](https://github.com/FlareSolverr/FlareSolverr)
- [Transmission](https://github.com/linuxserver/docker-transmission)
- [GluetunVPN](https://github.com/qdm12/gluetun)
- [Nextcloud](https://github.com/linuxserver/docker-nextcloud)
- [Postgresql](https://registry.hub.docker.com/_/postgres/)
- ... and the list is growing every day when I realize there is something else I can self-host.

Setting up Nginx proxy manager form the list above allows you to put all of these services behind a reverse proxy accessible by a domain of your choosing. This can be accessible outside your home network if you want it to, or only be resolvable inside your network. The advantage of doing this means you don't have to remember which port maps to which service when trying to access it in your browser, you can just enter the domain or path on the domain (if the services supports proxy path access).

It's great to be able to resolve your self-hosted services inside your network, but wouldn't it be great to access them on the go when you're not at home? This is where tools like [Wireguard VPN](https://www.wireguard.com/) or [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/) come in handy; these creates a secure tunnel into your network with no port forwarding required.

With Wireguard, you can set the DNS server on your local machine when connected to the VPN to that of the private IP of the DNS server running in your network.

to server
 on the UDM-Pro allowing me to tunnel into my network without requiring ports to be forwarded, and using Adguard I am able to rewrite DNS calls to said domain to allow them to resolve to local IPs instead of going out to the internet to resolve. This means when connected to my Wireguard VPN outside my home network, so long as my network DNS is set to point to Adguard Home,
