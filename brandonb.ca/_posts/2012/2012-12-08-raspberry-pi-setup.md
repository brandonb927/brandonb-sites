---
title: Raspberry Pi Setup
date: 2012-12-08
---

I ordered a [RaspberryPi](http://www.raspberrypi.org/) last week and it arrived yesterday. Let hacking begin!

<!-- break -->

If you don't know, a Raspberry Pi is a \$25 credit-card sized ARM-based GNU/Linux computer that sports an HDMI port, a 10/100 Ethernet port, a 3.5MM audio jack, a component video port, two USB ports and an SD Card slot for SD/SDHC cards. There is no onboard storage so the only way to run the Pi with an OS is to cluster is, or install an SD card into it with a preloaded OS like [Raspbian](http://www.raspberrypi.org/downloads).

I love my Raspberry Pi and cannot believe I haven't ordered one sooner. I was fortunate enought to order mine just after the switchover from the Model A to the Model B versions. The difference between the two is the internal memory was changed from 256mb to 512mb. This is huge for hackers and users and the foundation was able to keep the cost the same, which is a big plus. The only downsides I've come across so far are the fact that I can't run x86 programs ([Dropbox cli](https://www.dropbox.com/install?os=lnx)) and that running and external HDD/SSD off the USB ports is challenging. The ARM/x86 issue is by architectural design of the SoC so I can't complain about that, but the power to USB ports is a bit of an issue with me. I have a spare 64GB Kingston SSD I'd like to use on this RPi because it is silent and the SSD is just collecting dust.

## Setup Procedure

1. Download Raspbian Wheezy image - [mirror](https://downloads.raspberrypi.org/raspbian/images/2012-10-28-wheezy-raspbian/2012-10-28-wheezy-raspbian.zip) or [torrent](https://downloads.raspberrypi.org/raspbian/images/2012-10-28-wheezy-raspbian/2012-10-28-wheezy-raspbian.zip.torrent)

2. While image is downloading (~238mb), setup RPi (HDMI, power, ethernet, keyboard)

3. Prepare SD Card - Disk Utility > Format the respective disk with MS-DOS (FAT32)

4. Install to SD card

- Unzip the image `unzip 2012-10-28-wheezy-raspbian.zip`
- CD to image folder `2012-10-28-wheezy-raspbian`
- Identify the SD Card `df -h`Card
- Unmount SD card `sudo diskutil unmount /dev/disk1s1`
- Install image to SD card `sudo dd bs=1m if=2012-10-28-wheezy-raspbian.img of=/dev/rdisk1` or whichever the SD card is
- This process completes, without errors, after a few minutes. If there are errors after it completes, start over.

5. After install, pop SD card into SD Card slot in the Pi and plug in the power adapter

6. [Follow this guide](http://www.engadget.com/2012/09/04/raspberry-pi-getting-started-guide-how-to/#title3) (I'm too lazy to redo it) and enter your respective locale settings when prompted

7. Update and upgrade the packages already installed on Raspbian. This will take care of 3 things: updating the apt-cache, upgrading the packages, then rebooting once that is all done

   ```bash
   sudo apt-get update && sudo apt-get upgrade && sudo apt-get reboot
   ```

8. Once updated, grab Hexxeh's [update tool](https://github.com/Hexxeh/rpi-update) for the RPi from Github. The second command is optional, you should install if you get errors about certificates. Basic instructions are:

   ```bash
   sudo wget http://goo.gl/1BOfJ -O /usr/bin/rpi-update && sudo chmod +x /usr/bin/rpi-update
   sudo apt-get install git-core binutils ca-certificates
   sudo rpi-update
   ```

You now have an awesome, cheap, functioning computer at your fingers for hacking! You can stop here and go do your own thing, or you can continue and customize your RPi to suit your needs

---

## Customizations

- If you plan on using your RPi as a headless webserver, you should change the gpu_mem option in `/boot/config.txt`

  - Add/edit the line `gpu_mem=16`
  - Reboot

- If you are annoyed like I am of the constant SSH disconnections, set the timeout for an hour

  - Open `/etc/sshd_config`
  - Add/Edit the line `ClientAliveInterval 60`

- Install `ddclient` and setup with your dynamic IP host so that you can host your RPi from wherever you are

  - `sudo apt-get install ddclient`
  - Once installed setup window opens and asks what service you use. In my case www.dyn.com
  - Enter your Dyn.com user, then password
  - Either select your hosts from the list, or input manually (list is easiest, manual if you are working offline)
  - `ddclient` will continue to install and complete, provided no errors occurred.
  - Check Dyn.com My Services page to see if IP has updated

- [Broken Pipe error message with SSH](http://www.matbra.com/en/2012/10/26/raspberry-pi-com-raspbian-derrubando-conexao-ssh/)
- [Bash script that adds a Raspberry Pi logo to your login](https://gist.github.com/4241852)
- [Turn your RPi into a webserver](http://www.jeremymorgan.com/tutorials/raspberry-pi/how-to-raspberry-pi-web-server/)
- [Setup Dynamic IP](http://www.debianadmin.com/ddclient-update-ip-addresses-at-dynamic-dns-service.html)
- [Change GPU split for headless SSH/webserver](http://raspberrypi.stackexchange.com/questions/673/what-is-the-optimum-split-of-main-versus-gpu-memory)
- [Set SSH timeout to an hour](http://ocaoimh.ie/2008/12/10/how-to-fix-ssh-timeout-problems/)
- [Add apt-add-repository for Debian](http://blog.anantshri.info/howto-add-ppa-in-debian/)
- Locale issue ~http://hexample.com/2012/02/05/fixing-locale-problem-debian/~ Dead link
