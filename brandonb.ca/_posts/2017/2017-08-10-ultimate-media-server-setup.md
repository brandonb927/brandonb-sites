---
title: The Ultimate Automated Media Setup for Movies & TV Shows
date: 2017-08-10
date_modified: 2024-03-04
---

**[March 2024 Update]** Thanks to everyone who's signed up to ExpressVPN with [my referral link]({% link r/vpn.md %}), I've received over 85 months of free service which indicates to me that you folks love this content! 👏😊
{: .post-updated}

<!-- break -->

**[2019 UPDATE]** I've recently rebuilt my aging "server", upgrading it from a marginally-OK gaming machine without virtualization built in 2012 to a fairly beefy [dedicated server build](https://ca.pcpartpicker.com/user/brandonb927/saved/#view=NyWMZL). Since I wrote this guide, I've moved through a few slightly different setups and settled on one that I really enjoy: a single "server" running Windows 10 Pro, and on it runs several Virtualbox VMs in [headless mode](https://www.virtualbox.org/manual/ch07.html) for the various services required. The previous iteration of my setup saw two separate physical machines with one running as the "seedbox", and the other running everything else. This was primarily because the seedbox machine needed to be running on a dedicated VPN, while the Plex machine needed access to the internet unfettered (for Remote Access to work properly without workarounds). The upgrade in hardware allowed me to consolidate a tonne of physical and digital space to a single machine that can do the heavy lifting of multiple machines.
{: .post-updated}

{% responsive_image path:_assets/media/posts/2017-08-ultimate-media-server-setup-new-server.jpg alt:"2019 Plexbox" %}

---

This post is **strictly and entirely** an educational experiment and I am in no way condoning the use, nor advocacy, of software to acquire copyrighted media content. If you use this information for such a purpose, you have been warned 🕴.
{: .post-disclaimer}

Back in 2011 I heard about this thing called "Plex". It seemed like a cool way to present your media library, but at the time I felt like it was overkill compared to my homegrown collection of techniques I'd gained over the years for wrangling and managing my library of ripped CDs and DVDs.

Fast-forward to 2017 and my media library has grown quite a bit. I keep hearing about this Plex thing repeatedly, and after a few Google searches I realized there is a hidden world of people that have this whole media management thing down to a science. After spending some late nights doing research, sifting through Github repositories and forums, I feel that I have devised the perfect automated media management setup for me.

While deciding on solutions for each of the problems I was having with my current workflow, I kept asking myself questions like "how can I...":

- easily stream content from my storage device to my TV?
- automate the gathering of content to put onto my storage device?

Below is a list of applications and some background on them that comprise the setup of the perfect automated media server. If you ever feel confused about anything, all of the applications mentioned here have great communities, and are very receptive to new people joining them, asking questions, and getting help. It goes without saying but also make sure to search the forums first before posting on them!

A note before continuing: I am writing this with Windows 10 in mind, but most of the apps have other ways you can install them on various OSs, your mileage may vary ✌️. I also don't take into consideration using a NAS (more on that at the end).

You might find this post useful as well! <br />**[How to use a DSLR or mirrorless camera as a webcam]({% post_url 2020/2020-02-26-use-a-dslr-mirrorless-camera-as-a-webcam %})**
{: .post-useful-content}

### [Plex Media Server](https://www.plex.tv/)

Let's start with Plex: it's the one piece of this setup that brings it all together and adds tremendous value. It manages and allows you to stream your content on your local network, across the internet, and to almost every device you own (excluding your toaster, but maybe your [Samsung fridge](https://www.samsung.com/au/support/home-appliances/family-hub-apps/)). Here's a quote from the Plex site explaining how it works:

> **Plex is like mission control for your personal media collections.**
> With our easy-to-install Plex Media Server software and your Plex apps, available on all your favorite phones, tablets, streaming devices, gaming consoles, and smart TVs, you can stream your video, music, and photo collections any time, anywhere, to any device.

What this means is that you can install Plex Media Server on your main content storage device (most likely a server or PC of some kind running on your network) and can stream it to any Plex viewer app available (on iOS, Android, [RasPlex](https://www.rasplex.com/), etc.)

#### Setup

Setting up Plex is fairly straight-forward thanks to the effort that has gone into the installer setup and the configuration walk-through on first-run. HowToGeek has a great [how-to guide](https://www.howtogeek.com/252261/how-to-set-up-plex-and-watch-your-movies-on-any-device/) on setting it up and running.

All of the configuration is available to you via a web browser at `http://localhost:32400` once you have it installed and running. You can alternatively use the Plex viewer app for your platform to perform the server configuration and maintenance as well. It's also a good idea to backup your content if you can before having Plex scan the media folders.

#### Considerations

Plex requires that your media to be in a specific format for it to parse movie and episode names from the filenames and folders in which they reside. As it turned out, the flat folder structure I had grown to love wouldn't cut it anymore so I used a mass file renaming utility called [Filebot](https://www.filebot.net) (which I strongly encourage) to rename everything to the necessary format. You can also use Filebot after the fact to do one-off download renaming.

With Filebot, you can configure the different expression formats for your media types by clicking the "Match" button then "Edit Format" in the menu. I configured the renaming scheme to be:

```text
# TV format
{n}\{'Season '+s}\{n} - {sxe} - {t}

# The above format will turn input
#   D:\tvshows\Firefly\S01E01 - Serenity
# into output
#   D:\tvshows\Firefly\Season 1\Firefly - 1x01 - Serenity

# Movie format
{ny}/{ny}

# The above format will turn input
#   D:\movies\Avatar.mp4
# into output
#   D:\movies\Avatar (2009)\Avatar (2009).mp4
```

**Note:** you don't have to use the exact formatting I have outlined above, it simply looks visually appealing while using a file explorer and has the added benefit of being Plex-readable. Filebot has a very robust [expression formatting document](https://www.filebot.net/naming.html) that I suggest you read, plus a very active forum where the app maintainer is always answering questions.

Once you set the format, it's as simple as dragging your whole media folder into Filebot corresponding to the content you want to rename, clicking Match then either TheMovieDB or TheTVDB, then Rename. Once it does it's thing, you should have all of your filenames rewritten to be respective to the identified content and ready for adding to Plex.

---

One trick I've learned since writing this guide is that you aren't limited to relative path renaming, meaning that you can have Filebot handle moving data around between drives like so:

```shell
# TV format
B:\shows\{n}\{'Season '+s}\{n} - {sxe} - {t}

# Movie format
A:\movies\{ny}\{ny}
```

Example: Your `downloads` folder sits on your `D:` drive, and you have your TV Shows and Movies on `B:` and `A:` respectively. You can set your Filebot formats up like the above code snippet, and when you drag-and-drop your media, match, then rename, Filebot will move the media onto the correct drive for you. This makes renaming as simple as drag-and-drop!

##### Plex Remote Access considerations

If you plan on watching your media library anywhere besides in your own home on your own network, you'll want to enable [Remote Access](https://support.plex.tv/articles/200289506-remote-access/). It is the feature that allows you to stream your content over the internet from your server. Allowing content access across the internet **may** involve some [port forwarding](https://support.plex.tv/articles/200931138-troubleshooting-remote-access/) on your router however. Your milage may vary, but when using the default port I did not have to modify anything in my router.

**Note:** Automatic port configuration only works if you have UPnP enabled on your router which, in [light of recent events](https://hackaday.com/2019/01/14/upnp-vulnerability-as-a-feature-that-just-wont-die/), should be disabled now.

An issue I ran into was with the usage of Plex over a VPN. As it turns out, you cannot use Plex ([easily](https://www.comparitech.com/plex/plex-vpn-routing/)) while the physical server is connected to a VPN. There is an obvious reason once you [understand how VPNs work](https://www.wired.com/2017/03/want-use-vpn-protect-privacy-start/), but is a bit confusing while in the process of learning how to glue all these applications together. A proposed solution that I've come across is to run your torrent client inside a virtual machine with VirtualBox or VMWare Fusion/Workstation. This allows you segregate the virtual machine's network traffic to the VPN, while freeing up Plex to run it's services natively, serving up content to the internet free of network restrictions.

### [Sonarr](https://sonarr.tv/)

Sonarr is used for tracking and automatically gathering data from indexers for TV shows. From their Github page:

> Sonarr is a PVR for Usenet and BitTorrent users. It can monitor multiple RSS feeds for new episodes of your favorite shows and will grab, sort and rename them. It can also be configured to automatically upgrade the quality of files already downloaded when a better quality format becomes available.

Download Sonarr from the [site here](https://sonarr.tv/#download). Once installed, all of the configuration happens via a web browser at `http://localhost:8989`. A combination of the Sonarr [wiki pages](https://github.com/Sonarr/Sonarr/wiki) and [this article](https://www.cuttingcords.com/home/ultimate-server/setting-up-sonarr) over at Cutting Cords got me started on sensible settings when configuring it.

### [Radarr](http://radarr.video/)

Radarr, originally a fork of Sonarr, is used for tracking and automatically gathering torrents for movies available from MovieDB. From their Github:

> Radarr is an independent fork of Sonarr reworked for automatically downloading movies via Usenet and BitTorrent.
> The project was inspired by other Usenet/BitTorrent movie downloaders such as CouchPotato.

Radarr, much like Sonarr, is very simple to setup and requires minor configuration once installed. The configuration for Radarr is also available via a web browser at `http://localhost:7878`. The wiki for the project has [great documentation](https://github.com/Radarr/Radarr/wiki/Installation) that should be able to get you going.

### [Jackett](https://github.com/Jackett/Jackett)

Allows the use of indexers and trackers not available as built-ins to either Radarr or Sonarr. From their Github:

> Jackett works as a proxy server: it translates queries from apps (Sonarr, Radarr, SickRage, CouchPotato, Mylar, etc) into tracker-site-specific http queries, parses the html response, then sends results back to the requesting software. This allows for getting recent uploads (like RSS) and performing searches. Jackett is a single repository of maintained indexer scraping & translation logic - removing the burden from other apps.

#### Jackett Setup

Jackett is by-far the easiest of the listed apps to setup. Simply download the latest release, install it, and configure which indexers you want to add via a web browser at `http://localhost:9117/Admin/Dashboard`. Like the other projects above, Jackett has some [wiki pages](https://github.com/Jackett/Jackett/wiki) that show how to setup the service, plus there is a [fantastic guide](https://www.htpcguides.com/add-custom-torrent-trackers-in-sonarr-using-jackett-guide/) over on HTPCGuides on how to setup your first indexer with Sonarr (also applies to Radarr).

### [Transmission](https://transmissionbt.com/)

Transmission is a very small torrent client that `Just Works™` out of the box and plays well with Radarr and Sonarr. It requires very little configuration to run, uses an incredibly low amount of memory, is less CPU-intensive than most other clients, and is native across many platforms. It also has a tonne of features including: "encryption, a web interface, peer exchange, magnet links, DHT, µTP, UPnP and NAT-PMP port forwarding, webseed support, watch directories, tracker editing, global and per-torrent speed limits, and more."

#### Transmission Setup

Download and install the latest executable from the site. In order to use Transmission with Sonarr and Radarr, the only configuration preference you need to change in the settings is toggling the Web UI option and setting a username and password for it. This allows Sonarr and Radarr to remotely add torrents to Transmission. You should also enable "Start added torrents" which will automatically download torrents when added.

### A trusted VPN provider

This could almost be a requirement for daily web browsing if you care about your privacy, as you can't be too safe on the internet these days.

I chose to use [Express VPN]({% link r/vpn.md %}) after **thoroughly** reading the TorrentFreak [2017 review of anonymous VPN providers](https://torrentfreak.com/vpn-services-anonymous-review-2017-170304/) article. [If you sign up with my referral link]({% link r/vpn.md %}), we **BOTH** get 1 month of free service 😁 !

**[2019 UPDATE]** I would not advise the use of the following technique based on my personal experience implementing and using it for a reasonable period of time. Even though I found a way to [add a network kill-switch]({% post_url /2018/2018-01-12-how-to-setup-a-windows-10-application-network-killswitch %}), it is still pretty brittle and prone to issues in practice (hanging on dial, no redial on connection loss, etc).
{: .post-updated}

Once you sign up, get your account details from the subscriptions page to manually create new VPN configuration in Windows 10. To do so:

- Go to your [subscriptions page](https://www.expressvpn.com/subscriptions)
- Click the green "Set up ExpressVPN" button, which will open a new tab
- Click "Manual Config" on the left, then on the right choose "PPTP & L2TP-IPSec"
- Make note of your unique username and password on the right, as well as the server name by selecting it from the sections below user/pass

Microsoft has some [great documentation](https://support.microsoft.com/en-us/help/20510/windows-10-connect-to-vpn) on how to connect to a VPN given your credentials.

You can also automate connecting to your VPN on system startup as well. First, you'll want to create a new batch script somewhere on your computer called `expressvpn_connect.bat` and load it with:

```batch
C:\Windows\system32\rasdial.exe "profile name" "username" "password"
```

where `profile name` is the name of the VPN profile you created earlier. At this point you should be able to run the batch file and Windows will connect to your configured VPN provider. Taking this one step further, you can schedule the script to run whenever you login using Task Scheduler. Over at The Windows Club they have a [nice how-to guide](http://www.thewindowsclub.com/how-to-schedule-batch-file-run-automatically-windows-7) on how to accomplish this.

#### Caveats

There is a slight downside to all of this VPN configuration as well: when you enable Remote Access in Plex while you're connected to your VPN, you will be unable to connect to Plex through any device outside your network. This becomes plainly obvious when you understand how VPNs work, but is a bit of a pain when you want to keep everything secure.

Another issue is that sometimes your VPN provider might close it's connection with you for one reason or another. You'll want to either know when this happens so you can reconnect, or you can instruct Windows to redial the VPN when it loses a connection. This can be accomplished by [following the steps outlined here](https://rushtips.com/windows-10-vpn-reconnect-automatically). For whatever reason it might not be available the gist is:

- Open Windows Task Scheduler and create a New Task
- Create a new `Trigger` in the task and set it to "Begin the task: On an event". Change the "Log" field to "Application", the "Source" to be "RasClient", and the "Event ID" to be "20226" (this is the event ID used to identify a [RAS Connection Termination](<https://technet.microsoft.com/en-us/library/cc773767(v=ws.10).aspx>))
- Add a new `Action` that is set to "Start a program", then enter the path to the VPN auto connection script referenced earlier, in the "Program/script" input.
- Click OK, then enter your account password if Windows prompts you so it can setup the task correctly

---

**[2019 UPDATE]** I would advise, at this point, you go one of two ways to set up a dedicated seedbox for running Transmission over a VPN:

1. Run a headless VM with Transmission installed on the machine that will be running everything
1. Run a separate physical machine on your own network (or purchase a hosted seedbox somewhere) that only runs Transmission with a dedicated VPN connection

Either of these solutions work but each come with their own level of complexity. I have used both and I favour the solution of running the headless VM on the machine that runs everything.

### Future considerations

Now that you've got this all setup you can stop here and bask in the glory of a fully automated media setup, but one might worry about various other aspects to this setup like:

#### I'm running out of storage/I think my HDD might die and I'll lose all of my content

This is where a network-attached storage device comes in to save the day.

From Wikipedia:

> Network-attached storage (NAS) is a file-level computer data storage server connected to a computer network providing data access to a heterogeneous group of clients. NAS is specialized for serving files either by its hardware, software, or configuration. It is often manufactured as a computer appliance – a purpose-built specialized computer. NAS systems are networked appliances which contain one or more storage drives, often arranged into logical, redundant storage containers or RAID.

[Plex-capable NAS devices](https://support.plex.tv/hc/en-us/articles/201373823-NAS-Devices-and-Limitations) have come down in price considerably over the last 5 years, and it's even [cheap enough to build your own](https://blog.brianmoses.net/2017/03/diy-nas-2017-edition.html) (which I strongly encourage!). What a NAS provides you over a single HDD for storing your content is the peace of mind that you won't lose some, most, or even all, of your content in the event your content storage HDD decides to call it quits.

If a NAS device is not something you want/can afford, then a large-sized external HDD will even get you most of the way to there.

#### How to protect your content from prying eyes

Encrypting the storage volume where your content is stored is really the only answer to this. Generally I would advise against using something proprietary to the OS, so choose a cross-platform solution like [VeraCrypt](https://www.veracrypt.fr/en/Home.html). You'll also want to decide whether or not you want full-disk encryption or just file-level/application layer encryption as this will make your decision for cross-platform interoperability much more difficult.
