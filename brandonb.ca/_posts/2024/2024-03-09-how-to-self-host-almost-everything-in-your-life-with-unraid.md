---
title: How to self-host (almost) everything in your life with unRAID
date: 2024-03-09
date_modified: 2024-06-10
pinned: true
---

**[June 2024 Update]** I've been running this server for over 3 months. In that time I've explored adding more services to my self-hosted life, namely: running my own dockerized Discord bot, hosting my own Gitea instance for version control (accompanied by Gitea Actions for CI/CD) to reduce my reliance on GitHub, Mealie for recipe management, and Scrypted for NVR camera connection to Homekit with HKSV (HomeKit Secure Video). I've since removed Nextcloud entirely as it does not play well with Apple devices and the UI is very janky which is a shame for a project as mature as it is. I'm constantly evaluating third-party services that I can remove and bring in-house, and I'm sure more will be self-hosted as time marches forward. I will update this space every few months to catalog my changes until it gets to be it's own post.
{: .post-updated}

Maintenance is a word that can strike a chord in even the most seasoned administrators; it is also the bane of my existence. Sometimes we spend countless hours maintaining something for very little return.

In this post I talk about building a new machine to replace my aging [media server]({{ site.url }}{% post_url 2017/2017-08-10-ultimate-media-server-setup %}) and how you can take back some control over the data you constantly give out to services and products.

<!-- break -->

{% include ad/vpn.html %}

### Goodbye, Windows 10; Hello, unRAID

