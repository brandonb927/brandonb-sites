---
title: How to self-host (almost) everything in your life with unRAID — Part 1
date: 2024-03-15
pinned: true
draft: true
---

{% include ad/vpn.html %}

I recently decided that it was time to upgrade my aging [media server]({% post_url 2017/2017-08-10-ultimate-media-server-setup %}), and having been loosely involved in the homelab community since I built my original machine, I solicited some advice in this endeavor from a few friends in said community. They all pointed me at something I had been unfamiliar with until now: [unRAID](https://docs.unraid.net/unraid-os/manual/what-is-unraid/).

unRAID is an linux OS purpose-built for NAS-focused machines with RAID. It has a very large community behind it, application support by way of Docker images, a virtual machine manager, and development support is through a [paid license structure](https://unraid.net/pricing). It's very easy to get up and running with unRAID, booting off a USB stick only to load the OS and saves it's settings back to the flash drive, and it runs entirely in RAM when it is operating.

If you feel like a noob like I did learning about unRAID, don't worry: it's one of those pieces of software that has all the features I've always wanted but never had the skills to put together into a single package. It's [very easy](https://old.reddit.com/r/unRAID/comments/16o4bvs/unraid_guide_for_noobs_made_by_a_noob/) to setup and trial your own unRAID server, and if you don't like it then you can always try something else, but trust me when I say you'll like it.

<!-- break -->

I decided to build my own machine from scratch instead of repurposing some other hardware, that way I could make sure everything was well supported by unRAID and I wouldn't run into any issues in that regard. If you're attempting a NAS build, there are a few considerations to think about: what form factor of machine do you want to run on? Are you into purchasing pre-owned rack-mountable hardware with several HDD caddies ready to be filled? Or do you want to rebuild an existing ATX/mATX machine that still has some life in it? Because I wanted something new this meant diving into the [PCPartPicker builds page](https://ca.pcpartpicker.com/builds/) to see what everyone else is using for a NAS build. One of my constraints is that I needed this new machine to physically fit in the same footprint as my existing machine which is running in a Cooler Master Elite 110 case which lives on a rack shelf in my 12U network rack. This meant that I would be able to swap out machines with very little changes to the rack configuration.

Some context for my network rack: The first 3U rows of the rack are occupied by a Ubiquiti UDM-Pro, a Unifi 24-port PoE switch, and a patch panel. I then have a shelf that houses a [Reolink NVR](https://reolink.com/product/rlk8-800b4/) and Raspberry Pi 4 running AdGuard Home and some other unrelated bits of software for Amateur Radio things, and another shelf on the bottom 11U row where the existing machine lives. The last 12U row is a rackmount 8-port power strip to power everything in the rack connected to a {% amazon B0BCMLLSHL "CyberPower CP1500AVRLCD3" %} that lives on a shelf below the rack (because it weighs way too much for it's size).
{: .post-useful-content}

With that in mind, I wanted to continue the SFF (small form-factor) route with an mITX board and a CPU with an integrated video processor. This meant the power draw would be much lower than the existing machine that has an Intel i7-8700 and RTX 3070 graphics card. Plex, my media server software of choice, [runs fantastic](https://old.reddit.com/r/PleX/comments/11ih0gs/plex_hardware_transcoding_explained/) when transcoding on an Intel iGPU with QuickSync and is the recommended CPU combo for new builds rather than a power-hungry dedicated GPU and CPU.

This lead me into researching a NAS-focused SFF case; needless to say, there are not many good-looking cases out there that satisfy this requirement and I whole-heartedly believe this is a market worth disrupting. PC case manufacturers, if you're reading this, PLEASE make beautiful-to-look-at SFF cases that can hold 6-8 HDDs. I understand one of the issues is that there is a niche market for it which caps profit and revenue, and thermals of small spaces with hot components can be an issue, but the offerings right now are terrible.

That said, there is one exception: the {% amazon B0BQJ6BCB7 "Jonsbo N2" %}; Just look at this beautiful work of art:

[Jonsbo N2 stock image here]

There is also a larger sibling called the {% amazon B0CFBDSW1P "Jonsbo N3" %} which gives you more HDD rails and the ability to run a full-height PCIe card.

These cases fit the criteria of exactly what I want in a PC case: small, attractive design, seemingly easy to build in, and don't have a bunch of empty space due to poor design where the PSU fits. It wasn't until my N2 arrived that I was truly amazed at the quality of the case build. I've built a lot of PCs in my life, but this case was so well engineered that I'm now obsessed with it and will exclusively use Jonsbo for the foreseeable future.

[image of my Jonsbo case on the network rack shelf here with description "look how nice it looks, and you'd never believe it has 5 HDDs inside!"]

With the case in-hand, next up was picking a motherboard, dual SSDs (because the motherboard has 2x NVMe slots, using for the cache pool but more on that later), RAM, CPU & cooler. Honestly, the hardest part of all this was figuring out how much money I wanted to spend on HDDs because they were going to be half the cost of the whole build 🤣. I ended up with 3x Seagate IronWolf Pro 20TB HDDs that I luckily acquired on sale. This hurt my wallet a bit but I knew it would pay off when I setup the RAID and would inevitably have +40TB of usable space (I didn't mention I was also installing a 10TB HDD pulled from the previous machine).

Below is a cost breakdown of the parts going into this build if you're curious, totals include relative taxes:

| Part name                                                                     | Quantity | Cost (CAD) | Total (CAD) |
| ----------------------------------------------------------------------------- | -------- | ---------- | ----------- |
| {% amazon B0BQJ6BCB7 "Jonsbo N2 case" %}                                      | 1        | $209.00    | $234.08     |
| [Asrock Z790M-ITX WI-FI motherboard](https://www.newegg.ca/p/N82E16813162094) | 1        | $264.99    | $296.79     |
| {% amazon "Teamgroup T-Force Vulcan 2x16GB DDR5 5200MHz RAM" %}               | 1        | $116.99    | $131.03     |
| {% amazon B0BQ6CFDCX "Intel i5-13500 CPU" %}                                  | 1        | $329.00    | $368.48     |
| {% amazon B09HCHYMJM "Noctua NH-L9i-17xx CPU Cooler" %}                       | 1        | $79.95     | $89.54      |
| {% amazon B07TLYWMYW "Sabrent Rocket 1TB NVMe M.2 2280 SSD" %}                | 2        | $93.99     | $210.54     |
| {% amazon B0B94MF4LP "Seagate IronWolf Pro 20TB HDD" %}                       | 3        | $479.99    | $1,612.77   |
| {% amazon B01IA9H22Q "Seagate Compute 10TB HDD" %}                            | 1        | $0.00      | $0          |
| {% amazon B086J2RB9Y "3-pack of braided SATA cables" %}                       | 1        | $11.99     | $13.43      |
| {% amazon B0813X9G8T "Noctua NF-A12x15 chromax black fans, 120x15mm" %}       | 2        | $31.95     | $71.57      |
| {% amazon B07WFX3FZ5 "SilterStone 450W 80 Plus Bronze PSU (ST45SF-V3-USA)" %} | 1        | $112.65    | $126.17     |
|                                                                               |          |            |             |
| **TOTAL**                                                                     |          |            | $3,154.33   |

Fast-forward to everything being installed in the case and I've configured the BIOS to boot from the [USB drive with unRAID](https://docs.unraid.net/unraid-os/getting-started/quick-install-guide/) installed on it. Booting up unRAID for the first time is an odd experience, because you don't need to be connected to a monitor much like a headless server, and instead you configure everything through a web browser. Knowing the IP address of the running machine certainly makes things easier

I'm going to omit the configuration bits of unRAID because that is highly personal and you need to research what it is you want to get out of the OS before committing to a setup. Here is a [great writeup on migrating to unRAID](https://thehomelabber.com/blog/blags-homelab-part-2/) that I suggest reading. There is also a tonne of resources on the internet you should read on various features of unRAID to get yourself familiar with; one of those is the [Trash Guides](https://trash-guides.info/Hardlinks/How-to-setup-for/Unraid/) for how to setup unRAID. The [unRAID docs](https://docs.unraid.net/category/manual/) are a great resource and starting point as well. This is a big part of the server setup so spend most of your time getting this part right as later on down the line you might not be able to change it.

I opted to configure my Array with a single parity drive and have mirrored SSDs in my Cache Pool for speed. Once you've configured your Arrays and Cache Pools, it's time to get some plugins installed to make your life easier. I recommend installing the following:

- [Community Applications](https://forums.unraid.net/topic/38582-plug-in-community-applications/) — Install this first by navigating to the Apps page and starting the install. You'll be able to install most of the others in this list from the same page.
- [Appdata Backup](https://forums.unraid.net/topic/137710-plugin-appdatabackup/) - a utility that can backup your Docker container configurations and data, VM configurations and disks, and the unRAID configuration from the USB drive, among other things
- [Dynamix File Manager](https://forums.unraid.net/topic/120982-dynamix-file-manager/) - using the web UI is the best way to interact with the filesystem but there are a few things missing from it that this plugin adds
- [Fix Common Problems](https://forums.unraid.net/topic/47266-plugin-ca-fix-common-problems/) - scans your configuration to highlight common issues people run into
- [Unassigned Devices](https://forums.unraid.net/topic/92462-unassigned-devices-managing-disk-drives-and-remote-shares-outside-of-the-unraid-array/) - unRAID doesn't let you simply mount a drive by itself, it must be part of an array; this plugin let's you mount individual drives as a share or perform other operations on it

I also recommend a few other non-essential-but-useful plugins:

- [rclone](https://forums.unraid.net/topic/51633-plugin-rclone/) — for backing up certain data to various cloud providers
- [User Scripts](https://forums.unraid.net/topic/48286-plugin-ca-user-scripts/) — Run scripts on a schedule, like cronjobs

Now that you can install Apps, this is where the convenience, usefulness, and power of unRAID really shines. Here are my recommendations for apps you can install to self-host and replace some services you already use or pay for:

- [FreshRSS](https://github.com/FreshRSS/FreshRSS) — self-hosted RSS reader
- [Redlib](https://github.com/redlib-org/redlib) — self-hosted private Reddit frontend
- [Hammond](https://github.com/AlfHou/hammond) — track and manage your vehicular expenses
- [Scrutiny](https://github.com/AnalogJ/scrutiny) — a web UI for S.M.A.R.T. monitoring
- [Speedtest-tracker](https://github.com/henrywhitaker3/Speedtest-Tracker) — automated speedtest tracking tool
- [Homebridge](https://homebridge.io/) — run non-approved devices with Homekit, over 2K plugins
- [Homepage](https://gethomepage.dev/) — a homepage for all your services
- [Nginx proxy manager](https://github.com/NginxProxyManager/nginx-proxy-manager) — easily setup reverse proxy domains for your services
- [Plex](https://www.plex.tv/) — personal media manager
- [Tautulli](https://tautulli.com/) — monitor your Plex server
- [Sonarr](https://sonarr.tv/) — internet PVR
- [Radarr](https://radarr.video/) — movie collection manager
- [Prowlarr](https://prowlarr.com/) — index manager
- [Flaresolverr](https://github.com/FlareSolverr/FlareSolverr) — proxy server to bypass CloudFlare
- [Transmission](https://transmissionbt.com/)
- [GluetunVPN](https://github.com/qdm12/gluetun) — VPN container for docker
- [Nextcloud](https://nextcloud.com/) — your own personal cloud
  - [required for Nextcloud] [Postgresql](https://registry.hub.docker.com/_/postgres/) (or some other database, mariaDB is another good choice)
- ... and the list is growing every day when I realize there is something else I can self-host.

Setting up `nginx-proxy-manager` from the list above allows you to put all of these services behind a reverse proxy which makes them accessible by a domain name of your choosing. This can be designed to be accessible outside your home network if you want it to, or only resolve within your network, but that control is in your hands. The advantage of doing this is that you don't have to remember which service is mapped to which port when trying to access it in your browser; you can just enter the domain like you would a regular website! If you're familiar with setting up nginx already to do this, then do that, but this tool makes it very easy and it's done in the browser rather than dealing with config files.

If you choose to only resolve your your self-hosted services inside your network then you could stop here, but wouldn't it be great to access them on the go when you're not at home? This is where tools like [Wireguard VPN](https://www.wireguard.com/) or [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/) come in handy; these create a secure tunnel into your network with no port forwarding required.

I'm not familiar with Cloudflare Tunnel (yet) but I am with Wireguard VPN server on Unifi UDM-Pro. Running Wireguard on the UDM-Pro allows me to access anything inside my network without opening ports, and you can even set the DNS server address in your local Wireguard config to point to the private IP of your internal DNS server. If this instance is AdGuardHome then you need to make sure you have setup "DNS rewrites" pointing `*.domain.com` to the IP of the `nginx-proxy-manager` instance. Doing this allows you to connect to your VPN and you get the benefits of ads being blocked as well as access to your internal services as if they were external! This is commonly referred to as a "[split DNS tunnel](https://tailscale.com/learn/why-split-dns)". You can do something similar with PiHole by using the "Local DNS Records" feature.
