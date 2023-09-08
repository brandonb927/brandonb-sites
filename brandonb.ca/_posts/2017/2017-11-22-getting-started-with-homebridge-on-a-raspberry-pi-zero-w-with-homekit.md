---
title: Getting started with Homebridge on a Raspberry Pi Zero W
date: 2017-11-22
date_modified: 2020-06-29
---

**[June 2020 UPDATE]** It has come to my attention that there is now a [pre-built version of Raspbian including Homebridge and Node.js](https://github.com/homebridge/homebridge-raspbian-image) baked specifically for Raspberry Pi models, available since March 2020! I recommend going this route over following the tutorial below, however if you choose to take this in yourself then continue reading.
{: .post-updated}

<!-- break -->

## Updated content for 2020

With the recent release of the official Homebridge Raspbian image and [associated wiki](https://github.com/homebridge/homebridge-raspbian-image/wiki) pages, it is now easier than ever to get started with Homebridge on a Raspberry Pi completed with a configurable UI that lets you install Homebridge plugins right from a web browser. I recently went through the process of rebuilding my Homebridge setup on my Raspberry Pi 3 B+ and it went so smooth I couldn't believe it! I can vouch that that is now the _easiest possible way_ to get Homebridge onto a RaspBerry Pi.

The basic procedure is like this:

- Download the [latest Homebridge Raspbian image](https://github.com/homebridge/homebridge-raspbian-image/releases/latest) from the Releases page on GitHub
- Write the aforementioned image to your micro SD card (the easiest possible method is using [Etcher](https://www.balena.io/etcher/))
- Pop the micro SD card into your Raspberry Pi and power it on
- Wait a few minutes, then [follow the steps for the WiFi setup](https://github.com/homebridge/homebridge-raspbian-image#wifi-setup)
- Go to `http://raspberrypi.local` in your browser (on macOS, slightly [different on Windows](https://github.com/homebridge/homebridge-raspbian-image/wiki/Getting-Started#step-4-manage-homebridge))
- Voilà! You have a fully functioning Homebridge machine on a RaspberryPi, preconfigured with the latest version of Node.js and a beautiful UI!

Now you can install Homebridge plugins from the UI, or drop into your terminal and install extras like [PiHole](https://pi-hole.net) (strongly recommend!)

## Original post below

This post is a continuation of my original post guiding you through [setting up a headless Raspberry Pi Zero W on macOS]({% post_url /2017/2017-05-11-raspberry-pi-zero-w-headless-setup-on-macos %}). Immediately after I wrote that post, not much happened with my rPi and it sat unplugged for a few months while I mulled over a project to put it to use for. Over the coming months however I have been increasingly interested in home automation exclusively with HomeKit. I got to wondering, "I should be able to control all the connected devices in my home using just the Home app running iOS 11 on my iPhone 7 Plus and not these other inferior apps!".

While doing research for home automation, I stumbled on [homebridge](https://github.com/nfarina/homebridge) and it dawned on me that to use my rPi just for it. After getting everything installed and setup a few times (wiping the SD card between installs and retrying), I came to realize how surprisingly easy it is to setup! In this post I'm going to show you how to get your own rPi running homebridge, and even recommend some plugins to use to make it useful.

---

To start, I began taking inventory of all the things in my house I could add to homebridge to use with HomeKit. I had initially planned on only integrating my 2016 Samsung Smart TV and Playstation 4 in some fashion, but once I got everything installed and running I purchased a few TP-Link HS100 smart wifi plugs. The wifi plugs were on sale at my local BestBuy for \$20/ea which is 50% off the normal price 😱 I couldn't say no, plus I'd had my eye on them already since research into homebridge plugins yielded them to have very good support with the system regardless of not being supported at all by HomeKit.

### Install node and homebridge

Start by installing node with npm [from here](https://github.com/sdesalas/node-pi-zero#v890) (don't install from `apt-get` because the package in the PPA is incredibly out of date). An alternative to npm would be to use [yarn](https://yarnpkg.com/en/), but that route remains untested to my knowledge.

Once node is installed, go ahead and install [homebridge](https://github.com/nfarina/homebridge). Installing it is as simple as installing a global npm package!

```shell
npm install -g homebridge
```

## Running homebridge

You can experiment with running homebridge from the cli once installed by just calling the executable. It'll look for config in `/home/<user>/.homebridge` so feel free to add a basic config file there for testing.

The ideal way to use homebridge, however, is running it as a service in the background [with systemd and a `homebridge` user](https://gist.github.com/johannrichard/0ad0de1feb6adb9eb61a/). This allows homebridge to auto-run on startup and doesn't require a shell being open on your computer. One caveat I found with this setup, though easily solvable, is that the path to the homebridge executable is unknown to the required `homebridge` system user you have to create while seting it up. Its not documented anywhere, but can be fixed by adding the node `bin` path to the user. You can do this by creating a new file in `/etc/profile.d` and making it executable

```shell
sudo touch /etc/profile.d/node.sh
sudo chmod +x /etc/profile.d/node.sh
```

where the contents are

```shell
export PATH=$PATH:/opt/nodejs/bin
```

What this does is add `/opt/nodejs/bin` to the `PATH` environment variable of every user profile. This means the system user `homebridge` can now run the homebridge exectuable normally without a full path to its location. The alternative is to specify the full path of the executable when calling it.

### Configuring homebridge

At this point, reboot the pi for the system user to pick up the path to the homebridge executable and start it up. You won't have any configuration setup for homebridge to use (unless you jumped ahead to here 😉) and it will complain about this. You can see the live stream of logs for the homebridge service with

```shell
sudo journalctl -u homebridge -f
```

Create the file `/var/lib/homebridge/config.json` and fill it with the the following starter configuration

```json
{
  "bridge": {
    "name": "Homebridge",
    "username": "1A:2B:3C:4D:5E:6F",
    "port": 45525,
    "pin": "937-19-468"
  },
  "description": "SmartHome with Homebridge",
  "accessories": [...],
  "platforms": [...]
}
```

#### Notes

- Use [this tool](https://www.miniwebtool.com/mac-address-generator/) to generate a random `username` value in the configuration
- Replace `...` with the plugins that you desire once you confirm homebridge can run on it's own

After you've made all your changes, ensure that the `homebridge` user has ownership of the `/var/lib/homebridge` folder with

```shell
sudo chown -R homebridge /var/lib/homebridge
```

**NOTE** This step is _very crucial_ because if the homebridge executable can't write it's various caches to the folder, things might blow up on you!

### Extending homebridge

Homebridge by itself isn't very useful you'll find, and where it really shines is its [community-backed plugin system](https://www.npmjs.com/search?q=homebridge-plugin&page=1&ranking=popularity). Just doing a search on npmjs.com for `homebridge-plugin` yields a few hundred plugins to choose from. Sort by popularity and the first few pages are full of good plugins.

Here's a list of the ones I'm using/recommending:

- <https://www.npmjs.com/package/homebridge-tplink-smarthome> (Support for TP-link switches, bulbs, and plugs)
- <https://www.npmjs.com/package/homebridge-samsung-tizen>
- <https://www.npmjs.com/package/homebridge-cmdswitch2>
  - 👆 In combination with <https://github.com/dhleong/ps4-waker>

### Using homebridge with the iOS 11 Home app

The moment you've probably been waiting for: setting Homebridge and "accessories" (connected devices) up in iOS Home is very straight forward. The in-app documentation is very easy to follow, and if you're running the homebridge cli tool from a terminal (not the service-based system user), you can just scan the QR code that is generated when you run `homebridge` with the Home app. The alternate Home setup method is that you'll have to enter the `pin` you configured in the `config.json` file intead.

Below is a video of the end product and how well it works with the iOS 11 Home app. The video starts out showing how the different devices are triggered in the app (and how some devices have to be interfaced with, particularly my smart TV and PS4 there is some latency which I can go into in detail later) followed by show how to interface with devices through Home Scenes using Siri.

{% video src:2017-11-homebridge-ios-home-demo.mp4 height:320 %}