Since I built my original [media server]({{ site.url }}{% post_url 2017/2017-08-10-ultimate-media-server-setup %}) that was running Windows 10, I've been taking notes from the homelab community. Being a member of a Discord server started by some friends and former coworkers of mine centered around the topic of maintaining a homelab opened by mind to the possibility of running Linux fulltime instead of being complacent with Windows. I had toyed with the idea of this initially setting up my previous server but was not comfortable with running Docker in that way at the time. Thinking back to my university days I knew it was possible because we hosted linux servers all the time, my issue was that I just didn't have the level of confidence in troubleshooting when it goes pear-shaped. After soliciting some advice in this endeavor from a few of the folks in said Discord, they all pointed me at something I had heard of while reading their conversations but had been unfamiliar with until now: [unRAID](https://docs.unraid.net/unraid-os/manual/what-is-unraid/).

On paper, unRAID is one of those pieces of software that has all the features I've always wanted but never had the skills to put together into a single package. If you don't know, it's a linux operating system purpose-built for NAS-focused machines with RAID. It's popularity stems from its very large community of users, it has application support by way of Docker containers, a virtual machine manager, and developmental support for it through a [paid license structure](https://unraid.net/pricing). It's [very easy](https://old.reddit.com/r/unRAID/comments/16o4bvs/unraid_guide_for_noobs_made_by_a_noob/) to setup as it boots off a USB stick and runs entirely in RAM when it is operating. It even saves its own settings back to the flash drive so that in the event you need to remove the drive, all is not lost (however the drives in the array shouldn't be read by an OS without your unRAID config loaded as you may risk data loss).

### Considerations

When I made the decision to start replacing my server, I decided to build my own machine from scratch instead of repurposing some other hardware, that way I could make sure everything was well supported by the OS and I wouldn't run into any issues in that regard. If you're attempting a NAS build, there are a few considerations to think about: what form factor of machine do you want to run on? Are you into purchasing pre-owned rack-mountable hardware with several HDD caddies ready to be filled? Or do you want to rebuild an existing ATX/mATX machine that still has some life in it? Because I wanted something new, this meant diving into the [PCPartPicker builds page](https://ca.pcpartpicker.com/builds/) to see what everyone else is using for a NAS build and start getting an idea of what mine would look like. I wanted to make sure this new machine would physically fit in the same footprint as my existing machine which is running in a Cooler Master Elite 110 case that lives on a rack shelf in my 12U network rack. With this constraint in place, I would be able to swap them out with very little changes to the rack configuration.

Some context for my network rack: The first 3U rows of the rack are occupied by a Ubiquiti UDM-Pro, a Unifi 24-port PoE switch, and a patch panel. I then have a shelf that houses a [Reolink NVR](https://reolink.com/product/rlk8-800b4/) and Raspberry Pi 4 running AdGuard Home and some other unrelated bits of software for Amateur Radio things, and another shelf on the bottom 11U row where the existing machine lives. The last 12U row is a rackmount 8-port power strip to power everything in the rack connected to a {% amazon B0BCMLLSHL "CyberPower CP1500AVRLCD3" %} that lives on a shelf below the rack (because it weighs way too much for it's size).
{: .post-useful-content}

### Server Components

#### Dedicated vs Integrated GPU

A server's power consumption is a big deal when it runs 24/7, so I wanted to make sure that I picked a CPU for this build with an integrated video processor instead of a power-hungry dedicated GPU. The existing machine has an Intel i7-8700 and RTX 3070 graphics card combo which worked well for gaming when I wanted, but idle power draw was very high comparatively. Another reason to pick an iGPU is because Plex transcoding performance on an Intel iGPU with QuickSync is [very good](https://old.reddit.com/r/PleX/comments/11ih0gs/plex_hardware_transcoding_explained/) and is now the recommended setup for most situations.

### A Diamond In The Rough

Researching for a NAS-focused SFF case is a tedious task: first off, almost every case meant to be used for an mITX build that exists with more than two HDD bays is ugly as sin; you cannot change my mind about this.

Needless to say, there are not many good-looking cases out there that satisfy this requirement and I whole-heartedly believe this is a market worth disrupting. PC case manufacturers, if you're reading this, PLEASE make beautiful-to-look-at SFF cases that can hold 6-8 HDDs. I understand one of the issues is that there is a niche market for it which caps profit and revenue, and thermals of small spaces with hot components can be an issue, but the offerings right now are terrible.

That said, there is one exception: the {% amazon B0BQJ6BCB7 "Jonsbo N2" %}; just look at how small this thing is:

![Jonsbo N2 case on jonsbo.com](https://www.jonsbo.com/Upfiles/Prod_X/2022111742171.jpg)

If the N2 is a tad too small for you, it has a larger sibling called the {% amazon B0CFBDSW1P "N3" %} which gives you more HDD rails and the ability to run a full-height PCIe card.

These cases fit the criteria of exactly what I want in a PC case: small, attractive design, seemingly easy to build in, and don't have a bunch of empty space due to poor design where the PSU fits. It wasn't until my N2 arrived that I was truly amazed at the quality of the case build. I've built a lot of PCs in my life, but this case was so well engineered that I'm now obsessed with it and will exclusively use Jonsbo for the foreseeable future.

### Storage

With the case sorted, next up was picking a motherboard, SSDs (the motherboard I picked has 2x NVMe slots so they will be used for the cache pool, but more on that later), RAM, CPU & cooler. Honestly, the hardest part of all this was figuring out how much money I wanted to spend on HDDs because they were going to be half the cost of the whole build 🤣. I ended up with 3x Seagate IronWolf Pro 20TB HDDs that I luckily acquired on sale. This hurt my wallet a bit but I knew it would pay off when I setup the RAID and would inevitably have +40TB of usable space (I didn't mention I was also installing a 10TB HDD pulled from the previous machine).

### Cost Breakdown

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
| **TOTAL (CAD)**                                                               |          |            | $3,154.33   |

---

### unRAID Setup

Once all the components arrived, I quickly began the process of building and bench-testing them. For about a week every night I ran some type of test utility to get a sense of whether or not all this was going to work. Once I was satisfied, I began the unRAID setup process with the BIOS configured to boot from USB with the [OS drive](https://docs.unraid.net/unraid-os/getting-started/quick-install-guide/) plugged in. Booting up unRAID for the first time is an odd experience, because you don't need to be connected to a monitor much like a headless server, and instead you configure everything through a web browser. Knowing the IP address of the running machine certainly makes things easier

I'm going to omit most of the configuration bits of unRAID because that is highly personal and you need to research what it is you want to get out of the OS before committing to a setup. I'm also not as experienced as some so I shouldn't be giving advice on this 😂. What I can suggest reading however is a [great writeup on migrating to unRAID](https://thehomelabber.com/blog/blags-homelab-part-2/). There is also a tonne of resources on the internet that focus on various features of unRAID and you should get yourself familiar with them; one of those is the [Trash Guides](https://trash-guides.info/Hardlinks/How-to-setup-for/Unraid/) for how to setup an unRAID `/data` share correctly and optimally.

The [unRAID docs](https://docs.unraid.net/category/manual/) are also a great resource and I highly recommend them as a starting point as well to learn about the terminology used throughout the system. This is a big part of the server setup so spend most of your time getting this right as later on down the line you might not be able to change or modify it.

I will divulge that in my setup I opted to configure my array with a single parity drive and have mirrored NVMe SSDs in my Cache Pool for speed. The same friend that wrote the unRAID migration guide above suggests that you run at least a single parity drive, if not two, so that your data is never unprotected in the event of drive failure. With that in mind, you'll want to pick the largest HDD possible that you can purchase because the parity drive **must be that largest drive in the array**; this is not something you can compromise on.

### Plugins

Now that you've setup your storage, it's time to dive into the world of unRAID plugins and applications to make your life easier. I recommend installing the following:

- [Community Applications](https://forums.unraid.net/topic/38582-plug-in-community-applications/) — Install this first by navigating to the Apps page and starting the install. You'll be able to install most of the others in this list from the same page.
- [Appdata Backup](https://forums.unraid.net/topic/137710-plugin-appdatabackup/) - a utility that can backup your Docker container configurations and data, VM configurations and disks, and the unRAID configuration from the USB drive, among other things
- [Dynamix File Manager](https://forums.unraid.net/topic/120982-dynamix-file-manager/) - using the web UI is the best way to interact with the filesystem but there are a few things missing from it that this plugin adds
- [Fix Common Problems](https://forums.unraid.net/topic/47266-plugin-ca-fix-common-problems/) - scans your configuration to highlight common issues people run into
- [Unassigned Devices](https://forums.unraid.net/topic/92462-unassigned-devices-managing-disk-drives-and-remote-shares-outside-of-the-unraid-array/) - unRAID doesn't let you simply mount a drive by itself, it must be part of an array; this plugin let's you mount individual drives as a share or perform other operations on it

I also recommend a few other non-essential-but-useful plugins:

- [rclone](https://forums.unraid.net/topic/51633-plugin-rclone/) — for backing up certain data to various cloud providers
- [User Scripts](https://forums.unraid.net/topic/48286-plugin-ca-user-scripts/) — Run scripts on a schedule, like cronjobs

## Apps To Self-host

Now that you can install community-support apps, this is where the convenience, usefulness, and power of unRAID really shines. This is also what unlocks the "self-host" part of the server; any docker image you can think of, you can likely run it on your server with ease.

Here are my recommendations for apps you can install to self-host and replace some services you already use or pay for:

- [FreshRSS](https://github.com/FreshRSS/FreshRSS) — RSS reader
- [Redlib](https://github.com/redlib-org/redlib) — private Reddit frontend
- [Hammond](https://github.com/AlfHou/hammond) — track and manage your vehicular expenses
- [Scrutiny](https://github.com/AnalogJ/scrutiny) — web UI for S.M.A.R.T. monitoring
- [Speedtest-tracker](https://github.com/henrywhitaker3/Speedtest-Tracker) — automated speedtest tracking tool
- [Uptime Kuma](https://github.com/louislam/uptime-kuma) — service and website monitoring
- [Homebridge](https://homebridge.io/) — run non-approved devices with Homekit, over 2K plugins
- [Homepage](https://gethomepage.dev/) — homepage for all your services
- [Nginx proxy manager](https://github.com/NginxProxyManager/nginx-proxy-manager) — easily setup reverse proxy domains for your services
- [Plex](https://www.plex.tv/) — personal media manager
- [Tautulli](https://tautulli.com/) — monitor your Plex server
- [Sonarr](https://sonarr.tv/) — internet PVR
- [Radarr](https://radarr.video/) — movie collection manager
- [Prowlarr](https://prowlarr.com/) — index manager
- [Flaresolverr](https://github.com/FlareSolverr/FlareSolverr) — proxy server to bypass CloudFlare
- [Transmission](https://transmissionbt.com/)
- [GluetunVPN](https://github.com/qdm12/gluetun) — VPN container for other docker containers to use
- [Nextcloud](https://nextcloud.com/) — your own personal cloud
  - [required for Nextcloud] [Postgresql](https://registry.hub.docker.com/_/postgres/) (or some other database, mariaDB is another good choice)
- ... and the list grows every day!

### Easy Service Access

Setting up `nginx-proxy-manager` from the list above allows you to put all of these services behind a reverse proxy which makes them accessible by a domain name of your choosing. This can be designed to be accessible outside your home network if you want to, or only resolve within your network; that control is in your hands. The advantage of doing this is that you don't have to remember which service maps to which port when trying to access it in your browser; you can just enter the domain like you would a regular website! If you're familiar with setting up nginx already to do this, then do that, but this tool makes it very easy and it's done in the browser rather than dealing with config files.

If you choose to only resolve your your self-hosted services inside your network then you could stop here, but wouldn't it be great to access them on the go when you're not at home? This is where tools like [Wireguard VPN](https://www.wireguard.com/) or [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/) come in handy; these create a secure tunnel into your network with no port forwarding required.

I'm not familiar with Cloudflare Tunnel (yet) but I am with Wireguard VPN server on Unifi UDM-Pro. Running Wireguard on the UDM-Pro allows me to access anything inside my network without opening ports, and you can even set the DNS server address in your local Wireguard config to point to the private IP of your internal DNS server. If this instance is AdGuardHome then you need to make sure you have setup "DNS rewrites" pointing `*.domain.com` to the IP of the `nginx-proxy-manager` instance. Doing this allows you to connect to your VPN and you get the benefits of ads being blocked as well as access to your internal services as if they were external! This is commonly referred to as a "[split DNS tunnel](https://tailscale.com/learn/why-split-dns)". You can do something similar with PiHole by using the "Local DNS Records" feature.

### Tradeoffs

I now have the freedom of being able to self-host my life where I see fit and having the ability to run docker containers on a whim and proxy them to a subdomain for easier access makes my it so much better. I've started finding ways to reduce my online footprint and bring some SaaS products I pay for in-house with open source alternatives. There are tradeoffs doing this, namely support and feature development doesn't move as quickly as for-profit products and services.

There are a few instances where I still need to pay for a tool that has `x` feature, and it will compliment my self-hosted alternative instead of replacing it. One of these tools that cannot be replace something I already pay for, however, is Nextcloud. When I initially set it up and copied a bunch of data over to it, I tried to use the iOS apps and learned a valuable lesson: some open-source software has a design/UX problem. I ran into some deal-breaking issues setting up Calendars and Contacts (mostly because Apple deviates from the vCard spec quite a bit), and the web interface for Nextcloud is a bit kludgy. I will remain using [Sync.com]({{ site.url }}{% link r/sync_com.md %}) as my cloud data provider of choice which is fine because it is E2E-encrypted and Canadian-hosted, so I feel relatively safe with my data stored on their servers instead of mine but your mileage may vary.

### Conclusion

One of the motivations for this project was the overhead of maintenance required to keep a "legacy" setup running. Maintaining my previous machine was always a pain and I had actually forgotten how some applications were setup over the years because I didn't keep my own documentation up to date (I should practice what I preach!). In contrast, unRAID documentation is always up-to-date and the community is so active that you will likely not encounter an issue that someone else hasn't had and reported in the [forums](https://forums.unraid.net/).

Having run this server for over a month at the time of writing, I can say with a high-degree of certainty that I wished I had done this migration sooner. In retrospect, my previous setup was _truly a disaster waiting to happen_; I had very few backups to speak of except for copies of some of the more important config files for the running services (and who knows when those were last updated... actually, I looked at "last modified" dates of some of them in retrospect and they were out by at least two years 🥲), and no backups of my data drives existed because I was ignorant and lazy. In contrast, working with unRAID has been an absolute pleasure after you get over the knowledge and terminology hurdle, and I would gladly pay for another license when I build my next machine.

Some closing words: to the folks that build and work on the OS and features, I thank you for making software that works so well and is fairly user-friendly. I've learned a tonne working on this project and I look forward to a future build with unRAID OS ❤️.
