---
title: Creating your own minimalistic Rasbian image for the Raspberry Pi
date: 2012-12-10
---

I covered setting up the Raspberry Pi [before](https://brandonb.ca/raspberry-pi-setup), but I realized that without any extra functionality, the Raspberry Pi is kinda useless! So, I set out to set it up as a basic webserver with a webserver stack and some basic security. I started by reinventing the wheel originally but stumbled upon a blogger ~http://kmil.us/blog/2012/08/12/raspberry-pi-as-a-web-server/~ (dead link) who stumbled on a pre-made 84MB Raspbian image. This was fantastic news for me! You can create your own image with a more up to date Raspbian image and I wil show you how.

<!-- break -->

#### Setup Procedure

See my previous [post](https://brandonb.ca/raspberry-pi-setup) to see the process of installing the image on an SD card. Once the image has been applied to the SD card, connect the card to the Raspberry Pi and start configuring the keyboard and locale. Also, remember to use `sudo` when necessary.

I live in Canada on the west coast so I setup the keyboard as 105-key Generic Int'l, and my locale as en_US.UTF-8. Enable the SSH server and disable X from startup. Because I'm going to be using this as a base image for what I do with the Raspberry Pi, I set the timezone for my locale, but this is optional.

Once booted into the Raspberry Pi for the first time, we want to trim some of the fat. Remove the python games and some default installation packages

```bash
rm -rf python_games && sudo apt-get remove x11-common midori lxde python3 python3-minimal lxde-common lxde-icon-theme omxplayer raspi-config
```

There are some code samples installed in this image to do Python development, they can just be deleted

```bash
rm -rf /opt
```

This image is supposed to be a development platform, so there are quite a few development packages installed; this command removes them. We can also remove what's left of python and x11 while we're at it

```bash
apt-get remove `sudo dpkg --get-selections | grep "\-dev" | sed s/install//`
apt-get remove `sudo dpkg --get-selections | grep -v "deinstall" | grep python | sed s/install//`
apt-get remove `sudo dpkg --get-selections | grep -v "deinstall" | grep x11 | sed s/install//`
```

We're not going to be building any packages on the device so we can remove some parts of gcc

```bash
apt-get remove gcc-4.4-base:armhf gcc-4.5-base:armhf gcc-4.6-base:armhf
```

There are a few more packages that can be removed, and then because apt-get won't be used anymore for awhile the cache can be flushed

```bash
apt-get remove libraspberrypi-doc xkb-data fonts-freefont-ttf
apt-get autoremove && apt-get clean
```

Disable the swap file and write zeros to it

```bash
swapoff -a
cd /var
dd if=/dev/zero of=swap bs=1M count=100
```

Delete the logs

```bash
cd /var/log/
sudo rm `find . -type f`
```

Now check the size of the root partition. It should be fairly minimal since we've cut out alot of the unnecessary bulk.

That is how you create your own system image for your Raspberry Pi! Fairly simple and easy to accomplish, as well as adds a personal touch to your Raspberry Pi.
